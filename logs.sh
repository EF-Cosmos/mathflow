#!/bin/bash

# ========================================
# 查看日志脚本 - logs.sh
# 功能：实时查看和管理应用日志
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
LOG_DIR="logs"
PID_FILE="logs/app.pid"
DEFAULT_LINES=50

# 创建必要目录
mkdir -p "$LOG_DIR"

# 日志函数
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[$timestamp] [$level] $message"
}

# 显示帮助信息
show_help() {
    echo -e "${CYAN}日志查看脚本${NC}"
    echo "用法: $0 [选项] [日志类型]"
    echo ""
    echo "日志类型:"
    echo "  app         查看应用日志 (默认)"
    echo "  deploy      查看部署日志"
    echo "  start       查看启动日志"
    echo "  stop        查看停止日志"
    echo "  error       查看错误日志"
    echo "  all         查看所有日志"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示此帮助信息"
    echo "  -f, --follow   实时跟踪日志 (tail -f)"
    echo "  -n, --lines    显示行数 (默认: $DEFAULT_LINES)"
    echo "  -s, --search   搜索关键词"
    echo "  -c, --clear    清空日志文件"
    echo "  -l, --list     列出所有日志文件"
    echo "  -g, --grep     使用grep过滤"
    echo "  -t, --tail     显示最后N行"
    echo ""
}

