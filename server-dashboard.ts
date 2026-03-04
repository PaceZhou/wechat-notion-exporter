import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);
const app = express();
const PORT = 3000;

let serverProcess = null;
let config = {};

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
  } catch (error) {
    console.log('配置文件不存在，使用默认配置');
  }
}

// 保存配置
async function saveConfig(newConfig) {
  config = { ...config, ...newConfig };
  const content = Object.entries(config).map(([k, v]) => `${k}=${v}`).join('\n');
  await fs.writeFile('.env', content);
}

// API 端点
app.get('/api/config', (req, res) => {
  res.json(config);
});

app.post('/api/config', async (req, res) => {
  await saveConfig(req.body);
  res.json({ success: true });
});

app.get('/api/status', async (req, res) => {
  res.json({
    running: serverProcess !== null,
    pending: 0,
    processed: 0
  });
});

app.post('/api/server/start', (req, res) => {
  res.json({ message: '服务器已启动' });
});

app.post('/api/server/stop', (req, res) => {
  res.json({ message: '服务器已停止' });
});

app.post('/api/process/daily', async (req, res) => {
  execAsync('npm run daily').catch(console.error);
  res.json({ message: '处理任务已启动' });
});

loadConfig().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎨 管理界面: http://localhost:${PORT}`);
  });
});

