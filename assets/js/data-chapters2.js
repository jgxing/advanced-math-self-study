/* ===== 知识内容数据（第 7—12 章）与公式速查表 ===== */

/* ---------------- 第 7 章 微分方程 ---------------- */
window.CHAPTERS.push({
  id: 'ch7', no: 7, title: '微分方程', en: 'Differential Equations', color: '#6c7bd6',
  hours: 9, level: '核心',
  summary: '当已知量之间的关系表现为「未知函数及其导数」的方程时，就需要微分方程。本章按阶数与类型给出可解类的标准解法，重点是二阶常系数线性方程。',
  goals: ['识别方程类型并理解通解、特解、初值问题', '掌握可分离变量、齐次与一阶线性方程解法', '会处理三类可降阶高阶方程', '熟练求解二阶常系数齐次与非齐次线性方程'],
  sections: [
    {
      id: 's7-1', title: '基本概念与一阶方程', blocks: [
        DEF('阶、解与初值问题', T`含未知函数导数的最高阶数称为<strong>阶</strong>；\(n\) 阶方程的通解含 \(n\) 个独立任意常数；由初始条件确定常数后得到特解。几何上通解是一族<strong>积分曲线</strong>。`),
        F('可分离变量方程', T`\[ g(y)\,dy=f(x)\,dx\ \Longrightarrow\ \int g(y)\,dy=\int f(x)\,dx+C \]`),
        F('齐次方程', T`\[ \frac{dy}{dx}=\varphi\!\left(\frac yx\right)\ \xrightarrow{\ u=y/x\ }\ x\frac{du}{dx}=\varphi(u)-u \]`),
        THM('一阶线性方程与常数变易法', T`\[ y'+P(x)y=Q(x)\ \Longrightarrow\ y=e^{-\int P dx}\left(\int Q\, e^{\int P dx}dx+C\right) \]`, T`齐次解 \(Ce^{-\int Pdx}\) 中的常数「变易」为 \(C(x)\) 代入即可导出此公式。伯努利方程 \(y'+P(x)y=Q(x)y^n\) 令 \(z=y^{1-n}\) 化为线性方程。`),
        EX(T`求 \(xy'+y=x\ln x\ (x>0)\) 的通解。`,
          T`标准化为 \(y'+\frac1x y=\ln x\)，\(\int P dx=\ln x\)，故 \(y=\frac1x\left(\int x\ln x\,dx+C\right)=\frac1x\left(\frac{x^2}{2}\ln x-\frac{x^2}{4}+C\right)=\frac x2\ln x-\frac x4+\frac Cx\)。<br>也可直接观察左端是 \((xy)'\)，一次积分即得。`),
        VIS('slopefield', '方向场与积分曲线：拖动初值点，观察解曲线的走向', '点击或拖动画布选择初始条件'),
      ]
    },
    {
      id: 's7-2', title: '可降阶的高阶方程', blocks: [
        UL([
          T`<strong>\(y^{(n)}=f(x)\)</strong>：连续积分 \(n\) 次。`,
          T`<strong>\(y''=f(x,y')\)</strong>（不显含 \(y\)）：令 \(p=y'\)，降为 \(p'=f(x,p)\)。`,
          T`<strong>\(y''=f(y,y')\)</strong>（不显含 \(x\)）：令 \(p=y'\)，则 \(y''=p\frac{dp}{dy}\)，降为 \(p\frac{dp}{dy}=f(y,p)\)。`,
        ]),
        WARN(T`第三种情形最常见的错误是把 \(y''\) 写成 \(\frac{dp}{dx}\)。因为方程不含 \(x\)，应把 \(p\) 视为 \(y\) 的函数：\(y''=\frac{dp}{dx}=\frac{dp}{dy}\cdot\frac{dy}{dx}=p\frac{dp}{dy}\)。`),
      ]
    },
    {
      id: 's7-3', title: '二阶常系数线性方程', blocks: [
        THM('解的结构', T`若 \(y_1,y_2\) 是齐次方程 \(y''+py'+qy=0\) 的两个<strong>线性无关</strong>解，则通解为 \(y=C_1y_1+C_2y_2\)。非齐次方程的通解 \(=\) 对应齐次通解 \(Y\) \(+\) 非齐次的一个特解 \(y^*\)。`),
        F('特征方程法', T`\[ r^2+pr+q=0,\quad \Delta=p^2-4q \] \[ \Delta>0:\ y=C_1e^{r_1x}+C_2e^{r_2x};\quad \Delta=0:\ y=(C_1+C_2x)e^{rx} \] \[ \Delta<0\ (r=\alpha\pm i\beta):\ y=e^{\alpha x}(C_1\cos\beta x+C_2\sin\beta x) \]`),
        F('非齐次特解形式（待定系数法）', T`\[ f(x)=e^{\lambda x}P_m(x):\quad y^*=x^k e^{\lambda x}Q_m(x) \] \[ f(x)=e^{\alpha x}\left[P_l\cos\beta x+P_n\sin\beta x\right]:\quad y^*=x^k e^{\alpha x}\left[R_m\cos\beta x+S_m\sin\beta x\right] \]`),
        TIP(T`\(k\) 的取法：\(\lambda\)（或 \(\alpha+i\beta\)）不是特征根取 \(0\)，是单根取 \(1\)，是重根取 \(2\)。\(m=\max(l,n)\)，且正弦余弦两项必须<strong>成对设出</strong>，即使 \(f\) 中只出现其中之一。`),
        EX(T`求 \(y''-3y'+2y=xe^{x}\) 的通解。`,
          T`特征方程 \(r^2-3r+2=0\) 得 \(r=1,2\)，齐次通解 \(Y=C_1e^x+C_2e^{2x}\)。因 \(\lambda=1\) 是单根，取 \(k=1\)，设 \(y^*=x(ax+b)e^x\)。代入化简得 \(-2ax+2a-b=x\)，故 \(a=-\frac12,\ b=-1\)。通解 \(y=Y-\left(\frac{x^2}{2}+x\right)e^x\)。`),
        VIS('ode-solution', '二阶方程解的形态：调节 p、q 观察过阻尼、临界与振荡', '拖动 p、q，看特征根与解曲线变化'),
      ]
    }
  ],
  keypoints: [T`通解中独立任意常数的个数等于方程阶数`, T`一阶线性方程通解公式与伯努利变换`, T`不显含 \(x\) 时的降阶技巧 \(y''=p\frac{dp}{dy}\)`, T`特征根三种情形对应的齐次通解`, T`待定系数法中 \(k\) 的判定`],
  pitfalls: [T`非齐次特解忘记乘 \(x^k\) 导致与齐次解重合`, T`三角激励只设一项特解`, T`把 \(y''=f(y,y')\) 直接对 \(x\) 降阶`, T`可分离变量时除以可能为零的因子而丢解`],
  visualIds: ['slopefield', 'ode-solution']
});

