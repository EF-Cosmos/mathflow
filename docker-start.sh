#!/bin/bash

# Docker Compose 启动脚本
# 用于启动 MathFlow 完整服务栈

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印函数
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

# 检查 Docker 和 Docker Compose
check_dependencies() {
    print_info "检查依赖..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装或不在 PATH 中"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose 未安装或不在 PATH 中"
        exit 1
    fi
    
    print_success "依赖检查通过"
}

# 创建必要目录
create_directories() {
    print_info "创建数据目录..."
    mkdir -p data/postgres
    mkdir -p data/redis
    mkdir -p data/logs
    print_success "数据目录创建完成"
}

# 设置环境变量
setup_env() {
    if [ ! -f .env ]; then
        print_warning ".env 文件不存在，复制 .env.example"
        cp .env.example .env
        print_warning "请编辑 .env 文件配置实际的环境变量"
    else
        print_info ".env 文件已存在"
    fi
}

# 构建和启动服务
start_services() {
    print_info "构建并启动服务..."
    
    # 构建服务
    print_info "构建 Docker 镜像..."
    docker-compose build
    
    # 启动服务
    print_info "启动服务..."
    docker-compose up -d
    
    # 等待服务启动
    print_info "等待服务启动..."
    sleep 10
    
    # 检查服务状态
    print_info "检查服务状态..."
    docker-compose ps
}

# 显示访问信息
show_access_info() {
    print_success "MathFlow 服务已启动！"
    echo ""
    echo "服务访问地址："
    echo "  前端应用:    http://localhost:3000"
    echo "  后端 API:    http://localhost:3001"
    echo "  数据库:      localhost:5432"
    echo "  Redis:       localhost:6379"
    echo "  Supabase Studio: http://localhost:54323"
    echo ""
    echo "常用命令："
    echo "  查看日志:    docker-compose logs -f [service-name]"
    echo "  停止服务:    docker-compose down"
    echo "  重启服务:    docker-compose restart"
    echo "  进入容器:    docker-compose exec [service-name] sh"
    echo ""
}

# 清理函数
cleanup() {
    print_info "清理服务..."
    docker-compose down
    print_success "清理完成"
}

# 主函数
main() {
    print_info "MathFlow Docker Compose 启动脚本"
    
    case "${1:-start}" in
        "start")
            check_dependencies
            create_directories
            setup_env
            start_services
            show_access_info
            ;;
        "stop")
            cleanup
            ;;
        "restart")
            cleanup
            sleep 2
            start_services
            show_access_info
            ;;
        "logs")
            docker-compose logs -f
            ;;
        "status")
            docker-compose ps
            ;;
        *)
            echo "用法: $0 {start|stop|restart|logs|status}"
            echo ""
            echo "命令说明："
            echo "  start   - 启动所有服务 (默认)"
            echo "  stop    - 停止所有服务"
            echo "  restart - 重启所有服务"
            echo "  logs    - 查看服务日志"
            echo "  status  - 查看服务状态"
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"