# Prasadh Pathiraja — Portfolio

Immersive WebGL portfolio built with Next.js, Three.js, and Tailwind CSS.

## Highlights

- **Morphing GPU particle field** — a single full-screen WebGL canvas with ~26k particles that morph between five formations as you scroll: spiral galaxy → DNA helix → rolling wave field → Fibonacci sphere → trefoil knot, one per section.
- **Procedural nebula backdrop** — FBM noise shader with a starfield, its hues shifting with scroll progress (cyan → violet → fuchsia → amber → emerald).
- **Scroll choreography** — Lenis smooth scrolling drives formation morphs; camera parallax and particle repulsion follow the pointer.
- **Cosmic aurora theme** — glassmorphism panels, animated gradient borders, letter-cascade hero, custom glow cursor, and scroll progress bar.
- Respects `prefers-reduced-motion` (static render, no cascades) and drops particle counts on mobile.

## Getting started

```bash
npm install
npm run dev
```

Set `RESEND_API_KEY` in `.env.local` for the contact form.
