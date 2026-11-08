/* ===== 知识内容数据（第 1—6 章） =====
   T 使用 String.raw，保证 LaTeX 反斜杠原样保留 */
const T = String.raw;
const P = html => ({ t: 'p', html });
const DEF = (title, body) => ({ t: 'def', title, body });
const THM = (title, body, note) => ({ t: 'theorem', title, body, note });
const F = (label, tex) => ({ t: 'formula', label, tex });
const TIP = body => ({ t: 'tip', body });
const WARN = body => ({ t: 'warn', body });
const EX = (q, a) => ({ t: 'example', q, a });
const VIS = (id, caption, hint) => ({ t: 'visual', id, caption, hint });
const UL = items => ({ t: 'list', items });

window.CHAPTERS = [];

/* ---------------- 第 1 章 函数与极限 ---------------- */
window.CHAPTERS.push({
  id: 'ch1', no: 1, title: '函数与极限', en: 'Functions and Limits', color: '#4257d6',
  hours: 10, level: '基础',
  summary: '极限是整门微积分的语言。本章从函数出发，建立数列极限与函数极限的严格描述，掌握两个重要极限、等价无穷小与连续性，为导数与积分铺路。',
  goals: ['理解函数的四大特性与初等函数的构成', '能用 ε-N、ε-δ 语言叙述极限并读懂证明', '熟练求各类未定式极限，善用等价无穷小替换', '判别间断点类型，会叙述闭区间上连续函数的性质'],
  sections: [
    {
      id: 's1-1', title: '映射、函数与初等函数', blocks: [
        P(T`设 \(D\subset\mathbb{R}\) 是非空数集，若对每个 \(x\in D\)，按某法则 \(f\) 都有唯一确定的 \(y\) 与之对应，则称 \(f\) 为定义在 \(D\) 上的<strong>函数</strong>，记作 \(y=f(x)\)。定义域 \(D\) 与对应法则 \(f\) 是函数的两要素——两个函数相同，必须两者都相同。`),
        DEF('函数的四种特性', T`<strong>有界性</strong>：\(\exists M>0,\ |f(x)|\le M\)；<strong>单调性</strong>：\(x_1<x_2\Rightarrow f(x_1)<f(x_2)\)（或反向）；<strong>奇偶性</strong>：\(f(-x)=-f(x)\) 为奇函数，\(f(-x)=f(x)\) 为偶函数；<strong>周期性</strong>：\(\exists T>0,\ f(x+T)=f(x)\)。`),
        P(T`基本初等函数共五类：幂函数 \(x^\mu\)、指数函数 \(a^x\)、对数函数 \(\log_a x\)、三角函数、反三角函数。由常数与基本初等函数经<strong>有限次四则运算和有限次复合</strong>得到、且能用一个式子表示的函数，称为<strong>初等函数</strong>。初等函数在其定义区间内连续，这是后面所有计算的基石。`),
        F('常用恒等变形', T`\[ a^x=e^{x\ln a},\quad \log_a b=\frac{\ln b}{\ln a},\quad \sin x=\frac{e^{ix}-e^{-ix}}{2i},\quad 1+\tan^2 x=\sec^2 x \]`),
        TIP(T`分段函数一般不是初等函数（如符号函数、取整函数），但在分段点处必须单独讨论连续性与可导性。`),
        VIS('function-lab', '函数图像实验室：拖动参数观察平移、伸缩与翻折', '拖动滑块观察 a、b、c 对图像的影响'),
      ]
    },
    {
      id: 's1-2', title: '数列的极限', blocks: [
        DEF('数列极限（ε-N 定义）', T`设 \(\{x_n\}\) 为数列，\(a\) 为常数。若 \(\forall\varepsilon>0,\ \exists N\in\mathbb{N}^+\)，当 \(n>N\) 时恒有 \(|x_n-a|<\varepsilon\)，则称 \(\{x_n\}\) 收敛于 \(a\)，记作 \(\lim\limits_{n\to\infty}x_n=a\)。`),
        P(T`这个定义的几何含义是：无论把 \(a\) 的邻域 \((a-\varepsilon,a+\varepsilon)\) 取得多窄，数列从某一项起<strong>全部</strong>落进去，落在外面的至多只有有限项。注意 \(N\) 依赖于 \(\varepsilon\)，但不需要找最小的 \(N\)。`),
        THM('收敛数列的基本性质', T`① <strong>唯一性</strong>：极限若存在必唯一；② <strong>有界性</strong>：收敛数列必有界；③ <strong>保号性</strong>：若 \(\lim x_n=a>0\)，则 \(n\) 充分大时 \(x_n>0\)；④ 收敛数列的任何子列收敛于同一极限。`),
        THM('极限存在准则', T`<strong>夹逼准则</strong>：若 \(y_n\le x_n\le z_n\) 且 \(\lim y_n=\lim z_n=a\)，则 \(\lim x_n=a\)。<br><strong>单调有界准则</strong>：单调增加有上界（或单调减少有下界）的数列必收敛。`),
        EX(T`求 \(\lim\limits_{n\to\infty}\left(\frac{1}{\sqrt{n^2+1}}+\frac{1}{\sqrt{n^2+2}}+\cdots+\frac{1}{\sqrt{n^2+n}}\right)\)。`,
          T`和式共有 \(n\) 项，最大项 \(\frac{1}{\sqrt{n^2+1}}\)，最小项 \(\frac{1}{\sqrt{n^2+n}}\)，故 \(\frac{n}{\sqrt{n^2+n}}\le S_n\le \frac{n}{\sqrt{n^2+1}}\)。两端极限都是 \(1\)，由夹逼准则得原式 \(=1\)。<br><em>要点</em>：项数随 \(n\) 变化时不能逐项取极限，必须先放缩成整体。`),
        VIS('limit', '数列与函数极限的逼近过程：观察 ε 带与落入点', '拖动 ε 与 n，理解「从某项起全部落入」'),
      ]
    },
    {
      id: 's1-3', title: '函数的极限、无穷小与无穷大', blocks: [
        DEF('函数极限（ε-δ 定义）', T`\(\lim\limits_{x\to x_0}f(x)=A\) 是指：\(\forall\varepsilon>0,\ \exists\delta>0\)，当 \(0<|x-x_0|<\delta\) 时恒有 \(|f(x)-A|<\varepsilon\)。条件中的 \(0<|x-x_0|\) 说明<strong>极限与 \(f(x_0)\) 的取值无关</strong>，甚至不要求 \(f\) 在 \(x_0\) 有定义。`),
        P(T`左极限 \(f(x_0^-)\) 与右极限 \(f(x_0^+)\) 分别只从一侧趋近。<strong>极限存在的充要条件</strong>是左右极限都存在且相等。分段函数在分段点、含 \(|x|\)、\(\arctan\frac{1}{x}\)、\(e^{1/x}\) 的表达式，都必须分左右讨论。`),
        F('无穷小与无穷大', T`\[ \lim f(x)=0\Rightarrow f \text{ 为无穷小};\qquad \lim f(x)=\infty\Rightarrow f \text{ 为无穷大} \]`),
        TIP(T`在同一极限过程中，若 \(f\) 为无穷小且 \(f\neq0\)，则 \(\frac{1}{f}\) 为无穷大；无穷大一定无界，但无界不一定是无穷大（如 \(y=x\sin x\) 当 \(x\to\infty\)）。`),
        THM('无穷小的运算', T`有限个无穷小之和、之积仍是无穷小；<strong>有界函数与无穷小之积</strong>仍是无穷小。这是 \(\lim\limits_{x\to0}x\sin\frac{1}{x}=0\) 的依据。`),
        VIS('epsilon', 'ε-δ 交互演示：缩小 ε，观察对应的 δ 窗口', '拖动 ε，看 δ 如何随之收缩'),
      ]
    },
    {
      id: 's1-4', title: '极限运算法则与两个重要极限', blocks: [
        THM('四则运算法则', T`若 \(\lim f=A,\ \lim g=B\)，则 \(\lim(f\pm g)=A\pm B\)，\(\lim fg=AB\)，且当 \(B\neq0\) 时 \(\lim\frac{f}{g}=\frac{A}{B}\)。前提是<strong>各分量极限都存在</strong>；遇到 \(\infty-\infty\)、\(0\cdot\infty\) 等未定式必须先变形。`),
        F('两个重要极限', T`\[ \lim_{x\to 0}\frac{\sin x}{x}=1,\qquad \lim_{x\to\infty}\left(1+\frac{1}{x}\right)^{x}=e=\lim_{x\to 0}(1+x)^{1/x} \]`),
        F('常用等价无穷小（x→0）', T`\[ \sin x\sim x\sim\tan x\sim\arcsin x\sim\arctan x\sim\ln(1+x)\sim e^x-1 \] \[ 1-\cos x\sim\frac{x^2}{2},\quad (1+x)^\alpha-1\sim\alpha x,\quad \sqrt[n]{1+x}-1\sim\frac{x}{n} \]`),
        WARN(T`等价无穷小替换只能用于<strong>乘除因子</strong>，不能随意用于加减项。例如 \(\lim\limits_{x\to0}\frac{\tan x-\sin x}{x^3}\) 若把 \(\tan x,\sin x\) 都换成 \(x\) 会得 \(0\)，正确答案是 \(\frac12\)；正确做法是 \(\tan x-\sin x=\tan x(1-\cos x)\sim x\cdot\frac{x^2}{2}\)。`),
        EX(T`求 \(\lim\limits_{x\to\infty}\left(\frac{x+3}{x+1}\right)^{x}\)。`,
          T`属 \(1^\infty\) 型。改写为 \(\left(1+\frac{2}{x+1}\right)^{x}\)，令 \(u=\frac{x+1}{2}\)，则指数 \(x=2u-1\)，原式 \(=\lim\limits_{u\to\infty}\left(1+\frac1u\right)^{2u-1}=e^2\)。<br><em>通法</em>：\(1^\infty\) 型用 \(\lim f^g=e^{\lim g(f-1)}\) 最快。`),
        VIS('squeeze', '两个重要极限的数值验证与图像逼近', '切换函数，拖动 x 观察比值趋于 1 或 e'),
      ]
    },
    {
      id: 's1-5', title: '无穷小的比较与函数的连续性', blocks: [
        DEF('无穷小的阶', T`设 \(\alpha,\beta\) 都是同一过程下的无穷小：若 \(\lim\frac{\beta}{\alpha}=0\)，则 \(\beta\) 是比 \(\alpha\) <strong>高阶</strong>的无穷小，记 \(\beta=o(\alpha)\)；若比值为 \(c\neq0\) 则<strong>同阶</strong>；\(c=1\) 时称为<strong>等价无穷小</strong>，记 \(\alpha\sim\beta\)；若 \(\lim\frac{\beta}{\alpha^k}=c\neq0\) 则称 \(\beta\) 是关于 \(\alpha\) 的 \(k\) 阶无穷小。`),
        DEF('连续性', T`若 \(\lim\limits_{x\to x_0}f(x)=f(x_0)\)，即 \(\lim\limits_{\Delta x\to0}\Delta y=0\)，称 \(f\) 在 \(x_0\) 连续。不连续的点称为<strong>间断点</strong>。`),
        UL([
          T`<strong>第一类间断点</strong>：左右极限都存在。左右相等为<em>可去间断点</em>（补定义即可连续），不等为<em>跳跃间断点</em>。`,
          T`<strong>第二类间断点</strong>：左右极限至少一个不存在，如<em>无穷间断点</em> \(\frac1x\) 在 \(x=0\)、<em>振荡间断点</em> \(\sin\frac1x\) 在 \(x=0\)。`,
        ]),
        THM('闭区间上连续函数的性质', T`<strong>最值定理</strong>：\([a,b]\) 上连续必取到最大、最小值；<strong>有界性定理</strong>：必有界；<strong>零点定理</strong>：若 \(f(a)f(b)<0\)，则 \(\exists\xi\in(a,b)\) 使 \(f(\xi)=0\)；<strong>介值定理</strong>：能取到介于端点值之间的一切值。`),
        TIP(T`零点定理是证明方程根存在的主力工具：构造 \(F(x)=f(x)-x\) 或原函数，再验证端点异号。注意它只保证「至少有一个」，唯一性要靠单调性。`),
      ]
    }
  ],
  keypoints: [T`\(\varepsilon\)-\(N\)/\(\varepsilon\)-\(\delta\) 定义的逻辑顺序：先给 \(\varepsilon\)，后找 \(N\) 或 \(\delta\)`, T`两个重要极限及其 \(1^\infty\) 型推广`, T`等价无穷小替换只用于乘除因子`, T`间断点分类依据「左右极限是否存在」`, T`闭区间连续函数四大定理的条件缺一不可`],
  pitfalls: [T`把 \(\lim\limits_{x\to0}\frac{\sin x}{x}=1\) 误用于 \(x\to\infty\)`, T`在加减法中直接替换等价无穷小`, T`忽略 \(x\to x_0\) 极限与 \(f(x_0)\) 无关，误把「无定义」判为「极限不存在」`, T`认为「有界」等价于「极限存在」`],
  visualIds: ['function-lab', 'limit', 'epsilon', 'squeeze']
});

