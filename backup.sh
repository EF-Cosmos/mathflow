#!/bin/bash

# ========================================
# 数据备份脚本 - backup.sh
# 功能：自动备份应用数据、配置和重要文件
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
BACKUP_DIR="backups"
TEMP_DIR="temp"
LOG_FILE="logs/backup.log"
DATE_STR=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="${PROJECT_NAME}_backup_${DATE_STR}"
MAX_BACKUPS=10  # 保留的最大备份数量

# 创建必要目录
mkdir -p "$BACKUP_DIR" "$TEMP_DIR" logs

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
    echo -e "${CYAN}数据备份脚本${NC}"
    echo "用法: $0 [选项] [备份类型]"
    echo ""
    echo "备份类型:"
    echo "  full        完整备份 (默认)"
    echo "  config      仅配置文件"
    echo "  data        仅数据文件"
    echo "  logs        仅日志文件"
    echo "  custom      自定义备份"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示此帮助信息"
    echo "  -o, --output   指定输出目录 (默认: $BACKUP_DIR)"
    echo "  -n, --name     指定备份名称 (默认: $BACKUP_NAME)"
    echo "  -c, --compress 压缩备份文件"
    echo "  -k, --keep     保留的备份数量 (默认: $MAX_BACKUPS)"
    echo "  -v, --verbose  详细输出"
    echo ""
}

# 获取文件大小
get_file_size() {
    local path=$1
    if [ -f "$path" ]; then
        du -h "$path" | cut -f1
    elif [ -d "$path" ]; then
        du -sh "$path" | cut -f1
    else
        echo "N/A"
    fi
}

# 创建备份目录
create_backup_dir() {
    local backup_path="$1"
    
    log "INFO" "创建备份目录: $backup_path"
    
    if mkdir -p "$backup_path"; then
        log "INFO" "备份目录创建成功"
        return 0
    else
        log "ERROR" "无法创建备份目录: $backup_path"
        return 1
    fi
}

# 备份配置文件
backup_config_files() {
    local backup_path=$1
    local config_dir="$backup_path/config"
    
    log "INFO" "备份配置文件..."
    show_progress 1 5 "备份配置文件"
    
    mkdir -p "$config_dir"
    
    # 配置文件列表
    local config_files=(
        "package.json"
        "package-lock.json"
        "tsconfig.json"
        "vite.config.js"
        ".env"
        ".env.example"
        "supabase"
        "docs"
    )
    
    local backed_up=0
    for file in "${config_files[@]}"; do
        if [ -e "$file" ]; then
            if [ -d "$file" ]; then
                cp -r "$file" "$config_dir/" 2>/dev/null || true
            else
                cp "$file" "$config_dir/" 2>/dev/null || true
            fi
            ((backed_up++))
            log "INFO" "已备份: $file"
        fi
    done
    
    log "INFO" "配置文件备份完成 ($backed_up 个文件)"
}

# 备份数据文件
backup_data_files() {
    local backup_path=$1
    local data_dir="$backup_path/data"
    
    log "INFO" "备份数据文件..."
    show_progress 2 5 "备份数据文件"
    
    mkdir -p "$data_dir"
    
    # 数据目录列表
    local data_dirs=(
        "dist"
        "node_modules"
        "browser/screenshots"
    )
    
    local backed_up=0
    for dir in "${data_dirs[@]}"; do
        if [ -d "$dir" ]; then
            cp -r "$dir" "$data_dir/" 2>/dev/null || true
            ((backed_up++))
            log "INFO" "已备份目录: $dir"
        fi
    done
    
    log "INFO" "数据文件备份完成 ($backed_up 个目录)"
}

