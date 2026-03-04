import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 健康检查
app.get('/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 立即处理请求
app.post('/process', async (req, res) => {
  const { url } = req.body;
  
  console.log(`[立即处理] ${url}`);
  
  try {
    // 异步执行处理任务
    execAsync(`npm run daily`).catch(console.error);
    res.json({ status: 'processing', url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 处理服务器运行在 http://0.0.0.0:${PORT}`);
});
