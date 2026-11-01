---
title: "QFExtension：给 QFramework 补一个 BindableArray"
published: 2026-06-23
description: "QFramework 有 BindableProperty，却没有可绑定的数组/列表，这里补上并且能随界面自动解绑。"
tags: [GitHub, Unity, 框架]
category: Unity
author: NuoYan
sourceLink: "https://github.com/nuoyanruoshui/QFExtension"
draft: false
---

> 仓库地址：[nuoyanruoshui/QFExtension](https://github.com/nuoyanruoshui/QFExtension)

## 想解决的问题

QFramework 的 `BindableProperty<T>` 很好用：值变了自动通知界面，界面销毁时靠 `IUnRegister` 统一注销。但它的数据绑定只到「单个值」这一层——**数组/列表没有对应物**。

实际开发里这种场景特别多：背包格子、技能栏、任务列表。数据一变，界面要么整个重建（闪一下、丢状态），要么手动维护增删改三套刷新逻辑。

## BindableArray\<T\>

给列表也做一套可绑定的容器，接口拆成读写两层：

**IReadonlyBindableArray\<T\>**（给界面用）

```csharp
int Length { get; }
T this[int index] { get; }
IReadOnlyList<T> List { get; }

IUnRegister RegisterArrayReplaced(Action<T[], T[]> onReplaced);
IUnRegister RegisterElementAdded(Action<int, T> onAdded);
IUnRegister RegisterElementRemoved(Action<int, T> onRemoved);
IUnRegister RegisterElementChanged(Action<int, T, T> onChanged);
IUnRegister RegisterWithInit(Action<int, T> onInit);
```

**IBindableArray\<T\>**（给逻辑用）

```csharp
void Add(T item);
void Insert(int index, T item);
bool Remove(T item);
void RemoveAt(int index);
void SetValueWithoutEvent(T[] newItems);   // 批量替换但不想触发事件时
```

关键点是 `RegisterElementAdded / Removed / Changed` 分别对应「加一个」「删一个」「改一个」，界面可以只更新那一格，而不是整表重建；`RegisterWithInit` 方便初始化时把已有元素铺一遍。

所有 `Register*` 都返回 `IUnRegister`，可以塞进 QFramework 的 `AddTo()` 里跟着生命周期一起注销。

## 现状

仓库目前只推了这一块（`Bindable/BindableArray.cs`），后续打算把常用的集合绑定慢慢补进去。
