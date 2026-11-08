/* ===== 交互式可视化引擎 + 第 1—6 章演示 ===== */
(function () {
'use strict';
const DPR = Math.min(window.devicePixelRatio || 1, 2);
const V = window.VISUALS = window.VISUALS || {};

function cssv(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#999'; }
function palette() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    dark: dark,
    primary: dark ? '#8b9aff' : '#4257d6',
    accent: dark ? '#3ecfa4' : '#0d9b7a',
    orange: dark ? '#f0ad4e' : '#e08a18',
    danger: dark ? '#ff7488' : '#d94a5c',
    purple: dark ? '#b79bff' : '#7854c9',
    cyan: dark ? '#55c6dd' : '#1f9bb3',
    grid: cssv('--border'), axis: cssv('--border-strong'),
    text: cssv('--text-3'), strong: cssv('--text'), surface: cssv('--surface-2')
  };
}
const FONT = '12px "Microsoft YaHei","PingFang SC",sans-serif';
const MONO = '11px "SFMono-Regular",Consolas,monospace';

/* ---------- 绘图坐标系统 ---------- */
function Plot(d, xr, yr, pad) {
  pad = Object.assign({ l: 46, r: 16, t: 16, b: 30 }, pad || {});
  const ctx = d.ctx, W = d.W, H = d.H, C = d.C;
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const X = x => pad.l + (x - xr[0]) / (xr[1] - xr[0]) * iw;
  const Y = y => pad.t + ih - (y - yr[0]) / (yr[1] - yr[0]) * ih;
  const iX = px => xr[0] + (px - pad.l) / iw * (xr[1] - xr[0]);
  const iY = py => yr[0] + (pad.t + ih - py) / ih * (yr[1] - yr[0]);
  const step = r => { const raw = r / 6, p = Math.pow(10, Math.floor(Math.log10(raw || 1))), n = raw / p; return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * p; };
  const fmt = v => Math.abs(v) < 1e-9 ? '0' : (Math.abs(v) >= 1000 || (Math.abs(v) < 0.01 && v !== 0) ? v.toExponential(1) : (+v.toFixed(2)).toString());
  const P = { X, Y, iX, iY, xr, yr, pad, fmt, ctx, W, H, C };
  P.clear = function (bg) { ctx.fillStyle = bg || d.C.surface; ctx.fillRect(0, 0, W, H); };
  P.grid = function (opt) {
    opt = opt || {};
    const sx = step(xr[1] - xr[0]), sy = step(yr[1] - yr[0]);
    ctx.save(); ctx.lineWidth = 1; ctx.font = MONO; ctx.fillStyle = C.text;
    ctx.strokeStyle = C.grid;
    for (let x = Math.ceil(xr[0] / sx) * sx; x <= xr[1] + 1e-9; x += sx) {
      const px = X(x); ctx.beginPath(); ctx.moveTo(px, pad.t); ctx.lineTo(px, H - pad.b); ctx.stroke();
      if (opt.xlabels !== false) { ctx.textAlign = 'center'; ctx.fillText(fmt(x), px, H - pad.b + 15); }
    }
    for (let y = Math.ceil(yr[0] / sy) * sy; y <= yr[1] + 1e-9; y += sy) {
      const py = Y(y); ctx.beginPath(); ctx.moveTo(pad.l, py); ctx.lineTo(W - pad.r, py); ctx.stroke();
      if (opt.ylabels !== false) { ctx.textAlign = 'right'; ctx.fillText(fmt(y), pad.l - 7, py + 4); }
    }
    ctx.strokeStyle = C.axis; ctx.lineWidth = 1.4;
    if (yr[0] <= 0 && yr[1] >= 0) { ctx.beginPath(); ctx.moveTo(pad.l, Y(0)); ctx.lineTo(W - pad.r, Y(0)); ctx.stroke(); }
    if (xr[0] <= 0 && xr[1] >= 0) { ctx.beginPath(); ctx.moveTo(X(0), pad.t); ctx.lineTo(X(0), H - pad.b); ctx.stroke(); }
    if (opt.xlabel) { ctx.textAlign = 'right'; ctx.font = FONT; ctx.fillStyle = C.text; ctx.fillText(opt.xlabel, W - pad.r, H - 5); }
    if (opt.ylabel) { ctx.textAlign = 'left'; ctx.font = FONT; ctx.fillStyle = C.text; ctx.fillText(opt.ylabel, 5, pad.t + 2); }
    ctx.restore();
    return P;
  };
  P.curve = function (fn, color, width, dash, samples) {
    const n = samples || 420, rg = yr[1] - yr[0];
    ctx.save(); ctx.beginPath(); ctx.strokeStyle = color || C.primary;
    ctx.lineWidth = width || 2; ctx.lineJoin = 'round'; ctx.setLineDash(dash || []);
    let pen = false;
    for (let i = 0; i <= n; i++) {
      const x = xr[0] + (xr[1] - xr[0]) * i / n;
      const y = fn(x);
      if (!isFinite(y) || Math.abs(y - yr[0]) > rg * 8 || Math.abs(y - yr[1]) > rg * 8) { pen = false; continue; }
      const px = X(x), py = Y(y);
      if (!pen) { ctx.moveTo(px, py); pen = true; } else ctx.lineTo(px, py);
    }
    ctx.stroke(); ctx.restore(); return P;
  };
  P.line = function (x1, y1, x2, y2, color, width, dash) {
    ctx.save(); ctx.beginPath(); ctx.strokeStyle = color || C.primary; ctx.lineWidth = width || 2;
    ctx.setLineDash(dash || []); ctx.moveTo(X(x1), Y(y1)); ctx.lineTo(X(x2), Y(y2)); ctx.stroke(); ctx.restore(); return P;
  };
  P.pline = function (px1, py1, px2, py2, color, width, dash) {
    ctx.save(); ctx.beginPath(); ctx.strokeStyle = color || C.primary; ctx.lineWidth = width || 2;
    ctx.setLineDash(dash || []); ctx.moveTo(px1, py1); ctx.lineTo(px2, py2); ctx.stroke(); ctx.restore(); return P;
  };
  P.dot = function (x, y, color, r, ring) {
    ctx.save(); ctx.beginPath(); ctx.arc(X(x), Y(y), r || 4, 0, Math.PI * 2);
    ctx.fillStyle = color || C.primary; ctx.fill();
    if (ring) { ctx.lineWidth = 2; ctx.strokeStyle = ring; ctx.stroke(); }
    ctx.restore(); return P;
  };
  P.pdot = function (px, py, color, r) {
    ctx.save(); ctx.beginPath(); ctx.arc(px, py, r || 4, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); ctx.restore(); return P;
  };
  P.text = function (str, px, py, color, align, font) {
    ctx.save(); ctx.fillStyle = color || C.text; ctx.font = font || FONT;
    ctx.textAlign = align || 'left'; ctx.fillText(str, px, py); ctx.restore(); return P;
  };
  P.label = function (str, x, y, color, dx, dy) {
    return P.text(str, X(x) + (dx || 6), Y(y) + (dy || -7), color || C.strong);
  };
  P.band = function (y1, y2, color) {
    ctx.save(); ctx.fillStyle = color; ctx.fillRect(pad.l, Y(y2), iw, Math.abs(Y(y1) - Y(y2))); ctx.restore(); return P;
  };
  P.vspan = function (x1, x2, color) {
    ctx.save(); ctx.fillStyle = color; ctx.fillRect(X(x1), pad.t, Math.abs(X(x2) - X(x1)), ih); ctx.restore(); return P;
  };
  P.rect = function (x1, y1, x2, y2, fill, stroke, dash) {
    ctx.save(); ctx.beginPath(); ctx.rect(X(x1), Y(y2), Math.abs(X(x2) - X(x1)), Math.abs(Y(y1) - Y(y2)));
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.setLineDash(dash || []); ctx.stroke(); }
    ctx.restore(); return P;
  };
  P.poly = function (points, fill, stroke, width) {
    ctx.save(); ctx.beginPath();
    points.forEach((q, i) => i ? ctx.lineTo(X(q[0]), Y(q[1])) : ctx.moveTo(X(q[0]), Y(q[1])));
    if (points.length) ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width || 1.5; ctx.stroke(); }
    ctx.restore(); return P;
  };
  P.clip = function () { ctx.save(); ctx.beginPath(); ctx.rect(pad.l, pad.t, iw, ih); ctx.clip(); return P; };
  P.unclip = function () { ctx.restore(); return P; };
  return P;
}
function hexA(hex, a) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
}

