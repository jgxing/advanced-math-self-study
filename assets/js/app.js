/* ===== 数形 · 主应用 ===== */
(function () {
'use strict';
const main = document.getElementById('main');
const sidebar = document.getElementById('sidebar');
const C = () => window.CHAPTERS;
const QZ = () => window.QUIZ;
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const plain = s => String(s == null ? '' : s)
  .replace(/\\\(|\\\)|\\\[|\\\]/g, ' ').replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1/$2')
  .replace(/\\[a-zA-Z]+/g, ' ').replace(/[{} _^$]/g, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ').trim();
/* 公式里的 < > 若原样进入 innerHTML，会被当成 HTML 标签吞掉（如 \(x_1<x_2\)、
   \(|x|<R\)），使定界符不闭合、整段公式露出源码。只实体化 TeX 定界符区间内的
   尖括号，区间外的 <strong>/<br> 等排版标签保持可用。 */
window.safeMathHtml = html => String(html == null ? '' : html)
  .replace(/\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]/g,
    seg => seg.replace(/</g, '&lt;').replace(/>/g, '&gt;'));

/* ---------- 数学公式排版 ----------
   main 是常驻 DOM 节点，每次路由切换只替换 innerHTML。因此绝不能用 data-* 标记
   记录「已排版」——那样后续视图会全部跳过排版、直接露出 LaTeX 源码。
   这里改为：每次视图重绘都排一次，并用串行队列避免并发调用 typesetPromise。 */
let mathReady = false, mathFallback = false;
let mathQueue = Promise.resolve();
function queueTypeset(root) {
  mathQueue = mathQueue.catch(() => {}).then(() => {
    if (!window.MathJax || !MathJax.typesetPromise) return;
    // 局部节点若已被后续重绘移除，退回整页兜底，避免漏排
    const target = (root && root.isConnected) ? [root] : [document.body];
    return MathJax.typesetPromise(target);
  }).catch(e => console.warn('[mathjax]', e));
}
window.addEventListener('mathjax-ready', () => {
  mathReady = true;
  if (mathFallback) {
    // 之前因加载超时降级成纯文本，MathJax 恢复后重建当前视图，把公式换回来
    mathFallback = false;
    try { render(); } catch (e) { queueTypeset(document.body); }
  } else {
    queueTypeset(document.body); // 整页兜底，覆盖 ready 之前渲染的内容
  }
});
window.typesetMath = function (root) {
  root = root || document.body;
  if (mathFallback) { fallbackMath(root); return; }
  if (!mathReady || !window.MathJax || !MathJax.typesetPromise) return; // ready 事件会整页兜底
  queueTypeset(root);
};
function tex2txt(s) {
  let o = s;
  for (let i = 0; i < 4; i++) o = o.replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)');
  const m = { alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε', theta: 'θ', lambda: 'λ', mu: 'μ', pi: 'π', rho: 'ρ', sigma: 'σ', phi: 'φ', varphi: 'φ', omega: 'ω', nabla: '∇', infty: '∞', partial: '∂', sum: 'Σ', prod: 'Π', int: '∫', iint: '∬', iiint: '∭', oint: '∮', lim: 'lim', to: '→', rightarrow: '→', leftrightarrow: '↔', le: '≤', ge: '≥', neq: '≠', approx: '≈', equiv: '≡', sim: '∼', times: '×', cdot: '·', pm: '±', mp: '∓', sqrt: '√', sin: 'sin', cos: 'cos', tan: 'tan', ln: 'ln', log: 'log', exp: 'exp', max: 'max', min: 'min', quad: ' ', qquad: ' ', cdots: '…', ldots: '…', left: '', right: '', text: '', mathrm: '', boldsymbol: '', displaystyle: '', limits: '', olimits: '', begin: '', end: '', cases: '' };
  o = o.replace(/\\sqrt\{([^{}]*)\}/g, '√($1)').replace(/\\[a-zA-Z]+/g, x => { const k = x.slice(1); return Object.prototype.hasOwnProperty.call(m, k) ? m[k] : k; });
  return o.replace(/[{}]/g, '').replace(/\\/g, '').replace(/\s+/g, ' ').trim();
}
function fallbackMath(root) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), list = [];
  while (w.nextNode()) list.push(w.currentNode);
  list.forEach(n => {
    if (!n.nodeValue || !/\\[([]/.test(n.nodeValue)) return;
    if (n.parentElement && ['SCRIPT', 'STYLE', 'CODE', 'PRE'].includes(n.parentElement.tagName)) return;
    const parts = n.nodeValue.split(/(\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\])/g);
    if (parts.length < 2) return;
    const frag = document.createDocumentFragment();
    parts.forEach(p => {
      if (/^\\\([\[]?/.test(p) && /\\\)$|\\\]$/.test(p)) {
        const s = document.createElement('span'); s.className = 'math-fallback';
        s.textContent = tex2txt(p.slice(2, -2)); frag.appendChild(s);
      } else frag.appendChild(document.createTextNode(p));
    });
    if (n.parentNode) n.parentNode.replaceChild(frag, n);
  });
}
setTimeout(() => {
  if (!mathReady) {
    mathFallback = true;
    console.warn('[math] MathJax 未能加载，已切换为纯文本公式显示');
    fallbackMath(document.body);
  }
}, 8000);

/* ---------- 通用 UI ---------- */
function toast(msg) {
  const host = document.getElementById('toastHost');
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  host.appendChild(t); setTimeout(() => t.remove(), 2600);
}
function modal(title, html) {
  const host = document.getElementById('modalHost');
  host.hidden = false;
  host.innerHTML = `<div class="modal fade-in"><button class="m-close" aria-label="关闭">×</button><h2>${title}</h2>${html}</div>`;
  const close = () => { host.hidden = true; host.innerHTML = ''; };
  host.querySelector('.m-close').addEventListener('click', close);
  host.addEventListener('click', e => { if (e.target === host) close(); }, { once: true });
  return { host, close };
}
const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7 6h10M6 8l5 8M18 8l-5 8"/></svg>',
  quiz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 4h14v16H5zM8 9h8M8 13h8M8 17h4"/></svg>',
  wrong: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>',
  formula: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 4h12v16H6z"/><path d="M9 9h6M9 13h6M9 17h3"/></svg>',
  plan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 15h3"/></svg>'
};

