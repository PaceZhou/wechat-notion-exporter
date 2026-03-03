import { chromium } from 'playwright';

export interface WeChatArticle {
  title: string;
  author: string;
  content: string;
  images: ImageInfo[];
  originalUrl: string;
  publishDate: string;
}

export interface ImageInfo {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export class WeChatScraperPlaywright {
  async scrape(url: string): Promise<WeChatArticle> {
    // 启动 Chromium 浏览器
    const browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      ]
    });

    try {
      const page = await browser.newPage();
      
      // 访问微信文章页面
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // 等待页面加载完成
      await page.waitForTimeout(3000);
      
      // 滚动到底部加载所有懒加载图片
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      // 等待图片加载
      await page.waitForTimeout(5000);
      
      // 提取文章信息
      const article = await page.evaluate(() => {
        const title = document.querySelector('h1')?.textContent || '';
        const content = document.querySelector('#js_content')?.innerHTML || '';
        
        // 提取真实图片地址 - 优先级: data-src > data-original > src
        const images: any[] = [];
        const imgElements = document.querySelectorAll('img');
        imgElements.forEach(img => {
          const realSrc = img.getAttribute('data-src') || 
                         img.getAttribute('data-original') || 
                         img.getAttribute('src');
          if (realSrc && !realSrc.includes('mmbiz.qpic.cn/mmbiz_gif')) {
            images.push({
              url: realSrc,
              alt: img.alt || ''
            });
          }
        });
        
        return { title, content, images };
      });
      
      return {
        title: article.title,
        author: '',
        content: article.content,
        images: article.images,
        originalUrl: url,
        publishDate: new Date().toISOString()
      };
      
    } finally {
      await browser.close();
    }
  }
}