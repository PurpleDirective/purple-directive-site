# purpledirective.com

Source for [purpledirective.com](https://purpledirective.com) — clinical research SOPs, CTMS, and consulting.

## Stack

- **Astro 5** — static site generator
- **Vanilla CSS** — no frameworks
- **Cloudflare Pages** — hosting and CDN
- Auto-deploys on push to `main`

## Pages

- **/** — Landing page
- **/about** — Background and team
- **/blog** — Clinical research and technical writing
- **/shop** — SOP bundle purchase

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
tags: ["clinical-research", "sops"]
---

Post content here.
```

## License

Proprietary. See [LICENSE](LICENSE).
