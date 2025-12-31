---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 30450220319a4532c25e0a4acb6ef69b0942836608662e8d246422c3b8d7960aa430382a02210081aa823d2a08193cf88b73a79df6a97d084eb19f5a5b7e5c7e69977f0bc5ff9c
    ReservedCode2: 3046022100e81f0477cfdf6a82822408120cb39badca59c8206eab2e06f00f68c284d180c30221009b3d5dc0302f30ab16065039bdefcbc17c203958ffebe8dc57c27637a43106fc
---

# MathFlow Docker 网络和数据卷配置

本文档描述了 MathFlow 项目的 Docker 网络和数据卷详细配置。

## 📁 目录结构

```
docker/
├── docker-compose.yml              # 主配置文件
├── docker-compose.override.yml     # 开发环境覆盖配置
├── init-db/                        # 数据库初始化脚本
│   └── 01-init-database.sh
├── nginx/                          # Nginx 配置
│   ├── nginx.conf                  # 生产环境配置
│   ├── nginx-dev.conf              # 开发环境配置
│   └── conf.d/
│       └── default.conf            # 站点配置
└── dev/                           # 开发环境专用配置
    ├── postgres.conf              # PostgreSQL 开发配置
    └── redis.conf                 # Redis 开发配置
```

## 🌐 网络配置

### 主网络: mathflow-network
- **类型**: bridge
- **子网**: 172.20.0.0/16
- **网关**: 172.20.0.1
- **IP范围**: 172.20.1.0/24
- **桥接接口**: mathflow-br0
- **特性**: 
  - 支持容器间通信 (ICC)
  - 支持 IP 伪装
  - 支持外部访问
  - 可附加模式

### 网络访问规则

| 服务 | 内部端口 | 外部端口 | 用途 |
|------|----------|----------|------|
| postgres | 5432 | 5432 (生产) / 5433 (开发) | 数据库服务 |
| redis | 6379 | 6379 (生产) / 6380 (开发) | 缓存服务 |
| app | 3000 | - | 应用服务 |
| nginx | 80, 443 | 80 (生产) / 8080 (开发) | 反向代理 |

## 💾 数据卷配置

### 生产环境数据卷

| 卷名 | 用途 | 主机路径 | 备份策略 |
|------|------|----------|----------|
| `mathflow-db-data` | PostgreSQL 数据 | `./data/postgres` | 每日 02:00 |
| `mathflow-redis-data` | Redis 数据 | `./data/redis` | - |
| `mathflow-uploads` | 用户上传文件 | `./data/uploads` | 每日 03:00 |
| `mathflow-logs` | 应用日志 | `./data/logs` | 保留 30 天 |

### 开发环境数据卷

| 卷名 | 用途 | 主机路径 |
|------|------|----------|
| `mathflow-db-data-dev` | PostgreSQL 开发数据 | `./data/dev/postgres` |
| `mathflow-redis-data-dev` | Redis 开发数据 | `./data/dev/redis` |
| `mathflow-uploads-dev` | 开发环境上传文件 | `./data/dev/uploads` |
| `mathflow-logs-dev` | 开发环境日志 | `./data/dev/logs` |

## 🚀 使用方法

### 启动生产环境

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f [service_name]

# 停止服务
docker-compose down
```

### 启动开发环境

```bash
# 开发环境会自动加载 override 配置
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d

# 或者直接使用默认方式 (override 会自动加载)
docker-compose up -d

# 开发环境服务访问地址
- 主应用: http://localhost:8080
- pgAdmin: http://localhost:8080/pgadmin
- Redis Commander: http://localhost:8080/redis
- Portainer: http://localhost:8080/portainer
```

### 环境变量

创建 `.env` 文件设置环境变量：

```env
# 数据库配置
DB_PASSWORD=your_secure_password
REDIS_PASSWORD=your_redis_password

# 应用配置
NODE_ENV=production
JWT_SECRET=your_jwt_secret

# 第三方服务
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

## 🗄️ 数据库初始化

数据库初始化脚本会自动执行：

1. **创建扩展**: uuid-ossp, pgcrypto, pg_trgm, btree_gin, btree_gist
2. **创建类型**: user_role, derivation_status, difficulty_level, operation_type
3. **创建表**: profiles, math_templates, derivations, derivation_steps 等
4. **创建索引**: 优化查询性能
5. **创建触发器**: 自动更新时间戳
6. **插入示例数据**: 演示数据

## 🔧 Nginx 配置特性

### 生产环境特性
- **静态文件缓存**: 1年缓存期
- **Gzip压缩**: 减少传输大小
- **安全头**: XSS保护, 内容类型保护等
- **请求限制**: API 10r/s, 登录 5r/m
- **负载均衡**: 多后端支持

### 开发环境特性
- **详细日志**: 便于调试
- **热重载支持**: 支持 HMR
- **管理界面代理**: pgAdmin, Redis Commander, Portainer
- **宽松限制**: 更高的请求限制
- **无缓存**: 便于实时调试

## 📊 监控和日志

### 日志位置
- **Nginx**: `/var/log/nginx/`
- **PostgreSQL**: `./data/postgres/log/`
- **Redis**: Docker 容器日志
- **应用**: `./data/logs/`

### 健康检查
- **数据库**: `pg_isready` 检查
- **Redis**: `redis-cli ping` 检查
- **Nginx**: `/health` 端点

## 🔒 安全配置

### 网络安全
- 容器间通信隔离
- 外部访问控制
- 端口映射限制

### 应用安全
- 密码加密 (scram-sha-256)
- SSL/TLS 支持 (生产环境)
- 请求频率限制
- 安全头设置

## 🧪 测试命令

```bash
# 测试数据库连接
docker-compose exec postgres psql -U mathflow -d mathflow -c "SELECT version();"

# 测试Redis连接
docker-compose exec redis redis-cli ping

# 测试网络连通性
docker-compose exec app ping postgres
docker-compose exec app ping redis

# 检查服务健康状态
docker-compose ps
```

## 🚨 故障排除

### 常见问题

1. **端口冲突**: 修改 docker-compose.yml 中的端口映射
2. **权限问题**: 确保目录权限正确 (chmod 755)
3. **磁盘空间**: 定期清理日志和临时文件
4. **内存不足**: 调整容器内存限制

### 重置环境

```bash
# 完全重置 (删除所有数据)
docker-compose down -v
sudo rm -rf data/
docker-compose up -d

# 仅重置开发环境
docker-compose -f docker-compose.yml -f docker-compose.override.yml down -v
sudo rm -rf data/dev/
```

## 📝 更新和维护

- **定期备份**: 数据卷备份策略
- **更新镜像**: `docker-compose pull && docker-compose up -d`
- **日志轮转**: 自动日志管理
- **性能监控**: 内置监控工具

更多详细信息请参考各服务配置文件中的注释说明。