---
title: "The MCP Cargo Cult"
description: "We're wrapping CLI tools in MCP servers, adding 8-12 seconds of overhead and paying 23.5% more in tokens. To solve problems that don't exist. Here's why the industry forgot bash already works."
pubDate: "2025-11-16"
category: "opinion"
heroImage: "/blog-placeholder-1.jpg"
draft: false
tags: ["mcp", "cli", "tooling", "performance", "ai-agents"]
keywords: [
  "Model Context Protocol",
  "MCP servers",
  "CLI tools",
  "bash",
  "AI agents",
  "Claude",
  "performance optimization",
]
author: "Szymon Dzumak"
featured: true
showToc: true
---

Developers are installing MCP servers to let Claude access databases, query GitHub, and fetch documentation. Things Claude already does through command-line tools that have existed for decades.

I'm not talking about theory here. Claude is good at using CLI tools. It writes bash commands, pipes data between programs, parses JSON output. It's been doing this since launch. Yet somehow, we've convinced ourselves we need to wrap these tools in Model Context Protocol servers. Adding layers of abstraction, configuration files, and overhead to solve problems that don't exist.

Let me show you with actual data.

## The Performance Reality

Let's start with numbers. The performance overhead isn't speculation. It's documented.

The Gemini CLI team investigated MCP server performance and found ["a significant delay of approximately 8 to 12 seconds before the tool becomes responsive and ready for use"](https://github.com/google-gemini/gemini-cli/issues/4544) every single time the tool launches. Not a one-time setup cost. Every session.

But it gets better. [Twilio ran detailed performance tests on their MCP server](https://www.twilio.com/en-us/blog/developers/twilio-alpha-mcp-server-real-world-performance). They made certain tasks 21.6% faster by reducing API calls. Great, right? Except they added 28.5% more cache reads and 53.7% more cache writes. Overall cost increase? 23.5% per task.

Think about that. They wrapped an API they already had access to. Added an MCP layer to "optimize" it. Ended up paying 23.5% more in tokens. The MCP worked. It reduced API calls. But they traded API efficiency for token inefficiency.

When people tried to scale MCPs? [Performance testing in Kubernetes](https://dev.to/stacklok/performance-testing-mcp-servers-in-kubernetes-transport-choice-is-the-make-or-break-decision-for-1ffb) showed the stdio transport "demonstrated severe performance limitations that make it unsuitable for production use." Only 2 out of 50 requests succeeded under moderate load. The transport layer itself became the bottleneck.

Meanwhile, CLI tools? Instant. No startup time. No protocol overhead. No transport layer failures.

## Database MCPs: The Clearest Example

This pattern becomes most obvious with databases.

Popular database MCP servers like the [PostgreSQL MCP server](https://www.pulsemcp.com/servers/modelcontextprotocol-postgres) market themselves as providing "read-only access," "schema inspection," and "secure query execution" for SQLite, PostgreSQL, and MySQL. These features sound valuable. If you didn't know what the CLI tools already do.

Here's what nobody mentions: SQLite's command-line tool has supported JSON output since version 3.38 in 2022. The `-json` flag outputs query results as properly formatted JSON arrays. Not a hack. Not a workaround. A documented, stable feature that's been there for years.

Here's what this looks like:

```bash
# Query with JSON output
sqlite3 mydb.db 'SELECT * FROM users WHERE active = true' -json

# Get schema information  
sqlite3 mydb.db '.schema users' -json

# Complex aggregation
sqlite3 mydb.db -json 'SELECT customer_id, SUM(amount) 
  FROM orders 
  WHERE date > "2024-01-01" 
  GROUP BY customer_id'
```

No configuration files. No MCP server process. No JSON serialization layers. The CLI supports multiple output formats. CSV, HTML, markdown, and JSON natively. It's been doing this reliably for years.

PostgreSQL? Same story. Run `psql -qAtX -c 'SELECT json_agg(users) FROM users'` to get JSON output directly. PostgreSQL's native JSON aggregation functions do the work. The database itself produces JSON.

MySQL? Same thing. Every modern database CLI has native JSON support. Because that's what people actually need.

## The GitHub/GitLab Wrapper Problem

The pattern gets stranger with version control.

Multiple GitLab MCP servers like [mcp-gitlab](https://github.com/mikedotJS/mcp-gitlab) and [glab-mcp-server](https://lobehub.com/mcp/stijnwillems-glab-mcp-server) explicitly describe themselves as "wrappers around the glab CLI tool". GitHub's MCP server provides tools to "read repositories, manage issues and PRs, and analyze code". Popular, well-maintained projects. Thousands of users.

Here's what they're wrapping: The GitHub CLI has had native JSON output with the `--json` flag since 2021. You specify exactly which fields you want. The tool was designed from the start to be scriptable.

```bash
# List pull requests with structured output
gh pr list --json number,title,author,state

# Create an issue
gh issue create --title "Bug report" --body "Description"

# Get workflow run details
gh run view 12345 --json conclusion,status,jobs
```

The GitHub CLI even has a built-in `--jq` flag for filtering JSON directly. No need to pipe to `jq` separately. The tool knows it's being used in scripts and agents.

When you install a GitHub MCP server, you're creating a wrapper that:

1. Receives a request via MCP protocol
2. Parses that request
3. Constructs a `gh` command
4. Executes that command
5. Parses the CLI output
6. Serializes it back to JSON
7. Returns it via MCP protocol

Claude could just run `gh pr list --json number,title` directly.

You've added six steps of serialization. To something that was already giving you JSON.

## The Context7 Documentation Question

Context7 needs addressing. It's become incredibly popular. It illustrates a different dimension of this problem.

Context7 markets itself as solving "outdated training data" by fetching "up-to-date, version-specific documentation and code examples" for popular frameworks. On the surface, this makes sense. New frameworks release. Claude's training data becomes stale. We need fresh docs.

The issue is scope. Claude Sonnet 4 already has deep knowledge of React, Next.js, TypeScript, Tailwind, Vue, Svelte, and every major framework. When you use Context7 to fetch React documentation, you're dumping potentially hundreds of kilobytes of information Claude already knows into its context window. Paying to re-explain `useState` to a system that already understands React at an expert level.

"But what about genuinely new releases?" Fair question. When Next.js 15 launched, Claude's training data didn't include it. What's the right solution?

Context7's approach? Fetch comprehensive documentation. Potentially the entire Next.js docs site. The alternative is simpler. Fetch exactly what you need:

```bash
curl https://nextjs.org/blog/next-15#breaking-changes
```

One page. The changelog. The breaking changes. The new features. Not an explanation of routing concepts from 2016.

The token usage difference is dramatic. But more importantly, you get better information. Release notes explain what changed. They're optimized for people who already know the framework. That's exactly what Claude needs.

## The Plot Twist: Anthropic Admits the Problem

This is where it gets interesting. In November 2024, Anthropic published ["Code execution with MCP: building more efficient AI agents"](https://www.anthropic.com/engineering/code-execution-with-mcp). It's accidentally a perfect illustration of everything I've been saying.

They identified the problem clearly: "As developers routinely build agents with access to hundreds or thousands of tools across dozens of MCP servers, loading all tool definitions upfront and passing intermediate results through the context window slows down agents and increases costs".

Their example is telling. A simple task: "Download my meeting transcript from Google Drive and attach it to Salesforce." It consumed 150,000 tokens. Every intermediate result had to pass through the model's context. The transcript was processed twice. Once when reading it. Again when writing it.

What's their solution to MCP inefficiency?

They propose generating "a file tree of all available tools from connected MCP servers" where "each tool corresponds to a file" and "the agent discovers tools by exploring the filesystem".

Read that again. Their solution to MCP's problems is to put executable code on the filesystem that Claude can discover and run.

That's what CLI tools are. That's what `/usr/bin` has been since Unix was invented in 1969.

Look at their proposed architecture:

```typescript
servers/
├── google-drive/
│   ├── getDocument.ts
│   └── index.ts
└── salesforce/
    ├── updateRecord.ts
    └── index.ts
```

They're building a TypeScript file tree. Each tool is a file with a function that wraps an MCP call. Claude explores this filesystem to discover tools. Writes code to call them.

Their "after" example:

```typescript
const transcript = (await gdrive.getDocument({ documentId: "abc123" })).content;
await salesforce.updateRecord({
  objectType: "SalesMeeting",
  recordId: "00Q5f000001abcXYZ",
  data: { Notes: transcript },
});
```

What this could be without MCP infrastructure:

```bash
#!/bin/bash
# Get transcript and upload to Salesforce
transcript=$(curl -H "Authorization: Bearer $TOKEN" \
  "https://www.googleapis.com/drive/v3/files/abc123?alt=media")

salesforce-cli record update SalesMeeting:00Q5f000001abcXYZ \
  "Notes=$transcript"
```

Two commands. Direct API calls. No MCP protocol. No TypeScript generation. No file tree exploration. No tool definition loading.

They proudly announce this approach "reduces token usage from 150,000 tokens to 2,000 tokens. A time and cost saving of 98.7%".

A direct CLI approach? Maybe 200 tokens. Just the bash script itself. They're celebrating a 98.7% improvement. They could have had 99.87% by not using MCP in the first place.

## The "Benefits" Are Just Normal Programming

What they list as innovations:

**Progressive disclosure**: "Presenting tools as code on a filesystem allows models to read tool definitions on-demand, rather than reading them all up-front".

That's how `$PATH` works. Command discovery for 50 years. Claude doesn't need to load documentation for every command on your system. It runs the ones it needs.

**Context efficient tool results**: "When working with large datasets, agents can filter and transform results in code before returning them".

That's what pipes are for. The entire Unix philosophy:

```bash
# Filter a 10,000 row CSV
curl api.example.com/data.csv | \
  grep "status=pending" | \
  head -5
```

**State persistence**: "Code execution with filesystem access allows agents to maintain state across operations. Agents can write intermediate results to files".

Saving files. What filesystems do. The standard approach since the 1970s.

**Skills**: "Agents can persist their own code as reusable functions, creating structured skills that models can reference and use".

Shell scripts in a directory. We've been doing this forever:

```bash
#!/bin/bash
# ~/scripts/fetch-and-convert.sh
curl "$1" | jq -r '.[] | @csv' > "output-$(date +%s).csv"
```

They've reinvented shell scripting. With TypeScript and MCP protocol overhead.

The best part? Near the end they almost realize it: "Although many of the problems here feel novel (context management, tool composition, state persistence), they have known solutions from software engineering".

Yes. They're not novel. The solutions:

- Shell scripts
- Pipes and redirects
- The filesystem
- CLI tools

They've rediscovered Unix philosophy. Then concluded they need to rebuild it with MCPs.

## When MCPs Actually Make Sense

MCPs aren't useless. There are legitimate use cases:

**Proprietary internal systems** that don't have CLIs and can't easily have CLIs added. Your company has a custom ticketing system with a complex state machine and no API designed for external tools? An MCP makes sense.

**Complex OAuth flows** that require browser-based authentication with multiple redirects and token management. Some services make authentication deliberately hard for programmatic access.

**Enterprise security requirements** where you need audit logging, fine-grained permission controls, and session management that goes beyond standard Unix permissions.

**Remote services** that have SDK requirements, maintain stateful connections, or need client-side processing that can't be done with simple HTTP requests.

These are real problems MCPs can solve. But they're not the common case. Most of what people use MCPs for (databases, GitHub, GitLab, documentation) already has excellent CLI tooling.

## The Real Problem

MCPs aren't badly designed. The protocol is well-thought-out. The SDKs are good. The ecosystem is growing.

The problem is that MCP has become the default solution for everything. When it should be a specialized tool for specific edge cases.

We've forgotten what our tools already do.

Claude is good at using CLI tools. It knows bash. It understands pipes. It can read man pages. It constructs complex command pipelines. These capabilities have been there from the beginning. They work reliably.

But somewhere along the way, we saw a new protocol and assumed it was necessary. We saw other people installing MCP servers and figured we should too. We saw the list of available MCP servers growing and thought that's how you're supposed to give Claude access to tools.

We didn't stop to ask: "Can Claude already do this with the tools I have installed?"

Usually, the answer is yes.

## The Bottom Line

After all their testing, [Twilio concluded](https://www.twilio.com/en-us/blog/developers/twilio-alpha-mcp-server-real-world-performance) that "many builders may start with MCP for convenience, but later transition to custom tool integrations once they know exactly what their agent needs".

MCP is training wheels. Eventually you realize the bike already worked.

The CLI isn't new or exciting. It doesn't have a fancy protocol specification. It won't get you Twitter engagement when you tweet about your setup. But it works. It's fast. It's simple. It's debuggable. Claude already knows how to use it.

Every time you install an MCP server to wrap a CLI tool, you're adding 8-12 seconds of startup time, multiple serialization layers, and protocol overhead. To something that already works in milliseconds.

Choose boring technology. Use the tools you already have. Let Claude write bash commands.

Your future self (and your token budget) will thank you.
