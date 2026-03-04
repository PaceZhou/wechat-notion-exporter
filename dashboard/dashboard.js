let serverProcess = null;

// 加载配置
async function loadConfig() {
  const response = await fetch('/api/config');
  const config = await response.json();
  document.getElementById('notionApiKey').value = config.notionApiKey || '';
  document.getElementById('collectionDbId').value = config.collectionDbId || '';
  document.getElementById('targetDbId').value = config.targetDbId || '';
  document.getElementById('serverPort').value = config.serverPort || 3000;
}

// 保存配置
async function saveConfig() {
  const config = {
    notionApiKey: document.getElementById('notionApiKey').value,
    collectionDbId: document.getElementById('collectionDbId').value,
    targetDbId: document.getElementById('targetDbId').value,
    serverPort: document.getElementById('serverPort').value
  };
  
  await fetch('/api/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  
  addLog('✅ 配置已保存');
}

// 启动服务器
async function startServer() {
  const response = await fetch('/api/server/start', { method: 'POST' });
  const result = await response.json();
  addLog('🚀 ' + result.message);
  updateStatus();
}

// 停止服务器
async function stopServer() {
  const response = await fetch('/api/server/stop', { method: 'POST' });
  const result = await response.json();
  addLog('⏹ ' + result.message);
  updateStatus();
}

// 立即处理
async function runDaily() {
  addLog('▶️ 开始处理任务...');
  const response = await fetch('/api/process/daily', { method: 'POST' });
  const result = await response.json();
  addLog('✅ ' + result.message);
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
  document.getElementById('serverStatus').textContent = status.running ? '🟢' : '🔴';
  document.getElementById('pendingCount').textContent = status.pending || 0;
  document.getElementById('processedCount').textContent = status.processed || 0;
}

// 添加日志
function addLog(message) {
  const log = document.getElementById('logPanel');
  const time = new Date().toLocaleTimeString();
  log.innerHTML += `[${time}] ${message}\n`;
  log.scrollTop = log.scrollHeight;
}

// 测试 Notion 连接
async function testNotionConnection() {
  addLog('🔗 测试 Notion 连接...');
  try {
    const response = await fetch('/api/test-notion');
    const result = await response.json();
    if (result.success) {
      addLog('✅ Notion 连接成功');
    } else {
      addLog('❌ Notion 连接失败: ' + result.error);
    }
  } catch (error) {
    addLog('❌ 连接失败: ' + error.message);
  }
}

// 自动创建收集箱数据库
async function autoCreateCollectionDb() {
  addLog('🗄️ 正在自动创建收集箱数据库...');
  try {
    const response = await fetch('/api/create-collection-db', { method: 'POST' });
    const result = await response.json();
    if (result.success) {
      document.getElementById('collectionDbId').value = result.databaseId;
      addLog('✅ ' + result.message);
      addLog('📋 数据库 ID: ' + result.databaseId);
    } else {
      addLog('❌ 创建失败: ' + result.error);
    }
  } catch (error) {
    addLog('❌ 创建失败: ' + error.message);
  }
}

// 初始化
setInterval(updateStatus, 5000);
updateStatus();
loadConfig();

