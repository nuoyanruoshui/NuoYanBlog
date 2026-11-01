---
title: "VirtualScroll：Unity 虚拟列表"
published: 2026-06-22
description: "列表项只渲染可视区域，几千条数据也能保持流畅的 Unity 虚拟滚动列表。"
tags: [GitHub, Unity, UI]
category: Unity
author: NuoYan
sourceLink: "https://github.com/nuoyanruoshui/VirtualScroll"
image: "/images/covers/virtualscroll.webp"
draft: false
---

> 仓库地址：[nuoyanruoshui/VirtualScroll](https://github.com/nuoyanruoshui/VirtualScroll)

## 概述

基于 Unity UGUI `ScrollRect` 的高性能虚拟滚动方案。只实例化视口内可见的 Cell，支持四种布局、衔尾蛇无限循环、自定义对象池、索引跳转导航、运行时可视化调试。附带中心对称轮播图组件（VirtualMap），支持平滑动画和最短路径自动寻路。

### 核心特性

- 🚀 **虚拟化渲染** — 仅实例化视口内可见的 Cell，万级数据无压力
- 🔁 **滚动增量渲染** — 滚动时只重渲染新进入视口的 Cell，其余仅更新位置，刷新成本与"实际滚入数量"成正比
- 📐 **四种布局** — `Vertical` / `Horizontal` / `GridVertical` / `GridHorizontal`，Inspector 一键切换
- 🐍 **衔尾蛇模式** — `Ouroboros` 无限循环滚动，头尾衔接到位，滚动条自动隐藏
- 🎯 **索引跳转** — `ScrollToIndex` / `ScrollToTop` / `ScrollToBottom`，精确定位
- 🔌 **自定义对象池** — `IScrollPool` 接口注入，支持 `GameObjectPool` 等任意池实现
- 🖼️ **两种刷新模式** — `EveryMovement`（滚动即刷新） / `AfterRowOrColumn`（行/列切换后刷新）
- ⏱️ **每帧合并刷新** — 同帧多次滚动事件合并，每帧最多刷新一次且不丢最终位置
- 📏 **视口自适应** — 运行时视口尺寸变化自动重算列数与池容量
- 📊 **运行时调试** — Inspector 实时显示 ContentSize、ItemCount、VisibleItemCount、监听器列表
- 🎠 **轮播图** — `VirtualMap` 中心对称显示 + 双向无缝循环 + 平滑动画 + `MoveToIndex` 最短路径

---

## 目录结构

```
Assets/.../Scroll/
├── package.json                       # UPM 包清单
├── NuoYan.Scroll.asmdef               # 程序集定义
├── Runtime/
│   ├── VirtualScrollRect.cs           # VirtualScrollRectBase（抽象基类）+ VirtualScrollRect + VirtualScrollRect<T> 泛型
│   └── VirtualMap.cs                  # VirtualMap 轮播图 + VirtualMap<T> 泛型 + Editor 创建菜单
└── Editor/
    └── VirtualScrollRectEditor.cs     # Inspector 可视化 + 运行时调试 + 右键创建菜单
```

---

## 快速开始

### 1. 创建 VirtualScrollRect

在 Hierarchy 右键 → `GameObject → UI → VirtualScrollRect`，自动生成完整结构：

```
VirtualScrollRect (Image + ScrollRect + VirtualScrollRect)
├── Viewport (RectMask2D)
│   └── Content
├── ScrollbarHorizontal
└── ScrollbarVertical
```

### 2. 设置 Cell 模板

1. 创建一个 Cell 预制体，挂载实现 `IScrollItem` 的组件：

```csharp
public class MyCell : MonoBehaviour, IScrollItem
{
    public Text NameText;
    public Image Icon;

    public void SetData(params object[] args)
    {
        NameText.text = args[0] as string;
        Icon.sprite = args[1] as Sprite;
    }
}
```

2. 将预制体拖入 `VirtualScrollRect` 的 **Template** 字段

### 3. 配置布局

在 Inspector 中设置：

| 参数 | 说明 |
|------|------|
| `CellSize` | Cell 尺寸。勾选 `UseTemplateSize` 自动读取模板 RectTransform |
| `Spacing` | Cell 间距 |
| `Padding` | 内边距 |
| `LayoutStyle` | 布局方向（Vertical / Horizontal / GridVertical / GridHorizontal） |
| `EnableVirtual` | 开启虚拟化（关闭则退化为普通 ScrollRect） |
| `Ouroboros` | 衔尾蛇无限循环（仅 Vertical/Horizontal） |

### 4. 填充数据

```csharp
var scrollRect = GetComponent<VirtualScrollRect>();

// 方式1：通过 UnityEvent（Inspector 拖拽绑定）
scrollRect.onItemRendered.AddListener((index, go) =>
{
    go.GetComponent<MyCell>().SetData($"Item {index}");
});

// 方式2：通过 UnityAction（代码绑定）
scrollRect.OnItemRendered = (index, go) =>
{
    go.GetComponent<MyCell>().SetData(dataList[index]);
};

// 方式3：IScrollItem 接口自动回调
scrollRect.OnItemRenderedOfInterface = (index, item) =>
{
    item.SetData(dataList[index]);
};

// 设置数据量（自动计算 Content 尺寸并刷新）
scrollRect.ItemCount = 1000;
```

### 5. 泛型版本

```csharp
var scrollRect = GetComponent<VirtualScrollRect<MyData>>();

scrollRect.OnItemRendered = (index, go, userData) =>
{
    go.GetComponent<MyCell>().SetData(userData.name, userData.icon);
};

scrollRect.ItemCount = dataList.Count;
```

---

## 架构概览

```
┌──────────────────────────────────────────────────────┐
│                  VirtualScrollRectBase                │
│         (abstract, extends ScrollRect)                │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ m_ItemList: List<ItemData>                    │   │
│  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐                    │   │
│  │  │ 0 │ │ 1 │ │ 2 │ │ 3 │ ... (仅 N 个物理项) │   │
│  │  └───┘ └───┘ └───┘ └───┘                    │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  OnScrollChanged → 合并（同帧只记录最新位置）         │
│  LateUpdate → ProcessScroll → RefreshItems(true)      │
│    │  （增量渲染：仅重渲染数据索引变化的 Cell）       │
│    │                                                 │
│    ├─ CalculateStartIndex (当前视口顶部/左端索引)     │
│    ├─ UpdateItemPositions (物理项重排 + 定位)        │
│    │    ├─ 物理项不足 → AdjustItemCount (增/删)      │
│    │    ├─ 复用离屏项 → SetAsFirstSibling/Last       │
│    │    └─ 计算位置 → anchoredPosition               │
│    └─ RaiseItemRendered (仅对 index 变化项派发)      │
│                                                      │
│  Layout: SetupVertical / SetupHorizontal             │
│          SetupGridVertical / SetupGridHorizontal     │
└──────────────────────────────────────────────────────┘
```

### 核心数据结构

| 结构 | 作用 | 复杂度 |
|------|------|--------|
| `m_ItemList` | `List<ItemData>` — 虚拟项池，仅包含可见及缓冲项 | 遍历: O(可见数) |
| `ItemData.index` | 当前 Cell 对应的数据索引（Ouroboros 下取模） | 下标访问: O(1) |
| `ItemData.CellPosition` | 网格布局下的行列坐标 | 定位: O(1) |
| `m_CachedVisibleItems` | 可见项缓存（按 Rect 相交检测） | 查询: O(可见数) |

### 刷新模式对比

| 模式 | 触发条件 | 适用场景 |
|------|---------|---------|
| `EveryMovement` | 滚动偏移 ≥ 0.005 | 实时跟随，滑动丝滑 |
| `AfterRowOrColumn` | 行/列索引变化 | 减少刷新次数，低端设备优化 |

> 两种模式下滚动刷新均采用**增量渲染**：只对数据索引发生变化的 Cell 重新调用渲染回调（`RaiseItemRendered`），其余 Cell 仅更新位置——单次刷新的渲染调用数从「可见 Cell 总数」降为「实际滚入视口的 Cell 数」，滚动 CPU 与 GC 显著下降。

---

## API 参考

### VirtualScrollRectBase（抽象基类）

**配置属性（Inspector 可见）：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `ItemCount` | `int` | 总数据量。**每次赋值都会强制全量刷新**（含同值赋值，覆盖"数量未变但数据已变"的场景），赋值后无需再手动刷新 |
| `Template` | `GameObject` | Cell 模板预制体 |
| `CellSize` | `Vector2` | Cell 尺寸（`UseTemplateSize` 为 true 时自动读取） |
| `Spacing` | `Vector2` | Cell 间距 |
| `Padding` | `RectOffset` | 内边距 |
| `LayoutStyle` | `LayoutType` | 布局方向 |
| `EnableVirtual` | `bool` | 开启虚拟化 |
| `Ouroboros` | `bool` | 衔尾蛇无限循环 |
| `UseTemplateSize` | `bool` | 自动从模板读取尺寸 |
| `RenderType` | `RenderType` | 刷新策略 |

**静态调试开关：**

| 字段 | 说明 |
|------|------|
| `DebugShowIndex` | `static bool`（默认 false）。为 true 时在编辑器内把 Cell 物体名改为数据索引，便于调试；关闭可避免滚动时层级 dirty |

**公共方法：**

| 方法 | 说明 |
|------|------|
| `ScrollToIndex(int)` | 滚动到指定索引 |
| `ScrollToTop()` | 滚动到顶部 |
| `ScrollToBottom()` | 滚动到底部 |
| `RefreshItems()` | 全量重渲染所有可见项（数据变更后使用，等价于 `RefreshItems(false)`） |
| `RefreshItems(bool deltaOnly)` | `deltaOnly=true` 只重渲染数据索引发生变化的项（滚动路径内部使用） |
| `GetVisibleItems()` | 获取当前可见项列表（无分配相交检测） |
| `ItemIsVisible(int)` | 判断指定索引是否可见 |
| `SetPool(IScrollPool)` | 注入自定义对象池 |

> ⚠️ **刷新约定**：`ItemCount` setter 已内置全量刷新，数据变更后**不要**在 setter 后手动调用 `RefreshItems()`（会双份全量渲染）。唯一例外：在 setter 与刷新之间重新绑定了渲染监听（`RemoveAllListeners` + `AddListener`），才需要手动刷新一次。

### VirtualScrollRect（非泛型实现）

**渲染事件：**

| 事件 | 类型 | 参数 |
|------|------|------|
| `onItemRendered` | `UnityEvent<int, GameObject>` | 数据索引, Cell GameObject |
| `OnItemRendered` | `UnityAction<int, GameObject>` | 同上 |
| `onItemRenderedOfInterface` | `UnityEvent<int, IScrollItem>` | 数据索引, `IScrollItem` 组件 |
| `OnItemRenderedOfInterface` | `UnityAction<int, IScrollItem>` | 同上 |

> `OnItemRenderedOfInterface` 自动调用 `go.GetComponent<IScrollItem>()`，由业务方在事件中自行 `SetData`。

### VirtualScrollRect\<T\>（泛型实现）

| 事件 | 类型 | 参数 |
|------|------|------|
| `onItemRendered` | `UnityEvent<int, GameObject, T>` | 数据索引, Cell, `UserData` |
| `OnItemRendered` | `UnityAction<int, GameObject, T>` | 同上 |

### IScrollItem / IScrollPool（扩展接口）

```csharp
public interface IScrollItem
{
    void SetData(params object[] args);
}

public interface IScrollPool
{
    GameObject GetItem();
    void ReturnItem(GameObject item);
}
```

---

## VirtualMap（轮播图）

中心对称布局的轮播图组件，以当前索引为中心、两侧对称显示指定数量的元素。

### 快速上手

```csharp
var map = GetComponent<VirtualMap>();

// 配置
map.MapPrefab = cellPrefab;
map.CenterExtraShowCount = 1;  // 中心+左右各1，共3个可见
map.Layout = VirtualMap.LayoutType.Horizontal;
map.Spacing = new Vector2(200, 0);
map.Loop = true;

// 填充数据
map.MapCount = 10;
map.OnMapRendered = (index, go) =>
{
    go.GetComponent<MyCell>().SetData(dataList[index]);
};

// 导航
map.NextMap();         // 下一个（右/下）
map.LastMap();         // 上一个（左/上）
map.MoveToIndex(5);    // 平滑动画移动到索引 5（循环模式走最短路径）
```

### 配置属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `CenterExtraShowCount` | `int` | 中心两侧各显示数量（如 1 = 共 3 个可见） |
| `Layout` | `LayoutType` | Horizontal / Vertical |
| `CenterOffset` | `Vector2` | 中心元素基准位置 |
| `Spacing` | `Vector2` | 元素间距 |
| `Size` | `Vector2` | 单个元素尺寸 |
| `Loop` | `bool` | 无限循环 |
| `AnimationDuration` | `float` | 动画时长 |
| `AnimationCurve` | `AnimationCurve` | 缓动曲线 |
| `UseWholeMovement` | `bool` | true = 整体移动容器（更流畅），false = 逐个移动 |

### 事件

| 事件 | 参数 | 说明 |
|------|------|------|
| `onMapRendered` | `(int index, GameObject go)` | 每次布局刷新 |
| `OnMapRendered` | `(int index, GameObject go)` | 同上（代码绑定） |
| `onMoveFinished` | — | 动画结束 |
| `OnMoving` | `(Vector3 delta)` | 动画进行中（每帧位移增量） |

### 动画模式

| 模式 | `UseWholeMovement` | 原理 |
|------|-------------------|------|
| 整体移动 | `true`（推荐） | 移动 Content 容器，动画结束后复位并刷新布局 |
| 逐个移动 | `false` | 逐个插值每个元素的本地位置 |

---

## 自定义对象池

内置默认使用 `Instantiate` / `Destroy`，通过 `IScrollPool` 注入自定义池：

```csharp
public class MyPool : IScrollPool
{
    public GameObject GetItem() => GameObjectPool.Instance.GetGameObject(PoolItemConstants.MyCell);
    public void ReturnItem(GameObject item) => GameObjectPool.Instance.Release(item);
}

// 注入
scrollRect.SetPool(new MyPool());
```

---

## Editor 工具

### Inspector 调试面板

运行时选中 VirtualScrollRect，Inspector 实时显示：

- **ContentSize** — Content 实际尺寸
- **ItemCount** — 数据总量
- **VisibleItemCount** — 当前可见/激活的 Cell 数量
- **EventListener** — 所有渲染事件监听器的方法名和目标对象
- **Pool** — 自定义池类型名称（启用时）

快捷按钮：`ScrollToTop` / `ScrollToBottom` / `ScrollToIndex`

### 右键创建菜单

- `GameObject → UI → VirtualScrollRect` — 创建完整结构的虚拟滚动列表
- `GameObject → UI → VirtualMap` — 创建轮播图对象

---

## 常见问题

**Q: 数据更新后列表未刷新？**
A: 直接重新设置 `ItemCount` 即可——setter 每次赋值都会自动 `CalcugulateSize()` + 全量 `RefreshItems()`（**含同值赋值**，不会因数量相同而跳过，覆盖"数量未变但数据已变"的场景）。正常数据刷新场景**不要**在 setter 后手动调用 `RefreshItems()`（会双份全量渲染）。唯一例外：在 setter 与刷新之间重新绑定了渲染监听（`RemoveAllListeners` + `AddListener`），才需要手动刷新一次。

**Q: Ouroboros 模式下滚动条消失了？**
A: 刻意设计。衔尾蛇无限循环时滚动条位置无实际意义，自动隐藏；关闭 `Ouroboros` 后恢复。

**Q: Grid 布局下列数/行数如何计算？**
A: 列数 = `(视口宽 - Padding 水平) / (CellSize.x + Spacing.x)` 向下取整，最小为 1。尺寸变化时自动重算（带缓存）。

**Q: VirtualMap 循环模式下 MoveToIndex 走长路？**
A: `MoveToIndex` 已内置最短路径判断：对比正向步数和反向步数（`mapCount - steps`），自动选择较短方向。动画逐帧执行 `AnimateMove`。

**Q: 如何判断某个索引是否在屏幕内？**
A: 调用 `ItemIsVisible(index)`，内部通过 `GetVisibleItems()` 的 `Rect.Intersects` 判断。

**Q: RenderType 该选哪个？**
A: `EveryMovement` 适合注重流畅度的场景；`AfterRowOrColumn` 适合低端设备或数据量大时降低刷新频率。两者均采用增量渲染，滚动成本都很低。

---

## 更新记录

### 2026-08-26（性能优化 + API 契约调整）

- **滚动增量渲染**：滚动路径只重渲染新进入视口的 Cell（新增 `RefreshItems(bool deltaOnly)`），其余 Cell 仅更新位置——单次刷新的渲染调用数从「可见 Cell 总数」降为「实际滚入数量」
- **`ItemCount` 契约变更**：删除同值 early-return，每次赋值强制全量刷新（修复"数量未变但数据已变 → 显示陈旧"）；setter 成为唯一刷新入口，赋值后无需再手动调 `RefreshItems()`
- **滚动事件合并**：同帧多次滚动事件合并，`LateUpdate` 每帧统一处理一次，且不丢同帧内最后一次位置更新（替代原"跳过同帧后续事件"方案）
- **视口自适应**：运行时视口尺寸变化自动重算列数与池容量（仅尺寸真正变化时触发，避免布局回调抖动）
- **可见性检测无分配**：`GetVisibleItems` 改用复用 corner 数组的 `QuickIntersects`，消除每次检测的 `new Vector3[4]` 分配
- **调试开关**：新增静态字段 `DebugShowIndex`（默认 false），编辑器内显示 Cell 数据索引
- **`m_LastScrollPosition` 初值修正**：由 0 改为 -1，消除 `EveryMovement` 首次事件的无意义刷新

---

## 依赖

- `UnityEngine.UI`（UGUI `ScrollRect`）
- `UnityEngine.EventSystems`
- `NuoYan.Extension`

---

## 许可

MIT License
