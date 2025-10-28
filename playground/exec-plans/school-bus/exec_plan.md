# ExecPlan: School Bus Illustration (Figma)
Created: 2025-10-24
Status: Complete
Last Updated: 2025-10-24

## Objective
Construct a clean, vector-based “School Bus” illustration in Figma that closely matches the provided reference image at `playground/exec-plans/school-bus/reference-school-bus.webp`. Use reusable components (wheel, window, door) and consistent styles so the bus can be resized or restyled quickly.

## Visual Analysis Summary
- Yellow rectangular bus body with rounded corners, black mid-body stripe containing “SCHOOL BUS”.
- Five upper windows, one small rear service panel, and a two-panel front door with a vertical mullion.
- Curved front “nose” and a slanted windshield, front bumper and rear bumper, both dark grey.
- Two wheels with hubcaps and concentric rim rings.
- Marker lights: front amber headlight area, small red rear light; small side marker near rear wheel.
- Subtle highlights on windows and body, thin outline strokes, and minor shadow undercarriage.

## Reusable Components
1. Wheel Component
   - Concentric ellipses: tire (dark), rim (mid-grey), hub (light grey), optional small lug circle.
   - 1 instance for front, 1 for rear; front slightly smaller is optional to match perspective.
2. Window Component
   - 110×70 rounded-rect with blue-tinted fill (#D7EEF9 → #A9D7F6 gradient optional), inner white sheen diagonal as separate vector or gradient stop.
   - Instance used 5× across top row; consistent spacing.
3. Door Panel Component
   - 2 stacked rectangular panels (upper has glass like window component; lower opaque with yellow fill), vertical black mullion between panels, thin black frame.

## Color & Style Tokens (local styles)
- Paints
  - Bus Yellow: #F9C311 (r:0.976 g:0.764 b:0.067)
  - Deep Yellow Shadow: #E0AE0A
  - Black: #111111
  - Dark Grey (Bumpers/Tires): #2C2C2C
  - Rim Grey: #B9B9B9
  - Hub Grey: #E4E4E4
  - Window Blue 1: #D7EEF9
  - Window Blue 2: #A9D7F6
  - Highlight White: #FFFFFF
- Effects
  - Drop Shadow: 0,2 blur:6, color rgba(0,0,0,0.15) for bus body.
  - Inner Shadow on windows: 0,1 blur:2, rgba(0,0,0,0.15).
  - Subtle underside shadow line under bus: 0,4 blur:8, rgba(0,0,0,0.20).

## Geometry & Layout Targets
- Canvas Frame: 1200×600, centered artboard, white background.
- Bus Body Group (approx): origin (x:150, y:220)
  - Main Body: 900×230, corner radius 24.
  - Front Nose: Boolean union of 900×230 rect + 140×140 circle offset to create curved front (~x:950, y:270). Alternatively: overlay 140×140 ellipse to soften the front edge without boolean.
  - Black Stripe: 820×52 rectangle, y offset ~95 within body; “SCHOOL BUS” centered in white.
  - Small Rear Panel: 85×65 rounded-rect near top-left (service panel).
  - Door Column: 80×230 at front-right of body; within it, two 80×100 panels with 12px spacing.
  - Windows Row: five 110×70 instances spaced 22px apart, top margin ~20 from body top.
- Wheels (instances of Wheel component)
  - Rear Wheel center ~ (x:320, y:465), front wheel center ~ (x:920, y:465).
  - Tire outer: 110×110, rim: 76×76, hub: 36×36.
- Bumpers & Lights
  - Front Bumper: 120×42 dark grey rounded rect at nose lower edge.
  - Rear Bumper: 40×30 dark grey rounded rect near tail lower edge.
  - Front Light: 28×28 amber circle; Rear Light: 20×20 red circle; Side Marker: 18×12 red rect near rear wheel.
- Windshield: 120×130 rounded rect with slanted right edge (use vector or subtract a triangle); same window gradient, stronger highlight.

## Layer & Naming Structure
- Frame: School Bus
  - Bus (group)
    - Body (boolean union or rect + ellipse)
    - Stripe (group)
      - Stripe Rect
      - Label: SCHOOL BUS
    - RearPanel
    - Door (component instance)
    - Windows (auto layout frame)
      - Window Instance ×5
    - Wheel Rear (component instance)
    - Wheel Front (component instance)
    - Bumpers (group)
    - Lights (group)
    - Windshield
    - Undershadow

## Build Order
1. Create frame and local paint/effect styles; set grid off.
2. Draw main body (rect), add front curve (ellipse union or overlay), apply stroke and shadow.
3. Add black mid stripe; center “SCHOOL BUS” text in bold white.
4. Create Window component; place five instances using auto layout for consistent spacing.
5. Create Door component; place at front column; ensure mullion between upper/lower panel.
6. Create Wheel component; place rear and front instances; align to body baseline.
7. Add bumpers, lights, and small marker.
8. Add windshield with slanted edge; apply stronger highlight.
9. Add undershadow and micro details (panel lines, small step line).
10. Group, name layers, tidy and align; check against reference.

## MCP Invocation Examples (for the Figma bridge)
Important:
- Property assignments are applied to the invocation target before the method call. For creators like `figma.createRectangle`, the target is `figma`, so assignments won’t land on the new node. Always use a two-step pattern: (1) create the node, capture its `id`; (2) call `path: "node"` with `context.nodeId` and either `method: "__assignProperties__"` for properties or an explicit node method like `resize(w,h)`.
- Reparent newly created nodes into the bus frame so the hierarchy matches the layer structure. Use `node.appendChild` on the frame (parent) node and pass the child node as an argument.

### 1) Create Canvas Frame
Step A — create:
```json
{ "path": "figma", "method": "createFrame" }
```
Assume the response shows `result.id` = `FRAME_ID`. Step B — assign props and resize on the node:
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "FRAME_ID" },
  "metadata": { "propertyAssignments": {
    "name": "School Bus",
    "x": 0, "y": 0,
    "fills": [{"type":"SOLID","color":{"r":1,"g":1,"b":1}}]
  }}
}
```
```json
{ "path": "node", "method": "resize", "context": { "nodeId": "FRAME_ID" }, "args": [1200, 600] }
```

### 2) Main Body Rectangle
Create, then set properties on the node and resize:
```json
{ "path": "figma", "method": "createRectangle" }
```
Assume `result.id` = `BODY_ID`.
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "BODY_ID" },
  "metadata": { "propertyAssignments": {
    "name": "Body", "x": 150, "y": 220, "cornerRadius": 24,
    "strokes": [{"type":"SOLID","color":{"r":0.08,"g":0.08,"b":0.08}}],
    "strokeWeight": 4,
    "fills": [{"type":"SOLID","color":{"r":0.976,"g":0.764,"b":0.067}}],
    "effects": [{"type":"DROP_SHADOW","color":{"r":0,"g":0,"b":0,"a":0.15},"offset":{"x":0,"y":2},"radius":6,"visible":true,"blendMode":"NORMAL"}]
  }}
}
```
```json
{ "path": "node", "method": "resize", "context": { "nodeId": "BODY_ID" }, "args": [900, 230] }
```
Reparent under the frame:
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "FRAME_ID" },
  "args": [{ "__nodeId": "BODY_ID" }] }
