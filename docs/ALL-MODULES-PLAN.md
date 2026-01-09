# 公司管理系统-全功能实现计划 (ALL-MODULES-PLAN.md)

> 本文档用于指导 Claude Code 逐步实现公司管理系统的所有后端功能模块

## 项目概述

- **技术栈**: TypeScript + Express + Prisma + MySQL
- **数据库**: 50+ 个表已定义在 `schema.prisma`
- **当前状态**: 仅健康检查接口，所有业务API待实现
- **总预计时间**: 约 42 小时

## 目录结构规划

```
server/src/
├── index.ts                 # 入口文件
├── types/                   # TypeScript 类型定义
│   ├── index.ts
│   ├── common.ts
│   └── dto/*.dto.ts
├── utils/                   # 工具函数
│   ├── response.ts
│   ├── pagination.ts
│   ├── password.ts
│   ├── jwt.ts
│   └── prisma.ts
├── middlewares/             # 中间件
│   ├── auth.ts
│   ├── rbac.ts
│   └── errorHandler.ts
├── services/                # 业务逻辑层
├── controllers/             # 控制器层
└── routes/                  # 路由层
```

---

## 阶段一：基础设施 (P0)

### Task 1: 类型定义与工具函数
**预计时间**: 1.5 小时
**依赖**: 无

**AI 提示词**:
```
你是一位资深的 TypeScript 后端工程师，请帮我为公司管理系统创建基础类型定义和工具函数。

ultrathink

## 任务目标
创建以下文件：
1. `server/src/types/common.ts` - 通用类型定义
2. `server/src/types/index.ts` - 统一导出
3. `server/src/utils/response.ts` - 统一响应格式工具
4. `server/src/utils/pagination.ts` - 分页工具
5. `server/src/utils/password.ts` - 密码加密工具（使用 bcryptjs）
6. `server/src/utils/jwt.ts` - JWT 工具（使用 jsonwebtoken）
7. `server/src/utils/prisma.ts` - Prisma 客户端单例
8. `server/src/utils/index.ts` - 统一导出

## 技术要求
- 统一响应格式：`{ success: boolean, data?: T, message?: string, error?: { code: string, message: string } }`
- 分页响应格式：`{ items: T[], pagination: { page, pageSize, total, totalPages } }`
- JWT 包含 userId、username、role
- 密码使用 bcrypt 加密，cost factor = 10

## 参考
- 数据库模型在 `server/prisma/schema.prisma`
- 依赖已安装：bcryptjs、jsonwebtoken

完成后运行 `npm run build` 确保编译通过。
```

---

### Task 2: 核心中间件
**预计时间**: 2 小时
**依赖**: Task 1

**AI 提示词**:
```
你是一位资深的 Node.js 后端工程师，请帮我创建公司管理系统的核心中间件。

ultrathink

## 任务目标
创建以下文件：
1. `server/src/middlewares/auth.ts` - JWT 认证中间件
2. `server/src/middlewares/rbac.ts` - 角色权限中间件
3. `server/src/middlewares/errorHandler.ts` - 全局错误处理中间件
4. `server/src/middlewares/index.ts` - 统一导出

## 技术要求

### auth.ts
- 从 Authorization header 提取 Bearer token
- 验证 JWT 并解析用户信息
- 将用户信息附加到 `req.user`
- 定义 `AuthRequest` 接口扩展 Express Request

### rbac.ts
- 创建 `authorize(...allowedRoles: UserRole[])` 高阶函数
- 检查 `req.user.role` 是否在允许列表中
- 角色定义参考 `schema.prisma` 中的 UserRole 枚举：admin, manager, operator, sales, staff

### errorHandler.ts
- 捕获所有未处理错误
- 区分已知错误（AppError）和未知错误
- 生产环境隐藏错误详情
- 返回统一的错误响应格式

## 参考文件
- `server/src/utils/jwt.ts` - JWT 工具
- `server/src/utils/response.ts` - 响应格式
- `server/prisma/schema.prisma` - UserRole 枚举

完成后运行 `npm run build` 确保编译通过。
```

---

### Task 3: 路由基础架构
**预计时间**: 1 小时
**依赖**: Task 2

