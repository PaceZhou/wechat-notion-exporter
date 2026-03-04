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
      addLog('✅ 配置已保存');
      alert('✅ 配置保存成功！');
    } else {
      addLog('❌ 保存失败: ' + result.error);
      alert('❌ 保存失败: ' + result.error);
    }
  } catch (error) {
    addLog('❌ 保存失败: ' + error.message);
    alert('❌ 保存失败: ' + error.message);
  }
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
      alert('✅ Notion 连接成功！');
    } else {
      addLog('❌ Notion 连接失败: ' + result.error);
      alert('❌ Notion 连接失败: ' + result.error);
    }
  } catch (error) {
    addLog('❌ 连接失败: ' + error.message);
    alert('❌ 连接失败: ' + error.message);
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
      alert('✅ 收集箱数据库创建成功！\n数据库 ID: ' + result.databaseId);
    } else {
      addLog('❌ 创建失败: ' + result.error);
      alert('❌ 创建失败: ' + result.error);
    }
  } catch (error) {
    addLog('❌ 创建失败: ' + error.message);
    alert('❌ 创建失败: ' + error.message);
  }
}

// 初始化
setInterval(updateStatus, 5000);
updateStatus();
loadConfig();

