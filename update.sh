#!/bin/bash

# ========================================
# 滚动更新脚本 - update.sh
# 功能：零停机时间的应用更新
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
LOG_FILE="logs/update.log"
PID_FILE="logs/app.pid"
TEMP_DIR="temp"
BACKUP_DIR="backups"
HEALTH_CHECK_URL="http://localhost:$PORT"

# 创建必要目录
mkdir -p "$LOG_FILE" "$TEMP_DIR" "$BACKUP_DIR" logs

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

# 显示帮助信息
show_help() {
    echo -e "${CYAN}滚动更新脚本${NC}"
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help        显示此帮助信息"
    echo "  -f, --force       强制更新 (跳过健康检查)"
    echo "  -b, --backup      更新前创建备份"
    echo "  -r, --rollback    回滚到上一个版本"
    echo "  -t, --timeout     健康检查超时时间 (默认: 30秒)"
    echo "  -v, --verbose     详细输出"
    echo ""
}

# 检查服务状态
check_service_status() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            log "INFO" "服务正在运行 (PID: $pid)"
            return 0
        else
            log "WARN" "PID文件存在但进程未运行"
            rm -f "$PID_FILE"
            return 1
        fi
    else
        log "INFO" "服务未运行"
        return 1
    fi
}

# 健康检查
health_check() {
    local timeout=${1:-30}
    local max_attempts=$((timeout / 2))
    local attempt=1
    
    log "INFO" "开始健康检查..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$HEALTH_CHECK_URL" &> /dev/null; then
            log "INFO" "健康检查通过"
            return 0
        fi
        
        if [ $((attempt % 3)) -eq 0 ]; then
            log "INFO" "等待服务恢复... (尝试 $attempt/$max_attempts)"
        fi
        
        sleep 2
        ((attempt++))
    done
    
    log "ERROR" "健康检查超时"
    return 1
}

# 获取当前版本信息
get_current_version() {
    if [ -f "package.json" ]; then
        jq -r '.version // "unknown"' package.json 2>/dev/null || echo "unknown"
    else
        echo "unknown"
    fi
}

# 获取新版本信息
get_new_version() {
    if [ -f "package.json" ]; then
        jq -r '.version // "unknown"' package.json 2>/dev/null || echo "unknown"
    else
        echo "unknown"
    fi
}

# 创建更新前备份
create_update_backup() {
    local backup_name="pre_update_$(date +%Y%m%d_%H%M%S)"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    log "INFO" "创建更新前备份: $backup_name"
    
    mkdir -p "$backup_path"
    
    # 备份当前构建文件
    if [ -d "$BUILD_DIR" ]; then
        cp -r "$BUILD_DIR" "$backup_path/current_build"
        log "INFO" "已备份当前构建文件"
    fi
    
    # 备份配置文件
    local config_files=("package.json" "package-lock.json" ".env" ".env.example")
    mkdir -p "$backup_path/config"
    
    for file in "${config_files[@]}"; do
        if [ -f "$file" ]; then
            cp "$file" "$backup_path/config/" 2>/dev/null || true
        fi
    done
    
    # 创建备份清单
    cat > "$backup_path/manifest.json" << EOF
{
  "backup_type": "pre_update",
  "backup_time": "$(date -Iseconds)",
  "current_version": "$(get_current_version)",
  "backup_name": "$backup_name"
}
EOF
    
    log "INFO" "更新前备份完成: $backup_path"
    echo "$backup_path"
}