/* ---------------- 第 8 章 空间解析几何与向量代数 ---------------- */
window.CHAPTERS.push({
  id: 'ch8', no: 8, title: '空间解析几何与向量代数', en: 'Vectors and Analytic Geometry', color: '#b05fc4',
  hours: 7, level: '基础',
  summary: '把代数工具引入三维空间：向量运算刻画方向与度量，平面与直线用方程描述，二次曲面则是多元函数与重积分的几何舞台。',
  goals: ['掌握点积、叉积、混合积的几何意义与计算', '会写平面与直线的各种方程并求夹角、距离', '认识柱面、旋转曲面与常用二次曲面'],
  sections: [
    {
      id: 's8-1', title: '向量及其运算', blocks: [
        F('坐标与方向', T`\[ \vec a=(a_x,a_y,a_z),\quad |\vec a|=\sqrt{a_x^2+a_y^2+a_z^2},\quad \cos\alpha=\frac{a_x}{|\vec a|},\ \cos^2\alpha+\cos^2\beta+\cos^2\gamma=1 \]`),
        F('数量积、向量积、混合积', T`\[ \vec a\cdot\vec b=|\vec a||\vec b|\cos\theta=a_xb_x+a_yb_y+a_zb_z \] \[ \vec a\times\vec b=\begin{vmatrix}\vec i&\vec j&\vec k\\a_x&a_y&a_z\\b_x&b_y&b_z\end{vmatrix},\quad |\vec a\times\vec b|=|\vec a||\vec b|\sin\theta \] \[ [\vec a\ \vec b\ \vec c]=(\vec a\times\vec b)\cdot\vec c=\begin{vmatrix}a_x&a_y&a_z\\b_x&b_y&b_z\\c_x&c_y&c_z\end{vmatrix} \]`),
        TIP(T`几何意义速记：\(\vec a\cdot\vec b=0\iff\) 垂直；\(\vec a\times\vec b\) 同时垂直于两者，模为平行四边形面积；混合积绝对值为平行六面体体积，为 \(0\iff\) 三向量共面。`),
        VIS('vector3d', '三维向量：拖动端点观察叉积方向与平行四边形面积', '拖动旋转视角或改变向量分量'),
      ]
    },
    {
      id: 's8-2', title: '平面、直线与二次曲面', blocks: [
        F('平面方程', T`\[ \text{点法式：}\ A(x-x_0)+B(y-y_0)+C(z-z_0)=0,\qquad \text{一般式：}\ Ax+By+Cz+D=0 \] \[ \text{截距式：}\ \frac xa+\frac yb+\frac zc=1,\qquad d=\frac{|Ax_0+By_0+Cz_0+D|}{\sqrt{A^2+B^2+C^2}} \]`),
        F('空间直线', T`\[ \text{对称式：}\ \frac{x-x_0}{m}=\frac{y-y_0}{n}=\frac{z-z_0}{p},\qquad \text{参数式：}\ \begin{cases}x=x_0+mt\\y=y_0+nt\\z=z_0+pt\end{cases} \] \[ \text{一般式：}\ \begin{cases}A_1x+B_1y+C_1z+D_1=0\\A_2x+B_2y+C_2z+D_2=0\end{cases},\quad \vec s=\vec n_1\times\vec n_2 \]`),
        F('常用二次曲面', T`\[ \text{椭球：}\ \frac{x^2}{a^2}+\frac{y^2}{b^2}+\frac{z^2}{c^2}=1,\quad \text{单叶双曲：}\ \frac{x^2}{a^2}+\frac{y^2}{b^2}-\frac{z^2}{c^2}=1 \] \[ \text{椭圆抛物面：}\ z=\frac{x^2}{a^2}+\frac{y^2}{b^2},\quad \text{圆锥面：}\ z^2=\frac{x^2}{a^2}+\frac{y^2}{b^2} \]`),
        TIP(T`旋转曲面生成规律：\(yOz\) 面上曲线 \(f(y,z)=0\) 绕 \(z\) 轴旋转，把 \(y\) 换成 \(\pm\sqrt{x^2+y^2}\) 得 \(f(\pm\sqrt{x^2+y^2},z)=0\)。柱面的特点是方程中<strong>缺少某个坐标</strong>。`),
      ]
    }
  ],
  keypoints: [T`点积判垂直、叉积求法向量、混合积判共面`, T`平面的点法式与直线的对称式/参数式互化`, T`点到平面、点到直线距离公式`, T`由母线方程生成旋转曲面的替换规则`],
  pitfalls: [T`叉积算错符号或把结果当标量`, T`直线一般式求方向向量时忘记取两个法向量的叉积`, T`把柱面误判为旋转曲面`],
  visualIds: ['vector3d']
});