```

### 3) Black Mid Stripe + Label
Stripe:
```json
{ "path": "figma", "method": "createRectangle" }
```
Assume `result.id` = `STRIPE_ID`.
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "STRIPE_ID" },
  "metadata": { "propertyAssignments": {
    "name": "Stripe", "x": 190, "y": 315,
    "fills": [{"type":"SOLID","color":{"r":0.07,"g":0.07,"b":0.07}}]
  }}
}
```
```json
{ "path": "node", "method": "resize", "context": { "nodeId": "STRIPE_ID" }, "args": [820, 52] }
```
Reparent under the frame:
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "FRAME_ID" },
  "args": [{ "__nodeId": "STRIPE_ID" }] }
```

Text (requires font load first):
```json
{ "path": "figma", "method": "loadFontAsync", "args": [{"family":"Inter","style":"Bold"}] }
```
```json
{ "path": "figma", "method": "createText" }
```
Assume `result.id` = `LABEL_ID`.
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "LABEL_ID" },
  "metadata": { "propertyAssignments": {
    "name": "Label", "x": 420, "y": 312, "fontSize": 44,
    "fontName": {"family":"Inter","style":"Bold"},
    "fills": [{"type":"SOLID","color":{"r":1,"g":1,"b":1}}]
  }}
}
```
Then set the characters:
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "LABEL_ID" },
  "metadata": { "propertyAssignments": { "characters": "SCHOOL BUS" } }
}
```
Reparent the label into the bus frame first (so both nodes share the same parent):
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "FRAME_ID" },
  "args": [{ "__nodeId": "LABEL_ID" }] }
```
Group stripe rectangle and label under the frame so they move together:
```json
{ "path": "figma", "method": "group",
  "args": [ [ { "__nodeId": "STRIPE_ID" }, { "__nodeId": "LABEL_ID" } ], { "__nodeId": "FRAME_ID" } ] }
```
Assume `result.id` = `STRIPE_GROUP_ID`. Optionally rename the group:
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "STRIPE_GROUP_ID" },
  "metadata": { "propertyAssignments": { "name": "Stripe" } } }