/* ---------- 侧栏 ---------- */
function renderSidebar(route) {
  const st = Store.stats(), total = C().length;
  const item = (href, icon, label, active, badge) => `<a class="nav-item ${active ? 'active' : ''}" href="${href}"><span class="ni">${icon}</span><span>${label}</span>${badge ? `<span class="badge">${badge}</span>` : ''}</a>`;
  const chapters = C().map(c => {
    const done = !!Store.get().finished[c.id], ratio = Store.readRatio(c.id);
    return `<a class="nav-item nav-ch ${route === 'chapter/' + c.id ? 'active' : ''} ${done ? 'done' : ''}" href="#/chapter/${c.id}">
      <span class="ch-dot" style="background:${done ? 'var(--accent)' : ratio > 0 ? c.color : 'var(--border-strong)'}"></span>
      <span>${c.no}. ${c.title}</span><span class="badge">${Math.round(ratio * 100)}%</span></a>`;
  }).join('');
  sidebar.querySelector('nav').innerHTML = `
    <div class="nav-label">学习空间</div>
    ${item('#/home', ICONS.home, '学习总览', route === 'home')}
    ${item('#/map', ICONS.map, '知识地图', route === 'map')}
    <div class="nav-label">课程内容 · ${total} 章</div>
    ${chapters}
    <div class="nav-label">练习与工具</div>
    ${item('#/practice', ICONS.quiz, '练习中心', route === 'practice')}
    ${item('#/wrong', ICONS.wrong, '错题本', route === 'wrong', st.wrong || '')}
    ${item('#/formulas', ICONS.formula, '公式速查', route === 'formulas')}
    ${item('#/plan', ICONS.plan, '学习计划', route === 'plan')}`;
  const pct = Math.round((Store.chapterDone() / total * .5 + C().reduce((s, c) => s + Store.readRatio(c.id), 0) / total * .3 + Math.min(1, st.total / QZ().length) * .2) * 100);
  document.getElementById('sideProgressBar').style.width = pct + '%';
  document.getElementById('sideProgressText').textContent = pct + '%';
  document.getElementById('streakText').textContent = Store.streak() + ' 天';
  return pct;
}