/* ---------- 演示容器 ---------- */
class Demo {
  constructor(host, cfg) {
    this.cfg = cfg; this.state = {}; this.C = palette();
    this.W = cfg.w || 760; this.H = cfg.h || 330;
    const shell = document.createElement('div'); shell.className = 'canvas-shell';
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.W * DPR; this.canvas.height = this.H * DPR;
    this.canvas.style.width = '100%'; this.canvas.style.aspectRatio = this.W + '/' + this.H;
    shell.appendChild(this.canvas); host.appendChild(shell);
    this.ctx = this.canvas.getContext('2d'); this.ctx.scale(DPR, DPR);
    this.ctrl = document.createElement('div'); this.ctrl.className = 'v-controls'; host.appendChild(this.ctrl);
    this.ro = document.createElement('div'); this.ro.className = 'v-readout'; host.appendChild(this.ro);
    this.lg = document.createElement('div'); this.lg.className = 'legend'; host.appendChild(this.lg);
    if (cfg.clickable) {
      this.canvas.style.cursor = 'crosshair';
      this.canvas.addEventListener('pointerdown', e => {
        const r = this.canvas.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width * this.W;
        const py = (e.clientY - r.top) / r.height * this.H;
        if (this.onClick) this.onClick(px, py, this.P);
      });
    }
  }
  slider(label, key, min, max, step, init, fmt) {
    const c = document.createElement('div'); c.className = 'ctrl';
    const l = document.createElement('label'); l.textContent = label;
    const inp = document.createElement('input'); inp.type = 'range';
    inp.min = min; inp.max = max; inp.step = step; inp.value = init;
    const v = document.createElement('span'); v.className = 'val';
    const show = x => v.textContent = fmt ? fmt(+x) : (+x).toFixed(2);
    show(init); this.state[key] = +init;
    inp.addEventListener('input', () => { this.state[key] = +inp.value; show(inp.value); this.render(); });
    c.append(l, inp, v); this.ctrl.appendChild(c); return this;
  }
  segment(label, key, options, init) {
    const c = document.createElement('div'); c.className = 'ctrl';
    if (label) { const l = document.createElement('label'); l.textContent = label; c.appendChild(l); }
    const seg = document.createElement('div'); seg.className = 'seg';
    this.state[key] = init;
    options.forEach(o => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = o.label;
      if (o.value === init) b.classList.add('on');
      b.addEventListener('click', () => {
        seg.querySelectorAll('button').forEach(x => x.classList.remove('on'));
        b.classList.add('on'); this.state[key] = o.value; this.render();
      });
      seg.appendChild(b);
    });
    c.appendChild(seg); this.ctrl.appendChild(c); return this;
  }
  readout(fn) { this._rofn = fn; return this; }
  legend(items) {
    this.lg.innerHTML = items.map(i => '<span><i style="background:' + i.color + '"></i>' + i.label + '</span>').join('');
    return this;
  }
  plot(xr, yr, pad) { this.P = Plot(this, xr, yr, pad); return this.P; }
  render() {
    this.C = palette();
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    ctx.fillStyle = this.C.surface; ctx.fillRect(0, 0, this.W, this.H);
    try { this.cfg.draw(this); } catch (err) { console.error('[visual]', err); }
    if (this._rofn) {
      const rows = this._rofn(this.state) || [];
      this.ro.innerHTML = rows.map(r => '<span class="ro ' + (r.cls || '') + '">' + r.label + '<b>' + r.value + '</b></span>').join('');
    }
  }
}
V.Demo = Demo; V.Plot = Plot; V.hexA = hexA; V.palette = palette; V.FONT = FONT; V.MONO = MONO;
V.reg = function (id, cfg) { V[id] = cfg; };
V.mount = function (host, id) {
  const cfg = V[id] || V['function-lab'];
  if (!cfg) { host.textContent = '演示组件暂不可用'; return; }
  const d = new Demo(host, cfg);
  if (cfg.setup) cfg.setup(d);
  d.render();
  host._demo = d;
  return d;
};
V.refreshAll = function () {
  document.querySelectorAll('.visual-body').forEach(h => { if (h._demo) h._demo.render(); });
};

