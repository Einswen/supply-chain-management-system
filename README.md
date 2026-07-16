# Supply Chain Management System

供应链管理系统当前版本包含两个子项目：

- `frontend`：Next.js + Material UI，实现注册、登录、登录后导航框架。
- `backend`：NestJS + TypeORM + PostgreSQL + pgvector，实现 `user` 表和认证 API。

详细说明见：

```txt
PROJECT_DOCUMENTATION.md
```

## 本地启动

安装前后端依赖：

```bash
cd frontend
npm install

cd ../backend
npm install
```

启动 PostgreSQL + pgvector：

```bash
docker compose up -d postgres
```

启动后端，默认端口 `3001`：

```bash
cd backend
npm run start:dev
```

启动前端，默认端口 `3000`：

```bash
cd frontend
npm run dev
```

前端默认请求后端地址：

```txt
http://localhost:3001
```

如需修改，可以配置：

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## API

- `POST /users/signup`
- `POST /users/login`

数据库使用 `docker-compose.yml` 中的 `pgvector/pgvector:pg16` 镜像。
`vector` extension 会自动创建，`user` 表由 TypeORM 在后端启动时同步。
