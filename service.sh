#!/bin/bash

# 微信文章收集系统 - 服务管理脚本

case "$1" in
  start)
    echo "🚀 启动服务..."
    echo "📡 访问: http://localhost:3000"
    echo "按 Ctrl+C 停止服务"
    npm run dashboard
    ;;
  stop)
    echo "⏹ 停止所有 dashboard 进程..."
    pkill -f "server-dashboard"
    echo "✅ 服务已停止"
    ;;
  status)
    if pgrep -f "server-dashboard" > /dev/null; then
      echo "✅ 服务运行中"
      echo "📡 访问: http://localhost:3000"
    else
      echo "❌ 服务未运行"
    fi
    ;;
  *)
    echo "用法: npm run service {start|stop|status}"
    exit 1
    ;;
esac
