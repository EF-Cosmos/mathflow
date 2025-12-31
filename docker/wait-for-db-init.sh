#!/bin/sh
# ===========================================
# GoTrue 启动前等待脚本
# 等待数据库初始化完成
# ===========================================

set -e

# 如果没有设置 DB_HOST，尝试从 GOTRUE_DB_DATABASE_URL 提取
if [ -z "$DB_HOST" ] && [ -n "$GOTRUE_DB_DATABASE_URL" ]; then
    DB_HOST="${GOTRUE_DB_DATABASE_URL##*@}" # 从连接字符串提取主机
    DB_HOST="${DB_HOST%%/*}"  # 去掉端口和数据库名
fi

# 默认值
DB_HOST="${DB_HOST:-database}"
DB_USER="${DB_USER:-supabase_auth_admin}"
DB_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
DB_NAME="${POSTGRES_DB:-postgres}"

echo "等待数据库初始化完成..."
echo "数据库主机: $DB_HOST"


# 最多尝试 30 次，每次间隔 2 秒
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))
    echo "[尝试 $ATTEMPT/$MAX_ATTEMPTS] 检查数据库连接..."
    
    if pg_isready -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" 2>/dev/null; then
        echo "✓ 数据库可访问"
        
        # 检查 auth schema 是否存在
        if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth'" 2>/dev/null | grep -q "1 row"; then
            echo "✓ auth schema 存在"
            
            # 检查必需的函数
            if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1 FROM pg_proc WHERE proname = 'uid' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')" 2>/dev/null | grep -q "1 row"; then
                echo "✓ auth.uid() 函数存在"
                echo "✓ 数据库初始化完成，启动 GoTrue..."
                exit 0
            fi
        fi
    fi
    
    if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
        echo "  等待 2 秒后重试..."
        sleep 2
    fi
done

echo "✗ 数据库初始化超时 (30 次尝试后)"
echo "请检查:"
echo "  1. PostgreSQL 是否运行"
echo "  2. 初始化脚本是否成功执行"
echo "  3. supabase_auth_admin 用户是否创建"
exit 1
