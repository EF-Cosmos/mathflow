#!/bin/bash

# ========================================
# MathFlow 备份脚本
# ========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 配置
BACKUP_DIR="backups"
DATE_STR=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="mathflow_backup_${DATE_STR}"

# 显示帮助
show_help() {
    echo -e "${CYAN}MathFlow 备份工具${NC}"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示帮助"
    echo "  -c, --config   仅备份配置文件"
    echo "  -d, --data     仅备份数据"
    echo "  --no-compress  不压缩备份"
    echo ""
}

# 创建备份目录
mkdir -p "$BACKUP_DIR"

backup_config() {
    echo -e "${BLUE}备份配置文件...${NC}"

    local backup_path="$BACKUP_DIR/${BACKUP_NAME}_config"
    mkdir -p "$backup_path"

    # 备份环境变量和配置
    cp -r .env.example "$backup_path/" 2>/dev/null || true
    cp -r docker-compose*.yml "$backup_path/" 2>/dev/null || true
    cp -r Makefile "$backup_path/" 2>/dev/null || true
    cp -r CLAUDE.md README*.md "$backup_path/" 2>/dev/null || true

    echo -e "${GREEN}配置备份完成: $backup_path${NC}"
}

backup_data() {
    echo -e "${BLUE}备份数据...${NC}"

    local backup_path="$BACKUP_DIR/${BACKUP_NAME}_data"
    mkdir -p "$backup_path"

    # 备份前端代码和配置
    cp -r code/mathflow-new/src "$backup_path/" 2>/dev/null || true
    cp -r code/mathflow-new/public "$backup_path/" 2>/dev/null || true
    cp -r code/mathflow-new/package.json "$backup_path/" 2>/dev/null || true
    cp -r code/mathflow-new/tsconfig*.json "$backup_path/" 2>/dev/null || true
    cp -r code/mathflow-new/vite.config.ts "$backup_path/" 2>/dev/null || true
    cp -r code/mathflow-new/tailwind.config.js "$backup_path/" 2>/dev/null || true
    cp -r code/mathflow-new/.env "$backup_path/" 2>/dev/null || true

    # 备份后端代码
    cp -r code/mathflow-new/backend "$backup_path/" 2>/dev/null || true

    # 备份数据库相关
    cp -r supabase "$backup_path/" 2>/dev/null || true

    echo -e "${GREEN}数据备份完成: $backup_path${NC}"
}

backup_full() {
    echo -e "${BLUE}完整备份...${NC}"

    local backup_path="$BACKUP_DIR/$BACKUP_NAME"
    mkdir -p "$backup_path"

    # 配置
    cp -r .env.example docker-compose*.yml Makefile CLAUDE.md README*.md "$backup_path/" 2>/dev/null || true

    # 前端源码
    mkdir -p "$backup_path/code_src"
    cp -r code/mathflow-new/src "$backup_path/code_src/" 2>/dev/null || true
    cp -r code/mathflow-new/public "$backup_path/code_src/" 2>/dev/null || true
    cp -r code/mathflow-new/backend "$backup_path/code_src/" 2>/dev/null || true
    cp code/mathflow-new/package.json "$backup_path/code_src/" 2>/dev/null || true
    cp code/mathflow-new/tsconfig*.json "$backup_path/code_src/" 2>/dev/null || true
    cp code/mathflow-new/vite.config.ts "$backup_path/code_src/" 2>/dev/null || true
    cp code/mathflow-new/tailwind.config.js "$backup_path/code_src/" 2>/dev/null || true
    cp code/mathflow-new/.env "$backup_path/code_src/" 2>/dev/null || true

    # Supabase
    cp -r supabase "$backup_path/" 2>/dev/null || true

    # 创建清单
    cat > "$backup_path/manifest.txt" << EOF
备份时间: $(date)
备份类型: 完整备份
项目: MathFlow
EOF

    echo -e "${GREEN}完整备份完成: $backup_path${NC}"
}

compress_backup() {
    local backup_path="$1"

    echo -e "${BLUE}压缩备份...${NC}"
    tar -czf "${backup_path}.tar.gz" -C "$BACKUP_DIR" "$(basename "$backup_path")"
    rm -rf "$backup_path"
    echo -e "${GREEN}压缩完成: ${backup_path}.tar.gz${NC}"
}

# 清理旧备份
cleanup_old() {
    echo -e "${BLUE}清理旧备份 (保留最近5个)...${NC}"
    ls -t "$BACKUP_DIR"/mathflow_backup_* 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null || true
}

# 主函数
main() {
    local backup_type="full"
    local compress=true

    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -c|--config)
                backup_type="config"
                shift
                ;;
            -d|--data)
                backup_type="data"
                shift
                ;;
            --no-compress)
                compress=false
                shift
                ;;
            *)
                echo -e "${RED}未知选项: $1${NC}"
                show_help
                exit 1
                ;;
        esac
    done

    echo -e "${CYAN}==================================${NC}"
    echo -e "${CYAN}MathFlow 备份${NC}"
    echo -e "${CYAN}==================================${NC}"
    echo ""

    case "$backup_type" in
        config)
            backup_config
            ;;
        data)
            backup_data
            ;;
        full)
            backup_full
            ;;
    esac

    if [ "$compress" = true ]; then
        compress_backup "$BACKUP_DIR/$BACKUP_NAME"
    fi

    cleanup_old

    echo ""
    echo -e "${GREEN}备份完成!${NC}"
}

trap 'echo -e "\n${YELLOW}备份已取消${NC}"; exit 0' INT

main "$@"
