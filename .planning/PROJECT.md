# MathFlow

## What This Is

MathFlow 是一个面向高中生的数学表达式推导和操作平台。用户可以在 ScratchPad 工作区中输入数学表达式，通过点击操作按钮（因式分解、展开、化简等）或直接点击表达式中的项（移项、合并同类项）进行逐步推导。目标是成为能完整完成高中数学作业的工具。

## Core Value

**点击式逐步数学推导** — 用户每一步操作都能看到明确的变换结果，像手写解题一样可追溯、可回退。操作必须可靠，不能返回错误结果。

## Requirements

### Validated

<!-- 从现有代码推断的已实现能力 -->

- ✓ LaTeX 表达式输入与 KaTeX 渲染 — existing
- ✓ ScratchPad 逐步推导工作区（添加步骤、回退、历史） — existing
- ✓ 基础代数操作：因式分解、展开、化简（本地算法 + SymPy 后端） — existing
- ✓ 微积分操作：求导、积分、极限（SymPy 后端） — existing
- ✓ 手动项操作：移项、合并同类项（点击式交互） — existing
- ✓ 深色/浅色主题切换 — existing
- ✓ Toast 通知反馈 — existing
- ✓ 操作降级链：本地算法 → SymPy 后端 → 优雅失败 — existing
- ✓ Supabase 认证与数据持久化 — existing

### Active

<!-- 当前要构建的目标 -->

- [ ] 操作可靠性：所有数学操作返回正确结果，不出现错误答案或静默失败
- [ ] 更智能的化简：三角函数化简、对数化简、根式化简等
- [ ] 方程求解：一元方程、多元方程组、不等式
- [ ] 更多代数操作：通分、约分、配方、换元、乘法公式展开/还原
- [ ] 本地一键启动：一条命令启动前后端，不依赖外部服务（Supabase、云数据库等）
- [ ] 本地数据持久化：去掉 Supabase 依赖，使用本地存储（IndexedDB/localStorage/SQLite）

### Out of Scope

- 多用户协作 — 个人工具，不需要实时协作
- 移动端 App — Web 优先
- 社交/分享功能 — 不需要
- AI 辅助解题 — 后续考虑，当前专注核心数学操作
- 题目库/练习系统 — 非推导工具范畴

## Context

- 现有架构：React + TypeScript + Vite 前端，FastAPI + SymPy 后端
- 前端通过 `factorization.ts` 实现本地算法 + SymPy 后端降级链
- 后端使用 antlr4 解析 LaTeX，SymPy 进行符号计算
- 当前部署需要 Supabase（认证 + 数据库）、前端 dev server、后端容器三部分
- 用户目标是去掉外部依赖，实现真正的本地开箱即用
- 数学操作可靠性是最高优先级 — 错误的数学结果比没有结果更糟糕

## Constraints

- **技术栈**: 保持 React + TypeScript + Vite + FastAPI + SymPy 架构不变
- **平台**: 需在 Fedora Linux (Podman) 上运行，也需兼容 Windows
- **后端端口**: 8001（避免与 Supabase/Kong 的 8000 端口冲突）
- **容器**: 使用 Podman，host 网络模式避免 SELinux 问题
- **数学范围**: 高中数学（代数、三角函数、基本微积分），不涉及高等数学

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 保留 SymPy 后端 | 符号计算复杂度高，本地 JS 实现不可靠，SymPy 是最佳开源方案 | — Pending |
| 去掉 Supabase 依赖 | 个人用户开箱即用，不应依赖外部云服务 | — Pending |
| 操作可靠性优先于新功能 | 错误的数学结果破坏信任，不如功能少但可靠 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-07 after initialization*