/* ============ 第 1 章：函数图像实验室 ============ */
V.reg('function-lab', {
  w: 760, h: 330,
  setup(d) {
    d.segment('基函数', 'fn', [
      { label: 'sin x', value: 'sin' }, { label: 'x²', value: 'sq' },
      { label: 'e^x', value: 'exp' }, { label: '|x|', value: 'abs' }
    ], 'sin');
    d.slider('纵向 a', 'a', -2, 2, 0.1, 1, x => x.toFixed(1));
    d.slider('横向 b', 'b', 0.3, 3, 0.1, 1, x => x.toFixed(1));
    d.slider('平移 c', 'c', -3, 3, 0.1, 0, x => x.toFixed(1));
    d.legend([{ label: '原函数 f(x)', color: d.C.text }, { label: 'y = a·f(b(x−c))', color: d.C.primary }]);
    d.readout(s => [
      { label: '变换式', value: `y = ${s.a.toFixed(1)}·f(${s.b.toFixed(1)}(x ${s.c >= 0 ? '−' : '+'}${Math.abs(s.c).toFixed(1)}))` },
      { label: 'f(c) = a·f(0)', value: (s.a * (s.fn === 'exp' ? 1 : 0)).toFixed(2) },
    ]);
  },
  draw(d) {
    const base = { sin: Math.sin, sq: x => x * x, exp: x => Math.exp(x / 2), abs: x => Math.abs(x) };
    const f = base[d.state.fn];
    const g = x => d.state.a * f(d.state.b * (x - d.state.c));
    const p = d.plot([-5, 5], [-3.2, 3.2]).grid({ xlabel: 'x', ylabel: 'y' });
    p.clip();
    p.curve(f, hexA(d.C.strong, .28), 2, [5, 4]);
    p.curve(g, d.C.primary, 2.6);
    p.unclip();
    p.dot(d.state.c, g(d.state.c), d.C.orange, 5);
    p.label('x = c', d.state.c, g(d.state.c), d.C.orange, 8, -10);
  }
});

/* ============ 第 1 章：数列极限逼近 ============ */
V.reg('limit', {
  w: 760, h: 330,
  setup(d) {
    d.slider('精度 ε', 'eps', 0.02, 0.8, 0.02, 0.2, x => x.toFixed(2));
    d.slider('公比 r', 'r', -0.95, 0.95, 0.05, -0.7, x => x.toFixed(2));
    d.slider('显示项数 n', 'n', 5, 60, 1, 24, x => String(x));
    d.legend([{ label: '数列 xₙ', color: d.C.primary }, { label: '极限 a = 1', color: d.C.accent }, { label: 'ε 邻域', color: hexA(d.C.accent, .25) }]);
    d.readout(s => {
      const r = s.r, e = s.eps;
      let N = 0; for (let n = 1; n <= 500; n++) { if (Math.abs(2 * Math.pow(r, n)) < e) { N = n; break; } }
      return [
        { label: 'xₙ = 1 + 2rⁿ', value: (1 + 2 * Math.pow(r, s.n)).toFixed(5) },
        { label: '|xₙ − 1|', value: Math.abs(2 * Math.pow(r, s.n)).toFixed(5) },
        { label: '满足 |xₙ−1|<ε 的最小 N', value: N ? String(N) : '>500', cls: 'alt' },
      ];
    });
  },
  draw(d) {
    const { eps, r, n } = d.state;
    const p = d.plot([0, n], [-0.5, 2.5]).grid({ xlabel: 'n', ylabel: 'xₙ' });
    p.band(1 - eps, 1 + eps, hexA(d.C.accent, .16));
    p.pline(p.pad.l, p.Y(1), p.W - p.pad.r, p.Y(1), d.C.accent, 1.8, [6, 4]);
    p.clip();
    for (let k = 1; k <= n; k++) {
      const x = 1 + 2 * Math.pow(r, k);
      const inside = Math.abs(x - 1) < eps;
      p.dot(k, x, inside ? d.C.accent : d.C.primary, k <= 12 ? 4 : 2.8);
      if (k > 1) {
        const prev = 1 + 2 * Math.pow(r, k - 1);
        p.line(k - 1, prev, k, x, hexA(d.C.primary, .25), 1);
      }
    }
    p.unclip();
    p.text('a + ε', p.pad.l + 4, p.Y(1 + eps) - 4, d.C.accent);
    p.text('a − ε', p.pad.l + 4, p.Y(1 - eps) + 12, d.C.accent);
    p.text('n →', p.W - 44, p.Y(-0.28), d.C.text);
  }
});

/* ============ 第 1 章：ε-δ 演示 ============ */
V.reg('epsilon', {
  w: 760, h: 330,
  setup(d) {
    d.slider('精度 ε', 'eps', 0.05, 0.9, 0.05, 0.4, x => x.toFixed(2));
    d.slider('趋近点 x₀', 'x0', 0.5, 2, 0.1, 1, x => x.toFixed(1));
    d.legend([{ label: 'f(x) = x²', color: d.C.primary }, { label: 'ε 带（函数值）', color: hexA(d.C.accent, .2) }, { label: 'δ 窗口（自变量）', color: hexA(d.C.orange, .18) }]);
    d.readout(s => {
      const a = s.x0 * s.x0, e = s.eps;
      const lo = Math.sqrt(Math.max(0, a - e)), hi = Math.sqrt(a + e);
      const delta = Math.min(s.x0 - lo, hi - s.x0);
      return [
        { label: '极限 A = x₀²', value: a.toFixed(2) },
        { label: 'ε', value: e.toFixed(2) },
        { label: '可取 δ = min(x₀−√(A−ε), √(A+ε)−x₀)', value: delta.toFixed(4), cls: 'alt' },
        { label: '验证', value: Math.abs(Math.pow(s.x0 + delta * .99, 2) - a).toFixed(3) + ' < ' + e.toFixed(2) },
      ];
    });
  },
  draw(d) {
    const { eps, x0 } = d.state, a = x0 * x0;
    const lo = Math.sqrt(Math.max(0, a - eps)), hi = Math.sqrt(a + eps);
    const delta = Math.min(x0 - lo, hi - x0);
    const p = d.plot([0, 2.6], [-0.3, 5.2]).grid({ xlabel: 'x', ylabel: 'f(x)' });
    p.band(a - eps, a + eps, hexA(d.C.accent, .18));
    p.vspan(x0 - delta, x0 + delta, hexA(d.C.orange, .16));
    p.clip(); p.curve(x => x * x, d.C.primary, 2.6); p.unclip();
    p.pline(p.pad.l, p.Y(a), p.W - p.pad.r, p.Y(a), d.C.accent, 1.5, [6, 4]);
    p.dot(x0, a, d.C.primary, 5);
    p.line(x0, 0, x0, a, hexA(d.C.text, .8), 1, [3, 3]);
    p.line(x0 - delta, 0, x0 - delta, a + eps, d.C.orange, 1.2, [4, 3]);
    p.line(x0 + delta, 0, x0 + delta, a + eps, d.C.orange, 1.2, [4, 3]);
    p.label('x₀', x0, 0, d.C.strong, -4, -6);
    p.text('δ', p.X(x0 - delta / 2), p.Y(0) - 8, d.C.orange, 'center');
    p.text('A+ε', p.W - 40, p.Y(a + eps) - 4, d.C.accent);
    p.text('A−ε', p.W - 40, p.Y(a - eps) + 11, d.C.accent);
  }
});

