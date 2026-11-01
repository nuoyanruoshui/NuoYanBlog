---
title: "UGFExtensions：GameFramework 的一批扩展"
published: 2026-06-08
description: "给 UnityGameFramework 补的十来个小模块：数据表、Await、定时器、时间轮、图集、VFS 合并……"
tags: [GitHub, Unity, 框架]
category: Unity
author: NuoYan
sourceLink: "https://github.com/nuoyanruoshui/UGFExtensions"
image: "/images/covers/ugfextensions.webp"
draft: false
---

> 仓库地址：[nuoyanruoshui/UGFExtensions](https://github.com/nuoyanruoshui/UGFExtensions)

## 背景

[GameFramework](https://github.com/EllanJiang/GameFramework)（UGF）是一套很完整的 Unity 游戏框架，模块划分清楚、代码质量高。但它更像是"骨架"——真正做项目时，总有一堆细节要自己补：表怎么读、异步怎么写、定时怎么排、图集怎么收集。

这个仓库就是这些年补下来的零碎，一个模块一个文件夹，**按需拷贝**，不要求全用。

## 模块清单

| 模块 | 做什么 |
|---|---|
| DataTableExtension | 数据表的读取与编辑器支持 |
| AwaitExtension | 把 UGF 的回调式 API 包成 `await` 写法 |
| EditorExtension | 编辑器侧的通用扩展 |
| TimerExtension | 定时器组件的封装 |
| TimingWheel | 时间轮组件，适合大量定时任务的场景 |
| BuildExtension | 构建时自动生成版本号 |
| SpriteCollectionExtension | 图集收集相关的编辑器扩展 |
| TextureExtension | 贴图相关的扩展方法 |
| MergeFileToVFSExtension | 把散落的小文件合并进虚拟文件系统（VFS），减少包内文件数 |
| ResourceRuleExtension | 资源收集规则编辑器 |
| ReferenceBindTool | 引用绑定工具（独立仓库） |

另外根目录还有个 `Common` 放公共代码。

每个模块一个文件夹（`Assets/Extensions/<模块名>`），用哪个拷哪个，不会互相牵连。

## 致谢

站在这些轮子上：GameFramework、UnityGameFramework、StarForce、ET、DataTableEditor、Unity-SerializableDictionary、UnityEditorJunkie 等。
