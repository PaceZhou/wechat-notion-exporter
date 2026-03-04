# 跨设备同步系统配置指南

## 系统架构

```
Chrome 插件（Windows/Mac）
    ↓ (配置同步)
Chrome Storage Sync API
    ↓ (数据传输)
Notion 收集箱
    ↓ (处理请求)
Mac 处理服务器
    ↓ (自动抓取)
目标数据库 + 自动清理
```

## 新功能

### 1. 跨设备配置同步
- 在任意设备配置一次
- 自动同步到所有 Chrome 浏览器
- 支持 Notion API、服务器地址等

### 2. 自定义快捷键
- 默认：Ctrl+Shift+S (Win) / Cmd+Shift+S (Mac)
- 可在 `chrome://extensions/shortcuts` 自定义

### 3. 处理模式
- **立即处理**：保存后立即通知服务器处理
- **定时处理**：每天固定时间批量处理
- **手动触发**：仅保存，手动运行处理

### 4. 自动清理
- 处理完成后自动删除缓存
- 清理临时下载文件
- 释放磁盘空间

## 配置步骤

### 第一步：安装依赖
```bash
cd wechat-notion-exporter
npm install
```

### 第二步：创建 Notion 收集箱
```bash
npm run setup-db <父页面ID>
# 复制输出的数据库 ID
```

### 第三步：配置 Chrome 扩展
1. 打开扩展选项页面（右键扩展图标 → 选项）
2. 填入 Notion API Key
3. 填入收集箱数据库 ID
4. 填入 Mac 服务器地址（如 `http://192.168.1.100:3000`）
5. 选择处理模式
6. 保存配置（自动同步到所有设备）

### 第四步：启动 Mac 处理服务器
```bash
# 在 Mac 上运行
npm run server
# 服务器将在 http://0.0.0.0:3000 运行
```

### 第五步：设置定时任务（可选）
```bash
# 编辑 crontab
crontab -e

# 添加每天凌晨 2 点执行
0 2 * * * cd /path/to/wechat-notion-exporter && npm run daily
```

## 使用流程

1. **Windows 上浏览文章** → 点击扩展图标
2. **自动保存到 Notion** → 配置已同步
3. **Mac 服务器处理** → 自动抓取并导入
4. **自动清理缓存** → 释放空间

## 测试连接

在扩展选项页面点击"测试连接"，确保：
- ✅ Notion API 可用
- ✅ Mac 服务器可访问
