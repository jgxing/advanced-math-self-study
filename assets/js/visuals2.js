/* ===== 交互式可视化：第 7—12 章演示 ===== */
(function () {
'use strict';
const V = window.VISUALS;
const hexA = V.hexA, FONT = V.FONT, MONO = V.MONO;

function rk4(f, x, y, h) {
  const k1 = f(x, y), k2 = f(x + h / 2, y + h / 2 * k1), k3 = f(x + h / 2, y + h / 2 * k2), k4 = f(x + h, y + h * k3);
  return y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4);
}
function proj3(x, y, z, s, ang, tilt, cx, cy) {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const X = x * ca - y * sa, Y = x * sa + y * ca;
  return [cx + s * X, cy - s * (z * Math.cos(tilt) + Y * Math.sin(tilt))];
}
function arrow(ctx, x1, y1, x2, y2, color, width, head) {
  const a = Math.atan2(y2 - y1, x2 - x1), h = head || 5;
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width || 1.5;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - h * Math.cos(a - .4), y2 - h * Math.sin(a - .4));
  ctx.lineTo(x2 - h * Math.cos(a + .4), y2 - h * Math.sin(a + .4));
  ctx.closePath(); ctx.fill(); ctx.restore();
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

/* ============ 第 7 章：方向场与积分曲线 ============ */
V.reg('slopefield', {
  w: 760, h: 350, clickable: true,
  setup(d) {
    d.segment('微分方程', 'eq', [
      { label: "y' = y − x", value: 'a' }, { label: "y' = −x/y", value: 'b' },
      { label: "y' = y(1−y)", value: 'c' }, { label: "y' = sin x − 0.4y", value: 'd' }
    ], 'a');
    d.slider('初始 x₀', 'x0', -3, 3, 0.1, -1.5, x => x.toFixed(1));
    d.slider('初始 y₀', 'y0', -2, 3, 0.1, 0.5, x => x.toFixed(1));
    d.legend([{ label: '方向场（斜率线段）', color: hexA(d.C.text, .8) }, { label: '过初值点的解曲线', color: d.C.primary }, { label: '初值点', color: d.C.orange }]);
    d.readout(s => [
      { label: '初始条件', value: `y(${s.x0.toFixed(1)}) = ${s.y0.toFixed(1)}` },
      { label: '该点斜率 y′', value: slopeEq(s.eq)(s.x0, s.y0).toFixed(4) },
      { label: '提示', value: '也可直接点击画布选取初值点', cls: 'alt' },
    ]);
    d.onClick = (px, py, P) => {
      const x = Math.max(-3, Math.min(3, P.iX(px))), y = Math.max(-2, Math.min(3, P.iY(py)));
      d.state.x0 = +x.toFixed(1); d.state.y0 = +y.toFixed(1);
      const ins = d.ctrl.querySelectorAll('input[type=range]');
      if (ins[0]) { ins[0].value = d.state.x0; ins[0].nextElementSibling.textContent = d.state.x0.toFixed(1); }
      if (ins[1]) { ins[1].value = d.state.y0; ins[1].nextElementSibling.textContent = d.state.y0.toFixed(1); }
      d.render();
    };
  },
  draw(d) {
    const f = slopeEq(d.state.eq), { x0, y0 } = d.state;
    const p = d.plot([-3.4, 3.4], [-2.2, 3.2]).grid({ xlabel: 'x', ylabel: 'y' });
    const c = d.ctx, C = d.C;
    p.clip();
    for (let i = 0; i <= 25; i++) for (let j = 0; j <= 19; j++) {
      const x = -3.3 + 6.6 * i / 25, y = -2.1 + 5.2 * j / 19;
      const m = f(x, y); if (!isFinite(m) || Math.abs(m) > 30) continue;
      const L = .26, dx = L / Math.sqrt(1 + m * m), dy = m * dx;
      const X1 = p.X(x - dx), Y1 = p.Y(y - dy), X2 = p.X(x + dx), Y2 = p.Y(y + dy);
      c.strokeStyle = hexA(C.text, .55); c.lineWidth = 1.1;
      c.beginPath(); c.moveTo(X1, Y1); c.lineTo(X2, Y2); c.stroke();
    }
    const trace = (dir) => {
      let x = x0, y = y0; const pts = [[x, y]];
      for (let k = 0; k < 420; k++) {
        const h = dir * .014;
        y = rk4(f, x, y, h); x += h;
        if (!isFinite(y) || Math.abs(y) > 40 || x < -3.45 || x > 3.45 || y < -2.3 || y > 3.3) break;
        pts.push([x, y]);
      }
      return pts;
    };
    [1, -1].forEach(dir => {
      const pts = trace(dir);
      c.beginPath();
      pts.forEach((q, i) => i ? c.lineTo(p.X(q[0]), p.Y(q[1])) : c.moveTo(p.X(q[0]), p.Y(q[1])));
      c.strokeStyle = C.primary; c.lineWidth = 2.6; c.stroke();
    });
    p.unclip();
    p.dot(x0, y0, C.orange, 5, '#fff');
  }
});
function slopeEq(k) {
  return k === 'b' ? (x, y) => (Math.abs(y) < .08 ? NaN : -x / y)
    : k === 'c' ? (x, y) => y * (1 - y)
    : k === 'd' ? (x, y) => Math.sin(x) - .4 * y
    : (x, y) => y - x;
}

/* ============ 第 7 章：二阶常系数方程解的形态 ============ */
V.reg('ode-solution', {
  w: 760, h: 330,
  setup(d) {
    d.slider('阻尼 p', 'p', -1, 6, 0.1, 2, x => x.toFixed(1));
    d.slider('刚度 q', 'q', -2, 10, 0.1, 4, x => x.toFixed(1));
    d.legend([{ label: '解 y(x)，y(0)=1, y′(0)=0', color: d.C.primary }, { label: '包络（复根情形）', color: hexA(d.C.orange, .7) }]);
    d.readout(s => {
      const disc = s.p * s.p - 4 * s.q;
      const type = disc > 1e-6 ? '两相异实根（过阻尼）' : Math.abs(disc) <= 1e-6 ? '二重实根（临界阻尼）' : '共轭复根（振荡）';
      const roots = disc >= 0 ? `${(-s.p + Math.sqrt(disc)) / 2}, ${(-s.p - Math.sqrt(disc)) / 2}` : `${(-s.p / 2).toFixed(2)} ± ${(Math.sqrt(-disc) / 2).toFixed(2)}i`;
      return [
        { label: '特征方程 r²+pr+q=0', value: `r²+${s.p.toFixed(1)}r+${s.q.toFixed(1)}=0` },
        { label: '判别式 Δ = p²−4q', value: disc.toFixed(3) },
        { label: '特征根', value: roots },
        { label: '形态', value: type, cls: 'alt' },
      ];
    });
  },
  draw(d) {
    const { p: P0, q: Q0 } = d.state;
    const pl = d.plot([0, 10], [-3.5, 3.5]).grid({ xlabel: 'x', ylabel: 'y(x)' });
    const c = d.ctx, C = d.C;
    pl.clip();
    const N = 900, h = 10 / N;
    let y = 1, v = 0; const pts = [[0, 1]];
    for (let i = 0; i < N; i++) {
      const acc = (yy, vv) => -P0 * vv - Q0 * yy;
      const k1y = v, k1v = acc(y, v);
      const k2y = v + h / 2 * k1v, k2v = acc(y + h / 2 * k1y, v + h / 2 * k1v);
      const k3y = v + h / 2 * k2v, k3v = acc(y + h / 2 * k2y, v + h / 2 * k2v);
      const k4y = v + h * k3v, k4v = acc(y + h * k3y, v + h * k3v);
      y += h / 6 * (k1y + 2 * k2y + 2 * k3y + k4y);
      v += h / 6 * (k1v + 2 * k2v + 2 * k3v + k4v);
      const x = (i + 1) * h;
      if (!isFinite(y) || Math.abs(y) > 60) break;
      pts.push([x, y]);
    }
    c.beginPath();
    pts.forEach((q, i) => i ? c.lineTo(pl.X(q[0]), pl.Y(q[1])) : c.moveTo(pl.X(q[0]), pl.Y(q[1])));
    c.strokeStyle = C.primary; c.lineWidth = 2.5; c.stroke();
    const disc = P0 * P0 - 4 * Q0;
    if (disc < 0) {
      const env = x => Math.exp(-P0 / 2 * x) * (1 + Math.abs(P0 / 2) * x);
      pl.curve(env, hexA(C.orange, .7), 1.4, [5, 4]);
      pl.curve(x => -env(x), hexA(C.orange, .7), 1.4, [5, 4]);
    }
    pl.unclip();
  }
});

/* ============ 第 8 章：三维向量 ============ */
V.reg('vector3d', {
  w: 760, h: 350,
  setup(d) {
    d.segment('向量组', 'set', [
      { label: 'a=(2,1,1), b=(1,2,0)', value: 'A' },
      { label: 'a=(2,0,1), b=(0,2,1)', value: 'B' },
      { label: 'a=(1,1,0), b=(1,1,0)', value: 'C' }
    ], 'A');
    d.slider('水平旋转 θ', 'ang', -3.14, 3.14, 0.02, 0.7, x => x.toFixed(2));
    d.slider('俯仰角', 'tilt', 0.2, 1.3, 0.02, 0.62, x => x.toFixed(2));
    d.legend([{ label: '向量 a', color: d.C.primary }, { label: '向量 b', color: d.C.accent }, { label: '叉积 a×b', color: d.C.orange }, { label: '张成的平行四边形', color: hexA(d.C.purple, .3) }]);
    d.readout(s => {
      const [a, b] = vecSet(s.set), cr = cross(a, b);
      return [
        { label: 'a·b', value: dot(a, b).toFixed(2) },
        { label: '|a×b|', value: Math.hypot(...cr).toFixed(3), cls: 'alt' },
        { label: 'a×b', value: `(${cr.map(v => v.toFixed(1)).join(', ')})` },
        { label: '平行四边形面积', value: Math.hypot(...cr).toFixed(3), cls: 'warn' },
      ];
    });
  },
  draw(d) {
    const c = d.ctx, C = d.C, { ang, tilt, set } = d.state;
    const [a, b] = vecSet(set), cr = cross(a, b);
    const cx = d.W / 2, cy = d.H / 2 + 14, s = 48;
    const P = q => proj3(q[0], q[1], q[2], s, ang, tilt, cx, cy);
    c.fillStyle = C.surface; c.fillRect(0, 0, d.W, d.H);
    const O = P([0, 0, 0]);
    [[3.2, 0, 0, 'x'], [0, 3.2, 0, 'y'], [0, 0, 3.2, 'z']].forEach(ax => {
      const e = P([ax[0], ax[1], ax[2]]);
      c.strokeStyle = hexA(C.text, .9); c.lineWidth = 1; c.setLineDash([4, 4]);
      c.beginPath(); c.moveTo(O[0], O[1]); c.lineTo(e[0], e[1]); c.stroke(); c.setLineDash([]);
      c.fillStyle = C.text; c.font = MONO; c.fillText(ax[3], e[0] + 4, e[1] + 4);
    });
    const pa = P(a), pb = P(b), pc = P(cr.map(v => v / 2)), pe = P([a[0] + b[0], a[1] + b[1], a[2] + b[2]]);
    c.beginPath(); c.moveTo(O[0], O[1]); c.lineTo(pa[0], pa[1]); c.lineTo(pe[0], pe[1]); c.lineTo(pb[0], pb[1]); c.closePath();
    c.fillStyle = hexA(C.purple, .22); c.fill(); c.strokeStyle = hexA(C.purple, .6); c.lineWidth = 1.2; c.stroke();
    arrow(c, O[0], O[1], pa[0], pa[1], C.primary, 2.8, 9);
    arrow(c, O[0], O[1], pb[0], pb[1], C.accent, 2.8, 9);
    arrow(c, O[0], O[1], pc[0], pc[1], C.orange, 2.6, 9);
    c.font = FONT; c.fillStyle = C.primary; c.fillText('a', pa[0] + 7, pa[1] - 5);
    c.fillStyle = C.accent; c.fillText('b', pb[0] + 7, pb[1] - 5);
    c.fillStyle = C.orange; c.fillText('a×b', pc[0] + 7, pc[1] - 5);
  }
});
function vecSet(k) {
  return k === 'B' ? [[2, 0, 1], [0, 2, 1]] : k === 'C' ? [[1, 1, 0], [1, 1, 0]] : [[2, 1, 1], [1, 2, 0]];
}
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }

/* ============ 第 9 章：二元函数曲面 ============ */
V.reg('surface3d', {
  w: 760, h: 360,
  setup(d) {
    d.segment('曲面', 'fn', [
      { label: '马鞍面 x²−y²', value: 'saddle' }, { label: '抛物面 x²+y²', value: 'para' },
      { label: 'sin x·cos y', value: 'wave' }, { label: '高斯钟形', value: 'gauss' }
    ], 'saddle');
    d.slider('水平旋转', 'ang', -3.14, 3.14, 0.02, 0.72, x => x.toFixed(2));
    d.slider('俯仰角', 'tilt', 0.2, 1.3, 0.02, 0.66, x => x.toFixed(2));
    d.slider('切片 x = x₀', 'x0', -1.5, 1.5, 0.05, 0.5, x => x.toFixed(2));
    d.legend([{ label: '曲面线框', color: d.C.primary }, { label: 'x = x₀ 的偏导切片（y 方向）', color: d.C.orange }]);
    d.readout(s => {
      const f = surfF(s.fn), h = 1e-4;
      return [
        { label: 'f(x₀, 0)', value: f(s.x0, 0).toFixed(4) },
        { label: 'fₓ(x₀, 0)', value: ((f(s.x0 + h, 0) - f(s.x0 - h, 0)) / (2 * h)).toFixed(4), cls: 'alt' },
        { label: 'fᵧ(x₀, 0)', value: ((f(s.x0, h) - f(s.x0, -h)) / (2 * h)).toFixed(4), cls: 'alt' },
        { label: '切片含义', value: '固定 x 后，切片斜率即 fᵧ' },
      ];
    });
  },
  draw(d) {
    const c = d.ctx, C = d.C, { ang, tilt, fn, x0 } = d.state;
    const f = surfF(fn), N = 20, R = 1.8, s = 62;
    const cx = d.W / 2, cy = d.H / 2 + 18;
    const P = (x, y, z) => proj3(x, y, z, s, ang, tilt, cx, cy);
    const lines = [];
    for (let i = 0; i <= N; i++) {
      const u = -R + 2 * R * i / N;
      const lx = [], ly = [];
      for (let j = 0; j <= N; j++) {
        const v = -R + 2 * R * j / N;
        lx.push([u, v, f(u, v) * .7]); ly.push([v, u, f(v, u) * .7]);
      }
      lines.push(lx, ly);
    }
    lines.sort((A, B) => {
      const da = A.reduce((s, q) => s + q[0] * Math.sin(ang) + q[1] * Math.cos(ang), 0) / A.length;
      const db = B.reduce((s, q) => s + q[0] * Math.sin(ang) + q[1] * Math.cos(ang), 0) / B.length;
      return da - db;
    });
    c.lineWidth = 1;
    lines.forEach(L => {
      c.beginPath();
      L.forEach((q, i) => { const p = P(q[0], q[1], q[2]); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); });
      const zavg = L.reduce((s, q) => s + q[2], 0) / L.length;
      const t = Math.max(0, Math.min(1, (zavg + 1.5) / 3));
      c.strokeStyle = hexA(t > .5 ? C.primary : C.cyan, .28 + .5 * t); c.stroke();
    });
    const slice = [];
    for (let j = 0; j <= 90; j++) { const y = -R + 2 * R * j / 90; slice.push([x0, y, f(x0, y) * .7]); }
    c.beginPath();
    slice.forEach((q, i) => { const p = P(q[0], q[1], q[2]); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); });
    c.strokeStyle = C.orange; c.lineWidth = 3; c.stroke();
    const base = P(-R, -R, -1.3);
    c.beginPath(); c.moveTo(base[0], base[1]);
    [[R, -R, -1.3], [R, R, -1.3], [-R, R, -1.3], [-R, -R, -1.3]].forEach(q => { const p = P(q[0], q[1], q[2]); c.lineTo(p[0], p[1]); });
    c.strokeStyle = hexA(C.text, .55); c.lineWidth = 1; c.setLineDash([4, 4]); c.stroke(); c.setLineDash([]);
    c.font = FONT; c.fillStyle = C.text; c.fillText('x = x₀ 的切片（橙色）', 14, 22);
  }
});
function surfF(k) {
  return k === 'para' ? (x, y) => (x * x + y * y) * .5 - 1
    : k === 'wave' ? (x, y) => 1.1 * Math.sin(x * 1.6) * Math.cos(y * 1.6)
    : k === 'gauss' ? (x, y) => 2.2 * Math.exp(-(x * x + y * y) * 1.4) - .6
    : (x, y) => (x * x - y * y) * .55;
}