```

### 4) Window Component (build once), then instances
Create the master rectangle, then style + resize (keep at origin so the component's local bounds start at 0,0):
```json
{ "path": "figma", "method": "createRectangle" }
```
Assume `result.id` = `WINDOW_MASTER_ID`.
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "WINDOW_MASTER_ID" },
  "metadata": { "propertyAssignments": {
    "name": "Window/Frame", "cornerRadius": 10,
    "strokes": [{"type":"SOLID","color":{"r":0.07,"g":0.07,"b":0.07}}],
    "strokeWeight": 2,
    "fills": [{"type":"GRADIENT_LINEAR",
      "gradientStops": [
        {"position":0,"color":{"r":0.843,"g":0.933,"b":0.976,"a":1}},
        {"position":1,"color":{"r":0.663,"g":0.843,"b":0.965,"a":1}}
      ],
      "gradientTransform": [[1,0,0],[0,1,0]]
    }]
  }}
}
```
```json
{ "path": "node", "method": "resize", "context": { "nodeId": "WINDOW_MASTER_ID" }, "args": [110, 70] }
```
Convert the rectangle into a component by creating an empty component and reparenting the master rectangle into it:
```json
{ "path": "figma", "method": "createComponent" }
```
Assume `result.id` = `WINDOW_COMPONENT_ID`.
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "WINDOW_COMPONENT_ID" },
  "args": [{ "__nodeId": "WINDOW_MASTER_ID" }] }
```
Optionally resize the component to match the master and rename it:
```json
{ "path": "node", "method": "resize", "context": { "nodeId": "WINDOW_COMPONENT_ID" }, "args": [110, 70] }
```
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "WINDOW_COMPONENT_ID" },
  "metadata": { "propertyAssignments": { "name": "Window/Component" } }
}
```
Create instances with offsets +22px horizontally per instance.
Create a dedicated auto-layout container for the windows and append instances there:
```json
{ "path": "figma", "method": "createFrame" }
```
Assume `result.id` = `WINDOWS_FRAME_ID`.
Position first (no auto‑layout yet):
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "WINDOWS_FRAME_ID" },
  "metadata": { "propertyAssignments": {
    "name": "Windows",
    "x": 200, "y": 245,
    "fills": [], "strokes": []
  }}
}
```
Set initial height before enabling auto‑layout:
```json
{ "path": "node", "method": "resize", "context": { "nodeId": "WINDOWS_FRAME_ID" }, "args": [110, 70] }
```
Enable auto‑layout so width hugs children while height stays fixed:
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "WINDOWS_FRAME_ID" },
  "metadata": { "propertyAssignments": {
    "layoutMode": "HORIZONTAL", "itemSpacing": 22,
    "primaryAxisSizingMode": "AUTO",
    "counterAxisSizingMode": "FIXED", "counterAxisAlignItems": "CENTER",
    "paddingLeft": 0, "paddingRight": 0, "paddingTop": 0, "paddingBottom": 0
  }}
}
```
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "FRAME_ID" },
  "args": [{ "__nodeId": "WINDOWS_FRAME_ID" }] }
