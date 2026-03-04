import 'dotenv/config';
import { WeChatScraperV2 } from './src/core/wechat-scraper-v2';
import { NotionExporterV2 } from './src/exporters/notion-exporter-v2';
import * as fs from 'fs';

async function batchFromFile() {
  const filePath = process.argv[2] || 'urls.txt';
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ 文件不存在: ${filePath}`);
    console.log('用法: npm run batch-file urls.txt');
    process.exit(1);
  }
  
  const urls = fs.readFileSync(filePath, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && line.startsWith('http'));
  
  console.log(`🚀 开始批量导入 ${urls.length} 篇文章\n`);
  
  const scraper = new WeChatScraperV2();
  const exporter = new NotionExporterV2(process.env.NOTION_API_KEY!);
  const results = [];
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`[${i + 1}/${urls.length}] ${url}`);
    
    try {
      const article = await scraper.scrape(url);
      const pageId = await exporter.export(article, process.env.NOTION_DATABASE_ID!);
      results.push({ success: true, title: article.title, pageId });
      console.log(`✅ ${article.title}`);
      console.log(`   图片: ${article.images.length} 张\n`);
    } catch (error: any) {
      results.push({ success: false, url, error: error.message });
      console.log(`❌ 失败: ${error.message}\n`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n📊 批量导入完成！');
  console.log(`成功: ${results.filter(r => r.success).length} 篇`);
  console.log(`失败: ${results.filter(r => !r.success).length} 篇`);
}

batchFromFile();
