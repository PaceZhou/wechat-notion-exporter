document.getElementById('save').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // 优先从 local 获取配置
  let config = await chrome.storage.local.get(['notionApiKey', 'collectionDbId', 'serverUrl', 'processMode']);
  if (!config.serverUrl) {
    config = await chrome.storage.sync.get(['notionApiKey', 'collectionDbId', 'serverUrl', 'processMode']);
  }
  
  if (!config.serverUrl) {
    document.getElementById('status').textContent = '❌ 请先配置服务器地址';
    setTimeout(() => chrome.runtime.openOptionsPage(), 1000);
    return;
  }
  
  try {
    // 通过服务器保存到 Notion
    const response = await fetch(`${config.serverUrl}/api/save-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: tab.title,
        url: tab.url
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      document.getElementById('status').textContent = '✅ 已保存到 Notion';
      
      // 如果是立即处理模式，通知服务器
      if (config.processMode === 'immediate') {
        await fetch(`${config.serverUrl}/api/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: tab.url })
        });
      }
    } else {
      document.getElementById('status').textContent = '❌ ' + result.error;
    }
    
  } catch (error) {
    document.getElementById('status').textContent = '❌ 连接失败';
  }
  
  setTimeout(() => window.close(), 1500);
});