/* ---------------- 第 2 章 导数与微分 ---------------- */
window.CHAPTERS.push({
  id: 'ch2', no: 2, title: '导数与微分', en: 'Derivatives and Differentials', color: '#0d9b7a',
  hours: 9, level: '基础',
  summary: '导数刻画函数变化的瞬时速率，几何上是切线斜率。本章建立导数定义、求导法则体系，并把它推广到隐函数、参数方程与高阶导数。',
  goals: ['用定义求导数并理解可导与连续的关系', '熟练运用四则、反函数与复合函数求导法则', '掌握隐函数、参数方程、对数求导法与高阶导数', '理解微分与线性近似的本质'],
  sections: [
    {
      id: 's2-1', title: '导数的概念', blocks: [
        DEF('导数定义', T`\[ f'(x_0)=\lim_{\Delta x\to0}\frac{f(x_0+\Delta x)-f(x_0)}{\Delta x}=\lim_{x\to x_0}\frac{f(x)-f(x_0)}{x-x_0} \]`),
        P(T`差商 \(\frac{\Delta y}{\Delta x}\) 是割线斜率，取极限后即为<strong>切线斜率</strong>。切线方程为 \(y-f(x_0)=f'(x_0)(x-x_0)\)，法线方程斜率为 \(-\frac{1}{f'(x_0)}\)（当 \(f'(x_0)\neq0\)）。`),
        F('单侧导数与可导条件', T`\[ f'_-(x_0)=\lim_{h\to0^-}\frac{f(x_0+h)-f(x_0)}{h},\quad f'_+(x_0)=\lim_{h\to0^+}\frac{f(x_0+h)-f(x_0)}{h} \] \[ f'(x_0)\ \text{存在}\iff f'_-(x_0)=f'_+(x_0) \]`),
        THM('可导与连续', T`\(f\) 在 \(x_0\) 可导 \(\Rightarrow\) \(f\) 在 \(x_0\) 连续；反之不成立。典型反例 \(y=|x|\) 在 \(x=0\) 连续但左右导数分别为 \(-1,1\)，不可导。`),
        VIS('derivative', '从割线到切线：拖动 Δx 观察差商趋于导数', '拖动 h，观察割线如何旋转成切线'),
        EX(T`设 \(f(x)=\begin{cases}x^2\sin\frac1x,&x\neq0\\0,&x=0\end{cases}\)，讨论 \(x=0\) 处的可导性。`,
          T`按定义：\(\frac{f(h)-f(0)}{h}=h\sin\frac1h\to0\)（有界量乘无穷小），故 \(f'(0)=0\)，可导。但 \(x\neq0\) 时 \(f'(x)=2x\sin\frac1x-\cos\frac1x\) 在 \(x\to0\) 无极限，说明<em>导函数可以不连续</em>。`),
      ]
    },
    {
      id: 's2-2', title: '求导法则与基本公式', blocks: [
        F('四则运算', T`\[ (u\pm v)'=u'\pm v',\quad (uv)'=u'v+uv',\quad \left(\frac{u}{v}\right)'=\frac{u'v-uv'}{v^2} \]`),
        F('反函数与复合函数（链式法则）', T`\[ \frac{dy}{dx}=\frac{1}{dx/dy},\qquad \frac{dy}{dx}=\frac{dy}{du}\cdot\frac{du}{dx} \]`),
        F('基本导数表', T`\[ (x^\mu)'=\mu x^{\mu-1},\ (e^x)'=e^x,\ (a^x)'=a^x\ln a,\ (\ln x)'=\frac1x \] \[ (\sin x)'=\cos x,\ (\cos x)'=-\sin x,\ (\tan x)'=\sec^2 x,\ (\cot x)'=-\csc^2 x \] \[ (\arcsin x)'=\frac{1}{\sqrt{1-x^2}},\ (\arctan x)'=\frac{1}{1+x^2},\ (\sec x)'=\sec x\tan x \]`),
        TIP(T`链式法则是出错率最高的地方：对 \(\sin(2x^3)\) 求导要逐层剥洋葱，得 \(\cos(2x^3)\cdot6x^2\)。复合层数多时，建议先设中间变量写清楚层次。`),
        EX(T`求 \(y=x^x\ (x>0)\) 的导数。`,
          T`既非幂函数也非指数函数，用<strong>对数求导法</strong>：\(\ln y=x\ln x\)，两边对 \(x\) 求导得 \(\frac{y'}{y}=\ln x+1\)，故 \(y'=x^x(\ln x+1)\)。<br>也可写成 \(y=e^{x\ln x}\) 再链式求导。`),
      ]
    },
    {
      id: 's2-3', title: '高阶导数、隐函数与参数方程', blocks: [
        F('高阶导数', T`\[ y''=(y')',\quad (uv)^{(n)}=\sum_{k=0}^{n}C_n^k u^{(n-k)}v^{(k)}\quad(\text{莱布尼茨公式}) \]`),
        F('常用 n 阶导数', T`\[ (e^x)^{(n)}=e^x,\quad (\sin x)^{(n)}=\sin\left(x+\frac{n\pi}{2}\right),\quad (\ln(1+x))^{(n)}=\frac{(-1)^{n-1}(n-1)!}{(1+x)^n} \]`),
        DEF('隐函数求导', T`方程 \(F(x,y)=0\) 确定 \(y=y(x)\) 时，把 \(y\) 看作 \(x\) 的函数，方程两边对 \(x\) 求导再解出 \(y'\)。例如 \(x^2+y^2=1\Rightarrow 2x+2yy'=0\Rightarrow y'=-\frac{x}{y}\)。`),
        F('参数方程求导', T`\[ \frac{dy}{dx}=\frac{\varphi'(t)}{\psi'(t)}\ \left(\text{对 }\begin{cases}x=\varphi(t)\\y=\psi(t)\end{cases}\right),\qquad \frac{d^2y}{dx^2}=\frac{d}{dt}\left(\frac{dy}{dx}\right)\Big/\varphi'(t) \]`),
        WARN(T`二阶参数导数最容易错：\(\frac{d^2y}{dx^2}\neq\frac{\varphi''(t)}{\psi''(t)}\)！必须先对一阶导数关于 \(t\) 求导，再除以 \(\varphi'(t)\)。`),
        EX(T`求摆线 \(x=a(t-\sin t),\ y=a(1-\cos t)\) 的 \(\frac{d^2y}{dx^2}\)。`,
          T`\(\frac{dy}{dx}=\frac{a\sin t}{a(1-\cos t)}=\cot\frac t2\)；再对 \(t\) 求导得 \(-\frac12\csc^2\frac t2\)，除以 \(\frac{dx}{dt}=a(1-\cos t)=2a\sin^2\frac t2\)，得 \(\frac{d^2y}{dx^2}=-\frac{1}{4a\sin^4(t/2)}\)。`),
      ]
    },
    {
      id: 's2-4', title: '微分与线性近似', blocks: [
        DEF('微分', T`若 \(\Delta y=f'(x_0)\Delta x+o(\Delta x)\)，则称线性主部 \(dy=f'(x_0)dx\) 为 \(f\) 在 \(x_0\) 的微分（\(dx=\Delta x\)）。<strong>可微 \(\iff\) 可导</strong>（一元函数）。`),
        F('线性近似与误差估计', T`\[ f(x_0+\Delta x)\approx f(x_0)+f'(x_0)\Delta x,\qquad \Delta y-dy=o(\Delta x) \]`),
        TIP(T`常用近似：\(\sqrt{1+x}\approx1+\frac x2\)、\(\sin x\approx x\)、\(\ln(1+x)\approx x\)、\(e^x\approx1+x\)（\(|x|\) 很小）。这些正是泰勒公式的一阶情形。`),
        VIS('linear-approx', '线性近似：观察切线在 x₀ 附近对曲线的拟合与误差', '拖动 Δx 比较真值与近似值'),
      ]
    }
  ],
  keypoints: [T`导数定义的两种等价写法与差商的几何意义`, T`链式法则必须逐层求导、不漏层`, T`可导必连续，连续未必可导`, T`对数求导法适用于幂指函数与多因子乘积`, T`参数方程二阶导的正确公式`],
  pitfalls: [T`把 \(f'(x_0)\) 误写成 \([f(x_0)]'\)（后者恒为 0）`, T`参数方程二阶导直接对参数求二阶商`, T`隐函数求导后忘记 \(y\) 是 \(x\) 的函数、漏掉 \(y'\)`, T`分段点处只求一侧导数就下结论`],
  visualIds: ['derivative', 'linear-approx']
});

