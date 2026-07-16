# 供应链管理系统项目文档

本文档记录当前版本的技术栈、目录结构、实现逻辑、API、数据库结构、启动关闭方式和后续维护规则。后续每次新增模块、改动接口或调整数据库结构，都应该同步更新本文档。

## 1. 当前版本概览

项目名称：Supply Chain Management System

当前阶段：认证基础版

当前已实现内容：

- 前端 Next.js 项目目录：`frontend`
- 后端 NestJS 项目目录：`backend`
- PostgreSQL + pgvector 数据库服务
- 用户注册 API
- 用户登录 API
- 前端登录页面
- 前端注册页面，包含再次输入密码
- 登录后进入 Dashboard
- 登录后的左侧导航栏，可折叠、可展开
- 右上角头像菜单，包含默认用户名 `user` 和退出登录操作
- 导航入口：Dashboard、Company、Order、User
- 登录页背景使用 React Bits 的 ColorBends 效果

当前还未实现内容：

- Company 业务数据表和 CRUD API
- Order 业务数据表和 CRUD API
- User 管理页的真实用户列表
- 角色权限
- JWT 正式签发和校验
- 后端鉴权守卫
- 生产环境部署配置

## 2. 技术栈

### 2.1 前端

前端目录：`frontend`

框架和主要依赖：

| 技术 | 当前安装版本 | 用途 |
| --- | --- | --- |
| Next.js | 16.2.10 | 前端应用框架，使用 App Router |
| React | 19.2.7 | UI 组件开发 |
| React DOM | 19.2.7 | React 浏览器渲染 |
| TypeScript | 6.0.3 | 类型约束 |
| Material UI | 9.2.0 | 页面组件、表单、导航、菜单、布局 |
| MUI Icons | 9.2.0 | 导航和操作图标 |
| Emotion React | 11.14.0 | MUI 样式引擎 |
| Three.js | 0.180.0 | ColorBends 背景效果依赖 |

说明：

- 项目要求优先使用 Material UI 组件。
- 目前登录、注册、导航栏、菜单、卡片、输入框、按钮等都使用 MUI 组件实现。
- `package.json` 中部分依赖写的是 `latest`，上表是当前 `package-lock.json` 中实际安装版本。

### 2.2 后端

后端目录：`backend`

框架和主要依赖：

| 技术 | 当前安装版本 | 用途 |
| --- | --- | --- |
| NestJS Core | 11.1.28 | 后端应用框架 |
| NestJS Common | 11.1.28 | Controller、Provider、异常等基础能力 |
| NestJS TypeORM | 11.0.3 | NestJS 与 TypeORM 集成 |
| TypeORM | 1.1.0 | 数据库实体和 Repository 操作 |
| pg | 8.22.0 | PostgreSQL Node.js 驱动 |
| bcryptjs | 3.0.3 | 密码哈希 |
| class-validator | 0.15.1 | DTO 参数校验 |
| class-transformer | 0.5.1 | DTO 转换 |
| TypeScript | 5.9.3 | 类型约束 |

### 2.3 数据库

数据库方案：PostgreSQL + pgvector

Docker 镜像：

```yaml
pgvector/pgvector:pg16
```

当前数据库服务信息：

| 项 | 值 |
| --- | --- |
| 容器名 | `admin-auth-postgres` |
| 数据库 | `admin_auth` |
| 用户名 | `admin` |
| 密码 | `admin_password` |
| 容器内部端口 | `5432` |
| 本机映射端口 | `5433` |
| 连接主机 | `127.0.0.1` |

后端默认连接地址：

```txt
postgresql://admin:admin_password@127.0.0.1:5433/admin_auth
```

## 3. 项目目录结构

