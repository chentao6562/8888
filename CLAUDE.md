# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 强制要求

- **所有与用户的对话必须使用中文**
- **每次测试都在服务器上实地开展**：自动上传到 GitHub → 服务器自动拉取 → 测试
- **AI 助手必须自主完成服务器部署，不要反复询问用户密码**

## 项目概述

公司管理系统（gongsiguanli）- TypeScript 全栈应用

- **GitHub 仓库**: `https://github.com/chentao6562/8888`
- **技术栈**: Node.js + Express + Prisma + MySQL
- **服务器**: 阿里云 ECS (`39.104.13.41`)

## 构建与部署命令

### 本地构建并推送
```bash
cd server && npm run build && git add -A && git commit -m "描述" && git push origin main
```

### 服务器部署（自动触发）
GitHub Push 会自动触发 Webhook：`git pull → npm install → prisma generate → build → PM2 restart`

### 手动服务器操作
```bash
# 拉取并重启
ssh root@39.104.13.41 "cd /root/projects/8888/server && git pull origin main && npm run build && pm2 restart gongsiguanli-api"

# 查看日志
ssh root@39.104.13.41 "pm2 logs gongsiguanli-api --lines 30 --nostream"
```

### PM2 进程管理
```bash
pm2 list                              # 查看所有进程
pm2 logs gongsiguanli-api --lines 30  # 查看日志
pm2 restart gongsiguanli-api          # 重启服务
```

## 服务器信息

| 属性 | 值 |
|------|-----|
| 实例名称 | `launch-advisor-20251231` |
| 公网 IP | `39.104.13.41` |
| 内网 IP | `172.17.39.169` |
| 操作系统 | Ubuntu 24.04 64位 |
| CPU / 内存 | 2 vCPU / 4 GiB |
| 用户名 | `root` |
| 密码 | `c65623518+` |
| 项目目录 | `/root/projects/8888` |

## 项目目录结构

```
8888/
├── CLAUDE.md              # 项目配置文件
├── docs/                  # 设计文档
│   ├── 需求文档.md
│   ├── 业务流程图.md
│   ├── 数据库设计.md
│   └── 原型设计.md
└── server/                # 后端服务
    ├── src/               # 源代码
    │   ├── index.ts       # 入口文件
    │   ├── routes/        # 路由
    │   ├── controllers/   # 控制器
    │   ├── middlewares/   # 中间件
    │   ├── services/      # 业务逻辑
    │   └── utils/         # 工具函数
    ├── prisma/            # Prisma ORM
    │   └── schema.prisma  # 数据库模型
    ├── dist/              # 编译输出
    ├── package.json
    └── tsconfig.json
```

## 数据库

- **类型**: MySQL（本地安装在服务器上）
- **主机**: `localhost`
- **端口**: `3306`
- **数据库**: `gongsiguanli_db`
- **用户**: `root`
- **密码**: `c65623518+`

```bash
# 连接数据库
mysql -u root -p'c65623518+' gongsiguanli_db
```

## API 端点

| 服务 | 端口 | 地址 |
|------|------|------|
| 后端 API | 3000 | http://39.104.13.41/api |
| Webhook | 9000 | http://39.104.13.41/webhook |

## 架构说明

### 服务端口
- **3000**: 后端 API (PM2 进程: `gongsiguanli-api`)
- **9000**: GitHub Webhook 监听器 (PM2 进程: `webhook-listener`)
- **80/443**: Nginx 反向代理

### PM2 进程
| 进程名 | 说明 | 端口 |
|--------|------|------|
| `gongsiguanli-api` | 后端 API 服务 | 3000 |
| `webhook-listener` | GitHub 自动部署 | 9000 |

## Git 配置

### 本地（多项目隔离）
```
# ~/.ssh/config
Host github-gongsiguanli
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_gongsiguanli
```
- 本项目 SSH 地址: `git@github-gongsiguanli:chentao6562/8888.git`

### 服务器
- Deploy Key 已配置，服务器可免密拉取
- SSH 地址: `git@github.com:chentao6562/8888.git`

## GitHub Webhook 配置

| 属性 | 值 |
|------|-----|
| Payload URL | `http://39.104.13.41/webhook` |
| Content type | `application/json` |
| Secret | `c65623518+` |
| Events | Just the push event |