/* ---------------- 第 9 章 多元函数微分法 ---------------- */
window.CHAPTERS.push({
  id: 'ch9', no: 9, title: '多元函数微分法及其应用', en: 'Multivariable Calculus', color: '#0d9b7a',
  hours: 11, level: '核心',
  summary: '从一元到多元，最深刻的变化是「趋近方式有无穷多条路径」。本章建立偏导、全微分、方向导数与梯度，并解决多元极值与条件极值问题。',
  goals: ['理解二重极限与连续的特殊性', '熟练求偏导、全微分与复合/隐函数导数', '掌握方向导数与梯度的关系', '会用拉格朗日乘数法求条件极值'],
  sections: [
    {
      id: 's9-1', title: '多元函数、极限与偏导数', blocks: [
        DEF('二重极限', T`\(\lim\limits_{(x,y)\to(x_0,y_0)}f(x,y)=A\) 要求点 \(P\) 以<strong>任意方式、任意路径</strong>趋于 \(P_0\) 时 \(f(P)\) 都趋于 \(A\)。因此沿两条不同路径极限不同即可判定极限不存在。`),
        WARN(T`累次极限 \(\lim\limits_{x\to x_0}\lim\limits_{y\to y_0}f\) 与二重极限不是一回事：二重极限存在时累次极限可能存在且相等，反之不然。例 \(f(x,y)=\frac{xy}{x^2+y^2}\) 沿 \(y=kx\) 趋于 \(\frac{k}{1+k^2}\)，随 \(k\) 变化，故二重极限不存在，尽管两个偏导数在原点都可定义。`),
        F('偏导数定义', T`\[ f_x(x_0,y_0)=\lim_{\Delta x\to0}\frac{f(x_0+\Delta x,y_0)-f(x_0,y_0)}{\Delta x},\qquad f_y\ \text{类似} \]`),
        TIP(T`求 \(f_x\) 时把 \(y\) 看作常数即可，全部一元求导法则照用。<strong>偏导存在不能推出连续</strong>：偏导只反映沿坐标轴两个方向的变化。`),
        VIS('surface3d', '二元函数曲面：旋转视角，观察偏导切片与切平面', '拖动旋转，切换函数，观察 x/y 切片'),
      ]
    },
    {
      id: 's9-2', title: '全微分与复合、隐函数求导', blocks: [
        DEF('全微分', T`\[ dz=\frac{\partial z}{\partial x}dx+\frac{\partial z}{\partial y}dy,\qquad \Delta z=dz+o(\rho),\ \rho=\sqrt{(\Delta x)^2+(\Delta y)^2} \]`),
        THM('可微的充分条件与关系图', T`偏导数连续 \(\Rightarrow\) 可微 \(\Rightarrow\) 偏导数存在且函数连续；反向均不成立。`),
        F('复合函数链式法则', T`\[ z=f(u,v),\ u=u(x,y),\ v=v(x,y):\quad \frac{\partial z}{\partial x}=\frac{\partial z}{\partial u}\frac{\partial u}{\partial x}+\frac{\partial z}{\partial v}\frac{\partial v}{\partial x} \]`, T`口诀：<strong>分道相加，连线相乘</strong>。先画变量关系树，逐条路径求导再求和。`),
        F('隐函数求导公式', T`\[ F(x,y,z)=0\Rightarrow \frac{\partial z}{\partial x}=-\frac{F_x}{F_z},\quad \frac{\partial z}{\partial y}=-\frac{F_y}{F_z}\quad (F_z\neq0) \] \[ \begin{cases}F(x,y,u,v)=0\\G(x,y,u,v)=0\end{cases}\Rightarrow \frac{\partial(u,v)}{\partial(x,y)}=-\frac{\partial(F,G)/\partial(x,y)}{\partial(F,G)/\partial(u,v)}\ (\text{雅可比}) \]`),
        VIS('chain-tree', '链式法则路径图：展开复合结构，看清每一项从哪条路径来', '切换复合层数，观察求导路径'),
      ]
    },
    {
      id: 's9-3', title: '方向导数、梯度与极值', blocks: [
        F('方向导数与梯度', T`\[ \frac{\partial f}{\partial \vec l}=f_x\cos\alpha+f_y\cos\beta=\nabla f\cdot\vec l^0,\qquad \nabla f=(f_x,f_y,f_z) \] \[ \max_{\vec l}\frac{\partial f}{\partial\vec l}=|\nabla f|\ (\text{沿梯度方向}),\quad \min=-|\nabla f| \]`, T`梯度方向是函数增长最快的方向，且垂直于等值线（等值面）。`),
        THM('无条件极值', T`驻点满足 \(f_x=f_y=0\)。记 \(A=f_{xx},B=f_{xy},C=f_{yy}\)，\(\Delta=AC-B^2\)：\(\Delta>0\) 且 \(A<0\) 取极大、\(A>0\) 取极小；\(\Delta<0\) 不是极值（鞍点）；\(\Delta=0\) 需另判。`),
        THM('拉格朗日乘数法', T`求 \(z=f(x,y)\) 在约束 \(\varphi(x,y)=0\) 下的极值，构造 \[ L(x,y,\lambda)=f(x,y)+\lambda\varphi(x,y), \] 解方程组 \(L_x=L_y=L_\lambda=0\)，再比较候选点。`),
        EX(T`求表面积为 \(a^2\) 的长方体的最大体积。`,
          T`设长宽高 \(x,y,z>0\)，约束 \(2(xy+yz+zx)=a^2\)。取 \(L=xyz+\lambda(2xy+2yz+2zx-a^2)\)。由 \(L_x=yz+2\lambda(y+z)=0\) 等三式相减可得 \(x=y=z\)，代入约束 \(6x^2=a^2\)，故 \(x=\frac{a}{\sqrt6}\)，\(V_{\max}=\frac{a^3}{6\sqrt6}\)。`),
        VIS('gradient', '梯度场与等值线：观察梯度如何垂直于等高线并指向增长方向', '切换函数，点击画布查看该点梯度'),
      ]
    }
  ],
  keypoints: [T`二重极限的「任意路径」要求及否定方法`, T`连续、可偏导、可微、偏导连续四者的蕴含关系`, T`链式法则的路径求和规则`, T`梯度与方向导数、等值线的几何关系`, T`海塞判别法与拉格朗日乘数法`],
  pitfalls: [T`把累次极限存在当作二重极限存在`, T`认为偏导存在即连续`, T`复合函数求导漏掉中间变量分支`, T`求条件极值时忘记把约束方程本身列入方程组`],
  visualIds: ['surface3d', 'chain-tree', 'gradient']
});

