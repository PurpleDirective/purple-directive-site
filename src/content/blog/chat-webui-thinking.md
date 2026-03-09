---
title: "Building a chat interface with real-time thinking trace rendering"
date: 2026-02-20
summary: "Open WebUI works fine, but I wanted thinking traces rendered as collapsible sections, MCP tools wired directly into the interface, and conversation history that doesn't leave the machine. Here's what I built."
tags: ["tools", "local-llm", "ui"]
---

Most local LLM frontends treat thinking traces as an afterthought — either hidden entirely or dumped as raw text before the response. For a model that does extended reasoning, that's a problem. The thinking trace is often where the interesting work happens, and being able to review it changes how you interact with the model.

I built a custom chat interface to address this. Here's what it does differently.

## Thinking trace rendering

Models that support extended thinking output a structured block before the final response. The interface detects this block and renders it as a **collapsible section** — collapsed by default so it doesn't dominate the UI, but expandable with one click when you want to see the reasoning chain.

This matters for debugging agent behavior. When the model reaches a wrong conclusion, the thinking trace usually shows exactly where the reasoning went off. Without it rendered accessibly, you're flying blind.

## WebSocket streaming

Responses stream via WebSocket in real time. The interface renders tokens as they arrive — thinking trace first (in the collapsible block), then the response. No polling, no full-page refresh, no waiting for the complete response before anything appears.

For long responses with extended thinking, this means you can start reading the final answer before the model finishes generating it, while the thinking trace continues to fill in above.

## MCP tools

The interface connects directly to the MCP (Model Context Protocol) tool server. Tools available in the agent context are also available in the chat interface — file system access, search, external API calls. The model can use them mid-conversation, and tool calls + results are displayed inline in the message thread.

This is the part that makes the chat interface feel like talking to an agent rather than a text predictor. When the model needs to look something up or run a calculation, it does — and you can see it happen.

## Local persistence

Conversation history is persisted locally — no cloud sync, no external service. History is stored in a simple JSON format on the local file system. The interface loads previous conversations from disk on startup.

This is a deliberate design choice. Conversations with an agent that has access to your infrastructure and business context shouldn't leave your machine.

## Code copy buttons

Small thing, but the interface adds one-click copy buttons to all code blocks. When the model produces a shell command or a code snippet, you shouldn't have to select it manually. The button copies the raw content (no syntax highlighting markup) to the clipboard.

## What I didn't build

I didn't build multi-user auth, plugin systems, or a model marketplace. This is a single-operator interface for a specific use case — interacting with a locally-running agent. Feature scope is intentionally narrow.

Open WebUI is a better choice if you want a general-purpose frontend with broad model support and community plugins. This interface exists because I needed specific behaviors that weren't available elsewhere without significant configuration.