/* ============ 第 9 章：链式法则路径图 ============ */
V.reg('chain-tree', {
  w: 760, h: 300,
  setup(d) {
    d.segment('复合结构', 'lv', [
      { label: '两层 z=f(u,v)', value: 2 }, { label: '三层（含中间变量）', value: 3 }
    ], 2);
    d.legend([{ label: '自变量', color: d.C.accent }, { label: '中间变量', color: d.C.orange }, { label: '因变量', color: d.C.primary }]);
    d.readout(s => [
      { label: '规则', value: '分道相加，连线相乘' },
      { label: '路径数', value: s.lv === 2 ? '2 条（经 u、经 v）' : '4 条', cls: 'alt' },
      { label: '记得', value: '每条路径上的偏导逐层相乘，再把各路径相加' },
    ]);
  },
  draw(d) {
    const c = d.ctx, C = d.C, lv = d.state.lv;
    const node = (x, y, label, color) => {
      roundRect(c, x - 34, y - 18, 68, 36, 9);
      c.fillStyle = hexA(color, .14); c.fill(); c.strokeStyle = color; c.lineWidth = 1.6; c.stroke();
      c.fillStyle = C.strong; c.font = '14px "Microsoft YaHei",sans-serif'; c.textAlign = 'center';
      c.fillText(label, x, y + 5); c.textAlign = 'left';
    };
    const link = (x1, y1, x2, y2, label) => {
      arrow(c, x1, y1, x2, y2, hexA(C.text, .8), 1.6, 7);
      c.font = MONO; c.fillStyle = C.text; c.textAlign = 'center';
      c.fillText(label, (x1 + x2) / 2, (y1 + y2) / 2 - 7); c.textAlign = 'left';
    };
    const ys = [62, 150, 238];
    node(d.W / 2, ys[0], 'z', C.primary);
    if (lv === 2) {
      node(d.W / 2 - 140, ys[1], 'u', C.orange); node(d.W / 2 + 140, ys[1], 'v', C.orange);
      node(d.W / 2, ys[2], 'x', C.accent);
      link(d.W / 2 - 140 + 30, ys[1] - 16, d.W / 2 - 20, ys[0] + 16, '∂z/∂u');
      link(d.W / 2 + 140 - 30, ys[1] - 16, d.W / 2 + 20, ys[0] + 16, '∂z/∂v');
      link(d.W / 2 - 4, ys[2] - 16, d.W / 2 - 140 + 8, ys[1] + 17, 'du/dx');
      link(d.W / 2 + 4, ys[2] - 16, d.W / 2 + 140 - 8, ys[1] + 17, 'dv/dx');
      c.font = '14px "Microsoft YaHei",sans-serif'; c.fillStyle = C.strong; c.textAlign = 'center';
      c.fillText('∂z/∂x = (∂z/∂u)(du/dx) + (∂z/∂v)(dv/dx)', d.W / 2, 286);
    } else {
      node(d.W / 2 - 175, ys[1], 'u', C.orange); node(d.W / 2 + 175, ys[1], 'v', C.orange);
      node(d.W / 2 - 215, ys[2], 's', C.accent); node(d.W / 2 - 75, ys[2], 't', C.accent);
      node(d.W / 2 + 75, ys[2], 's', C.accent); node(d.W / 2 + 215, ys[2], 't', C.accent);
      link(d.W / 2 - 175 + 28, ys[1] - 16, d.W / 2 - 20, ys[0] + 16, '∂z/∂u');
      link(d.W / 2 + 175 - 28, ys[1] - 16, d.W / 2 + 20, ys[0] + 16, '∂z/∂v');
      link(d.W / 2 - 215 + 10, ys[2] - 16, d.W / 2 - 175 - 12, ys[1] + 17, '∂u/∂s');
      link(d.W / 2 - 75 - 6, ys[2] - 16, d.W / 2 - 175 + 12, ys[1] + 17, '∂u/∂t');
      link(d.W / 2 + 75 + 6, ys[2] - 16, d.W / 2 + 175 - 12, ys[1] + 17, '∂v/∂s');
      link(d.W / 2 + 215 - 10, ys[2] - 16, d.W / 2 + 175 + 12, ys[1] + 17, '∂v/∂t');
      c.font = '13px "Microsoft YaHei",sans-serif'; c.fillStyle = C.strong; c.textAlign = 'center';
      c.fillText('∂z/∂s = zᵤuₛ + zᵥvₛ　　共 4 条路径（对 s、t 各 2 条）', d.W / 2, 286);
    }
    c.textAlign = 'left';
  }
});