**AI 提示词**:
```
你是一位资深的 Express 后端工程师，请帮我搭建公司管理系统的路由基础架构。

## 任务目标
1. 创建 `server/src/routes/index.ts` - 路由注册器
2. 更新 `server/src/index.ts` - 集成路由和中间件

## 技术要求

### routes/index.ts
- 创建主路由器
- 预留各模块路由注册位置（先注释）
- 路由前缀规划：
  - /auth - 认证
  - /users - 用户管理
  - /projects - 项目管理
  - /accounts - 账号管理
  - /traffic - 流量数据
  - /leads - 线索管理
  - /customers - 客户管理
  - /orders - 订单管理
  - /expenses - 支出管理
  - /budgets - 预算管理
  - /tasks - 任务管理
  - /notifications - 通知
  - /ai - AI分析
  - /automations - 自动化
  - /content-schedules - 内容排期
  - /materials - 素材库
  - /scripts - 话术模板
  - /website - 官网管理
  - /reports - 工作报告
  - /feedbacks - 反馈
  - /announcements - 公告
  - /dashboard - 工作台

### index.ts 更新
- 导入并使用路由器
- 集成全局错误处理中间件
- 添加 404 处理

## 参考文件
- `server/src/middlewares/errorHandler.ts`
- 当前的 `server/src/index.ts`

完成后运行 `npm run build` 并测试健康检查接口仍可用。
```

---

## 阶段二：P0 核心模块

### Task 4: 认证模块 (Auth)
**预计时间**: 2 小时
**依赖**: Task 3

**AI 提示词**:
```
你是一位资深的后端工程师，请帮我实现公司管理系统的认证模块。

ultrathink

## 任务目标
创建以下文件：
1. `server/src/types/dto/auth.dto.ts` - 认证相关 DTO
2. `server/src/services/auth.service.ts` - 认证业务逻辑
3. `server/src/controllers/auth.controller.ts` - 认证控制器
4. `server/src/routes/auth.routes.ts` - 认证路由
5. 更新 `server/src/routes/index.ts` - 注册认证路由

## API 设计
| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /api/auth/login | 用户登录 | 否 |
| POST | /api/auth/logout | 用户登出 | 是 |
| GET | /api/auth/me | 获取当前用户 | 是 |
| PUT | /api/auth/password | 修改密码 | 是 |

## Service 方法
```typescript
class AuthService {
  async login(username: string, password: string): Promise<{ user: User; token: string }>
  async getCurrentUser(userId: number): Promise<User>
  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void>
}
```

## 业务规则
- 登录失败返回统一错误消息，不暴露具体原因
- Token 有效期 7 天
- 修改密码需验证旧密码

## 参考文件
- `server/prisma/schema.prisma` - User 模型
- `server/src/utils/password.ts` - 密码工具
- `server/src/utils/jwt.ts` - JWT 工具
- `server/src/middlewares/auth.ts` - 认证中间件

## 测试数据
请创建一个默认管理员账号的种子脚本提示（用户名: admin，密码: admin123）

完成后：
1. 运行 `npm run build`
2. 部署到服务器测试登录接口
```

---

### Task 5: 用户管理模块 (Users)
**预计时间**: 2 小时
**依赖**: Task 4

**AI 提示词**:
```
你是一位资深的后端工程师，请帮我实现公司管理系统的用户管理模块。

ultrathink

## 任务目标
创建以下文件：
1. `server/src/types/dto/user.dto.ts` - 用户相关 DTO
2. `server/src/services/user.service.ts` - 用户业务逻辑
3. `server/src/controllers/user.controller.ts` - 用户控制器
4. `server/src/routes/user.routes.ts` - 用户路由
5. 更新 `server/src/routes/index.ts` - 注册用户路由

## API 设计
| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | /api/users | 用户列表（分页） | admin, manager |
| GET | /api/users/:id | 用户详情 | admin, manager |
| POST | /api/users | 创建用户 | admin |
| PUT | /api/users/:id | 更新用户 | admin |
| DELETE | /api/users/:id | 删除用户 | admin |
| PATCH | /api/users/:id/status | 启用/禁用 | admin |

## Service 方法
```typescript
class UserService {
  async findAll(params: { page?, pageSize?, role?, status?, keyword? }): Promise<PaginatedResult<User>>
  async findById(id: number): Promise<User | null>
  async create(data: CreateUserDto): Promise<User>
  async update(id: number, data: UpdateUserDto): Promise<User>
  async delete(id: number): Promise<void>
  async updateStatus(id: number, status: number): Promise<User>
}
```

## 业务规则
- 创建用户时密码加密存储
- 不能删除自己
- 不能禁用自己
- 列表查询支持按角色、状态、关键词筛选

## 参考文件
- `server/prisma/schema.prisma` - User 模型、UserRole 枚举
- `server/src/middlewares/rbac.ts` - 权限中间件
- `server/src/utils/pagination.ts` - 分页工具

完成后部署并测试所有用户管理接口。
```

