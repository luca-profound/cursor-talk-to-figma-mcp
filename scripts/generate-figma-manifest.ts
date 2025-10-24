#!/usr/bin/env bun

import ts from 'typescript';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

interface ParameterInfo {
  name: string;
  type: string;
  optional: boolean;
  rest: boolean;
}

interface ManifestEntry {
  id: string;
  scope: 'figma' | 'node';
  path: string;
  interface: string;
  member: string;
  kind: 'method';
  overloadIndex: number;
  parameters: ParameterInfo[];
  returns: string;
  async: boolean;
  deprecated: boolean;
  docs?: string;
}

const repoRoot = process.cwd();
const typingsPath = path.join(
  repoRoot,
  'figma-plugin-api-docs',
  'plugin-typings',
  'package',
  'plugin-api.d.ts'
);

const outputDir = path.join(repoRoot, 'generated');
const srcGeneratedDir = path.join(repoRoot, 'src', 'generated');

function typeToDoc(type: ts.Type, checker: ts.TypeChecker): string {
  return checker.typeToString(type);
}

function safeTypeToString(type: ts.Type, checker: ts.TypeChecker): string {
  try {
    return checker.typeToString(
      type,
      undefined,
      ts.TypeFormatFlags.NoTruncation |
        ts.TypeFormatFlags.UseFullyQualifiedType |
        ts.TypeFormatFlags.WriteArrowStyleSignature |
        ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope
    );
  } catch (error) {
    return 'unknown';
  }
}

function getDocFromSymbol(symbol: ts.Symbol | undefined, checker: ts.TypeChecker): string | undefined {
  if (!symbol) return undefined;
  try {
    const docs = ts.displayPartsToString(symbol.getDocumentationComment(checker));
    return docs.trim().length > 0 ? docs.trim() : undefined;
  } catch (error) {
    return undefined;
  }
}

function shouldTreatAsNodeInterface(name: string): boolean {
  if (name === 'PluginAPI') return false;
  if (name === 'PluginUIAPI') return false;
  if (name === 'ViewportAPI') return false;
  if (name === 'PluginVariablesAPI') return false;
  if (name === 'PluginSettings') return false;
  if (name === 'ClientStorageAPI') return false;
  if (name === 'NotificationHandler') return false;
  if (name === 'DevResources') return false;
  if (name.endsWith('Mixin')) return true;
  if (name.endsWith('Node')) return true;
  return false;
}

type ScopeKind = 'figma' | 'node';

interface ScopeInfo {
  path: string;
  kind: ScopeKind;
  depth: number;
}

