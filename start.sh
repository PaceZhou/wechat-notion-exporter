#!/bin/bash
# Mac 端一键启动脚本

echo "🚀 微信文章收集系统启动中..."

# 检查依赖
if ! command -v node &> /dev/null; then
    echo "❌ 未安装 Node.js"
    exit 1
fi

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 启动管理界面
echo "🎨 启动管理界面..."
npm run dashboard

echo "✅ 管理界面已启动: http://localhost:3000"
