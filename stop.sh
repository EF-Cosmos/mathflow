#!/bin/bash

# ========================================
# 停止服务脚本 - stop.sh
# 功能：停止应用服务及相关进程
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
PID_FILE="logs/app.pid"
LOG_FILE="logs/stop.log"
PORT=3000

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
    echo -e "${CYAN}停止服务脚本${NC}"
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示此帮助信息"
    echo "  -a, --all      停止所有相关进程"
    echo "  -f, --force    强制终止进程"
    echo "  -p, --port     指定端口号 (默认: $PORT)"
    echo "  -v, --verbose  详细输出"
    echo ""
}

# 进度显示函数
show_progress() {
    local current=$1
    local total=$2
    local task=$3
    local percentage=$((current * 100 / total))
    local filled=$((percentage / 2))
    local empty=$((50 - filled))
    
    printf "\r${CYAN}进度: ["
    printf "%${filled}s" | tr ' ' '█'
    printf "%${empty}s" | tr ' ' '░'
    printf "] %d%% - %s${NC}" "$percentage" "$task"
}

# 通过PID停止进程
stop_by_pid() {
    local pid=$1
    local force=$2
    
    if [ -z "$pid" ]; then
        return 1
    fi
    
    if ! kill -0 "$pid" 2>/dev/null; then
        log "WARN" "进程 $pid 不存在"
        return 1
    fi
    
    log "INFO" "停止进程: $pid"
    
    if [ "$force" = "true" ]; then
        # 强制终止
        kill -9 "$pid" 2>/dev/null || true
        log "INFO" "强制终止进程: $pid"
    else
        # 优雅停止
        kill -TERM "$pid" 2>/dev/null || true
        log "INFO" "发送终止信号到进程: $pid"
        
        # 等待进程退出
        local wait_time=0
        local max_wait=10
        while [ $wait_time -lt $max_wait ]; do
            if ! kill -0 "$pid" 2>/dev/null; then
                log "INFO" "进程 $pid 已优雅退出"
                return 0
            fi
            sleep 1
            ((wait_time++))
        done
        
        # 如果还没有退出，强制终止
        log "WARN" "进程 $pid 未在 ${max_wait}秒内退出，强制终止"
        kill -9 "$pid" 2>/dev/null || true
    fi
}

# 通过端口停止进程
stop_by_port() {
    local port=$1
    local force=$2
    
    # 查找占用端口的进程
    local pids=$(lsof -ti :$port 2>/dev/null || true)
    
    if [ -z "$pids" ]; then
        log "INFO" "端口 $port 没有被占用"
        return 1
    fi
    
    log "INFO" "找到占用端口 $port 的进程: $pids"
    
    for pid in $pids; do
        stop_by_pid "$pid" "$force"
    done
    
    return 0
}

# 停止主服务进程
stop_main_service() {
    local force=$1
    
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if stop_by_pid "$pid" "$force"; then
            rm -f "$PID_FILE"
            log "INFO" "主服务进程已停止"
            return 0
        else
            rm -f "$PID_FILE"  # 即使停止失败也删除PID文件
        fi
    else
        log "INFO" "未找到PID文件"
    fi
    
    return 1
}

# 停止所有相关进程
stop_all_processes() {
    local force=$1
    
    echo -e "${YELLOW}🔍 查找所有相关进程...${NC}"
    
    # 查找Node.js进程
    local node_pids=$(pgrep -f "node" 2>/dev/null || true)
    if [ ! -z "$node_pids" ]; then
        echo -e "${CYAN}找到Node.js进程: $node_pids${NC}"
        for pid in $node_pids; do
            stop_by_pid "$pid" "$force"
        done
    fi
    
    # 查找npm进程
    local npm_pids=$(pgrep -f "npm" 2>/dev/null || true)
    if [ ! -z "$npm_pids" ]; then
        echo -e "${CYAN}找到npm进程: $npm_pids${NC}"
        for pid in $npm_pids; do
            stop_by_pid "$pid" "$force"
        done
    fi
    
    # 停止端口上的进程
    if stop_by_port "$PORT" "$force"; then
        log "INFO" "已停止端口 $PORT 上的进程"
    fi
}

# 清理资源
cleanup_resources() {
    show_progress 1 3 "清理PID文件"
    
    # 删除PID文件
    rm -f "$PID_FILE"
    
    # 清理临时文件
    show_progress 2 3 "清理临时文件"
    rm -f "logs/*.tmp" 2>/dev/null || true
    
    show_progress 3 3 "清理完成"
    echo ""
}

# 验证服务是否已停止
verify_stopped() {
    local max_attempts=5
    local attempt=1
    
    echo -e "${CYAN}验证服务是否已停止...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if check_port "$PORT"; then
            echo -e "${YELLOW}⚠️  端口 $PORT 仍被占用 (尝试 $attempt/$max_attempts)${NC}"
        else
            echo -e "${GREEN}✅ 端口 $PORT 已释放${NC}"
            return 0
        fi
        
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ 端口 $PORT 仍然被占用${NC}"
    return 1
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

# 主函数
main() {
    local force="false"
    local stop_all="false"
    local port=$PORT
    local verbose="false"
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -a|--all)
                stop_all="true"
                shift
                ;;
            -f|--force)
                force="true"
                shift
                ;;
            -p|--port)
                port="$2"
                shift 2
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
    
    echo -e "${PURPLE}🛑 停止 $PROJECT_NAME 服务${NC}"
    echo "==================================="
    
    # 更新端口配置
    PORT=$port
    
    local stopped=false
    
    if [ "$stop_all" = "true" ]; then
        echo -e "${YELLOW}🔍 停止所有相关进程...${NC}"
        stop_all_processes "$force"
        stopped=true
    else
        echo -e "${CYAN}停止主服务进程...${NC}"
        if stop_main_service "$force"; then
            stopped=true
        fi
        
        # 清理端口
        if stop_by_port "$PORT" "$force"; then
            stopped=true
        fi
    fi
    
    # 清理资源
    cleanup_resources
    
    # 验证停止状态
    if [ "$stopped" = "true" ]; then
        verify_stopped
        
        echo ""
        echo -e "${GREEN}🎉 服务停止完成!${NC}"
        echo -e "${BLUE}日志文件: $LOG_FILE${NC}"
        echo "==================================="
        
        log "INFO" "服务停止完成"
    else
        echo -e "${YELLOW}⚠️  没有找到运行中的服务${NC}"
        log "INFO" "没有找到运行中的服务"
    fi
}

# 信号处理
trap 'echo -e "\n${YELLOW}⏹️  停止操作被中断${NC}"; exit 0' INT TERM

# 执行主函数
main "$@"