```
Create 5 instances from the window component, then append each into `WINDOWS_FRAME_ID`:
```json
{ "path": "node", "method": "createInstance", "context": { "nodeId": "WINDOW_COMPONENT_ID" } }
```
Assume `result.id` = `WINDOW_I1_ID`. Optionally name it:
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "WINDOW_I1_ID" },
  "metadata": { "propertyAssignments": { "name": "Window 1" } } }
```
Repeat for `WINDOW_I2_ID`..`WINDOW_I5_ID`.

Append each instance to the windows container (auto‑layout will space them):
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "WINDOWS_FRAME_ID" },
  "args": [{ "__nodeId": "WINDOW_I1_ID" }] }
```
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "WINDOWS_FRAME_ID" },
  "args": [{ "__nodeId": "WINDOW_I2_ID" }] }
```
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "WINDOWS_FRAME_ID" },
  "args": [{ "__nodeId": "WINDOW_I3_ID" }] }
```
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "WINDOWS_FRAME_ID" },
  "args": [{ "__nodeId": "WINDOW_I4_ID" }] }
```
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "WINDOWS_FRAME_ID" },
  "args": [{ "__nodeId": "WINDOW_I5_ID" }] }
```

### 4.5) Door Component (two-panel with mullion)
Create masters at origin:
```json
{ "path": "figma", "method": "createRectangle" }
```
Assume `result.id` = `DOOR_TOP_MASTER_ID`.
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "DOOR_TOP_MASTER_ID" },
  "metadata": { "propertyAssignments": {
    "name": "Door/TopPanel", "cornerRadius": 8,
    "strokes": [{"type":"SOLID","color":{"r":0.07,"g":0.07,"b":0.07}}],
    "strokeWeight": 2,
    "fills": [{"type":"GRADIENT_LINEAR",
      "gradientStops": [
        {"position":0,"color":{"r":0.843,"g":0.933,"b":0.976,"a":1}},
        {"position":1,"color":{"r":0.663,"g":0.843,"b":0.965,"a":1}}
      ],
      "gradientTransform": [[1,0,0],[0,1,0]]
    }]
  }}
}
```
```json
{ "path": "node", "method": "resize", "context": { "nodeId": "DOOR_TOP_MASTER_ID" }, "args": [80, 100] }
```
Bottom panel:
```json
{ "path": "figma", "method": "createRectangle" }
```
Assume `result.id` = `DOOR_BOTTOM_MASTER_ID`.
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "DOOR_BOTTOM_MASTER_ID" },
  "metadata": { "propertyAssignments": {
    "name": "Door/BottomPanel", "cornerRadius": 8,
    "strokes": [{"type":"SOLID","color":{"r":0.07,"g":0.07,"b":0.07}}],
    "strokeWeight": 2,
    "fills": [{"type":"SOLID","color":{"r":0.976,"g":0.764,"b":0.067}}]
  }}
}
```
```json
{ "path": "node", "method": "resize", "context": { "nodeId": "DOOR_BOTTOM_MASTER_ID" }, "args": [80, 100] }
```
Mullion:
```json
{ "path": "figma", "method": "createRectangle" }
```
Assume `result.id` = `DOOR_MULLION_MASTER_ID`.
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "DOOR_MULLION_MASTER_ID" },
  "metadata": { "propertyAssignments": {
    "name": "Door/Mullion",
    "fills": [{"type":"SOLID","color":{"r":0.07,"g":0.07,"b":0.07}}]
  }}
}
```
```json
{ "path": "node", "method": "resize", "context": { "nodeId": "DOOR_MULLION_MASTER_ID" }, "args": [6, 230] }
```

Reparent masters to the frame, group them, then convert to a component and arrange internals:
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "FRAME_ID" },
  "args": [{ "__nodeId": "DOOR_TOP_MASTER_ID" }] }
```
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "FRAME_ID" },
  "args": [{ "__nodeId": "DOOR_BOTTOM_MASTER_ID" }] }
```
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "FRAME_ID" },
  "args": [{ "__nodeId": "DOOR_MULLION_MASTER_ID" }] }
```
```json
{ "path": "figma", "method": "group",
  "args": [ [ {"__nodeId": "DOOR_TOP_MASTER_ID"}, {"__nodeId": "DOOR_BOTTOM_MASTER_ID"}, {"__nodeId": "DOOR_MULLION_MASTER_ID"} ], {"__nodeId": "FRAME_ID"} ] }