---

### Task 6: 项目管理模块 (Projects)
**预计时间**: 2 小时
**依赖**: Task 4

**AI 提示词**:
```
你是一位资深的后端工程师，请帮我实现公司管理系统的项目管理模块。

ultrathink

## 任务目标
创建以下文件：
1. `server/src/types/dto/project.dto.ts` - 项目相关 DTO
2. `server/src/services/project.service.ts` - 项目业务逻辑
3. `server/src/controllers/project.controller.ts` - 项目控制器
4. `server/src/routes/project.routes.ts` - 项目路由
5. 更新 `server/src/routes/index.ts` - 注册项目路由

## API 设计
| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | /api/projects | 项目列表 | all |
| GET | /api/projects/:id | 项目详情 | member |
| POST | /api/projects | 创建项目 | admin, manager |
| PUT | /api/projects/:id | 更新项目 | admin, manager |
| DELETE | /api/projects/:id | 删除项目 | admin |
| POST | /api/projects/:id/members | 添加成员 | admin, manager |
| DELETE | /api/projects/:id/members/:userId | 移除成员 | admin, manager |
| GET | /api/projects/:id/indicators | 指标列表 | member |
| POST | /api/projects/:id/indicators | 创建指标 | admin, manager |
| PUT | /api/projects/:id/indicators/:indicatorId | 更新指标 | admin, manager, assignee |
| GET | /api/projects/:id/stages | 阶段列表 | member |
| POST | /api/projects/:id/stages | 创建阶段 | admin, manager |
| PUT | /api/projects/:id/stages/:stageId | 更新阶段 | admin, manager |

## 数据表
- Project - 项目主表
- ProjectMember - 项目成员
- ProjectStage - 项目阶段
- Indicator - 项目指标

## 业务规则
- 普通用户只能看到自己参与的项目
- 管理员可以看到所有项目
- 指标支持四象限优先级分类
- 项目状态：active, completed, paused

## 参考文件
- `server/prisma/schema.prisma` - 相关模型定义

完成后部署并测试项目管理接口。
```

---

## 阶段三：P1 数据采集模块

### Task 7: 账号管理模块 (Accounts)
**预计时间**: 1.5 小时
**依赖**: Task 6

**AI 提示词**:
```
你是一位资深的后端工程师，请帮我实现公司管理系统的账号管理模块。

## 任务目标
创建以下文件：
1. `server/src/types/dto/account.dto.ts`
2. `server/src/services/account.service.ts`
3. `server/src/controllers/account.controller.ts`
4. `server/src/routes/account.routes.ts`
5. 更新路由注册

## API 设计
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/accounts | 账号列表（支持按项目、平台筛选） |
| GET | /api/accounts/:id | 账号详情 |
| POST | /api/accounts | 创建账号 |
| PUT | /api/accounts/:id | 更新账号 |
| DELETE | /api/accounts/:id | 删除账号 |

## 数据表
- Account - 平台账号（抖音、快手、小红书、视频号）

## 参考
- Platform 枚举：douyin, kuaishou, xiaohongshu, shipinhao
- `server/prisma/schema.prisma` - Account 模型

完成后部署测试。
```

---

### Task 8: 流量数据模块 (Traffic)
**预计时间**: 2 小时
**依赖**: Task 7

**AI 提示词**:
```
你是一位资深的后端工程师，请帮我实现公司管理系统的流量数据模块。

ultrathink

## 任务目标
创建以下文件：
1. `server/src/types/dto/traffic.dto.ts`
2. `server/src/services/traffic.service.ts`
3. `server/src/controllers/traffic.controller.ts`
4. `server/src/routes/traffic.routes.ts`
5. `server/src/utils/excel.ts` - Excel 解析工具（使用 xlsx 库）
6. 更新路由注册

## API 设计
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/traffic | 流量数据列表 |
| GET | /api/traffic/dashboard | 流量看板（聚合统计） |
| GET | /api/traffic/trend | 流量趋势（按日/周/月） |
| POST | /api/traffic/import | 导入流量数据（Excel） |
| GET | /api/traffic/import-records | 导入记录列表 |
| GET | /api/traffic/export | 导出流量数据 |

## 数据表
- TrafficData - 流量数据
- ImportRecord - 导入记录

## Excel 导入字段映射
- 内容标题 → contentTitle
- 发布日期 → publishDate
- 播放量 → views
- 点赞数 → likes
- 评论数 → comments
- 转发数 → shares
- 收藏数 → saves
- 完播率 → completionRate

## 业务规则
- 导入时生成批次号
- 记录成功/失败行数
- 支持按账号、日期范围、平台筛选

完成后部署测试，特别测试 Excel 导入功能。
```