/* ============ 第 9 章：梯度场与等值线 ============ */
V.reg('gradient', {
  w: 760, h: 350, clickable: true,
  setup(d) {
    d.segment('标量场', 'fn', [
      { label: 'x² + y²', value: 'bowl' }, { label: 'x² − y²', value: 'saddle' }, { label: 'sin x·cos y', value: 'wave' }
    ], 'bowl');
    d.slider('等值线层数', 'levels', 4, 16, 1, 9, x => String(x));
    d.legend([{ label: '标量场热力图（低→高）', color: d.C.primary }, { label: '梯度箭头 ∇f', color: d.C.orange }, { label: '选中点', color: d.C.danger }]);
    d.state.px = 1; d.state.py = 0.6;
    d.readout(s => {
      const f = gradF(s.fn), h = 1e-4;
      const gx = (f(s.px + h, s.py) - f(s.px - h, s.py)) / (2 * h);
      const gy = (f(s.px, s.py + h) - f(s.px, s.py - h)) / (2 * h);
      return [
        { label: '选中点', value: `(${s.px.toFixed(2)}, ${s.py.toFixed(2)})` },
        { label: '∇f', value: `(${gx.toFixed(2)}, ${gy.toFixed(2)})`, cls: 'alt' },
        { label: '最大方向导数 |∇f|', value: Math.hypot(gx, gy).toFixed(3) },
        { label: 'f 值', value: f(s.px, s.py).toFixed(3) },
      ];
    });
    d.onClick = (px, py, P) => { d.state.px = Math.max(-3, Math.min(3, P.iX(px))); d.state.py = Math.max(-2.2, Math.min(2.2, P.iY(py))); d.render(); };
  },
  draw(d) {
    const c = d.ctx, C = d.C, { fn, levels, px, py } = d.state;
    const f = gradF(fn), h = 1e-3;
    const p = d.plot([-3, 3], [-2.2, 2.2], { l: 40, r: 14, t: 14, b: 26 });
    const gw = 152, gh = 88;
    const off = document.createElement('canvas'); off.width = gw; off.height = gh;
    const oc = off.getContext('2d'), img = oc.createImageData(gw, gh);
    let mn = Infinity, mx = -Infinity;
    const vals = new Float64Array(gw * gh);
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
      const x = -3 + 6 * (i + .5) / gw, y = 2.2 - 4.4 * (j + .5) / gh;
      const v = f(x, y); vals[j * gw + i] = v; if (v < mn) mn = v; if (v > mx) mx = v;
    }
    for (let k = 0; k < vals.length; k++) {
      const t = (vals[k] - mn) / (mx - mn || 1);
      const r = Math.round(255 * (1 - t) + 66 * t), g = Math.round(255 * (1 - t) + 87 * t), b = Math.round(255 * (1 - t) + 214 * t);
      img.data[k * 4] = C.dark ? Math.round(r * .35 + 30) : r;
      img.data[k * 4 + 1] = C.dark ? Math.round(g * .35 + 33) : g;
      img.data[k * 4 + 2] = C.dark ? Math.round(b * .4 + 43) : b;
      img.data[k * 4 + 3] = 235;
    }
    oc.putImageData(img, 0, 0);
    c.save(); c.beginPath(); c.rect(p.pad.l, p.pad.t, p.W - p.pad.l - p.pad.r, p.H - p.pad.t - p.pad.b); c.clip();
    c.imageSmoothingEnabled = true;
    c.drawImage(off, p.pad.l, p.pad.t, p.W - p.pad.l - p.pad.r, p.H - p.pad.t - p.pad.b);
    for (let lv = 1; lv <= levels; lv++) {
      const target = mn + (mx - mn) * lv / (levels + 1);
      c.strokeStyle = hexA(C.strong, .16); c.lineWidth = 1;
      for (let j = 0; j < gh - 1; j++) for (let i = 0; i < gw - 1; i++) {
        const v = [vals[j * gw + i], vals[j * gw + i + 1], vals[(j + 1) * gw + i + 1], vals[(j + 1) * gw + i]];
        const vmin = Math.min(...v), vmax = Math.max(...v);
        if (target >= vmin && target <= vmax) {
          const X0 = p.pad.l + (p.W - p.pad.l - p.pad.r) * i / gw, Y0 = p.pad.t + (p.H - p.pad.t - p.pad.b) * j / gh;
          const cw = (p.W - p.pad.l - p.pad.r) / gw, ch = (p.H - p.pad.t - p.pad.b) / gh;
          c.beginPath(); c.moveTo(X0 + cw / 2, Y0); c.lineTo(X0 + cw, Y0 + ch / 2); c.stroke();
        }
      }
    }
    for (let i = 0; i <= 14; i++) for (let j = 0; j <= 9; j++) {
      const x = -2.8 + 5.6 * i / 14, y = -2 + 4 * j / 9;
      const gx = (f(x + h, y) - f(x - h, y)) / (2 * h), gy = (f(x, y + h) - f(x, y - h)) / (2 * h);
      const m = Math.hypot(gx, gy); if (m < 1e-8) continue;
      const L = 12, ux = gx / m * L, uy = gy / m * L;
      arrow(c, p.X(x) - ux / 2, p.Y(y) + uy / 2, p.X(x) + ux / 2, p.Y(y) - uy / 2, hexA(C.orange, .85), 1.3, 4);
    }
    const g0x = (f(px + h, py) - f(px - h, py)) / (2 * h), g0y = (f(px, py + h) - f(px, py - h)) / (2 * h);
    const m0 = Math.hypot(g0x, g0y) || 1;
    arrow(c, p.X(px), p.Y(py), p.X(px) + g0x / m0 * 46, p.Y(py) - g0y / m0 * 46, C.danger, 3, 9);
    c.restore();
    p.dot(px, py, C.danger, 5, '#fff');
    p.grid({ xlabels: true, ylabels: true, xlabel: 'x', ylabel: 'y' });
  }
});
function gradF(k) {
  return k === 'saddle' ? (x, y) => x * x - y * y
    : k === 'wave' ? (x, y) => 2 * Math.sin(x) * Math.cos(y)
    : (x, y) => x * x + y * y;
}

