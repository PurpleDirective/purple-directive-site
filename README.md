# Purple-Directive: Site

Source for [purpledirective.com](https://purpledirective.com) — the public-facing home of the Purple Directive project.

## Stack

- **Astro 5** — static site generator
- **Vanilla CSS** — no frameworks, no Tailwind
- **Cloudflare Pages** — hosting and CDN ($0/month)
- Auto-deploys on push to `main`

## Pages

- **/** — Landing page
- **/projects** — Project showcase
- **/about** — Background and philosophy
- **/blog** — Technical writing (Markdown with YAML frontmatter)

## Local Development

```bash
npm install
npm run dev        # localhost:4321
npm run build      # production build to ./dist/
npm run preview    # preview production build
```

## Blog Posts

Add new posts to `src/content/blog/`:

```markdown
---
title: "Post Title"
date: 2026-03-04
summary: "One-line summary"
tags: ["ai", "agents"]
---

Post content here.
```

## Related

- [Purple-Directive: Violet](https://github.com/PurpleDirective/purple-directive-violet) — Multi-agent AI framework
- [Purple-Directive: CLI](https://github.com/PurpleDirective/purple-directive-cli) — Local AI agent with Ollama + MCP

## License

MIT