```
Assume `result.id` = `DOOR_GROUP_MASTER_ID`.
```json
{ "path": "figma", "method": "createComponent" }
```
Assume `result.id` = `DOOR_COMPONENT_ID`.
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "DOOR_COMPONENT_ID" },
  "args": [{ "__nodeId": "DOOR_GROUP_MASTER_ID" }] }
```
Normalize internal positions (top at y:0, bottom at y:112, mullion centered):
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "DOOR_TOP_MASTER_ID" },
  "metadata": { "propertyAssignments": { "x": 0, "y": 0 } } }
```
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "DOOR_BOTTOM_MASTER_ID" },
  "metadata": { "propertyAssignments": { "x": 0, "y": 120 } } }
```
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "DOOR_MULLION_MASTER_ID" },
  "metadata": { "propertyAssignments": { "x": 37, "y": 0 } } }
```
Optionally rename component:
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "DOOR_COMPONENT_ID" },
  "metadata": { "propertyAssignments": { "name": "Door/Component" } } }
```

Create one door instance, position it at the front and append to the frame:
```json
{ "path": "node", "method": "createInstance", "context": { "nodeId": "DOOR_COMPONENT_ID" } }
```
Assume `result.id` = `DOOR_INSTANCE_ID`.
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "DOOR_INSTANCE_ID" },
  "metadata": { "propertyAssignments": { "x": 905, "y": 220, "name": "Door" } } }
```
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "FRAME_ID" },
  "args": [{ "__nodeId": "DOOR_INSTANCE_ID" }] }
```

### 5) Wheel Component
Create concentric ellipses (keep masters at origin), resize via node methods, group → component, then create positioned instances.

Tire ellipse:
```json
{ "path": "figma", "method": "createEllipse" }
```
Assume `result.id` = `TIRE_ID`.
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "TIRE_ID" },
  "metadata": { "propertyAssignments": { "name": "Wheel/Tire",
    "fills": [{"type":"SOLID","color":{"r":0.17,"g":0.17,"b":0.17}}] } } }
```
```json
{ "path": "node", "method": "resize", "context": { "nodeId": "TIRE_ID" }, "args": [110, 110] }
```

Rim ellipse:
```json
{ "path": "figma", "method": "createEllipse" }
```
Assume `result.id` = `RIM_ID`.
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "RIM_ID" },
  "metadata": { "propertyAssignments": { "name": "Wheel/Rim",
    "fills": [{"type":"SOLID","color":{"r":0.725,"g":0.725,"b":0.725}}] } } }
```
```json
{ "path": "node", "method": "resize", "context": { "nodeId": "RIM_ID" }, "args": [76, 76] }
```
Center the rim inside the 110×110 tire (offset = (110−76)/2 = 17):
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "RIM_ID" },
  "metadata": { "propertyAssignments": { "x": 17, "y": 17 } } }
```

Hub circle:
```json
{ "path": "figma", "method": "createEllipse" }
```
Assume `result.id` = `HUB_ID`.
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "HUB_ID" },
  "metadata": { "propertyAssignments": { "name": "Wheel/Hub",
    "fills": [{"type":"SOLID","color":{"r":0.894,"g":0.894,"b":0.894}}] } } }
```
```json
{ "path": "node", "method": "resize", "context": { "nodeId": "HUB_ID" }, "args": [36, 36] }
```
Center the hub inside the tire (offset = (110−36)/2 = 37):
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "HUB_ID" },
  "metadata": { "propertyAssignments": { "x": 37, "y": 37 } } }
```

Reparent masters under the frame so we can group them:
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "FRAME_ID" },
  "args": [{ "__nodeId": "TIRE_ID" }] }
```
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "FRAME_ID" },
  "args": [{ "__nodeId": "RIM_ID" }] }
```
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "FRAME_ID" },
  "args": [{ "__nodeId": "HUB_ID" }] }
```

