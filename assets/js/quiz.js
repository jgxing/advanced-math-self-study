/* ===== 学习记录（localStorage）与练习系统 ===== */
(function () {
'use strict';
const KEY = 'shuxing-gaoshu-v1';
const todayStr = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

const DEFAULT = {
  version: 1, theme: 'light',
  read: {},            // chId -> [sectionId]
  finished: {},        // chId -> timestamp
  answered: {},        // qId -> {c:正确次数, w:错误次数, last:ts}
  wrong: [],           // qId 数组
  sessions: [],        // {date, total, correct, mode}
  checkin: [],         // 日期字符串
  bookmarks: []
};
let data;
try { data = Object.assign({}, DEFAULT, JSON.parse(localStorage.getItem(KEY) || '{}')); }
catch (e) { data = Object.assign({}, DEFAULT); }
for (const k of Object.keys(DEFAULT)) if (data[k] === undefined) data[k] = Array.isArray(DEFAULT[k]) ? [] : DEFAULT[k];

const Store = window.Store = {
  get: () => data,
  save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* 隐私模式下忽略 */ } },
  theme(v) { if (v) { data.theme = v; this.save(); } return data.theme; },
  checkin() {
    const t = todayStr();
    if (!data.checkin.includes(t)) { data.checkin.push(t); this.save(); }
  },
  streak() {
    const set = new Set(data.checkin); let n = 0;
    const d = new Date();
    if (!set.has(todayStr())) d.setDate(d.getDate() - 1);
    for (; ;) {
      const s = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      if (!set.has(s)) break;
      n++; d.setDate(d.getDate() - 1);
    }
    return n;
  },
  markRead(ch, sec) {
    const a = data.read[ch] || (data.read[ch] = []);
    if (!a.includes(sec)) { a.push(sec); this.save(); }
  },
  finishCh(ch) { data.finished[ch] = Date.now(); this.save(); },
  unfinishCh(ch) { delete data.finished[ch]; this.save(); },
  readRatio(ch) {
    const c = window.CHAPTERS.find(x => x.id === ch);
    if (!c) return 0;
    const a = data.read[ch] || [];
    return Math.min(1, a.length / c.sections.length);
  },
  chapterDone() { return Object.keys(data.finished).length; },
  stats() {
    let total = 0, correct = 0;
    Object.values(data.answered).forEach(a => { total += a.c + a.w; correct += a.c; });
    return { total, correct, rate: total ? Math.round(correct / total * 100) : 0, wrong: data.wrong.length, sessions: data.sessions.length };
  },
  record(qid, ok) {
    const a = data.answered[qid] || (data.answered[qid] = { c: 0, w: 0, last: 0 });
    if (ok) a.c++; else a.w++;
    a.last = Date.now();
    const i = data.wrong.indexOf(qid);
    if (!ok && i < 0) data.wrong.push(qid);
    if (ok && i >= 0 && a.w <= a.c) data.wrong.splice(i, 1);
    this.save();
  },
  removeWrong(qid) { const i = data.wrong.indexOf(qid); if (i >= 0) { data.wrong.splice(i, 1); this.save(); } },
  session(r) { data.sessions.push(Object.assign({ date: Date.now() }, r)); if (data.sessions.length > 200) data.sessions.shift(); this.save(); },
  toggleBookmark(id) {
    const i = data.bookmarks.indexOf(id);
    if (i >= 0) data.bookmarks.splice(i, 1); else data.bookmarks.push(id);
    this.save(); return i < 0;
  },
  reset() { data = JSON.parse(JSON.stringify(DEFAULT)); this.save(); },
  export() { return JSON.stringify(data, null, 2); },
  import(txt) {
    const o = JSON.parse(txt);
    if (!o || typeof o !== 'object' || !('read' in o)) throw new Error('文件格式不正确');
    data = Object.assign({}, DEFAULT, o); this.save();
  }
};