/* ============ 第 1 章：两个重要极限 ============ */
V.reg('squeeze', {
  w: 760, h: 310,
  setup(d) {
    d.segment('极限', 'kind', [
      { label: 'sin x / x → 1', value: 'sin' },
      { label: '(1+1/x)^x → e', value: 'e' },
      { label: '夹逼：x·sin(1/x) → 0', value: 'squeeze' }
    ], 'sin');
    d.slider('趋近变量 x', 'x', 0.02, 12, 0.02, 1.2, x => x.toFixed(2));
    d.legend([{ label: '函数值', color: d.C.primary }, { label: '极限值', color: d.C.accent }, { label: '包络 ±|x|（夹逼）', color: d.C.orange }]);
    d.readout(s => {
      const x = s.x;
      const val = s.kind === 'sin' ? (x < 0.05 ? 1 : Math.sin(x) / x) : s.kind === 'e' ? Math.pow(1 + 1 / x, x) : x * Math.sin(1 / x);
      const lim = s.kind === 'sin' ? 1 : s.kind === 'e' ? Math.E : 0;
      return [
        { label: '当前 x', value: x.toFixed(3) },
        { label: 'f(x)', value: val.toFixed(6) },
        { label: '极限 L', value: lim === Math.E ? 'e = ' + Math.E.toFixed(6) : String(lim) },
        { label: '误差 |f(x)−L|', value: Math.abs(val - lim).toExponential(2), cls: 'warn' },
      ];
    });
  },
  draw(d) {
    const { kind, x } = d.state;
    const lim = kind === 'sin' ? 1 : kind === 'e' ? Math.E : 0;
    const f = t => kind === 'sin' ? (Math.abs(t) < 1e-6 ? 1 : Math.sin(t) / t) : kind === 'e' ? Math.pow(1 + 1 / t, t) : t * Math.sin(1 / t);
    const yr = kind === 'squeeze' ? [-1.2, 1.2] : kind === 'e' ? [1.5, 3.1] : [0, 1.3];
    const p = d.plot([0.02, 12], yr).grid({ xlabel: 'x', ylabel: 'f(x)' });
    p.clip();
    p.pline(p.pad.l, p.Y(lim), p.W - p.pad.r, p.Y(lim), d.C.accent, 1.6, [6, 4]);
    if (kind === 'squeeze') { p.curve(t => t, hexA(d.C.orange, .85), 1.4, [5, 4]); p.curve(t => -t, hexA(d.C.orange, .85), 1.4, [5, 4]); }
    p.curve(f, d.C.primary, 2.4, null, 900);
    p.unclip();
    p.dot(x, f(x), d.C.orange, 5, '#fff');
    p.label('f(x) = ' + f(x).toFixed(4), x, f(x), d.C.orange, 9, -9);
  }
});

/* ============ 第 2 章：割线到切线 ============ */
function derivativeDemo(mode) {
  return {
    w: 760, h: 330,
    setup(d) {
      d.segment('函数', 'fn', [
        { label: 'x²', value: 'sq' }, { label: 'sin x', value: 'sin' },
        { label: 'e^x', value: 'exp' }, { label: 'x³−3x', value: 'cubic' }
      ], 'sq');
      d.slider('基准点 x₀', 'x0', -2, 2, 0.1, 1, x => x.toFixed(1));
      d.slider('增量 h', 'h', -2, 2, 0.01, 0.8, x => x.toFixed(2));
      d.legend([{ label: 'f(x)', color: d.C.primary }, { label: '割线', color: d.C.orange }, { label: '切线', color: d.C.accent }]);
      d.readout(s => {
        const { f, df } = fnsOf(s.fn);
        const q = (f(s.x0 + s.h) - f(s.x0)) / s.h;
        const approx = f(s.x0) + df(s.x0) * s.h;
        const rows = [
          { label: '差商 [f(x₀+h)−f(x₀)]/h', value: q.toFixed(5) },
          { label: '导数 f′(x₀)', value: df(s.x0).toFixed(5), cls: 'alt' },
          { label: '误差', value: Math.abs(q - df(s.x0)).toFixed(5), cls: 'warn' }
        ];
        if (mode === 'approx') rows.push({ label: '线性近似 f(x₀)+f′(x₀)h', value: approx.toFixed(5) }, { label: '近似误差', value: Math.abs(approx - f(s.x0 + s.h)).toFixed(5) });
        return rows;
      });
    },
    draw(d) {
      const { f, df } = fnsOf(d.state.fn);
      const { x0, h } = d.state;
      const p = d.plot([-3.4, 3.4], [-3, 5]).grid({ xlabel: 'x', ylabel: 'y' });
      p.clip(); p.curve(f, d.C.primary, 2.5);
      const m = (f(x0 + h) - f(x0)) / h;
      p.line(x0 + h - 3.5, f(x0) + m * (h - 3.5), x0 + h + 3.5, f(x0) + m * (h + 3.5), d.C.orange, 1.8, [6, 4]);
      p.line(x0 - 3.5, f(x0) + df(x0) * (-3.5), x0 + 3.5, f(x0) + df(x0) * 3.5, d.C.accent, 2);
      p.unclip();
      p.dot(x0, f(x0), d.C.accent, 5);
      p.dot(x0 + h, f(x0 + h), d.C.orange, 5);
      p.label('x₀', x0, f(x0), d.C.accent, 6, 16);
      p.label('x₀+h', x0 + h, f(x0 + h), d.C.orange, 6, -9);
      if (mode === 'approx') {
        const approx = f(x0) + df(x0) * h;
        p.dot(x0 + h, approx, d.C.accent, 4);
        p.line(x0 + h, f(x0 + h), x0 + h, approx, d.C.danger, 2);
      }
    }
  };
}
function fnsOf(k) {
  return k === 'sin' ? { f: Math.sin, df: Math.cos }
    : k === 'exp' ? { f: x => Math.exp(x / 1.6), df: x => Math.exp(x / 1.6) / 1.6 }
    : k === 'cubic' ? { f: x => x * x * x - 3 * x, df: x => 3 * x * x - 3 }
    : { f: x => x * x, df: x => 2 * x };
}
V.reg('derivative', derivativeDemo('slope'));
V.reg('linear-approx', derivativeDemo('approx'));