Group the three shapes, then convert to a component and move the group inside it (keeping local origin at 0,0):
```json
{ "path": "figma", "method": "group",
  "args": [ [ {"__nodeId": "TIRE_ID"}, {"__nodeId": "RIM_ID"}, {"__nodeId": "HUB_ID"} ], {"__nodeId": "FRAME_ID"} ] }
```
Assume `result.id` = `WHEEL_GROUP_MASTER_ID`.
```json
{ "path": "figma", "method": "createComponent" }
```
Assume `result.id` = `WHEEL_COMPONENT_ID`.
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "WHEEL_COMPONENT_ID" },
  "args": [{ "__nodeId": "WHEEL_GROUP_MASTER_ID" }] }
```
Optional: rename component for clarity:
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "WHEEL_COMPONENT_ID" },
  "metadata": { "propertyAssignments": { "name": "Wheel/Component" } } }
```

Create two instances and position them under the bus frame:
```json
{ "path": "node", "method": "createInstance", "context": { "nodeId": "WHEEL_COMPONENT_ID" } }
```
Assume `result.id` = `REAR_WHEEL_INSTANCE_ID`.
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "REAR_WHEEL_INSTANCE_ID" },
  "metadata": { "propertyAssignments": { "x": 265, "y": 400, "name": "Wheel Rear" } } }
```
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "FRAME_ID" },
  "args": [{ "__nodeId": "REAR_WHEEL_INSTANCE_ID" }] }
```
```json
{ "path": "node", "method": "createInstance", "context": { "nodeId": "WHEEL_COMPONENT_ID" } }
```
Assume `result.id` = `FRONT_WHEEL_INSTANCE_ID`.
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "FRONT_WHEEL_INSTANCE_ID" },
  "metadata": { "propertyAssignments": { "x": 865, "y": 400, "name": "Wheel Front" } } }
```
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "FRAME_ID" },
  "args": [{ "__nodeId": "FRONT_WHEEL_INSTANCE_ID" }] }
```

### 6) Body Details (nose, windshield, bumpers, lights, panel, shadow)
Create and position the remaining geometry; all nodes are reparented under `FRAME_ID`.

- Front nose (ellipse, softens front curve):
```json
{ "path": "figma", "method": "createEllipse" }
```
Assume `result.id` = `FRONT_NOSE_ID`.
```json
{ "path": "node", "method": "resize", "context": { "nodeId": "FRONT_NOSE_ID" }, "args": [140, 140] }
```
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "FRONT_NOSE_ID" },
  "metadata": { "propertyAssignments": {
    "name": "Front Nose", "x": 1020, "y": 280,
    "strokes": [{"type":"SOLID","color":{"r":0.08,"g":0.08,"b":0.08}}],
    "strokeWeight": 4,
    "fills": [{"type":"SOLID","color":{"r":0.976,"g":0.764,"b":0.067}}]
  }} }
```
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "FRAME_ID" },
  "args": [{ "__nodeId": "FRONT_NOSE_ID" }] }
```

- Windshield (rounded rect with glass gradient):
```json
{ "path": "figma", "method": "createRectangle" }
```
Assume `result.id` = `WINDSHIELD_ID`.
```json
{ "path": "node", "method": "resize", "context": { "nodeId": "WINDSHIELD_ID" }, "args": [120, 130] }
```
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "WINDSHIELD_ID" },
  "metadata": { "propertyAssignments": {
    "name": "Windshield", "x": 1005, "y": 245, "cornerRadius": 14,
    "strokes": [{"type":"SOLID","color":{"r":0.07,"g":0.07,"b":0.07}}],
    "strokeWeight": 2,
    "fills": [{"type":"GRADIENT_LINEAR",
      "gradientStops": [
        {"position":0,"color":{"r":0.843,"g":0.933,"b":0.976,"a":1}},
        {"position":1,"color":{"r":0.663,"g":0.843,"b":0.965,"a":1}}
      ],
      "gradientTransform": [[1,0,0],[0,1,0]]
    }]
  }} }
```
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "FRAME_ID" },
  "args": [{ "__nodeId": "WINDSHIELD_ID" }] }
```

