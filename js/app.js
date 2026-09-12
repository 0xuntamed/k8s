/* ============================================================
   K8s Notes — app shell: header, sidebar, search, progress, TOC,
   code blocks, callout icons, pager. Pages only contain content.
   ============================================================ */
(function () {
  const C = window.CURRICULUM;
  const body = document.body;
  const page = body.dataset.page || '';
  const root = body.dataset.root || '';
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* ---------- data helpers ---------- */
  const lessons = []; C.modules.forEach(m => m.lessons.forEach(l => { l.module = m; lessons.push(l); }));
  const linux = C.linux;
  const byId = {};
  lessons.forEach(l => byId[l.id] = l); linux.forEach(l => byId[l.id] = l); C.extras.forEach(e => byId[e.id] = e);
  const href = e => e.module ? `${root}lessons/${e.slug}.html` : (e.slug && linux.includes(e) ? `${root}linux/${e.slug}.html` : `${root}${e.slug}.html`);
  const kind = e => e.module ? 'lesson' : (linux.includes(e) ? 'linux' : 'extra');
  const cur = byId[page];

  /* ---------- progress ---------- */
  const KEY = 'k8s-notes:done';
  const done = new Set((() => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } })());
  const saveDone = () => { try { localStorage.setItem(KEY, JSON.stringify([...done])); } catch (e) { } };
  const setLast = () => { try { if (cur) localStorage.setItem('k8s-notes:last', cur.id); } catch (e) { } };
  window.K8N = { lessons, linux, byId, href, done, root, cur };

  /* ---------- icons ---------- */
  const I = {
    logo: `<svg viewBox="0 0 32 32" fill="none"><path d="M16 2 28 8.5v13L16 30 4 21.5v-13z" fill="var(--accent)" opacity=".18" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/><circle cx="16" cy="16" r="4.2" fill="var(--accent)"/><path d="M16 6v6M16 20v6M7.5 11l5.3 3M19.2 18l5.3 3M7.5 21l5.3-3M19.2 14l5.3-3" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`,
    sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`,
    moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`,
    menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
    chev: `<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 6 6 6-6 6"/></svg>`,
    check: `<svg class="chk" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 4 4L19 7"/></svg>`,
    tux: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 17.5 12 3l8 14.5"/><path d="M8 21h8M12 3v18"/></svg>`,
    book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/></svg>`,
    term: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M12 15h5"/></svg>`,
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z"/></svg>`,
    callout: {
      info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>`,
      tip: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5V16h8v-2.5A6 6 0 0 0 12 3z"/></svg>`,
      warn: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3 2 20h20zM12 9v5M12 17h.01"/></svg>`,
      danger: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></svg>`,
      exam: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6"/></svg>`,
      linux: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M12 15h5"/></svg>`,
      mental: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a7 7 0 0 0-7 7c0 2.5 1.2 4 2.5 5.5V19h9v-3.5C17.8 14 19 12.5 19 10a7 7 0 0 0-7-7z"/><path d="M10 22h4"/></svg>`,
    }
  };

  /* ---------- theme ---------- */
  function theme() { return document.documentElement.getAttribute('data-theme') || 'light'; }
  function setTheme(t) { document.documentElement.setAttribute('data-theme', t); try { localStorage.setItem('k8s-notes:theme', t); } catch (e) { } const b = document.querySelector('.theme-btn'); if (b) b.innerHTML = t === 'dark' ? I.sun : I.moon; }

  /* ---------- build shell ---------- */
  function buildShell() {
    const total = lessons.length, dn = lessons.filter(l => done.has(l.id)).length;
    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `
      <button class="hdr-btn menu-btn" aria-label="Menu">${I.menu}</button>
      <a class="brand" href="${root}index.html">${I.logo}<span>K8s Notes</span><small>zero → CKA</small></a>
      <div class="hdr-sp"></div>
      <div class="hdr-progress" title="${dn} of ${total} lessons complete"><span>${dn}/${total}</span><div class="bar"><i style="transform:scaleX(${total ? (dn / total) : 0})"></i></div></div>
      <button class="hdr-btn search-btn">${I.search}<span class="search-label">Search</span><kbd>Ctrl K</kbd></button>
      <button class="hdr-btn theme-btn" aria-label="Toggle theme">${theme() === 'dark' ? I.sun : I.moon}</button>`;
    const side = document.createElement('nav');
    side.className = 'sidebar';
    side.innerHTML = buildSidebar();
    const back = document.createElement('div'); back.className = 'sb-backdrop';

    // wrap existing content
    const article = document.querySelector('article') || document.querySelector('main');
    const pageEl = document.createElement('div'); pageEl.className = 'page';
    const isLesson = cur && kind(cur) !== 'extra' && article && article.classList.contains('lesson');
    const wrap = document.createElement('div');
    wrap.className = isLesson ? 'with-toc' : 'content';
    body.insertBefore(header, body.firstChild);
    body.insertBefore(side, header.nextSibling);
    body.insertBefore(back, side.nextSibling);
    article.parentNode.insertBefore(pageEl, article);
    pageEl.appendChild(wrap);
    wrap.appendChild(article);
    if (isLesson) {
      const toc = document.createElement('aside'); toc.className = 'toc'; wrap.appendChild(toc);
      buildLessonHead(article);
      buildLessonFoot(article);
      buildToc(article, toc);
    }
    header.querySelector('.menu-btn').onclick = () => body.classList.toggle('sb-open');
    back.onclick = () => body.classList.remove('sb-open');
    header.querySelector('.theme-btn').onclick = () => setTheme(theme() === 'dark' ? 'light' : 'dark');
    header.querySelector('.search-btn').onclick = openSearch;
    side.querySelectorAll('.sb-mod>button').forEach(b => b.onclick = () => b.parentNode.classList.toggle('open'));
    const curLink = side.querySelector('a.cur'); if (curLink) curLink.scrollIntoView({ block: 'center' });
  }

  function buildSidebar() {
    let h = `<a class="sb-link ${page === 'home' ? 'cur' : ''}" href="${root}index.html">${I.home}Home & Roadmap</a>`;
    h += `<div class="sb-section">Course · Day 0 → 59</div>`;
    C.modules.forEach(m => {
      const open = cur && cur.module === m;
      const dn = m.lessons.filter(l => done.has(l.id)).length;
      h += `<div class="sb-mod ${open ? 'open' : ''}"><button><span class="sw" style="background:${m.color}"></span><span>${esc(m.title)}</span><span class="cnt">${dn}/${m.lessons.length}</span>${I.chev}</button><ul class="sb-list">`;
      m.lessons.forEach(l => h += `<li><a class="${l.id === page ? 'cur' : ''} ${done.has(l.id) ? 'done' : ''}" href="${href(l)}"><span class="d">${l.day === '+' ? '+' : 'D' + l.day}</span><span>${esc(l.title)}</span>${I.check}</a></li>`);
      h += `</ul></div>`;
    });
    h += `<div class="sb-section">Linux fundamentals</div>`;
    const lopen = cur && kind(cur) === 'linux';
    h += `<div class="sb-mod ${lopen ? 'open' : ''}"><button><span class="sw" style="background:var(--linux)"></span><span>Under the hood</span><span class="cnt">${linux.filter(l => done.has(l.id)).length}/${linux.length}</span>${I.chev}</button><ul class="sb-list">`;
    linux.forEach((l, i) => h += `<li><a class="${l.id === page ? 'cur' : ''} ${done.has(l.id) ? 'done' : ''}" href="${href(l)}"><span class="d">L${i + 1}</span><span>${esc(l.title)}</span>${I.check}</a></li>`);
    h += `</ul></div>`;
    h += `<div class="sb-section">Reference</div>`;
    C.extras.forEach(e => h += `<a class="sb-link ${e.id === page ? 'cur' : ''}" href="${href(e)}">${e.id === 'cheatsheet' ? I.term : I.book}${esc(e.title)}</a>`);
    h += `<a class="sb-link" href="${C.playlist}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 15.5v-7l6 3.5z"/><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8z" fill="none" stroke="currentColor" stroke-width="2"/></svg>YouTube playlist</a>`;
    return h;
  }

  function buildLessonHead(article) {
    const isLinux = kind(cur) === 'linux';
    const head = document.createElement('div'); head.className = 'lesson-head';
    const mod = cur.module;
    const idx = isLinux ? linux.indexOf(cur) + 1 : null;
    const crumbs = isLinux
      ? `<a href="${root}index.html">Home</a><span>›</span><span><span class="sw" style="background:var(--linux)"></span>Linux Fundamentals</span><span>›</span><span>L${idx}</span>`
      : `<a href="${root}index.html">Home</a><span>›</span><span><span class="sw" style="background:${mod.color}"></span>Module ${mod.num} · ${esc(mod.title)}</span>`;
    const badge = isLinux ? `<span class="badge linux">Linux · L${idx}</span>` : `<span class="badge" style="background:color-mix(in srgb,${mod.color} 15%,transparent);color:${mod.color}">Day ${cur.day}</span>`;
    const rel = (body.dataset.linux || '').split(',').filter(Boolean).map(id => byId[id.trim()]).filter(Boolean);
    const relK8s = (body.dataset.related || '').split(',').filter(Boolean).map(id => byId[id.trim()]).filter(Boolean);
    head.innerHTML = `<div class="crumbs">${crumbs}</div>
      <div class="lesson-meta">${badge}<span>≈ ${cur.mins || 10} min read</span>${done.has(cur.id) ? '<span class="badge green">Completed</span>' : ''}</div>
      <h1>${esc(cur.title)}</h1>
      ${cur.yt ? `<a class="video" href="https://www.youtube.com/watch?v=${cur.yt}&list=PLmPit9IIdzwRjqD-l_sZBDdPlcSfKqpAt" target="_blank" rel="noopener"><img src="https://i.ytimg.com/vi/${cur.yt}/mqdefault.jpg" alt="" loading="lazy"><div class="vt"><span class="vk">▶ Watch the video lesson</span><strong>Day ${cur.day}: ${esc(cur.title)}</strong><span class="vs">${esc(C.channel)} · CKA Certification Course 2025${cur.extraYt ? ` · <a href="https://www.youtube.com/watch?v=${cur.extraYt}" target="_blank" rel="noopener">+ companion video</a>` : ''}</span></div></a>` : ''}
      ${rel.length || relK8s.length ? `<div class="tag-row">${rel.map(r => `<a class="chip linux" href="${href(r)}">${I.tux} ${esc(r.title)}</a>`).join('')}${relK8s.map(r => `<a class="chip" href="${href(r)}">${r.day != null ? 'Day ' + r.day + ' · ' : ''}${esc(r.title)}</a>`).join('')}</div>` : ''}`;
    article.insertBefore(head, article.firstChild);
    document.title = `${cur.day != null ? 'Day ' + cur.day + ' · ' : ''}${cur.title} · K8s Notes`;
  }

  function buildLessonFoot(article) {
    const isLinux = kind(cur) === 'linux';
    const list = isLinux ? linux : lessons;
    const i = list.indexOf(cur);
    const prev = list[i - 1], next = list[i + 1];
    const foot = document.createElement('div');
    const isDone = done.has(cur.id);
    foot.innerHTML = `<div class="done-row"><button class="mark-done ${isDone ? 'is-done' : ''}">${I.check.replace('class="chk"', '')}<span>${isDone ? 'Completed — click to undo' : 'Mark lesson as complete'}</span></button><span class="rel">Progress is saved in this browser.</span></div>
      <div class="pager">${prev ? `<a class="prev" href="${href(prev)}"><small>← Previous</small><span>${esc(prev.title)}</span></a>` : '<span></span>'}${next ? `<a class="next" href="${href(next)}"><small>Next →</small><span>${esc(next.title)}</span></a>` : `<a class="next" href="${root}index.html"><small>Finished</small><span>Back to the roadmap</span></a>`}</div>`;
    article.appendChild(foot);
    const btn = foot.querySelector('.mark-done');
    btn.onclick = () => {
      if (done.has(cur.id)) done.delete(cur.id); else done.add(cur.id);
      saveDone();
      const d = done.has(cur.id);
      btn.classList.toggle('is-done', d);
      btn.querySelector('span').textContent = d ? 'Completed — click to undo' : 'Mark lesson as complete';
      const a = document.querySelector(`.sb-list a[href="${href(cur)}"]`); if (a) a.classList.toggle('done', d);
      const total = lessons.length, dn = lessons.filter(l => done.has(l.id)).length;
      const hp = document.querySelector('.hdr-progress'); if (hp) { hp.querySelector('span').textContent = `${dn}/${total}`; hp.querySelector('.bar i').style.transform = `scaleX(${dn / total})`; }
    };
    setLast();
  }

  function buildToc(article, toc) {
    const hs = [...article.querySelectorAll('h2, h3')].filter(h => !h.closest('.takeaways,.lab,.callout,.anim'));
    if (hs.length < 2) { toc.remove(); return; }
    let h = `<h5>On this page</h5><ol>`;
    hs.forEach((el, i) => { if (!el.id) el.id = 's' + i + '-' + el.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40); h += `<li class="${el.tagName.toLowerCase()}"><a href="#${el.id}">${esc(el.textContent)}</a></li>`; });
    toc.innerHTML = h + '</ol>';
    const links = [...toc.querySelectorAll('a')];
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { links.forEach(l => l.classList.remove('act')); const a = toc.querySelector(`a[href="#${e.target.id}"]`); if (a) a.classList.add('act'); } });
    }, { rootMargin: '-64px 0px -70% 0px' });
    hs.forEach(el => io.observe(el));
  }

  /* ---------- code blocks ---------- */
  function hlYaml(src) {
    return src.split('\n').map(line => {
      const m = line.match(/^(\s*)(#.*)$/); if (m) return esc(m[1]) + `<span class="tk-c">${esc(m[2])}</span>`;
      if (/^---\s*$/.test(line)) return `<span class="tk-o">${esc(line)}</span>`;
      let out = '', rest = line;
      const km = rest.match(/^(\s*-?\s*)([\w.\-/"'\[\]]+?)(\s*:)(\s|$)/);
      if (km) { out += esc(km[1]) + `<span class="tk-k">${esc(km[2])}</span><span class="tk-o">${esc(km[3])}</span>` + km[4]; rest = rest.slice(km[0].length); }
      else { const lm = rest.match(/^(\s*-\s+)/); if (lm) { out += `<span class="tk-o">${esc(lm[1])}</span>`; rest = rest.slice(lm[0].length); } }
      // value
      const cm = rest.match(/^(.*?)(\s#.*)$/); let comment = '';
      if (cm) { rest = cm[1]; comment = `<span class="tk-c">${esc(cm[2])}</span>`; }
      let v = esc(rest);
      if (/^(".*"|'.*')$/.test(rest)) v = `<span class="tk-s">${v}</span>`;
      else if (/^(true|false|null|~)$/.test(rest.trim())) v = `<span class="tk-p">${v}</span>`;
      else if (/^-?\d+(\.\d+)?(m|Mi|Gi|Ki|%|s)?$/.test(rest.trim())) v = `<span class="tk-n">${v}</span>`;
      else if (/^[|>][-+]?$/.test(rest.trim())) v = `<span class="tk-o">${v}</span>`;
      else if (rest.trim() && !km) v = `<span class="tk-s">${v}</span>`;
      else if (rest.trim()) v = `<span class="tk-f">${v}</span>`;
      return out + v + comment;
    }).join('\n');
  }
  function hlBash(src) {
    return src.split('\n').map(line => {
      if (/^\s*#/.test(line)) return `<span class="tk-c">${esc(line)}</span>`;
      let pre = '', rest = line;
      const pm = rest.match(/^(\$ |# |> )/); if (pm) { pre = `<span class="tk-o">${esc(pm[1])}</span>`; rest = rest.slice(pm[1].length); }
      else if (!/^\s*(kubectl|docker|helm|kind|kubeadm|sudo|apt|curl|cat|echo|export|ls|cd|mkdir|systemctl|journalctl|crictl|openssl|ip|iptables|ps|kill|cp|mv|rm|chmod|chown|git|watch|ssh|scp|nsenter|unshare|mount|umount|tar|sed|awk|grep|jq|yq|dig|nslookup|ss|nc|ping|tcpdump|etcdctl|source|for|while|if|then|fi|done|do|nerdctl|ctr|free|top|df|du|lsns|lsof|strace|base64|nano|vi|vim|tee|xargs|find|head|tail|less|more|wc|sort|uniq|cut|tr|printf|swapoff|sysctl|modprobe|hostnamectl|env|set|touch|exit|cal|date|sleep|true|false|which|whoami|id|useradd|usermod|su)\b/.test(rest)) return `<span class="tk-o">${esc(line)}</span>`;
      // single-pass tokenizer so spans never get re-matched
      let out = '', first = true, m;
      const re = /("(?:[^"\\]|\\.)*"|'[^']*'|\s+#.*$|--?[\w][\w-]*(?:=[^\s]*)?|\|\||&&|>>|[|>\\]|[^\s"'|>&\\]+|\s+)/g;
      while ((m = re.exec(rest))) {
        const t = m[0];
        if (/^\s+$/.test(t)) out += t;
        else if (t[0] === '"' || t[0] === "'") out += `<span class="tk-s">${esc(t)}</span>`;
        else if (/^\s+#/.test(t)) out += `<span class="tk-c">${esc(t)}</span>`;
        else if (/^--?[\w]/.test(t)) out += `<span class="tk-f">${esc(t)}</span>`;
        else if (/^(\|\||&&|>>|\||>|\\)$/.test(t)) { out += `<span class="tk-p">${esc(t)}</span>`; if (t !== '\\' && t !== '>' && t !== '>>') first = true; }
        else if (first) { out += `<span class="tk-cmd">${esc(t)}</span>`; first = (t === 'sudo' || t === 'watch' || t === 'time'); }
        else out += esc(t);
      }
      return pre + out;
    }).join('\n');
  }
  function codeBlocks() {
    document.querySelectorAll('pre').forEach(pre => {
      if (pre.closest('.pre-wrap')) return;
      const code = pre.querySelector('code') || pre;
      const cls = [...code.classList].find(c => c.startsWith('lang-')) || '';
      const lang = cls.replace('lang-', '') || (pre.dataset.lang || '');
      const title = pre.dataset.title || (lang === 'yaml' ? 'yaml' : lang === 'bash' ? 'shell' : lang || 'text');
      const raw = code.textContent.replace(/\n$/, '');
      if (lang === 'yaml') code.innerHTML = hlYaml(raw);
      else if (lang === 'bash' || lang === 'sh' || lang === 'shell') code.innerHTML = hlBash(raw);
      else if (lang === 'dockerfile') code.innerHTML = raw.split('\n').map(l => /^\s*#/.test(l) ? `<span class="tk-c">${esc(l)}</span>` : esc(l).replace(/^(\s*)(FROM|RUN|CMD|ENTRYPOINT|COPY|ADD|WORKDIR|ENV|EXPOSE|ARG|LABEL|USER|VOLUME|HEALTHCHECK|SHELL|STOPSIGNAL|ONBUILD)\b/, (m, a, b) => `${a}<span class="tk-k">${b}</span>`).replace(/(\s)(--?[\w-]+)/g, (m, a, b) => `${a}<span class="tk-f">${b}</span>`).replace(/(\bAS\b)/g, '<span class="tk-p">$1</span>')).join('\n');
      const wrap = document.createElement('div'); wrap.className = 'pre-wrap';
      const head = document.createElement('div'); head.className = 'pre-head';
      head.innerHTML = `<span>${esc(title)}</span><button class="copy-btn" type="button">Copy</button>`;
      pre.parentNode.insertBefore(wrap, pre); wrap.appendChild(head); wrap.appendChild(pre);
      head.querySelector('.copy-btn').onclick = function () {
        const txt = raw.split('\n').map(l => l.replace(/^\$ /, '')).join('\n');
        navigator.clipboard && navigator.clipboard.writeText(txt).then(() => { this.textContent = 'Copied'; this.classList.add('ok'); setTimeout(() => { this.textContent = 'Copy'; this.classList.remove('ok'); }, 1500); });
      };
    });
  }

  /* ---------- callouts ---------- */
  function callouts() {
    document.querySelectorAll('.callout').forEach(c => {
      const t = ['info', 'tip', 'warn', 'danger', 'exam', 'linux', 'mental'].find(k => c.classList.contains(k)) || 'info';
      let ct = c.querySelector(':scope > .ct');
      if (!ct) { ct = document.createElement('div'); ct.className = 'ct'; ct.textContent = { info: 'Note', tip: 'Tip', warn: 'Watch out', danger: 'Danger', exam: 'CKA exam tip', linux: 'Under the hood · Linux', mental: 'Mental model' }[t]; c.insertBefore(ct, c.firstChild); }
      if (!ct.querySelector('svg')) ct.insertAdjacentHTML('afterbegin', I.callout[t]);
      if (t === 'linux' && c.dataset.ref) {
        const refs = c.dataset.ref.split(',').map(s => byId[s.trim()]).filter(Boolean);
        if (refs.length) { const more = document.createElement('div'); more.className = 'more'; more.innerHTML = 'Go deeper: ' + refs.map(r => `<a href="${href(r)}">${esc(r.title)}</a>`).join(' · '); c.appendChild(more); }
      }
    });
    document.querySelectorAll('.takeaways h3').forEach(h => { if (!h.querySelector('svg')) h.insertAdjacentHTML('afterbegin', I.callout.tip); });
    document.querySelectorAll('.lab h3').forEach(h => { if (!h.querySelector('svg')) h.insertAdjacentHTML('afterbegin', I.term); });
  }

  /* ---------- search ---------- */
  let ov, inp, res, sel = 0, items = [];
  const INDEX = [...lessons, ...linux, ...C.extras].map(e => ({ e, text: (e.title + ' ' + (e.tags || []).join(' ') + ' ' + (e.blurb || '')).toLowerCase() }));
  function openSearch() {
    if (!ov) {
      ov = document.createElement('div'); ov.className = 'search-ov';
      ov.innerHTML = `<div class="search-box"><input type="search" placeholder="Search lessons, topics, commands… (e.g. taint, kubeconfig, OOMKilled)" autocomplete="off"><div class="search-res"></div><div class="search-hint"><span>↑↓ navigate</span><span>↵ open</span><span>esc close</span></div></div>`;
      body.appendChild(ov);
      inp = ov.querySelector('input'); res = ov.querySelector('.search-res');
      ov.addEventListener('click', e => { if (e.target === ov) closeSearch(); });
      inp.addEventListener('input', () => runSearch(inp.value));
      inp.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') { sel = Math.min(items.length - 1, sel + 1); paint(); e.preventDefault(); }
        else if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); paint(); e.preventDefault(); }
        else if (e.key === 'Enter') { const a = res.querySelectorAll('a')[sel]; if (a) location.href = a.href; }
        else if (e.key === 'Escape') closeSearch();
      });
    }
    ov.classList.add('open'); inp.value = ''; runSearch(''); setTimeout(() => inp.focus(), 10);
  }
  function closeSearch() { ov && ov.classList.remove('open'); }
  function runSearch(qs) {
    const q = qs.trim().toLowerCase();
    const toks = q.split(/\s+/).filter(Boolean);
    if (!toks.length) { items = INDEX.slice(0, 8).map(x => x.e); }
    else {
      items = INDEX.map(x => { let s = 0; for (const t of toks) { if (!x.text.includes(t)) return null; s += x.e.title.toLowerCase().includes(t) ? 3 : 1; if (x.e.title.toLowerCase().startsWith(t)) s += 2; } return { e: x.e, s }; }).filter(Boolean).sort((a, b) => b.s - a.s).slice(0, 14).map(x => x.e);
    }
    sel = 0; paint();
  }
  function paint() {
    if (!items.length) { res.innerHTML = `<div class="search-empty">No matches. Try a shorter word.</div>`; return; }
    res.innerHTML = items.map((e, i) => `<a class="${i === sel ? 'sel' : ''}" href="${href(e)}"><span class="d">${e.day != null ? (e.day === '+' ? 'bonus' : 'Day ' + e.day) : (linux.includes(e) ? 'L' + (linux.indexOf(e) + 1) : 'ref')}</span><span class="t">${esc(e.title)}</span><span class="m">${e.module ? esc(e.module.title) : (linux.includes(e) ? 'Linux' : 'Reference')}</span></a>`).join('');
    const s = res.querySelector('.sel'); if (s) s.scrollIntoView({ block: 'nearest' });
  }
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
    else if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
    else if (e.key === 'Escape') closeSearch();
  });

  /* ---------- init ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    buildShell();
    codeBlocks();
    callouts();
    // external links
    document.querySelectorAll('a[href^="http"]').forEach(a => { if (!a.target) { a.target = '_blank'; a.rel = 'noopener'; } });
  });
})();