/* ============ 第 3 章：拉格朗日中值定理 ============ */
V.reg('mvt', {
  w: 760, h: 330,
  setup(d) {
    d.segment('函数', 'fn', [
      { label: 'x³−3x', value: 'cubic' }, { label: 'sin x', value: 'sin' }, { label: 'x²', value: 'sq' }
    ], 'cubic');
    d.slider('点 c', 'c', -1.9, 1.9, 0.01, -0.6, x => x.toFixed(2));
    d.legend([{ label: 'f(x)', color: d.C.primary }, { label: '割线 AB', color: d.C.accent }, { label: '过 (c, f(c)) 的切线', color: d.C.orange }]);
    d.readout(s => {
      const F = mvtF(s.fn), a = -1.8, b = 1.8;
      const k = (F.f(b) - F.f(a)) / (b - a);
      return [
        { label: '割线斜率 [f(b)−f(a)]/(b−a)', value: k.toFixed(5) },
        { label: 'f′(c)', value: F.df(s.c).toFixed(5), cls: 'alt' },
        { label: '差值 f′(c) − k', value: (F.df(s.c) - k).toFixed(5), cls: Math.abs(F.df(s.c) - k) < .02 ? '' : 'warn' },
      ];
    });
  },
  draw(d) {
    const { fn, c } = d.state, F = mvtF(fn), a = -1.8, b = 1.8;
    const k = (F.f(b) - F.f(a)) / (b - a);
    const p = d.plot([-2.2, 2.2], [-3.2, 3.6]).grid({ xlabel: 'x', ylabel: 'y' });
    p.clip(); p.curve(F.f, d.C.primary, 2.5);
    p.line(a - .6, F.f(a) + k * (a - .6 - a), b + .6, F.f(a) + k * (b + .6 - a), d.C.accent, 2, [7, 4]);
    p.line(c - 2, F.f(c) + F.df(c) * (-2), c + 2, F.f(c) + F.df(c) * 2, d.C.orange, 2);
    p.unclip();
    p.dot(a, F.f(a), d.C.accent, 5); p.dot(b, F.f(b), d.C.accent, 5);
    p.dot(c, F.f(c), d.C.orange, 5);
    p.label('A', a, F.f(a), d.C.accent, -14, -8);
    p.label('B', b, F.f(b), d.C.accent, 8, -8);
    p.label('c', c, F.f(c), d.C.orange, 8, 16);
  }
});
function mvtF(k) {
  return k === 'sin' ? { f: x => 2 * Math.sin(x), df: x => 2 * Math.cos(x) }
    : k === 'sq' ? { f: x => x * x, df: x => 2 * x }
    : { f: x => x * x * x - 3 * x, df: x => 3 * x * x - 3 };
}

/* ============ 第 3 章：泰勒逼近 ============ */
V.reg('taylor', {
  w: 760, h: 330,
  setup(d) {
    d.segment('函数', 'fn', [
      { label: 'sin x', value: 'sin' }, { label: 'e^x', value: 'exp' },
      { label: 'ln(1+x)', value: 'ln' }, { label: 'cos x', value: 'cos' }
    ], 'sin');
    d.slider('展开阶数 n', 'n', 0, 12, 1, 3, x => String(x));
    d.slider('观察区间 ±R', 'R', 1, 6, 0.2, 3.2, x => x.toFixed(1));
    d.legend([{ label: '原函数 f(x)', color: d.C.primary }, { label: 'n 阶泰勒多项式 Pₙ(x)', color: d.C.orange }]);
    d.readout(s => {
      const F = taylorF(s.fn), R = s.R;
      let maxErr = 0;
      for (let i = 0; i <= 300; i++) { const x = -R + 2 * R * i / 300; const v = F.f(x); if (isFinite(v)) maxErr = Math.max(maxErr, Math.abs(v - F.p(x, s.n))); }
      return [
        { label: '阶数', value: 'n = ' + s.n },
        { label: 'Pₙ(1)', value: F.p(1, s.n).toFixed(6) },
        { label: 'f(1)', value: F.f(1).toFixed(6) },
        { label: '[−R, R] 内最大误差', value: maxErr > 1e4 ? '发散' : maxErr.toExponential(2), cls: 'warn' },
      ];
    });
  },
  draw(d) {
    const { fn, n, R } = d.state, F = taylorF(fn);
    const p = d.plot([-R, R], [-2.6, 3.4]).grid({ xlabel: 'x', ylabel: 'y' });
    p.clip();
    p.curve(x => F.f(x), d.C.primary, 2.5);
    p.curve(x => F.p(x, n), d.C.orange, 2.3);
    p.unclip();
    p.dot(0, F.f(0), d.C.accent, 4);
    p.text('展开中心 x₀ = 0', p.W - 16, p.pad.t + 14, d.C.text, 'right');
  }
});
function taylorF(k) {
  if (k === 'exp') return { f: Math.exp, p: (x, n) => { let s = 0, t = 1; for (let i = 0; i <= n; i++) { s += t; t *= x / (i + 1); } return s; } };
  if (k === 'ln') return { f: x => x > -1 ? Math.log(1 + x) : NaN, p: (x, n) => { let s = 0, t = 1; for (let i = 1; i <= n; i++) { t *= -x; s += -t / i; } return s; } };
  if (k === 'cos') return { f: Math.cos, p: (x, n) => { let s = 0, t = 1; for (let i = 0; 2 * i <= n; i++) { s += t; t *= -x * x / ((2 * i + 1) * (2 * i + 2)); } return s; } };
  return { f: Math.sin, p: (x, n) => { let s = 0, t = x; for (let i = 0; 2 * i + 1 <= n; i++) { s += t; t *= -x * x / ((2 * i + 2) * (2 * i + 3)); } return s; } };
}