```txt
.
├── PROJECT_DOCUMENTATION.md
├── docker-compose.yml
├── backend
│   ├── .env.example
│   ├── database
│   │   └── init-pgvector.sql
│   ├── package.json
│   └── src
│       ├── app.module.ts
│       ├── main.ts
│       ├── database
│       │   └── pgvector.provider.ts
│       └── users
│           ├── dto
│           │   └── auth.dto.ts
│           ├── entities
│           │   └── user.entity.ts
│           ├── users.controller.ts
│           ├── users.module.ts
│           └── users.service.ts
└── frontend
    ├── components.json
    ├── package.json
    └── src
        ├── app
        │   ├── company
        │   │   └── page.tsx
        │   ├── dashboard
        │   │   └── page.tsx
        │   ├── login
        │   │   └── page.tsx
        │   ├── order
        │   │   └── page.tsx
        │   ├── signup
        │   │   └── page.tsx
        │   ├── user
        │   │   └── page.tsx
        │   ├── globals.css
        │   ├── layout.tsx
        │   ├── page.tsx
        │   └── theme-provider.tsx
        ├── components
        │   ├── AuthForm.tsx
        │   ├── ColorBends.css
        │   ├── ColorBends.jsx
        │   ├── ColorBendsClient.tsx
        │   ├── NavigationBar.tsx
        │   └── PageShell.tsx
        ├── lib
        │   ├── api.ts
        │   └── validation.ts
        └── types
            └── jsx-modules.d.ts
```

## 4. 前端实现逻辑

### 4.1 路由结构

| 路由 | 页面文件 | 当前功能 |
| --- | --- | --- |
| `/` | `frontend/src/app/page.tsx` | 自动跳转到 `/login` |
| `/login` | `frontend/src/app/login/page.tsx` | 登录页面 |
| `/signup` | `frontend/src/app/signup/page.tsx` | 注册页面 |
| `/dashboard` | `frontend/src/app/dashboard/page.tsx` | 登录后默认页面 |
| `/company` | `frontend/src/app/company/page.tsx` | Company 占位页 |
| `/order` | `frontend/src/app/order/page.tsx` | Order 占位页 |
| `/user` | `frontend/src/app/user/page.tsx` | User 占位页 |

### 4.2 登录和注册表单

核心组件：

```txt
frontend/src/components/AuthForm.tsx
```

该组件根据 `mode` 参数切换登录和注册：

```tsx
<AuthForm mode="login" />
<AuthForm mode="signup" />
```

登录模式字段：

- Email
- Password

注册模式字段：

- Email
- Password
- Confirm password

前端校验文件：

```txt
frontend/src/lib/validation.ts
```

当前校验规则：

- 邮箱不能为空
- 邮箱必须符合基础邮箱格式
- 密码不能为空
- 密码至少 8 位
- 密码必须包含字母和数字
- 密码只允许使用支持字符：英文字母、数字、`@$!%*?&._#-`
- 注册时确认密码不能为空
- 注册时确认密码必须和密码一致

### 4.3 API 调用

前端 API 封装文件：

```txt
frontend/src/lib/api.ts
```

