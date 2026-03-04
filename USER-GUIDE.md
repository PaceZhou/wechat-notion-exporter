# 微信文章收集系统 - 完整使用攻略

## 🎯 系统简介

这是一个跨设备的微信公众号文章自动化收集系统，支持：
- Chrome 一键保存文章链接
- 自动抓取文章内容和图片
- 智能导入 Notion 数据库
- 跨设备配置同步
- 可视化管理面板

---

## 📦 第一步：安装依赖

```bash
cd wechat-notion-exporter
npm install
```

---

## 🗄️ 第二步：创建 Notion 数据库

### 2.1 创建收集箱数据库

1. 在 Notion 中创建一个新页面
2. 复制页面 ID（URL 中的一串字符）
3. 运行命令：

```bash
npm run setup-db <父页面ID>
```

4. 复制输出的数据库 ID，添加到 `.env` 文件：

```
COLLECTION_DATABASE_ID=xxxxx
```

### 2.2 创建目标数据库（存放文章）

在 Notion 中手动创建，包含以下字段：
- Name（标题）
- Date（日期）
- 其他自定义字段

复制数据库 ID 到 `.env`：

```
NOTION_DATABASE_ID=xxxxx
```

---

## 🔑 第三步：配置 Notion API

1. 访问 https://www.notion.so/my-integrations
2. 创建新的 Integration
3. 复制 API Key 到 `.env`：

```
NOTION_API_KEY=ntn_xxxxx
```

4. 在 Notion 中，将两个数据库共享给你的 Integration

---

## 🌐 第四步：安装 Chrome 扩展

### 4.1 加载扩展

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `chrome-extension` 文件夹

### 4.2 配置扩展

1. 右键扩展图标 → 选项
2. 填入配置信息：
   - Notion API Key
   - 收集箱数据库 ID
   - Mac 服务器地址（如 `http://192.168.1.100:3000`）
   - 处理模式（推荐：定时处理）
3. 点击"保存配置"（自动同步到所有设备）
4. 点击"测试连接"确认配置正确

### 4.3 自定义快捷键（可选）

1. 访问 `chrome://extensions/shortcuts`
2. 找到"微信文章 URL 收集器"
3. 设置你喜欢的快捷键（默认：Ctrl+Shift+S）

---

## 🖥️ 第五步：启动 Mac 管理面板

```bash
npm run dashboard
```

访问：**http://localhost:3000**

### 管理面板功能

- **系统状态**：实时显示待处理/已完成数量
- **快速操作**：启动/停止服务器、立即处理
- **配置管理**：可视化配置所有参数
- **实时日志**：查看所有操作记录

---

## 🚀 第六步：开始使用

### 方式1：手动收集（推荐）

1. **浏览微信文章**
   - 在 Chrome 中打开任意微信公众号文章

2. **保存链接**
   - 点击扩展图标，或按快捷键（Ctrl+Shift+S）
   - 看到"✅ 已保存到 Notion"提示

3. **自动处理**
   - 如果选择"立即处理"模式，Mac 服务器会自动开始抓取
   - 如果选择"定时处理"模式，等待每天凌晨 2 点自动处理

### 方式2：批量导入

如果你已经有一批 URL：

1. 创建 `urls.txt` 文件，每行一个链接
2. 运行：`npm run batch-file urls.txt`

---

## ⏰ 第七步：设置定时任务（可选）

### macOS/Linux

```bash
# 编辑 crontab
crontab -e

# 添加每天凌晨 2 点执行
0 2 * * * cd /path/to/wechat-notion-exporter && npm run daily >> logs/daily.log 2>&1
```

### Windows

1. 打开"任务计划程序"
2. 创建基本任务
3. 触发器：每天凌晨 2:00
4. 操作：启动程序 `npm run daily`

---

## 📊 工作流程图

```
Windows/Mac Chrome 浏览文章
    ↓
点击扩展图标（Ctrl+Shift+S）
    ↓
自动保存到 Notion 收集箱
    ↓
Mac 服务器定时/立即处理
    ↓
自动抓取文章内容 + 图片
    ↓
导入目标 Notion 数据库
    ↓
更新状态为"已完成" + 清理缓存
```

---

## 🛠️ 常用命令

```bash
# 启动管理面板
npm run dashboard

# 手动处理任务
npm run daily

# 测试单篇文章
npm run test "微信文章URL"

# 批量导入
npm run batch-file urls.txt

# 创建数据库
npm run setup-db <父页面ID>
```

---

## ❓ 常见问题

### Q1: Chrome 扩展提示"请先配置 Notion API"
**A:** 右键扩展图标 → 选项 → 填入配置 → 保存

### Q2: 图片无法显示
**A:** 微信图片有防盗链，系统会自动处理。如果仍有问题，检查 Notion API 权限

### Q3: 跨设备配置不同步
**A:** 确保在同一个 Chrome 账号下登录，配置会自动同步

### Q4: Mac 服务器无法连接
**A:** 检查防火墙设置，确保端口 3000 开放

### Q5: 处理失败
**A:** 查看管理面板的实时日志，或运行 `npm run daily` 查看详细错误

---

## 🎯 最佳实践

1. **配置一次，全设备使用** - Chrome 配置会自动同步
2. **选择定时处理** - 避免频繁触发，节省资源
3. **定期查看日志** - 及时发现和解决问题
4. **备份配置** - 保存 `.env` 文件副本

---

## 📞 技术支持

- GitHub: https://github.com/PaceZhou/wechat-notion-exporter
- Issues: 提交问题和建议

---

**祝使用愉快！** 🎉



