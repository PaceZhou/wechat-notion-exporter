// 后台脚本 - 处理快捷键直接保存
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'save-direct') {
    // 获取当前标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // 获取配置
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
      // 直接保存
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
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon.png',
          title: '微信文章收集器',
          message: '✅ 已成功保存到 Notion',
          priority: 2
        });
      } else {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon.png',
          title: '微信文章收集器',
          message: '❌ ' + result.error,
          priority: 2
        });
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
