import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);
const app = express();
const PORT = 3000;

let serverProcess: boolean | null = null;
let config: Record<string, string> = {};

app.use(cors());
app.use(express.json());
app.use(express.static('dashboard'));

// 加载配置
async function loadConfig() {
  try {
    const data = await fs.readFile('.env', 'utf-8');
    const lines = data.split('\n');
    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) config[key.trim()] = value.trim();
    });
    console.log('✅ 配置已加载');
  } catch (error) {
    console.log('⚠️  配置文件不存在，使用默认配置');
  }
}

// 保存配置
async function saveConfig(newConfig: Record<string, string>) {
  config = { ...config, ...newConfig };
  const content = Object.entries(config).map(([k, v]) => `${k}=${v}`).join('\n');
  await fs.writeFile('.env', content);
}

// API 路由
app.get('/api/config', (req, res) => {
  res.json(config);
});

app.post('/api/config', async (req, res) => {
  try {
    await saveConfig(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.json({ success: false, error: error.message });
  }
});

app.get('/api/status', async (req, res) => {
  try {
    if (!config.NOTION_API_KEY || !config.COLLECTION_DATABASE_ID) {
      return res.json({ running: false, pending: 0, processed: 0 });
    }
    
    const { Client } = require('@notionhq/client');
    const notion = new Client({ auth: config.NOTION_API_KEY });
    
    const pending = await notion.databases.query({
      database_id: config.COLLECTION_DATABASE_ID,
      filter: { property: '状态', select: { equals: '待处理' } }
    });
    
    const processed = await notion.databases.query({
      database_id: config.COLLECTION_DATABASE_ID,
      filter: { property: '状态', select: { equals: '已完成' } }
    });
    
    res.json({
      running: serverProcess !== null,
      pending: pending.results.length,
      processed: processed.results.length
    });
  } catch (error: any) {
    res.json({ running: false, pending: 0, processed: 0, error: error.message });
  }
});

app.post('/api/server/start', (req, res) => {
  serverProcess = true;
  res.json({ success: true, message: '服务器已启动' });
});

app.post('/api/server/stop', (req, res) => {
  serverProcess = null;
  res.json({ success: true, message: '服务器已停止' });
});

app.post('/api/process/daily', async (req, res) => {
  try {
    execAsync('npm run daily').catch(console.error);
    res.json({ success: true, message: '处理任务已启动' });
  } catch (error: any) {
    res.json({ success: false, message: error.message });
  }
});

app.get('/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/test-notion', async (req, res) => {
  try {
    if (!config.NOTION_API_KEY) {
      return res.json({ success: false, error: '请先配置 Notion API Key' });
    }
    const { Client } = require('@notionhq/client');
    const notion = new Client({ auth: config.NOTION_API_KEY });
    
    // 测试 API Key
    await notion.users.me();
    
    const results = { apiKey: true, collection: false, target: false };
    
    // 测试收集箱数据库
    if (config.COLLECTION_DATABASE_ID) {
      try {
        await notion.databases.retrieve({ database_id: config.COLLECTION_DATABASE_ID });
        results.collection = true;
      } catch (e) {}
    }
    
    // 测试目标数据库
    if (config.NOTION_DATABASE_ID) {
      try {
        await notion.databases.retrieve({ database_id: config.NOTION_DATABASE_ID });
        results.target = true;
      } catch (e) {}
    }
    
    res.json({ success: true, results });
  } catch (error: any) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/create-collection-db', async (req, res) => {
  try {
    if (!config.NOTION_API_KEY || !config.NOTION_DATABASE_ID) {
      return res.json({ success: false, error: '请先配置 Notion API Key 和目标数据库 ID' });
    }
    
    const { Client } = require('@notionhq/client');
    const notion = new Client({ auth: config.NOTION_API_KEY });
    
    // 获取目标数据库的父页面
    const targetDb = await notion.databases.retrieve({ database_id: config.NOTION_DATABASE_ID });
    const parentPageId = targetDb.parent.type === 'page_id' ? targetDb.parent.page_id : null;
    
    if (!parentPageId) {
      return res.json({ success: false, error: '无法获取父页面 ID' });
    }
    
    // 创建收集箱数据库
    const database = await notion.databases.create({
      parent: { page_id: parentPageId },
      title: [{ text: { content: '微信文章收集箱' } }],
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
    
    // 自动保存到配置
    await saveConfig({ COLLECTION_DATABASE_ID: database.id });
    
    res.json({ 
      success: true, 
      databaseId: database.id,
      message: '收集箱数据库创建成功！'
    });
  } catch (error: any) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/config-collection-db', async (req, res) => {
  try {
    if (!config.NOTION_API_KEY || !config.COLLECTION_DATABASE_ID) {
      return res.json({ success: false, error: '请先配置 Notion API Key 和收集箱数据库 ID' });
    }




loadConfig().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 管理面板启动成功！');
    console.log(`📡 访问地址: http://localhost:${PORT}`);
    console.log('⚙️  首次使用请点击"配置"按钮进行设置');
  });
});
    
    const { Client } = require('@notionhq/client');
    const notion = new Client({ auth: config.NOTION_API_KEY });
    
    // 更新数据库属性
    await notion.databases.update({
      database_id: config.COLLECTION_DATABASE_ID,
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
    
    res.json({ 
      success: true,
      message: '数据库结构配置成功！'
    });
  } catch (error: any) {
    res.json({ success: false, error: error.message });
  }
});

loadConfig().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 管理面板启动成功！');
    console.log(`📡 访问地址: http://localhost:${PORT}`);
    console.log('⚙️  首次使用请点击"配置"按钮进行设置');
  });
});
