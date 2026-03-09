---
title: "Separating inference from services: the case for a dedicated always-on node"
date: 2026-03-04
summary: "Running AI inference and web services on the same machine is convenient until it isn't. A cheap low-power node running 24/7 handles tunnels, mail, and monitoring — freeing the GPU machine for actual inference work."
tags: ["infrastructure", "self-hosted", "homelab"]
---

The original setup was simple: one GPU machine running everything. Ollama for inference, Docker for web services, Cloudflare tunnel for external access. It worked until I needed to reboot the machine for a driver update and everything went offline at once.

The fix was separating concerns at the hardware level.

## The problem with a single node

A GPU inference server is not always-on infrastructure. It gets rebooted for CUDA driver updates, kernel upgrades, and training runs that require a clean environment. When it goes down, anything running on it goes down — including the Cloudflare tunnel connector, which means external access to everything goes down.

This is the wrong failure mode. Web services and tunnel endpoints should have significantly higher uptime than a GPU workstation.

## The dedicated always-on node

I repurposed a low-power ARM machine as a dedicated service node. Its job:

- **Cloudflare tunnel connector** — single point of external access, stays up regardless of what the GPU machine is doing
- **Postfix** — mail transport agent for system alerts and notifications
- **Monitoring** — lightweight health checks against all other services

The machine draws minimal power, generates no noise, and runs a stripped-down Linux install with nothing on it that isn't explicitly needed. No GPU, no inference stack, no development tools.

## What this fixed

**Tunnel stability:** The previous setup had a broken secondary connector on a Raspberry Pi that was causing intermittent 502 errors — services were binding to localhost, the Pi was connecting via Tailscale IP, and half of requests were hitting the dead connector. Consolidating to a single always-on connector on dedicated hardware eliminated this entirely.

**Reboot independence:** The GPU machine can be rebooted, reimaged, or taken offline for training runs without affecting external service availability. The tunnel stays up. Mail keeps flowing. The dashboard stays accessible.

**Cleaner separation of concerns:** Inference machines should be optimized for inference. Putting long-running services on them is a form of coupling that makes both worse.

## Current topology

```
Internet
│
└── Cloudflare Edge
      │
      └── Cloudflare Tunnel → Always-On Node (24/7, low-power)
                                    │
                                    └── Tailscale mesh → GPU Server (services + inference)
```

External traffic hits Cloudflare, routes through the tunnel to the always-on node, which forwards it via Tailscale to the actual service on the GPU machine. The always-on node is the only machine with an outbound tunnel connection — everything else is on the mesh.

## Cost

The always-on node runs at under 5W idle. At current electricity rates that's roughly $4/year to keep it running. The engineering time to set it up was a few hours. The operational benefit — eliminating the single point of failure from a machine that wasn't designed to be always-on — is worth it immediately.

If you're self-hosting AI inference and haven't separated your tunnel/service layer from your compute layer yet, it's worth doing before you need to.