/* ---------- 页面：学习总览 ---------- */
function viewHome() {
  const st = Store.stats(), pct = renderSidebar('home');
  const chapters = C().map(c => {
    const ratio = Store.readRatio(c.id), done = !!Store.get().finished[c.id];
    return `<a class="ch-card" href="#/chapter/${c.id}" style="--ch-color:${c.color}">
      ${done ? '<span class="ch-flag">✓</span>' : ''}
      <div class="ch-no">CHAPTER ${String(c.no).padStart(2, '0')}</div>
      <h3>${c.title}</h3><div class="ch-en">${c.en}</div>
      <div class="ch-meta"><span class="pill" style="font-size:10px;padding:1px 7px">${c.level}</span><span>${c.sections.length} 节 · ${c.hours} 课时</span></div>
      <div class="ch-line"><i style="width:${Math.round(ratio * 100)}%"></i></div>
    </a>`;
  }).join('');
  const stages = [
    ['第一阶段 · 基础语言', '函数与极限 → 导数与微分', 'ch1'],
    ['第二阶段 · 一元微分', '中值定理、泰勒与导数应用', 'ch3'],
    ['第三阶段 · 一元积分', '不定积分、定积分与应用、微分方程', 'ch5'],
    ['第四阶段 · 多元与级数', '多元微分、重积分、场论与级数', 'ch9'],
  ];
  const doneCount = Store.chapterDone();
  return `<div class="wrap wrap-wide">
    <section class="hero fade-in">
      <svg class="hero-deco" viewBox="0 0 290 150" aria-hidden="true">
        <path d="M0 130 C40 130 60 30 100 30 S170 130 210 130 S270 60 290 60" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2.4"/>
        <path d="M0 130 C40 130 60 30 100 30 S170 130 210 130 S270 60 290 60 V150 H0Z" fill="rgba(255,255,255,.07)"/>
        <circle cx="100" cy="30" r="4.5" fill="#ffd166"/><circle cx="210" cy="130" r="4.5" fill="#ffd166"/>
      </svg>
      <div class="hero-inner">
        <div class="eyebrow">Interactive Calculus · 交互式高等数学</div>
        <h1>让每一个数学概念，都看得见</h1>
        <p>12 章完整知识体系 · 25 个可拖动的动态演示 · 62 道即时解析练习。不只是读定义，而是亲手把 ε 缩小、把 n 加大、把割线拖成切线，看见极限真正发生。</p>
        <div class="hero-actions">
          <a class="btn btn-light" href="#/chapter/ch1">从第 1 章开始学 →</a>
          <a class="btn btn-outline" href="#/map">浏览知识地图</a>
        </div>
      </div>
    </section>

    <div class="stat-row">
      <div class="stat-card card"><div class="stat-ico" style="background:var(--primary-weak);color:var(--primary)">∫</div><div><div class="num">${doneCount}<span style="font-size:14px;color:var(--text-3)"> / 12</span></div><div class="lbl">已完成章节</div></div></div>
      <div class="stat-card card"><div class="stat-ico" style="background:var(--accent-weak);color:var(--accent)">Σ</div><div><div class="num">${st.total}</div><div class="lbl">累计作答</div></div></div>
      <div class="stat-card card"><div class="stat-ico" style="background:var(--purple-weak);color:var(--purple)">%</div><div><div class="num">${st.rate}%</div><div class="lbl">总正确率</div></div></div>
      <div class="stat-card card"><div class="stat-ico" style="background:var(--orange-weak);color:var(--orange)">↑</div><div><div class="num">${Store.streak()}</div><div class="lbl">连续学习天数</div></div></div>
    </div>

    <div class="section-title"><h2>今日推荐演示</h2><span class="sub">拖动滑块，把抽象的极限「做」出来</span></div>
    <div class="visual fade-in" data-visual="riemann">
      <div class="visual-head"><span class="v-badge">动手试试</span><strong>定积分的诞生：黎曼和如何逼近面积</strong><span class="v-hint">拖动分割数 n</span></div>
      <div class="visual-body"></div>
      <div class="visual-foot">把分割数从 4 调到 60，观察近似值如何收敛到精确积分值；切换取样方式可看到不同黎曼和的收敛速度差异。</div>
    </div>

    <div class="section-title"><h2>课程章节</h2><a class="sub" href="#/map">查看知识地图 →</a></div>
    <div class="home-cols">
      <div class="chapter-grid fade-in">${chapters}</div>
      <div style="display:flex;flex-direction:column;gap:18px">
        <div class="card panel fade-in">
          <div class="panel-head"><h2>推荐学习路径</h2><span class="small muted">${pct}% 完成</span></div>
          <div class="timeline">${stages.map((s, i) => `<div class="tl-item ${doneCount >= (i + 1) * 3 ? 'on' : ''}"><strong>${s[0]}</strong><span>${s[1]}</span></div>`).join('')}</div>
        </div>
        <div class="card panel fade-in">
          <div class="panel-head"><h2>快捷入口</h2></div>
          <div class="quick-links">
            <a class="ql" href="#/practice"><span class="ql-ico">∑</span><span><strong>开始一组练习</strong><span>随机 10 题，即时判题解析</span></span></a>
            <a class="ql" href="#/formulas"><span class="ql-ico">ƒ</span><span><strong>公式速查表</strong><span>8 大类 40+ 常用公式</span></span></a>
            <a class="ql" href="#/wrong"><span class="ql-ico">↺</span><span><strong>错题本</strong><span>${st.wrong} 道题待复习</span></span></a>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

/* ---------- 页面：知识地图 ---------- */
function viewMap() {
  renderSidebar('map');
  return `<div class="wrap wrap-wide">
    <div class="view-head fade-in"><div class="eyebrow">Knowledge Map</div><h1>知识地图</h1>
      <p class="lead">高等数学不是 12 个孤立章节，而是一条从「极限」出发、经由「微分—积分—多元—级数」层层展开的链条。点击任意节点进入章节。</p></div>
    <div class="grid fade-in" style="grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px">
      ${[['极限', '一切的基础语言', 'var(--primary)'], ['微分', '刻画瞬时变化', 'var(--accent)'], ['积分', '累加与反运算', 'var(--orange)'], ['方程', '用导数描述规律', 'var(--purple)'], ['多元', '从线到面到体', 'var(--cyan)'], ['级数', '把函数展开成和', 'var(--danger)']].map(x => `<div class="card" style="padding:14px 16px;border-left:3px solid ${x[2]}"><strong style="font-size:14px">${x[0]}</strong><div class="small muted">${x[1]}</div></div>`).join('')}
    </div>
    <div class="map-grid fade-in">${C().map(c => {
      const ratio = Store.readRatio(c.id);
      return `<a class="map-node" href="#/chapter/${c.id}" style="--ch-color:${c.color}">
        <div class="mn-top"><span class="mn-num" style="background:${c.color}">${String(c.no).padStart(2, '0')}</span><h3>${c.title}</h3></div>
        <div class="small muted">${c.summary.slice(0, 52)}…</div>
        <ul>${c.sections.slice(0, 3).map(s => `<li>${s.title}</li>`).join('')}</ul>
        <div class="mn-foot"><div class="bar" style="flex:1"><i style="width:${Math.round(ratio * 100)}%;background:${c.color}"></i></div><span>${Math.round(ratio * 100)}%</span></div>
      </a>`;
    }).join('')}</div>
  </div>`;
}

/* ---------- 页面：章节 ---------- */
function blockHTML(b) {
  switch (b.t) {
    case 'p': return `<div class="prose">${b.html}</div>`;
    case 'def': return `<div class="block block-def"><div class="blk-label">定义 · ${b.title}</div><div class="prose">${b.body}</div></div>`;
    case 'theorem': return `<div class="block block-theorem"><div class="blk-label">定理 · ${b.title}</div><div class="prose">${b.body}</div>${b.note ? `<div class="prose small muted" style="margin-top:9px;padding-top:9px;border-top:1px dashed var(--border-strong)">${b.note}</div>` : ''}</div>`;
    case 'formula': return `<div class="formula-box"><div class="f-label">${b.label}</div><div class="f-tex">${b.tex}</div></div>`;
    case 'tip': return `<div class="block block-tip"><div class="blk-label">要点</div><div class="prose">${b.body}</div></div>`;
    case 'warn': return `<div class="block block-warn"><div class="blk-label">易错警示</div><div class="prose">${b.body}</div></div>`;
    case 'example': return `<div class="block block-example"><div class="blk-label">典型例题</div><div class="prose example-q">${b.q}</div><div class="prose example-a"><span class="tag">解</span>${b.a}</div></div>`;
    case 'list': return `<div class="block"><ul class="prose" style="padding-left:20px;margin:0">${b.items.map(i => `<li style="margin-bottom:8px">${i}</li>`).join('')}</ul></div>`;
    case 'visual': {
      const cfg = window.VISUALS[b.id];
      return `<div class="visual" data-visual="${b.id}"><div class="visual-head"><span class="v-badge">交互演示</span><strong>${b.caption}</strong><span class="v-hint">${b.hint || '拖动参数观察变化'}</span></div><div class="visual-body"></div><div class="visual-foot">${cfg && cfg.foot ? cfg.foot : '图中数值与曲线实时联动。拖动滑块或点击画布，把抽象定义变成可观察的过程。'}</div></div>`;
    }
    default: return '';
  }
}
function viewChapter(id, sec) {
  const c = C().find(x => x.id === id) || C()[0];
  renderSidebar('chapter/' + c.id);
  const idx = C().indexOf(c), prev = C()[idx - 1], next = C()[idx + 1];
  const done = !!Store.get().finished[c.id];
  const read = Store.get().read[c.id] || [];
  const sections = c.sections.map((s, i) => `<section class="sec" id="${s.id}"><div class="sec-head"><span class="sec-num">${c.no}.${i + 1}</span><h2>${s.title}</h2></div>${s.blocks.map(blockHTML).join('')}</section>`).join('');
  return `<div class="wrap wrap-wide">
    <div class="chapter-hero fade-in" style="--ch-color:${c.color}">
      <div class="ch-top"><div class="ch-big-no">${String(c.no).padStart(2, '0')}</div>
        <div style="flex:1"><div class="eyebrow" style="color:${c.color}">Chapter ${c.no} · ${c.en}</div><h1>${c.title}</h1><p class="lead">${c.summary}</p></div>
      </div>
      <div class="ch-tags"><span class="pill pill-primary">${c.level}</span><span class="pill">${c.sections.length} 节</span><span class="pill">建议 ${c.hours} 课时</span><span class="pill ${done ? 'pill-accent' : ''}">${done ? '已学完' : '学习中'}</span></div>
      <div class="ch-goals"><ul style="margin:0;padding:0">${c.goals.map(g => `<li>${g}</li>`).join('')}</ul></div>
    </div>
    <div class="ch-layout">
      <aside class="toc card">
        <div class="toc-title">本章目录</div>
        ${c.sections.map((s, i) => `<a href="#${s.id}" data-sec="${s.id}" class="${read.includes(s.id) ? '' : ''}">${c.no}.${i + 1}　${s.title}</a>`).join('')}
        <div class="toc-foot"><div class="small muted" style="margin-bottom:8px">阅读进度 ${read.length} / ${c.sections.length}</div>
          <div class="bar"><i style="width:${Math.round(read.length / c.sections.length * 100)}%"></i></div>
          <button class="btn ${done ? 'btn-ghost' : 'btn-soft'} btn-sm" id="finishBtn" style="width:100%;margin-top:12px">${done ? '取消「已学完」' : '标记本章已学完'}</button>
        </div>
      </aside>
      <article class="article fade-in">${sections}
        <div class="section-title"><h2>本章要点</h2></div>
        <div class="keypoints">${c.keypoints.map((k, i) => `<div class="kp"><span class="kp-n">${String(i + 1).padStart(2, '0')}</span><span>${k}</span></div>`).join('')}</div>
        <div class="section-title"><h2>高频易错点</h2></div>
        <div class="grid g2">${c.pitfalls.map((k, i) => `<div class="block block-warn" style="margin:0"><div class="prose">${k}</div></div>`).join('')}</div>
        <div class="card" style="margin-top:26px;padding:22px;text-align:center;background:var(--primary-weak);border-color:var(--primary-soft)">
          <h3>读完定义，用题目检验一下</h3>
          <p class="small muted" style="margin:8px 0 16px">本章共 ${QZ().filter(q => q.ch === c.id).length} 道配套练习，含即时解析</p>
          <a class="btn btn-primary" href="#/practice?ch=${c.id}">开始本章练习 →</a>
        </div>
        <div class="chapter-nav">
          ${prev ? `<a href="#/chapter/${prev.id}"><span>← 上一章</span><strong>${prev.no}. ${prev.title}</strong></a>` : '<span></span>'}
          ${next ? `<a class="next" href="#/chapter/${next.id}"><span>下一章 →</span><strong>${next.no}. ${next.title}</strong></a>` : '<span></span>'}
        </div>
      </article>
    </div>
  </div>${sec ? `<span id="scrollTarget" data-target="${sec}" hidden></span>` : ''}`;
}

/* ---------- 页面：公式速查 ---------- */
function viewFormulas() {
  renderSidebar('formulas');
  return `<div class="wrap">
    <div class="view-head fade-in"><div class="eyebrow">Formula Reference</div><h1>公式速查表</h1>
      <p class="lead">按主题整理的 8 组常用公式。考前扫一遍，或做题时随手查。</p></div>
    <div class="topbar-search" style="max-width:100%;margin-bottom:22px;height:42px">
      <svg viewBox="0 0 24 24" width="17" height="17"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" fill="none"/><path d="m16.5 16.5 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      <input id="formulaFilter" type="search" placeholder="筛选公式名称或主题…" autocomplete="off">
    </div>
    <div id="formulaGroups">${window.FORMULA_GROUPS.map(g => `<div class="formula-group fade-in" data-group="${g.title}">
      <h3>${g.title}</h3><table class="formula-table"><tbody>${g.items.map(it => `<tr data-key="${esc(plain(it.name) + ' ' + g.title)}"><td>${it.name}</td><td>\\(${it.tex}\\)</td></tr>`).join('')}</tbody></table></div>`).join('')}</div>
  </div>`;
}

/* ---------- 页面：错题本 ---------- */
function viewWrong() {
  renderSidebar('wrong');
  const ids = Store.get().wrong.slice();
  if (!ids.length) return `<div class="wrap"><div class="view-head fade-in"><div class="eyebrow">Review</div><h1>错题本</h1></div>
    <div class="empty-state card fade-in"><div class="big">✓</div><h3>错题本是空的</h3><p class="small">去练习中心做一组题，答错的题目会自动收进这里。</p><p style="margin-top:18px"><a class="btn btn-primary" href="#/practice">去练习</a></p></div></div>`;
  return `<div class="wrap">
    <div class="view-head fade-in"><div class="eyebrow">Review</div><h1>错题本</h1>
      <p class="lead">共 ${ids.length} 道待复习。答对一次后（且累计正确不少于错误次数）会自动移出。</p></div>
    <div style="display:flex;gap:10px;margin-bottom:20px"><a class="btn btn-primary" href="#/practice?mode=wrong">全部重练 →</a><button class="btn btn-ghost" id="clearWrong">清空错题本</button></div>
    <div class="fade-in">${ids.map(id => {
      const q = QZ().find(x => x.id === id); if (!q) return '';
      const ans = q.type === 'fill' ? q.ans : (Array.isArray(q.ans) ? q.ans : [q.ans]).map(i => 'ABCD'[i] + '. ' + q.opts[i]).join('；');
      return `<div class="wrong-item"><div class="wi-top"><span class="pill pill-primary">${chTitle(q.ch)}</span><span class="pill">${esc(q.tag)}</span>
        <button class="btn btn-ghost btn-sm" style="margin-left:auto" data-remove="${q.id}">已掌握，移除</button></div>
        <div class="prose" style="font-size:14.5px">${q.stem}</div>
        ${q.type !== 'fill' ? `<div class="small muted" style="margin:6px 0">选项：${q.opts.map((o, i) => 'ABCD'[i] + '. ' + o).join('　')}</div>` : ''}
        <details style="margin-top:8px"><summary class="small" style="cursor:pointer;color:var(--primary)">查看答案与解析</summary>
          <div class="feedback ok" style="margin-top:10px"><div><strong>答案：</strong>${ans}</div><div class="fb-sol">${q.sol}</div></div></details>
      </div>`;
    }).join('')}</div>
  </div>`;
}

/* ---------- 页面：学习计划 ---------- */
function viewPlan() {
  renderSidebar('plan');
  const pct = Math.round((Store.chapterDone() / C().length * .5 + C().reduce((s, c) => s + Store.readRatio(c.id), 0) / C().length * .3 + Math.min(1, Store.stats().total / QZ().length) * .2) * 100);
  const set = new Set(Store.get().checkin);
  const days = [];
  for (let i = 90; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')); }
  const heat = days.map(s => `<div class="heat ${set.has(s) ? 'l3' : ''}" title="${s}"></div>`).join('');
  const rows = C().map(c => {
    const qs = QZ().filter(q => q.ch === c.id);
    let done = 0; qs.forEach(q => { const a = Store.get().answered[q.id]; if (a) done += a.c + a.w; });
    const r = Store.readRatio(c.id);
    return `<div class="profile-row"><span>第 ${c.no} 章 · ${c.title}${Store.get().finished[c.id] ? ' <span class="pill pill-accent">已完成</span>' : ''}</span>
      <span style="display:flex;align-items:center;gap:12px;min-width:230px"><div class="bar" style="width:150px"><i style="width:${Math.round(r * 100)}%;background:${c.color}"></i></div><span class="small muted">${Math.round(r * 100)}% · ${done} 题</span></span></div>`;
  }).join('');
  return `<div class="wrap">
    <div class="view-head fade-in"><div class="eyebrow">Study Plan</div><h1>学习计划</h1><p class="lead">进度、打卡与章节掌握情况。所有数据只保存在本机浏览器，不会上传。</p></div>
    <div class="plan-hero fade-in"><div class="ring" style="--p:${pct}"><span>${pct}%</span></div>
      <div><h2>总体完成度</h2><p class="muted small" style="margin:6px 0 0">由章节完成（50%）、阅读进度（30%）、练习覆盖（20%）加权计算</p>
      <div style="display:flex;gap:20px;margin-top:14px;flex-wrap:wrap"><span class="small">连续学习 <strong>${Store.streak()}</strong> 天</span><span class="small">累计打卡 <strong>${set.size}</strong> 天</span><span class="small">完成练习 <strong>${Store.stats().sessions}</strong> 组</span></div></div>
    </div>
    <div class="section-title"><h2>近 13 周打卡</h2><span class="sub">每天打开站点即自动打卡</span></div>
    <div class="card panel fade-in"><div class="heatmap">${heat}</div><p class="small muted" style="margin-top:14px">深色方格表示当日有学习记录。坚持比强度更重要。</p></div>
    <div class="section-title"><h2>各章进度</h2></div>
    <div class="card panel fade-in">${rows}</div>
    <div class="section-title"><h2>数据管理</h2></div>
    <div class="card panel fade-in"><p class="small muted">进度保存在浏览器 localStorage。换设备或清理浏览器数据前，可导出备份。</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">
        <button class="btn btn-primary btn-sm" id="exportData">导出备份 JSON</button>
        <button class="btn btn-ghost btn-sm" id="importData">导入备份</button>
        <button class="btn btn-ghost btn-sm" id="resetData" style="color:var(--danger)">重置全部学习数据</button>
        <input type="file" id="importFile" accept=".json,application/json" hidden>
      </div>
    </div>
  </div>`;
}

/* ---------- 渲染后处理 ---------- */
function afterRender(route) {
  window.typesetMath(main);
  main.querySelectorAll('.visual[data-visual]').forEach(v => {
    const body = v.querySelector('.visual-body');
    if (body) window.VISUALS.mount(body, v.dataset.visual);
  });
  if (route.startsWith('chapter/')) {
    const id = route.split('/')[1];
    const finish = document.getElementById('finishBtn');
    if (finish) finish.addEventListener('click', () => {
      if (Store.get().finished[id]) { Store.unfinishCh(id); toast('已取消完成标记'); }
      else { Store.finishCh(id); toast('本章已标记学完'); }
      render();
    });
    const tocLinks = [...document.querySelectorAll('.toc a[data-sec]')];
    tocLinks.forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      const t = document.getElementById(a.dataset.sec);
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(es => {
        es.forEach(e => {
          if (!e.isIntersecting) return;
          const sid = e.target.id;
          Store.markRead(id, sid);
          tocLinks.forEach(a => a.classList.toggle('active', a.dataset.sec === sid));
        });
      }, { rootMargin: '-90px 0px -65% 0px', threshold: 0 });
      document.querySelectorAll('.article .sec').forEach(s => obs.observe(s));
      main._observer = obs;
    }
    const st = document.getElementById('scrollTarget');
    if (st) requestAnimationFrame(() => { const t = document.getElementById(st.dataset.target); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  }
  if (route === 'formulas') {
    const inp = document.getElementById('formulaFilter');
    inp.addEventListener('input', () => {
      const k = inp.value.trim().toLowerCase();
      document.querySelectorAll('#formulaGroups tr').forEach(tr => { tr.style.display = tr.dataset.key.toLowerCase().includes(k) ? '' : 'none'; });
      document.querySelectorAll('#formulaGroups .formula-group').forEach(g => {
        g.style.display = [...g.querySelectorAll('tr')].some(tr => tr.style.display !== 'none') ? '' : 'none';
      });
    });
  }
  if (route === 'wrong') {
    document.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => { Store.removeWrong(b.dataset.remove); toast('已移出错题本'); render(); }));
    const clr = document.getElementById('clearWrong');
    if (clr) clr.addEventListener('click', () => { if (confirm('确定清空错题本？此操作不可撤销。')) { Store.get().wrong = []; Store.save(); toast('错题本已清空'); render(); } });
  }
  if (route === 'plan') {
    document.getElementById('exportData').addEventListener('click', () => {
      const blob = new Blob([Store.export()], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'shuxing-progress-' + new Date().toISOString().slice(0, 10) + '.json'; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000); toast('备份已导出');
    });
    const file = document.getElementById('importFile');
    document.getElementById('importData').addEventListener('click', () => file.click());
    file.addEventListener('change', () => {
      const f = file.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => { try { Store.import(r.result); toast('导入成功'); render(); } catch (e) { toast('导入失败：' + e.message); } };
      r.readAsText(f);
    });
    document.getElementById('resetData').addEventListener('click', () => {
      if (confirm('确定重置全部学习数据？章节进度、答题记录与打卡都会被清除，且无法恢复。')) { Store.reset(); toast('已重置'); render(); }
    });
  }
}

/* ---------- 路由 ---------- */
function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '') || 'home';
  const [path, query] = raw.split('?');
  const params = {};
  (query || '').split('&').filter(Boolean).forEach(kv => { const [k, v] = kv.split('='); params[k] = decodeURIComponent(v || ''); });
  return { path: path.replace(/\/$/, ''), params };
}
let currentRoute = '';
function render() {
  const { path, params } = parseHash();
  if (main._observer) { main._observer.disconnect(); main._observer = null; }
  currentRoute = path;
  window.scrollTo({ top: 0, behavior: 'instant' });
  let html = '';
  if (path === 'home' || path === '') html = viewHome();
  else if (path === 'map') html = viewMap();
  else if (path.startsWith('chapter/')) html = viewChapter(path.split('/')[1], params.s);
  else if (path === 'formulas') html = viewFormulas();
  else if (path === 'wrong') html = viewWrong();
  else if (path === 'plan') html = viewPlan();
  else if (path === 'practice') { main.innerHTML = '<div class="wrap"></div>'; renderSidebar('practice'); window.QuizApp.mount(main, params); return; }
  else html = viewHome();
  main.innerHTML = window.safeMathHtml(html);
  afterRender(path);
}

/* ---------- 搜索 ---------- */
function buildIndex() {
  const idx = [];
  C().forEach(c => {
    idx.push({ type: '章节', title: `第 ${c.no} 章 · ${c.title}`, sub: c.en, url: '#/chapter/' + c.id, k: (c.title + c.en + c.summary + c.keypoints.join('')).toLowerCase() });
    c.sections.forEach(s => idx.push({
      type: '知识点', title: s.title, sub: `第 ${c.no} 章 · ${c.title}`,
      url: `#/chapter/${c.id}?s=${s.id}`,
      k: (s.title + s.blocks.map(b => Object.values(b).filter(v => typeof v === 'string').join(' ') + (b.items ? b.items.join(' ') : '')).join(' ') + c.title).toLowerCase()
    }));
  });
  window.FORMULA_GROUPS.forEach(g => g.items.forEach(it => idx.push({ type: '公式', title: it.name, sub: g.title, url: '#/formulas', k: (it.name + g.title + plain(it.tex)).toLowerCase() })));
  QZ().forEach(q => idx.push({ type: '练习题', title: plain(q.stem).slice(0, 46) + (plain(q.stem).length > 46 ? '…' : ''), sub: chTitle(q.ch) + ' · ' + q.tag, url: `#/practice?ch=${q.ch}`, k: (plain(q.stem) + q.tag + chTitle(q.ch)).toLowerCase() }));
  return idx;
}
let INDEX = null;
function setupSearch() {
  const inp = document.getElementById('globalSearch'), box = document.getElementById('searchResults');
  const close = () => { box.hidden = true; };
  const run = () => {
    if (!INDEX) INDEX = buildIndex();
    const k = inp.value.trim().toLowerCase();
    if (!k) { close(); return; }
    const hits = INDEX.filter(x => x.k.includes(k)).slice(0, 12);
    if (!hits.length) { box.innerHTML = '<div class="search-empty">没有找到相关内容，试试「泰勒」「格林」「收敛」等关键词</div>'; box.hidden = false; return; }
    const groups = {};
    hits.forEach(h => (groups[h.type] || (groups[h.type] = [])).push(h));
    box.innerHTML = Object.keys(groups).map(t => `<div class="search-group-title">${t}</div>${groups[t].map(h => `<a class="search-item" href="${h.url}"><strong>${esc(h.title)}</strong><span>${esc(h.sub)}</span></a>`).join('')}`).join('');
    box.hidden = false;
    box.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { close(); inp.blur(); inp.value = ''; }));
  };
  inp.addEventListener('input', run);
  inp.addEventListener('focus', () => { if (inp.value.trim()) run(); });
  document.addEventListener('click', e => { if (!e.target.closest('.topbar-search')) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== inp && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); inp.focus(); }
    if (e.key === 'Escape') { close(); inp.blur(); document.getElementById('modalHost').hidden = true; }
  });
}

