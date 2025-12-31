#!/bin/bash

# MathFlow前端Docker构建脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 默认值
IMAGE_NAME="mathflow-frontend"
TAG="latest"
BUILD_CONTEXT="."
DOCKERFILE_PATH="Dockerfile"

# 帮助信息
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -t, --tag TAG          设置镜像标签 (默认: latest)"
    echo "  -n, --name NAME        设置镜像名称 (默认: mathflow-frontend)"
    echo "  -c, --context PATH     设置构建上下文 (默认: .)"
    echo "  -f, --file PATH        设置Dockerfile路径 (默认: Dockerfile)"
    echo "  -h, --help             显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                                    # 使用默认设置构建"
    echo "  $0 -t v1.0.0 -n myapp               # 自定义标签和名称"
    echo "  $0 -c /path/to/app -f Dockerfile.prod # 指定上下文和Dockerfile"
}

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        -n|--name)
            IMAGE_NAME="$2"
            shift 2
            ;;
        -c|--context)
            BUILD_CONTEXT="$2"
            shift 2
            ;;
        -f|--file)
            DOCKERFILE_PATH="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}未知选项: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

FULL_IMAGE_NAME="${IMAGE_NAME}:${TAG}"

echo -e "${YELLOW}开始构建MathFlow前端Docker镜像...${NC}"
echo -e "${YELLOW}镜像名称: ${FULL_IMAGE_NAME}${NC}"
echo -e "${YELLOW}构建上下文: ${BUILD_CONTEXT}${NC}"
echo -e "${YELLOW}Dockerfile: ${DOCKERFILE_PATH}${NC}"
echo ""

# 检查Docker是否可用
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker未安装或不在PATH中${NC}"
    exit 1
fi

# 检查构建上下文是否存在
if [[ ! -d "$BUILD_CONTEXT" ]]; then
    echo -e "${RED}错误: 构建上下文目录不存在: ${BUILD_CONTEXT}${NC}"
    exit 1
fi

# 检查Dockerfile是否存在
if [[ ! -f "${BUILD_CONTEXT}/${DOCKERFILE_PATH}" ]]; then
    echo -e "${RED}错误: Dockerfile不存在: ${BUILD_CONTEXT}/${DOCKERFILE_PATH}${NC}"
    exit 1
fi

# 构建镜像
echo -e "${GREEN}正在构建镜像...${NC}"
docker build \
    -f "${BUILD_CONTEXT}/${DOCKERFILE_PATH}" \
    -t "${FULL_IMAGE_NAME}" \
    "${BUILD_CONTEXT}"

if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ 镜像构建成功: ${FULL_IMAGE_NAME}${NC}"
    echo ""
    echo -e "${YELLOW}镜像信息:${NC}"
    docker images "${FULL_IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
    echo ""
    echo -e "${YELLOW}运行容器:${NC}"
    echo "docker run -d -p 80:80 --name mathflow-app ${FULL_IMAGE_NAME}"
    echo ""
    echo -e "${YELLOW}查看日志:${NC}"
    echo "docker logs -f mathflow-app"
else
    echo -e "${RED}❌ 镜像构建失败${NC}"
    exit 1
fi