(async () => {
  const program = ts.createProgram([typingsPath], {
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
  });

  const checker = program.getTypeChecker();

  const interfaceDeclarations = new Map<string, ts.InterfaceDeclaration>();
  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) continue;
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isInterfaceDeclaration(node) && node.name) {
        interfaceDeclarations.set(node.name.text, node);
      }
    });
  }

  const visited = new Set<string>();
  const entries: ManifestEntry[] = [];

  function addEntry(entry: ManifestEntry) {
    entries.push(entry);
  }

  function processInterface(interfaceName: string, scope: ScopeInfo) {
    const key = `${interfaceName}|${scope.path}`;
    if (visited.has(key)) return;
    visited.add(key);

    const decl = interfaceDeclarations.get(interfaceName);
    if (!decl) return;

    for (const member of decl.members) {
      if (ts.isMethodSignature(member)) {
        const methodName = member.name.getText();
        const symbol = checker.getSymbolAtLocation(member.name);
        if (!symbol) continue;

        const type = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration ?? member);
        const signatures = type.getCallSignatures();
        if (!signatures.length) continue;

        signatures.forEach((signature, index) => {
          const params: ParameterInfo[] = signature.getParameters().map((parameter) => {
            const decl = parameter.valueDeclaration as ts.ParameterDeclaration | undefined;
            const paramType = checker.getTypeOfSymbolAtLocation(parameter, decl ?? member);
            return {
              name: parameter.getName(),
              type: safeTypeToString(paramType, checker),
              optional: Boolean(decl?.questionToken),
              rest: Boolean(decl?.dotDotDotToken),
            };
          });

          const returnType = safeTypeToString(signature.getReturnType(), checker);
          const docs = getDocFromSymbol(symbol, checker) ?? getDocFromSymbol(signature.getDeclaration()?.symbol, checker);
          const deprecated = signature.getJsDocTags().some((tag) => tag.name === 'deprecated');
          const async = returnType.startsWith('Promise<') || returnType === 'Promise<void>' || returnType === 'Promise<any>';

          addEntry({
            id: `${scope.path}.${methodName}${signatures.length > 1 ? `#${index}` : ''}`,
            scope: scope.kind,
            path: scope.path,
            interface: interfaceName,
            member: methodName,
            kind: 'method',
            overloadIndex: index,
            parameters: params,
            returns: returnType,
            async,
            deprecated,
            docs,
          });
        });
      } else if (ts.isPropertySignature(member)) {
        if (scope.kind === 'node') continue;
        if (scope.depth >= 3) continue;
        const propName = member.name.getText();
        if (!member.type) continue;
        const propType = checker.getTypeAtLocation(member.type);
        const propSymbol = propType.aliasSymbol ?? propType.symbol;
        if (!propSymbol) continue;
        const nestedName = propSymbol.getName();
        if (!interfaceDeclarations.has(nestedName)) continue;

        const nextPath = `${scope.path}.${propName}`;
        const nextKind: ScopeKind = shouldTreatAsNodeInterface(nestedName) ? 'node' : scope.kind;
        processInterface(nestedName, { path: nextPath, kind: nextKind, depth: scope.depth + 1 });
      }
    }
  }

  processInterface('PluginAPI', { path: 'figma', kind: 'figma', depth: 0 });

  for (const interfaceName of interfaceDeclarations.keys()) {
    if (!shouldTreatAsNodeInterface(interfaceName)) continue;
    processInterface(interfaceName, { path: 'node', kind: 'node', depth: 0 });
  }

  entries.sort((a, b) => a.id.localeCompare(b.id));

  await mkdir(outputDir, { recursive: true });
  await mkdir(srcGeneratedDir, { recursive: true });

  await writeFile(
    path.join(outputDir, 'figma-manifest.json'),
    JSON.stringify(entries, null, 2),
    'utf8'
  );

  const manifestTs = `// Auto-generated by generate-figma-manifest.ts
export type ManifestScope = 'figma' | 'node';

export interface ManifestParameterInfo {
  name: string;
  type: string;
  optional: boolean;
  rest: boolean;
}

export interface ManifestEntry {
  id: string;
  scope: ManifestScope;
  path: string;
  interface: string;
  member: string;
  kind: 'method';
  overloadIndex: number;
  parameters: ManifestParameterInfo[];
  returns: string;
  async: boolean;
  deprecated: boolean;
  docs?: string;
}

export const figmaManifest: readonly ManifestEntry[] = ${JSON.stringify(entries, null, 2)};

export const manifestIndex = new Map<string, ManifestEntry[]>(
  figmaManifest.reduce<[string, ManifestEntry[]][]>((acc, entry) => {
    const key = entry.path + '.' + entry.member;
    const existing = acc.find(([k]) => k === key);
    if (existing) {
      existing[1].push(entry);
    } else {
      acc.push([key, [entry]]);
    }
    return acc;
  }, [])
);

export function findManifestEntry(path: string, method: string): ManifestEntry[] | undefined {
  return manifestIndex.get(path + '.' + method);
}
`;

  await writeFile(path.join(srcGeneratedDir, 'figma-manifest.ts'), manifestTs, 'utf8');

  console.log(`Generated ${entries.length} manifest entries`);
})();