---

### Task 9: 线索管理模块 (Leads)
**预计时间**: 2 小时
**依赖**: Task 6

**AI 提示词**:
```
你是一位资深的后端工程师，请帮我实现公司管理系统的线索管理模块。

ultrathink

## 任务目标
创建以下文件：
1. `server/src/types/dto/lead.dto.ts`
2. `server/src/services/lead.service.ts`
3. `server/src/controllers/lead.controller.ts`
4. `server/src/routes/lead.routes.ts`
5. 更新路由注册

## API 设计
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/leads | 线索列表 |
| GET | /api/leads/:id | 线索详情 |
| POST | /api/leads | 创建线索 |
| PUT | /api/leads/:id | 更新线索 |
| DELETE | /api/leads/:id | 删除线索 |
| POST | /api/leads/:id/logs | 添加跟进记录 |
| GET | /api/leads/:id/logs | 获取跟进记录 |
| PATCH | /api/leads/:id/assign | 分配线索 |
| PATCH | /api/leads/:id/status | 更新状态 |
| POST | /api/leads/import | 批量导入 |
| GET | /api/leads/funnel | 漏斗统计 |

## 数据表
- Lead - 线索主表
- LeadLog - 跟进记录

## 枚举值
- SourcePlatform: douyin, kuaishou, xiaohongshu, shipinhao, wechat, other
- SourceType: private_message, to_wechat, first_sale, repeat_sale
- LeadStatus: pending, following, converted, lost, hold

## 漏斗统计逻辑
返回各状态的线索数量和转化率

完成后部署测试。
```

---

## 阶段四：P2 业务增强模块

### Task 10: 客户管理模块 (Customers)
**预计时间**: 2 小时
**依赖**: Task 9

**AI 提示词**:
```
你是一位资深的后端工程师，请帮我实现公司管理系统的客户管理模块。

ultrathink

## 任务目标
创建以下文件：
1. `server/src/types/dto/customer.dto.ts`
2. `server/src/services/customer.service.ts`
3. `server/src/controllers/customer.controller.ts`
4. `server/src/routes/customer.routes.ts`
5. 更新路由注册

## API 设计
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/customers | 客户列表 |
| GET | /api/customers/:id | 客户详情（含画像） |
| POST | /api/customers | 创建客户 |
| PUT | /api/customers/:id | 更新客户 |
| DELETE | /api/customers/:id | 删除客户 |
| POST | /api/customers/:id/follow-logs | 添加跟进 |
| GET | /api/customers/:id/follow-logs | 跟进记录 |
| POST | /api/customers/:id/tags | 添加标签 |
| DELETE | /api/customers/:id/tags/:tagId | 移除标签 |
| GET | /api/customer-tags | 标签列表 |
| POST | /api/customer-tags | 创建标签 |
| PUT | /api/customer-tags/:id | 更新标签 |
| DELETE | /api/customer-tags/:id | 删除标签 |

## 数据表
- Customer - 客户主表
- CustomerTag - 标签表
- CustomerTagRelation - 关联表
- CustomerFollowLog - 跟进记录

## 客户画像包含
- 基本信息
- 标签列表
- 累计成交金额、次数
- 最近跟进记录
- 订单历史概要

完成后部署测试。
```

---

### Task 11: 订单与回款模块 (Orders)
**预计时间**: 2 小时
**依赖**: Task 10

**AI 提示词**:
```
你是一位资深的后端工程师，请帮我实现公司管理系统的订单与回款模块。

ultrathink

## 任务目标
创建以下文件：
1. `server/src/types/dto/order.dto.ts`
2. `server/src/services/order.service.ts`
3. `server/src/controllers/order.controller.ts`
4. `server/src/routes/order.routes.ts`
5. 更新路由注册

## API 设计
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/orders | 订单列表 |
| GET | /api/orders/:id | 订单详情 |
| POST | /api/orders | 创建订单 |
| PUT | /api/orders/:id | 更新订单 |
| DELETE | /api/orders/:id | 删除订单 |
| PATCH | /api/orders/:id/status | 更新状态 |
| POST | /api/orders/:id/payments | 添加回款 |
| GET | /api/orders/:id/payments | 回款记录 |
| GET | /api/orders/statistics | 订单统计 |

## 数据表
- Order - 订单表
- Payment - 回款记录

## 业务规则
- 订单编号自动生成：ORD + 年月日 + 4位序号
- 添加回款时自动更新 paidAmount 和 paymentStatus
- 订单完成时自动更新客户的 totalAmount 和 orderCount
- 提成金额 = 订单金额 × 提成比例

## 统计接口返回
- 总订单数、总金额
- 已回款金额、待回款金额
- 回款率
- 按月/季度统计

完成后部署测试。
```

