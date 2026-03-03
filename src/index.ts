import 'dotenv/config';
import { WeChatScraper } from './core/wechat-scraper';
import { NotionExporter } from './exporters/notion-exporter';
import { HtmlExporter } from './exporters/html-exporter';
import { Logger } from './utils/logger';

async function main() {
  await Logger.init();
  
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: npm run start <wechat-article-url>');
    process.exit(1);
  }
  
  try {
    console.log('🚀 Starting WeChat article export...');
    console.log('URL:', url);
    
    // 验证环境变量
    const notionApiKey = process.env.NOTION_API_KEY;
    const notionDatabaseId = process.env.NOTION_DATABASE_ID;
    
    if (!notionApiKey || !notionDatabaseId) {
      console.error('❌ Missing NOTION_API_KEY or NOTION_DATABASE_ID in .env file');
      process.exit(1);
    }
    
    // 抓取文章
    console.log('🔍 Scraping article content...');
    const scraper = new WeChatScraper();
    const article = await scraper.scrape(url);
    
    console.log('✅ Article scraped successfully!');
    console.log('Title:', article.title);
    console.log('Images found:', article.images.length);
    
    // 导出到 Notion
    console.log('📤 Exporting to Notion...');
    const notionExporter = new NotionExporter(notionApiKey);
    const notionPageId = await notionExporter.export(article, notionDatabaseId);
    console.log('✅ Notion page created:', notionPageId);
    
    // 导出到 HTML
    console.log('📄 Exporting to HTML...');
    const htmlExporter = new HtmlExporter('./output');
    const htmlPath = await htmlExporter.export(article);
    console.log('✅ HTML file saved:', htmlPath);
    
    console.log('🎉 All exports completed successfully!');
    
  } catch (error: any) {
    console.error('❌ Export failed:', error.message);
    await Logger.logError(error, `npm run start "${url}"`);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main().catch(console.error);