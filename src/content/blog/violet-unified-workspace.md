---
title: "Why I merged two AI projects into one COO agent"
date: 2026-03-03
summary: "I was running two separate AI systems — one for business ops, one for personal AI. They shared the same model, the same tools, the same memory format. Merging them into a single Violet workspace was the obvious move. Here's what that looked like."
tags: ["architecture", "agents"]
---

For a while I ran two parallel AI setups: **Project Amethyst** (business operations) and **Project Sapphire** (personal AI assistant). Different agent identities, different memory files, different instruction sets — but underneath, the same model, the same MCP tools, the same memory format.

The duplication wasn't intentional. Amethyst came first. Sapphire was built alongside it when I realized I wanted the same orchestration for personal tasks. Within a few weeks I had two systems doing 80% of the same things with 20% different context.

## What the split cost

Maintaining two systems meant:

- Two sets of memory files to keep current
- Two agent prompts to update when protocols changed
- Context switching overhead — which project am I in right now?
- Decisions that crossed both domains (financial planning touches both personal and clinical) had no clean home

The final straw: I made an architecture decision in Sapphire that should have been reflected in Amethyst, and forgot. Weeks later I noticed the two systems had diverged on how they handled a shared protocol. Neither was wrong, but they weren't consistent.

## The merge

The unification was straightforward in concept, messy in execution. I consolidated:

- **61 files** updated with the unified agent identity
- Single shared memory directory (`purple-shared/`) consumed by all agents
- One E.I.K. advisory council (Evolution, Improvement, Keenness) serving all domains
- Domain separation preserved through **operational agents** — specialized agents that receive tasks from Violet but operate within their domain context

The key insight was that the domain boundary doesn't need to be at the COO level. Violet doesn't need to be a "business Violet" or a "personal Violet" — she needs to know which domain a task belongs to, and route it to the right operational agent. One COO. Many domains.

## Current structure

```
Human  (final authority)
│
└── Violet  (COO — single identity, all domains)
      │
      ├── E.I.K. Advisory Council
      │     ├── Evolution    — forward motion, proposals
      │     ├── Improvement  — verification, accuracy
      │     └── Keenness     — blind spots, edge cases
      │
      └── Operational Staff
            ├── Clinical ops agent
            ├── Financial agent
            ├── Infrastructure agent
            └── (domain agents as needed)
```

Memory is shared across all agents via flat markdown files. STATE.md tracks current system state. TASKBOARD.md tracks cross-domain work. DECISIONS.md is append-only — a durable record of every significant choice and its rationale.

## What changed in practice

The merge eliminated the context-switching problem entirely. A task that crosses domains — say, evaluating whether a new clinical study is financially viable — gets handled by one COO who has access to both clinical and financial context. She can route subtasks to the appropriate operational agents without losing the thread.

The shared E.I.K. council also improved deliberation quality. When Violet calls the council on a complex decision, all three advisory agents have full context across all domains. Previously, Amethyst's council didn't know what Sapphire had decided last week, and vice versa.

One system. One source of truth.
