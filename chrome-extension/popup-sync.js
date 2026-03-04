document.getElementById('save').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // 获取同步配置
  const config = await chrome.storage.sync.get(['notionApiKey', 'collectionDbId', 'serverUrl', 'processMode']);
  
  if (!config.notionApiKey || !config.collectionDbId) {
    document.getElementById('status').textContent = '❌ 请先配置 Notion API';
    setTimeout(() => chrome.runtime.openOptionsPage(), 1000);
    return;
  }
  
  try {
    // 保存到 Notion
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.notionApiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: config.collectionDbId },
        properties: {
          标题: { title: [{ text: { content: tab.title } }] },
          URL: { url: tab.url },
          状态: { select: { name: '待处理' } }
        }
      })
    });
    
    if (!response.ok) throw new Error('保存失败');
    
    document.getElementById('status').textContent = '✅ 已保存到 Notion';
    
    // 如果配置了服务器且模式为立即处理，通知服务器
    if (config.serverUrl && config.processMode === 'immediate') {
      await fetch(`${config.serverUrl}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tab.url })
      });
      document.getElementById('status').textContent = '✅ 已保存并通知服务器处理';
    }
    
  } catch (error) {
    document.getElementById('status').textContent = '❌ ' + error.message;
  }
  
  setTimeout(() => window.close(), 1500);
});