# 回滚到指定备份
rollback_to_backup() {
    local backup_path=$1
    
    if [ ! -d "$backup_path" ]; then
        log "ERROR" "备份目录不存在: $backup_path"
        return 1
    fi
    
    log "INFO" "开始回滚到备份: $(basename "$backup_path")"
    
    # 停止当前服务
    if check_service_status; then
        log "INFO" "停止当前服务"
        ./stop.sh --force
        sleep 3
    fi
    
    # 恢复构建文件
    if [ -d "$backup_path/current_build" ]; then
        log "INFO" "恢复构建文件"
        rm -rf "$BUILD_DIR" 2>/dev/null || true
        cp -r "$backup_path/current_build" "$BUILD_DIR"
        log "INFO" "构建文件恢复完成"
    fi
    
    # 恢复配置文件
    if [ -d "$backup_path/config" ]; then
        log "INFO" "恢复配置文件"
        cp -r "$backup_path/config"/* . 2>/dev/null || true
        log "INFO" "配置文件恢复完成"
    fi
    
    # 重新启动服务
    log "INFO" "重新启动服务"
    ./start.sh --daemon
    
    # 健康检查
    if health_check 30; then
        log "INFO" "回滚成功"
        return 0
    else
        log "ERROR" "回滚后健康检查失败"
        return 1
    fi
}

# 列出可用备份
list_available_backups() {
    echo -e "${CYAN}📁 可用的备份:${NC}"
    echo "========================"
    
    local backup_count=0
    for backup in "$BACKUP_DIR"/pre_update_*; do
        if [ -d "$backup" ]; then
            local backup_name=$(basename "$backup")
            local backup_time=$(stat -c %y "$backup" 2>/dev/null | cut -d' ' -f1,2 | cut -d'.' -f1)
            local backup_size=$(du -sh "$backup" 2>/dev/null | cut -f1)
            
            echo -e "${GREEN}$((++backup_count)).${NC} ${BLUE}$backup_name${NC}"
            echo -e "   时间: $backup_time | 大小: $backup_size"
            
            # 显示版本信息
            if [ -f "$backup/manifest.json" ]; then
                local version=$(jq -r '.current_version // "unknown"' "$backup/manifest.json" 2>/dev/null || echo "unknown")
                echo -e "   版本: $version"
            fi
            echo ""
        fi
    done
    
    if [ $backup_count -eq 0 ]; then
        echo -e "${YELLOW}⚠️  没有找到可用的备份${NC}"
    fi
    
    return $backup_count
}

# 平滑重启服务
graceful_restart() {
    local new_pid=$1
    local timeout=${2:-30}
    
    log "INFO" "执行平滑重启..."
    
    if [ ! -f "$PID_FILE" ]; then
        log "ERROR" "PID文件不存在"
        return 1
    fi
    
    local old_pid=$(cat "$PID_FILE")
    
    if ! kill -0 "$old_pid" 2>/dev/null; then
        log "WARN" "旧进程 $old_pid 不存在，直接启动新服务"
        return 0
    fi
    
    # 启动新服务
    log "INFO" "启动新服务进程"
    
    # 等待新服务启动
    sleep 5
    
    # 检查新服务是否启动成功
    if ! kill -0 "$new_pid" 2>/dev/null; then
        log "ERROR" "新服务进程启动失败"
        return 1
    fi
    
    # 健康检查新服务
    if ! health_check "$timeout"; then
        log "ERROR" "新服务健康检查失败"
        # 终止新服务
        kill -9 "$new_pid" 2>/dev/null || true
        return 1
    fi
    
    # 优雅停止旧服务
    log "INFO" "停止旧服务进程 (PID: $old_pid)"
    kill -TERM "$old_pid" 2>/dev/null || true
    
    # 等待旧服务退出
    local wait_time=0
    local max_wait=10
    while [ $wait_time -lt $max_wait ]; do
        if ! kill -0 "$old_pid" 2>/dev/null; then
            log "INFO" "旧服务已优雅退出"
            break
        fi
        sleep 1
        ((wait_time++))
    done
    
    # 强制终止旧服务（如果还在运行）
    if kill -0 "$old_pid" 2>/dev/null; then
        log "WARN" "强制终止旧服务"
        kill -9 "$old_pid" 2>/dev/null || true
    fi
    
    # 更新PID文件
    echo "$new_pid" > "$PID_FILE"
    
    log "INFO" "平滑重启完成"
    return 0
}

# 执行滚动更新
perform_rolling_update() {
    local force=$1
    local create_backup=$2
    
    log "INFO" "开始滚动更新..."
    
    local current_version=$(get_current_version)
    local new_version=$(get_new_version)
    
    echo -e "${CYAN}版本信息:${NC}"
    echo -e "当前版本: ${YELLOW}$current_version${NC}"
    echo -e "新版本: ${GREEN}$new_version${NC}"
    echo ""
    
    # 检查服务是否运行
    local service_running=false
    if check_service_status; then
        service_running=true
    fi
    
    # 创建备份
    local backup_path=""
    if [ "$create_backup" = "true" ]; then
        backup_path=$(create_update_backup)
    fi
    
    # 停止服务（如果正在运行）
    if [ "$service_running" = "true" ]; then
        log "INFO" "停止当前服务"
        ./stop.sh --force
        sleep 3
    fi
    
    # 更新代码
    log "INFO" "更新代码..."
    show_progress 1 4 "更新源代码"
    
    # 这里可以添加 git pull 或其他更新逻辑
    # git pull origin main  # 取消注释以启用Git更新
    
    show_progress 2 4 "安装依赖"
    
    # 安装依赖
    if [ -f "package.json" ]; then
        npm ci || npm install
    fi
    
    show_progress 3 4 "构建新版本"
    
    # 构建新版本
    if npm run build; then
        log "INFO" "新版本构建成功"
    else
        log "ERROR" "新版本构建失败"
        if [ "$backup_path" != "" ] && [ "$service_running" = "true" ]; then
            log "INFO" "尝试回滚到备份"
            rollback_to_backup "$backup_path"
        fi
        exit 1
    fi
    
    show_progress 4 4 "启动新版本"
    
    # 启动新服务
    if [ "$service_running" = "true" ]; then
        log "INFO" "启动新版本服务"
        ./start.sh --daemon --force
        
        # 健康检查
        if ! health_check 30; then
            log "ERROR" "新版本健康检查失败"
            
            if [ "$backup_path" != "" ]; then
                log "INFO" "回滚到备份版本"
                rollback_to_backup "$backup_path"
            else
                log "ERROR" "无法回滚，请手动检查服务状态"
            fi
            
            exit 1
        fi
        
        log "INFO" "滚动更新成功完成"
    else
        log "INFO" "服务未运行，跳过健康检查"
        ./start.sh --daemon --force
    fi
    
    echo ""
    echo -e "${GREEN}🎉 滚动更新完成!${NC}"
    echo -e "${BLUE}新版本: $new_version${NC}"
    echo -e "${BLUE}服务地址: http://localhost:$PORT${NC}"
    
    log "INFO" "滚动更新完成，新版本: $new_version"
}

# 主函数
main() {
    local force="false"
    local backup="false"
    local rollback="false"
    local timeout=30
    local verbose="false"
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -f|--force)
                force="true"
                shift
                ;;
            -b|--backup)
                backup="true"
                shift
                ;;
            -r|--rollback)
                rollback="true"
                shift
                ;;
            -t|--timeout)
                timeout="$2"
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
    
    echo -e "${PURPLE}🔄 $PROJECT_NAME 滚动更新${NC}"
    echo "================================"
    
    # 记录开始时间
    local start_time=$(date +%s)
    
    if [ "$rollback" = "true" ]; then
        # 回滚模式
        echo -e "${YELLOW}🔙 回滚模式${NC}"
        
        if list_available_backups; then
            echo ""
            read -p "请输入要回滚的备份编号: " backup_num
            
            local backup_count=0
            for backup in "$BACKUP_DIR"/pre_update_*; do
                if [ -d "$backup" ]; then
                    ((backup_count++))
                    if [ $backup_count -eq $backup_num ]; then
                        if rollback_to_backup "$backup"; then
                            echo -e "${GREEN}✅ 回滚成功!${NC}"
                        else
                            echo -e "${RED}❌ 回滚失败!${NC}"
                            exit 1
                        fi
                        break
                    fi
                fi
            done
        fi
    else
        # 更新模式
        if [ "$force" != "true" ]; then
            # 非强制模式下检查服务状态
            if ! check_service_status; then
                echo -e "${YELLOW}⚠️  服务未运行，是否仍要继续更新? (y/N)${NC}"
                read -r confirm
                if [[ ! $confirm =~ ^[Yy]$ ]]; then
                    echo "更新已取消"
                    exit 0
                fi
            fi
        fi
        
        perform_rolling_update "$force" "$backup"
    fi
    
    # 计算耗时
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    echo -e "${CYAN}耗时: ${duration}秒${NC}"
    echo -e "${BLUE}日志文件: $LOG_FILE${NC}"
    echo "================================"
    
    log "INFO" "操作完成，耗时 ${duration} 秒"
}

# 信号处理
trap 'echo -e "\n${YELLOW}⏹️  更新操作被中断${NC}"; exit 0' INT TERM

# 检查依赖
if ! command -v curl &> /dev/null; then
    echo -e "${RED}错误: 需要 curl 命令进行健康检查${NC}"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}警告: 未找到 jq 命令，JSON 处理功能将受限${NC}"
fi

# 执行主函数
main "$@"