/* ---------------- 第 10 章 重积分 ---------------- */
window.CHAPTERS.push({
  id: 'ch10', no: 10, title: '重积分', en: 'Multiple Integrals', color: '#e08a18',
  hours: 9, level: '核心',
  summary: '把定积分从区间推广到平面区域与空间区域。核心技能是「选坐标系 + 定积分限」，而对称性往往能把计算量减少一半。',
  goals: ['理解二重、三重积分的定义与性质', '熟练在直角坐标与极坐标下化二重积分为累次积分', '会用柱坐标、球坐标计算三重积分', '掌握重积分的质量、质心、转动惯量应用与对称性技巧'],
  sections: [
    {
      id: 's10-1', title: '二重积分的计算', blocks: [
        DEF('二重积分', T`\[ \iint_D f(x,y)\,d\sigma=\lim_{\lambda\to0}\sum_{i=1}^n f(\xi_i,\eta_i)\Delta\sigma_i \]`, T`当 \(f\ge0\) 时表示以 \(D\) 为底、\(z=f(x,y)\) 为顶的曲顶柱体体积。`),
        F('直角坐标（X 型 / Y 型）', T`\[ D:\ a\le x\le b,\ \varphi_1(x)\le y\le\varphi_2(x)\Rightarrow \iint_D f\,d\sigma=\int_a^b dx\int_{\varphi_1(x)}^{\varphi_2(x)}f(x,y)\,dy \] \[ D:\ c\le y\le d,\ \psi_1(y)\le x\le\psi_2(y)\Rightarrow \iint_D f\,d\sigma=\int_c^d dy\int_{\psi_1(y)}^{\psi_2(y)}f(x,y)\,dx \]`),
        F('极坐标', T`\[ x=r\cos\theta,\ y=r\sin\theta,\ d\sigma=r\,dr\,d\theta,\qquad \iint_D f\,d\sigma=\int_\alpha^\beta d\theta\int_{r_1(\theta)}^{r_2(\theta)}f(r\cos\theta,r\sin\theta)\,r\,dr \]`),
        WARN(T`极坐标里<strong>千万别漏掉雅可比因子 \(r\)</strong>。当区域与圆、圆环、扇形相关，或被积式含 \(x^2+y^2\)、\(\frac yx\) 时，优先用极坐标。`),
        TIP(T`交换积分次序的标准流程：由原上下限写出区域不等式 → 画出区域草图 → 用另一方向的穿线法定限。若区域需分块，就拆成多个积分之和。`),
        VIS('region2d', '积分区域：切换 X 型/Y 型/极坐标，观察扫描线与积分限', '切换扫描方向，观察区域分块'),
      ]
    },
    {
      id: 's10-2', title: '三重积分与应用', blocks: [
        F('直角坐标（先一后二 / 先二后一）', T`\[ \iiint_\Omega f\,dV=\iint_{D_{xy}}dx\,dy\int_{z_1(x,y)}^{z_2(x,y)}f\,dz=\int_{z_1}^{z_2}dz\iint_{D_z}f\,dx\,dy \]`),
        F('柱坐标与球坐标', T`\[ x=r\cos\theta,\ y=r\sin\theta,\ z=z,\quad dV=r\,dr\,d\theta\,dz \] \[ x=\rho\sin\varphi\cos\theta,\ y=\rho\sin\varphi\sin\theta,\ z=\rho\cos\varphi,\quad dV=\rho^2\sin\varphi\,d\rho\,d\varphi\,d\theta \]`),
        F('几何与物理量', T`\[ V=\iiint_\Omega dV,\quad M=\iiint_\Omega \rho\,dV,\quad \bar x=\frac{1}{M}\iiint_\Omega x\rho\,dV,\quad I_z=\iiint_\Omega(x^2+y^2)\rho\,dV \]`),
        THM('对称性（务必先检查）', T`若 \(\Omega\) 关于 \(xOy\) 面对称：\(f\) 关于 \(z\) 为奇函数时积分为 \(0\)，为偶函数时等于对称半区域上积分的 \(2\) 倍。二重积分关于坐标轴、关于 \(y=x\) 的轮换对称性同理。`),
        EX(T`计算 \(\iint_D e^{-x^2-y^2}d\sigma\)，\(D\) 为圆 \(x^2+y^2\le R^2\)。`,
          T`用极坐标：\(\int_0^{2\pi}d\theta\int_0^R e^{-r^2}r\,dr=2\pi\cdot\left[-\frac12e^{-r^2}\right]_0^R=\pi(1-e^{-R^2})\)。由此令 \(R\to\infty\) 可推出泊松积分 \(\int_{-\infty}^{+\infty}e^{-x^2}dx=\sqrt\pi\)——这是二重积分的经典妙用。`),
      ]
    }
  ],
  keypoints: [T`二重积分化为累次积分时的定限方法`, T`极坐标的面积元 \(r\,dr\,d\theta\) 与球坐标的 \(\rho^2\sin\varphi\)`, T`交换积分次序必须画图`, T`利用对称性与轮换对称性化简`, T`质心、转动惯量的微元表达`],
  pitfalls: [T`极坐标漏 \(r\)、球坐标漏 \(\sin\varphi\)`, T`积分限中出现外层变量却写在外层积分上`, T`交换次序时未分块导致区域描述错误`, T`球坐标中 \(\varphi\) 与 \(\theta\) 的含义混淆`],
  visualIds: ['region2d']
});

