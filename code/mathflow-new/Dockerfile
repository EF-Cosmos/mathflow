# 前端 Dockerfile
FROM node:18-alpine AS builder

# 接收构建参数
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# 设置构建时环境变量
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package 文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 设置 CI 环境变量并构建应用
ENV CI=true
RUN pnpm build

# 生产环境镜像
FROM nginx:alpine

# 复制构建结果到 nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 3000

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]