---

### Task 12: 财务模块 - 支出与预算 (Expenses & Budgets)
**预计时间**: 2 小时
**依赖**: Task 6

**AI 提示词**:
```
你是一位资深的后端工程师，请帮我实现公司管理系统的财务模块（支出与预算）。

ultrathink

## 任务目标
创建以下文件：
1. `server/src/types/dto/expense.dto.ts`
2. `server/src/types/dto/budget.dto.ts`
3. `server/src/services/expense.service.ts`
4. `server/src/services/budget.service.ts`
5. `server/src/controllers/expense.controller.ts`
6. `server/src/controllers/budget.controller.ts`
7. `server/src/routes/expense.routes.ts`
8. `server/src/routes/budget.routes.ts`
9. 更新路由注册

## 支出 API
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/expenses | 支出列表 |
| POST | /api/expenses | 申请支出 |
| PUT | /api/expenses/:id | 更新支出 |
| PATCH | /api/expenses/:id/approve | 审批支出 |
| GET | /api/expenses/statistics | 支出统计 |

## 预算 API
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/budgets | 预算列表 |
| POST | /api/budgets | 创建预算 |
| PUT | /api/budgets/:id | 更新预算 |
| GET | /api/budgets/:id/usage | 使用情况 |
| GET | /api/budgets/alerts | 预警列表 |

## 数据表
- Expense - 支出表
- Budget - 预算表

## 业务规则
- 支出审批流：pending → approved/rejected → paid
- 支出审批后自动更新关联预算的 usedAmount
- 预算使用率超过 alertRate 时加入预警列表
- 支出分类：ad_cost, platform_fee, labor_cost, equipment, office, travel, marketing, other

完成后部署测试。
```

---

### Task 13: 任务管理模块 (Tasks)
**预计时间**: 2 小时
**依赖**: Task 6

**AI 提示词**:
```
你是一位资深的后端工程师，请帮我实现公司管理系统的任务管理模块。

ultrathink

## 任务目标
创建以下文件：
1. `server/src/types/dto/task.dto.ts`
2. `server/src/services/task.service.ts`
3. `server/src/controllers/task.controller.ts`
4. `server/src/routes/task.routes.ts`
5. 更新路由注册

## API 设计
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/tasks | 任务列表 |
| GET | /api/tasks/my | 我的任务 |
| GET | /api/tasks/:id | 任务详情 |
| POST | /api/tasks | 创建任务 |
| PUT | /api/tasks/:id | 更新任务 |
| DELETE | /api/tasks/:id | 删除任务 |
| PATCH | /api/tasks/:id/status | 更新状态 |
| POST | /api/tasks/:id/comments | 添加评论 |
| GET | /api/tasks/:id/comments | 评论列表 |
| GET | /api/tasks/:id/subtasks | 子任务列表 |

## 数据表
- Task - 任务表（支持父子任务）
- TaskComment - 任务评论

## 业务规则
- 支持子任务（parentId）
- 任务状态：pending, in_progress, completed, cancelled
- 优先级：urgent, high, normal, low
- 完成任务时自动记录 completedAt

完成后部署测试。
```

---

### Task 14: 通知系统模块 (Notifications)
**预计时间**: 1.5 小时
**依赖**: Task 4

**AI 提示词**:
```
你是一位资深的后端工程师，请帮我实现公司管理系统的通知系统模块。

## 任务目标
创建以下文件：
1. `server/src/services/notification.service.ts`
2. `server/src/controllers/notification.controller.ts`
3. `server/src/routes/notification.routes.ts`
4. 更新路由注册

## API 设计
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/notifications | 通知列表 |
| GET | /api/notifications/unread-count | 未读数量 |
| PATCH | /api/notifications/:id/read | 标记已读 |
| PATCH | /api/notifications/read-all | 全部已读 |
| DELETE | /api/notifications/:id | 删除通知 |

## 数据表
- Notification

## Service 设计（供其他模块调用）
```typescript
class NotificationService {
  // 创建单个通知
  async create(userId: number, type: NotificationType, title: string, content: string, relatedType?: string, relatedId?: number): Promise<void>

  // 批量通知多个用户
  async notifyUsers(userIds: number[], type: NotificationType, title: string, content: string): Promise<void>

