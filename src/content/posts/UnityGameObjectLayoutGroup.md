---
title: "UnityGameObjectLayoutGroup：让 SpriteRenderer 也能用布局组"
published: 2026-05-30
description: "Unity 自带的 LayoutGroup 只认 UI 的 RectTransform，这里补了一套能排世界坐标 Sprite 的布局管理器。"
tags: [GitHub, Unity, UI]
category: Unity
author: NuoYan
sourceLink: "https://github.com/nuoyanruoshui/UnityGameObjectLayoutGroup"
image: "/images/covers/unitygameobjectlayoutgroup.webp"
draft: false
---

> 仓库地址：[nuoyanruoshui/UnityGameObjectLayoutGroup](https://github.com/nuoyanruoshui/UnityGameObjectLayoutGroup)

## 为什么写它

Unity 的 `GridLayoutGroup` / `HorizontalLayoutGroup` 只对 UI 的 `RectTransform` 生效。可实际做游戏时，经常想用同样的方式摆**世界里的 Sprite**：卡牌、道具、关卡图标、掉落物……用代码一个个算坐标，改一次布局就要调一轮数值。

这个组件把「布局组」这个概念搬到了普通 GameObject 上：挂上去，子物体自动排列，参数和 UI 布局组一个思路。

## 能力

基于 `[ExecuteAlways]`，编辑模式下改参数就能实时看到效果，不用点运行。

拆成三个 partial：

- **Rect**：排 `RectTransform`（和 UI 布局组对齐的那套）
- **Sprite**：排世界坐标里的 `SpriteRenderer`
- **Tween**：布局变化时用 DOTween 过渡，而不是瞬移

内置 `Padding` 结构（左/右/上/下 + 横纵合计），间距、行列数这些按 UI 布局组的习惯来配。编辑器扩展在 `Editor/GameObjectLayoutGroupEditor.cs`，把参数分门别类折好。

## 怎么用

1. 建一个空物体当容器，挂上 `GameObjectLayoutGroup`
2. 把要排布的子物体放进去
3. 调间距、内边距、方向；子物体由它接管位置

## 目录

```
Runtime/  GameObjectLayoutGroup.cs + Rect / Sprite / Tween 三个 partial
Editor/   Inspector 定制
```

## 依赖

DOTween（仅 Tween 部分用到）。
