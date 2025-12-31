#!/bin/bash
# ===========================================
# Supabase 数据库初始化脚本 (必须首先执行)
# 创建所有必要的角色和 auth schema
# ===========================================

set -e

# 使用环境变量或默认值
DB_PASS="${POSTGRES_PASSWORD:-postgres}"
DB_NAME="${POSTGRES_DB:-postgres}"

echo "=== [00] 初始化 Supabase 基础架构 ==="

# 使用 postgres 超级用户执行
psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER:-postgres}" --dbname "$DB_NAME" <<-EOSQL
    -- =========================================
    -- 1. 创建 Supabase 必需的角色
    -- =========================================
    DO \$\$
    BEGIN
        -- anon 角色 (匿名访问, PostgREST 使用)
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
            CREATE ROLE anon NOLOGIN NOINHERIT;
            RAISE NOTICE 'Created role: anon';
        END IF;
        
        -- authenticated 角色 (已认证用户)
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
            CREATE ROLE authenticated NOLOGIN NOINHERIT;
            RAISE NOTICE 'Created role: authenticated';
        END IF;
        
        -- service_role 角色 (服务端, 绕过 RLS)
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
            CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
            RAISE NOTICE 'Created role: service_role';
        END IF;
        
        -- authenticator 角色 (PostgREST 连接用)
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
            CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD '$DB_PASS';
            RAISE NOTICE 'Created role: authenticator';
        ELSE
            ALTER ROLE authenticator WITH LOGIN PASSWORD '$DB_PASS';
        END IF;
        
        -- supabase_admin 角色 (管理员)
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_admin') THEN
            CREATE ROLE supabase_admin LOGIN PASSWORD '$DB_PASS' SUPERUSER CREATEDB CREATEROLE;
            RAISE NOTICE 'Created role: supabase_admin';
        ELSE
            ALTER ROLE supabase_admin WITH LOGIN PASSWORD '$DB_PASS';
        END IF;

        -- postgres 角色 (兼容性需要，GoTrue 迁移脚本依赖此角色)
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'postgres') THEN
            CREATE ROLE postgres LOGIN PASSWORD '$DB_PASS' SUPERUSER CREATEDB CREATEROLE;
            RAISE NOTICE 'Created role: postgres';
        ELSE
            ALTER ROLE postgres WITH LOGIN PASSWORD '$DB_PASS';
        END IF;
        
        -- supabase_auth_admin 角色 (GoTrue 认证服务使用)
        -- 关键: 必须有 LOGIN 权限!
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
            CREATE ROLE supabase_auth_admin LOGIN PASSWORD '$DB_PASS' NOINHERIT CREATEROLE;
            RAISE NOTICE 'Created role: supabase_auth_admin';
        ELSE
            ALTER ROLE supabase_auth_admin WITH LOGIN PASSWORD '$DB_PASS';
        END IF;
        
        -- 授权角色关系
        GRANT anon TO authenticator;
        GRANT authenticated TO authenticator;
        GRANT service_role TO authenticator;
        
    END
    \$\$;

    -- =========================================
    -- 2. 创建必要的扩展
    -- =========================================
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE EXTENSION IF NOT EXISTS "pgjwt";
    CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

    -- =========================================
    -- 3. 创建 auth schema (GoTrue 需要)
    -- =========================================
    CREATE SCHEMA IF NOT EXISTS auth;
    ALTER SCHEMA auth OWNER TO supabase_auth_admin;
    
    -- 授予 supabase_auth_admin 完整的 auth schema 权限
    GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
    GRANT ALL ON ALL TABLES IN SCHEMA auth TO supabase_auth_admin;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO supabase_auth_admin;
    GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO supabase_auth_admin;
    
    ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO supabase_auth_admin;
    ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON SEQUENCES TO supabase_auth_admin;
    ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON ROUTINES TO supabase_auth_admin;
    
    -- 设置 search_path
    ALTER ROLE supabase_auth_admin SET search_path TO auth, public;

    -- =========================================
    -- 4. 创建 auth.uid() 函数 (RLS 策略需要)
    -- =========================================
    CREATE OR REPLACE FUNCTION auth.uid()
    RETURNS uuid
    LANGUAGE sql
    STABLE
    AS \$\$
        SELECT NULLIF(
            COALESCE(
                current_setting('request.jwt.claim.sub', true),
                current_setting('request.jwt.claims', true)::json->>'sub'
            ),
            ''
        )::uuid
    \$\$;

    -- auth.role() 函数
    CREATE OR REPLACE FUNCTION auth.role()
    RETURNS text
    LANGUAGE sql
    STABLE
    AS \$\$
        SELECT COALESCE(
            current_setting('request.jwt.claim.role', true),
            current_setting('request.jwt.claims', true)::json->>'role'
        )
    \$\$;

    ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;
    ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

    -- =========================================
    -- 5. 设置 public schema 权限
    -- =========================================
    GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

EOSQL

echo "=== [00] Supabase 基础架构初始化完成 ==="
