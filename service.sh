#!/bin/bash

# 微信文章收集系统 - 服务管理脚本

case "$1" in
  start)
    echo "🚀 启动服务..."
    npm run dashboard > logs/dashboard.log 2>&1 &
    echo $! > .dashboard.pid
    echo "✅ 服务已启动 (PID: $(cat .dashboard.pid))"
    ;;
  stop)
    if [ -f .dashboard.pid ]; then
      PID=$(cat .dashboard.pid)
      echo "⏹ 停止服务 (PID: $PID)..."
      kill $PID 2>/dev/null
      rm .dashboard.pid
      echo "✅ 服务已停止"
    else
      echo "⚠️  服务未运行"
    fi
    ;;
  restart)
    $0 stop
    sleep 2
    $0 start
    ;;
  status)
    if [ -f .dashboard.pid ]; then
      PID=$(cat .dashboard.pid)
      if ps -p $PID > /dev/null; then
        echo "✅ 服务运行中 (PID: $PID)"
      else
        echo "❌ 服务已停止"
        rm .dashboard.pid
      fi
    else
      echo "❌ 服务未运行"
    fi
    ;;
  *)
    echo "用法: $0 {start|stop|restart|status}"
    exit 1
    ;;
esac