默认后端地址：

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3001";
```

当前封装函数：

```ts
signUp(email, password, confirmPassword)
login(email, password)
```

登录成功后前端会写入：

```txt
localStorage.auth.user
localStorage.auth.token
```

当前 token 是后端返回的 UUID 临时 token，不是正式 JWT。后续实现正式鉴权时，需要替换为 JWT。

### 4.4 登录页背景

背景组件：

```txt
frontend/src/components/ColorBendsClient.tsx
frontend/src/components/ColorBends.jsx
frontend/src/components/ColorBends.css
```

来源：React Bits / shadcn registry 的 ColorBends 组件。

登录页和注册页使用同一个 `AuthForm`，背景铺满整屏，表单窗口居中显示。

### 4.5 登录后页面框架

页面壳组件：

```txt
frontend/src/components/PageShell.tsx
```

导航组件：

```txt
frontend/src/components/NavigationBar.tsx
```

当前布局：

- 左侧 MUI Drawer 作为主导航栏
- 桌面端可以折叠和展开
- 移动端使用临时 Drawer
- 顶部 AppBar 保留搜索入口、通知图标、头像菜单
- 头像菜单放在右上角，点击后显示用户信息和退出登录

当前导航项：

| Label | 路由 |
| --- | --- |
| Dashboard | `/dashboard` |
| Company | `/company` |
| Order | `/order` |
| User | `/user` |

当前品牌名：

```txt
Supply Chain Management System
```

当前默认用户显示：

```txt
user
```

退出登录逻辑：

1. 删除 `localStorage.auth.user`
2. 删除 `localStorage.auth.token`
3. 跳转到 `/login`

## 5. 后端实现逻辑

### 5.1 应用入口

入口文件：

```txt
backend/src/main.ts
```

主要逻辑：

- 创建 NestJS 应用
- 开启 CORS
- 默认允许前端来源：
  - `http://localhost:3000`
  - `http://127.0.0.1:3000`
- 注册全局 `ValidationPipe`
- 自动过滤 DTO 中未声明字段
- DTO 校验失败时返回统一的 `VALIDATION_ERROR`
- 默认监听 `127.0.0.1:3001`

### 5.2 数据库连接

连接配置文件：

```txt
backend/src/app.module.ts
```

默认配置：

```ts
host: process.env.POSTGRES_HOST ?? "127.0.0.1"
port: Number(process.env.POSTGRES_PORT ?? 5433)
username: process.env.POSTGRES_USER ?? "admin"
password: process.env.POSTGRES_PASSWORD ?? "admin_password"
database: process.env.POSTGRES_DB ?? "admin_auth"
```

当前开启：

```ts
synchronize: true
```

这表示 TypeORM 会根据 Entity 自动同步数据表结构，适合当前开发阶段。生产环境不建议直接使用，需要改成 migrations。

### 5.3 pgvector 初始化

Docker 初始化 SQL：

```txt
backend/database/init-pgvector.sql
```

内容：

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

NestJS Provider：

```txt
backend/src/database/pgvector.provider.ts
```

作用：

- 后端启动时确认 PostgreSQL 已启用 `vector` extension。
- 目前还没有业务表使用向量字段。
- 后续如果需要供应链知识检索、商品/订单语义搜索、文档 embedding，可以新增 `vector` 字段。

### 5.4 User 模块

模块目录：

```txt
backend/src/users
```

文件职责：

| 文件 | 职责 |
| --- | --- |
| `users.module.ts` | 注册 User 模块和 User Repository |
| `users.controller.ts` | 暴露注册和登录 API |
| `users.service.ts` | 实现注册、登录、密码哈希、错误状态 |
| `dto/auth.dto.ts` | 定义登录和注册请求参数校验 |
| `entities/user.entity.ts` | 定义数据库 `user` 表 |

## 6. API 说明

### 6.1 注册

接口：

```txt
POST /users/signup
```

请求体：

```json
{
  "email": "user@example.com",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

成功响应：

```json
{
  "status": "REGISTER_SUCCESS",
  "message": "Registration succeeded. You can now log in.",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "createdAt": "2026-07-16T00:00:00.000Z"
  }
}
```

可能的失败状态：

| HTTP 状态码 | status | 含义 |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | 参数为空、邮箱格式错误、密码格式错误、确认密码不一致 |
| 409 | `EMAIL_ALREADY_EXISTS` | 邮箱已注册 |

测试命令：

```bash
curl -s -X POST http://127.0.0.1:3001/users/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123","confirmPassword":"Password123"}'
```

### 6.2 登录

接口：

```txt
POST /users/login
```

请求体：

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

成功响应：

```json
{
  "status": "LOGIN_SUCCESS",
  "message": "Login succeeded.",
  "token": "uuid-token-placeholder",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "createdAt": "2026-07-16T00:00:00.000Z"
  }
}
```

可能的失败状态：

| HTTP 状态码 | status | 含义 |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | 参数为空、邮箱格式错误、密码格式错误 |
| 404 | `USER_NOT_FOUND` | 邮箱不存在 |
| 401 | `INVALID_PASSWORD` | 密码错误 |

测试命令：

```bash
curl -s -X POST http://127.0.0.1:3001/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}'
```

## 7. 数据库结构

### 7.1 当前数据表

当前只有一张业务表：

```txt
user
```

实体文件：

```txt
backend/src/users/entities/user.entity.ts
```

TypeORM Entity：

```ts
@Entity({ name: "user" })
@Unique(["email"])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  email: string;

  @Column({ name: "password_hash", type: "varchar", length: 255 })
  passwordHash: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