- Front bumper (dark grey rounded rect):
```json
{ "path": "figma", "method": "createRectangle" }
```
Assume `result.id` = `FRONT_BUMPER_ID`.
```json
{ "path": "node", "method": "resize", "context": { "nodeId": "FRONT_BUMPER_ID" }, "args": [120, 42] }
```
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "FRONT_BUMPER_ID" },
  "metadata": { "propertyAssignments": { "name": "Front Bumper", "x": 1020, "y": 400,
    "cornerRadius": 12,
    "fills": [{"type":"SOLID","color":{"r":0.17,"g":0.17,"b":0.17}}] } } }
```
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "FRAME_ID" },
  "args": [{ "__nodeId": "FRONT_BUMPER_ID" }] }
```

- Rear bumper:
```json
{ "path": "figma", "method": "createRectangle" }
```
Assume `result.id` = `REAR_BUMPER_ID`.
```json
{ "path": "node", "method": "resize", "context": { "nodeId": "REAR_BUMPER_ID" }, "args": [40, 30] }
```
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "REAR_BUMPER_ID" },
  "metadata": { "propertyAssignments": { "name": "Rear Bumper", "x": 120, "y": 400,
    "cornerRadius": 8,
    "fills": [{"type":"SOLID","color":{"r":0.17,"g":0.17,"b":0.17}}] } } }
```
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "FRAME_ID" },
  "args": [{ "__nodeId": "REAR_BUMPER_ID" }] }
```

- Headlight (amber ellipse):
```json
{ "path": "figma", "method": "createEllipse" }
```
Assume `result.id` = `HEADLIGHT_ID`.
```json
{ "path": "node", "method": "resize", "context": { "nodeId": "HEADLIGHT_ID" }, "args": [28, 28] }
```
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "HEADLIGHT_ID" },
  "metadata": { "propertyAssignments": { "name": "Headlight", "x": 1045, "y": 320,
    "strokes": [{"type":"SOLID","color":{"r":0.08,"g":0.08,"b":0.08}}],
    "strokeWeight": 3,
    "fills": [{"type":"SOLID","color":{"r":0.984,"g":0.761,"b":0.298}}] } } }
```
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "FRAME_ID" },
  "args": [{ "__nodeId": "HEADLIGHT_ID" }] }
```

- Rear light (red ellipse) and side marker (red rounded rect):
```json
{ "path": "figma", "method": "createEllipse" }
```
Assume `result.id` = `REAR_LIGHT_ID`.
```json
{ "path": "node", "method": "resize", "context": { "nodeId": "REAR_LIGHT_ID" }, "args": [20, 20] }
```
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "REAR_LIGHT_ID" },
  "metadata": { "propertyAssignments": { "name": "Rear Light", "x": 140, "y": 250,
    "strokes": [{"type":"SOLID","color":{"r":0.08,"g":0.08,"b":0.08}}],
    "strokeWeight": 2,
    "fills": [{"type":"SOLID","color":{"r":0.9,"g":0.1,"b":0.1}}] } } }
```
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "FRAME_ID" },
  "args": [{ "__nodeId": "REAR_LIGHT_ID" }] }
```
```json
{ "path": "figma", "method": "createRectangle" }
```
Assume `result.id` = `SIDE_MARKER_ID`.
```json
{ "path": "node", "method": "resize", "context": { "nodeId": "SIDE_MARKER_ID" }, "args": [18, 12] }
```
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "SIDE_MARKER_ID" },
  "metadata": { "propertyAssignments": { "name": "Side Marker", "x": 300, "y": 365, "cornerRadius": 4,
    "fills": [{"type":"SOLID","color":{"r":0.9,"g":0.1,"b":0.1}}] } } }
```
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "FRAME_ID" },
  "args": [{ "__nodeId": "SIDE_MARKER_ID" }] }
```

- Rear service panel (yellow rounded rect):
```json
{ "path": "figma", "method": "createRectangle" }
```
Assume `result.id` = `REAR_PANEL_ID`.
```json
{ "path": "node", "method": "resize", "context": { "nodeId": "REAR_PANEL_ID" }, "args": [85, 65] }
```
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "REAR_PANEL_ID" },
  "metadata": { "propertyAssignments": { "name": "Rear Panel", "x": 160, "y": 245, "cornerRadius": 10,
    "strokes": [{"type":"SOLID","color":{"r":0.08,"g":0.08,"b":0.08}}],
    "strokeWeight": 2,
    "fills": [{"type":"SOLID","color":{"r":0.976,"g":0.764,"b":0.067}}] } } }