# 列出所有日志文件
list_log_files() {
    echo -e "${CYAN}📁 可用的日志文件:${NC}"
    echo "=============================="
    
    if [ ! -d "$LOG_DIR" ] || [ -z "$(ls -A "$LOG_DIR" 2>/dev/null)" ]; then
        echo -e "${YELLOW}⚠️  日志目录为空或不存在${NC}"
        return 1
    fi
    
    local count=0
    for file in "$LOG_DIR"/*.log; do
        if [ -f "$file" ]; then
            local filename=$(basename "$file")
            local size=$(du -h "$file" | cut -f1)
            local modified=$(stat -c %y "$file" 2>/dev/null | cut -d' ' -f1,2 | cut -d'.' -f1)
            echo -e "${GREEN}$((++count)).${NC} ${BLUE}$filename${NC}"
            echo -e "   大小: $size | 修改时间: $modified"
            echo ""
        fi
    done
    
    if [ $count -eq 0 ]; then
        echo -e "${YELLOW}⚠️  没有找到日志文件${NC}"
    fi
}

# 查找日志文件
find_log_file() {
    local log_type=$1
    
    case "$log_type" in
        "app")
            echo "$LOG_DIR/app_$(date +%Y%m%d)*.log"
            ;;
        "deploy")
            echo "$LOG_DIR/deploy.log"
            ;;
        "start")
            echo "$LOG_DIR/start.log"
            ;;
        "stop")
            echo "$LOG_DIR/stop.log"
            ;;
        "error")
            echo "$LOG_DIR/error.log"
            ;;
        "all")
            echo "$LOG_DIR/*.log"
            ;;
        *)
            echo "$LOG_DIR/app_$(date +%Y%m%d)*.log"
            ;;
    esac
}

# 显示日志内容
show_log() {
    local log_pattern=$1
    local lines=$2
    local follow=$3
    local search=$4
    local grep_pattern=$5
    
    # 查找匹配的日志文件
    local log_files=()
    for file in $log_pattern; do
        if [ -f "$file" ]; then
            log_files+=("$file")
        fi
    done
    
    if [ ${#log_files[@]} -eq 0 ]; then
        echo -e "${YELLOW}⚠️  没有找到匹配的日志文件${NC}"
        echo -e "${BLUE}模式: $log_pattern${NC}"
        return 1
    fi
    
    echo -e "${CYAN}📄 日志文件: ${log_files[*]}${NC}"
    echo "=================================="
    
    # 显示日志内容
    for file in "${log_files[@]}"; do
        if [ -f "$file" ]; then
            local filename=$(basename "$file")
            echo -e "\n${PURPLE}=== $filename ===${NC}"
            
            if [ "$follow" = "true" ]; then
                # 实时跟踪
                if [ ! -z "$search" ]; then
                    tail -f "$file" | grep --line-buffered "$search" || true
                elif [ ! -z "$grep_pattern" ]; then
                    tail -f "$file" | grep --line-buffered "$grep_pattern" || true
                else
                    tail -f "$file"
                fi
            else
                # 显示固定行数
                if [ ! -z "$search" ]; then
                    tail -n "$lines" "$file" | grep "$search" || true
                elif [ ! -z "$grep_pattern" ]; then
                    tail -n "$lines" "$file" | grep "$grep_pattern" || true
                else
                    tail -n "$lines" "$file"
                fi
            fi
        fi
    done
}

# 搜索日志内容
search_logs() {
    local keyword=$1
    local log_pattern=$2
    
    echo -e "${CYAN}🔍 搜索关键词: '$keyword'${NC}"
    echo "=================================="
    
    local found=false
    for file in $log_pattern; do
        if [ -f "$file" ]; then
            local filename=$(basename "$file")
            local matches=$(grep -n "$keyword" "$file" 2>/dev/null | wc -l)
            
            if [ $matches -gt 0 ]; then
                echo -e "\n${GREEN}📄 $filename (找到 $matches 个匹配)${NC}"
                echo "----------------------------------------"
                grep -n --color=always "$keyword" "$file" 2>/dev/null || true
                found=true
            fi
        fi
    done
    
    if [ "$found" = "false" ]; then
        echo -e "${YELLOW}⚠️  没有找到包含关键词 '$keyword' 的日志${NC}"
    fi
}

# 清空日志文件
clear_logs() {
    local log_pattern=$1
    
    echo -e "${RED}⚠️  即将清空日志文件: $log_pattern${NC}"
    read -p "确认清空? (y/N): " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        for file in $log_pattern; do
            if [ -f "$file" ]; then
                > "$file"
                echo -e "${GREEN}✅ 已清空: $(basename "$file")${NC}"
            fi
        done
        log "INFO" "日志文件已清空: $log_pattern"
    else
        echo -e "${BLUE}操作已取消${NC}"
    fi
}

# 获取服务状态
get_service_status() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${GREEN}✅ 服务运行中 (PID: $pid)${NC}"
            return 0
        else
            echo -e "${RED}❌ 服务未运行${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  未找到PID文件${NC}"
        return 1
    fi
}

# 实时监控模式
monitor_mode() {
    echo -e "${CYAN}📊 服务状态监控${NC}"
    echo "========================"
    
    get_service_status
    
    echo ""
    echo -e "${YELLOW}🔄 实时日志监控 (按 Ctrl+C 退出)${NC}"
    echo "=========================================="
    
    # 监控应用日志
    show_log "$(find_log_file "app")" 10 "true" "" ""
}

# 主函数
main() {
    local log_type="app"
    local lines=$DEFAULT_LINES
    local follow="false"
    local search=""
    local clear="false"
    local list="false"
    local grep_pattern=""
    local monitor="false"
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -f|--follow)
                follow="true"
                shift
                ;;
            -n|--lines)
                lines="$2"
                shift 2
                ;;
            -s|--search)
                search="$2"
                shift 2
                ;;
            -c|--clear)
                clear="true"
                shift
                ;;
            -l|--list)
                list="true"
                shift
                ;;
            -g|--grep)
                grep_pattern="$2"
                shift 2
                ;;
            -t|--tail)
                lines="$2"
                shift 2
                ;;
            --monitor)
                monitor="true"
                shift
                ;;
            app|deploy|start|stop|error|all)
                log_type="$1"
                shift
                ;;
            *)
                echo -e "${RED}未知选项: $1${NC}"
                show_help
                exit 1
                ;;
        esac
    done
    
    echo -e "${PURPLE}📋 日志查看工具${NC}"
    echo "========================"
    
    # 显示服务状态
    get_service_status
    echo ""
    
    if [ "$list" = "true" ]; then
        list_log_files
        exit 0
    fi
    
    if [ "$monitor" = "true" ]; then
        monitor_mode
        exit 0
    fi
    
    if [ "$clear" = "true" ]; then
        clear_logs "$(find_log_file "$log_type")"
        exit 0
    fi
    
    if [ ! -z "$search" ]; then
        search_logs "$search" "$(find_log_file "$log_type")"
    else
        show_log "$(find_log_file "$log_type")" "$lines" "$follow" "" "$grep_pattern"
    fi
}

# 信号处理
trap 'echo -e "\n${YELLOW}⏹️  日志查看已退出${NC}"; exit 0' INT TERM

# 执行主函数
main "$@"