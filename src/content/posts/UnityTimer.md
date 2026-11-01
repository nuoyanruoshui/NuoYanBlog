---
title: "UnityTimer：顺手的计时器"
published: 2026-06-12
description: "延迟执行、循环、暂停、取消——Unity 里那些琐碎的时间调度统一收口。"
tags: [GitHub, Unity, 工具]
category: Unity
author: NuoYan
sourceLink: "https://github.com/nuoyanruoshui/UnityTimer"
draft: false
---

> 仓库地址：[nuoyanruoshui/UnityTimer](https://github.com/nuoyanruoshui/UnityTimer)

在 Unity 中延迟执行回调，无需协程或手动管理 `Update` 计时。

## 安装

通过 Unity Package Manager 添加 Git URL：
```
https://github.com/immortal5205/UnityTimer.git
```

> **注意**：UPM 方式不保证获取稳定版本。

---

## 快速开始

```csharp
// 5 秒后打印 "Hello World"
Timer.Register(5f, () => Debug.Log("Hello World"));
```

---

## 设计动机

Unity 内置两种计时方式：

1. **协程 + WaitForSeconds** — 语法冗长，强制使用 `IEnumerator`，且必须依赖 `MonoBehaviour`。`WaitForSeconds` 受 `Time.timeScale` 影响，无法绕过。
2. **手动 Update 计时** — 在 `Update` 中比较 `Time.time - startTime >= duration`，容易出错，且将游戏逻辑与计时代码混杂。

本库解决了上述痛点：在任意类中（包括非 `MonoBehaviour`）均可使用，API 简洁易读，同时支持真实时间和游戏时间。

---

## 功能特性

### 基础用法

```csharp
// 延迟回调
Timer.Register(2f, () => Debug.Log("2 秒后执行"));

// 循环计时器 — 每 2 秒调用一次 player.Jump()
Timer.Register(2f, player.Jump, isLooped: true);

// 带进度的逐帧回调 — 5 秒内将颜色从白色渐变到红色
Color color = Color.white;
Timer.Register(5f,
    onUpdate: elapsed => color.r = 255 * (elapsed / 5f),
    onComplete: () => Debug.Log("渐变完成"));
```

### 取消计时器

```csharp
Timer timer;

void Start()
{
    timer = Timer.Register(2f, () => Debug.Log("按下 X 键将取消这条日志"));
}

void Update()
{
    if (Input.GetKeyDown(KeyCode.X))
        Timer.Cancel(timer); // 静态方法，timer 为 null 时不会抛异常
}
```

### 真实时间 vs 游戏时间

```csharp
Time.timeScale = 0f; // 暂停游戏

// 即使游戏暂停，真实时间计时器仍会触发
Timer.Register(1f, HandlePausedGameState, useRealTime: true);
```

### 绑定 MonoBehaviour 宿主

计时器绑定到宿主后，宿主被销毁时计时器自动失效，避免访问已销毁对象导致的 `NullReferenceException`：

```csharp
public class CoolMonoBehaviour : MonoBehaviour
{
    void Start()
    {
        // 宿主销毁后，此计时器不会执行回调
        this.AttachTimer(5f, () =>
        {
            this.transform.position = Vector3.zero; // 安全
        });
    }

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.X))
            Destroy(this.gameObject); // 计时器自动失效
    }
}
```

### 暂停 / 恢复

```csharp
timer.Pause();   // 暂停计时
timer.Resume();  // 从暂停点恢复

// 批量操作
Timer.PauseAllRegisteredTimers();
Timer.ResumeAllRegisteredTimers();
```

### 重置计时器

```csharp
// 从头开始重新计时，保持 duration、回调等配置不变（零分配）
timer.Restart();
```

### 查询状态

```csharp
float elapsed     = timer.GetTimeElapsed();      // 已经过的秒数
float remaining   = timer.GetTimeRemaining();    // 剩余秒数
float progress    = timer.GetRatioComplete();     // 完成比例 0~1
float leftRatio   = timer.GetRatioRemaining();   // 剩余比例 0~1
bool  isDone      = timer.IsDone;                // 是否已结束
bool  isPaused    = timer.IsPaused;              // 是否已暂停
bool  isCompleted = timer.IsCompleted;           // 是否正常完成
bool  isCancelled = timer.IsCancelled;           // 是否已取消
```

### 运行时修改时长

```csharp
timer.Duration = 10f; // 延长或缩短计时，立即生效
```

### FixedUpdate 驱动

物理相关计时（击退、无敌帧）可与物理步长对齐，避免帧率波动影响：

```csharp
// 方式一：Register 指定 updateTiming
Timer.Register(0.5f, EndInvincibility, updateTiming: TimerUpdateTiming.FixedUpdate);

// 方式二：扩展方法重载
this.AttachTimer(0.5f, EndInvincibility,
    updateTiming: TimerUpdateTiming.FixedUpdate);
```

---

## API 参考

### Timer 静态方法

| 方法 | 说明 |
|------|------|
| `Timer.Register(duration, onComplete, ...)` | 注册新计时器 |
| `Timer.Cancel(timer)` | 取消计时器（null 安全） |
| `Timer.Pause(timer)` | 暂停计时器（null 安全） |
| `Timer.Resume(timer)` | 恢复计时器（null 安全） |
| `Timer.CancelAllRegisteredTimers()` | 取消所有计时器 |
| `Timer.PauseAllRegisteredTimers()` | 暂停所有计时器 |
| `Timer.ResumeAllRegisteredTimers()` | 恢复所有计时器 |

### Timer 实例方法 / 属性

| 成员 | 类型 | 说明 |
|------|------|------|
| `Duration` | 属性 | 计时时长（秒），可读写 |
| `IsLooped` | 属性 | 是否循环 |
| `IsCompleted` | 属性 | 是否正常完成 |
| `IsCancelled` | 属性 | 是否已取消 |
| `IsPaused` | 属性 | 是否已暂停 |
| `IsDone` | 属性 | 是否已结束（完成/取消/宿主销毁） |
| `UsesRealTime` | 属性 | 是否使用真实时间 |
| `UpdateTiming` | 属性 | 更新时机（Update / FixedUpdate） |
| `Cancel()` | 方法 | 取消此计时器 |
| `Pause()` | 方法 | 暂停此计时器 |
| `Resume()` | 方法 | 恢复此计时器 |
| `Restart()` | 方法 | 重置并重新开始 |
| `GetTimeElapsed()` | 方法 | 获取已经过的秒数 |
| `GetTimeRemaining()` | 方法 | 获取剩余秒数 |
| `GetRatioComplete()` | 方法 | 获取完成比例（0~1） |
| `GetRatioRemaining()` | 方法 | 获取剩余比例（0~1） |

### Timer 扩展方法

| 方法 | 说明 |
|------|------|
| `behaviour.AttachTimer(duration, onComplete, ...)` | 绑定到宿主，宿主销毁时自动取消 |
| `behaviour.AttachTimer(duration, onComplete, ..., updateTiming)` | 同上，支持指定 FixedUpdate |

### TimerUpdateTiming 枚举

| 值 | 说明 |
|------|------|
| `Update` | 在 `MonoBehaviour.Update()` 中驱动（默认，每帧一次） |
| `FixedUpdate` | 在 `MonoBehaviour.FixedUpdate()` 中驱动（与物理步长对齐） |

---

## 注意事项

1. **场景切换**：所有计时器在场景切换时自动销毁（`TimerManager` 随场景销毁）。
2. **不要在 `OnDestroy` 中创建计时器**：场景关闭时创建可能会导致 Unity 报错。
3. **对象池上限**：内部对象池上限 64 个实例，超出部分正常 GC 回收。
4. **暂停精度**：暂停时记录时刻，恢复时一次性补偿，消除长时间暂停的浮点累加漂移。

---

## 优化说明 (v1.2.0)

相比原版 (v1.0)，本版本进行了以下优化：

| 优化 | 说明 |
|------|------|
| 对象池 | `Stack<Timer>` 复用实例，消除高频创建/销毁的 GC 压力 |
| 零分配更新 | 手动压实循环替代 `RemoveAll` 委托，消除每帧 GC.Alloc |
| 暂停浮点修复 | 改为"暂停时记录时刻 + 恢复时一次性补偿"，消除每帧浮点累加漂移 |
| 暂停零开销 | 暂停状态下 `Update()` 直接返回，不做任何计算 |
| FixedUpdate 支持 | 新增 `TimerUpdateTiming.FixedUpdate`，物理帧对齐 |
| 运行时改时长 | `Duration` setter 公开，支持动态冷却调整 |
| Restart | 新增 `Restart()` 方法，零分配复用路径 |
| 除零保护 | `GetRatioComplete/Remaining` 在 duration ≤ 0 时安全返回 |
| DontDestroyOnLoad | `TimerManager` 跨场景保留，避免重复创建 |
| 移除 FindObjectOfType | 消除首次 Register 时的场景全遍历开销 |

---

## 许可

详见 [LICENSE](LICENSE) 文件。