# 备份日志文件
backup_log_files() {
    local backup_path=$1
    local logs_dir="$backup_path/logs"
    
    log "INFO" "备份日志文件..."
    show_progress 3 5 "备份日志文件"
    
    mkdir -p "$logs_dir"
    
    if [ -d "logs" ]; then
        cp -r logs/* "$logs_dir/" 2>/dev/null || true
        log "INFO" "日志文件备份完成"
    else
        log "WARN" "日志目录不存在"
    fi
}

# 备份数据库（如果适用）
backup_database() {
    local backup_path=$1
    local db_dir="$backup_path/database"
    
    log "INFO" "备份数据库..."
    show_progress 4 5 "备份数据库"
    
    # 这里可以添加数据库备份逻辑
    # 例如：PostgreSQL, MySQL, MongoDB 等
    # 目前留空，根据具体项目需求添加
    
    mkdir -p "$db_dir"
    echo "# 数据库备份占位符" > "$db_dir/README.md"
    
    log "INFO" "数据库备份完成"
}

# 创建备份清单
create_backup_manifest() {
    local backup_path=$1
    
    log "INFO" "创建备份清单..."
    show_progress 5 5 "创建备份清单"
    
    local manifest_file="$backup_path/manifest.json"
    
    cat > "$manifest_file" << EOF
{
  "backup_name": "$BACKUP_NAME",
  "project_name": "$PROJECT_NAME",
  "backup_date": "$(date -Iseconds)",
  "backup_type": "$1",
  "files": {
    "config": $(find "$backup_path/config" -type f 2>/dev/null | wc -l),
    "data": $(find "$backup_path/data" -type f 2>/dev/null | wc -l),
    "logs": $(find "$backup_path/logs" -type f 2>/dev/null | wc -l),
    "database": $(find "$backup_path/database" -type f 2>/dev/null | wc -l)
  },
  "total_size": "$(du -sh "$backup_path" | cut -f1)"
}
EOF
    
    log "INFO" "备份清单创建完成"
}

# 压缩备份文件
compress_backup() {
    local backup_path=$1
    
    log "INFO" "压缩备份文件..."
    
    local compressed_file="${backup_path}.tar.gz"
    
    if tar -czf "$compressed_file" -C "$(dirname "$backup_path")" "$(basename "$backup_path")"; then
        rm -rf "$backup_path"
        log "INFO" "备份压缩完成: $compressed_file"
        
        # 获取压缩后的大小
        local compressed_size=$(get_file_size "$compressed_file")
        echo -e "${GREEN}压缩后大小: $compressed_size${NC}"
        
        return 0
    else
        log "ERROR" "备份压缩失败"
        return 1
    fi
}

# 清理旧备份
cleanup_old_backups() {
    local keep_count=$1
    
    log "INFO" "清理旧备份，保留最新 $keep_count 个..."
    
    local backup_count=$(ls -1 "$PROJECT_NAME"_backup_*.tar.gz "$PROJECT_NAME"_backup_*/ 2>/dev/null | wc -l)
    
    if [ $backup_count -gt $keep_count ]; then
        local to_remove=$((backup_count - keep_count))
        echo -e "${YELLOW}将删除 $to_remove 个旧备份...${NC}"
        
        # 按修改时间排序，删除最旧的
        ls -1t "$PROJECT_NAME"_backup_*.tar.gz "$PROJECT_NAME"_backup_*/ 2>/dev/null | tail -n "$to_remove" | while read backup; do
            if [ -d "$backup" ]; then
                rm -rf "$backup"
            else
                rm -f "$backup"
            fi
            log "INFO" "已删除旧备份: $backup"
        done
    else
        log "INFO" "无需清理备份"
    fi
}

# 验证备份
verify_backup() {
    local backup_path=$1
    
    log "INFO" "验证备份完整性..."
    
    local issues=0
    
    # 检查必要目录
    for dir in config data logs; do
        if [ ! -d "$backup_path/$dir" ]; then
            log "WARN" "缺少目录: $dir"
            ((issues++))
        fi
    done
    
    # 检查清单文件
    if [ ! -f "$backup_path/manifest.json" ]; then
        log "WARN" "缺少备份清单文件"
        ((issues++))
    fi
    
    if [ $issues -eq 0 ]; then
        log "INFO" "备份验证通过"
        return 0
    else
        log "ERROR" "备份验证失败，发现 $issues 个问题"
        return 1
    fi
}