/* ---------- 主题、档案、初始化 ---------- */
function applyTheme(t) {
  if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  else document.documentElement.removeAttribute('data-theme');
  Store.theme(t);
  setTimeout(() => window.VISUALS.refreshAll(), 30);
}
function openProfile() {
  const st = Store.stats();
  const m = modal('学习档案', `
    <p class="muted small">本机浏览器保存的学习数据，清除浏览器数据会一并丢失。</p>
    <div style="margin:18px 0">
      <div class="profile-row"><span>已完成章节</span><strong>${Store.chapterDone()} / ${C().length}</strong></div>
      <div class="profile-row"><span>累计作答 / 正确率</span><strong>${st.total} 题 · ${st.rate}%</strong></div>
      <div class="profile-row"><span>连续学习</span><strong>${Store.streak()} 天</strong></div>
      <div class="profile-row"><span>错题本</span><strong>${st.wrong} 题</strong></div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-ghost btn-sm" id="pfTheme">切换到${Store.theme() === 'dark' ? '浅色' : '深色'}主题</button>
      <a class="btn btn-soft btn-sm" href="#/plan">管理学习数据</a>
    </div>`);
  m.host.querySelector('#pfTheme').addEventListener('click', () => { applyTheme(Store.theme() === 'dark' ? 'light' : 'dark'); m.close(); toast('主题已切换'); });
}
function init() {
  applyTheme(Store.theme());
  Store.checkin();
  document.getElementById('themeToggle').addEventListener('click', () => applyTheme(Store.theme() === 'dark' ? 'light' : 'dark'));
  document.getElementById('profileBtn').addEventListener('click', openProfile);
  const mt = document.getElementById('menuToggle'), scrim = document.getElementById('sidebarScrim');
  const setMenu = open => { sidebar.classList.toggle('open', open); scrim.classList.toggle('show', open); };
  mt.addEventListener('click', () => setMenu(!sidebar.classList.contains('open')));
  scrim.addEventListener('click', () => setMenu(false));
  sidebar.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  setupSearch();
  window.addEventListener('hashchange', () => { setMenu(false); render(); });
  render();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();