/* ============ 第 10 章：积分区域与扫描线 ============ */
V.reg('region2d', {
  w: 760, h: 340,
  setup(d) {
    d.segment('区域 D', 'region', [
      { label: 'y=x² 与 y=x', value: 'A' }, { label: '单位圆', value: 'B' }, { label: '三角形', value: 'C' }
    ], 'A');
    d.segment('扫描方向', 'scan', [
      { label: 'X 型（竖扫）', value: 'X' }, { label: 'Y 型（横扫）', value: 'Y' }, { label: '极坐标', value: 'P' }
    ], 'X');
    d.slider('扫描线密度', 'n', 3, 22, 1, 10, x => String(x));
    d.legend([{ label: '积分区域 D', color: hexA(d.C.primary, .4) }, { label: '扫描线 / 微元', color: d.C.orange }]);
    d.readout(s => {
      const expr = {
        A: { X: '∫₀¹dx ∫_{x²}^{x} f dy', Y: '∫₀¹dy ∫_{y}^{√y} f dx', P: '极坐标：θ∈[0,π/4], r∈[0, sinθ/cos²θ]' },
        B: { X: '∫₋₁¹dx ∫_{−√(1−x²)}^{√(1−x²)} f dy', Y: '∫₋₁¹dy ∫_{−√(1−y²)}^{√(1−y²)} f dx', P: '∫₀^{2π}dθ ∫₀¹ f·r dr' },
        C: { X: '∫₀¹dx ∫₀^{1−x} f dy', Y: '∫₀¹dy ∫₀^{1−y} f dx', P: '极坐标：θ∈[0,π/2], r∈[0, 1/(cosθ+sinθ)]' }
      };
      return [
        { label: '累次积分', value: expr[s.region][s.scan] },
        { label: '关键', value: s.scan === 'P' ? '面积元 r dr dθ' : '上限一般是外层变量的函数', cls: 'alt' },
      ];
    });
  },
  draw(d) {
    const { region, scan, n } = d.state, C = d.C, c = d.ctx;
    const p = d.plot([-1.4, 1.6], [-1.3, 1.4], { l: 42, r: 14, t: 14, b: 26 });
    p.grid({ xlabel: 'x', ylabel: 'y' });
    const inside = (x, y) => region === 'B' ? (x * x + y * y <= 1) : region === 'C' ? (x >= 0 && y >= 0 && x + y <= 1) : (x >= 0 && x <= 1 && y >= x * x && y <= x && y <= 1);
    const cw = 5, ch = 5;
    c.fillStyle = hexA(C.primary, .22);
    for (let px = p.pad.l; px < p.W - p.pad.r; px += cw) for (let py = p.pad.t; py < p.H - p.pad.b; py += ch) {
      if (inside(p.iX(px + cw / 2), p.iY(py + ch / 2))) c.fillRect(px, py, cw, ch);
    }
    p.clip();
    if (region !== 'B') {
      if (region === 'A') { p.curve(x => x * x, C.primary, 2); p.curve(x => x, C.primary, 2); }
      else { p.line(0, 1, 1, 0, C.primary, 2); p.line(0, 0, 1, 0, C.primary, 2); p.line(0, 0, 0, 1, C.primary, 2); }
    } else {
      c.beginPath(); c.arc(p.X(0), p.Y(0), (p.X(1) - p.X(0)), 0, Math.PI * 2); c.strokeStyle = C.primary; c.lineWidth = 2; c.stroke();
    }
    if (scan === 'P') {
      for (let k = 0; k < 12; k++) {
        const t = Math.PI * 2 * k / 12;
        p.line(0, 0, 1.35 * Math.cos(t), 1.35 * Math.sin(t), hexA(C.orange, .45), 1, [3, 3]);
      }
      for (let r = .3; r <= 1.2; r += .3) {
        c.beginPath(); c.arc(p.X(0), p.Y(0), (p.X(r) - p.X(0)), 0, Math.PI * 2);
        c.strokeStyle = hexA(C.orange, .5); c.lineWidth = 1; c.stroke();
      }
    } else {
      for (let k = 1; k <= n; k++) {
        const t = k / (n + 1);
        if (scan === 'X') {
          const x = -1.2 + 2.6 * t;
          let lo = -1.3, hi = 1.4;
          for (let y = -1.3; y < 1.4; y += .01) if (inside(x, y)) { lo = Math.min(lo, y); hi = Math.max(hi, y); }
          if (hi > lo) { p.line(x, lo, x, hi, hexA(C.orange, .85), 1.6); p.dot(x, (lo + hi) / 2, C.orange, 2); }
        } else {
          const y = -1.2 + 2.5 * t;
          let lo = -1.4, hi = 1.6;
          for (let x = -1.4; x < 1.6; x += .01) if (inside(x, y)) { lo = Math.min(lo, x); hi = Math.max(hi, x); }
          if (hi > lo) { p.line(lo, y, hi, y, hexA(C.orange, .85), 1.6); p.dot((lo + hi) / 2, y, C.orange, 2); }
        }
      }
    }
    p.unclip();
  }
});

