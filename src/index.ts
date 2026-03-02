import { WeChatScraper } from './core/wechat-scraper';
import { NotionExporter } from './exporters/notion-exporter';
import { HtmlExporter } from './exporters/html-exporter';

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: npm run start <wechat-article-url>');
    process.exit(1);
  }
  
  try {
    // 微信文章抓取
    const scraper = new WeChatScraper();
    const article = await scraper.scrape(url);
    console.log('✅ 文章抓取成功:', article.title);
    
    // Notion 导出
    if (process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID) {
      const notionExporter = new NotionExporter(process.env.NOTION_API_KEY);
      const notionPageId = await notionExporter.export(article, process.env.NOTION_DATABASE_ID);
      console.log('✅ Notion 导出完成:', notionPageId);
    }
    
    // HTML 导出
    const htmlExporter = new HtmlExporter('./output');
    const htmlPath = await htmlExporter.export(article);
    console.log('✅ HTML 导出完成:', htmlPath);
    
    console.log('🎉 所有导出任务完成！');
  } catch (error) {
    console.error('❌ 导出失败:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);