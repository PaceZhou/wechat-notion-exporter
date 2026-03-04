import 'dotenv/config';
import { WeChatScraperV2 } from './src/core/wechat-scraper-v2';
import { NotionExporterV2 } from './src/exporters/notion-exporter-v2';

async function test() {
  const url = process.argv[2];
  if (!url) {
    console.error('用法: npm run test <微信文章URL>');
    process.exit(1);
  }
  
  try {
    console.log('🚀 开始测试 V2 版本...');
    
    const scraper = new WeChatScraperV2();
    const article = await scraper.scrape(url);
    
    console.log('✅ 文章抓取成功!');
    console.log('标题:', article.title);
    console.log('图片数量:', article.images.length);
    
    const notionExporter = new NotionExporterV2(process.env.NOTION_API_KEY!);
    const pageId = await notionExporter.export(article, process.env.NOTION_DATABASE_ID!);
    
    console.log('✅ Notion 导出成功!');
    console.log('页面ID:', pageId);
    
  } catch (error: any) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

test();
