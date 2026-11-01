---
title: "UnityArchiveSystem：给 Unity 一套能加密的存档系统"
published: 2026-04-03
description: "泛型存档系统：数据与槽位表分离、JSON 序列化 + AES-256 加密、带编辑器管理窗口。"
tags: [GitHub, Unity, 存档]
category: Unity
author: NuoYan
sourceLink: "https://github.com/nuoyanruoshui/UnityArchiveSystem"
image: "/images/covers/unityarchivesystem.webp"
draft: false
---

> 仓库地址：[nuoyanruoshui/UnityArchiveSystem](https://github.com/nuoyanruoshui/UnityArchiveSystem)

## 为什么写它

Unity 里的存档很容易变成一团散沙：`PlayerPrefs` 存几个设置、`JsonUtility` 存一份进度、再加几个自定义二进制文件。项目一大就没人说得清"玩家的数据到底存在哪、什么格式、能不能被改"。

这个库想把这件事收拢：**存什么**（数据）和**存在哪几个槽**（表）分开，序列化和加密统一走一条路。

## 设计

核心是 `ArchiveSystem<T1, U>` 这个泛型 MonoBehaviour：

```csharp
public class ArchiveSystem<T1, U> : MonoBehaviour
    where T1 : ArchiveDataBase, new()
    where U  : ArchiveTableBase, new()
```

- `T1` 是**存档数据**（继承 `ArchiveDataBase`），`U` 是**槽位表**（继承 `ArchiveTableBase`）
- `[DefaultExecutionOrder(-800)]`，保证它在别的脚本 `Awake` 之前就把存档读好
- 单例暴露 `Instance` / `CurrentArchiveData`，读写都从这里走
- `OnError` 事件 + `ArchiveErrorType`，读档失败不会静默
- `IArhivePathPar` 接口：想让某份数据落到自定义子文件夹，实现它就行

持久化用 Newtonsoft.Json 序列化，用 `Rijindael`（AES）加密后再落盘，密钥、路径这些都收在 `ArchiveSetting` 里；异步读写走 UniTask，不会卡主线程。

## 怎么用

1. 继承 `ArchiveDataBase` 写自己的存档结构，继承 `ArchiveTableBase` 定义槽位
2. 场景里挂一个 `ArchiveSystem<MyData, MyTable>`
3. 在 `ArchiveSetting` 里配密钥和目录
4. 用编辑器窗口管理：`ArchiveSystemEditor` 管存档，`ArchiveSettingWindow` 管配置

## 目录

```
Runtime/    ArchiveSystem、ArchiveSetting、数据/表基类、AES、Vector3 序列化
Editor/     存档管理窗口与 Inspector
```

## 依赖

Newtonsoft.Json、UniTask。
