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
      
      // 设置用户代理和反检测
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      });
      
      // 访问页面
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // 滚动到底部加载所有懒加载内容
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      // 等待所有图片加载完成
      await page.waitForFunction(() => {
        const images = document.querySelectorAll('img');
        return Array.from(images).every(img => img.complete);
      }, { timeout: 60000 });
      
      // 提取文章信息
      const article = await page.evaluate(() => {
        const titleElement = document.querySelector('h1');
        const title = titleElement?.textContent?.trim() || 'Unknown Title';
        
        const contentElement = document.querySelector('#js_content');
        const content = contentElement?.innerHTML || '';
        
        // 提取真实图片地址 - 优先级: data-src > data-original > src
        const images: ImageInfo[] = [];
        const imgElements = document.querySelectorAll('img');
        
        imgElements.forEach((img, index) => {
          let realSrc = img.getAttribute('data-src') || 
                       img.getAttribute('data-original') || 
                       img.src;
          
          // 过滤有效的微信图片
          if (realSrc && realSrc.includes('mmbiz.qpic.cn')) {
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