/* ---------------- 第 3 章 微分中值定理与导数应用 ---------------- */
window.CHAPTERS.push({
  id: 'ch3', no: 3, title: '中值定理与导数应用', en: 'Mean Value Theorems', color: '#7854c9',
  hours: 10, level: '核心',
  summary: '中值定理把「局部的导数」与「整体的函数值变化」连接起来，是证明题的主干；泰勒公式与洛必达法则则是计算利器；导数符号决定了函数的整体形状。',
  goals: ['理解罗尔、拉格朗日、柯西中值定理的条件与几何意义', '熟练用洛必达法则与泰勒公式求极限', '用导数判定单调性、凹凸性、极值与最值', '了解曲率与牛顿迭代法'],
  sections: [
    {
      id: 's3-1', title: '三大微分中值定理', blocks: [
        THM('罗尔定理', T`\(f\in C[a,b]\)，在 \((a,b)\) 可导，且 \(f(a)=f(b)\)，则 \(\exists\xi\in(a,b)\) 使 \(f'(\xi)=0\)。`, T`几何意义：两端等高的光滑曲线上至少有一点切线水平。`),
        THM('拉格朗日中值定理', T`\(f\in C[a,b]\) 且在 \((a,b)\) 可导，则 \(\exists\xi\in(a,b)\) 使 \[ f(b)-f(a)=f'(\xi)(b-a). \]`, T`这是最常用的一条；有限增量公式 \(f(x+\Delta x)-f(x)=f'(x+\theta\Delta x)\Delta x\ (0<\theta<1)\) 也由此而来。`),
        THM('柯西中值定理', T`\(f,F\in C[a,b]\)，在 \((a,b)\) 可导且 \(F'(x)\neq0\)，则 \(\exists\xi\in(a,b)\) 使 \[ \frac{f(b)-f(a)}{F(b)-F(a)}=\frac{f'(\xi)}{F'(\xi)}. \]`, T`取 \(F(x)=x\) 即退化为拉格朗日定理；它是证明洛必达法则的理论依据。`),
        TIP(T`中值定理证明题的通用套路：由结论倒推需要构造的<strong>辅助函数</strong>。欲证 \(f'(\xi)+\lambda f(\xi)=0\)，常构造 \(F(x)=e^{\lambda x}f(x)\)；欲证含 \(\frac{f'(\xi)}{g'(\xi)}\)，用柯西定理。`),
        VIS('mvt', '拉格朗日中值定理：拖动 c 寻找与割线平行的切线', '拖动滑块，让切线斜率等于割线斜率'),
      ]
    },
    {
      id: 's3-2', title: '洛必达法则与泰勒公式', blocks: [
        THM('洛必达法则（0/0 型）', T`当 \(x\to a\) 时 \(f\to0,\ g\to0\)，\(f,g\) 在去心邻域可导且 \(g'\neq0\)，若 \(\lim\frac{f'}{g'}\) 存在（或为 \(\infty\)），则 \[ \lim_{x\to a}\frac{f(x)}{g(x)}=\lim_{x\to a}\frac{f'(x)}{g'(x)}. \]`, T`\(\frac{\infty}{\infty}\) 型同样适用；其他未定式 \(0\cdot\infty,\ \infty-\infty,\ 1^\infty,\ 0^0,\ \infty^0\) 需先化成这两种基本型。`),
        WARN(T`洛必达不是万能的：若 \(\lim\frac{f'}{g'}\) 振荡不存在，法则失效但原极限可能存在，如 \(\lim\limits_{x\to\infty}\frac{x+\sin x}{x}=1\)。也要避免越求导越复杂，此时应改用等价无穷小或泰勒展开。`),
        F('泰勒公式（带皮亚诺余项）', T`\[ f(x)=\sum_{k=0}^{n}\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k+o\!\left((x-x_0)^n\right) \]`),
        F('麦克劳林展开（必背）', T`\[ e^x=1+x+\frac{x^2}{2!}+\cdots+\frac{x^n}{n!}+o(x^n),\quad \sin x=x-\frac{x^3}{3!}+\frac{x^5}{5!}-\cdots \] \[ \cos x=1-\frac{x^2}{2!}+\frac{x^4}{4!}-\cdots,\quad \ln(1+x)=x-\frac{x^2}{2}+\frac{x^3}{3}-\cdots \] \[ (1+x)^\alpha=1+\alpha x+\frac{\alpha(\alpha-1)}{2!}x^2+\cdots \]`),
        EX(T`求 \(\lim\limits_{x\to0}\frac{\cos x-e^{-x^2/2}}{x^4}\)。`,
          T`展开到四阶：\(\cos x=1-\frac{x^2}{2}+\frac{x^4}{24}+o(x^4)\)，\(e^{-x^2/2}=1-\frac{x^2}{2}+\frac{x^4}{8}+o(x^4)\)。分子 \(=\left(\frac1{24}-\frac18\right)x^4+o(x^4)=-\frac{x^4}{12}+o(x^4)\)，故极限 \(=-\frac1{12}\)。<br><em>要点</em>：展开阶数由分母的幂次决定，写到首次不为零的项。`),
        VIS('taylor', '泰勒多项式逼近：改变阶数 n 观察拟合范围扩大', '切换函数并拖动 n，观察误差曲线'),
      ]
    },
    {
      id: 's3-3', title: '单调性、凹凸性、极值与最值', blocks: [
        THM('单调性判别', T`在 \((a,b)\) 内 \(f'(x)>0\Rightarrow f\) 单调增加；\(f'(x)<0\Rightarrow\) 单调减少。驻点（\(f'=0\)）与不可导点是单调区间的分界候选。`),
        DEF('凹凸性与拐点', T`若 \(f''>0\) 则曲线是<strong>凹</strong>的（concave up，开口向上，切线在曲线下方）；\(f''<0\) 为<strong>凸</strong>的。凹凸性改变的点称为<strong>拐点</strong>，注意拐点是曲线上的点 \((x_0,f(x_0))\)。`),
        THM('极值判别', T`<strong>第一充分条件</strong>：\(f'\) 在 \(x_0\) 两侧变号则有极值（左正右负为极大）。<br><strong>第二充分条件</strong>：\(f'(x_0)=0\) 且 \(f''(x_0)\neq0\)，则 \(f''<0\) 取极大值、\(f''>0\) 取极小值；\(f''=0\) 时失效，需回退一阶判别。`),
        TIP(T`闭区间 \([a,b]\) 上求最值：找出区间内全部驻点与不可导点，把它们与两个端点的函数值一起比较，最大的即最大值。不要漏掉端点！`),
        VIS('shape', '导数符号与曲线形状：实时查看 f、f′、f″ 的对应', '切换函数，观察驻点与拐点位置'),
      ]
    },
    {
      id: 's3-4', title: '曲率与方程的近似解', blocks: [
        F('曲率与曲率半径', T`\[ K=\frac{|y''|}{\left(1+y'^2\right)^{3/2}},\qquad \rho=\frac1K \] \[\text{参数形式：}\ K=\frac{|\varphi'\psi''-\varphi''\psi'|}{(\varphi'^2+\psi'^2)^{3/2}} \]`),
        F('牛顿迭代法', T`\[ x_{n+1}=x_n-\frac{f(x_n)}{f'(x_n)} \]`),
        P(T`牛顿法的几何含义是用切线与 \(x\) 轴的交点逼近零点，在根附近通常<strong>平方收敛</strong>；但初值选得不好可能发散，且 \(f'(x_n)=0\) 时会失效。实际使用需配合区间隔离与收敛判据。`),
        VIS('newton', '牛顿迭代：拖动初始点，观察切线迭代逼近方程的根', '改变 x₀，比较收敛速度与发散情形'),
      ]
    }
  ],
  keypoints: [T`拉格朗日中值定理的条件、结论与辅助函数构造`, T`洛必达法则的适用条件与失效情形`, T`五个麦克劳林展开式与「展开到首次非零项」原则`, T`极值第一/第二充分条件的适用边界`, T`闭区间最值需比较驻点、不可导点与端点`],
  pitfalls: [T`对非 \(\frac00\)、\(\frac\infty\infty\) 型直接洛必达`, T`把 \(f''(x_0)=0\) 当作「不是极值」的结论`, T`把拐点写成横坐标而非坐标点`, T`泰勒展开阶数不足导致主项被抵消后误判`],
  visualIds: ['mvt', 'taylor', 'shape', 'newton']
});

