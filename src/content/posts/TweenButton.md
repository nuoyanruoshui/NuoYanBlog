---
title: "TweenButton：把按钮的过渡做成可调参的"
published: 2026-06-23
description: "Selectable 的增强版：五种过渡方式、UI 与世界两种形态，配 DOTween 做手感。"
tags: [GitHub, Unity, UI]
category: Unity
author: NuoYan
sourceLink: "https://github.com/nuoyanruoshui/TweenButton"
draft: false
---

> 仓库地址：[nuoyanruoshui/TweenButton](https://github.com/nuoyanruoshui/TweenButton)

## 为什么写它

Unity 原生 `Button` 只给 ColorTint 和 SpriteSwap 两种过渡，想要「按下去弹一下」「悬停放大」「点击播一段动画」，就得自己写一堆 `IPointerEnterHandler` / `IPointerDownHandler`。

`TweenButton` 直接继承 `Selectable`，把过渡方式做成可选项，手感用 DOTween 调。

## 能力

过渡类型：

```csharp
public enum TransitionType { None, ColorTint, SpriteSwap, Animation, Scale, Script }
```

两种形态：`TweenButtonType.UI`（给 Canvas 用）和 `TweenButtonType.World`（世界坐标里的 `SpriteRenderer`，比如 2D 场景里的交互物件）。

手感参数拆成两个可序列化的块：

- **ScaleBlock**：按下/悬停时的缩放曲线与时长
- **TweenAnimBlock**：选择 Animation 过渡时播放的那段动画

编辑器里有专门的 Drawer（`ScaleBlockDrawer`、`TweenButtonEditor`、`TweenToggleEditor`）把这些参数画得比默认 Inspector 好看一点。

## 配套的 Toggle

同一个仓库里还有 `TweenToggle` 和 `TweenToggleGroup`——Toggle 版的三态过渡，以及像 Button 那样支持单选组。

## 目录

```
Runtime/  TweenButton、TweenToggle、TweenToggleGroup、ScaleBlock、TweenButtonAnim
Editor/   三个上述 Inspector 定制
```

## 依赖

DOTween。