/* ============ 第 11 章：格林公式 ============ */
V.reg('green', {
  w: 760, h: 340,
  setup(d) {
    d.segment('向量场 (P, Q)', 'field', [
      { label: '(−y/2, x/2)', value: 'A' }, { label: '(−y, x)', value: 'B' }, { label: '(x, y)', value: 'C' }
    ], 'A');
    d.segment('闭曲线 L', 'path', [
      { label: '圆', value: 'circle' }, { label: '正方形', value: 'square' }, { label: '椭圆', value: 'ellipse' }
    ], 'circle');
    d.legend([{ label: '向量场', color: hexA(d.C.text, .8) }, { label: '正向闭曲线 L（逆时针）', color: d.C.primary }, { label: '围成区域 D', color: hexA(d.C.accent, .25) }]);
    d.readout(s => {
      const F = greenField(s.field), path = greenPath(s.path);
      let circ = 0; const N = 2000;
      for (let i = 0; i < N; i++) {
        const t = 2 * Math.PI * i / N, t2 = 2 * Math.PI * (i + 1) / N;
        const q = path(t), q2 = path(t2);
        const [P, Q] = F((q[0] + q2[0]) / 2, (q[1] + q2[1]) / 2);
        circ += P * (q2[0] - q[0]) + Q * (q2[1] - q[1]);
      }
      const curl = F.curl, area = s.path === 'circle' ? Math.PI * 1.2 * 1.2 : s.path === 'square' ? 4 * 1.1 * 1.1 : Math.PI * 1.5 * .9;
      return [
        { label: '∮ₗ Pdx+Qdy（数值）', value: circ.toFixed(5) },
        { label: '∬_D (Qₓ−Pᵧ)dA = 旋度×面积', value: (curl * area).toFixed(5), cls: 'alt' },
        { label: '旋度 Qₓ−Pᵧ', value: curl.toFixed(2) },
        { label: '两者之差', value: Math.abs(circ - curl * area).toFixed(5), cls: 'warn' },
      ];
    });
  },
  draw(d) {
    const { field, path } = d.state, C = d.C, c = d.ctx;
    const F = greenField(field), pathF = greenPath(path);
    const p = d.plot([-2.6, 2.6], [-2.1, 2.1], { l: 40, r: 14, t: 14, b: 26 });
    p.grid({ xlabel: 'x', ylabel: 'y' });
    const N = 240, pts = [];
    for (let i = 0; i <= N; i++) pts.push(pathF(2 * Math.PI * i / N));
    c.beginPath(); pts.forEach((q, i) => i ? c.lineTo(p.X(q[0]), p.Y(q[1])) : c.moveTo(p.X(q[0]), p.Y(q[1])));
    c.closePath(); c.fillStyle = hexA(C.accent, .18); c.fill();
    c.strokeStyle = C.primary; c.lineWidth = 2.6; c.stroke();
    for (let i = 1; i <= 11; i++) for (let j = 1; j <= 8; j++) {
      const x = -2.4 + 4.8 * i / 12, y = -1.9 + 3.8 * j / 9;
      const [P, Q] = F(x, y), m = Math.hypot(P, Q) || 1;
      const L = 13, ux = P / m * L, uy = Q / m * L;
      arrow(c, p.X(x) - ux / 2, p.Y(y) + uy / 2, p.X(x) + ux / 2, p.Y(y) - uy / 2, hexA(C.text, .8), 1.2, 4);
    }
    [0.08, 0.32, 0.57, 0.82].forEach(t => {
      const q = pathF(2 * Math.PI * t), q2 = pathF(2 * Math.PI * (t + .012));
      arrow(c, p.X(q[0]), p.Y(q[1]), p.X(q2[0]), p.Y(q2[1]), C.orange, 2.4, 8);
    });
    c.font = FONT; c.fillStyle = C.text; c.fillText('D', p.X(0) - 4, p.Y(0) + 5);
  }
});
function greenField(k) {
  if (k === 'B') { const f = (x, y) => [-y, x]; f.curl = 2; return f; }
  if (k === 'C') { const f = (x, y) => [x, y]; f.curl = 0; return f; }
  const f = (x, y) => [-y / 2, x / 2]; f.curl = 1; return f;
}
function greenPath(k) {
  return k === 'square' ? t => {
    const u = (t / (2 * Math.PI) * 4) % 4, a = 1.1;
    if (u < 1) return [-a + 2 * a * u, -a];
    if (u < 2) return [a, -a + 2 * a * (u - 1)];
    if (u < 3) return [a - 2 * a * (u - 2), a];
    return [-a, a - 2 * a * (u - 3)];
  } : k === 'ellipse' ? t => [1.5 * Math.cos(t), .9 * Math.sin(t)]
    : t => [1.2 * Math.cos(t), 1.2 * Math.sin(t)];
}

