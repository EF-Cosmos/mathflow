#!/bin/bash

# Docker Compose 配置验证脚本

echo "=== MathFlow Docker Compose 配置验证 ==="
echo ""

# 检查文件是否存在
echo "检查配置文件..."
files=(
    "docker-compose.yml"
    "docker-compose.simple.yml"
    ".env.example"
    "docker-start.sh"
    "Dockerfile.backend"
    "code/mathflow-new/Dockerfile"
    "code/mathflow-new/nginx.conf"
    "DOCKER_README.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - 存在"
    else
        echo "❌ $file - 缺失"
    fi
done

echo ""
echo "检查目录结构..."
dirs=(
    "supabase/functions"
    "supabase/migrations"
    "supabase/tables"
    "code/mathflow-new/src"
)

for dir in "${dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir - 存在"
    else
        echo "❌ $dir - 缺失"
    fi
done

echo ""
echo "检查 Docker Compose 语法..."
if command -v docker-compose &> /dev/null; then
    if docker-compose -f docker-compose.yml config > /dev/null 2>&1; then
        echo "✅ docker-compose.yml - 语法正确"
    else
        echo "❌ docker-compose.yml - 语法错误"
    fi
    
    if docker-compose -f docker-compose.simple.yml config > /dev/null 2>&1; then
        echo "✅ docker-compose.simple.yml - 语法正确"
    else
        echo "❌ docker-compose.simple.yml - 语法错误"
    fi
else
    echo "⚠️ Docker Compose 未安装，跳过语法检查"
fi

echo ""
echo "=== 验证完成 ==="
echo ""
echo "使用说明:"
echo "1. 复制 .env.example 为 .env 并配置环境变量"
echo "2. 运行 ./docker-start.sh start 启动服务"
echo "3. 访问 http://localhost:3000 查看前端应用"