import 'dotenv/config';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function createCollectionDatabase() {
  // 需要一个父页面 ID
  const parentPageId = process.argv[2];
  
  if (!parentPageId) {
    console.error('用法: npm run setup-db <父页面ID>');
    process.exit(1);
  }
  
  const database = await notion.databases.create({
    parent: { page_id: parentPageId },
    title: [{ text: { content: 'URL 收集箱' } }],
    properties: {
      标题: { title: {} },
      URL: { url: {} },
      状态: { 
        select: { 
          options: [
            { name: '待处理', color: 'yellow' },
            { name: '处理中', color: 'blue' },
            { name: '已完成', color: 'green' },
            { name: '失败', color: 'red' }
          ]
        }
      },
      添加时间: { created_time: {} },
      处理时间: { date: {} }
    }
  });
  
  console.log('✅ 数据库创建成功！');
  console.log('数据库 ID:', database.id);
  console.log('请将此 ID 添加到 .env 文件：');
  console.log(`COLLECTION_DATABASE_ID=${database.id}`);
}

createCollectionDatabase();