  // 按角色通知
  async notifyByRole(role: UserRole, type: NotificationType, title: string, content: string): Promise<void>
}
```

## 通知类型
system, task, lead, payment, report, warning, announcement

完成后部署测试。
```

---

## 阶段五：P3 高级功能模块

### Task 15: AI 分析模块
**预计时间**: 2 小时
**依赖**: Task 8, Task 9

**AI 提示词**:
```
你是一位资深的后端工程师，请帮我实现公司管理系统的 AI 分析模块。

ultrathink use context7

## 任务目标
创建以下文件：
1. `server/src/services/ai.service.ts`
2. `server/src/controllers/ai.controller.ts`
3. `server/src/routes/ai.routes.ts`
4. `server/src/utils/ai-client.ts` - AI API 客户端（预留接口）
5. 更新路由注册

## API 设计
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/ai/traffic-diagnosis | 流量诊断 |
| POST | /api/ai/content-suggestion | 内容建议 |
| POST | /api/ai/sales-advice | 销售建议 |
| POST | /api/ai/project-review | 项目复盘 |
| GET | /api/ai/analyses | 分析历史 |
| GET | /api/ai/analyses/:id | 分析详情 |

## 数据表
- AiAnalysis

## AI 分析类型
- traffic_diagnosis - 流量诊断
- content_suggestion - 内容建议
- sales_advice - 销售策略
- performance - 绩效分析
- project_review - 项目复盘
- leader_report - 领导汇报

## 实现说明
- 当前先实现模拟返回，预留 AI API 调用接口
- 保存每次分析请求和结果到数据库
- inputData 存储请求参数，result 存储分析结果

完成后部署测试。
```

---

### Task 16: 自动化规则模块 (Automation)
**预计时间**: 2 小时
**依赖**: Task 13, Task 14

**AI 提示词**:
```
你是一位资深的后端工程师，请帮我实现公司管理系统的自动化规则模块。

ultrathink

## 任务目标
创建以下文件：
1. `server/src/services/automation.service.ts`
2. `server/src/controllers/automation.controller.ts`
3. `server/src/routes/automation.routes.ts`
4. 更新路由注册

## API 设计
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/automations | 规则列表 |
| POST | /api/automations | 创建规则 |
| PUT | /api/automations/:id | 更新规则 |
| DELETE | /api/automations/:id | 删除规则 |
| PATCH | /api/automations/:id/toggle | 启用/禁用 |
| POST | /api/automations/:id/execute | 手动执行 |
| GET | /api/automations/:id/logs | 执行日志 |

## 数据表
- AutomationRule - 规则表
- AutomationLog - 执行日志

## 触发类型 (TriggerType)
- schedule - 定时触发（cron 表达式）
- event - 事件触发（如线索创建）
- condition - 条件触发（如预算超支）

## 动作类型 (ActionType)
- notification - 发送通知
- task_create - 创建任务
- task_assign - 分配任务
- report_generate - 生成报告
- data_sync - 数据同步
- alert - 告警

## 配置示例
```json
// 线索跟进提醒
{
  "triggerType": "condition",
  "triggerConfig": { "model": "lead", "condition": "3天未跟进" },
  "actionType": "notification",
  "actionConfig": { "template": "线索 {leadName} 已3天未跟进，请及时处理" }
}
```

完成后部署测试。
```

---

### Task 17: 内容排期模块 (Content Schedule)
**预计时间**: 1.5 小时
**依赖**: Task 7

**AI 提示词**:
```
你是一位资深的后端工程师，请帮我实现公司管理系统的内容排期模块。

## 任务目标
创建以下文件：
1. `server/src/services/content-schedule.service.ts`
2. `server/src/controllers/content-schedule.controller.ts`
3. `server/src/routes/content-schedule.routes.ts`
4. 更新路由注册

## API 设计
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/content-schedules | 排期列表 |
| GET | /api/content-schedules/calendar | 日历视图 |
| POST | /api/content-schedules | 创建排期 |
| PUT | /api/content-schedules/:id | 更新排期 |
| DELETE | /api/content-schedules/:id | 删除排期 |
| PATCH | /api/content-schedules/:id/status | 更新状态 |

## 数据表
- ContentSchedule

## 内容类型
video, image, article, live, short_video

## 状态流转
draft → scheduled → published / cancelled

## 日历视图返回格式
按日期分组返回该月所有排期

完成后部署测试。
```

---

### Task 18: 素材库模块 (Materials)
**预计时间**: 2 小时
**依赖**: Task 3

