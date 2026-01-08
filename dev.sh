#!/bin/bash

# ========================================
# MathFlow 开发启动脚本
# ========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 显示帮助
show_help() {
    echo -e "${CYAN}MathFlow 开发环境${NC}"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  frontend     启动前端开发服务器 (pnpm dev)"
    echo "  backend      启动后端 SymPy API (podman)"
    echo "  all          启动前端和后端"
    echo "  stop-backend 停止后端容器"
    echo "  status       查看服务状态"
    echo "  logs-backend 查看后端日志"
    echo ""
    echo "示例:"
    echo "  $0 all       # 启动完整开发环境"
    echo "  $0 frontend  # 仅启动前端"
    echo ""
}

# 检查 Podman
check_podman() {
    if ! command -v podman &> /dev/null; then
        echo -e "${RED}错误: Podman 未安装${NC}"
        echo "请安装 Podman: sudo dnf install podman"
        exit 1
    fi
}

# 启动前端
start_frontend() {
    echo -e "${BLUE}启动前端开发服务器...${NC}"
    cd code/mathflow-new

    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}首次运行，安装依赖...${NC}"
        pnpm install
    fi

    echo -e "${GREEN}前端地址: http://localhost:3000${NC}"
    pnpm dev
}

# 启动后端
start_backend() {
    echo -e "${BLUE}启动后端 SymPy API...${NC}"
    check_podman

    cd code/mathflow-new

    # 检查是否已构建
    if ! podman image exists mathflow-sympy:latest 2>/dev/null; then
        echo -e "${YELLOW}首次运行，构建后端镜像...${NC}"
        podman build -t mathflow-sympy:latest backend/
    fi

    # 检查容器是否已运行
    if podman ps -q --filter "name=mathflow-backend" | grep -q .; then
        echo -e "${YELLOW}后端已在运行${NC}"
        echo -e "${GREEN}后端地址: http://localhost:8001${NC}"
        return 0
    fi

    # 启动容器
    podman run -d --name mathflow-backend --network host --restart unless-stopped localhost/mathflow-sympy:latest

    echo -e "${GREEN}后端已启动: http://localhost:8001${NC}"
}

# 停止后端
stop_backend() {
    echo -e "${BLUE}停止后端容器...${NC}"
    if podman ps -q --filter "name=mathflow-backend" | grep -q .; then
        podman stop mathflow-backend
        podman rm mathflow-backend
        echo -e "${GREEN}后端已停止${NC}"
    else
        echo -e "${YELLOW}后端未运行${NC}"
    fi
}

# 查看状态
show_status() {
    echo -e "${CYAN}服务状态:${NC}"
    echo ""

    # 后端状态
    echo -n "后端 (SymPy API): "
    if podman ps -q --filter "name=mathflow-backend" | grep -q .; then
        echo -e "${GREEN}运行中${NC} (port 8001)"
    else
        echo -e "${RED}未运行${NC}"
    fi

    # 前端状态
    echo -n "前端 (Vite Dev): "
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}运行中${NC} (port 3000)"
    else
        echo -e "${RED}未运行${NC}"
    fi
}

# 查看后端日志
show_backend_logs() {
    if podman ps -q --filter "name=mathflow-backend" | grep -q .; then
        podman logs -f mathflow-backend
    else
        echo -e "${RED}后端未运行${NC}"
    fi
}

# 主函数
main() {
    case "${1:-all}" in
        frontend)
            start_frontend
            ;;
        backend)
            start_backend
            ;;
        all)
            start_backend
            echo ""
            start_frontend
            ;;
        stop-backend)
            stop_backend
            ;;
        status)
            show_status
            ;;
        logs-backend)
            show_backend_logs
            ;;
        -h|--help|help)
            show_help
            ;;
        *)
            echo -e "${RED}未知命令: $1${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
