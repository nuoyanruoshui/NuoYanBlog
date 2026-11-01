---
title: "UnityDropdown：支持多选的 Dropdown"
published: 2026-06-23
description: "在 TextMeshPro Dropdown 的基础上补上多选模式，选择结果以 List 事件抛出。"
tags: [GitHub, Unity, UI]
category: Unity
author: NuoYan
sourceLink: "https://github.com/nuoyanruoshui/UnityDropdown"
draft: false
---

> 仓库地址：[nuoyanruoshui/UnityDropdown](https://github.com/nuoyanruoshui/UnityDropdown)

## 为什么写它

TMP 的 `TMP_Dropdown` 只能单选。遇到「筛选标签」「多选设置项」「选几个技能装进去」这类需求，要么自己拼一排 Toggle，要么改 Dropdown 源码。

`MultiSelectDropdown` 就是在 TMP Dropdown 的基础上加了多选模式。

## 怎么用

```csharp
public enum SelectionMode { Single, Multi }
```

- `m_SelectionMode` 切单选/多选
- `m_ToggleButton` 点开面板的按钮
- `m_SelectedText`（TMP）显示已选内容，多选时可以拼接展示
- `m_DropdownPanel` 下拉面板
- 选择变化事件：`UnityEvent<List<DropdownOptionData>>`，直接拿到选中项列表

每一项的选项数据用 `DropdownOptionData` 描述，面板里由 `DropdownItem` 渲染。

编辑器扩展 `MultiSelectDropdownEditor` 把面板、按钮、文本这几个引用收进一个分组里，拖拽配置。

## 目录

```
Runtime/  MultiSelectDropdown、DropdownOptionData、DropdownItem
Editor/   MultiSelectDropdownEditor
```

## 依赖

TextMeshPro。