/* ============ 第 3 章：f、f′、f″ 同屏 ============ */
V.reg('shape', {
  w: 760, h: 330,
  setup(d) {
    d.segment('函数', 'fn', [
      { label: 'x³−3x', value: 'cubic' }, { label: 'x⁴−2x²', value: 'quartic' }, { label: 'sin x', value: 'sin' }
    ], 'cubic');
    d.legend([{ label: 'f(x)', color: d.C.primary }, { label: 'f′(x)', color: d.C.orange }, { label: 'f″(x)', color: d.C.purple }]);
    d.readout(s => {
      const F = shapeF(s.fn);
      const roots = [], infl = [];
      for (let x = -2.4; x <= 2.4; x += .005) {
        if (F.d1(x) * F.d1(x + .005) < 0) roots.push(x.toFixed(2));
        if (F.d2(x) * F.d2(x + .005) < 0) infl.push(x.toFixed(2));
      }
      const uniq = a => [...new Set(a.map(v => (+v).toFixed(1)))];
      return [
        { label: '驻点 f′=0（约）', value: uniq(roots).join(', ') || '无' },
        { label: '拐点候选 f″=0（约）', value: uniq(infl).join(', ') || '无', cls: 'alt' },
        { label: '备注', value: 'f′>0 递增；f″>0 凹（开口向上）' },
      ];
    });
  },
  draw(d) {
    const F = shapeF(d.state.fn);
    const p = d.plot([-2.4, 2.4], [-4, 4]).grid({ xlabel: 'x', ylabel: 'y' });
    p.clip();
    p.curve(F.f, d.C.primary, 2.6); p.curve(F.d1, d.C.orange, 2); p.curve(F.d2, d.C.purple, 2);
    p.unclip();
  }
});
function shapeF(k) {
  return k === 'quartic' ? { f: x => x ** 4 - 2 * x * x, d1: x => 4 * x ** 3 - 4 * x, d2: x => 12 * x * x - 4 }
    : k === 'sin' ? { f: x => 3 * Math.sin(x), d1: x => 3 * Math.cos(x), d2: x => -3 * Math.sin(x) }
    : { f: x => x ** 3 - 3 * x, d1: x => 3 * x * x - 3, d2: x => 6 * x };
}

/* ============ 第 3 章：牛顿迭代 ============ */
V.reg('newton', {
  w: 760, h: 330,
  setup(d) {
    d.segment('方程', 'fn', [
      { label: 'x³−x−1=0', value: 'a' }, { label: 'x³−2x+2=0', value: 'b' }, { label: 'cos x − x = 0', value: 'c' }
    ], 'a');
    d.slider('初值 x₀', 'x0', -1.5, 3, 0.01, 1.8, x => x.toFixed(2));
    d.slider('迭代步数', 'steps', 1, 8, 1, 4, x => String(x));
    d.legend([{ label: 'f(x)', color: d.C.primary }, { label: '迭代切线', color: d.C.orange }, { label: '零点', color: d.C.accent }]);
    d.readout(s => {
      const F = newtonF(s.fn); let x = s.x0, seq = [x];
      for (let i = 0; i < s.steps; i++) { const der = F.df(x); if (Math.abs(der) < 1e-9) break; x = x - F.f(x) / der; if (!isFinite(x) || Math.abs(x) > 50) break; seq.push(x); }
      return [
        { label: '迭代序列', value: seq.slice(0, 6).map(v => v.toFixed(4)).join(' → ') },
        { label: '当前 f(x)', value: F.f(seq[seq.length - 1]).toExponential(2), cls: 'alt' },
        { label: '状态', value: Math.abs(F.f(seq[seq.length - 1])) < 1e-6 ? '已收敛' : '仍在逼近', cls: 'warn' },
      ];
    });
  },
  draw(d) {
    const { fn, x0, steps } = d.state, F = newtonF(fn);
    const p = d.plot([-2, 3], [-6, 8]).grid({ xlabel: 'x', ylabel: 'f(x)' });
    p.clip(); p.curve(F.f, d.C.primary, 2.5); p.unclip();
    let x = x0;
    for (let i = 0; i < steps; i++) {
      const y = F.f(x), der = F.df(x);
      if (!isFinite(y) || Math.abs(der) < 1e-9) break;
      const xn = x - y / der;
      p.line(x - 1.6, y + der * (-1.6), x + 1.6, y + der * 1.6, hexA(d.C.orange, .85), 1.4, [5, 4]);
      p.dot(x, y, d.C.orange, 3.5); p.dot(xn, 0, d.C.accent, 3.5);
      p.line(x, y, xn, 0, hexA(d.C.text, .35), 1, [2, 3]);
      x = xn;
      if (!isFinite(x) || Math.abs(x) > 20) break;
    }
    p.text('f(x)=0 的近似根', p.W - 16, p.pad.t + 14, d.C.text, 'right');
  }
});
function newtonF(k) {
  return k === 'b' ? { f: x => x ** 3 - 2 * x + 2, df: x => 3 * x * x - 2 }
    : k === 'c' ? { f: x => Math.cos(x) - x, df: x => -Math.sin(x) - 1 }
    : { f: x => x ** 3 - x - 1, df: x => 3 * x * x - 1 };
}

/* ============ 第 4 章：原函数族 ============ */
V.reg('antiderivative', {
  w: 760, h: 310,
  setup(d) {
    d.segment('f(x)', 'fn', [
      { label: '2x', value: 'x' }, { label: 'cos x', value: 'cos' }, { label: 'e^x', value: 'exp' }
    ], 'x');
    d.slider('常数 C', 'C', -3, 3, 0.1, 0, x => x.toFixed(1));
    d.legend([{ label: '导函数 f(x)', color: d.C.orange }, { label: '原函数族 F(x)+C', color: d.C.primary }, { label: '当前 F(x)+C', color: d.C.accent }]);
    d.readout(s => [
      { label: 'F(x) + C', value: `F(x) ${s.C >= 0 ? '+' : '−'} ${Math.abs(s.C).toFixed(1)}` },
      { label: 'F′(x) = f(x)', value: s.fn === 'x' ? '2x' : s.fn === 'cos' ? 'cos x' : 'e^x' },
      { label: '任意两条曲线', value: '竖直距离恒为常数', cls: 'alt' },
    ]);
  },
  draw(d) {
    const F = d.state.fn === 'cos' ? { f: Math.cos, F: Math.sin, d: x => Math.cos(x) }
      : d.state.fn === 'exp' ? { f: x => Math.exp(x), F: x => Math.exp(x), d: x => Math.exp(x) }
      : { f: x => 2 * x, F: x => x * x, d: x => 2 * x };
    const p = d.plot([-3, 3], [-4, 6]).grid({ xlabel: 'x', ylabel: 'y' });
    p.clip();
    p.curve(F.d, d.C.orange, 2, [6, 4]);
    for (let c = -3; c <= 3; c += 1) p.curve(x => F.F(x) + c, hexA(d.C.primary, .35), 1.5);
    p.curve(x => F.F(x) + d.state.C, d.C.accent, 2.8);
    p.unclip();
  }
});