/* ---------------- 第 11 章 曲线积分与曲面积分 ---------------- */
window.CHAPTERS.push({
  id: 'ch11', no: 11, title: '曲线积分与曲面积分', en: 'Vector Calculus', color: '#d94a5c',
  hours: 10, level: '进阶',
  summary: '把积分域从区间、平面区域推广到曲线与曲面，并用格林、高斯、斯托克斯三大公式把它们串联起来。这三个公式本质上都是「高维的分部积分」。',
  goals: ['区分两类曲线积分、两类曲面积分并会计算', '熟练应用格林公式及曲线积分与路径无关的条件', '会用高斯公式、斯托克斯公式化简计算', '理解散度与旋度的物理含义'],
  sections: [
    {
      id: 's11-1', title: '曲线积分与格林公式', blocks: [
        F('第一型（对弧长）', T`\[ \int_L f(x,y)\,ds=\int_\alpha^\beta f(x(t),y(t))\sqrt{x'^2(t)+y'^2(t)}\,dt \]`, T`与方向无关，\(ds>0\)，下限小于上限。`),
        F('第二型（对坐标）', T`\[ \int_L P\,dx+Q\,dy=\int_\alpha^\beta\left[P(x(t),y(t))x'(t)+Q(x(t),y(t))y'(t)\right]dt \]`, T`与路径方向有关，反向变号；两类积分的关系为 \(\int_L Pdx+Qdy=\int_L(P\cos\alpha+Q\cos\beta)\,ds\)。`),
        THM('格林公式', T`设闭区域 \(D\) 由分段光滑正向曲线 \(L\) 围成，\(P,Q\in C^1(D)\)： \[ \oint_L P\,dx+Q\,dy=\iint_D\left(\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}\right)dx\,dy. \]`, T`<strong>正向</strong>指沿曲线前进时区域始终在左侧（外边界逆时针）。`),
        THM('路径无关的四个等价条件', T`在单连通域 \(D\) 内，以下四条等价：① \(\int_L Pdx+Qdy\) 与路径无关；② 沿 \(D\) 内任意闭曲线积分为 \(0\)；③ \(\frac{\partial P}{\partial y}=\frac{\partial Q}{\partial x}\) 处处成立；④ 存在 \(u(x,y)\) 使 \(du=Pdx+Qdy\)，且 \[ u(x,y)=\int_{(x_0,y_0)}^{(x,y)}Pdx+Qdy. \]`),
        WARN(T`「单连通」不能省。经典反例 \(P=-\frac{y}{x^2+y^2},\ Q=\frac{x}{x^2+y^2}\) 在去心平面上满足 \(\frac{\partial P}{\partial y}=\frac{\partial Q}{\partial x}\)，但沿单位圆一圈的积分为 \(2\pi\neq0\)，因为区域含洞。`),
        VIS('green', '格林公式：对比环路上的第二型曲线积分与区域内的旋度积分', '切换向量场与路径形状'),
      ]
    },
    {
      id: 's11-2', title: '曲面积分、高斯与斯托克斯', blocks: [
        F('两类曲面积分', T`\[ \iint_\Sigma f\,dS=\iint_{D_{xy}}f(x,y,z(x,y))\sqrt{1+z_x^2+z_y^2}\,dx\,dy \] \[ \iint_\Sigma R\,dx\,dy=\pm\iint_{D_{xy}}R(x,y,z(x,y))\,dx\,dy\quad(\text{符号由侧决定}) \]`),
        F('高斯公式（散度定理）', T`\[ \iint_\Sigma P\,dy\,dz+Q\,dz\,dx+R\,dx\,dy=\iiint_\Omega\left(\frac{\partial P}{\partial x}+\frac{\partial Q}{\partial y}+\frac{\partial R}{\partial z}\right)dV \]`),
        F('斯托克斯公式', T`\[ \oint_\Gamma P\,dx+Q\,dy+R\,dz=\iint_\Sigma\begin{vmatrix}dydz&dzdx&dxdy\\ \frac{\partial}{\partial x}&\frac{\partial}{\partial y}&\frac{\partial}{\partial z}\\P&Q&R\end{vmatrix}=\iint_\Sigma \operatorname{rot}\vec A\cdot\vec n\,dS \]`),
        F('散度与旋度', T`\[ \operatorname{div}\vec A=\nabla\cdot\vec A=P_x+Q_y+R_z,\qquad \operatorname{rot}\vec A=\nabla\times\vec A=\begin{vmatrix}\vec i&\vec j&\vec k\\\partial_x&\partial_y&\partial_z\\P&Q&R\end{vmatrix} \]`),
        TIP(T`三条公式的统一记忆：<strong>边界上的积分 = 内部「导数」的积分</strong>。牛顿—莱布尼茨（区间→端点）、格林（平面→边界曲线）、斯托克斯（曲面→边界曲线）、高斯（立体→边界曲面）都是同一个定理在不同维数的表现。`),
      ]
    }
  ],
  keypoints: [T`两类曲线/曲面积分的区别：是否与方向（侧）有关`, T`格林公式的正向约定与补线技巧`, T`路径无关的四等价条件及单连通前提`, T`高斯公式把闭曲面积分化为三重积分`, T`散度、旋度的定义与物理意义`],
  pitfalls: [T`第一型曲线积分换元时积分限写反`, T`格林公式用于非闭曲线时忘记补线`, T`忽略奇点导致误用路径无关条件`, T`第二型曲面积分的正负号取错`],
  visualIds: ['green']
});

