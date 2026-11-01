---
title: "CodeGraph-Skill：让 AI 先建一张代码地图再动手"
published: 2026-06-02
description: "把 CodeGraph（基于 SQLite 的代码知识图谱）的安装与初始化固化成 Skill，让 AI 能查符号、追调用链、做影响分析。"
tags: [GitHub, AI, 工具]
category: 工具
author: NuoYan
sourceLink: "https://github.com/nuoyanruoshui/CodeGraph-Skill"
draft: false
---

> 仓库地址：[nuoyanruoshui/CodeGraph-Skill](https://github.com/nuoyanruoshui/CodeGraph-Skill)

## 为什么要这个 Skill

让 AI 改代码，最容易出问题的不是"它不会写"，而是**它不知道这段代码被谁调用**。改一个方法签名，可能连带十几处编译错误；删一个字段，可能某个预制体还在引用。

[CodeGraph](https://github.com/colbymchenry/codegraph)（`@colbymchenry/codegraph`）做的是把代码库索引成一张基于 SQLite 的知识图谱，提供符号搜索、调用链追踪、影响分析。对 Unity 这种"脚本挂在预制体上、引用关系藏得很深"的项目，尤其有用。

问题在于每次新项目都要手动装一遍、配 MCP、建索引——于是把这个流程写成了 Skill。

## 三步

```
# 1. 装 MCP 服务器（在项目目录下执行）
npx @colbymchenry/codegraph install --location=local -y

# 2. 建索引
npx @colbymchenry/codegraph init

# 3. 重启会话，用 /mcp 验证
```

第一步会顺手生成两个文件：

- `.mcp.json` —— MCP 服务器配置
- `.claude/settings.json` —— 工具权限白名单

之后 AI 就能直接问"这个方法被谁调用了""改这个接口会影响哪些文件"。

## 文件

```
SKILL.md    技能说明（三步配置 + 注意事项 + 排错）
README.md   索引
```

这是个纯文档型 Skill，没有代码，本质是把踩过的坑写成可复用的操作手册。
