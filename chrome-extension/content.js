// 内容脚本 - 在网页上显示提示
function showPageNotification(message, type = 'success') {
  // 创建提示元素
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'};
    color: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
    font-size: 15px;
    font-weight: 600;
    z-index: 999999;
    animation: slideIn 0.3s ease, fadeOut 0.5s ease 2.5s;
  `;
  notification.textContent = message;
  
  // 添加动画样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(notification);
  
  // 3秒后移除
  setTimeout(() => {
    notification.remove();
    style.remove();
  }, 3000);
}

// 监听来自后台脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showNotification') {
    showPageNotification(request.message, request.type);
  }
});

// 阅读模式功能
let readingModeEnabled = false;
let currentTheme = 'light';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle-reading-mode') {
    toggleReadingMode();
  } else if (request.action === 'change-theme') {
    currentTheme = request.theme;
    if (readingModeEnabled) {
      applyReadingMode(currentTheme);
    }
  }
});

function toggleReadingMode() {
  readingModeEnabled = !readingModeEnabled;
  
  if (readingModeEnabled) {
    applyReadingMode(currentTheme);
    showReadingNotification('阅读模式已开启');
  } else {
    removeReadingMode();
    showReadingNotification('阅读模式已关闭');
  }
}

function applyReadingMode(theme) {
  const themes = {
    light: { bg: '#FAFAF8', text: '#1D1D1F', heading: '#000' },
    dark: { bg: '#1C1C1E', text: '#E5E5E7', heading: '#FFF' },
    sepia: { bg: '#F4ECD8', text: '#5B4636', heading: '#3E2723' }
  };
  
  const t = themes[theme];
  document.getElementById('reading-mode-style')?.remove();
  
  const style = document.createElement('style');
  style.id = 'reading-mode-style';
  style.textContent = `
    body { background: ${t.bg} !important; color: ${t.text} !important; padding: 40px 20px !important; }
    body > * { max-width: 680px !important; margin-left: auto !important; margin-right: auto !important; }
    h1, h2, h3 { color: ${t.heading} !important; }
    img { border-radius: 8px !important; max-width: 100% !important; }
    p { line-height: 1.8 !important; font-size: 18px !important; }
  `;
  document.head.appendChild(style);
}

function removeReadingMode() {
  document.getElementById('reading-mode-style')?.remove();
}

function showReadingNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 999999;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white; padding: 16px 24px; border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}