/* ---------------- 第 4 章 不定积分 ---------------- */
window.CHAPTERS.push({
  id: 'ch4', no: 4, title: '不定积分', en: 'Indefinite Integrals', color: '#e08a18',
  hours: 8, level: '核心',
  summary: '不定积分是求导的逆运算，目标是找出全体原函数。本章系统训练三大方法：直接积分、换元积分与分部积分，并给出有理函数积分的一般途径。',
  goals: ['理解原函数与不定积分的关系', '熟练使用两类换元法', '掌握分部积分的 u、v 选取策略', '会处理有理函数与三角有理式积分'],
  sections: [
    {
      id: 's4-1', title: '概念与基本积分表', blocks: [
        DEF('原函数与不定积分', T`若 \(F'(x)=f(x)\)，称 \(F\) 为 \(f\) 的一个原函数；全体原函数 \(\int f(x)\,dx=F(x)+C\) 称为不定积分。<strong>连续函数一定有原函数</strong>。`),
        THM('与微分/导数的互逆关系', T`\[ \frac{d}{dx}\int f(x)\,dx=f(x),\qquad \int F'(x)\,dx=F(x)+C \]`),
        F('基本积分表', T`\[ \int x^\mu dx=\frac{x^{\mu+1}}{\mu+1}+C\ (\mu\neq-1),\quad \int\frac{dx}{x}=\ln|x|+C,\quad \int e^x dx=e^x+C \] \[ \int\sin x\,dx=-\cos x+C,\quad \int\cos x\,dx=\sin x+C,\quad \int\sec^2 x\,dx=\tan x+C \] \[ \int\frac{dx}{1+x^2}=\arctan x+C,\quad \int\frac{dx}{\sqrt{1-x^2}}=\arcsin x+C,\quad \int\sec x\,dx=\ln|\sec x+\tan x|+C \]`),
        WARN(T`别漏积分常数 \(C\)；\(\int\frac{dx}{x}=\ln|x|+C\) 的绝对值不能省。不同方法算出的原函数可能相差一个常数（如 \(\int 2\sin x\cos x\,dx=\sin^2x+C=-\cos^2x+C\)），这并不矛盾。`),
      ]
    },
    {
      id: 's4-2', title: '换元积分法', blocks: [
        THM('第一类换元（凑微分）', T`\[ \int f(\varphi(x))\varphi'(x)\,dx=\int f(u)\,du\Big|_{u=\varphi(x)} \]`, T`关键是把被积式凑成 \(f(\varphi(x))d\varphi(x)\) 的形式。`),
        F('常用凑微分', T`\[ dx=\frac1a d(ax+b),\quad x\,dx=\frac12 d(x^2),\quad \frac{dx}{x}=d\ln x,\quad \frac{dx}{\sqrt x}=2d\sqrt x \] \[ \cos x\,dx=d\sin x,\quad e^x dx=d e^x,\quad \frac{dx}{1+x^2}=d\arctan x \]`),
        THM('第二类换元', T`令 \(x=\psi(t)\)（\(\psi\) 单调可导且 \(\psi'\neq0\)）：\[ \int f(x)\,dx=\int f(\psi(t))\psi'(t)\,dt\Big|_{t=\psi^{-1}(x)}. \]`, T`常用于去根号：\(\sqrt{a^2-x^2}\) 用 \(x=a\sin t\)；\(\sqrt{a^2+x^2}\) 用 \(x=a\tan t\)；\(\sqrt{x^2-a^2}\) 用 \(x=a\sec t\)。`),
        EX(T`求 \(\int\frac{dx}{x^2\sqrt{1+x^2}}\)。`,
          T`令 \(x=\tan t\)，则 \(dx=\sec^2t\,dt\)、\(\sqrt{1+x^2}=\sec t\)，原式 \(=\int\frac{\sec^2t}{\tan^2t\,\sec t}dt=\int\frac{\cos t}{\sin^2 t}dt=-\frac1{\sin t}+C=-\frac{\sqrt{1+x^2}}{x}+C\)。回代时建议画直角三角形辅助。`),
      ]
    },
    {
      id: 's4-3', title: '分部积分法与有理函数', blocks: [
        F('分部积分公式', T`\[ \int u\,dv=uv-\int v\,du,\qquad \int u v'\,dx=uv-\int u'v\,dx \]`),
        TIP(T`选 \(u\) 的优先级口诀「<strong>反对幂指三</strong>」：反三角、对数、幂函数、指数、三角，靠前的优先设为 \(u\)（因为求导后变简单）。例如 \(\int x e^x dx\) 取 \(u=x\)；\(\int x\ln x\,dx\) 取 \(u=\ln x\)。`),
        EX(T`求 \(\int e^x\sin x\,dx\)。`,
          T`两次分部后出现「循环」：设 \(I=\int e^x\sin x\,dx=e^x\sin x-\int e^x\cos x\,dx=e^x\sin x-\left(e^x\cos x+\int e^x\sin x\,dx\right)\)，故 \(2I=e^x(\sin x-\cos x)\)，\(I=\frac{e^x}{2}(\sin x-\cos x)+C\)。`),
        THM('有理函数积分', T`任何有理真分式 \(\frac{P(x)}{Q(x)}\) 都可分解为部分分式之和：\(Q\) 的每个一次因式 \((x-a)^k\) 对应 \(k\) 项 \(\frac{A_i}{(x-a)^i}\)，每个二次不可约因式 \((x^2+px+q)^k\) 对应 \(\frac{M_ix+N_i}{(x^2+px+q)^i}\)。假分式先做多项式除法。`),
        TIP(T`对三角有理式 \(\int R(\sin x,\cos x)dx\)，万能代换 \(t=\tan\frac x2\) 给出 \(\sin x=\frac{2t}{1+t^2},\ \cos x=\frac{1-t^2}{1+t^2},\ dx=\frac{2dt}{1+t^2}\)，总可化为有理函数积分，但通常计算量大，应优先考虑凑微分与对称性。`),
      ]
    }
  ],
  keypoints: [T`原函数存在定理与积分常数`, T`两类换元的方向区别：凑微分是「复合」，第二类换元是「代入并回代」`, T`分部积分的 u 选取优先级`, T`三角代换的三种根式类型`, T`有理函数部分分式分解的标准形式`],
  pitfalls: [T`第二类换元忘记回代或忘记乘 \(\psi'(t)\)`, T`分部积分选错 \(u\) 使积分更复杂`, T`\(\int\frac{dx}{x}\) 漏掉绝对值`, T`凑微分时系数没配平`],
  visualIds: ['antiderivative']
});

