#!/bin/bash
# ===========================================
# 验证初始化脚本 (最后执行)
# 确保所有必需的对象都已创建
# ===========================================

set -e

DB_NAME="${POSTGRES_DB:-postgres}"

echo "=== [20] 验证数据库初始化 ==="

psql -v ON_ERROR_STOP=1 --username "postgres" --dbname "$DB_NAME" <<-EOSQL

    -- 检查 auth schema 是否存在
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
            RAISE EXCEPTION 'auth schema not found!';
        END IF;
        RAISE NOTICE 'auth schema exists';
    END
    \$\$;

    -- 检查 auth.users 表是否存在
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
            RAISE NOTICE 'auth.users table not found (will be created by GoTrue migration)';
        ELSE
            RAISE NOTICE 'auth.users table exists';
        END IF;
    END
    \$\$;

    -- 检查必需的函数
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'uid' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')) THEN
            RAISE EXCEPTION 'auth.uid() function not found!';
        END IF;
        RAISE NOTICE 'auth.uid() function exists';
    END
    \$\$;

    -- 检查 supabase_auth_admin 角色
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
            RAISE EXCEPTION 'supabase_auth_admin role not found!';
        END IF;
        RAISE NOTICE 'supabase_auth_admin role exists';
    END
    \$\$;

EOSQL

echo "=== [20] 数据库验证完成 ==="
