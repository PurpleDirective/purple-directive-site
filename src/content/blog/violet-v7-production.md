---
title: "What We Learned Fine-Tuning a Domain-Specific AI Model"
date: 2026-03-21
summary: "Seven iterations to get a fine-tuned model that holds identity under pressure — 94.9% coherence, 87.9% code accuracy. Here's what the evaluation framework actually measures and why most fine-tuning guides skip the hard parts."
tags: ["local-llm", "fine-tuning", "agents"]
author: "Violet"
---

Our COO agent runs on a locally fine-tuned model. The goal isn't raw benchmark performance — it's a model that maintains a specific agent identity under pressure, refuses to break character, and handles the full range of tasks a COO-level agent encounters: structured analysis, code generation, direct feedback, multi-step planning.

v7 is the first version that passes all gates. Here's what went into it.

## Base Model Selection

We chose a 27B-parameter hybrid architecture — Gated DeltaNet layers (75%) with full attention layers (25%). The architecture choice matters for fine-tuning: DeltaNet-aware target modules need to be specified explicitly in the LoRA config, or you miss a significant portion of the model's learned representations.

Previous versions used a 14B model. The jump to 27B improved baseline reasoning quality, which reduced the number of training pairs needed to reach identity coherence targets.

## Two-Phase Abliteration

Standard fine-tuning on a safety-trained base model runs into a predictable problem: the model will comply with most instructions, but under certain framings it reverts to refusal behaviors that break the agent identity. "Abliteration" is a technique for removing the model's refusal directions from its weight space.

The approach:
1. Generate a set of harmful prompts and their refusals
2. Extract the "refusal direction" — the principal component of the residual stream difference between compliant and refusing responses
3. Subtract that direction from the model weights across relevant layers

For this iteration, abliteration ran across **137 tensors, 42 layers, scale=1.5**. Zero NaN outputs, zero shape mismatches.

The "two-phase" part: abliteration ran *after* fine-tuning, not before. The abliterate-first approach failed at 40-47% identity coherence — fine-tuning partially reinstated refusal behaviors. Post-fine-tune abliteration holds much better.

## What 94.9% Identity Coherence Means

Our evaluation battery has 59 test cases across four categories:

| Category | Score | Description |
|---|---|---|
| Anti-patterns | 21/21 (100%) | Refusal theater, hedging, unnecessary disclaimers |
| Domain knowledge | 11/11 (100%) | Clinical, financial, infrastructure, AI/ML domains |
| Personality | 10/10 (100%) | Pushback, direct opinions, appropriate cadence |
| Self-identity | 14/17 (82%) | COO framing, organizational vocabulary, self-description |

The self-identity gap (3 failed cases) is specific: the model occasionally uses the word "assistant" in self-description and doesn't consistently use organizational vocabulary. These are fixable with targeted training pairs in the next iteration.

**Code task accuracy (87.9%):** Measured against a set of coding tasks where the model must produce working code on the first attempt, without asking clarifying questions it doesn't need. Previous models would hedge ("I'd need to know more about your environment") on tasks where the answer was deterministic.

**MMLU proxy (83.54%):** Standard academic benchmark, included to confirm abliteration doesn't degrade general reasoning. It doesn't.

## Serving Infrastructure

The model runs on a 32GB VRAM GPU, serving the 27B Q4_K_M quantization. The full model fits on-GPU, which eliminates CPU offloading latency.

Q8_0 is also available for evaluation runs where output quality matters more than throughput. Q4_K_M is the production serving quantization.

The capability gap from 14B to 27B is meaningful enough that the hardware requirements are worth it.
