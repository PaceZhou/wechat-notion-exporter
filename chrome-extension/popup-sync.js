// 创建通知
function showNotification(message, type = 'success') {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: '微信文章收集器',
    message: message,
    priority: 2
  });
}

document.getElementById('save').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // 优先从 local 获取配置
  let config = await chrome.storage.local.get(['notionApiKey', 'collectionDbId', 'serverUrl', 'processMode']);
  if (!config.serverUrl) {
    config = await chrome.storage.sync.get(['notionApiKey', 'collectionDbId', 'serverUrl', 'processMode']);
  }
  
  if (!config.serverUrl) {
    document.getElementById('status').textContent = '❌ 请先配置服务器地址';
    showNotification('请先配置服务器地址', 'error');
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
      showNotification('✅ 已成功保存到 Notion', 'success');
      
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
      showNotification('❌ ' + result.error, 'error');
    }
    
  } catch (error) {
    document.getElementById('status').textContent = '❌ 连接失败';
    showNotification('❌ 连接服务器失败', 'error');
  }
  
  setTimeout(() => window.close(), 1500);
});