```
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "FRAME_ID" },
  "args": [{ "__nodeId": "REAR_PANEL_ID" }] }
```

- Underbody shadow (soft dark strip):
```json
{ "path": "figma", "method": "createRectangle" }
```
Assume `result.id` = `UNDERSHADOW_ID`.
```json
{ "path": "node", "method": "resize", "context": { "nodeId": "UNDERSHADOW_ID" }, "args": [860, 14] }
```
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "UNDERSHADOW_ID" },
  "metadata": { "propertyAssignments": { "name": "Undershadow", "x": 200, "y": 380,
    "fills": [{"type":"SOLID","color":{"r":0,"g":0,"b":0}, "opacity": 0.2}] } } }
```
```json
{ "path": "node", "method": "appendChild", "context": { "nodeId": "FRAME_ID" },
  "args": [{ "__nodeId": "UNDERSHADOW_ID" }] }
```

## Export & Verification
- Create the top-level Bus group so all parts move together and export can target a single node. Start with nodes defined earlier in this plan (add any additional node IDs you created, such as `DOOR_INSTANCE_ID`, `FRONT_NOSE_ID`, etc.).
```json
{ "path": "figma", "method": "group",
  "args": [
    [
      {"__nodeId": "BODY_ID"},
      {"__nodeId": "STRIPE_GROUP_ID"},
      {"__nodeId": "WINDOWS_FRAME_ID"},
      {"__nodeId": "DOOR_INSTANCE_ID"},
      {"__nodeId": "REAR_WHEEL_INSTANCE_ID"},
      {"__nodeId": "FRONT_WHEEL_INSTANCE_ID"},
      {"__nodeId": "FRONT_NOSE_ID"},
      {"__nodeId": "WINDSHIELD_ID"},
      {"__nodeId": "FRONT_BUMPER_ID"},
      {"__nodeId": "REAR_BUMPER_ID"},
      {"__nodeId": "HEADLIGHT_ID"},
      {"__nodeId": "REAR_LIGHT_ID"},
      {"__nodeId": "SIDE_MARKER_ID"},
      {"__nodeId": "UNDERSHADOW_ID"},
      {"__nodeId": "REAR_PANEL_ID"}
    ],
    { "__nodeId": "FRAME_ID" }
  ]
}
```
Assume `result.id` = `BUS_GROUP_ID`. Optionally rename:
```json
{ "path": "node", "method": "__assignProperties__", "context": { "nodeId": "BUS_GROUP_ID" },
  "metadata": { "propertyAssignments": { "name": "Bus" } } }
```

- When this plan is executed, produce two verification images for durable evidence and side-by-side comparison:
  - 1× export (scale: 1) → `playground/exports/school-bus-1x.png`
  - 2× export (scale: 2) → `playground/exports/school-bus-2x.png`

Recommended workflow using the MCP `export_node_as_image` tool (save directly to durable paths):

1) Export at 1× (scale: 1) and write the bytes to `playground/exports/school-bus-1x.png`.

2) Export at 2× (scale: 2) and write the bytes to `playground/exports/school-bus-2x.png`.

Note: These assets will be generated and added when the illustration is finalized.

## Risks & Notes
- Property assignments on `figma.*` creation calls never touch the newly created node. Always do a second call on `path: "node"` with `context.nodeId` (or a `{ "__nodeId": "..." }` argument when a SceneNode is required).
- Use `node.resize(w,h)` rather than `"resize"` inside property assignments.
- Some boolean operations (union/subtract) may require selecting children and invoking `figma.createBooleanOperation`. A simpler visual match can be achieved with layered shapes without boolean ops.
- Font loading may be required for setting text properties; if the bridge doesn’t auto-load Inter, call `figma.loadFontAsync({ family: "Inter", style: "Bold" })` before setting `characters`.

## Completion Criteria
- Bus proportions and details visually match the provided reference at typical working size (1200×600 frame).
- All major parts use component instances where appropriate.
- Text reads “SCHOOL BUS”, properly centered on the black stripe.
- File is tidy, with named layers and grouped hierarchy.
