Please read figma-skill.md and follow those instructions.

# Using git
- Unless explicitly instructed otherwise, only use git for read-only purposes. Do not switch branches, commit changes, or reset changes unless specifically instructed. The reason for this is very important: there are likely other AI coding agents and/or human developers working alongside you, possibly on adjacent tasks. If you use git to make commits when not instructed to do so, you will mess up code review and agent management processes. It is usually 100% fine that there is a dirty workspace with other unstaged changes. Just focus on your task without worrying about that.

# Agentic loop
When I start you out on a task, please do as much work towards it as you can. Eventually your turn will end, and then I will send an automated message to send you back into the loop. This will continue until you call the tool to permanently end the session (`permanently_terminate_session`). Don't call this function until you are absolutely done with everything and there is nothing left you could do on your task (such as reviewing your code, making sure tests pass, making sure a manual QA pass over the functionality works, additional cleanup from your work, etc).

# Working with Other AI Agents in a Dirty Workspace
You should assume that there are other AI coding agents working concurrently with you (or a human developer) in the same git workspace. If you see changes in `git diff` that are unrelated to your work, please don't try to reset them. They are probably from other work that is ongoing (especially as related to other exec_plans).

# MCP Tools
You have the following MCP tools available at your disposal:
  • Server: codex
  • Tools: codex, codex-reply, codex-code-review, codex-batch

Using codex is really great when you want to farm of a well-contained task. You should be mindful of your own context window. You can use codex to do a one-off change. Think of this like delegating to an engineer on your team. You are the tech lead and you need to provide a good prompt and clear instructions on when to escalate back to you for further assistance. You can also use a codex sub-agent to perform a code review for you. Just give it proper context on what you did and why. If you want to continue a conversation with the same sub-agent, just use codex-reply. Also, whenever you finish a major milestone or a full task, use codex-code-review to have an AI code review agent check your work. You'll have to provide a clear message as to what you were working on and why. Ideally, you should provide a message that contains a list of files you touched so the agent can focus on those. There may be other concurrent tasks by other AI coding agents on the same git worktree. So if you get back irrelevant content in the code review response, you can safely ignore it. Finally, use codex-batch when you want to have more than one codex sub-agent go at the same time and have their responses resolve together. For example if you have like a dozen mundane changes that are each time consuming, you could make a prompt and farm it off to 12 different agents and then review all their work once its done. This strategy helps to save you from depleting your context window.

You also have talk_to_figma MCP server available, but more detail is available in figma-skill.md.


# Escalating for Help
Sometimes you will start on a task from a human prompt, and we'll have a good initial plan, but then something unexpected will happen. Normally you could stop and ask the human how to proceed, but since we are putting you in a self-continuing loop, you will need to use a special command to ask the human developer for help:
`pnpm --dir ~/code/profoundhealth/icp ask-human-dev "put a detailed question here"`

A few rules to follow with regard to escalating for help:
1. Assume the human reading it has no other context on what you're working on. Typically, the human will have started many agents on many tasks, so you'll have to provide a brief reminder of what job you're working on, which part of the project, etc. Provide enough context so the question makes sense as a standalone message.
2. If you find yourself trying to do a hacky workaround to avoid a problem, its better to escalate for human help. You are very good at coding, but sometimes it requires a human to help you step back and find a more clean solution.
3. If you have to make a big decision (perhaps something wasn't adequately specified up front), its best to get human confirmation for diving in.
4. If the human help command times out with no response, that means the human wasn't available in time. In this case, invoke `permanently_terminate_session` so that the human can come pick back up the session once they're available.

# Sub-Agents
Always use "sandbox":"danger-full-access","approval-policy":"never". This is the same policy you have.

Sub-agents can't view the /tmp directory for right now, so make sure to cp the file into the pwd workspace so that the sub-agent can see it properly before prompting it.