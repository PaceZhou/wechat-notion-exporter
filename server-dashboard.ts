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

// 添加 CORS 头支持 Chrome 扩展
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

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

// 格式化 Notion ID
function formatNotionId(id: string): string {
  if (!id) return id;
  const clean = id.replace(/-/g, '');
  if (clean.length === 32) {
    return `${clean.slice(0,8)}-${clean.slice(8,12)}-${clean.slice(12,16)}-${clean.slice(16,20)}-${clean.slice(20)}`;
  }
  return id;
}

// API 路由
app.get('/api/config', (req, res) => {
  res.json(config);
});

app.post('/api/config', async (req, res) => {
  try {
    const newConfig = req.body;
    if (newConfig.COLLECTION_DATABASE_ID) {
      newConfig.COLLECTION_DATABASE_ID = formatNotionId(newConfig.COLLECTION_DATABASE_ID);
    }
    if (newConfig.NOTION_DATABASE_ID) {
      newConfig.NOTION_DATABASE_ID = formatNotionId(newConfig.NOTION_DATABASE_ID);
    }
    await saveConfig(newConfig);
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
      database_id: formatNotionId(config.COLLECTION_DATABASE_ID),
      filter: { property: '状态', select: { equals: '待处理' } }
    });
    
    const processed = await notion.databases.query({
      database_id: formatNotionId(config.COLLECTION_DATABASE_ID),
      filter: { property: '状态', select: { equals: '已完成' } }
    });
    
    res.json({
      running: serverProcess !== null,
      pending: pending.results.length,
      processed: processed.results.length
    });
  } catch (error: any) {
    res.json({ running: false, pending: 0, processed: 0 });
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
    
    await notion.users.me();
    
    const results = { apiKey: true, collection: false, target: false };
    
    if (config.COLLECTION_DATABASE_ID) {
      try {
        const dbId = formatNotionId(config.COLLECTION_DATABASE_ID);
        await notion.databases.retrieve({ database_id: dbId });
        results.collection = true;
      } catch (e) {}
    }
    
    if (config.NOTION_DATABASE_ID) {
      try {
        const dbId = formatNotionId(config.NOTION_DATABASE_ID);
        await notion.databases.retrieve({ database_id: dbId });
        results.target = true;
      } catch (e) {}
    }
    
    res.json({ success: true, results });
  } catch (error: any) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/config-collection-db', async (req, res) => {
  try {
    if (!config.NOTION_API_KEY || !config.COLLECTION_DATABASE_ID) {
      return res.json({ success: false, error: '请先配置 Notion API Key 和收集箱数据库 ID' });
    }
    
    const { Client } = require('@notionhq/client');
    const notion = new Client({ auth: config.NOTION_API_KEY });
    
    await notion.databases.update({
      database_id: formatNotionId(config.COLLECTION_DATABASE_ID),
      properties: {
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
    
    res.json({ success: true, message: '数据库结构配置成功！' });
  } catch (error: any) {
    console.error('配置数据库失败:', error);
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