```

### 7.2 `user` 表结构

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| `id` | integer | primary key, auto increment | 用户 ID |
| `email` | varchar(255) | unique, not null | 用户邮箱 |
| `password_hash` | varchar(255) | not null | bcrypt 哈希后的密码 |
| `created_at` | timestamp | not null | 创建时间 |
| `updated_at` | timestamp | not null | 更新时间 |

### 7.3 数据关系

当前版本只有 `user` 表，因此还没有表之间的外键关系。

后续供应链模块建议关系：

```txt
user 1 --- n company.created_by
user 1 --- n order.created_by
company 1 --- n order
```

建议后续新增表：

| 表名 | 用途 | 可能关联 |
| --- | --- | --- |
| `company` | 供应商、客户、物流服务商等公司信息 | `created_by -> user.id` |
| `order` | 供应链订单 | `company_id -> company.id`，`created_by -> user.id` |
| `shipment` | 发货和运输记录 | `order_id -> order.id` |
| `inventory` | 库存记录 | `company_id -> company.id` |
| `audit_log` | 操作日志 | `user_id -> user.id` |

## 8. 数据库操作方式

### 8.1 启动数据库

在项目根目录执行：

```bash
docker compose up -d postgres
```

检查状态：

```bash
docker compose ps
```

查看日志：

```bash
docker compose logs -f postgres
```

### 8.2 停止数据库

停止容器但保留数据：

```bash
docker compose stop postgres
```

停止并移除容器但保留数据卷：

```bash
docker compose down
```

停止并删除数据卷：

```bash
docker compose down -v
```

注意：`docker compose down -v` 会删除数据库数据，只在明确需要重置数据库时使用。

### 8.3 连接数据库

通过 Docker 进入 psql：

```bash
docker exec -it admin-auth-postgres psql -U admin -d admin_auth
```

如果本机安装了 `psql`，也可以直接连接：

```bash
psql postgresql://admin:admin_password@127.0.0.1:5433/admin_auth
```

常用 SQL：

```sql
\dt
\d "user"
SELECT id, email, created_at, updated_at FROM "user";
```

## 9. 启动和关闭服务

### 9.1 安装依赖

前端：

```bash
cd frontend
npm install
```

后端：

```bash
cd backend
npm install
```

### 9.2 启动数据库

项目根目录：

```bash
docker compose up -d postgres
```

### 9.3 启动后端

```bash
cd backend
npm run start:dev
```

默认地址：

```txt
http://127.0.0.1:3001
```

健康检查可以用登录或注册接口测试。当前还没有专门的 `/health` 接口。

### 9.4 启动前端

```bash
cd frontend
npm run dev
```

默认地址：

```txt
http://localhost:3000
```

说明：

- 当前前端脚本使用 `next dev --webpack`。
- 这样做是为了避免当前中文路径下 Turbopack 的本地开发异常。

### 9.5 关闭服务

前端和后端：

- 在对应终端按 `Ctrl+C`

数据库：

```bash
docker compose stop postgres
```

## 10. 环境变量

后端示例文件：

```txt
backend/.env.example
```

当前内容：

```env
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5433
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin_password
POSTGRES_DB=admin_auth
FRONTEND_ORIGIN=http://localhost:3000,http://127.0.0.1:3000
PORT=3001
```

前端可选环境变量：

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:3001
```

