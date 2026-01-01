#!/bin/bash

# ========================================
# 脚本使用演示 - demo.sh
# 功能：展示各脚本的基本使用方法
# ========================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${PURPLE}🚀 自动化部署脚本演示${NC}"
echo "======================================"

echo -e "\n${CYAN}1. 查看所有可用脚本${NC}"
echo "------------------------"
ls -la *.sh | grep -E '\.(sh)$' | awk '{print $9}' | while read script; do
    if [ -f "$script" ]; then
        echo -e "${GREEN}✓${NC} $script"
    fi
done

echo -e "\n${CYAN}2. 脚本功能概览${NC}"
echo "----------------------"

declare -A script_descriptions=(
    ["deploy.sh"]="完整部署脚本 - 构建、启动、检查服务"
    ["start.sh"]="快速启动脚本 - 启动应用服务"
    ["stop.sh"]="停止服务脚本 - 停止应用服务"
    ["logs.sh"]="查看日志脚本 - 实时查看和管理日志"
    ["backup.sh"]="数据备份脚本 - 备份数据和配置"
    ["update.sh"]="滚动更新脚本 - 零停机时间更新"
)

for script in "${!script_descriptions[@]}"; do
    if [ -f "$script" ]; then
        echo -e "${GREEN}•${NC} ${BLUE}$script${NC}: ${script_descriptions[$script]}"
    fi
done

echo -e "\n${CYAN}3. 基本使用示例${NC}"
echo "---------------------"

echo -e "\n${YELLOW}部署流程:${NC}"
echo "./deploy.sh                    # 完整部署"
echo "./start.sh --daemon           # 后台启动"
echo "./logs.sh --monitor           # 监控状态"

echo -e "\n${YELLOW}管理流程:${NC}"
echo "./stop.sh                     # 停止服务"
echo "./start.sh --force --port 8080 # 强制启动（端口8080）"
echo "./logs.sh app --lines 20       # 查看应用日志"

echo -e "\n${YELLOW}备份流程:${NC}"
echo "./backup.sh --compress full    # 完整压缩备份"
echo "./backup.sh config             # 仅备份配置"

echo -e "\n${YELLOW}更新流程:${NC}"
echo "./update.sh --backup           # 备份并更新"
echo "./update.sh --rollback         # 回滚版本"

echo -e "\n${CYAN}4. 获取帮助${NC}"
echo "------------------"

echo "每个脚本都支持 --help 选项："
for script in "${!script_descriptions[@]}"; do
    if [ -f "$script" ]; then
        echo "$script --help"
    fi
done

echo -e "\n${CYAN}5. 演示命令执行${NC}"
echo "----------------------"

# 演示帮助命令
echo -e "\n${YELLOW}示例：查看 deploy.sh 的帮助信息${NC}"
if [ -f "deploy.sh" ]; then
    echo -e "${BLUE}执行: ./deploy.sh --help${NC}"
    echo ""
    # 这里可以实际执行帮助命令，但由于输出较长，我们只显示命令
    echo "提示：运行上述命令查看详细帮助信息"
fi

echo -e "\n${CYAN}6. 目录结构${NC}"
echo "------------------"

echo "脚本会自动创建以下目录："
echo -e "${GREEN}logs/${NC}         - 日志文件目录"
echo -e "${GREEN}backups/${NC}      - 备份文件目录"
echo -e "${GREEN}temp/${NC}         - 临时文件目录"
echo -e "${GREEN}dist/${NC}         - 构建输出目录"

echo -e "\n${CYAN}7. 最佳实践${NC}"
echo "----------------"

echo "• 部署前先查看日志："
echo "  ./logs.sh --list"
echo ""
echo "• 生产环境更新前创建备份："
echo "  ./update.sh --backup"
echo ""
echo "• 定期清理旧备份："
echo "  ./backup.sh --keep 5"
echo ""
echo "• 出现问题时查看错误日志："
echo "  ./logs.sh --search 'ERROR'"
echo ""
echo "• 端口冲突时强制重启："
echo "  ./stop.sh --all && ./start.sh --force"

echo -e "\n${GREEN}✅ 演示完成！${NC}"
echo "=============="
echo ""
echo -e "${BLUE}接下来您可以:${NC}"
echo "1. 运行 ./deploy.sh 开始完整部署"
echo "2. 查看 ./deployment-scripts-readme.md 获取详细文档"
echo "3. 使用 ./脚本名 --help 查看具体用法"
echo ""
echo -e "${CYAN}祝您使用愉快！${NC}"