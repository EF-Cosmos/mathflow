#!/bin/bash

# ========================================
# 快速启动脚本 - start.sh
# 功能：快速启动应用服务
# ========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 配置变量
PROJECT_NAME="mathflow"
BUILD_DIR="dist"
PORT=3000
LOG_FILE="logs/start.log"
PID_FILE="logs/app.pid"

# 创建必要目录
mkdir -p logs

# 日志函数
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# 显示帮助信息
show_help() {
    echo -e "${CYAN}快速启动脚本${NC}"
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示此帮助信息"
    echo "  -p, --port     指定端口号 (默认: $PORT)"
    echo "  -d, --daemon   后台运行模式"
    echo "  -f, --force    强制启动 (停止现有进程)"
    echo "  -v, --verbose  详细输出"
    echo ""
}

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # 端口被占用
    else
        return 1  # 端口可用
    fi
}

# 停止占用端口的进程
kill_port_process() {
    local port=$1
    local pid=$(lsof -ti :$port)
    if [ ! -z "$pid" ]; then
        log "WARN" "停止占用端口 $port 的进程: $pid"
        kill -9 "$pid" 2>/dev/null || true
        sleep 2
    fi
}

# 检查服务是否运行
is_service_running() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            return 0  # 服务正在运行
        else
            rm -f "$PID_FILE"
            return 1  # 服务未运行
        fi
    else
        return 1  # 服务未运行
    fi
}

# 启动服务
start_service() {
    local daemon_mode=$1
    local force=$2
    
    # 检查服务状态
    if is_service_running; then
        local pid=$(cat "$PID_FILE")
        echo -e "${YELLOW}⚠️  服务已在运行 (PID: $pid)${NC}"
        if [ "$force" = "true" ]; then
            log "INFO" "强制重启服务"
            kill "$pid" 2>/dev/null || true
            sleep 2
            rm -f "$PID_FILE"
        else
            echo -e "${BLUE}使用 -f 选项强制重启${NC}"
            return 1
        fi
    fi
    
    # 检查端口
    if check_port "$PORT"; then
        echo -e "${YELLOW}⚠️  端口 $PORT 被占用${NC}"
        if [ "$force" = "true" ]; then
            kill_port_process "$PORT"
        else
            echo -e "${BLUE}使用 -f 选项释放端口${NC}"
            return 1
        fi
    fi
    
    # 启动服务
    if [ -d "$BUILD_DIR" ]; then
        log "INFO" "启动服务，端口: $PORT"
        
        if [ "$daemon_mode" = "true" ]; then
            # 后台运行
            nohup npm start > "logs/app_$(date +%Y%m%d_%H%M%S).log" 2>&1 &
            local pid=$!
            echo "$pid" > "$PID_FILE"
            
            echo -e "${GREEN}✅ 服务已在后台启动${NC}"
            echo -e "${BLUE}PID: $pid${NC}"
            echo -e "${BLUE}日志: logs/app_$(date +%Y%m%d_%H%M%S).log${NC}"
            
            # 等待服务启动
            sleep 3
            if is_service_running; then
                log "INFO" "服务启动成功 (PID: $pid)"
                echo -e "${GREEN}🎉 服务运行正常!${NC}"
                echo -e "${CYAN}访问地址: http://localhost:$PORT${NC}"
            else
                log "ERROR" "服务启动失败"
                echo -e "${RED}❌ 服务启动失败${NC}"
                return 1
            fi
        else
            # 前台运行
            echo -e "${CYAN}前台运行模式 - 按 Ctrl+C 停止${NC}"
            npm start
        fi
    else
        echo -e "${RED}❌ 构建目录不存在: $BUILD_DIR${NC}"
        echo -e "${YELLOW}请先运行 ./deploy.sh 进行完整部署${NC}"
        return 1
    fi
}

# 健康检查
health_check() {
    local max_attempts=10
    local attempt=1
    
    echo -e "${CYAN}正在检查服务健康状态...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:$PORT" &> /dev/null; then
            echo -e "${GREEN}✅ 服务健康检查通过${NC}"
            return 0
        fi
        
        if [ $((attempt % 3)) -eq 0 ]; then
            echo -e "${YELLOW}⏳ 等待服务启动... (尝试 $attempt/$max_attempts)${NC}"
        fi
        
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ 健康检查失败${NC}"
    return 1
}

# 主函数
main() {
    local port=$PORT
    local daemon_mode="false"
    local force="false"
    local verbose="false"
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -p|--port)
                port="$2"
                shift 2
                ;;
            -d|--daemon)
                daemon_mode="true"
                shift
                ;;
            -f|--force)
                force="true"
                shift
                ;;
            -v|--verbose)
                verbose="true"
                shift
                ;;
            *)
                echo -e "${RED}未知选项: $1${NC}"
                show_help
                exit 1
                ;;
        esac
    done
    
    echo -e "${PURPLE}🚀 启动 $PROJECT_NAME 服务${NC}"
    echo "==================================="
    
    # 更新端口配置
    PORT=$port
    
    # 启动服务
    if start_service "$daemon_mode" "$force"; then
        if [ "$daemon_mode" = "true" ]; then
            health_check
        fi
        
        echo ""
        echo -e "${GREEN}🎉 启动完成!${NC}"
        echo -e "${BLUE}服务地址: http://localhost:$PORT${NC}"
        echo -e "${BLUE}日志文件: $LOG_FILE${NC}"
        echo "==================================="
        
        log "INFO" "服务启动成功，端口: $PORT"
    else
        log "ERROR" "服务启动失败"
        exit 1
    fi
}

# 信号处理
trap 'echo -e "\n${YELLOW}⏹️  启动被中断${NC}"; exit 0' INT TERM

# 执行主函数
main "$@"