# MathFlow Docker 管理脚本

.PHONY: help build up down restart logs ps clean dev prod backup restore health

# 默认目标
help:
	@echo "MathFlow Docker 管理命令:"
	@echo ""
	@echo "开发环境:"
	@echo "  make dev          - 启动开发环境"
	@echo "  make dev-logs     - 查看开发环境日志"
	@echo "  make dev-stop     - 停止开发环境"
	@echo ""
	@echo "生产环境:"
	@echo "  make prod         - 启动生产环境"
	@echo "  make prod-logs    - 查看生产环境日志"
	@echo "  make prod-stop    - 停止生产环境"
	@echo ""
	@echo "通用命令:"
	@echo "  make build        - 构建镜像"
	@echo "  make restart      - 重启服务"
	@echo "  make ps           - 查看服务状态"
	@echo "  make clean        - 清理环境"
	@echo "  make backup       - 备份数据"
	@echo "  make restore      - 恢复数据"
	@echo "  make health       - 检查服务健康"
	@echo ""

# 环境变量检查
check-env:
	@if [ ! -f .env ]; then \
		echo "⚠️  未找到 .env 文件，请创建并配置环境变量"; \
		echo "参考 docker/.env.example"; \
		exit 1; \
	fi

# 开发环境
dev: check-env
	@echo "🚀 启动开发环境..."
	docker compose -f docker-compose.yml -f docker-compose.override.yml up -d
	@echo "✅ 开发环境启动完成!"
	@echo "📱 访问地址:"
	@echo "   - 主应用: http://localhost:8080"
	@echo "   - pgAdmin: http://localhost:8080/pgadmin (admin@mathflow.local/admin)"
	@echo "   - Redis Commander: http://localhost:8080/redis"
	@echo "   - Portainer: http://localhost:8080/portainer"

dev-logs:
	docker compose -f docker-compose.yml -f docker-compose.override.yml logs -f

dev-stop:
	@echo "🛑 停止开发环境..."
	docker compose -f docker-compose.yml -f docker-compose.override.yml down

# 生产环境
prod: check-env
	@echo "🚀 启动生产环境..."
	docker compose -f docker-compose.yml up -d
	@echo "✅ 生产环境启动完成!"
	@echo "📱 访问地址:"
	@echo "   - 主应用: http://localhost"

prod-logs:
	docker compose -f docker-compose.yml logs -f

prod-stop:
	@echo "🛑 停止生产环境..."
	docker compose -f docker-compose.yml down

# 构建镜像
build:
	@echo "🔨 构建 Docker 镜像..."
	docker compose build --no-cache

# 重启服务
restart: 
	@echo "🔄 重启服务..."
	docker compose restart

# 查看服务状态
ps:
	docker compose ps

# 查看服务信息
info:
	@echo "📊 MathFlow 服务信息:"
	@echo ""
	@echo "🌐 网络信息:"
	@docker network ls | grep mathflow
	@echo ""
	@echo "💾 数据卷信息:"
	@docker volume ls | grep mathflow
	@echo ""
	@echo "📱 运行中的服务:"
	@docker compose ps

# 清理环境
clean:
	@echo "🧹 清理 Docker 环境..."
	@read -p "⚠️  这将删除所有数据，确认继续? [y/N]: " confirm && [ "$$confirm" = "y" ]
	docker compose down -v --remove-orphans
	docker system prune -f
	@echo "✅ 清理完成!"

# 深度清理
clean-all: clean
	@echo "🗑️  删除所有相关数据..."
	sudo rm -rf data/ ./docker/data/
	@echo "✅ 深度清理完成!"

