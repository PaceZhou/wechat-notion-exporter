let serverProcess = null;

// 加载配置
async function loadConfig() {
  const response = await fetch('/api/config');
  const config = await response.json();
  document.getElementById('notionApiKey').value = config.NOTION_API_KEY || '';
  document.getElementById('collectionDbId').value = config.COLLECTION_DATABASE_ID || '';
  document.getElementById('targetDbId').value = config.NOTION_DATABASE_ID || '';
  document.getElementById('serverPort').value = config.SERVER_PORT || 3000;
  document.getElementById('serverAddress').value = config.SERVER_ADDRESS || '';
}

// 保存配置
async function saveConfig() {
  const config = {
    notionApiKey: document.getElementById('notionApiKey').value,
    collectionDbId: document.getElementById('collectionDbId').value,
    targetDbId: document.getElementById('targetDbId').value,
    serverPort: document.getElementById('serverPort').value,
    serverAddress: document.getElementById('serverAddress').value
  };
  
  try {
    const response = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        NOTION_API_KEY: config.notionApiKey,
        COLLECTION_DATABASE_ID: config.collectionDbId,
        NOTION_DATABASE_ID: config.targetDbId,
        SERVER_PORT: config.serverPort,
        SERVER_ADDRESS: config.serverAddress
      })
    });
    
    const result = await response.json();
    if (result.success) {
      addLog('✅ 配置已保存', 'success');
      alert('✅ 配置保存成功！');
    } else {
      addLog('❌ 保存失败: ' + result.error, 'error');
      alert('❌ 保存失败: ' + result.error);
    }
  } catch (error) {
    addLog('❌ 保存失败: ' + error.message, 'error');
    alert('❌ 保存失败: ' + error.message);
  }
}

// 启动服务器
async function startServer() {
  const response = await fetch('/api/server/start', { method: 'POST' });
  const result = await response.json();
  addLog('🚀 ' + result.message, 'info');
  updateStatus();
}

// 停止服务器
async function stopServer() {
  const response = await fetch('/api/server/stop', { method: 'POST' });
  const result = await response.json();
  addLog('⏹ ' + result.message, 'warning');
  updateStatus();
}

// 立即处理
async function runDaily() {
  addLog('▶️ 开始处理任务...', 'info');
  const response = await fetch('/api/process/daily', { method: 'POST' });
  const result = await response.json();
  addLog('✅ ' + result.message, 'success');
}

// 切换配置面板
function openConfig() {
  const panel = document.getElementById('configPanel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  if (panel.style.display === 'block') loadConfig();
}

function toggleConfig() {
  openConfig();
}


// 更新状态
async function updateStatus() {
  const response = await fetch('/api/status');
  const status = await response.json();
  
  // 更新服务器状态（绿色=运行中，蓝色=工作中，红色=异常）
  const statusEl = document.getElementById('serverStatus');
  if (!status.running || status.state === 'error') {
    statusEl.textContent = '🔴';
    statusEl.style.color = '#f44336';
  } else if (status.state === 'working') {
    statusEl.textContent = '🔵';
    statusEl.style.color = '#2196F3';
  } else {
    statusEl.textContent = '🟢';
    statusEl.style.color = '#4CAF50';
  }
  
  document.getElementById('pendingCount').textContent = status.pending || 0;
  document.getElementById('processedCount').textContent = status.processed || 0;
}

// 添加日志
function addLog(message, type = 'info') {
  const log = document.getElementById('logPanel');
  const time = new Date().toLocaleTimeString();
  let color = '#00ff00'; // 默认绿色
  
  if (type === 'error') color = '#ff4444';
  else if (type === 'warning') color = '#ffaa00';
  else if (type === 'success') color = '#00ff00';
  else if (type === 'info') color = '#00aaff';
  
  log.innerHTML += `<span style="color: ${color}">[${time}] ${message}</span>\n`;
  log.scrollTop = log.scrollHeight;
}

// 测试 Notion 连接
async function testNotionConnection() {
  addLog('🔗 测试 Notion 连接...');
  try {
    const response = await fetch('/api/test-notion');
    const result = await response.json();
    if (result.success) {
      const r = result.results;
      let msg = '✅ API Key: 有效\n';
      msg += r.collection ? '✅ 收集箱数据库: 连接成功\n' : '⚠️  收集箱数据库: 未配置或无效\n';
      msg += r.target ? '✅ 目标数据库: 连接成功' : '⚠️  目标数据库: 未配置或无效';
      addLog(msg);
      alert(msg);
    } else {
      addLog('❌ Notion 连接失败: ' + result.error);
      alert('❌ Notion 连接失败: ' + result.error);
    }
  } catch (error) {
    addLog('❌ 连接失败: ' + error.message);
    alert('❌ 连接失败: ' + error.message);
  }
}

// 自动配置收集箱数据库结构
async function autoConfigCollectionDb() {
  addLog('⚙️ 正在配置数据库结构...');
  try {
    const response = await fetch('/api/config-collection-db', { method: 'POST' });
    const result = await response.json();
    if (result.success) {
      addLog('✅ ' + result.message);
      alert('✅ 数据库结构配置成功！');
    } else {
      addLog('❌ 配置失败: ' + result.error);
      alert('❌ 配置失败: ' + result.error);
    }
  } catch (error) {
    addLog('❌ 配置失败: ' + error.message);
    alert('❌ 配置失败: ' + error.message);
  }
}

// 初始化
setInterval(updateStatus, 5000);
updateStatus();
loadConfig();


// 检查更新
async function checkUpdate() {
  addLog('🔄 检查更新...', 'info');
  try {
    const response = await fetch('/api/version');
    const result = await response.json();
    
    document.getElementById('localVersion').textContent = result.local;
    
    if (result.hasUpdate) {
      const info = document.getElementById('updateInfo');
      info.innerHTML = `
        <div style="color: #4CAF50; font-weight: bold;">
          ✨ 发现新版本: ${result.remote}
        </div>
        <div style="margin-top: 10px;">
          <button class="btn-primary" onclick="updateSystem()">⬇️ 立即更新</button>
        </div>
      `;
      addLog('✨ 发现新版本: ' + result.remote, 'success');
    } else {
      document.getElementById('updateInfo').innerHTML = '<div style="color: #666;">✅ 已是最新版本</div>';
      addLog('✅ 已是最新版本', 'success');
    }
  } catch (error) {
    addLog('❌ 检查更新失败: ' + error.message, 'error');
  }
}

// 更新系统
function updateSystem() {
  addLog('📥 开始更新...', 'info');
  addLog('请在终端执行以下命令：', 'info');
  addLog('cd wechat-notion-exporter && git pull origin main', 'warning');
  alert('请在终端执行：\ncd wechat-notion-exporter && git pull origin main\n\n然后重启服务器');
}

// 页面加载时检查版本
checkUpdate();
