# K8s Notes — Kubernetes from zero to CKA

A static, dependency-free study site that follows the
[CKA Certification Course 2025](https://www.youtube.com/playlist?list=PLmPit9IIdzwRjqD-l_sZBDdPlcSfKqpAt)
playlist (Cloud With VarJosh, Day 0 → Day 59) lesson by lesson, and adds two
more tracks: **Linux Fundamentals** (the kernel/userland mechanisms underneath
each Kubernetes concept) and **CI/CD & GitOps** (GitHub Actions, Jenkins,
GitOps principles and Argo CD, ending in a pull-request-to-production pipeline).
The CI/CD pages follow these reference videos from the same channel:

- GitHub Actions — https://www.youtube.com/watch?v=U0S7ddSGaYI
- Jenkins — https://www.youtube.com/watch?v=wj8ELsJ-S5Q
- Argo CD — https://www.youtube.com/watch?v=m4lDTQwK1T8

## Run it

No build step. Either open `index.html` directly in a browser, or serve the
folder over HTTP (recommended so thumbnails/fonts behave consistently):

```bash
python -m http.server 8765
# → http://localhost:8765
```

Deploy anywhere static (GitHub Pages, Netlify, S3, nginx) by copying the folder.

## Structure

```
index.html            landing page: roadmap, tracks, progress
cheatsheet.html       kubectl cheatsheet (filterable)
glossary.html         glossary (filterable)
lessons/dNN-*.html    one page per course video (Day 0–59 + "what's next")
linux/lNN-*.html      Linux fundamentals track (L1–L10)
cicd/cNN-*.html       CI/CD & GitOps track (C1–C10)
css/style.css         design system (light/dark themes)
js/curriculum.js      single source of truth: modules, lessons, linux, cicd, tags,
                      video ids, reference links (refs)
js/app.js             shell: header, sidebar, search (Ctrl+K), progress, TOC,
                      code highlighting + copy buttons, callout icons, pager
js/anim.js            step-based SVG animation engine (Anim.define / <figure data-anim>)
js/theme.js           pre-paint theme selection
```

## Page anatomy

Each lesson is plain HTML content inside `<article class="lesson">`; `app.js`
builds everything else from `curriculum.js` at load time (breadcrumbs, badge,
video card, related-lesson chips, table of contents, prev/next, mark-complete).

Animations are defined inline at the bottom of each page:

```js
Anim.define('name', { w, h, title, svg: '<svg markup>', steps: [
  { c: 'caption HTML', ms: 2500, on(q) { q('#id').show().to(x, y).set('hl'); } },
]});
// and used with:  <figure data-anim="name"></figure>
```

Helpers in `Anim.S` (box, pod, node, zone, arrow, curve, dot, term, icon, bar,
text) generate SVG; `q(selector)` returns a small chainable API (show, hide, to,
add, rm, set, text, attr, style, shape, width). Steps are cumulative; jumping
backwards replays from the start without transitions.

## Adding a lesson

1. Add an entry to `js/curriculum.js` (id, day, slug, title, yt, tags). Linux
   pages go in the `linux` array, CI/CD pages in `cicd`; optional fields:
   `ytBy` (label under the video card), `refs: [{t, u}]` (reference-link chips).
2. Create `lessons/<slug>.html` (or `linux/…`, `cicd/…`) with
   `<body data-page="<id>" data-root="../">` (optionally `data-linux="l02,l03"`
   and `data-related="d12,c03"` for chips — ids from any track work).
3. Navigation, search, progress and pager pick it up automatically.

Callout types: `info`, `tip`, `warn`, `danger`, `exam`, `mental`, `linux`
(with `data-ref="l02"` → "Go deeper" links) and `connect` (with
`data-ref="d10,c03"` → "Revisit" links back to the lessons a page builds on).

Progress and theme are stored in `localStorage` only.
