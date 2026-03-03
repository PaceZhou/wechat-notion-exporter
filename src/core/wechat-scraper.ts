import { chromium, Browser, Page } from 'playwright';
import { WeChatArticle, ImageInfo } from '../types';

export class WeChatScraper {
  private browser: Browser | null = null;
  
  async scrape(url: string): Promise<WeChatArticle> {
    try {
      // 启动 Playwright 浏览器
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process'
        ]
      });
      
      const page = await this.browser.newPage();
      
      // 设置用户代理
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
      
      // 访问页面
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // 滚动到底部加载所有懒加载内容
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      // 等待图片加载
      await page.waitForTimeout(5000);
      
      // 提取文章信息
      const article = await page.evaluate(() => {
        const titleElement = document.querySelector('h1');
        const title = titleElement?.textContent?.trim() || 'Unknown Title';
        
        const contentElement = document.querySelector('#js_content');
        const content = contentElement?.innerHTML || '';
        
        // 提取真实图片地址
        const images: ImageInfo[] = [];
        const imgElements = document.querySelectorAll('img');
        
        imgElements.forEach((img, index) => {
          // 优先级: data-src > data-original > src
          let realSrc = img.getAttribute('data-src') || 
                       img.getAttribute('data-original') || 
                       img.getAttribute('src');
          
          // 过滤无效图片
          if (realSrc && !realSrc.includes('mmbiz.qpic.cn/mmbiz_gif')) {
            images.push({
              url: realSrc,
              alt: img.alt || `image-${index}`
            });
          }
        });
        
        return { title, content, images };
      });
      
      await this.browser.close();
      this.browser = null;
      
      return {
        ...article,
        originalUrl: url,
        author: 'DPH设计事务所',
        publishDate: new Date().toISOString()
      };
      
    } catch (error) {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      throw error;
    }
  }
}