/* ---------------- 第 5 章 定积分 ---------------- */
window.CHAPTERS.push({
  id: 'ch5', no: 5, title: '定积分', en: 'Definite Integrals', color: '#d94a5c',
  hours: 9, level: '核心',
  summary: '定积分源于「分割—近似—求和—取极限」，是一个数而非函数族。牛顿—莱布尼茨公式把定积分与不定积分连成一体，这是微积分最深刻的结论。',
  goals: ['理解黎曼和定义与可积条件', '掌握定积分性质、积分中值定理与变上限积分求导', '熟练使用牛顿—莱布尼茨公式与定积分换元、分部', '会判断反常积分的敛散性'],
  sections: [
    {
      id: 's5-1', title: '定积分的概念与性质', blocks: [
        DEF('黎曼和定义', T`\[ \int_a^b f(x)\,dx=\lim_{\lambda\to0}\sum_{i=1}^{n}f(\xi_i)\Delta x_i,\qquad \lambda=\max_{1\le i\le n}\Delta x_i \]`),
        P(T`几何上它是曲边梯形面积的<strong>代数和</strong>（\(x\) 轴下方为负）。可积的充分条件：\(f\) 在 \([a,b]\) 连续，或 \(f\) 有界且只有有限个间断点。注意「可积」不要求「存在原函数」，反之亦然。`),
        THM('基本性质', T`线性性 \(\int(\alpha f+\beta g)=\alpha\int f+\beta\int g\)；区间可加性 \(\int_a^b=\int_a^c+\int_c^b\)；保号性 \(f\ge0\Rightarrow\int_a^b f\ge0\)；估值定理 \(m(b-a)\le\int_a^b f\le M(b-a)\)。`),
        THM('积分中值定理', T`\(f\in C[a,b]\Rightarrow\exists\xi\in[a,b]\) 使 \[ \int_a^b f(x)\,dx=f(\xi)(b-a). \]`, T`\(f(\xi)\) 即函数在区间上的<strong>平均值</strong> \(\frac1{b-a}\int_a^b f\)。`),
        VIS('riemann', '黎曼和：改变分割数 n 与取样方式，观察面积逼近定积分', '拖动 n，切换左端点/右端点/中点/梯形'),
      ]
    },
    {
      id: 's5-2', title: '微积分基本公式与变上限积分', blocks: [
        THM('积分上限函数', T`若 \(f\in C[a,b]\)，则 \(\Phi(x)=\int_a^x f(t)\,dt\) 在 \([a,b]\) 可导，且 \[ \Phi'(x)=\frac{d}{dx}\int_a^x f(t)\,dt=f(x). \]`),
        F('一般变限求导（莱布尼茨规则）', T`\[ \frac{d}{dx}\int_{\alpha(x)}^{\beta(x)}f(t)\,dt=f(\beta(x))\beta'(x)-f(\alpha(x))\alpha'(x) \]`),
        F('牛顿—莱布尼茨公式', T`\[ \int_a^b f(x)\,dx=F(b)-F(a)=\left.F(x)\right|_a^b,\qquad F'=f \]`),
        EX(T`设 \(f\) 连续，求 \(\frac{d}{dx}\int_0^{x^2} t f(x^2-t)\,dt\)。`,
          T`先换元消去被积函数里的 \(x\)：令 \(u=x^2-t\)，则积分变为 \(\int_0^{x^2}(x^2-u)f(u)\,du=x^2\int_0^{x^2}f(u)\,du-\int_0^{x^2}u f(u)\,du\)。求导得 \(2x\int_0^{x^2}f(u)\,du+x^2\cdot f(x^2)\cdot2x-x^2f(x^2)\cdot2x=2x\int_0^{x^2}f(u)\,du\)。<br><em>要点</em>：被积函数含求导变量时必须先换元或拆分。`),
      ]
    },
    {
      id: 's5-3', title: '定积分的计算与反常积分', blocks: [
        THM('定积分换元法', T`\(x=\psi(t)\) 单调可导、\(\psi(\alpha)=a,\psi(\beta)=b\) 时 \[ \int_a^b f(x)\,dx=\int_\alpha^\beta f(\psi(t))\psi'(t)\,dt. \]`, T`关键是<strong>换元必须同时换限</strong>，且不要求 \(\psi\) 反函数显式写出。`),
        F('对称性公式', T`\[ \int_{-a}^{a}f(x)\,dx=\begin{cases}2\int_0^a f(x)\,dx,&f\ \text{偶}\\0,&f\ \text{奇}\end{cases},\qquad \int_0^{\pi/2}\sin^n x\,dx=\int_0^{\pi/2}\cos^n x\,dx \]`),
        F('华里士（点火）公式', T`\[ I_n=\int_0^{\pi/2}\sin^n x\,dx=\frac{n-1}{n}I_{n-2},\quad I_1=1,\ I_0=\frac\pi2 \]`),
        DEF('反常积分', T`无穷限：\(\int_a^{+\infty}f=\lim\limits_{t\to+\infty}\int_a^t f\)；无界函数（瑕积分）：若 \(f\) 在 \(a\) 附近无界，则 \(\int_a^b f=\lim\limits_{\varepsilon\to0^+}\int_{a+\varepsilon}^b f\)。极限存在称<strong>收敛</strong>，否则发散。`),
        F('p 积分判敛（重要基准）', T`\[ \int_1^{+\infty}\frac{dx}{x^p}:\ p>1\ \text{收敛},\ p\le1\ \text{发散};\qquad \int_0^1\frac{dx}{x^q}:\ q<1\ \text{收敛},\ q\ge1\ \text{发散} \]`),
        WARN(T`\(\int_{-\infty}^{+\infty}\frac{x}{1+x^2}dx\) 发散（两个单侧积分各自发散），虽然对称区间上「看起来」应该抵消，但柯西主值为 0 与反常积分收敛是两回事。`),
      ]
    }
  ],
  keypoints: [T`黎曼和四步与可积的充分条件`, T`变上限积分求导及含参变量时的换元技巧`, T`牛顿—莱布尼茨公式的条件（\(f\) 连续）`, T`定积分换元同时换限；奇偶对称性与华里士公式`, T`两类反常积分与 p 判别基准`],
  pitfalls: [T`换元后忘记换积分限`, T`对有瑕点的积分直接套用牛顿—莱布尼茨公式（如 \(\int_{-1}^1\frac{dx}{x^2}\)）`, T`把 \(\int f(x)g(x)dx\) 误拆成两个积分之积`, T`混淆「可积」与「存在原函数」`],
  visualIds: ['riemann', 'improper']
});