/* ============ 第 5 章：黎曼和 ============ */
V.reg('riemann', {
  w: 760, h: 340,
  setup(d) {
    d.segment('函数', 'fn', [
      { label: 'x²', value: 'sq' }, { label: 'sin x', value: 'sin' }, { label: 'e^x', value: 'exp' }, { label: '1/x', value: 'inv' }
    ], 'sq');
    d.segment('取样', 'mode', [
      { label: '左端点', value: 'L' }, { label: '右端点', value: 'R' }, { label: '中点', value: 'M' }, { label: '梯形', value: 'T' }
    ], 'M');
    d.slider('分割数 n', 'n', 1, 80, 1, 8, x => String(x));
    d.legend([{ label: 'f(x)', color: d.C.primary }, { label: '黎曼和矩形 / 梯形', color: hexA(d.C.primary, .35) }]);
    d.readout(s => {
      const F = rieF(s.fn), a = F.a, b = F.b, n = s.n, h = (b - a) / n;
      let sum = 0;
      for (let i = 0; i < n; i++) {
        const l = a + i * h, r = l + h;
        if (s.mode === 'T') sum += (F.f(l) + F.f(r)) * h / 2;
        else { const x = s.mode === 'L' ? l : s.mode === 'R' ? r : (l + r) / 2; sum += F.f(x) * h; }
      }
      return [
        { label: '黎曼和 Sₙ', value: sum.toFixed(6) },
        { label: '精确值 ∫ₐᵇf dx', value: F.exact.toFixed(6), cls: 'alt' },
        { label: '误差', value: Math.abs(sum - F.exact).toExponential(2), cls: 'warn' },
        { label: 'Δx', value: h.toFixed(4) },
      ];
    });
  },
  draw(d) {
    const { fn, n, mode } = d.state, F = rieF(fn), a = F.a, b = F.b, h = (b - a) / n;
    const p = d.plot([a - .15, b + .15], [-0.3, F.ymax]).grid({ xlabel: 'x', ylabel: 'f(x)' });
    p.clip();
    for (let i = 0; i < n; i++) {
      const l = a + i * h, r = l + h;
      if (mode === 'T') p.poly([[l, 0], [l, F.f(l)], [r, F.f(r)], [r, 0]], hexA(d.C.primary, .22), hexA(d.C.primary, .55));
      else {
        const x = mode === 'L' ? l : mode === 'R' ? r : (l + r) / 2;
        p.rect(l, 0, r, F.f(x), hexA(d.C.primary, .22), hexA(d.C.primary, .55));
        if (n <= 30) p.dot(x, F.f(x), d.C.orange, 2.5);
      }
    }
    p.curve(F.f, d.C.primary, 2.5);
    p.unclip();
  }
});
function rieF(k) {
  return k === 'sin' ? { a: 0, b: Math.PI, ymax: 1.4, f: Math.sin, exact: 2 }
    : k === 'exp' ? { a: 0, b: 2, ymax: 8, f: Math.exp, exact: Math.exp(2) - 1 }
    : k === 'inv' ? { a: 1, b: 4, ymax: 1.3, f: x => 1 / x, exact: Math.log(4) }
    : { a: 0, b: 2, ymax: 4.6, f: x => x * x, exact: 8 / 3 };
}

/* ============ 第 5 章：反常积分 ============ */
V.reg('improper', {
  w: 760, h: 310,
  setup(d) {
    d.slider('幂次 p', 'p', 0.2, 3, 0.05, 2, x => x.toFixed(2));
    d.slider('积分上限 T', 'T', 1.2, 40, 0.2, 6, x => x.toFixed(1));
    d.legend([{ label: 'f(x) = 1/xᵖ', color: d.C.primary }, { label: '累积面积 ∫₁ᵀ f dx', color: hexA(d.C.accent, .35) }]);
    d.readout(s => {
      const p = s.p, T = s.T;
      const val = Math.abs(p - 1) < 1e-6 ? Math.log(T) : (Math.pow(T, 1 - p) - 1) / (1 - p);
      const lim = p > 1 ? 1 / (p - 1) : Infinity;
      return [
        { label: '∫₁ᵀ x⁻ᵖ dx', value: val.toFixed(5) },
        { label: 'p > 1 ?', value: p > 1 ? '是' : '否' },
        { label: 'T → ∞ 的极限', value: isFinite(lim) ? lim.toFixed(5) + '（收敛）' : '+∞（发散）', cls: p > 1 ? 'alt' : 'warn' },
      ];
    });
  },
  draw(d) {
    const p = d.state.p, T = d.state.T;
    const p1 = d.plot([1, 12], [0, 1.15]).grid({ xlabel: 'x', ylabel: 'f(x)' });
    p1.clip();
    p1.curve(x => Math.pow(x, -p), d.C.primary, 2.5);
    const N = 260, h = (Math.min(T, 12) - 1) / N;
    for (let i = 0; i < N; i++) { const x = 1 + i * h; p1.rect(x, 0, x + h, Math.pow(x, -p), hexA(d.C.accent, .25)); }
    p1.unclip();
    const p2w = 190, p2x = d.W - 220, p2y = 24;
    const c = d.ctx, C = d.C;
    c.save(); c.fillStyle = hexA(C.strong, .04); c.fillRect(p2x, p2y, p2w, 108);
    c.strokeStyle = C.axis; c.strokeRect(p2x, p2y, p2w, 108);
    c.font = V.FONT; c.fillStyle = C.text; c.textAlign = 'center';
    c.fillText('累积积分 I(T)', p2x + p2w / 2, p2y + 16);
    const lim = p > 1 ? 1 / (p - 1) : 6;
    const I = t => Math.abs(p - 1) < 1e-6 ? Math.log(t) : (Math.pow(t, 1 - p) - 1) / (1 - p);
    c.beginPath(); c.strokeStyle = C.accent; c.lineWidth = 2;
    for (let i = 0; i <= 200; i++) {
      const t = 1 + (T - 1) * i / 200;
      const px = p2x + 8 + (p2w - 16) * i / 200;
      const py = p2y + 100 - Math.min(I(t) / Math.max(lim, 1) * 70, 72);
      i ? c.lineTo(px, py) : c.moveTo(px, py);
    }
    c.stroke();
    if (p > 1) { c.setLineDash([4, 4]); c.strokeStyle = C.orange; c.beginPath(); const py = p2y + 100 - 70; c.moveTo(p2x + 8, py); c.lineTo(p2x + p2w - 8, py); c.stroke(); c.setLineDash([]); }
    c.fillStyle = C.text; c.textAlign = 'left'; c.fillText('T=' + T.toFixed(0), p2x + 8, p2y + 100);
    c.restore();
  }
});