/* ---------------- 第 12 章 无穷级数 ---------------- */
window.CHAPTERS.push({
  id: 'ch12', no: 12, title: '无穷级数', en: 'Infinite Series', color: '#4257d6',
  hours: 11, level: '进阶',
  summary: '把「无穷多个数相加」用部分和极限严格定义，进而把函数展开成幂级数或三角级数。审敛法是本章主线，收敛域是幂级数的核心。',
  goals: ['理解级数收敛的定义与必要条件', '熟练使用正项级数各类审敛法', '判别交错级数与绝对/条件收敛', '会求幂级数收敛域、和函数与函数展开式', '了解傅里叶级数与收敛定理'],
  sections: [
    {
      id: 's12-1', title: '常数项级数的概念与审敛法', blocks: [
        DEF('收敛定义', T`\[ \sum_{n=1}^{\infty}u_n=\lim_{n\to\infty}S_n,\qquad S_n=u_1+u_2+\cdots+u_n \]`),
        THM('基本性质', T`① 收敛<strong>必要</strong>条件 \(\lim u_n=0\)（反之不成立，如调和级数）；② \(\sum ku_n\) 与 \(\sum u_n\) 同敛散（\(k\neq0\)）；③ 收敛级数可逐项相加减；④ 收敛级数加括号后仍收敛；⑤ <strong>收敛级数任意加括号</strong>不改变和，但发散级数加括号可能「变收敛」。`),
        F('正项级数审敛法', T`\[ \text{比较：}\ u_n\le v_n,\ \sum v_n\ \text{收敛}\Rightarrow\sum u_n\ \text{收敛};\qquad \lim\frac{u_n}{v_n}=l\in(0,\infty)\ \text{则同敛散} \] \[ \text{比值：}\ \lim\frac{u_{n+1}}{u_n}=\rho,\quad \text{根值：}\ \lim\sqrt[n]{u_n}=\rho,\qquad \rho<1\ \text{收敛},\ \rho>1\ \text{发散} \]`),
        F('三个基准级数', T`\[ \sum_{n=1}^\infty\frac1{n^p}:\ p>1\ \text{收敛};\qquad \sum q^n:\ |q|<1\ \text{收敛};\qquad \sum\frac1n\ \text{发散（调和级数）} \]`),
        THM('交错级数（莱布尼茨判别法）', T`若 \(u_n\downarrow0\)，则 \(\sum(-1)^{n-1}u_n\) 收敛，且余项 \(|r_n|\le u_{n+1}\)。`),
        DEF('绝对收敛与条件收敛', T`\(\sum|u_n|\) 收敛称<strong>绝对收敛</strong>；\(\sum u_n\) 收敛但 \(\sum|u_n|\) 发散称<strong>条件收敛</strong>。绝对收敛级数可任意重排且和不变；条件收敛级数重排后可以得到任意和（黎曼重排定理）。`),
        VIS('series', '部分和数列：切换级数，观察收敛与发散的差异', '拖动 n，比较部分和、通项与基准级数'),
      ]
    },
    {
      id: 's12-2', title: '幂级数与函数展开', blocks: [
        F('收敛半径', T`\[ \rho=\lim_{n\to\infty}\left|\frac{a_{n+1}}{a_n}\right|,\quad R=\frac1\rho,\qquad \sum_{n=0}^{\infty}a_nx^n\ \text{在}\ |x|<R\ \text{绝对收敛} \]`),
        TIP(T`求收敛域的三步：① 求 \(R\)；② 单独讨论端点 \(x=\pm R\)（代回后用常数项级数审敛法）；③ 写出收敛域。缺项级数（如只含偶次幂）不能直接用系数比，应对整个项用比值法再解 \(|x|\) 的范围。`),
        THM('和函数的分析性质', T`幂级数在收敛区间内可<strong>逐项求导、逐项积分</strong>，且收敛半径不变： \[ \left(\sum a_nx^n\right)'=\sum na_nx^{n-1},\qquad \int_0^x\sum a_nt^n dt=\sum\frac{a_n}{n+1}x^{n+1}. \]`),
        F('常用展开式', T`\[ \frac1{1-x}=\sum_{n=0}^\infty x^n\ (|x|<1),\qquad e^x=\sum_{n=0}^\infty\frac{x^n}{n!},\qquad \sin x=\sum_{n=0}^\infty\frac{(-1)^nx^{2n+1}}{(2n+1)!} \] \[ \ln(1+x)=\sum_{n=1}^\infty\frac{(-1)^{n-1}x^n}{n}\ (-1<x\le1),\qquad \arctan x=\sum_{n=0}^\infty\frac{(-1)^nx^{2n+1}}{2n+1} \]`),
        EX(T`求 \(\sum\limits_{n=1}^\infty\frac{n}{2^n}\) 的和。`,
          T`构造 \(S(x)=\sum n x^n=x\sum n x^{n-1}=x\left(\sum x^n\right)'=x\left(\frac{x}{1-x}\right)'=\frac{x}{(1-x)^2}\)（\(|x|<1\)）。取 \(x=\frac12\)，得 \(S=2\)。<br><em>通法</em>：先逐项积分或求导把系数 \(n\) 消掉，再还原。`),
      ]
    },
    {
      id: 's12-3', title: '傅里叶级数', blocks: [
        F('傅里叶系数（周期 2π）', T`\[ f(x)\sim\frac{a_0}{2}+\sum_{n=1}^\infty\left(a_n\cos nx+b_n\sin nx\right) \] \[ a_n=\frac1\pi\int_{-\pi}^{\pi}f(x)\cos nx\,dx,\qquad b_n=\frac1\pi\int_{-\pi}^{\pi}f(x)\sin nx\,dx \]`),
        THM('狄利克雷收敛定理', T`若 \(f\) 以 \(2\pi\) 为周期，在一个周期内连续或只有有限个第一类间断点，且只有有限个极值点，则级数收敛，且 \[ S(x)=\begin{cases}f(x),&x\ \text{为连续点}\\\dfrac{f(x^-)+f(x^+)}{2},&x\ \text{为间断点}\end{cases} \]`),
        TIP(T`奇偶延拓可大幅减半计算量：奇函数的傅里叶级数只含正弦项（正弦级数），偶函数只含余弦项（余弦级数）。把 \([0,l]\) 上的函数展开时，周期取 \(2l\)，系数中的 \(nx\) 换为 \(\frac{n\pi x}{l}\)。`),
        VIS('fourier', '傅里叶逼近：增加谐波项数，观察方波/锯齿波的吉布斯现象', '拖动谐波项数 N，观察间断点附近的过冲'),
      ]
    }
  ],
  keypoints: [T`级数收敛 \(\iff\) 部分和数列收敛`, T`\(\lim u_n=0\) 只是必要条件`, T`p 级数、几何级数两大比较基准`, T`比值/根值法在 \(\rho=1\) 时失效需另判`, T`幂级数收敛半径、端点判别与逐项求导积分`, T`狄利克雷收敛定理的间断点和值`],
  pitfalls: [T`把 \(\lim u_n=0\) 当作收敛的充分条件`, T`比值法得 \(\rho=1\) 就下结论`, T`求收敛域时漏判端点`, T`对缺项幂级数直接套系数比公式`, T`傅里叶级数在间断点处误认为收敛到 \(f(x)\)`],
  visualIds: ['series', 'fourier']
});