/* ============ 第 12 章：级数部分和 ============ */
V.reg('series', {
  w: 760, h: 330,
  setup(d) {
    d.segment('级数', 'kind', [
      { label: '几何 Σ(1/2)ⁿ', value: 'geo' }, { label: '调和 Σ1/n', value: 'harm' },
      { label: 'p=2：Σ1/n²', value: 'p2' }, { label: '交错调和', value: 'alt' }
    ], 'geo');
    d.slider('显示到 N', 'N', 5, 400, 1, 30, x => String(x));
    d.legend([{ label: '部分和 Sₙ', color: d.C.primary }, { label: '和 / 极限', color: d.C.accent }, { label: '通项 uₙ', color: hexA(d.C.orange, .7) }]);
    d.readout(s => {
      const S = seriesF(s.kind);
      let sum = 0, u = 0;
      for (let n = 1; n <= s.N; n++) { u = S.u(n); sum += u; }
      return [
        { label: 'S_N', value: sum.toFixed(6) },
        { label: 'u_N', value: u.toExponential(2) },
        { label: '级数', value: S.conv ? (S.lim ? '收敛，S = ' + S.lim.toFixed(5) : '收敛') : '发散', cls: S.conv ? 'alt' : 'warn' },
        { label: '必要条件检查', value: Math.abs(u) < 1e-3 ? 'uₙ → 0（但未必收敛）' : 'uₙ 仍较大' },
      ];
    });
  },
  draw(d) {
    const { kind, N } = d.state, S = seriesF(kind);
    const ymax = kind === 'harm' ? Math.max(6, Math.log(N) + 1.6) : kind === 'geo' ? 2.3 : kind === 'p2' ? 1.9 : 1.1;
    const p = d.plot([0, N], [-0.1, ymax]).grid({ xlabel: 'n', ylabel: 'Sₙ' });
    if (S.lim) p.pline(p.pad.l, p.Y(S.lim), p.W - p.pad.r, p.Y(S.lim), d.C.accent, 1.6, [6, 4]);
    p.clip();
    let sum = 0; const pts = [];
    const stride = Math.max(1, Math.floor(N / 500));
    for (let n = 1; n <= N; n++) { sum += S.u(n); if (n % stride === 0 || n === N) pts.push([n, sum, S.u(n)]); }
    const c = d.ctx;
    c.beginPath(); pts.forEach((q, i) => i ? c.lineTo(p.X(q[0]), p.Y(q[1])) : c.moveTo(p.X(q[0]), p.Y(q[1])));
    c.strokeStyle = d.C.primary; c.lineWidth = 2.4; c.stroke();
    if (N <= 60) {
      pts.forEach(q => { c.beginPath(); c.arc(p.X(q[0]), p.Y(q[2] * Math.min(1, ymax / 2)), 2.5, 0, 6.284); c.fillStyle = hexA(d.C.orange, .7); c.fill(); });
    }
    p.unclip();
    if (S.lim) p.text('S = ' + S.lim.toFixed(4), p.W - 60, p.Y(S.lim) - 7, d.C.accent);
  }
});
function seriesF(k) {
  return k === 'harm' ? { u: n => 1 / n, conv: false, lim: null }
    : k === 'p2' ? { u: n => 1 / (n * n), conv: true, lim: Math.PI * Math.PI / 6 }
    : k === 'alt' ? { u: n => Math.pow(-1, n - 1) / n, conv: true, lim: Math.LN2 }
    : { u: n => Math.pow(.5, n), conv: true, lim: 1 };
}

