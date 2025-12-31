---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 3045022100c9ae8f5863f164c1160957dfad1c53abb8b568917376cdab5462f3e0c24b7ea1022058b78c71ee36d9e613c6120854ce23c85828657f8117ce76895f2231c3d29a96
    ReservedCode2: 3046022100f34667ae101ba92ac679622d2c888a1bb578d99487adc718d1ffe44ca18054b8022100b069900741d9291d02401dd9e2596be37235b43b39f9dc14c2499a2edf7dc626
---

# MathFlow Docker Compose 配置

完整的 Docker Compose 编排文件，用于部署 MathFlow 应用程序。

## 🚀 快速开始

### 1. 环境准备

确保已安装：
- Docker (版本 20.10+)
- Docker Compose (版本 2.0+)

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，配置实际的环境变量
vim .env
```

### 3. 启动服务

```bash
# 使用启动脚本 (推荐)
./docker-start.sh start

# 或直接使用 Docker Compose
docker-compose up -d
```

### 4. 访问服务

启动成功后，可以通过以下地址访问服务：

| 服务 | 地址 | 描述 |
|------|------|------|
| 前端应用 | http://localhost:3000 | React 应用 |
| 后端 API | http://localhost:3001 | API 服务 |
| 数据库 | localhost:5432 | PostgreSQL 数据库 |
| Redis | localhost:6379 | 缓存服务 |
| Supabase Studio | http://localhost:54323 | 数据库管理界面 |

## 📋 服务说明

### 前端服务 (frontend)
- **端口**: 3000
- **技术栈**: React + Vite + TypeScript
- **Dockerfile**: `./code/mathflow-new/Dockerfile`
- **功能**: 用户界面，展示数学推导功能

### 后端服务 (backend)
- **端口**: 3001
- **技术栈**: Node.js + Express
- **Dockerfile**: `./Dockerfile.backend`
- **功能**: API 服务，处理业务逻辑

### 数据库服务 (database)
- **端口**: 5432
- **镜像**: supabase/postgres:15.1.0.117
- **功能**: PostgreSQL 数据库，存储应用数据
- **数据持久化**: `postgres_data` 卷

### Redis 服务 (redis)
- **端口**: 6379
- **镜像**: redis:7-alpine
- **功能**: 缓存和会话存储
- **数据持久化**: `redis_data` 卷

### Supabase Studio (studio)
- **端口**: 54323
- **镜像**: supabase/supabase-studio
- **功能**: 数据库管理界面
- **访问**: http://localhost:54323

## 🔧 管理命令

### 服务管理

```bash
# 查看服务状态
./docker-start.sh status
docker-compose ps

# 查看服务日志
./docker-start.sh logs
docker-compose logs -f [service-name]

# 重启服务
./docker-start.sh restart
docker-compose restart [service-name]

# 停止服务
./docker-start.sh stop
docker-compose down

# 完全清理 (包括数据卷)
docker-compose down -v
```

### 容器操作

```bash
# 进入容器
docker-compose exec frontend sh
docker-compose exec backend sh
docker-compose exec database psql -U postgres

# 查看容器资源使用
docker stats

# 重构镜像
docker-compose build --no-cache
```

## 📁 目录结构

```
workspace/
├── docker-compose.yml          # Docker Compose 配置
├── .env.example               # 环境变量模板
├── docker-start.sh            # 启动脚本
├── Dockerfile.backend         # 后端 Dockerfile
├── code/
│   └── mathflow-new/
│       ├── Dockerfile         # 前端 Dockerfile
│       ├── nginx.conf         # Nginx 配置
│       └── ...                # 前端源码
└── supabase/
    ├── functions/             # Edge Functions
    ├── migrations/            # 数据库迁移
    └── tables/                # 表结构定义
```

## 🔒 安全配置

### 环境变量

在 `.env` 文件中配置以下关键变量：

```bash
# 数据库密码 (强密码)
POSTGRES_PASSWORD=your-super-secret-and-long-postgres-password

# Supabase 配置
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT 密钥 (至少 32 字符)
JWT_SECRET=your-jwt-secret-with-at-least-32-characters-long
```

### 网络安全

- 所有服务运行在自定义网络 `app-network` 中
- 只有必要的端口对外暴露
- 数据库和 Redis 不直接暴露到外网

## 🗄️ 数据持久化

### 数据卷

| 卷名 | 用途 | 路径 |
|------|------|------|
| `postgres_data` | PostgreSQL 数据 | `/var/lib/postgresql/data` |
| `redis_data` | Redis 数据 | `/data` |

### 备份数据

```bash
# 备份 PostgreSQL 数据
docker-compose exec database pg_dump -U postgres postgres > backup.sql

# 恢复 PostgreSQL 数据
docker-compose exec -T database psql -U postgres postgres < backup.sql
```

## 🚨 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 检查端口占用
   netstat -tulpn | grep :3000
   
   # 修改 docker-compose.yml 中的端口映射
   ```

2. **容器启动失败**
   ```bash
   # 查看详细错误日志
   docker-compose logs [service-name]
   ```

3. **数据库连接失败**
   ```bash
   # 检查数据库服务状态
   docker-compose exec database pg_isready
   
   # 检查网络连接
   docker network ls
   ```

4. **权限问题**
   ```bash
   # 检查文件权限
   ls -la docker-start.sh
   chmod +x docker-start.sh
   ```

### 性能优化

1. **资源限制**
   在 `docker-compose.yml` 中添加资源限制：
   ```yaml
   services:
     frontend:
       deploy:
         resources:
           limits:
             cpus: '0.5'
             memory: 512M
   ```

2. **缓存优化**
   - 使用 Docker 层缓存
   - 合理组织 Dockerfile 指令顺序

## 📝 更新日志

- **v1.0.0**: 初始版本，包含完整的服务栈配置
- 支持前端、后端、数据库、缓存、Supabase Studio
- 包含完整的环境变量配置
- 提供启动脚本和管理工具

## 🤝 贡献

如需修改配置或添加新服务，请：

1. 更新相应的 Dockerfile
2. 修改 `docker-compose.yml`
3. 更新环境变量模板
4. 更新文档

## 📞 支持

如果遇到问题，请检查：

1. Docker 和 Docker Compose 版本
2. 环境变量配置
3. 端口占用情况
4. 服务日志