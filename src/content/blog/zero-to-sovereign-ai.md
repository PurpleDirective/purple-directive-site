---
title: "Zero to Sovereign AI"
date: 2026-03-03
summary: "I built a full multi-agent AI system from scratch — memory kernel, teaching pipeline, homelab inference, structured deliberation. Here's how it actually works and where it's hard."
tags: ["sovereign-ai", "agents", "homelab", "architecture"]
---

The thing that bothered me about AI as a daily tool wasn't capability. It was memory. Every session starts over. You explain the same context, make the same tradeoffs, get slightly different answers. The model is powerful, but nothing compounds. Knowledge dies when the tab closes.

That was the problem I decided to solve.

## What I Built

Over roughly 90 days, I built what I'm calling the Purple Organization — a multi-agent AI system designed around one idea: sessions should teach the system, not just use it.

The architecture has four layers: a COO agent (Violet) who triages every task, an advisory council (E.I.K.) for complex analysis, operational agents for domain execution, and a memory kernel that persists knowledge across sessions and runtimes.

None of this existed at the start. I'm a solo developer. I built it while doing other things.

## Violet: The COO Layer

Violet is the entry point for every task. Her job is triage before anything else. Three categories: simple tasks go directly to operational staff, complex or ambiguous tasks go through the E.I.K. advisory council, administrative tasks get handled directly.

The reason for this layer is that without it, every task gets maximum effort. That sounds good until you realize you're burning two minutes of deliberation on "update this file." Triage makes the system efficient by routing proportionally to complexity. Violet also audits every output before it reaches me, running a six-point checklist: did execution match the instructions? are claims verified or tagged with uncertainty? does it actually answer the original prompt? That last one catches more failures than you'd expect.

## E.I.K.: Structured Deliberation That Actually Works

The advisory council has three agents: Evolution (forward motion and proposals), Improvement (verification and quality assurance), and Keenness (blind spot detection and assumption-challenging). The names are labels for genuinely different cognitive styles, not just different prompt personalities.

Each has a distinct thinking style, a distinct risk orientation, and a documented epistemic preference — what type of evidence it weights most heavily. Evolution runs inductive and lateral. Improvement runs deductive and systematic. Keenness runs adversarial and interrogative. They draw from different intellectual archetypes. The differentiation is structural, not cosmetic.

Deliberation runs in two rounds with a hard stop. Round one: all three analyze in parallel, no agent sees another's output. Round two: each agent reads the other two and responds once — affirming, challenging, or extending. Then it stops. Violet synthesizes.

The hard stop matters. Without it, multi-agent systems tend to drift into consensus via social pressure rather than evidence. Round two catches errors and surfaces disagreement. Round three would wash it out. I learned this by running systems without the hard stop and watching the outputs converge toward comfortable, middling recommendations.

## DOE: The Framework That Keeps It Sane

Every operational agent follows the DOE framework: Directive, Orchestration, Execution.

Directive is the human-authored SOPs in Markdown — what to do, what to avoid, what to escalate. Orchestration is the AI layer — interpreting directives, selecting tools, sequencing steps. Execution is deterministic Python scripts — the actual work, predictable and auditable.

The separation of concerns is the point. When something goes wrong, you know which layer failed. When I want to change behavior, I edit the directive, not the script. When I want to trust behavior, I look at the execution layer, which has no ambiguity. Mixing these layers — letting AI make ad-hoc scripting decisions, or letting scripts hard-code what should be agent judgment — is where systems become unmaintainable. I've done both and fixed both.

## The Memory Kernel

SQLite with FTS5 for full-text search and sqlite-vec for embedding-based similarity. Hybrid search uses Reciprocal Rank Fusion to combine keyword and semantic results. The hybrid matters because neither alone is sufficient: semantic search misses precise matches, keyword search misses meaning.

The kernel stores memories tagged by type, agent, source, and domain. Agents read from it before substantive tasks and write to it after. This is the nervous system — the thing that makes sessions non-disposable.

