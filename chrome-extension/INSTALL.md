# Chrome 扩展安装指南

## 方式1：直接加载（开发模式）

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `chrome-extension` 文件夹

## 方式2：下载 ZIP 包

1. 下载 `chrome-extension.zip`
2. 解压到任意位置
3. 按照方式1的步骤加载

## 配置扩展

1. 右键扩展图标 → 选项
2. 填入配置信息：
   - Notion API Key
   - 收集箱数据库 ID
   - Mac 服务器地址（如 `http://192.168.2.33:3000`）
   - 处理模式（推荐：定时处理）
3. 点击"保存配置"（自动同步到所有设备）

## 使用

- 点击扩展图标保存当前页面
- 或使用快捷键：Ctrl+Shift+S (Win) / Cmd+Shift+S (Mac)