/* ============ 第 6 章：极坐标曲线 ============ */
V.reg('polar', {
  w: 760, h: 340,
  setup(d) {
    d.segment('曲线族', 'kind', [
      { label: '玫瑰线', value: 'rose' }, { label: '心形线', value: 'card' },
      { label: '螺线', value: 'spiral' }, { label: '双纽线', value: 'lem' }
    ], 'rose');
    d.slider('参数 k / a', 'k', 1, 6, 1, 3, x => String(x));
    d.slider('角度上限 β', 'beta', 0.2, 6.28, 0.02, 6.28, x => x.toFixed(2));
    d.legend([{ label: '极坐标曲线', color: d.C.primary }, { label: '面积扇区（0 ≤ θ ≤ β）', color: hexA(d.C.accent, .25) }]);
    d.readout(s => {
      const rho = polarRho(s.kind, s.k);
      let A = 0; const N = 1200, h = s.beta / N;
      for (let i = 0; i < N; i++) { const r = rho(i * h + h / 2); A += .5 * r * r * h; }
      return [
        { label: 'ρ(θ)', value: s.kind === 'rose' ? `${s.k}·cos(${s.k}θ)` : s.kind === 'card' ? 'a(1+cos θ)' : s.kind === 'spiral' ? 'a·θ' : 'a√cos 2θ' },
        { label: '扇形面积 ½∫ρ²dθ', value: A.toFixed(4) },
        { label: '提示', value: '系数 ½ 来自小扇形面积', cls: 'alt' },
      ];
    });
  },
  draw(d) {
    const { kind, k, beta } = d.state, rho = polarRho(kind, k);
    const W = d.W, H = d.H, c = d.ctx, C = d.C;
    c.save(); c.translate(W / 2, H / 2);
    const S = Math.min(W, H) / 2 - 24;
    const sc = kind === 'spiral' ? S / (k * 6.3) : S / (kind === 'card' ? 2.2 * k / 3 + 1 : k * 1.15);
    c.strokeStyle = C.grid; c.lineWidth = 1;
    [0.33, 0.66, 1].forEach(t => { c.beginPath(); c.arc(0, 0, S * t, 0, Math.PI * 2); c.stroke(); });
    c.beginPath(); c.moveTo(-S, 0); c.lineTo(S, 0); c.moveTo(0, -S); c.lineTo(0, S); c.stroke();
    const pt = t => { const r = rho(t) * sc; return [r * Math.cos(t), -r * Math.sin(t)]; };
    c.beginPath();
    for (let i = 0; i <= 1400; i++) { const q = pt(6.283 * i / 1400); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }
    c.strokeStyle = C.primary; c.lineWidth = 2.4; c.stroke();
    c.beginPath(); c.moveTo(0, 0);
    for (let i = 0; i <= 300; i++) { const q = pt(beta * i / 300); c.lineTo(q[0], q[1]); }
    c.closePath(); c.fillStyle = hexA(C.accent, .22); c.fill();
    c.setLineDash([4, 4]); c.strokeStyle = C.orange; c.lineWidth = 1.5;
    const e = pt(beta); c.beginPath(); c.moveTo(0, 0); c.lineTo(e[0], e[1]); c.stroke(); c.setLineDash([]);
    c.font = V.FONT; c.fillStyle = C.text;
    c.fillText('θ', S - 12, -8); c.fillText('β = ' + beta.toFixed(2), 8, S - 8);
    c.restore();
  }
});
function polarRho(kind, k) {
  return kind === 'card' ? t => (1 + Math.cos(t)) * k / 3
    : kind === 'spiral' ? t => k * t / 3
    : kind === 'lem' ? t => { const v = Math.cos(2 * t); return v > 0 ? k * Math.sqrt(v) : 0; }
    : t => k * Math.cos(k * t);
}

/* ============ 第 6 章：旋转体体积 ============ */
V.reg('volume', {
  w: 760, h: 340,
  setup(d) {
    d.segment('母线', 'fn', [
      { label: 'y = x', value: 'lin' }, { label: 'y = x²', value: 'sq' }, { label: 'y = √x', value: 'sqrt' }
    ], 'lin');
    d.slider('积分上限 b', 'b', 0.2, 2, 0.02, 1.2, x => x.toFixed(2));
    d.slider('圆盘层数', 'n', 4, 60, 1, 16, x => String(x));
    d.legend([{ label: '母线 y = f(x)', color: d.C.primary }, { label: '圆盘法切片', color: hexA(d.C.accent, .4) }]);
    d.readout(s => {
      const F = volF(s.fn), b = s.b;
      let approx = 0; const h = b / s.n;
      for (let i = 0; i < s.n; i++) approx += Math.PI * Math.pow(F.f(i * h), 2) * h;
      return [
        { label: 'π∫₀ᵇ f²(x) dx', value: F.exact(b).toFixed(5), cls: 'alt' },
        { label: '圆盘近似（左端点）', value: approx.toFixed(5) },
        { label: '误差', value: Math.abs(approx - F.exact(b)).toFixed(5), cls: 'warn' },
      ];
    });
  },
  draw(d) {
    const { fn, b, n } = d.state, F = volF(fn);
    const p = d.plot([-0.2, 2.4], [-2.4, 2.4], { l: 42, r: 16, t: 14, b: 26 }).grid({ xlabel: 'x', ylabel: 'y' });
    p.clip();
    p.curve(F.f, d.C.primary, 2.4);
    p.curve(x => -F.f(x), hexA(d.C.primary, .55), 1.8, [5, 4]);
    const h = b / n;
    for (let i = 0; i < n; i++) {
      const x = i * h, r = F.f(x);
      p.rect(x, -r, Math.min(x + h, b), r, hexA(d.C.accent, .13), hexA(d.C.accent, .28));
    }
    p.unclip();
    p.line(b, -F.f(b), b, F.f(b), d.C.orange, 1.5, [4, 3]);
    p.text('绕 x 轴旋转 → 圆锥/旋转抛物体', d.W - 16, p.pad.t + 14, d.C.text, 'right');
  }
});
function volF(k) {
  return k === 'sq' ? { f: x => x * x, exact: b => Math.PI * Math.pow(b, 5) / 5 }
    : k === 'sqrt' ? { f: Math.sqrt, exact: b => Math.PI * b * b / 2 }
    : { f: x => x, exact: b => Math.PI * b * b * b / 3 };
}

})();