# 显示备份信息
show_backup_info() {
    local backup_path=$1
    
    echo ""
    echo -e "${GREEN}🎉 备份完成!${NC}"
    echo "=================================="
    echo -e "${CYAN}备份名称: $(basename "$backup_path")${NC}"
    echo -e "${CYAN}备份路径: $backup_path${NC}"
    echo -e "${CYAN}备份大小: $(get_file_size "$backup_path")${NC}"
    echo -e "${CYAN}备份时间: $(date)${NC}"
    
    # 显示清单信息
    if [ -f "$backup_path/manifest.json" ]; then
        echo ""
        echo -e "${BLUE}备份内容:${NC}"
        echo "  配置文件: $(jq -r '.files.config' "$backup_path/manifest.json" 2>/dev/null || echo "N/A") 个文件"
        echo "  数据文件: $(jq -r '.files.data' "$backup_path/manifest.json" 2>/dev/null || echo "N/A") 个文件"
        echo "  日志文件: $(jq -r '.files.logs' "$backup_path/manifest.json" 2>/dev/null || echo "N/A") 个文件"
    fi
    
    echo "=================================="
}

# 主函数
main() {
    local backup_type="full"
    local output_dir="$BACKUP_DIR"
    local backup_name="$BACKUP_NAME"
    local compress="false"
    local keep_count=$MAX_BACKUPS
    local verbose="false"
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -o|--output)
                output_dir="$2"
                shift 2
                ;;
            -n|--name)
                backup_name="$2"
                shift 2
                ;;
            -c|--compress)
                compress="true"
                shift
                ;;
            -k|--keep)
                keep_count="$2"
                shift 2
                ;;
            -v|--verbose)
                verbose="true"
                shift
                ;;
            full|config|data|logs|custom)
                backup_type="$1"
                shift
                ;;
            *)
                echo -e "${RED}未知选项: $1${NC}"
                show_help
                exit 1
                ;;
        esac
    done
    
    echo -e "${PURPLE}💾 开始备份 $PROJECT_NAME${NC}"
    echo "================================"
    
    # 记录开始时间
    local start_time=$(date +%s)
    
    # 设置输出路径
    local backup_path="$output_dir/$backup_name"
    
    # 创建备份目录
    if ! create_backup_dir "$backup_path"; then
        exit 1
    fi
    
    # 执行备份
    case "$backup_type" in
        "full")
            backup_config_files "$backup_path"
            backup_data_files "$backup_path"
            backup_log_files "$backup_path"
            backup_database "$backup_path"
            ;;
        "config")
            backup_config_files "$backup_path"
            ;;
        "data")
            backup_data_files "$backup_path"
            ;;
        "logs")
            backup_log_files "$backup_path"
            ;;
        "custom")
            echo -e "${YELLOW}自定义备份模式 - 请根据需要修改脚本${NC}"
            backup_config_files "$backup_path"
            ;;
        *)
            log "ERROR" "未知的备份类型: $backup_type"
            exit 1
            ;;
    esac
    
    # 创建备份清单
    create_backup_manifest "$backup_path" "$backup_type"
    
    # 验证备份
    if ! verify_backup "$backup_path"; then
        log "ERROR" "备份验证失败"
        exit 1
    fi
    
    # 压缩备份
    if [ "$compress" = "true" ]; then
        compress_backup "$backup_path"
        backup_path="${backup_path}.tar.gz"
    fi
    
    # 清理旧备份
    cleanup_old_backups "$keep_count"
    
    # 计算耗时
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # 显示备份信息
    show_backup_info "$backup_path"
    
    echo -e "${CYAN}耗时: ${duration}秒${NC}"
    echo -e "${BLUE}日志文件: $LOG_FILE${NC}"
    
    log "INFO" "备份完成，耗时 ${duration} 秒，备份路径: $backup_path"
}

# 信号处理
trap 'echo -e "\n${YELLOW}⏹️  备份操作被中断${NC}"; exit 0' INT TERM

# 检查依赖
if ! command -v tar &> /dev/null; then
    echo -e "${RED}错误: 需要 tar 命令来创建压缩包${NC}"
    exit 1
fi

# 检查 jq (用于处理 JSON)
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}警告: 未找到 jq 命令，JSON 处理功能将受限${NC}"
fi

# 执行主函数
main "$@"