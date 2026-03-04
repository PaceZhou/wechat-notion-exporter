import 'dotenv/config';
import { SogouWeChatCrawler } from './src/core/sogou-crawler';
import { WeChatScraperV2 } from './src/core/wechat-scraper-v2';
import { NotionExporterV2 } from './src/exporters/notion-exporter-v2';
import { resolveWeChatUrl } from './src/utils/url-resolver';

async function batchProcess() {
  const keyword = process.argv[2] || 'DPH设计事务所';
  const maxPages = parseInt(process.argv[3] || '1');
  
  console.log(`🚀 开始批量抓取: ${keyword}`);
  console.log(`📄 抓取页数: ${maxPages}`);
  
  try {
    // 1. 搜索文章列表
    console.log('\n📋 步骤1: 搜索文章列表...');
    const sogou = new SogouWeChatCrawler();
    const articles = await sogou.searchArticles(keyword, maxPages);
    console.log(`✅ 找到 ${articles.length} 篇文章\n`);
    
    if (articles.length === 0) {
      console.log('❌ 未找到文章');
      return;
    }
    
    // 2. 逐个抓取并导入
    console.log('📥 步骤2: 抓取文章内容并导入 Notion...\n');
    const scraper = new WeChatScraperV2();
    const exporter = new NotionExporterV2(process.env.NOTION_API_KEY!);
    
    const results = [];
    
    for (let i = 0; i < articles.length; i++) {
      const item = articles[i];
      console.log(`[${i + 1}/${articles.length}] ${item.title}`);
      
      try {
        console.log('🔗 解析真实链接...');
        const realUrl = await resolveWeChatUrl(item.url);
        console.log('✅ 链接解析成功');
        
        const article = await scraper.scrape(realUrl);
        const pageId = await exporter.export(article, process.env.NOTION_DATABASE_ID!);
        results.push({ success: true, title: item.title, pageId });
        console.log(`✅ 成功 - 图片: ${article.images.length} 张\n`);
      } catch (error: any) {
        results.push({ success: false, title: item.title, error: error.message });
        console.log(`❌ 失败: ${error.message}\n`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // 3. 生成报告
    console.log('\n📊 批量导入完成！');
    console.log(`成功: ${results.filter(r => r.success).length} 篇`);
    console.log(`失败: ${results.filter(r => !r.success).length} 篇`);
    
  } catch (error: any) {
    console.error('❌ 批量处理失败:', error.message);
    process.exit(1);
  }
}

batchProcess();

