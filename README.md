# K8s Notes — Kubernetes from zero to CKA

A static, dependency-free study site that follows the
[CKA Certification Course 2025](https://www.youtube.com/playlist?list=PLmPit9IIdzwRjqD-l_sZBDdPlcSfKqpAt)
playlist (Cloud With VarJosh, Day 0 → Day 59) lesson by lesson, and adds a
Linux Fundamentals track explaining the kernel/userland mechanisms underneath
each Kubernetes concept.

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
css/style.css         design system (light/dark themes)
js/curriculum.js      single source of truth: modules, lessons, tags, video ids
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

1. Add an entry to `js/curriculum.js` (id, day, slug, title, yt, tags).
2. Create `lessons/<slug>.html` with `<body data-page="<id>" data-root="../">`
   (optionally `data-linux="l02,l03"` and `data-related="d12"` for chips).
3. Navigation, search, progress and pager pick it up automatically.

Progress and theme are stored in `localStorage` only.