**AI 提示词**:
```
你是一位资深的后端工程师，请帮我实现公司管理系统的素材库模块。

ultrathink

## 任务目标
创建以下文件：
1. `server/src/services/material.service.ts`
2. `server/src/controllers/material.controller.ts`
3. `server/src/routes/material.routes.ts`
4. `server/src/middlewares/upload.ts` - 文件上传中间件（使用 multer）
5. 更新路由注册

## API 设计
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/materials | 素材列表 |
| GET | /api/materials/:id | 素材详情 |
| POST | /api/materials/upload | 上传素材 |
| PUT | /api/materials/:id | 更新信息 |
| DELETE | /api/materials/:id | 删除素材 |
| GET | /api/materials/categories | 分类列表 |

## 数据表
- Material

## 素材类型
video, image, audio, document, template

## 上传配置
- 存储目录：server/uploads/materials/
- 文件大小限制：100MB
- 支持的格式：
  - video: mp4, mov, avi
  - image: jpg, jpeg, png, gif, webp
  - audio: mp3, wav
  - document: pdf, doc, docx, xls, xlsx

## 业务规则
- 上传时自动生成缩略图（图片/视频）
- 自动识别文件大小和时长
- 使用时自动增加 usageCount

完成后部署测试上传功能。
```

---

### Task 19: 话术模板模块 (Scripts)
**预计时间**: 1.5 小时
**依赖**: Task 3

**AI 提示词**:
```
你是一位资深的后端工程师，请帮我实现公司管理系统的话术模板模块。

## 任务目标
创建以下文件：
1. `server/src/services/script.service.ts`
2. `server/src/controllers/script.controller.ts`
3. `server/src/routes/script.routes.ts`
4. 更新路由注册

## API 设计
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/scripts | 话术列表 |
| GET | /api/scripts/:id | 话术详情 |
| POST | /api/scripts | 创建话术 |
| PUT | /api/scripts/:id | 更新话术 |
| DELETE | /api/scripts/:id | 删除话术 |
| POST | /api/scripts/:id/use | 记录使用 |
| GET | /api/scripts/categories | 分类列表 |

## 数据表
- ScriptTemplate

## 话术分类
- 开场白
- 产品介绍
- 异议处理
- 成交话术
- 售后服务

## 业务规则
- 使用时自动增加 usageCount
- 支持按分类、场景、关键词搜索

完成后部署测试。
```

---

### Task 20: 官网管理模块 (Website)
**预计时间**: 1.5 小时
**依赖**: Task 3

**AI 提示词**:
```
你是一位资深的后端工程师，请帮我实现公司管理系统的官网管理模块。

## 任务目标
创建以下文件：
1. `server/src/services/website.service.ts`
2. `server/src/controllers/website.controller.ts`
3. `server/src/routes/website.routes.ts`
4. 更新路由注册

## API 设计
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/website/banners | Banner 列表 |
| POST | /api/website/banners | 创建 Banner |
| PUT | /api/website/banners/:id | 更新 Banner |
| DELETE | /api/website/banners/:id | 删除 Banner |
| PUT | /api/website/banners/sort | 排序 Banner |
| GET | /api/website/cases | 案例列表 |
| POST | /api/website/cases | 创建案例 |
| PUT | /api/website/cases/:id | 更新案例 |
| DELETE | /api/website/cases/:id | 删除案例 |
| GET | /api/website/info | 公司信息（键值对） |
| PUT | /api/website/info/:key | 更新信息 |

## 数据表
- WebsiteBanner
- WebsiteCase
- WebsiteInfo

## 公开接口（无需认证）
- GET /api/public/website/banners
- GET /api/public/website/cases
- GET /api/public/website/info

完成后部署测试。
```

---

## 阶段六：辅助功能模块

### Task 21: 报告模块 (Reports)
**预计时间**: 2 小时
**依赖**: Task 4

**AI 提示词**:
```
你是一位资深的后端工程师，请帮我实现公司管理系统的工作报告模块。

## 任务目标
创建以下文件：
1. `server/src/services/report.service.ts`
2. `server/src/controllers/report.controller.ts`
3. `server/src/routes/report.routes.ts`
4. 更新路由注册

## API 设计
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/reports/daily | 日报列表 |
| GET | /api/reports/daily/:id | 日报详情 |
| POST | /api/reports/daily | 提交日报 |
| PUT | /api/reports/daily/:id | 更新日报 |
| GET | /api/reports/weekly | 周报列表 |
| POST | /api/reports/weekly | 提交周报 |
| GET | /api/reports/monthly | 月报列表 |
| POST | /api/reports/monthly | 提交月报 |
| GET | /api/reports/team | 团队报告（管理员） |

## 数据表
- DailyReport
- WeeklyReport
- MonthlyReport

## 业务规则
- 每人每天只能提交一份日报
- 周报自动关联该周的日报
- 支持查看下属的报告

完成后部署测试。
```

