---
title: "TimelineSystem：用 Timeline 拼技能系统（实验工程）"
published: 2026-07-06
description: "想用 Unity 原生 Timeline 编排技能表现与逻辑，目前还是实验工程：Timeline 资源、Taco 编辑器扩展、PMX2FBX 导入工具。"
tags: [GitHub, Unity, 战斗]
category: Unity
author: NuoYan
sourceLink: "https://github.com/nuoyanruoshui/TimelineSystem"
draft: false
---

> 仓库地址：[nuoyanruoshui/TimelineSystem](https://github.com/nuoyanruoshui/TimelineSystem)

## 想法

技能系统最麻烦的地方是「表现和逻辑怎么对齐」：前摇几帧、什么时候结算伤害、什么时候播特效、什么时候能取消。写死状态机的话，调一次数值就要改代码。

Unity 原生的 Timeline 天生适合干这个——时间轴上一格一格排事件，美术和策划都能看懂。所以想做一套**基于 Timeline 的技能编排**：技能就是一条 `Playable`，节点上挂"播放动画/生成特效/造成伤害/切换状态"这些 clip。

## 仓库现状（重要）

这还是个**实验工程**，不是一个能直接引用的库。目前里面有三块东西：

**1. Timeline 相关**

`Idle.playable`、`New Timeline.asset` 和示例场景，用来试"技能节点怎么组织、怎么复用"。

**2. Taco —— 编辑器扩展**

一套基于 UIElements 的编辑器工具集（`Taco/Editor`）：

```
Manipulator/   DragManipulator、DragHandle、RectangleSelector、DropArea…
VisualElement/ FolderView、ScriptableObjectField…
Helper/        BinaryHelper、EditorCoroutineHelper、UndoHelper…
```

做 Timeline 编辑器扩展时，很多交互（框选、拖拽、下拉菜单、撤销）都要自己实现，Taco 是这些轮子的沉淀。

**3. PMX2FBX —— 模型导入工具**

`Editor/PMX2FBX` 能解析 MMD 的 `.pmx` 模型并写成 FBX：

```
PMXParser        解析 pmx 二进制与骨骼
PMXHumanoidMapper 映射到 Unity Humanoid 骨架
FBXWriter        生成 fbx
```

做动作相关的东西，临时需要几个 MMD 模型来试手势和骨骼映射，顺手写了这个转换器。

## 结论

方向是"用时间轴表达技能"，但离成品还远。与其说是在分享一个框架，不如说是把探索过程放进来了——后面如果真做出能用的版本，再回来改写这篇。
