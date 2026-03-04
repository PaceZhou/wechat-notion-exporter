// 后台脚本 - 处理快捷键直接保存
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'save-direct') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    let config = await chrome.storage.local.get(['serverUrl']);
    if (!config.serverUrl) {
      config = await chrome.storage.sync.get(['serverUrl']);
    }
    
    if (!config.serverUrl) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: '微信文章收集器',
        message: '❌ 请先配置服务器地址',
        priority: 2
      });
      chrome.runtime.openOptionsPage();
      return;
    }
    
    try {
      const response = await fetch(`${config.serverUrl}/api/save-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: tab.title, url: tab.url })
      });
      
      const result = await response.json();
      
      if (result.success) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon.png',
          title: '微信文章收集器',
          message: '✅ 已成功保存到 Notion',
          priority: 2
        });
        
        chrome.tabs.sendMessage(tab.id, {
          action: 'showNotification',
          message: '✅ 已成功保存到 Notion',
          type: 'success'
        }).catch(() => {});
      } else {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon.png',
          title: '微信文章收集器',
          message: '❌ ' + result.error,
          priority: 2
        });
        
        chrome.tabs.sendMessage(tab.id, {
          action: 'showNotification',
          message: '❌ ' + result.error,
          type: 'error'
        }).catch(() => {});
      }
    } catch (error) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: '微信文章收集器',
        message: '❌ 连接服务器失败',
        priority: 2
      });
    }
  }
});

// 处理阅读模式快捷键
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-reading-mode') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'toggle-reading-mode' }).catch(() => {});
  }
});