/* ---------------- 第 6 章 定积分的应用 ---------------- */
window.CHAPTERS.push({
  id: 'ch6', no: 6, title: '定积分的应用', en: 'Applications of Integration', color: '#1f9bb3',
  hours: 7, level: '应用',
  summary: '把物理量或几何量切成微元，再累加成积分——「微元法」是把实际问题翻译成定积分的通用方法。本章覆盖面积、体积、弧长与常见物理应用。',
  goals: ['掌握微元法的思想与建模步骤', '会求直角坐标、参数方程与极坐标下的面积', '会求旋转体体积、平行截面体积与弧长', '能建立功、液体压力等物理量的积分表达式'],
  sections: [
    {
      id: 's6-1', title: '微元法与平面图形面积', blocks: [
        DEF('微元法', T`在区间微元 \([x,x+dx]\) 上，把所求量 \(U\) 的局部近似写成 \(dU=f(x)\,dx\)（与真实量之差是 \(dx\) 的高阶无穷小），则 \(U=\int_a^b f(x)\,dx\)。关键在选对积分变量使 \(dU\) 形式简单。`),
        F('面积公式', T`\[ \text{直角坐标：}\ A=\int_a^b|f(x)-g(x)|\,dx,\qquad \text{参数方程：}\ A=\int_{t_1}^{t_2}y(t)x'(t)\,dt \] \[ \text{极坐标：}\ A=\frac12\int_\alpha^\beta \rho^2(\theta)\,d\theta \] \[ \text{弧长：}\ s=\int_a^b\sqrt{1+y'^2}\,dx=\int_\alpha^\beta\sqrt{\rho^2+\rho'^2}\,d\theta \]`),
        VIS('polar', '极坐标曲线：拖动参数观察玫瑰线、心形线与螺线', '切换曲线族并拖动参数，观察面积扇区'),
        EX(T`求心形线 \(\rho=a(1+\cos\theta)\) 围成图形的面积。`,
          T`图形关于极轴对称，取 \(\theta\in[0,\pi]\) 加倍：\(A=2\cdot\frac12\int_0^\pi a^2(1+\cos\theta)^2d\theta=a^2\int_0^\pi\left(1+2\cos\theta+\frac{1+\cos2\theta}{2}\right)d\theta=\frac32\pi a^2\)。`),
      ]
    },
    {
      id: 's6-2', title: '体积与物理应用', blocks: [
        F('旋转体体积', T`\[ V_x=\pi\int_a^b f^2(x)\,dx\ (\text{绕 }x\text{ 轴}),\qquad V_y=2\pi\int_a^b x f(x)\,dx\ (\text{绕 }y\text{ 轴，柱壳法}) \] \[ \text{参数/极坐标绕极轴：}\ V=\frac{2\pi}{3}\int_\alpha^\beta \rho^3(\theta)\sin\theta\,d\theta \]`),
        F('平行截面与功、压力', T`\[ V=\int_a^b A(x)\,dx,\qquad W=\int_a^b F(x)\,dx,\qquad P=\int_0^h \rho g\, y\, w(y)\,dy \]`),
        TIP(T`柱壳法与圆盘法的选择：若绕 \(y\) 轴旋转而函数写成 \(y=f(x)\)，用柱壳法 \(2\pi\int x f(x)dx\) 通常不必反解 \(x\)，计算更省事。`),
        VIS('volume', '旋转体：拖动上限，观察圆盘法切片与体积累积', '拖动 b，比较近似体积与精确值'),
        EX(T`半径为 \(R\) 的半球形水池盛满水，求把水全部抽出池口所需的功（水密度 \(\rho\)）。`,
          T`取深度 \(y\) 处厚 \(dy\) 的薄层，其半径 \(\sqrt{R^2-y^2}\)，体积 \(\pi(R^2-y^2)dy\)，重量 \(\rho g\pi(R^2-y^2)dy\)，需提升 \(y\)，故 \(W=\rho g\pi\int_0^R y(R^2-y^2)dy=\frac{\rho g\pi R^4}{4}\)。`),
      ]
    }
  ],
  keypoints: [T`微元法的核心是 \(dU=f(x)dx\) 且误差为高阶无穷小`, T`三种坐标系下的面积与弧长公式`, T`圆盘法、柱壳法与平行截面法`, T`功 = 力对位移的积分；压力 = 压强×面积沿深度积分`],
  pitfalls: [T`面积积分忘记取绝对值导致上下曲线颠倒时出现负值`, T`极坐标面积漏掉系数 \(\frac12\)`, T`柱壳法半径写错（绕 \(y\) 轴时半径是 \(x\) 不是 \(f(x)\)）`, T`物理应用未统一单位或未说明坐标原点`],
  visualIds: ['polar', 'volume']
});
