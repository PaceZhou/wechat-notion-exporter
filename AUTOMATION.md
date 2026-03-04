# 自动化工作流配置指南

## 架构说明

```
Chrome 扩展 → Notion 收集箱 → 定时任务 → 自动抓取 → 目标数据库
```

## 配置步骤

### 1. 创建 Notion 收集箱数据库

```bash
# 运行设置脚本（需要提供父页面 ID）
npm run setup-db <父页面ID>

# 复制输出的数据库 ID 到 .env
COLLECTION_DATABASE_ID=xxxxx
```

### 2. 配置 Chrome 扩展

编辑 `chrome-extension/popup-notion.js`：
- 将 `COLLECTION_DB_ID` 替换为实际的收集箱数据库 ID

### 3. 设置定时任务

**macOS/Linux (crontab):**
```bash
# 每天凌晨 2 点执行
0 2 * * * cd /path/to/wechat-notion-exporter && npm run daily >> logs/daily.log 2>&1
```

**Windows (任务计划程序):**
- 创建基本任务
- 触发器：每天凌晨 2:00
- 操作：启动程序 `npm run daily`

### 4. 手动测试

```bash
npm run daily
```

## 使用流程

1. 浏览微信文章
2. 点击扩展图标 → 自动保存到 Notion 收集箱
3. 定时任务自动处理 → 抓取并导入目标数据库
4. 状态自动更新为"已完成"

## 数据库字段说明

- **标题**: 文章标题
- **URL**: 微信文章链接
- **状态**: 待处理/处理中/已完成/失败
- **添加时间**: 自动记录
- **处理时间**: 完成时自动填充
