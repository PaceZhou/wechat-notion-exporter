import 'dotenv/config';
import { Client } from '@notionhq/client';
import { WeChatScraperV2 } from './src/core/wechat-scraper-v2';
import { NotionExporterV2 } from './src/exporters/notion-exporter-v2';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const COLLECTION_DB_ID = process.env.COLLECTION_DATABASE_ID || '';
const TARGET_DB_ID = process.env.NOTION_DATABASE_ID || '';

async function dailyTask() {
  console.log('🚀 开始每日自动处理任务...\n');
  
  // 1. 查询待处理的 URL
  const response = await notion.databases.query({
    database_id: COLLECTION_DB_ID,
    filter: {
      property: '状态',
      select: { equals: '待处理' }
    }
  });
  
  console.log(`📋 找到 ${response.results.length} 条待处理 URL\n`);
  
  if (response.results.length === 0) {
    console.log('✅ 没有待处理的 URL');
    return;
  }
  
  const scraper = new WeChatScraperV2();
  const exporter = new NotionExporterV2(process.env.NOTION_API_KEY!);
  
  // 2. 逐个处理
  for (const page of response.results) {
    if (!('properties' in page)) continue;
    
    const pageId = page.id;
    const url = (page.properties.URL as any).url;
    const title = (page.properties.Name as any)?.title?.[0]?.plain_text || '';
    
    console.log(`[处理] ${title}`);
    
    try {
      // 更新状态为"处理中"
      await notion.pages.update({
        page_id: pageId,
        properties: { 状态: { select: { name: '处理中' } } }
      });
      
      // 抓取文章
      const article = await scraper.scrape(url);
      await exporter.export(article, TARGET_DB_ID);
      
      // 更新状态为"已完成"
      await notion.pages.update({
        page_id: pageId,
        properties: { 
          状态: { select: { name: '已完成' } },
          处理时间: { date: { start: new Date().toISOString() } }
        }
      });
      
      console.log(`✅ 成功 - 图片: ${article.images.length} 张\n`);
      
      // 清理缓存和临时文件
      await cleanupCache();
      
    } catch (error: any) {
      await notion.pages.update({
        page_id: pageId,
        properties: { 状态: { select: { name: '失败' } } }
      });
      console.log(`❌ 失败: ${error.message}\n`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('🎉 每日任务完成！');
}

async function cleanupCache() {
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    // 清理浏览器缓存目录
    const cacheDir = path.join(__dirname, '.cache');
    await fs.rm(cacheDir, { recursive: true, force: true });
    
    // 清理临时下载文件
    const tempDir = path.join(__dirname, 'temp');
    await fs.rm(tempDir, { recursive: true, force: true });
    
    console.log('🧹 缓存已清理');
  } catch (error: any) {
    console.log('⚠️  清理缓存失败:', error.message);
  }
}

dailyTask().catch(console.error);

