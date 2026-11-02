---
title: "给博客加一片会跟着鼠标的星空"
published: 2026-11-02
description: "Canvas 分层视差、星座连线、流星，以及怎么让它不抢内容、不拖性能、还能跟着主题换色。"
tags: [前端, Canvas, 性能]
category: 前端
author: NuoYan
image: "/images/covers/starfield.webp"
draft: false
---

> 这是本站背景的实现笔记。源码在 `src/components/StarField.astro`，一个组件 + 一段内联脚本，没有依赖。

## 先定边界

背景动效最容易翻车的地方不是写不出来，是**写出来之后抢戏**。动手前先立三条规矩：

1. **不挡任何点击**：`pointer-events: none`；
2. **不盖住内容**：整层压到内容下面，只在页面留白处露头；
3. **不合规就不动**：`prefers-reduced-motion` 一旦开启，全部静止。

这决定了后面所有取舍——比如星星不能太多，否则在卡片缝隙里会显得很吵。

## 分层视差：让 2D 有纵深

每颗星除了坐标，还有一个 `depth`（0.25 ~ 1）。它同时决定三件事：大小、亮度、以及**跟随鼠标移动的幅度**。

```ts
const parallax = 40; // 最大位移，像素
const px = s.x * W - smooth.x * s.depth * parallax;
const py = s.y * H - smooth.y * s.depth * parallax;
```

`smooth` 是鼠标位置的平滑值，每帧朝目标插值：

```ts
smooth.x += (mouse.x - smooth.x) * Math.min(1, dt * 6);
```

用 `dt * 6` 而不是固定系数，是为了让 144Hz 和 60Hz 的手感一致。`mouse` 取的是归一化到 `-1 ~ 1` 的值（相对屏幕中心），这样窗口多大都不需要改系数。

于是鼠标往右下动，近处的星往左上跑得多、远处的几乎不动——**眼睛会自动把这读成"纵深"**。

## 星座连线：让光标"有存在感"

光标周围一定半径内的星星会变亮，并用极淡的线连过去：

```ts
const pointerRadius = Math.min(280, Math.max(170, W * 0.14));

// 先收集附近的星，按距离排序，取最近 18 颗
const near: { x: number; y: number; d: number }[] = [];
for (const s of stars) {
	const d = Math.hypot(px - pointer.x, py - pointer.y);
	if (d < pointerRadius) near.push({ x: px, y: py, d });
}
near.sort((a, b) => a.d - b.d);

for (const p of near.slice(0, 18)) {
	const t = 1 - p.d / pointerRadius;               // 越近越亮
	ctx.strokeStyle = `${palette.line}${(0.08 + t * 0.26).toFixed(3)})`;
	ctx.beginPath();
	ctx.moveTo(pointer.x, pointer.y);
	ctx.lineTo(p.x, p.y);
	ctx.stroke();
}
```

两个细节：

- **线要淡**。透明度控制在 0.08 ~ 0.34，深色主题下像星尘，亮色主题下也不会变脏。
- **先排序再取前 N**，而不是遍历所有附近的星都连一遍——否则光标一进星群就是一团毛线。

## 流星：不需要一直有动静

流星不是常驻角色。用一个倒计时随机触发，9 ~ 19 秒一颗，划过 1.6 秒：

```ts
meteor = {
	x: fromLeft ? -80 : W + 80,
	y: -40 - Math.random() * H * 0.25,
	vx: (fromLeft ? 1 : -1) * (520 + Math.random() * 260),
	vy: 220 + Math.random() * 140,
	life: 0,
	max: 1.6,
};
```

尾巴用线性渐变画一条线段，透明度按 `sin(life/max * π)` 进出——**首尾都淡，中间最亮**，比匀速淡出更自然。

## 主题色联动

星星的颜色不能写死。深色主题用白、粉、淡紫三档；亮色主题换成更深的紫粉，否则白点在浅粉背景上根本看不见。

```ts
function currentPalette() {
	const dark = document.documentElement.classList.contains("dark");
	return dark
		? { core: ["#ffffff", "#ffd7ea", "#e3d4ff"], baseAlpha: 0.95, /* ... */ }
		: { core: ["#8f74c9", "#d97fae", "#7d6bb8"], baseAlpha: 0.78, /* ... */ };
}

// 主题切换时重新取值
new MutationObserver(() => {
	palette = currentPalette();
}).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
```

**注意**：不要在每帧里读 `getComputedStyle` 或者调 `classList.contains` 之外的 DOM 状态，读一次存起来，等 `class` 变了再读。

## 顺手让底层也动起来

页面背景是一层极光（`html::before` 的多个径向渐变）。既然已经有了鼠标的平滑值，干脆把它写给 CSS 变量：

```ts
document.documentElement.style.setProperty("--mx", smooth.x.toFixed(3));
document.documentElement.style.setProperty("--my", smooth.y.toFixed(3));
```

```css
html::before {
	transform: translate3d(calc(var(--mx, 0) * -14px), calc(var(--my, 0) * -14px), 0);
}
```

幅度只有 14px，但**整张背景都"粘"住了鼠标**——这是这片星空的点睛之笔，比加更多星星有效得多。

## 性能与边界

星空是常驻 rAF，不控制好就是笔记本的风扇杀手。这几条是底线：

```ts
// 1. DPR 封顶 2，3 倍屏不值得多画 125% 的像素
DPR = Math.min(window.devicePixelRatio || 1, 2);

// 2. 星星数量跟面积走，手机少给
const count = Math.round(Math.min(260, Math.max(90, (W * H) / 9000)));

// 3. 切标签页就停
document.addEventListener("visibilitychange", () => {
	document.hidden ? stop() : start();
});

// 4. 单帧步长封顶，切回来时不会因为 dt 过大瞬移
const dt = Math.min(48, now - last) / 1000;

// 5. 改窗口大小防抖，别拖一次就重建一遍星图
window.addEventListener("resize", () => {
	clearTimeout(timer);
	timer = setTimeout(resize, 150);
});
```

另外，窗口失焦（`blur`）时把鼠标状态归零，否则切回来星空会歪着。

## 三个真实的坑

**1. canvas 的 CSS 尺寸必须显式给。**
`canvas.width/height` 是**像素缓冲**大小，不是显示大小。只设前者，画布会被拉伸成默认的 300×150 显示尺寸：

```ts
canvas.width = Math.floor(W * DPR);
canvas.height = Math.floor(H * DPR);
canvas.style.width = `${W}px`;      // 这一行不能少
canvas.style.height = `${H}px`;
ctx.setTransform(DPR, 0, 0, DPR, 0, 0);  // 之后按 CSS 像素画就行
```

**2. `z-index: -1` 能叠在 `html::before` 上面，靠的是绘制顺序。**
两层都是 -1 时，同层级按 DOM 顺序绘制——canvas 在 body 里、`::before` 在 html 上，所以 canvas 在上。想让极光在上，把 canvas 移到 `html::before` 之外是没用的，得换 z-index。

**3. `clearRect` 必须每帧在画任何东西之前调。**
放在流星、星座、星星之间任意位置，都会留下上一帧的残影——尤其是流星拖尾。

## 最后

整份代码不到 300 行，没有第三方库。它做到的事情很少：**在你移动鼠标的时候，让背景有反应，但不打扰你读字**。

动效的价值不在于"炫"，在于让人感觉到**这个页面是有生命的**。每加一个效果之前问自己一句：它是让我更想读内容，还是更想关掉页面？

---

*本文的星空就在你屏幕背后。移动一下鼠标试试。*