/* ============ 第 12 章：傅里叶逼近 ============ */
V.reg('fourier', {
  w: 760, h: 330,
  setup(d) {
    d.segment('目标波形', 'wave', [
      { label: '方波', value: 'square' }, { label: '锯齿波', value: 'saw' }, { label: '三角波', value: 'tri' }
    ], 'square');
    d.slider('谐波项数 N', 'N', 1, 40, 1, 5, x => String(x));
    d.legend([{ label: '目标函数 f(x)', color: hexA(d.C.text, .9) }, { label: '傅里叶部分和 S_N(x)', color: d.C.primary }, { label: '逼近误差', color: d.C.orange }]);
    d.readout(s => {
      const f = fourierF(s.wave), N = s.N;
      let sq = 0, over = 0;
      for (let i = 0; i <= 600; i++) {
        const x = -Math.PI + 2 * Math.PI * i / 600;
        const v = f.S(x, N); sq += Math.pow(v - f.f(x), 2);
        if (s.wave !== 'tri') over = Math.max(over, Math.abs(v));
      }
      return [
        { label: '谐波项数', value: 'N = ' + N },
        { label: '均方误差', value: (sq / 601).toFixed(5), cls: 'alt' },
        { label: '峰值 |S_N|', value: over.toFixed(4) },
        { label: '吉布斯现象', value: s.wave === 'tri' ? '三角波连续，无明显过冲' : '间断点附近约 9% 过冲，不随 N 增大而消失', cls: 'warn' },
      ];
    });
  },
  draw(d) {
    const { wave, N } = d.state, F = fourierF(wave);
    const p = d.plot([-Math.PI, Math.PI], [-1.7, 1.7]).grid({ xlabel: 'x', ylabel: 'f(x)' });
    p.clip();
    p.curve(F.f, hexA(d.C.strong, .42), 2, [6, 4], 900);
    p.curve(x => F.S(x, N), d.C.primary, 2.4, null, 900);
    p.curve(x => F.S(x, N) - F.f(x), hexA(d.C.orange, .55), 1.2, [3, 3], 900);
    p.unclip();
    for (const x of [-Math.PI, 0, Math.PI]) p.line(x, -1.7, x, 1.7, hexA(d.C.text, .4), 1, [3, 4]);
    p.text('−π', p.X(-Math.PI) + 4, p.Y(-1.55), d.C.text);
    p.text('0', p.X(0) + 4, p.Y(-1.55), d.C.text);
    p.text('π', p.X(Math.PI) - 14, p.Y(-1.55), d.C.text);
  }
});
function fourierF(k) {
  if (k === 'saw') return {
    f: x => ((x + Math.PI) / (2 * Math.PI) * 2 - 1),
    S: (x, N) => { let s = 0; for (let n = 1; n <= N; n++) s += 2 / Math.PI * Math.pow(-1, n + 1) * Math.sin(n * x) / n; return s; }
  };
  if (k === 'tri') return {
    f: x => 1 - 2 * Math.abs(x) / Math.PI,
    S: (x, N) => { let s = 0; for (let n = 1; n <= N; n++) { const m = 2 * n - 1; s += 8 / (Math.PI * Math.PI) * Math.pow(-1, n - 1) * Math.cos(m * x) / (m * m); } return s; }
  };
  return {
    f: x => Math.sin(x) >= 0 ? 1 : -1,
    S: (x, N) => { let s = 0; for (let n = 1; n <= N; n++) { const m = 2 * n - 1; s += 4 / Math.PI * Math.sin(m * x) / m; } return s; }
  };
}

})();
