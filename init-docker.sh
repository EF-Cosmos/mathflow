#!/bin/bash

# MathFlow Docker 环境初始化脚本
# 该脚本创建必要的目录结构和权限设置

set -e

echo "🚀 开始初始化 MathFlow Docker 环境..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    print_success "Docker 和 Docker Compose 已安装"
}

# 创建目录结构
create_directories() {
    print_info "创建目录结构..."
    
    # 生产环境数据目录
    mkdir -p data/postgres
    mkdir -p data/redis
    mkdir -p data/uploads
    mkdir -p data/logs
    
    # 开发环境数据目录
    mkdir -p data/dev/postgres
    mkdir -p data/dev/redis
    mkdir -p data/dev/uploads
    mkdir -p data/dev/logs
    mkdir -p data/dev/pgadmin
    mkdir -p data/dev/portainer
    
    # 备份目录
    mkdir -p backups
    
    # SSL 证书目录
    mkdir -p docker/ssl
    
    # Nginx 目录已存在，创建配置目录
    mkdir -p docker/nginx/conf.d
    
    print_success "目录结构创建完成"
}

# 设置目录权限
set_permissions() {
    print_info "设置目录权限..."
    
    # 设置适当的权限
    chmod -R 755 data/
    chmod -R 755 backups/
    chmod -R 755 docker/
    
    # PostgreSQL 数据目录需要特定权限
    chmod -R 700 data/postgres
    chmod -R 700 data/dev/postgres
    
    # Redis 数据目录权限
    chmod -R 755 data/redis
    chmod -R 755 data/dev/redis
    
    # 上传文件目录权限
    chmod -R 755 data/uploads
    chmod -R 755 data/dev/uploads
    
    # 日志目录权限
    chmod -R 755 data/logs
    chmod -R 755 data/dev/logs
    
    print_success "目录权限设置完成"
}

# 创建必要的文件
create_files() {
    print_info "创建必要的文件..."
    
    # 创建 .gitkeep 文件以保持空目录
    touch data/postgres/.gitkeep
    touch data/redis/.gitkeep
    touch data/uploads/.gitkeep
    touch data/logs/.gitkeep
    
    touch data/dev/postgres/.gitkeep
    touch data/dev/redis/.gitkeep
    touch data/dev/uploads/.gitkeep
    touch data/dev/logs/.gitkeep
    touch data/dev/pgadmin/.gitkeep
    touch data/dev/portainer/.gitkeep
    
    # 创建空日志文件
    touch data/logs/nginx-access.log
    touch data/logs/nginx-error.log
    touch data/logs/app.log
    
    touch data/dev/logs/nginx-access.log
    touch data/dev/logs/nginx-error.log
    touch data/dev/logs/app.log
    
    # 创建环境变量文件 (如果不存在)
    if [ ! -f .env ]; then
        print_info "创建 .env 文件..."
        cp .env.example .env
        print_warning "请编辑 .env 文件并设置适当的配置值"
    fi
    
    print_success "必要文件创建完成"
}

# 检查端口是否可用
check_ports() {
    print_info "检查端口可用性..."
    
    # 检查常用端口
    PORTS=(80 443 5432 6379 3000 8080 5050 8081 9000)
    OCCUPIED_PORTS=()
    
    for port in "${PORTS[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            OCCUPIED_PORTS+=($port)
        fi
    done
    
    if [ ${#OCCUPIED_PORTS[@]} -gt 0 ]; then
        print_warning "以下端口已被占用: ${OCCUPIED_PORTS[*]}"
        print_warning "这可能导致服务启动失败"
        print_info "可以使用 'make dev' 或 'make prod' 启动服务"
    else
        print_success "所有端口都可用"
    fi
}

# 创建启动脚本
create_scripts() {
    print_info "创建启动脚本..."
    
    # 创建快速启动脚本
    cat > start.sh << 'EOF'
#!/bin/bash
# MathFlow 快速启动脚本

case "$1" in
    "dev"|"development")
        echo "🚀 启动开发环境..."
        make dev
        ;;
    "prod"|"production")
        echo "🚀 启动生产环境..."
        make prod
        ;;
    "stop")
        echo "🛑 停止所有服务..."
        make prod-stop
        ;;
    "restart")
        echo "🔄 重启服务..."
        make restart
        ;;
    "logs")
        echo "📋 查看日志..."
        make logs
        ;;
    "status")
        echo "📊 服务状态..."
        make ps
        ;;
    "health")
        echo "🏥 健康检查..."
        make health
        ;;
    "clean")
        echo "🧹 清理环境..."
        make clean
        ;;
    *)
        echo "用法: $0 {dev|prod|stop|restart|logs|status|health|clean}"
        echo ""
        echo "命令说明:"
        echo "  dev       - 启动开发环境"
        echo "  prod      - 启动生产环境"
        echo "  stop      - 停止所有服务"
        echo "  restart   - 重启服务"
        echo "  logs      - 查看日志"
        echo "  status    - 查看服务状态"
        echo "  health    - 健康检查"
        echo "  clean     - 清理环境"
        exit 1
        ;;
esac
EOF
    
    chmod +x start.sh
    
    print_success "启动脚本创建完成"
}

# 验证配置
validate_config() {
    print_info "验证配置..."
    
    # 检查 docker-compose.yml 是否存在
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml 文件不存在"
        exit 1
    fi
    
    # 检查环境变量文件
    if [ ! -f ".env" ]; then
        print_warning ".env 文件不存在，请参考 .env.example 创建"
    fi
    
    # 检查 Docker 网络配置
    if ! docker network ls | grep -q mathflow-network; then
        print_info "Docker 网络将在首次启动时创建"
    fi
    
    print_success "配置验证完成"
}

# 显示使用说明
show_usage() {
    echo ""
    echo "🎉 MathFlow Docker 环境初始化完成!"
    echo ""
    echo "📋 接下来可以:"
    echo ""
    echo "1. 编辑 .env 文件配置环境变量:"
    echo "   vim .env"
    echo ""
    echo "2. 启动开发环境:"
    echo "   ./start.sh dev"
    echo "   或者: make dev"
    echo ""
    echo "3. 启动生产环境:"
    echo "   ./start.sh prod"
    echo "   或者: make prod"
    echo ""
    echo "4. 查看帮助:"
    echo "   ./start.sh"
    echo "   或者: make help"
    echo ""
    echo "🌐 访问地址:"
    echo "   开发环境: http://localhost:8080"
    echo "   生产环境: http://localhost"
    echo ""
    echo "🛠️  管理工具:"
    echo "   pgAdmin: http://localhost:8080/pgadmin"
    echo "   Redis Commander: http://localhost:8080/redis"
    echo "   Portainer: http://localhost:8080/portainer"
    echo ""
    print_success "初始化完成! 🚀"
}

# 主函数
main() {
    echo "========================================"
    echo "  MathFlow Docker 环境初始化"
    echo "========================================"
    echo ""
    
    check_docker
    create_directories
    set_permissions
    create_files
    check_ports
    create_scripts
    validate_config
    show_usage
}

# 执行主函数
main "$@"