document.getElementById('save').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;
  const title = tab.title;
  
  // 创建文本内容
  const content = `${url}\n`;
  const blob = new Blob([content], { type: 'text/plain' });
  const blobUrl = URL.createObjectURL(blob);
  
  // 下载到 urls.txt
  chrome.downloads.download({
    url: blobUrl,
    filename: 'urls.txt',
    saveAs: false,
    conflictAction: 'uniquify'
  });
  
  document.getElementById('status').textContent = `✅ 已保存: ${title}`;
  setTimeout(() => window.close(), 1500);
});