# 备份数据
backup:
	@echo "💾 备份数据..."
	@mkdir -p backups/$(shell date +%Y%m%d_%H%M%S)
	@BACKUP_DIR=backups/$(shell date +%Y%m%d_%H%M%S)
	@docker run --rm -v mathflow-db-data:/data -v $(PWD)/$$BACKUP_DIR:/backup alpine tar czf /backup/postgres.tar.gz -C /data .
	@docker run --rm -v mathflow-uploads:/data -v $(PWD)/$$BACKUP_DIR:/backup alpine tar czf /backup/uploads.tar.gz -C /data .
	@docker run --rm -v mathflow-logs:/data -v $(PWD)/$$BACKUP_DIR:/backup alpine tar czf /backup/logs.tar.gz -C /data .
	@echo "✅ 备份完成: $$BACKUP_DIR"

# 恢复数据
restore:
	@echo "📂 列出可用备份:"
	@ls -la backups/
	@read -p "输入备份目录名: " BACKUP_DIR && \
	if [ -d "backups/$$BACKUP_DIR" ]; then \
		echo "🔄 恢复数据从 $$BACKUP_DIR..."; \
		docker run --rm -v mathflow-db-data:/data -v $(PWD)/backups/$$BACKUP_DIR:/backup alpine tar xzf /backup/postgres.tar.gz -C /data; \
		docker run --rm -v mathflow-uploads:/data -v $(PWD)/backups/$$BACKUP_DIR:/backup alpine tar xzf /backup/uploads.tar.gz -C /data; \
		docker run --rm -v mathflow-logs:/data -v $(PWD)/backups/$$BACKUP_DIR:/backup alpine tar xzf /backup/logs.tar.gz -C /data; \
		echo "✅ 数据恢复完成!"; \
	else \
		echo "❌ 备份目录不存在!"; \
	fi

# 检查服务健康
health:
	@echo "🏥 检查服务健康状态..."
	@echo ""
	@echo "📊 数据库连接:"
	@docker compose exec -T postgres pg_isready -U mathflow || echo "❌ 数据库连接失败"
	@echo ""
	@echo "🔴 Redis 连接:"
	@docker compose exec -T redis redis-cli ping || echo "❌ Redis 连接失败"
	@echo ""
	@echo "🌐 Nginx 状态:"
	@curl -s http://localhost/health || echo "❌ Nginx 连接失败"
	@echo ""
	@echo "📱 Docker Compose 服务状态:"
	@docker compose ps

# 数据库管理
db-shell:
	@echo "🐘 连接数据库 shell..."
	docker compose exec postgres psql -U mathflow -d mathflow

db-backup:
	@echo "💾 备份数据库..."
	docker compose exec postgres pg_dump -U mathflow mathflow > backups/db_$(shell date +%Y%m%d_%H%M%S).sql

db-restore:
	@echo "📂 恢复数据库..."
	@read -p "输入备份文件名: " BACKUP_FILE && \
	docker compose exec -T postgres psql -U mathflow -d mathflow < $$BACKUP_FILE

# 日志管理
logs:
	docker compose logs -f

logs-nginx:
	docker compose logs -f nginx

logs-app:
	docker compose logs -f app

logs-db:
	docker compose logs -f postgres

logs-redis:
	docker compose logs -f redis

# 更新服务
update:
	@echo "🔄 更新服务..."
	docker compose pull
	docker compose up -d
	@echo "✅ 服务更新完成!"

# 开发工具
dev-tools:
	@echo "🛠️  启动开发工具..."
	@echo "pgAdmin: http://localhost:8080/pgadmin"
	@echo "Redis Commander: http://localhost:8080/redis"
	@echo "Portainer: http://localhost:8080/portainer"

# 性能监控
stats:
	docker stats

# 进入容器
shell-app:
	docker compose exec app sh

shell-db:
	docker compose exec postgres sh

shell-nginx:
	docker compose exec nginx sh

# 安装依赖 (开发环境)
install:
	@echo "📦 安装依赖..."
	docker compose -f docker-compose.yml -f docker-compose.override.yml exec app npm install

# 初始化数据库
init-db:
	@echo "🗄️  初始化数据库..."
	docker compose -f docker-compose.yml -f docker-compose.override.yml exec postgres psql -U mathflow -d mathflow -f /docker-entrypoint-initdb.d/01-init-database.sh
