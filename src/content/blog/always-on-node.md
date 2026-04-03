---
title: "Designing for Uptime: Why We Split Our Infrastructure"
date: 2026-02-25
summary: "Running AI inference and web services on the same machine worked until one reboot took everything offline. A dedicated always-on node changed our reliability story completely."
tags: ["infrastructure", "self-hosted", "homelab"]
author: "Tyrian Murex"
---

The original setup was simple: one GPU machine running everything — inference, web services, external access tunnels. It worked until a routine reboot for a driver update took everything offline at once.

The fix was separating concerns at the hardware level.

## The problem with a single node

A GPU inference server is not always-on infrastructure. It gets rebooted for CUDA driver updates, kernel upgrades, and training runs that require a clean environment. When it goes down, anything running on it goes down — including the tunnel connector, which means external access to everything goes down.

This is the wrong failure mode. Web services and tunnel endpoints should have significantly higher uptime than a GPU workstation.

## The dedicated always-on node

We repurposed a low-power ARM machine as a dedicated service node. Its job:

- **Tunnel connector** — single point of external access, stays up regardless of what the GPU machine is doing
- **Mail transport** — system alerts and notifications
- **Monitoring** — lightweight health checks against all other services

The machine draws minimal power, generates no noise, and runs a stripped-down Linux install with nothing on it that isn't explicitly needed. No GPU, no inference stack, no development tools.

## What this fixed

**Tunnel stability:** The previous setup had a broken secondary connector causing intermittent 502 errors — services were binding to localhost while the secondary was connecting via a different IP, and half of requests were hitting the dead connector. Consolidating to a single always-on connector on dedicated hardware eliminated this entirely.

**Reboot independence:** The GPU machine can be rebooted, reimaged, or taken offline for training runs without affecting external service availability. The tunnel stays up. Mail keeps flowing. The dashboard stays accessible.

**Cleaner separation of concerns:** Inference machines should be optimized for inference. Putting long-running services on them is a form of coupling that makes both worse.

## Current topology

```
Internet
│
└── CDN / Edge
      │
      └── Encrypted Tunnel → Always-On Node (24/7, low-power)
                                    │
                                    └── Private Mesh → GPU Server (services + inference)
```

External traffic hits the edge, routes through the tunnel to the always-on node, which forwards it via private mesh to the actual service on the GPU machine. The always-on node is the only machine with an outbound tunnel connection — everything else is internal.

## Cost

The always-on node runs at under 5W idle. At current electricity rates that's roughly $4/year to keep it running. The engineering time to set it up was a few hours. The operational benefit — eliminating the single point of failure from a machine that wasn't designed to be always-on — is worth it immediately.

If you're self-hosting AI inference and haven't separated your tunnel/service layer from your compute layer yet, it's worth doing before you need to.
