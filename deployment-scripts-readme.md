---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 30460221008433a50079bfc1b2e9807899df098fb01eec9f8b2e0195c49cab9dbfcb2a198d0221009e6701a95dc05440228e7d93c1a838c101ebc9192dc8a04a8651065d4f1351b4
    ReservedCode2: 3045022100f1a8ad9c8eda822075f3238a390db744a19bc65125c8686646d764bda07bdead02204c28ae79ac448eb0ed516e6bfccfd19bd301b967e15729df0de257c2ceadddab
---

# 自动化部署脚本使用说明

## 概述

本套脚本提供完整的自动化部署和管理功能，包含错误处理、进度显示和日志记录。

## 脚本列表

### 1. deploy.sh - 完整部署脚本
**功能**: 完整的部署流程（构建、启动、检查）
**特点**: 
- 依赖检查
- 自动备份现有版本
- 清理旧文件
- 安装依赖和构建项目
- 启动服务并健康检查

**使用方法**:
```bash
./deploy.sh
```

### 2. start.sh - 快速启动脚本
**功能**: 快速启动应用服务
**特点**:
- 检查端口占用
- 支持前台/后台运行
- 强制重启选项
- 健康检查

**使用方法**:
```bash
# 基本启动
./start.sh

# 指定端口
./start.sh --port 8080

# 后台运行
./start.sh --daemon

# 强制启动（停止占用端口的进程）
./start.sh --force

# 显示帮助
./start.sh --help
```

### 3. stop.sh - 停止服务脚本
**功能**: 停止应用服务及相关进程
**特点**:
- 优雅停止和强制终止
- 停止所有相关进程
- 端口清理
- 资源清理

**使用方法**:
```bash
# 停止主服务
./stop.sh

# 停止所有相关进程
./stop.sh --all

# 强制终止
./stop.sh --force

# 指定端口
./stop.sh --port 8080
```

### 4. logs.sh - 查看日志脚本
**功能**: 实时查看和管理应用日志
**特点**:
- 多种日志类型支持
- 实时跟踪
- 关键词搜索
- 日志清理

**使用方法**:
```bash
# 查看应用日志（最后50行）
./logs.sh app

# 实时跟踪日志
./logs.sh --follow app

# 搜索关键词
./logs.sh --search "error"

# 显示最近100行
./logs.sh --lines 100

# 列出所有日志文件
./logs.sh --list

# 清空日志
./logs.sh --clear app

# 监控模式（显示状态+实时日志）
./logs.sh --monitor
```

### 5. backup.sh - 数据备份脚本
**功能**: 自动备份应用数据、配置和重要文件
**特点**:
- 多种备份类型
- 自动压缩
- 备份验证
- 旧备份清理

**使用方法**:
```bash
# 完整备份
./backup.sh full

# 仅备份配置文件
./backup.sh config

# 压缩备份
./backup.sh --compress full

# 指定备份名称
./backup.sh --name "my_backup" full

# 指定保留数量
./backup.sh --keep 5 full
```

### 6. update.sh - 滚动更新脚本
**功能**: 零停机时间的应用更新
**特点**:
- 平滑重启
- 健康检查
- 自动回滚
- 版本管理

**使用方法**:
```bash
# 基本更新
./update.sh

# 更新前创建备份
./update.sh --backup

# 强制更新（跳过健康检查）
./update.sh --force

# 回滚到上一个版本
./update.sh --rollback

# 自定义健康检查超时时间
./update.sh --timeout 60
```

## 目录结构

脚本会自动创建以下目录结构：
```
project/
├── logs/           # 日志文件
├── backups/        # 备份文件
├── temp/           # 临时文件
└── dist/           # 构建输出
```

## 配置文件

脚本使用以下配置文件：
- `package.json` - Node.js项目配置
- `.env` - 环境变量
- `.env.example` - 环境变量模板

## 端口配置

默认端口：3000，可在脚本中修改`PORT`变量

## 日志级别

所有脚本都支持以下日志级别：
- `INFO` - 一般信息
- `WARN` - 警告信息
- `ERROR` - 错误信息

## 错误处理

每个脚本都包含：
- 依赖检查
- 错误捕获和处理
- 详细的错误日志
- 优雅退出

## 进度显示

所有长时间运行的操作都包含进度条显示：
- 百分比进度
- 当前任务描述
- 实时更新

## 颜色输出

脚本使用颜色编码：
- 🔴 红色 - 错误
- 🟡 黄色 - 警告
- 🟢 绿色 - 成功
- 🔵 蓝色 - 信息
- 🟣 紫色 - 标题
- 🔵 青色 - 进度

## 示例工作流

### 完整部署流程
```bash
# 1. 完整部署
./deploy.sh

# 2. 查看服务状态
./logs.sh --monitor

# 3. 如需停止
./stop.sh

# 4. 重新启动
./start.sh --daemon
```

### 更新流程
```bash
# 1. 创建备份并更新
./update.sh --backup

# 2. 如果更新失败，回滚
./update.sh --rollback

# 3. 查看更新日志
./logs.sh --search "update"
```

### 备份流程
```bash
# 1. 创建完整备份
./backup.sh --compress --keep 10

# 2. 查看备份列表
ls -la backups/

# 3. 清理旧备份
./backup.sh --keep 5
```

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   ./stop.sh --all
   ./start.sh --force
   ```

2. **服务启动失败**
   ```bash
   ./logs.sh --search "error"
   ./deploy.sh  # 重新部署
   ```

3. **健康检查失败**
   ```bash
   ./stop.sh --force
   ./start.sh --daemon
   ```

4. **查看详细日志**
   ```bash
   ./logs.sh --verbose
   ```

## 自定义配置

可以通过修改脚本顶部的变量来自定义配置：
- `PROJECT_NAME` - 项目名称
- `PORT` - 服务端口
- `LOG_FILE` - 日志文件路径
- `MAX_BACKUPS` - 最大备份数量

## 注意事项

1. 确保Node.js和npm已安装
2. 脚本会在当前目录执行，请确保在项目根目录运行
3. 建议定期备份重要数据
4. 更新前建议先测试新版本
5. 生产环境请谨慎使用强制选项

## 技术支持

如有问题，请检查：
1. 日志文件：`logs/`目录下的相关日志
2. 依赖是否正确安装
3. 端口是否被其他服务占用
4. 配置文件是否正确

---

**版本**: 1.0  
**更新时间**: $(date +%Y-%m-%d)