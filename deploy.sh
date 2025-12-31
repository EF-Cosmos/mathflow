#!/bin/bash

# ========================================
# 完整部署脚本 - deploy.sh
# 功能：构建、启动、检查服务状态
# ========================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_NAME="mathflow"
BUILD_DIR="dist"
PORT=3000
LOG_FILE="logs/deploy.log"
PID_FILE="logs/deploy.pid"

# 创建必要的目录
mkdir -p logs backups temp

# 日志函数
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
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

# 错误处理函数
handle_error() {
    log "ERROR" "部署失败: $1"
    echo -e "\n${RED}❌ 部署失败: $1${NC}"
    exit 1
}

# 检查依赖
check_dependencies() {
    log "INFO" "检查系统依赖..."
    
    local deps=("npm" "node" "git")
    local missing=()
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing+=("$dep")
        fi
    done
    
    if [ ${#missing[@]} -ne 0 ]; then
        handle_error "缺少依赖: ${missing[*]}"
    fi
    
    log "INFO" "所有依赖检查通过"
}

# 备份现有版本
backup_existing() {
    if [ -d "$BUILD_DIR" ]; then
        log "INFO" "备份现有版本..."
        local backup_name="backups/backup_$(date +%Y%m%d_%H%M%S)"
        cp -r "$BUILD_DIR" "$backup_name"
        log "INFO" "备份完成: $backup_name"
    fi
}

# 清理旧文件
cleanup_old_files() {
    log "INFO" "清理旧文件..."
    show_progress 1 5 "清理临时文件"
    
    # 清理node_modules中的缓存
    if [ -d "node_modules" ]; then
        npm cache clean --force &> /dev/null || true
    fi
    
    # 清理构建目录
    rm -rf "$BUILD_DIR" 2>/dev/null || true
    
    show_progress 5 5 "清理完成"
    echo ""
}

# 安装依赖
install_dependencies() {
    log "INFO" "安装项目依赖..."
    show_progress 2 5 "安装npm依赖"
    
    if [ -f "package.json" ]; then
        npm ci || npm install
        log "INFO" "依赖安装完成"
    else
        handle_error "未找到package.json文件"
    fi
}

# 构建项目
build_project() {
    log "INFO" "构建项目..."
    show_progress 3 5 "编译源代码"
    
    if npm run build; then
        log "INFO" "项目构建成功"
    else
        handle_error "项目构建失败"
    fi
}

# 启动服务
start_service() {
    log "INFO" "启动服务..."
    show_progress 4 5 "启动Web服务"
    
    # 停止旧进程
    if [ -f "$PID_FILE" ]; then
        local old_pid=$(cat "$PID_FILE")
        if kill -0 "$old_pid" 2>/dev/null; then
            log "INFO" "停止旧进程: $old_pid"
            kill "$old_pid"
            sleep 2
        fi
        rm -f "$PID_FILE"
    fi
    
    # 启动新服务
    if [ -d "$BUILD_DIR" ]; then
        # 使用npm start或自定义启动命令
        if npm start &> "logs/app_$(date +%Y%m%d_%H%M%S).log" & 
        then
            local pid=$!
            echo "$pid" > "$PID_FILE"
            log "INFO" "服务已启动 (PID: $pid)"
        else
            handle_error "服务启动失败"
        fi
    else
        handle_error "构建目录不存在"
    fi
}

# 检查服务状态
check_service_health() {
    log "INFO" "检查服务健康状态..."
    show_progress 5 5 "健康检查"
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:$PORT" &> /dev/null; then
            log "INFO" "服务运行正常"
            echo -e "\n${GREEN}✅ 部署成功!${NC}"
            echo -e "${BLUE}服务地址: http://localhost:$PORT${NC}"
            return 0
        fi
        
        if [ $((attempt % 5)) -eq 0 ]; then
            log "INFO" "等待服务启动... (尝试 $attempt/$max_attempts)"
        fi
        
        sleep 2
        ((attempt++))
    done
    
    handle_error "服务启动超时"
}

# 主函数
main() {
    echo -e "${PURPLE}🚀 开始部署 $PROJECT_NAME${NC}"
    echo "=========================================="
    
    # 记录开始时间
    local start_time=$(date +%s)
    
    # 执行部署步骤
    check_dependencies
    backup_existing
    cleanup_old_files
    install_dependencies
    build_project
    start_service
    check_service_health
    
    # 计算耗时
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    echo -e "${GREEN}🎉 部署完成!${NC}"
    echo -e "${CYAN}耗时: ${duration}秒${NC}"
    echo -e "${BLUE}日志文件: $LOG_FILE${NC}"
    echo "=========================================="
    
    log "INFO" "部署完成，耗时 ${duration} 秒"
}

# 信号处理
trap 'handle_error "脚本被中断"' INT TERM

# 执行主函数
main "$@"