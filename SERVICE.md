# 服务管理指南

## 快速命令

```bash
# 启动服务（后台运行）
npm run service start

# 停止服务
npm run service stop

# 重启服务
npm run service restart

# 查看状态
npm run service status
```

## 详细说明

### 启动服务
```bash
npm run service start
```
- 服务在后台运行
- 日志保存到 `logs/dashboard.log`
- 进程 ID 保存到 `.dashboard.pid`

### 停止服务
```bash
npm run service stop
```
- 优雅关闭服务
- 自动清理进程文件

### 重启服务
```bash
npm run service restart
```
- 先停止再启动
- 配置更新后使用

### 查看状态
```bash
npm run service status
```
- 显示服务运行状态
- 显示进程 ID

### 查看日志
```bash
tail -f logs/dashboard.log
```

## 开机自启动（可选）

### macOS (launchd)
创建 `~/Library/LaunchAgents/com.wechat.exporter.plist`

### Linux (systemd)
创建 `/etc/systemd/system/wechat-exporter.service`