---

### Task 22: 反馈与公告模块
**预计时间**: 1.5 小时
**依赖**: Task 4

**AI 提示词**:
```
你是一位资深的后端工程师，请帮我实现公司管理系统的反馈与公告模块。

## 任务目标
创建以下文件：
1. `server/src/services/feedback.service.ts`
2. `server/src/services/announcement.service.ts`
3. `server/src/controllers/feedback.controller.ts`
4. `server/src/controllers/announcement.controller.ts`
5. `server/src/routes/feedback.routes.ts`
6. `server/src/routes/announcement.routes.ts`
7. 更新路由注册

## 反馈 API
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/feedbacks | 反馈列表 |
| POST | /api/feedbacks | 提交反馈 |
| GET | /api/feedbacks/:id | 反馈详情 |
| PUT | /api/feedbacks/:id/reply | 回复反馈（管理员） |

## 公告 API
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/announcements | 公告列表 |
| POST | /api/announcements | 发布公告 |
| PUT | /api/announcements/:id | 更新公告 |
| DELETE | /api/announcements/:id | 删除公告 |

## 数据表
- Feedback
- Announcement
- Honor（荣誉墙）

完成后部署测试。
```

---

### Task 23: 工作台与统计模块 (Dashboard)
**预计时间**: 2 小时
**依赖**: 所有业务模块

**AI 提示词**:
```
你是一位资深的后端工程师，请帮我实现公司管理系统的工作台模块。

ultrathink

## 任务目标
创建以下文件：
1. `server/src/services/dashboard.service.ts`
2. `server/src/controllers/dashboard.controller.ts`
3. `server/src/routes/dashboard.routes.ts`
4. 更新路由注册

## API 设计
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/dashboard/overview | 数据总览 |
| GET | /api/dashboard/my-tasks | 我的待办 |
| GET | /api/dashboard/my-projects | 我的项目 |
| GET | /api/dashboard/my-leads | 我的线索 |
| GET | /api/dashboard/recent-activities | 最近动态 |
| GET | /api/dashboard/kpi | KPI 指标 |
| GET | /api/dashboard/notifications | 未读通知 |

## 数据总览返回
- 项目数量（进行中/已完成）
- 线索数量（待跟进/已转化）
- 本月收入/支出
- 回款率
- 任务完成率

## KPI 指标返回
- 获客成本 (CAC)
- 客单价 (ATV)
- ROI
- 人效

## 最近动态
聚合最近的：
- 新线索
- 新订单
- 任务更新
- 项目进度变化

完成后部署测试。
```

---

### Task 24: 数据库种子与初始化
**预计时间**: 1 小时
**依赖**: Task 4

**AI 提示词**:
```
你是一位资深的后端工程师，请帮我创建数据库种子脚本。

## 任务目标
创建以下文件：
1. `server/prisma/seed.ts` - 种子脚本
2. 更新 `server/package.json` - 添加 seed 命令

## 种子数据
1. 默认管理员账号
   - username: admin
   - password: admin123
   - name: 系统管理员
   - role: admin

2. 默认客户标签
   - 行业类：制造业、服务业、零售业、互联网
   - 需求类：价格敏感、品质优先、服务导向
   - 规模类：小微企业、中型企业、大型企业

3. 默认话术分类
   - 开场白
   - 产品介绍
   - 异议处理
   - 成交话术
   - 售后服务

4. 系统配置（WebsiteInfo）
   - company_name: 公司名称
   - contact_phone: 联系电话
   - contact_email: 联系邮箱
   - address: 公司地址

## package.json 更新
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

完成后运行 `npx prisma db seed` 测试。
```

---

## 验证清单

每个任务完成后，执行以下验证：

1. **编译检查**: `npm run build`
2. **部署到服务器**: `git add -A && git commit -m "feat: xxx" && git push`
3. **接口测试**: 使用 curl 或 Postman 测试所有新增接口
4. **日志检查**: `pm2 logs gongsiguanli-api --lines 50`

## 关键文件参考

- 数据库模型: `server/prisma/schema.prisma`
- 入口文件: `server/src/index.ts`
- 环境配置: `server/.env`
- 服务器: `39.104.13.41`
- 项目目录: `/root/projects/8888`