/* ===== 公式速查表 ===== */
window.FORMULA_GROUPS = [
  {
    id: 'fg1', title: '极限与连续', color: '#4257d6', items: [
      { name: '两个重要极限', tex: T`\lim\limits_{x\to0}\frac{\sin x}{x}=1,\quad \lim\limits_{x\to\infty}\left(1+\frac1x\right)^x=e` },
      { name: '等价无穷小', tex: T`\sin x\sim x,\ \tan x\sim x,\ \ln(1+x)\sim x,\ e^x-1\sim x,\ 1-\cos x\sim\frac{x^2}{2}` },
      { name: '常用 1^∞ 型', tex: T`\lim f(x)^{g(x)}=e^{\lim g(x)[f(x)-1]}\quad(f\to1,\ g\to\infty)` },
      { name: '数列夹逼', tex: T`y_n\le x_n\le z_n,\ \lim y_n=\lim z_n=a\Rightarrow\lim x_n=a` },
      { name: '海涅定理（函数↔数列）', tex: T`\lim_{x\to x_0}f(x)=A\iff \forall x_n\to x_0\ (x_n\neq x_0),\ f(x_n)\to A` },
    ]
  },
  {
    id: 'fg2', title: '导数与微分', color: '#0d9b7a', items: [
      { name: '导数定义', tex: T`f'(x_0)=\lim\limits_{h\to0}\frac{f(x_0+h)-f(x_0)}{h}` },
      { name: '四则运算', tex: T`(uv)'=u'v+uv',\quad \left(\frac uv\right)'=\frac{u'v-uv'}{v^2}` },
      { name: '链式法则', tex: T`\frac{dy}{dx}=\frac{dy}{du}\cdot\frac{du}{dx}` },
      { name: '参数方程求导', tex: T`\frac{dy}{dx}=\frac{\varphi'(t)}{\psi'(t)},\quad \frac{d^2y}{dx^2}=\frac{d}{dt}\left(\frac{dy}{dx}\right)\Big/\varphi'(t)` },
      { name: '莱布尼茨公式', tex: T`(uv)^{(n)}=\sum\limits_{k=0}^{n}C_n^k u^{(n-k)}v^{(k)}` },
      { name: '曲率', tex: T`K=\frac{|y''|}{(1+y'^2)^{3/2}},\quad \rho=\frac1K` },
    ]
  },
  {
    id: 'fg3', title: '中值定理与泰勒', color: '#7854c9', items: [
      { name: '拉格朗日中值定理', tex: T`f(b)-f(a)=f'(\xi)(b-a),\quad \xi\in(a,b)` },
      { name: '柯西中值定理', tex: T`\frac{f(b)-f(a)}{F(b)-F(a)}=\frac{f'(\xi)}{F'(\xi)}` },
      { name: '泰勒公式（拉格朗日余项）', tex: T`f(x)=\sum\limits_{k=0}^{n}\frac{f^{(k)}(x_0)}{k!}(x-x_0)^k+\frac{f^{(n+1)}(\xi)}{(n+1)!}(x-x_0)^{n+1}` },
      { name: 'e^x 展开', tex: T`e^x=1+x+\frac{x^2}{2!}+\frac{x^3}{3!}+\cdots` },
      { name: 'ln(1+x) 展开', tex: T`\ln(1+x)=x-\frac{x^2}{2}+\frac{x^3}{3}-\cdots\quad(-1<x\le1)` },
      { name: '牛顿迭代', tex: T`x_{n+1}=x_n-\frac{f(x_n)}{f'(x_n)}` },
    ]
  },
  {
    id: 'fg4', title: '积分公式', color: '#e08a18', items: [
      { name: '牛顿—莱布尼茨', tex: T`\int_a^b f(x)\,dx=F(b)-F(a)` },
      { name: '变上限求导', tex: T`\frac{d}{dx}\int_{\alpha(x)}^{\beta(x)}f(t)\,dt=f(\beta)\beta'-f(\alpha)\alpha'` },
      { name: '分部积分', tex: T`\int u\,dv=uv-\int v\,du` },
      { name: '华里士公式', tex: T`I_n=\int_0^{\pi/2}\sin^n x\,dx=\frac{n-1}{n}I_{n-2}` },
      { name: '反常积分 p 判别', tex: T`\int_1^{+\infty}\frac{dx}{x^p}\ \text{收敛}\iff p>1;\quad \int_0^1\frac{dx}{x^q}\ \text{收敛}\iff q<1` },
      { name: '泊松积分', tex: T`\int_{-\infty}^{+\infty}e^{-x^2}dx=\sqrt{\pi}` },
    ]
  },
  {
    id: 'fg5', title: '几何应用', color: '#1f9bb3', items: [
      { name: '平面面积（极坐标）', tex: T`A=\frac12\int_\alpha^\beta \rho^2(\theta)\,d\theta` },
      { name: '弧长', tex: T`s=\int_a^b\sqrt{1+y'^2}\,dx=\int_\alpha^\beta\sqrt{\rho^2+\rho'^2}\,d\theta` },
      { name: '旋转体体积', tex: T`V_x=\pi\int_a^b f^2(x)\,dx,\quad V_y=2\pi\int_a^b x f(x)\,dx` },
      { name: '曲面面积', tex: T`A=2\pi\int_a^b y\sqrt{1+y'^2}\,dx\ (\text{绕 }x\text{ 轴})` },
    ]
  },
  {
    id: 'fg6', title: '微分方程', color: '#6c7bd6', items: [
      { name: '一阶线性方程', tex: T`y=e^{-\int Pdx}\left(\int Q e^{\int Pdx}dx+C\right)` },
      { name: '特征方程', tex: T`y''+py'+qy=0,\quad r^2+pr+q=0` },
      { name: '重根情形', tex: T`y=(C_1+C_2x)e^{rx}` },
      { name: '共轭复根情形', tex: T`y=e^{\alpha x}(C_1\cos\beta x+C_2\sin\beta x)` },
    ]
  },
  {
    id: 'fg7', title: '多元与向量分析', color: '#0d9b7a', items: [
      { name: '全微分', tex: T`dz=f_x\,dx+f_y\,dy,\quad \Delta z=dz+o(\rho)` },
      { name: '方向导数', tex: T`\frac{\partial f}{\partial\vec l}=\nabla f\cdot\vec l^0,\quad \max=|\nabla f|` },
      { name: '隐函数求导', tex: T`F(x,y,z)=0\Rightarrow z_x=-\frac{F_x}{F_z},\ z_y=-\frac{F_y}{F_z}` },
      { name: '拉格朗日乘数法', tex: T`L=f(x,y)+\lambda\varphi(x,y),\quad L_x=L_y=L_\lambda=0` },
      { name: '极坐标面积元', tex: T`d\sigma=r\,dr\,d\theta` },
      { name: '球坐标体积元', tex: T`dV=\rho^2\sin\varphi\,d\rho\,d\varphi\,d\theta` },
      { name: '格林公式', tex: T`\oint_L Pdx+Qdy=\iint_D\left(Q_x-P_y\right)dxdy` },
      { name: '高斯公式', tex: T`\iint_\Sigma \vec A\cdot\vec n\,dS=\iiint_\Omega \nabla\cdot\vec A\,dV` },
      { name: '斯托克斯公式', tex: T`\oint_\Gamma \vec A\cdot d\vec r=\iint_\Sigma(\nabla\times\vec A)\cdot\vec n\,dS` },
    ]
  },
  {
    id: 'fg8', title: '级数', color: '#4257d6', items: [
      { name: '收敛必要条件', tex: T`\sum u_n\ \text{收敛}\Rightarrow\lim_{n\to\infty}u_n=0` },
      { name: 'p 级数', tex: T`\sum\frac1{n^p}\ \text{收敛}\iff p>1` },
      { name: '比值/根值法', tex: T`\lim\frac{u_{n+1}}{u_n}=\rho\ \text{或}\ \lim\sqrt[n]{u_n}=\rho:\ \rho<1\ \text{收敛}` },
      { name: '收敛半径', tex: T`R=\lim\limits_{n\to\infty}\left|\frac{a_n}{a_{n+1}}\right|` },
      { name: '几何级数求和', tex: T`\sum_{n=0}^\infty x^n=\frac1{1-x},\quad \sum_{n=1}^\infty n x^n=\frac{x}{(1-x)^2}\ (|x|<1)` },
      { name: '傅里叶系数', tex: T`a_n=\frac1\pi\int_{-\pi}^\pi f\cos nx\,dx,\quad b_n=\frac1\pi\int_{-\pi}^\pi f\sin nx\,dx` },
    ]
  },
];
