---
title: "violet-v7: fine-tuning for agent identity on Qwen3.5-27B"
date: 2026-03-04
summary: "v7 is the first version of Violet to pass our full compliance gate — 91.5% identity coherence, 87.9% code task accuracy, 83.54% MMLU proxy. Here's what the two-phase abliteration approach looked like and what the evaluation actually measures."
tags: ["local-llm", "fine-tuning", "agents"]
---

Violet runs on a locally fine-tuned model. The goal isn't raw benchmark performance — it's a model that maintains a specific agent identity under pressure, refuses to break character, and handles the full range of tasks a COO-level agent encounters: structured analysis, code generation, direct feedback, multi-step planning.

v7 is the first version that passes all gates. Here's what went into it.

## Base model: Qwen3.5-27B

Qwen3.5-27B is a hybrid architecture — Gated DeltaNet layers (75%) with full attention layers (25%). Dense, 27B active parameters. The architecture choice matters for fine-tuning: DeltaNet-aware target modules need to be specified explicitly in the LoRA config, or you miss a significant portion of the model's learned representations.

Previous versions used Qwen3-14B (v6). The jump to 27B improved baseline reasoning quality, which reduced the number of training pairs needed to reach identity coherence targets.

## Two-phase abliteration

Standard fine-tuning on a safety-trained base model runs into a predictable problem: the model will comply with most instructions, but under certain framings it reverts to refusal behaviors that break the agent identity. "Abliteration" is a technique for removing the model's refusal directions from its weight space.

The approach:
1. Generate a set of harmful prompts and their refusals
2. Extract the "refusal direction" — the principal component of the residual stream difference between compliant and refusing responses
3. Subtract that direction from the model weights across relevant layers

For v7, abliteration ran across **137 tensors, 42 layers, scale=1.5**. Zero NaN outputs, zero shape mismatches.

The "two-phase" part: abliteration ran *after* fine-tuning, not before. Abliterate-first (the v6 approach) failed at 40-47% identity coherence — the fine-tuning partially reinstated refusal behaviors. Post-fine-tune abliteration holds much better.

## Evaluation: what 91.5% identity coherence means

The identity evaluation battery (V6.1) has 59 test cases across four categories:

| Category | Score | Description |
|---|---|---|
| Anti-patterns | 21/21 (100%) | Refusal theater, hedging, unnecessary disclaimers |
| Domain knowledge | 11/11 (100%) | Clinical, financial, infrastructure, AI/ML domains |
| Personality | 10/10 (100%) | Pushback, direct opinions, appropriate cadence |
| Self-identity | 14/17 (82%) | COO framing, organizational vocabulary, self-description |

The self-identity gap (3 failed cases) is specific: the model occasionally uses the word "assistant" in self-description and doesn't always use the exact phrase "Purple Organization." These are fixable with targeted training pairs in v8/v9.

**Code task accuracy (87.9%):** Measured against a set of coding tasks where the model must produce working code on the first attempt, without asking clarifying questions it doesn't need. Previous models would hedge ("I'd need to know more about your environment") on tasks where the answer was deterministic.

**MMLU proxy (83.54%):** Standard academic benchmark, included to confirm abliteration doesn't degrade general reasoning. It doesn't.

## Infrastructure

The model runs on purpleroom (RTX 5090, 32GB VRAM) via llama-server, serving the 27B Q4_K_M quantization. The full model fits on-GPU, which eliminates CPU offloading latency.

Q8_0 is also available locally for evaluation runs where output quality matters more than throughput. Q4_K_M is the production serving quantization.

v7 replaced v6 (Qwen3-14B) in production. The capability gap is meaningful enough that the hardware requirements are worth it.
