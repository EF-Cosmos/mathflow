#!/bin/bash
# ===========================================
# 重置并重新测试 Docker Compose 配置
# ===========================================

set -e

echo "=== 停止所有 Docker 容器 ==="
docker-compose down -v 2>/dev/null || true

echo ""
echo "=== 移除旧的数据卷 ==="
docker volume prune -f || true

echo ""
echo "=== 启动 Docker Compose ==="
docker-compose up -d

echo ""
echo "=== 等待初始化... (30 秒) ==="
sleep 30

echo ""
echo "=== 检查服务状态 ==="
docker-compose ps

echo ""
echo "=== 检查 db-init-check 日志 ==="
docker-compose logs db-init-check

echo ""
echo "=== 检查 auth 服务日志 ==="
docker-compose logs auth | tail -50

echo ""
echo "=== 检查数据库初始化 ==="
docker-compose exec -T database psql -U postgres -d postgres -c "\dn;" | grep auth || echo "auth schema 未找到"

echo ""
echo "完成！"