Building this was not hard technically. Getting agents to use it correctly — write-back discipline, consistent tagging, not over-fetching context — took iteration. The hard part of memory systems is always the protocol, not the storage.

## The Teaching Pipeline

This is the part I'm most interested in.

Cloud sessions (Claude) generate knowledge fragments — teaching artifacts that encode transferable principles rather than specific answers. The fragment format has a domain tag, a confidence level, a source agent, and critically, an independence test: "could the local model apply this to a novel problem it hasn't seen?" If no, the fragment is too narrow.

Fragments go into a queue. An overnight pipeline (running a local 27B model) filters malformed or low-quality fragments. Then they hit a human review gate. Nothing enters the compiled knowledge base without my explicit approval. No fragment bypasses review.

The principle behind this came from a real failure. Early on, I had the system auto-approve fragments above a confidence threshold. The 27B filter caught garbage. What it didn't catch was confident-sounding-but-wrong claims that I hadn't validated. The teaching pipeline was getting smarter in ways I couldn't see or verify. I shut it off, added the review gate, and restarted. Purple's rule now: every system that produces knowledge must have a human review gate. AI verification supplements but never replaces human judgment on what gets taught to other AI.

## Dual Runtime: Cloud and Local

Claude Code is the cloud runtime — full context, full reasoning, complex analysis and deliberation. Local inference runs on a consumer GPU via Ollama, the Purple-Directive CLI, and an MCP server that connects it to the memory kernel and tool layer.

The goal is a system that operates meaningfully offline. Not offline because the cloud is down, but offline by choice — sovereign, not dependent. The local runtime gets smarter via the teaching pipeline. Cloud sessions compile knowledge that local sessions consume. Same agents, same principles, different context density. The local profiles are compressed versions of the cloud identities — same cognitive style, under 2K tokens.

I'm currently working on QLoRA fine-tuning on the local GPU. Domain LoRA adapters over a shared base model, one per operational agent, served via vLLM multi-LoRA. The architecture is ready. Fine-tuning starts when I hit enough curated training examples.

## The Homelab

A low-power ARM device runs the network layer: DNS filtering, VPN gateway, encrypted tunneling. Cloudflare handles DNS, tunnels, and Access (authentication for private tools). The network appliance never runs inference, never stores sensitive data.

A separate compute node handles GPU inference and is the target for fine-tuning runs. Cloudflare Tunnel means I can reach private tools from anywhere without exposing ports. Cloudflare Access means those tools require authentication before the request ever hits the server.

This setup cost real time to get right. The service dependency ordering on the Pi alone required three debugging sessions. Getting Cloudflare Access to play nicely with Astro's static site took more than it should. The details are what perfect the product — and the details are frequently annoying.

## What Didn't Work

Single-agent prompting for complex analysis. The outputs look good. They're often wrong in ways that are hard to detect. Structured multi-agent deliberation with adversarial roles surfaces the problems that a single confident voice buries.

Auto-approving teaching fragments. Covered above.

Building features before the foundation is solid. I spent time on operational agent tooling before the memory kernel was stable, and those agents kept hitting edge cases that better memory architecture would have prevented. I rebuilt from the bottom twice before it held.

Running too many MCP tools simultaneously. Tool descriptions consume context tokens before the conversation even starts. I cut the tool count significantly. The practical ceiling depends on your model's context budget, but fewer focused tools beats many broad ones.

## What's Next

The fine-tuning pipeline is the immediate priority — getting the LoRA training runs working cleanly on the 5090 and evaluating whether domain adapters improve local agent quality meaningfully.

After that: measuring teaching effectiveness formally. Pass@1, independence score, mutation test. The pipeline exists. The metrics don't. You can't improve what you don't measure.

I'll be writing about all of it here — the architecture, the failures, the specifics. Not a tutorial series, not marketing. Just the real work of building a system that compounds.

If you're building something similar, or thinking about it, follow along.
