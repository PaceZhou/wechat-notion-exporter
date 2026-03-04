// 配置管理
document.addEventListener('DOMContentLoaded', async () => {
  // 优先从 local 加载，fallback 到 sync
  let config = await chrome.storage.local.get([
    'notionApiKey', 'collectionDbId', 'serverUrl', 'processMode'
  ]);
  
  if (!config.serverUrl) {
    config = await chrome.storage.sync.get([
      'notionApiKey', 'collectionDbId', 'serverUrl', 'processMode'
    ]);
  }
  
  document.getElementById('notionApiKey').value = config.notionApiKey || '';
  document.getElementById('collectionDbId').value = config.collectionDbId || '';
  document.getElementById('serverUrl').value = config.serverUrl || '';
  document.getElementById('processMode').value = config.processMode || 'scheduled';
  
  // 保存配置
  document.getElementById('save').addEventListener('click', async () => {
    const serverUrl = document.getElementById('serverUrl').value.trim();
    const newConfig = {
      notionApiKey: document.getElementById('notionApiKey').value,
      collectionDbId: document.getElementById('collectionDbId').value,
      serverUrl: serverUrl.replace(/\/$/, ''), // 移除末尾斜杠
      processMode: document.getElementById('processMode').value
    };
    
    // 同时保存到 sync 和 local
    await chrome.storage.sync.set(newConfig);
    await chrome.storage.local.set(newConfig);
    showStatus('✅ 配置已保存并同步', 'success');
  });
  
  // 测试连接
  document.getElementById('test').addEventListener('click', async () => {
    const serverUrl = document.getElementById('serverUrl').value;
    if (!serverUrl) {
      showStatus('❌ 请先配置服务器地址', 'error');
      return;
    }
    
    try {
      const response = await fetch(`${serverUrl}/ping`);
      if (response.ok) {
        showStatus('✅ 服务器连接成功', 'success');
      } else {
        showStatus('❌ 服务器无响应', 'error');
      }
    } catch (error) {
      showStatus('❌ 无法连接到服务器', 'error');
    }
  });
  
  // 修改快捷键
  document.getElementById('changeShortcut').addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });
});

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = type;
  setTimeout(() => status.textContent = '', 3000);
}


// 检查扩展更新
document.getElementById('checkExtUpdate').addEventListener('click', async () => {
  try {
    const response = await fetch('https://raw.githubusercontent.com/PaceZhou/wechat-notion-exporter/main/chrome-extension/manifest.json');
    const remoteManifest = await response.json();
    const localVersion = chrome.runtime.getManifest().version;
    
    if (localVersion !== remoteManifest.version) {
      document.getElementById('extUpdateInfo').innerHTML = `
        <div style="color: green;">✨ 发现新版本: ${remoteManifest.version}</div>
        <div>请访问 GitHub 下载最新版本</div>
      `;
    } else {
      document.getElementById('extUpdateInfo').innerHTML = '<div style="color: #666;">✅ 已是最新版本</div>';
    }
  } catch (error) {
    document.getElementById('extUpdateInfo').innerHTML = '<div style="color: red;">❌ 检查失败</div>';
  }
});