/* ---------- 工具 ---------- */
function norm(s) {
  return String(s == null ? '' : s).trim().toLowerCase()
    .replace(/\s+/g, '').replace(/[（）()]/g, '')
    .replace(/[−–—－]/g, '-').replace(/[×·＊*]/g, '*').replace(/[÷／]/g, '/')
    .replace(/π/g, 'pi').replace(/√/g, 'sqrt').replace(/²/g, '^2').replace(/³/g, '^3')
    .replace(/＋/g, '+').replace(/\^/g, '**')
    .replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 65248));
}
function toNum(s) {
  s = norm(s);
  if (/^[+-]?\d+(\.\d+)?$/.test(s)) return +s;
  let m = s.match(/^([+-]?\d+(?:\.\d+)?)\/([+-]?\d+(?:\.\d+)?)$/); if (m) return +m[1] / +m[2];
  m = s.match(/^sqrt(\d+(?:\.\d+)?)$/); if (m) return Math.sqrt(+m[1]);
  m = s.match(/^sqrt\*\*?(\d+)$/); if (m) return Math.sqrt(+m[1]);
  if (s === 'pi') return Math.PI;
  m = s.match(/^pi\/(\d+)$/); if (m) return Math.PI / +m[1];
  m = s.match(/^(\d+)pi\/(\d+)$/); if (m) return +m[1] * Math.PI / +m[2];
  m = s.match(/^e\*\*(\d+)$/); if (m) return Math.pow(Math.E, +m[1]);
  m = s.match(/^(\d+)\/e$/); if (m) return +m[1] / Math.E;
  m = s.match(/^(\d+)e\*\*-1$/); if (m) return +m[1] / Math.E;
  return NaN;
}
function shuffle(a) { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function typeset(el) { if (window.typesetMath) window.typesetMath(el); }
function chTitle(id) { const c = window.CHAPTERS.find(x => x.id === id); return c ? c.title : id; }

/* ---------- 练习应用 ---------- */
const QA = window.QuizApp = {
  session: null,
  mount(host, params) {
    this.host = host;
    if (params && params.ch) { this.start({ mode: 'chapter', ch: params.ch, count: 99 }); return; }
    if (params && params.mode === 'wrong') { this.start({ mode: 'wrong', count: 99 }); return; }
    if (params && params.mode === 'daily') { this.start({ mode: 'daily', count: 10 }); return; }
    if (this.session && this.session.active) { this.renderQuestion(); return; }
    this.renderSetup();
  },

  /* 选组卷参数 */
  renderSetup() {
    const st = Store.stats();
    const opts = window.CHAPTERS.map(c => `<option value="${c.id}">第 ${c.no} 章 · ${c.title}</option>`).join('');
    this.host.innerHTML = `
      <div class="wrap">
        <div class="view-head fade-in">
          <div class="eyebrow">Practice Center</div>
          <h1>练习中心</h1>
          <p class="lead">即时判题 + 分步解析。答错的题会自动进入错题本，之后可以定向重练。</p>
        </div>
        <div class="grid g3 fade-in" style="margin-bottom:22px">
          <div class="stat-card card"><div class="stat-ico" style="background:var(--primary-weak);color:var(--primary)">Σ</div><div><div class="num">${st.total}</div><div class="lbl">累计作答</div></div></div>
          <div class="stat-card card"><div class="stat-ico" style="background:var(--accent-weak);color:var(--accent)">%</div><div><div class="num">${st.rate}%</div><div class="lbl">总正确率</div></div></div>
          <div class="stat-card card"><div class="stat-ico" style="background:var(--orange-weak);color:var(--orange)">!</div><div><div class="num">${st.wrong}</div><div class="lbl">待复习错题</div></div></div>
        </div>
        <div class="card panel fade-in">
          <div class="panel-head"><h2>选择练习方式</h2><span class="small muted">共 ${window.QUIZ.length} 道题</span></div>
          <div class="quiz-setup" id="modeCards">
            <button class="qs-card on" data-mode="random"><span class="qs-ico">∞</span><strong>随机综合</strong><span>全站抽题，检验整体掌握度</span></button>
            <button class="qs-card" data-mode="chapter"><span class="qs-ico">≡</span><strong>章节专练</strong><span>按章节系统刷题</span></button>
            <button class="qs-card" data-mode="wrong"><span class="qs-ico">↺</span><strong>错题重练</strong><span>${st.wrong} 道待攻克</span></button>
            <button class="qs-card" data-mode="daily"><span class="qs-ico">◎</span><strong>每日 10 题</strong><span>按日期固定组卷</span></button>
          </div>
          <div class="divider"></div>
          <div class="quiz-toolbar">
            <label class="small muted">章节</label><select id="qCh">${opts}</select>
            <label class="small muted">难度</label><select id="qDiff"><option value="0">全部</option><option value="1">基础</option><option value="2">进阶</option><option value="3">挑战</option></select>
            <label class="small muted">题量</label><select id="qCount"><option value="5">5 题</option><option value="10" selected>10 题</option><option value="20">20 题</option><option value="99">不限</option></select>
          </div>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
            <button class="btn btn-primary" id="qStart">开始练习 →</button>
            <span class="small muted" id="qHint">当前：随机综合 · 全部难度 · 10 题</span>
          </div>
        </div>
        <div class="section-title"><h2>章节掌握度</h2><span class="sub">基于答题记录</span></div>
        <div class="grid g2 fade-in">${this.chapterMastery()}</div>
      </div>`;
    const cards = this.host.querySelectorAll('.qs-card');
    cards.forEach(c => c.addEventListener('click', () => {
      cards.forEach(x => x.classList.remove('on')); c.classList.add('on'); this._mode = c.dataset.mode; this.updateHint();
    }));
    this._mode = 'random';
    ['qCh', 'qDiff', 'qCount'].forEach(id => this.host.querySelector('#' + id).addEventListener('change', () => this.updateHint()));
    this.host.querySelector('#qStart').addEventListener('click', () => {
      this.start({
        mode: this._mode,
        ch: this.host.querySelector('#qCh').value,
        diff: +this.host.querySelector('#qDiff').value,
        count: +this.host.querySelector('#qCount').value
      });
    });
  },
  chapterMastery() {
    return window.CHAPTERS.map(c => {
      const qs = window.QUIZ.filter(q => q.ch === c.id);
      let done = 0, right = 0;
      qs.forEach(q => { const a = Store.get().answered[q.id]; if (a) { done += a.c + a.w; right += a.c; } });
      const pct = qs.length ? Math.round(done / qs.length * 100) : 0;
      const rate = done ? Math.round(right / done * 100) : 0;
      return `<div class="card" style="padding:14px 16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:9px">
          <strong style="font-size:13.5px">第 ${c.no} 章 · ${c.title}</strong>
          <span class="pill ${pct > 60 ? 'pill-accent' : ''}">${done ? rate + '% 正确' : '未开始'}</span>
        </div>
        <div class="bar"><i style="width:${pct}%;background:${c.color}"></i></div>
        <div class="small muted" style="margin-top:7px">已作答 ${done} / ${qs.length} 题　·　<a href="#/chapter/${c.id}">去学习</a></div>
      </div>`;
    }).join('');
  },
  updateHint() {
    const el = this.host.querySelector('#qHint'); if (!el) return;
    const names = { random: '随机综合', chapter: '章节专练', wrong: '错题重练', daily: '每日 10 题' };
    const d = this.host.querySelector('#qDiff').value, n = this.host.querySelector('#qCount').value;
    el.textContent = `当前：${names[this._mode]} · ${d === '0' ? '全部难度' : ['', '基础', '进阶', '挑战'][+d]} · ${n === '99' ? '不限题量' : n + ' 题'}`;
  },

  /* 组卷 */
  start(cfg) {
    let pool = window.QUIZ.slice();
    if (cfg.mode === 'chapter' && cfg.ch) pool = pool.filter(q => q.ch === cfg.ch);
    if (cfg.mode === 'wrong') pool = pool.filter(q => Store.get().wrong.includes(q.id));
    if (cfg.diff) pool = pool.filter(q => q.diff === cfg.diff);
    if (cfg.mode === 'daily') {
      const seed = todayStr().split('-').join('') | 0;
      pool = pool.sort((a, b) => ((a.id.charCodeAt(3) * 31 + seed) % 97) - ((b.id.charCodeAt(3) * 31 + seed) % 97));
    } else pool = shuffle(pool);
    const count = cfg.mode === 'daily' ? 10 : cfg.count;
    const list = pool.slice(0, Math.min(count, pool.length));
    if (!list.length) {
      this.session = null;
      this.host.innerHTML = `<div class="wrap"><div class="empty-state card fade-in"><div class="big">∅</div><h3>没有符合条件的题目</h3><p class="small">换个章节或难度试试；错题本为空说明最近状态不错。</p><p style="margin-top:18px"><a class="btn btn-primary" href="#/practice">返回练习中心</a></p></div></div>`;
      return;
    }
    this.session = { active: true, list, i: 0, correct: 0, answers: [], mode: cfg.mode, ch: cfg.ch || null, started: Date.now(), picked: null, checked: false };
    this.renderQuestion();
  },
  quit() { this.session = null; this.renderSetup(); },

  /* 单题 */
  renderQuestion() {
    const s = this.session, q = s.list[s.i];
    s.picked = q.type === 'multi' ? [] : null; s.checked = false;
    const diffName = ['', '基础', '进阶', '挑战'][q.diff];
    let body = '';
    if (q.type === 'choice' || q.type === 'multi') {
      body = `<div class="opts" id="opts">${q.opts.map((o, i) => `<button class="opt" data-i="${i}" type="button"><span class="opt-k">${'ABCD'[i]}</span><span>${o}</span></button>`).join('')}</div>`;
    } else {
      body = `<div class="fill-row"><input class="inp" id="fillInput" placeholder="输入答案，如 1/2、pi/4、e^2" autocomplete="off"><button class="btn btn-ghost" id="fillSubmit">提交</button></div>
              <p class="small muted" style="margin-top:9px">支持分数、小数、pi、sqrt、e^2 等写法；按 Enter 也可提交。</p>`;
    }
    this.host.innerHTML = `
      <div class="wrap" style="max-width:880px">
        <div class="view-head fade-in" style="margin-bottom:16px">
          <div class="eyebrow">Practice · ${s.mode === 'wrong' ? '错题重练' : s.mode === 'chapter' ? '章节专练' : s.mode === 'daily' ? '每日挑战' : '随机综合'}</div>
          <h1 style="font-size:23px">第 ${s.i + 1} / ${s.list.length} 题</h1>
        </div>
        <div class="card quiz-card fade-in" id="quizCard">
          <div class="quiz-meta">
            <span class="pill pill-primary">${chTitle(q.ch)}</span>
            <span class="pill">${q.type === 'fill' ? '填空题' : q.type === 'multi' ? '多选题' : '单选题'}</span>
            <span class="pill ${q.diff === 3 ? 'pill-orange' : ''}">${diffName}</span>
            <span class="quiz-progress">${s.i + 1} / ${s.list.length}</span>
          </div>
          <div class="quiz-stem">${q.stem}</div>
          ${body}
          <div class="quiz-actions" id="qActions">
            ${q.type === 'fill' ? '' : `<button class="btn btn-primary" id="qSubmit" disabled>提交答案</button>`}
            <button class="btn btn-ghost" id="qSkip">跳过</button>
            <span class="small muted" style="margin-left:auto">${q.type === 'multi' ? '多选题：选择所有正确项' : ''}</span>
          </div>
          <div id="qFeedback"></div>
        </div>
        <div style="margin-top:16px;display:flex;justify-content:space-between;align-items:center">
          <button class="btn btn-ghost btn-sm" id="qQuit">退出练习</button>
          <div class="bar" style="width:220px"><i style="width:${Math.round(s.i / s.list.length * 100)}%"></i></div>
        </div>
      </div>`;
    const card = this.host.querySelector('#quizCard');
    typeset(card);
    if (q.type === 'choice' || q.type === 'multi') {
      card.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => this.pick(+b.dataset.i)));
      card.querySelector('#qSubmit').addEventListener('click', () => this.check());
    } else {
      const inp = card.querySelector('#fillInput');
      const submit = () => { s.picked = inp.value; this.check(); };
      card.querySelector('#fillSubmit').addEventListener('click', submit);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !s.checked) submit(); });
      setTimeout(() => inp.focus(), 60);
    }
    card.querySelector('#qSkip').addEventListener('click', () => { s.picked = null; this.check(true); });
    this.host.querySelector('#qQuit').addEventListener('click', () => { if (confirm('退出本次练习？当前进度不会保存。')) this.quit(); });
  },
  pick(i) {
    const s = this.session, q = s.list[s.i];
    if (s.checked) return;
    if (q.type === 'choice') s.picked = i;
    else { const a = s.picked; const k = a.indexOf(i); if (k >= 0) a.splice(k, 1); else a.push(i); a.sort(); }
    this.host.querySelectorAll('.opt').forEach(b => b.classList.toggle('selected', q.type === 'choice' ? +b.dataset.i === s.picked : s.picked.includes(+b.dataset.i)));
    const btn = this.host.querySelector('#qSubmit');
    btn.disabled = q.type === 'choice' ? s.picked === null : s.picked.length === 0;
  },
  check(skipped) {
    const s = this.session, q = s.list[s.i];
    if (s.checked) return;
    s.checked = true;
    let ok = false, given = '';
    if (!skipped) {
      if (q.type === 'choice') ok = s.picked === q.ans;
      else if (q.type === 'multi') ok = JSON.stringify(s.picked || []) === JSON.stringify(q.ans);
      else {
        const v = String(s.picked || '').trim();
        const accepts = [q.ans].concat(q.accept || []);
        const nv = norm(v);
        ok = accepts.some(a => norm(a) === nv);
        if (!ok) {
          const num = toNum(v);
          if (!isNaN(num)) ok = accepts.some(a => { const t = toNum(a); return !isNaN(t) && Math.abs(t - num) < 1e-3 * Math.max(1, Math.abs(t)); });
        }
        given = v || '（空）';
      }
    }
    Store.record(q.id, ok);
    if (ok) s.correct++;
    s.answers.push({ id: q.id, ok, skipped: !!skipped, given });
    /* 选项着色 */
    if (q.type !== 'fill') {
      const correct = Array.isArray(q.ans) ? q.ans : [q.ans];
      this.host.querySelectorAll('.opt').forEach(b => {
        const i = +b.dataset.i; b.disabled = true;
        if (correct.includes(i)) b.classList.add('correct');
        else if ((Array.isArray(s.picked) ? s.picked.includes(i) : s.picked === i)) b.classList.add('wrong');
      });
    }
    const answerText = q.type === 'fill' ? q.ans : (Array.isArray(q.ans) ? q.ans : [q.ans]).map(i => 'ABCD'[i] + '. ' + q.opts[i].replace(/\\\(|\\\)/g, '')).join('；');
    const fb = this.host.querySelector('#qFeedback');
    fb.innerHTML = `<div class="feedback ${ok ? 'ok' : 'no'}">
      <div class="fb-title">${skipped ? '已跳过' : ok ? '回答正确' : '回答错误'}　<span style="font-weight:400;font-size:12px">${skipped ? '' : q.type === 'fill' ? '你的答案：' + esc(given) : ''}</span></div>
      <div>${ok ? '概念掌握到位，继续下一题。' : `正确答案：<strong>${esc(answerText)}</strong>`}</div>
      <div class="fb-sol"><strong>解析　</strong>${q.sol}</div>
    </div>`;
    typeset(fb);
    const act = this.host.querySelector('#qActions');
    act.innerHTML = `<button class="btn btn-primary" id="qNext">${s.i + 1 >= s.list.length ? '查看结果 →' : '下一题 →'}</button>
      <span class="small muted">已答对 ${s.correct} 题</span>`;
    act.querySelector('#qNext').addEventListener('click', () => this.next());
  },
  next() {
    const s = this.session;
    s.i++;
    if (s.i >= s.list.length) this.renderResult(); else this.renderQuestion();
  },
  renderResult() {
    const s = this.session;
    s.active = false;
    Store.session({ total: s.list.length, correct: s.correct, mode: s.mode });
    const pct = Math.round(s.correct / s.list.length * 100);
    const mins = Math.max(1, Math.round((Date.now() - s.started) / 60000));
    const msg = pct >= 90 ? '掌握扎实，可以挑战更高难度了。' : pct >= 70 ? '整体不错，把错题的解析再看一遍会更稳。' : pct >= 50 ? '基础概念还需巩固，建议回到对应章节重读定义。' : '别急，先回章节页把定义与定理过一遍再练。';
    const wrongList = s.answers.filter(a => !a.ok);
    this.host.innerHTML = `
      <div class="wrap" style="max-width:760px">
        <div class="card result-card fade-in">
          <div class="eyebrow">Session Complete</div>
          <h1>本次练习完成</h1>
          <div class="result-score">${pct}<span style="font-size:24px">%</span></div>
          <div class="rs-sub">${msg}</div>
          <div class="result-stats">
            <div><b>${s.list.length}</b>题目总数</div>
            <div><b style="color:var(--accent)">${s.correct}</b>答对</div>
            <div><b style="color:var(--danger)">${s.list.length - s.correct}</b>答错/跳过</div>
            <div><b>${mins}</b>用时（分钟）</div>
          </div>
          ${wrongList.length ? `<div style="text-align:left;margin:18px 0;padding:14px 16px;border-radius:12px;background:var(--surface-2);border:1px solid var(--border)">
            <strong style="font-size:13px">需要复习的题</strong>
            <div style="margin-top:9px;display:flex;flex-wrap:wrap;gap:7px">${wrongList.map(a => { const q = window.QUIZ.find(x => x.id === a.id); return `<a class="pill pill-primary" href="#/chapter/${q.ch}#q">${chTitle(q.ch)} · ${esc(q.tag)}</a>`; }).join('')}</div>
          </div>` : '<p class="small" style="color:var(--accent)">全部答对，错题本没有新增内容。</p>'}
          <div style="display:flex;gap:10px;justify-content:center;margin-top:24px;flex-wrap:wrap">
            <button class="btn btn-primary" id="rAgain">再练一组</button>
            ${wrongList.length ? '<button class="btn btn-soft" id="rWrong">只练错题</button>' : ''}
            <a class="btn btn-ghost" href="#/practice">返回练习中心</a>
          </div>
        </div>
      </div>`;
    this.host.querySelector('#rAgain').addEventListener('click', () => this.start({ mode: s.mode, ch: s.ch, count: s.list.length }));
    const rw = this.host.querySelector('#rWrong');
    if (rw) rw.addEventListener('click', () => this.start({ mode: 'wrong', count: 99 }));
  }
};

})();
