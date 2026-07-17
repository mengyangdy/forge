# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Forge is a full-stack TypeScript monorepo built on Vite+ (unified toolchain wrapping Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt). The global CLI is `vp` — not `vite` directly. Requires Node >= 22.12.0, pnpm 11.3.0.

## Monorepo Structure

- **apps/backend** (`@forge/backend`) — Hono API server with Drizzle ORM + PostgreSQL.
- **apps/frontend** (`@forge/frontend`) — React admin web client (Vite+, Semi Design, UnoCSS).
- **packages/shared** (`@forge/shared`) — 前后端共享：Drizzle schema、工具函数（`./utils`）、色彩（`./color`）、日志（`./logger`）。

All shared dependency versions are managed via a pnpm catalog in `pnpm-workspace.yaml` (catalogMode: prefer).

## Commands

```bash
vp install                # Install dependencies (run after pulling)
vp check                  # Format + lint + typecheck
vp check --fix            # Auto-fix lint/format issues
vp test                   # Run tests
vp run -r test            # Run tests across all packages
vp run -r build           # Build all packages
vp run ready              # Full validation: check + test all + build all
vp staged                 # Run on pre-commit (checks staged files only)
vp env doctor             # Diagnose environment issues
```

Frontend dev: `cd apps/frontend && vp dev` (or `vp run @forge/frontend#dev`).

## Key Configuration

- **vite.config.ts** — Root Vite+ config: staged linting on pre-commit, Oxlint with type-aware + type-check mode enabled.
- **pnpm-workspace.yaml** — Defines `apps/*`, `packages/*`, `tools/*` workspaces plus the dependency catalog.
- Pre-commit hook in `.vite-hooks/pre-commit` runs `vp staged`.

## Architecture Notes

- The shared database schema (`packages/shared/src/schema/`) is the single source of truth for table definitions, imported by both backend and frontend packages.
- The backend will use Hono with `@hono/node-server` (not a serverless adapter).
- The `root` package.json `dev` script references `website#dev` which doesn't match the current `@forge/frontend` package name — this needs updating.

## Vite+ Reference

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/. Run `vp help` for command list, `vp <command> --help` for details.

## 功能规划：企业级全栈脚手架 16 大技术矩阵

技术栈：Vue 3 + Vite + Hono + Drizzle + PostgreSQL + Redis，前后端一体化 Monorepo，全链路 TypeScript 类型共享。

### 第一阶段：核心工程基础（主分支底座）

1. **零配置页面级路由自动生成** — `unplugin-vue-router` 基于文件系统自动扫描 `src/pages`，生成路由配置 + TS 路由类型提示
2. **全栈立体式国际化** — 前端 `vue-i18n` + Naive UI 语言包；后端 Hono 解析 `Accept-Language`，异常消息自动匹配语种返回
3. **按钮级全栈闭环 RBAC 动态鉴权** — 5 张权限表（Users/Roles/Permissions/User_Roles/Role_Permissions），Hono 中间件 + 前端路由守卫 + `v-permission` 指令 + `<PermissionWrapper>` 组件
4. **前后端共享 Schema 与 API 类型零配置联想** — Drizzle Schema 在 `shared` 包，前端通过 `typeof table.$inferSelect` 自动推导 TS 类型，无需手写 `interface`
5. **HTTP 请求防抖 + 双 Token 无感刷新** — 封装 HTTP 客户端，请求防抖去重；Access Token 过期时自动挂起请求、后台刷新、无感重发
6. **统一主题管理 + 多标签页缓存 Layout** — Pinia + CSS 变量主题切换；左侧动态菜单、面包屑、Tabs 导航栏（右键菜单）+ `keep-alive` 路由缓存

### 第二阶段：研发效能与稳定性（中游强化）

7. **独立 Mock 层与前后端并行开发** — Vite 插件拦截 Mock，环境变量 `MOCK=false` 一键切真实后端
8. **请求失败自动重试** — Axios 拦截器内置指数退避重试（3 次，1s/2s/4s 间隔）
9. **页面级性能追踪与白屏监控** — 自动采集 FCP/TTI/白屏时延 + `window.onerror` 未捕获错误上报
10. **零 Import 组件自动导入 + B 端 Hooks** — `unplugin-auto-import` + `unplugin-vue-components`；封装 `useTable(api)` 等 CRUD 组合式函数
11. **Git 提交前代码质量拦截** — Husky + lint-staged + commitlint，格式/未定义变量/commit message 规范全卡死
12. **生产分包策略 + 全栈环境配置联动** — 跨 Monorepo `.env` 联动；Vite `splitChunks` 拆分第三方依赖 + Gzip 压缩

### 第三阶段：高级进阶（深水拓宽）

13. **跨端同构：离线数据增量同步** — CRDTs（Yjs）或 WebSocket 增量广播，解决多端并发修改冲突
14. **全栈无感审计日志** — Hono 全局中间件自动拦截非 GET 请求，JWT 解析操作人 + IP + 路由，JSON Diff 变更写入 `audit_logs` 表
15. **灰度发布 + Feature Flags 引擎** — `features.isEnabled('xxx')` 代码包裹，Redis 缓存毫秒级动态配置，按角色/百分比灰度
16. **一键容器化编排 + GitOps CI/CD** — Docker-compose 多容器编排（PG/Redis/前端/后端），`docker-compose up -d` 一键启动
