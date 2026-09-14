/* ============================================================
   Anim — a tiny step-based SVG animation engine.

   Define:   Anim.define('name', { w, h, svg, steps:[{c:'caption', ms:2500, on(q){...}}], ms, loop, title })
   Use:      <figure data-anim="name"></figure>
   Steps are cumulative: jumping to step N replays 0..N without transitions,
   stepping forward applies only the next step with CSS transitions.

   SVG helpers (Anim.S): box, text, arrow, dot, pod, node, zone, bar, icon, g
   Query helper q(sel) → .show() .hide() .to(x,y) .add(cls) .rm(cls) .set(cls) .text(str) .attr(k,v)
   ============================================================ */
(function () {
  const R = {};
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const STATE_CLS = ['hl', 'ok', 'bad', 'warn', 'pur', 'cy', 'dim', 'pulse', 'flow'];

  /* ---------- SVG builders ---------- */
  function lines(id, x, y, w, h, label, o) {
    const ls = Array.isArray(label) ? label : [label];
    const fs = o.fs || 12;
    const lh = fs * 1.3;
    const ty = y + h / 2 - ((ls.length - 1) * lh) / 2 + fs * 0.36;
    return ls.map((l, i) =>
      `<text class="lb ${o.lcls || ''} ${i > 0 && o.subcls ? o.subcls : ''}" x="${x + w / 2}" y="${(ty + i * lh).toFixed(1)}"${(i > 0 && o.subfs) || o.fs ? ` font-size="${i > 0 && o.subfs ? o.subfs : fs}"` : ''}>${esc(l)}</text>`
    ).join('');
  }
  const S = {
    box(id, x, y, w, h, label, o = {}) {
      return `<g id="${id}" class="${o.gcls || ''}"${o.hidden ? ' style="opacity:0"' : ''}><rect class="nb ${o.cls || ''}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx ?? 8}"/>${label != null ? lines(id, x, y, w, h, label, o) : ''}</g>`;
    },
    zone(id, x, y, w, h, label, o = {}) {
      return `<g id="${id}" class="${o.gcls || ''}"><rect class="zone ${o.cls || ''}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx ?? 10}"/>${label ? `<text class="lb sm muted b ${o.lcls || 'left'}" x="${o.lcls === 'right' ? x + w - 8 : x + 10}" y="${y + 16}">${esc(label)}</text>` : ''}</g>`;
    },
    text(id, x, y, str, o = {}) {
      const ls = Array.isArray(str) ? str : [str];
      const fs = o.fs || 12;
      return `<g id="${id}" class="${o.gcls || ''}">${ls.map((l, i) => `<text class="lb ${o.cls || ''}" x="${x}" y="${y + i * fs * 1.35}"${o.fs ? ` font-size="${fs}"` : ''}>${esc(l)}</text>`).join('')}</g>`;
    },
    arrow(id, x1, y1, x2, y2, o = {}) {
      const d = o.d || `M ${x1} ${y1} L ${x2} ${y2}`;
      return `<path id="${id}" class="ar ${o.cls || ''}" d="${d}"/>` + (o.label ? `<text class="lb sm muted ${o.lcls || ''}" x="${o.lx ?? (x1 + x2) / 2}" y="${o.ly ?? (y1 + y2) / 2 - 6}">${esc(o.label)}</text>` : '');
    },
    // curved arrow through a control point
    curve(id, x1, y1, cx, cy, x2, y2, o = {}) {
      return S.arrow(id, x1, y1, x2, y2, Object.assign({ d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}` }, o));
    },
    dot(id, x, y, o = {}) {
      return `<g id="${id}" class="mv ${o.gcls || ''}" style="transform:translate(${x}px,${y}px);${o.hidden ? 'opacity:0' : ''}"><circle class="pk ${o.cls || ''}" r="${o.r || 6}"/>${o.label ? `<text class="lb sm ${o.lcls || ''}" y="${o.ly ?? -11}">${esc(o.label)}</text>` : ''}</g>`;
    },
    // A small rounded "pod" token, movable via translate
    pod(id, x, y, label, o = {}) {
      const w = o.w || 58, h = o.h || 30;
      return `<g id="${id}" class="mv ${o.gcls || ''}" style="transform:translate(${x}px,${y}px);${o.hidden ? 'opacity:0' : ''}"><rect class="pod ${o.cls || ''}" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="7"/>${label ? `<text class="lb ${o.lcls || 'sm b'}" y="${o.ly ?? 4}">${esc(label)}</text>` : ''}${o.sub ? `<text class="lb xs muted" y="${h / 2 + 12}">${esc(o.sub)}</text>` : ''}</g>`;
    },
    // Node card with a title strip
    node(id, x, y, w, h, title, o = {}) {
      return `<g id="${id}" class="${o.gcls || ''}"><rect class="nb soft ${o.cls || ''}" x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/><text class="lb sm b ${o.lcls || ''}" x="${x + w / 2}" y="${y + 16}">${esc(title)}</text>${o.sub ? `<text class="lb xs muted" x="${x + w / 2}" y="${y + 29}">${esc(o.sub)}</text>` : ''}</g>`;
    },
    bar(id, x, y, w, h, o = {}) {
      return `<g id="${id}"><rect class="track" x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}"/><rect id="${id}-fill" class="bar ${o.cls || ''}" x="${x}" y="${y}" width="${o.v ?? 0}" height="${h}" rx="${h / 2}"/>${o.label ? `<text class="lb sm muted right" x="${x - 8}" y="${y + h / 2 + 4}">${esc(o.label)}</text>` : ''}</g>`;
    },
    g(id, inner, o = {}) {
      return `<g id="${id}" class="${o.cls || ''}"${o.hidden ? ' style="opacity:0"' : ''}${o.x != null ? ` style="transform:translate(${o.x}px,${o.y || 0}px)"` : ''}>${inner}</g>`;
    },
    // Terminal-ish line block
    term(id, x, y, w, h, ls, o = {}) {
      const fs = o.fs || 10.5;
      return `<g id="${id}" class="${o.gcls || ''}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" style="fill:var(--code-bg);stroke:var(--border2)"/>${ls.map((l, i) => `<text id="${id}-l${i}" class="lb left mono xs" x="${x + 10}" y="${y + 16 + i * fs * 1.45}" font-size="${fs}" style="fill:${l.startsWith('$') ? 'var(--code-text)' : 'var(--faint)'}">${esc(l)}</text>`).join('')}</g>`;
    },
    // Simple icons drawn with paths (centered at 0,0 in a movable group)
    icon(id, x, y, kind, o = {}) {
      const k = {
        user: `<circle r="6" cy="-5" class="pk ${o.cls || ''}"/><path d="M-11 12 Q0 -2 11 12 Z" class="pk ${o.cls || ''}"/>`,
        laptop: `<rect x="-13" y="-9" width="26" height="16" rx="2" class="pk ${o.cls || ''}"/><rect x="-16" y="8" width="32" height="3" rx="1" class="pk ${o.cls || ''}"/>`,
        gear: `<circle r="9" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="4 3" class="spin" style="stroke:var(--accent)"/><circle r="3" class="pk ${o.cls || ''}"/>`,
        db: `<ellipse rx="12" ry="4" cy="-8" class="pk ${o.cls || ''}"/><path d="M-12 -8 v16 a12 4 0 0 0 24 0 v-16" class="pk ${o.cls || ''}"/>`,
        lock: `<rect x="-8" y="-3" width="16" height="13" rx="2" class="pk ${o.cls || ''}"/><path d="M-5 -3 v-4 a5 5 0 0 1 10 0 v4" fill="none" stroke="var(--accent)" stroke-width="2.5"/>`,
        key: `<circle r="5" cx="-5" fill="none" stroke="var(--amber)" stroke-width="3"/><path d="M0 0 h12 v4 h-3 v-2 h-3 v2 h-3 v-2" fill="var(--amber)"/>`,
        cloud: `<path d="M-14 6 a7 7 0 0 1 2 -13 a9 9 0 0 1 17 -2 a7 7 0 0 1 2 15 Z" class="pk ${o.cls || ''}"/>`,
        globe: `<circle r="10" fill="none" stroke="var(--cyan)" stroke-width="2"/><ellipse rx="4" ry="10" fill="none" stroke="var(--cyan)" stroke-width="1.5"/><line x1="-10" y1="0" x2="10" y2="0" stroke="var(--cyan)" stroke-width="1.5"/>`,
        doc: `<path d="M-8 -11 h10 l6 6 v16 h-16 z" class="pk ${o.cls || ''}"/><path d="M2 -11 v6 h6" fill="none" stroke="var(--surface)" stroke-width="1.5"/>`,
        check: `<circle r="9" class="pk ok"/><path d="M-4 0 l3 3 l6 -6" fill="none" stroke="#fff" stroke-width="2.5"/>`,
        x: `<circle r="9" class="pk bad"/><path d="M-4 -4 l8 8 M4 -4 l-8 8" fill="none" stroke="#fff" stroke-width="2.5"/>`,
        box: `<rect x="-11" y="-11" width="22" height="22" rx="3" class="pk ${o.cls || ''}"/><path d="M-11 -4 h22 M0 -11 v22" stroke="var(--surface)" stroke-width="1.5"/>`,
        cpu: `<rect x="-9" y="-9" width="18" height="18" rx="2" class="pk ${o.cls || ''}"/><rect x="-4" y="-4" width="8" height="8" fill="var(--surface)"/>`,
        clock: `<circle r="9" fill="none" stroke="var(--amber)" stroke-width="2"/><path d="M0 -5 v5 h4" fill="none" stroke="var(--amber)" stroke-width="2"/>`,
        chip: `<rect x="-10" y="-7" width="20" height="14" rx="2" class="pk ${o.cls || ''}"/><path d="M-10 -3 h-3 M-10 3 h-3 M10 -3 h3 M10 3 h3" stroke="var(--muted)" stroke-width="1.5"/>`,
      }[kind] || '';
      return `<g id="${id}" class="mv ${o.gcls || ''}" style="transform:translate(${x}px,${y}px);${o.hidden ? 'opacity:0' : ''}">${k}${o.label ? `<text class="lb sm ${o.lcls || ''}" y="${o.ly ?? 26}">${esc(o.label)}</text>` : ''}</g>`;
    },
  };

  function defs() {
    const m = (id, fill) => `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${fill}"/></marker>`;
    return `<defs>${m('ah', 'var(--faint)')}${m('ah-hl', 'var(--accent)')}${m('ah-ok', 'var(--green)')}${m('ah-bad', 'var(--red)')}</defs>`;
  }

  /* ---------- query helper ---------- */
  function makeQ(svg) {
    const q = function (sel) {
      const els = sel instanceof Element ? [sel] : [...svg.querySelectorAll(sel)];
      const api = {
        els,
        show() { els.forEach(e => { e.classList.remove('hid'); e.style.opacity = ''; }); return api; },
        hide() { els.forEach(e => e.classList.add('hid')); return api; },
        to(x, y) { els.forEach(e => e.style.transform = `translate(${x}px,${y}px)`); return api; },
        add(...c) { els.forEach(e => e.classList.add(...c)); return api; },
        rm(...c) { els.forEach(e => e.classList.remove(...c)); return api; },
        set(...c) { els.forEach(e => { e.classList.remove(...STATE_CLS); if (c.length) e.classList.add(...c.filter(Boolean)); }); return api; },
        clear() { return api.set(); },
        text(t) { els.forEach(e => { const tx = e.tagName === 'text' ? e : e.querySelector('text'); if (tx) tx.textContent = t; }); return api; },
        attr(k, v) { els.forEach(e => e.setAttribute(k, v)); return api; },
        style(k, v) { els.forEach(e => e.style[k] = v); return api; },
        // For box/pod: recolor the shape child
        shape(...c) { els.forEach(e => { const s = e.querySelector('rect,circle,path'); if (s) { s.classList.remove(...STATE_CLS); if (c.length) s.classList.add(...c.filter(Boolean)); } }); return api; },
        width(w) { els.forEach(e => { const r = e.tagName === 'rect' ? e : e.querySelector('rect'); if (r) r.setAttribute('width', w); }); return api; },
      };
      return api;
    };
    q.clear = (sel = '.nb,.ar,.pod,.pk,.zone,.bar') => { svg.querySelectorAll(sel).forEach(e => e.classList.remove(...STATE_CLS)); return q; };
    q.svg = svg;
    return q;
  }

  /* ---------- engine ---------- */
  const ICON = {
    first: '<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>',
    prev: '<svg viewBox="0 0 24 24"><path d="M15.5 18 7 12l8.5-6z"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>',
    replay: '<svg viewBox="0 0 24 24"><path d="M12 5V2L7 6l5 4V7c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M8.5 18 17 12 8.5 6z"/></svg>',
    last: '<svg viewBox="0 0 24 24"><path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"/></svg>',
  };

  function mount(fig) {
    const spec = R[fig.dataset.anim];
    if (!spec) { fig.innerHTML = `<div class="anim-cap">Animation "${esc(fig.dataset.anim)}" not found.</div>`; return; }
    const w = spec.w || 720, h = spec.h || 360;
    fig.classList.add('anim');
    const isStatic = !spec.steps || !spec.steps.length;
    if (isStatic) fig.classList.add('anim-static');
    fig.innerHTML = `
      <div class="anim-stage"><svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(spec.title || fig.dataset.anim)}">${defs()}${spec.svg}</svg></div>
      <div class="anim-cap"><span class="anim-step"></span><span class="anim-text"></span></div>
      <div class="anim-bar">
        <button class="ab ab-first" title="First step">${ICON.first}</button>
        <button class="ab ab-prev" title="Previous step">${ICON.prev}</button>
        <button class="ab ab-play" title="Play / pause">${ICON.play}</button>
        <button class="ab ab-next" title="Next step">${ICON.next}</button>
        <button class="ab ab-last" title="Last step">${ICON.last}</button>
        <div class="anim-dots"></div>
        <span class="anim-title">${esc(spec.title || '')}</span>
      </div>`;
    if (isStatic) return;

    const stage = fig.querySelector('.anim-stage');
    const capStep = fig.querySelector('.anim-step');
    const capText = fig.querySelector('.anim-text');
    const dots = fig.querySelector('.anim-dots');
    const bPlay = fig.querySelector('.ab-play');
    const steps = spec.steps;
    const N = steps.length;
    let i = -1, playing = false, timer = null, userPaused = false, ctx = {};

    steps.forEach((_, k) => { const d = document.createElement('i'); d.title = `Step ${k + 1}`; d.addEventListener('click', () => { stop(); goTo(k); }); dots.appendChild(d); });

    function svg() { return stage.querySelector('svg'); }
    function q() { return makeQ(svg()); }
    function render(n) {
      capStep.textContent = `${n + 1}/${N}`;
      capText.innerHTML = steps[n].c || '';
      [...dots.children].forEach((d, k) => { d.classList.toggle('on', k === n); d.classList.toggle('past', k < n); });
      bPlay.innerHTML = playing ? ICON.pause : (n >= N - 1 && !spec.loop ? ICON.replay : ICON.play);
    }
    function reset() {
      const s = svg();
      s.classList.add('noanim');
      s.innerHTML = defs() + spec.svg;
      ctx = {};
      void s.getBoundingClientRect();
    }
    function goTo(n) {
      n = Math.max(0, Math.min(N - 1, n));
      if (n === i + 1) {
        steps[n].on && steps[n].on(q(), ctx);
      } else {
        reset();
        const qq = q();
        for (let k = 0; k <= n; k++) steps[k].on && steps[k].on(qq, ctx);
        void svg().getBoundingClientRect();
        requestAnimationFrame(() => svg().classList.remove('noanim'));
      }
      i = n; render(n);
    }
    function schedule() {
      clearTimeout(timer);
      const dur = steps[i].ms || spec.ms || 2600;
      timer = setTimeout(() => {
        if (!playing) return;
        if (i >= N - 1) {
          if (spec.loop === false) { stop(); return; }
          goTo(0);
        } else goTo(i + 1);
        schedule();
      }, dur);
    }
    function play() { if (i >= N - 1 && spec.loop === false) goTo(0); playing = true; render(i); schedule(); }
    function stop() { playing = false; clearTimeout(timer); render(i); }

    fig.querySelector('.ab-first').onclick = () => { stop(); goTo(0); };
    fig.querySelector('.ab-prev').onclick = () => { stop(); goTo(i - 1); };
    fig.querySelector('.ab-next').onclick = () => { stop(); goTo(i >= N - 1 ? 0 : i + 1); };
    fig.querySelector('.ab-last').onclick = () => { stop(); goTo(N - 1); };
    bPlay.onclick = () => { if (playing) { userPaused = true; stop(); } else { userPaused = false; play(); } };

    goTo(0);
    // autoplay when visible, pause when scrolled away
    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) { if (!playing && !userPaused) play(); }
        else if (playing) { playing = false; clearTimeout(timer); render(i); }
      });
    }, { threshold: 0.35 });
    io.observe(fig);
    fig._anim = { goTo, play, stop };
  }

  window.Anim = {
    define(name, spec) { R[name] = spec; },
    mountAll() { document.querySelectorAll('figure[data-anim]').forEach(mount); },
    S, esc, defs,
  };
  document.addEventListener('DOMContentLoaded', () => window.Anim.mountAll());
})();
