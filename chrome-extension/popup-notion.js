// Chrome 扩展 - 直接保存到 Notion
const NOTION_API_KEY = 'YOUR_NOTION_API_KEY'; // 请替换为你的 API Key
const COLLECTION_DB_ID = 'YOUR_COLLECTION_DB_ID'; // 请替换为收集箱数据库 ID

document.getElementById('save').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: COLLECTION_DB_ID },
        properties: {
          URL: { url: tab.url },
          标题: { title: [{ text: { content: tab.title } }] },
          状态: { select: { name: '待处理' } }
        }
      })
    });
    
    if (response.ok) {
      document.getElementById('status').textContent = '✅ 已保存到 Notion';
    } else {
      throw new Error('保存失败');
    }
  } catch (error) {
    document.getElementById('status').textContent = '❌ ' + error.message;
  }
  
  setTimeout(() => window.close(), 1500);
});