如果不配置，前端默认请求：

```txt
http://127.0.0.1:3001
```

## 11. 当前认证流程

### 11.1 注册流程

1. 用户打开 `/signup`
2. 输入邮箱、密码、确认密码
3. 前端先执行格式校验
4. 校验通过后请求 `POST /users/signup`
5. 后端 DTO 再执行一次校验
6. 后端检查两次密码是否一致
7. 后端把邮箱转为小写并去掉首尾空格
8. 后端查询 `user` 表是否已有该邮箱
9. 如果邮箱不存在，使用 bcrypt 生成密码哈希
10. 写入 `user` 表
11. 返回 `REGISTER_SUCCESS`
12. 前端显示注册成功提示

### 11.2 登录流程

1. 用户打开 `/login`
2. 输入邮箱和密码
3. 前端先执行格式校验
4. 校验通过后请求 `POST /users/login`
5. 后端 DTO 再执行一次校验
6. 后端把邮箱转为小写并去掉首尾空格
7. 后端查询 `user` 表
8. 如果邮箱不存在，返回 `USER_NOT_FOUND`
9. 如果邮箱存在，用 bcrypt 对比密码和 `password_hash`
10. 密码错误返回 `INVALID_PASSWORD`
11. 密码正确返回 `LOGIN_SUCCESS`
12. 前端写入 `localStorage.auth.user` 和 `localStorage.auth.token`
13. 前端跳转到 `/dashboard`

### 11.3 退出登录流程

1. 用户点击右上角头像
2. 在菜单中点击 `Log out`
3. 前端删除本地登录信息
4. 前端跳转到 `/login`

## 12. 安全说明

当前已实现：

- 密码不明文存储
- 密码使用 bcrypt hash
- 邮箱唯一
- 前后端都有基础输入校验
- 后端通过 DTO 阻止未声明字段
- CORS 限制到本地前端来源

当前不足：

- 还没有正式 JWT
- 还没有 refresh token
- 还没有后端路由鉴权守卫
- 登录后的页面目前没有强制校验 token
- token 当前是 UUID 占位值
- 没有密码重置流程
- 没有账号锁定和登录频率限制
- 没有角色权限

后续建议：

- 引入 `@nestjs/jwt`
- 引入 `Passport` 或 NestJS Guard
- 登录成功返回正式 JWT
- 前端请求受保护 API 时带上 `Authorization: Bearer <token>`
- 后端为 Dashboard、Company、Order、User API 增加鉴权
- 新增 `role` 字段或单独的角色表

## 13. 后续更新规则

每次后续开发需要同步更新以下内容：

- 新增依赖时，更新“技术栈”章节
- 新增页面时，更新“前端实现逻辑”和“项目目录结构”
- 新增 API 时，更新“API 说明”
- 新增数据表或字段时，更新“数据库结构”
- 修改启动方式时，更新“启动和关闭服务”
- 修改认证逻辑时，更新“当前认证流程”和“安全说明”
- 修改环境变量时，更新“环境变量”

建议后续添加版本记录，例如：

```txt
v0.1.0 认证基础版
v0.2.0 Company 模块
v0.3.0 Order 模块
v0.4.0 正式 JWT 和权限
```

## 14. 当前版本记录

### v0.1.0 认证基础版

完成内容：

- 创建前端 Next.js 项目
- 创建后端 NestJS 项目
- 接入 PostgreSQL + pgvector
- 建立 `user` 表
- 完成注册 API
- 完成登录 API
- 完成前端登录页面
- 完成前端注册页面
- 完成登录后左侧导航栏
- 完成右上角头像菜单
- 默认用户名显示为 `user`
- 编写中文项目文档
