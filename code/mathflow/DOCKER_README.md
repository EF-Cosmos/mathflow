---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 3045022100a6a25be798bd62f2413579a368d9a36e467c97dc74e91b99103979aefc9aae9c022068748776480dbd8c28758568fce874b26b034157973636a2e3627c77e23e5484
    ReservedCode2: 30450220722ad01fff891e2f71961916625e515b79a540e29905d94f7f786e55596e950b022100a08319b444f3a64cfa8d28ad1699766f5299bb12413cdf1d5a83c2c12ba38e98
---

# MathFlow前端Docker配置

本目录包含了为MathFlow React前端应用优化的Docker配置文件。

## 📁 文件说明

- `Dockerfile` - 多阶段构建的Dockerfile
- `nginx.conf` - Nginx主配置文件
- `spa.conf` - SPA路由配置
- `.dockerignore` - Docker构建忽略文件
- `docker-build.sh` - 构建脚本

## 🚀 快速开始

### 1. 构建镜像

```bash
# 基本构建
docker build -t mathflow-frontend .

# 或使用构建脚本
./docker-build.sh

# 自定义标签
docker build -t mathflow-frontend:v1.0.0 .
```

### 2. 运行容器

```bash
# 运行容器
docker run -d -p 80:80 --name mathflow-app mathflow-frontend

# 查看运行状态
docker ps

# 查看日志
docker logs -f mathflow-app

# 停止容器
docker stop mathflow-app

# 删除容器
docker rm mathflow-app
```

### 3. 使用Docker Compose

在项目根目录更新`docker-compose.yml`中的app服务：

```yaml
app:
  build:
    context: ./code/mathflow
    dockerfile: Dockerfile
  container_name: mathflow-app
  ports:
    - "3000:80"
  networks:
    - mathflow-network
  depends_on:
    postgres:
      condition: service_healthy
    redis:
      condition: service_healthy
  restart: unless-stopped
  environment:
    - NODE_ENV=production
  volumes:
    - mathflow-uploads:/app/uploads
```

然后运行：

```bash
docker-compose up -d --build
```

## 🏗️ 构建优化特性

### 多阶段构建
- **构建阶段**: 使用`node:18-alpine`安装依赖和构建应用
- **运行时阶段**: 使用`nginx:alpine`提供静态文件服务

### 性能优化
- 利用Docker层缓存优化构建速度
- 最小化镜像大小
- Gzip压缩静态资源
- 长期缓存静态资源

### 安全特性
- 非root用户运行
- 安全HTTP头设置
- 最小权限原则

### SPA支持
- 支持React Router等SPA框架
- 所有路由回退到`index.html`
- 健康检查端点

## 🔧 配置说明

### Nginx配置
- 静态资源缓存策略
- Gzip压缩
- 安全头设置
- API代理配置

### 环境变量
支持以下环境变量：
- `NODE_ENV=production` (自动设置)

### 端口
- 容器内: 80
- 主机映射: 80 (默认)

## 📊 镜像信息

- **基础镜像**: node:18-alpine → nginx:alpine
- **镜像大小**: 约50-80MB (优化后)
- **启动时间**: < 5秒
- **健康检查**: HTTP /health 端点

## 🐛 故障排除

### 构建失败
1. 检查Node.js版本兼容性
2. 确认package.json和pnpm-lock.yaml一致
3. 清理Docker缓存: `docker system prune -a`

### 运行时问题
1. 检查容器日志: `docker logs mathflow-app`
2. 确认端口未被占用: `lsof -i :80`
3. 检查网络连接: `docker network ls`

### 性能问题
1. 监控资源使用: `docker stats`
2. 检查Nginx访问日志: `docker exec mathflow-app tail -f /var/log/nginx/access.log`

## 📝 开发模式

对于开发环境，建议使用Vite的开发服务器：

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 🔗 相关链接

- [Docker官方文档](https://docs.docker.com/)
- [Nginx配置指南](https://nginx.org/en/docs/)
- [React部署指南](https://create-react-app.dev/docs/deployment/)