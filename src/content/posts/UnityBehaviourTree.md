---
title: "UnityBehaviourTree：可视化行为树"
published: 2026-08-04
description: "所见即所得的节点编辑器，在编辑器里拼出 AI 行为，运行时驱动它。"
tags: [GitHub, Unity, AI]
category: Unity
author: NuoYan
sourceLink: "https://github.com/nuoyanruoshui/UnityBehaviourTree"
draft: false
---

> 仓库地址：[nuoyanruoshui/UnityBehaviourTree](https://github.com/nuoyanruoshui/UnityBehaviourTree)

一个基于 Unity 的可视化行为树（Behaviour Tree）框架，提供所见即所得的节点编辑器，支持在编辑器中创建、编排行为树，并在运行时驱动 AI 逻辑。

本项目基于 [TheKiwiCoder/UnityBehaviourTree](https://github.com/TheKiwiCoder/UnityBehaviourTree) 二次开发与扩展，代码命名空间统一为 `NuoYan.BehaviourTrees`，编辑器菜单统一放在 `Tools/NuoYan/` 下。

- 引擎版本：Unity **2022.3.62f3c1 (LTS)**
- 源码位置：`Assets/UnityBehaviourTree/`

## 特性

- **可视化编辑器**：基于 Unity GraphView 的节点式编辑器，支持拖拽连线、框选、缩放平移、撤销/重做。
- **运行状态实时预览**：Play Mode 下节点显示 running / success / failure 高亮状态。
- **节点折叠**：复合节点可折叠/展开子树，折叠后拖动节点会同步移动整棵子树。
- **跨树复制粘贴**：支持 Ctrl+C / Ctrl+V 在树之间复制粘贴节点，并保留连接关系。
- **克隆与选中克隆**：支持单节点克隆与多选批量克隆。
- **运行时隔离**：`BehaviourTreeRunner` 在 `Start()` 时克隆树资产，运行时修改不会污染原始资产。
- **组件缓存（Context）**：自动缓存 GameObject 上的所有组件，节点通过 `context.Get<T>()` 获取组件，避免每帧 `GetComponent`。
- **自定义节点热插拔**：新增节点类自动出现在编辑器右键菜单，无需注册。

## 快速开始

1. 用 Unity Hub 以 **2022.3.62f3c1** 打开本项目，进入 `Assets/Scenes/SampleScene.unity`。
2. 打开编辑器窗口：菜单栏 **Tools → NuoYan → BehaviourTreeEditor ...**（或在 Project 窗口选中任意 `.asset` 行为树文件，会自动打开）。
3. 点击编辑器左上角"新建行为树"，输入树名与存放目录，创建一棵空树。
4. 右键画布空白处，从 `[Action]` / `[Composite]` / `[Decorator]` 分类中选择节点；右键菜单的 **Create Script...** 可直接从模板创建新的自定义节点脚本。
5. 将行为树资产拖到场景中任意 GameObject 上（自动挂载 `BehaviourTreeRunner`），进入 Play Mode 即可看到节点实时状态。

> 新建行为树默认保存在 `Assets/_BehaviourTrees` 目录（可在编辑器弹窗中修改）。

## 内置节点

### Action 动作节点（叶子节点）
| 节点 | 说明 |
| --- | --- |
| `Wait` | 等待指定时间后返回成功。 |
| `Log` | 向控制台输出一条日志，常用于调试执行顺序。 |
| `Breakpoint` | 进入节点时调用 `Debug.Break()` 暂停编辑器。 |

### Composite 组合节点（多子节点）
| 节点 | 说明 |
| --- | --- |
| `Sequencer` | 顺序执行所有子节点，全部成功才成功，任一失败立即失败。 |
| `Selector` | 顺序执行子节点，任一成功即成功，全部失败才失败。 |
| `RandomSelector` | 随机选中一个子节点执行。 |
| `Parallel` | 并行执行所有子节点，任一失败立即中止其余并返回失败，全部成功才成功。 |
| `ParallelSelector` | 并行执行所有子节点，任一成功立即中止其余并返回成功，全部失败才失败。 |
| `InterruptSelector` | Selector 增强版：更高优先级子节点获得执行权时，自动中断之前正在运行的子节点。 |

### Decorator 装饰节点（单子节点）
| 节点 | 说明 |
| --- | --- |
| `Inverter` | 反转子节点结果（成功↔失败）。 |
| `Succeed` | 子节点失败也返回成功。 |
| `Failure` | 子节点成功也返回失败。 |
| `Repeat` | 重复执行子节点指定次数（-1 为无限次），可在 Inspector 中配置重启策略。 |
| `Timeout` | 限制子节点执行时间，超时强制失败并中断子节点。 |

每个节点在 Inspector 顶部都会以 HelpBox 显示其 `description` 中文说明。

## 自定义节点

1. 新建脚本，继承对应基类并实现三个生命周期方法：

```csharp
using NuoYan.BehaviourTrees;

public class MyAction : ActionNode
{
    public float duration = 1f;
    private float startTime;

    protected override void OnStart()
    {
        startTime = Time.time;          // 每次进入节点时重置状态
    }

    protected override void OnStop()
    {
    }

    protected override State OnUpdate()
    {
        return Time.time - startTime >= duration
            ? State.Success
            : State.Running;
    }
}
```

2. 在构造函数中设置中文 `description`（Inspector 中会显示）。
3. 保存脚本后，重新打开行为树编辑器，节点即出现在右键菜单的对应分类中。

也可以直接使用右键菜单 **Create Script... → New Action/Composite/Decorator Node** 从模板创建脚本骨架（模板位于 `Assets/UnityBehaviourTree/ScriptTemplates/`）。

## 架构速览

```
BehaviourTreeRunner (MonoBehaviour, 挂在角色上)
    │  Start(): tree.Clone() → tree.Bind(context)     // 克隆资产并注入上下文
    │  Update(): tree.Update() → rootNode.Update()      // 每帧驱动整棵树
    ▼
BehaviourTree (ScriptableObject 资产, 内含全部节点子资产)
    │  GetChildren() / Traverse()                      // 抽象出树结构的遍历
    ▼
Node (所有节点基类, ScriptableObject)
    ├─ RootNode       — 树入口，单子节点
    ├─ ActionNode     — 叶子节点
    ├─ CompositeNode  — 多子节点
    └─ DecoratorNode  — 单子节点
```

- **节点生命周期**：`Update()` → 首次进入调用 `OnStart()`，之后每帧调用 `OnUpdate()`；返回非 Running 状态时调用 `OnStop()`。节点必须在 `OnStart()` 中重置每次执行的临时状态。
- **共享数据**：
  - `Context`：缓存角色上的全部组件，节点通过 `context.Get<T>()` 获取。
  - `Blackboard`：可序列化的共享数据容器（当前为空类），可在编辑器的 Blackboard 面板中按树配置共享字段。

## 编辑器工具

- **清理无效节点**：菜单 **Tools → NuoYan → 清理无效节点**。批量扫描所有行为树资产，删除因脚本丢失而产生空引用的节点。

## 目录结构

```
Assets/UnityBehaviourTree/
├─ Scripts/
│  ├─ Runtime/        # 运行时核心：Node、BehaviourTree、Runner、Context、Blackboard、各类基类
│  ├─ Actions/        # 内置动作节点
│  ├─ Composites/     # 内置组合节点
│  ├─ Decorators/     # 内置装饰节点
│  └─ Editor/         # GraphView 可视化编辑器
├─ ScriptTemplates/   # 新建节点的脚本模板
└─ UIBuilder/         # 编辑器 UXML/USS 界面文件
```
