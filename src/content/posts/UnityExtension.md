---
title: "UnityExtension：通用扩展库"
published: 2026-06-23
description: "单例、Optional/Maybe、责任链、每日定时、对象池与各类扩展方法的 Unity 通用工具库。"
tags: [GitHub, Unity, 工具库]
category: Unity
author: NuoYan
sourceLink: "https://github.com/nuoyanruoshui/UnityExtension"
image: "/images/covers/unityextension.webp"
draft: false
---

> 仓库地址：[nuoyanruoshui/UnityExtension](https://github.com/nuoyanruoshui/UnityExtension)

Unity 通用扩展库——提供单例模式、可选值（Optional/Maybe 单子）、责任链、每日定时事件、对象池、数学/时间工具、以及覆盖 Transform/GameObject/Input/UI 的扩展方法集合。

**命名空间：** `NuoYan.Extension` / `NuoYan.Singleton` / `NuoYan.Optional` / `NuoYan.Tools` / `NuoYan.ProcessChain` / `NuoYan.Utility`

---

## 目录

- [单例模式](#单例模式)
- [可选值 Optional](#可选值-optional)
- [空值检查 PreCheck](#空值检查-precheck)
- [责任链 ProcessChain](#责任链-processchain)
- [每日定时事件 DailySystem](#每日定时事件-dailysystem)
- [对象池](#对象池)
- [数学工具 Utility.Math](#数学工具-utilitymath)
- [时间工具 Utility.Time](#时间工具-utilitytime)
- [UnityEvent 反射 Utility.Event](#unityevent-反射-utilityevent)
- [集合工具](#集合工具)
- [扩展方法](#扩展方法)
- [编辑器属性](#编辑器属性)

---

## 单例模式

`NuoYan.Singleton` 命名空间，提供 5 种单例基类：

| 类 | 适用场景 | 特点 |
|------|----------|------|
| `Singleton<T>` | 纯 C# 类 | 懒加载 + 线程安全（lock），`T : class, new()` |
| `SingletonMono<T>` | MonoBehaviour | 懒加载，自动 `DontDestroyOnLoad`，重复实例自动销毁 |
| `SingletonMonoEarliest<T>` | MonoBehaviour | 优先保留**最早**创建的实例（基于时间戳比较） |
| `SingletonMonoLatest<T>` | MonoBehaviour | 优先保留**最晚**创建的实例 |
| `SingletonSO<T>` | ScriptableObject | 从 `Resources` 加载，不存在则 `CreateInstance` |

```csharp
using NuoYan.Singleton;

// 纯 C# 单例
public class MyManager : Singleton<MyManager> { }
var mgr = MyManager.Instance;

// MonoBehaviour 单例
public class GameManager : SingletonMono<GameManager> { }
```

---

## 可选值 Optional

`NuoYan.Optional` 命名空间。完整的 Optional/Maybe 单子实现，支持 Unity 序列化 + Inspector 编辑。

### 基础用法

```csharp
using NuoYan.Optional;

// 创建
var some = Optional<string>.Some("hello");
var none = Optional<string>.None;
var fromNullable = Optional<string>.FromNullable(maybeNullString);

// 安全取值
string value = some.GetValueOrDefault("默认值");
string fallback = some.OrElse("备用值");
string result = some.OrThrow(new Exception("不能为空"));
```

### 链式操作

```csharp
Optional<User> user = GetUser(id);

string cityName = user
    .Map(u => u.Address)         // User → Address
    .Map(a => a.City)            // Address → City
    .Where(c => c.Population > 1000000)
    .GetValueOrDefault("未知城市");
```

### 模式匹配

```csharp
user.Match(
    some: u => Debug.Log($"用户: {u.Name}"),
    none: () => Debug.Log("用户不存在")
);

// 无返回值版本
user.Match(
    some: u => LoadProfile(u),
    none: () => ShowError()
);
```

### Unity 集成

```csharp
// 安全获取组件（包括已销毁的对象）
var collider = gameObject.GetOptionalComponent<Collider>();
collider.Do(c => c.enabled = true, () => Debug.Log("无 Collider"));

// 查找游戏对象
var obj = OptionalExtensions.FindOptional("Player");

// 异步操作
var data = await Optional.TryAsync(async () => await LoadDataAsync());
```

### LINQ 支持

```csharp
var result = from user in GetUser(id)
             where user.Age >= 18
             select user.Name;
```

---

## 空值检查 PreCheck

`NuoYan.Tools.PreCheck` — 统一的空值/默认值检查工具：

| 方法 | 用途 |
|------|------|
| `PreCheck.IsNull<T>(T obj)` | 检查 C# 引用类型是否为 null |
| `PreCheck.IsNullObject(UnityEngine.Object obj)` | 检查 Unity 对象（含已销毁伪空） |
| `PreCheck.IsDefault<T>(T value)` | 检查值类型是否为默认值 |
| `PreCheck.IsNull<T>(T? nullable)` | 检查可空值类型 |
| `PreCheck.IsNull<T>(List<T> list)` | 检查 List 是否为 null/空/含 null 元素 |
| `PreCheck.IsNull<TKey,TValue>(dict)` | 检查 Dictionary 是否为 null/空/含 null 键值 |
| `PreCheck.IsNullOrEmpty(ICollection)` | 检查任意集合 |
| `PreCheck.IsNullOrWhiteSpace(string)` | 字符串空白检查 |
| `PreCheck.AnyNull(params UnityEngine.Object[])` | 批量检查是否有 null |

---

## 责任链 ProcessChain

`NuoYan.ProcessChain` — 类型安全的链式处理模式：

```csharp
using NuoYan.ProcessChain;

// 构建责任链
var processor = ProcessChainBuilder
    .Start<string>()
    .Append(str => str.Trim())           // 委托处理器
    .Append(str => str.ToUpper())
    .Append<MyCustomProcessor, string>() // 自定义处理器
    .Build();

string result = processor.Handle("  hello  "); // → "HELLO"

// 链式组合
var combined = firstProcessor.Then(secondProcessor);
```

### 内置处理器

| 处理器 | 用途 |
|------|------|
| `DelegateProcess<TIn, TOut>` | 委托包装器 |
| `ConditionalProcess<TIn, TOut>` | 条件分支处理器 |
| `CompositeProcess<TIn, TOut>` | 组合多个处理器并行执行 |

---

## 每日定时事件 DailySystem

`NuoYan.Tools` 命名空间。支持 每日/每周/每月/每年 定时触发，附离线补偿 + 防作弊检测 + 服务器时间校准。

> **注意：** 该模块通过宏 `NUOYAN_DAILYTIMEEVENT` 条件编译，需在 Player Settings 中启用。

```csharp
using NuoYan.Tools;

var mgr = DailyTimeEventManager.Instance;

// 每日 8:00 触发
var dailyEvent = DailyEvent.CreateDaily("daily_reset", 8, 0, 0, () =>
{
    Debug.Log("每日刷新！");
});
mgr.AddDailyEvent(dailyEvent);

// 每周一 9:00 触发
var weeklyEvent = DailyEvent.CreateWeekly("weekly_reward", 1, 9, 0, 0, () =>
{
    Debug.Log("周奖励发放！");
});
mgr.AddDailyEvent(weeklyEvent);

// 控制
mgr.PauseEvent("daily_reset");
mgr.ResumeEvent("daily_reset");
mgr.RemoveDailyEvent("daily_reset");

// 查询
int remainSec = mgr.GetEventRemainingSeconds("daily_reset");
string remainStr = mgr.GetEventRemainingTime("daily_reset");

// 服务器时间校准
mgr.CalibrateServerTime(serverTimestamp);
```

### 事件类型

| 枚举值 | 说明 |
|------|------|
| `EventType.Daily` | 每日定时 |
| ` EventType.Weekly` | 每周定时（指定星期几） |
| `EventType.Monthly` | 每月定时（指定日期） |
| ` EventType.Yearly` | 每年定时（指定月日） |

---

## 对象池

三种池化实现，覆盖类和集合：

### ObjectCache\<T\> — 通用类对象池

```csharp
// 获取对象
var obj = ObjectCache<MyClass>.Get();

// 释放回池（支持 IObjectCachePoolable 接口自动重置）
ObjectCache<MyClass>.Release(obj);

// using 语法自动释放
using (ObjectCache<MyClass>.Get(out var pooled))
{
    pooled.DoSomething();
} // 自动 Release

// 管理与调试
ObjectCache<MyClass>.Prewarm(10);
ObjectCache<MyClass>.SetMaxSize(128);
var stats = ObjectCache<MyClass>.GetStatistics(); // 命中率等
```

### ListPool\<T\> — List 池

```csharp
using (ListPool<int>.Get(out var list))
{
    list.Add(1);
    list.Add(2);
} // 自动清空并归还
```

### DictionaryPool\<TKey, TValue\> — Dictionary 池

```csharp
using (DictionaryPool<string, int>.Get(out var dict))
{
    dict["a"] = 1;
} // 自动清空并归还
```

---

## 数学工具 Utility.Math

`NuoYan.Utility.Utility.Math`：

| 类别 | 方法 | 说明 |
|------|------|------|
| 曲线 | `Bezier(t, points)` | 多阶贝塞尔曲线 |
| | `CatmullRom(t, p0,p1,p2,p3)` | Catmull-Rom 样条插值 |
| | `AnimationCurveToWorldPosition(curve, step)` | 曲线 → 世界坐标数组 |
| 波形 | `Sin/Cos(t, a,b,c,d)` | 标准正弦/余弦波 `y = a·sin(bx+c)+d`，支持 Vector2/3/4 叠加 |
| 随机 | `RandomVector2/3/4(min, max)` | 范围内随机向量 |
| | `RandomColor(min, max)` | 范围内随机颜色 |
| | `GenerateUniqueID()` | 线程安全的永不重复整数 ID |
| 几何 | `DistanceToLine(point, start, end)` | 点到线段距离 (Vector2/3) |
| 物理 | `ProjectileMotion(p0, v0, g, t)` | 抛体运动轨迹 |
| | `SpringMotion(pos, target, v, k, d, dt)` | 弹簧运动模拟 |
| | `InertiaMotion(pos, v, dt)` | 惯性运动 |
| 转换 | `DegreeToRadian / RadianToDegree` | 角度弧度互转 |
| | `ClampAngle(angle)` | 角度限制到 0°–360° |

---

## 时间工具 Utility.Time

`NuoYan.Utility.Utility.Time` — 时间戳与 DateTime 互转、格式化：

```csharp
using NuoYan.Utility;

long nowMs = Utility.Time.Now;                        // 当前毫秒时间戳
DateTime dt = Utility.Time.Transition(timestamp);     // 时间戳 → DateTime
long ts = Utility.Time.Transition(dateTime);          // DateTime → 时间戳

long sec = Utility.Time.GetTimeStamp();               // 当前秒级时间戳
string fmt = Utility.Time.SecondsToTimeFormat(3661);  // → "01:01:01"

DateTime todayStart = Utility.Time.GetTodayStart();   // 今日 00:00:00
DateTime ago = Utility.Time.GetDaysAgo(7);            // 7 天前
```

### 常量

| 常量 | 值 |
|------|-----|
| `DAY` | 86400000L |
| `HOUR` | 3600000L |
| `MINUTE` | 60000L |
| `SECOND` | 1000L |

---

## UnityEvent 反射 Utility.Event

`NuoYan.Utility.Utility.Event` — 获取 `UnityEventBase` 的所有订阅者（含 Inspector 持久化 + 运行时 AddListener），用于调试/分析事件绑定：

```csharp
var calls = Utility.Event.GetAllEventCalls(myUnityEvent);
foreach (var call in calls)
{
    Debug.Log($"目标: {call.Target}, 方法: {call.Method.Name}");
}
```

---

## 集合工具

### BidirectionalDictionary\<K, V\>

`NuoYan.Extension` 命名空间。支持正反向查找 + Unity 序列化：

```csharp
var dict = new BidirectionalDictionary<string, int>();
dict.Add("one", 1);
int value = dict.Forward["one"];    // 1
string key = dict.Reverse[1];       // "one"
```

### OneToManyDictionary / OneToManyList / SortedOneToManyList

一对多映射集合，支持自动排序。

---

## 扩展方法

| 模块 | 方法 | 说明 |
|------|------|------|
| **Transform** | `GetActiveChildCount()` | 获取激活子对象数量 |
| | `GetActiveChild()` | 获取第一个激活的子对象 |
| **GameObject** | `IsGameObjectOnScreen()` | 判断对象是否在屏幕视口内 |
| **InputExtension** | `MousePointToWorldPoint` | 鼠标屏幕坐标 → 世界坐标 |
| | `MouseRaycastObject` | 获取鼠标下的 3D 物体 |
| | `IsMousePointInSceen` | 判断鼠标是否在屏幕内 |
| | `IsMousePointInRect(rect, cam)` | 判断鼠标是否在 Rect 区域内 |
| | `SetMousePosition(screenPos)` | 调用 Windows API 设置鼠标位置 |
| | `WorldObjectPointToRectPoint(pos, canvas)` | 世界坐标 → Canvas 局部坐标 |
| **ColorExtension** | 便捷色值访问与日志颜色标记 |
| **VectorExtension** | 向量序列化/反序列化，逐分量比较 |
| **StringExtension** | `IgnoreWhitespace()` / 字符串处理 |
| **TextExtension** | TextMeshPro/Text 颜色标记，超链接交互 |
| **RectTransform** | UI Rect 扩展方法 |
| **SpriteRenderer** | 精灵渲染器便捷操作 |
| **Component** | 组件查找扩展 |
| **ListExtension** | `Pop()` 弹出末尾元素、`JoinToString()` 等 |

### 输入示例

```csharp
using NuoYan.Extension;

// 鼠标 3D 射线检测
GameObject hit = InputExtension.MouseRaycastObject;

// 判断鼠标是否在 UI 区域内
bool inside = InputExtension.IsMousePointInRect(myRect, myCamera);

// 世界物体映射到 Canvas 局部坐标
Vector2 localPos = InputExtension.WorldObjectPointToRectPoint(enemy.position, canvas);
```

---

## 编辑器属性

`NuoYan.Extension` 命名空间（Editor 程序集，`#if UNITY_EDITOR`）：

| 属性 | 说明 |
|------|------|
| `[NuoYanHeader("标题", ColorType.Blue, true)]` | 自定义 Inspector 标题样式 |
| `[ReadInEditor]` | 编辑器中只读字段 |
| `[ReadInPlay]` | 运行模式下只读字段 |
| `[LabelText("文本")` | Inspector 中显示只读标签文本 |
| `[MonoText("描述")` | 为 MonoBehaviour 添加描述 |
| `[EnumClass(typeof(BaseType))]` | 枚举类选择器（下拉选择程序集中的类） |
| `[EnumBool]` / `[EnumArray]` | 枚举布尔值/数组选择器 |
| `[SelectPath]` | 路径选择器（文件夹浏览器） |
| `[Group("组名")]` | 字段分组折叠面板 |
| `[RangeSlider(0, 100)]` | 范围滑块 |

```csharp
using NuoYan.Extension;

public class Example : MonoBehaviour
{
    [NuoYanHeader("角色配置", ColorType.Blue, true)]
    [SerializeField] private float speed;

    [RangeSlider(0, 200)]
    public Vector2 healthRange;

    [ReadInEditor]
    public string readonlyId;

    [EnumClass(typeof(MonoBehaviour))]
    public string selectedScript;
}
```

---

## 安装使用

1. 将 `Assets/Plugins/Extension/` 目录导入 Unity 项目
2. 按需引用命名空间：`NuoYan.Extension` / `NuoYan.Singleton` / `NuoYan.Optional` / `NuoYan.Tools` / `NuoYan.ProcessChain` / `NuoYan.Utility`
3. DailySystem 需在 Player Settings → Scripting Define Symbols 中添加 `NUOYAN_DAILYTIMEEVENT` 宏
4. 编辑器属性需在 Editor 程序集中使用（`#if UNITY_EDITOR`）

---

## 许可证

详见 [LICENSE](LICENSE) 文件。
