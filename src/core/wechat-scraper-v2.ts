import { chromium, Browser } from 'playwright';
import { WeChatArticle, ImageInfo } from '../types';

export class WeChatScraperV2 {
  private browser: Browser | null = null;
  
  async scrape(url: string): Promise<WeChatArticle> {
    try {
      this.browser = await chromium.launch({
        headless: false, // 显示浏览器避免检测
        args: [
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage'
        ]
      });
      
      const context = await this.browser.newContext({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
        viewport: { width: 375, height: 812 }
      });
      
      const page = await context.newPage();
      
      // 反检测脚本
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        (window as any).chrome = { runtime: {} };
      });
      
      console.log('🌐 访问文章...');
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      
      // 等待内容加载
      await page.waitForSelector('#js_content', { timeout: 30000 });
      
      // 滚动加载所有内容
      await this.scrollToBottom(page);
      
      // 提取数据
      const article = await page.evaluate(() => {
        const title = document.querySelector('#activity-name')?.textContent?.trim() || 
                     document.querySelector('h1')?.textContent?.trim() || 
                     'Unknown Title';
        
        const contentEl = document.querySelector('#js_content');
        if (!contentEl) throw new Error('无法找到文章内容');
        
        // 提取图片 - 多种策略
        const images: ImageInfo[] = [];
        const imgElements = contentEl.querySelectorAll('img');
        
        imgElements.forEach((img, idx) => {
          let src = img.getAttribute('data-src') || 
                   img.getAttribute('data-original-src') ||
                   img.getAttribute('data-s') ||
                   img.src;
          
          if (src && src.includes('mmbiz.qpic.cn')) {
            // 去除微信图片参数，获取原图
            src = src.split('?')[0] || src;
            images.push({ url: src, alt: img.alt || `image-${idx}` });
          }
        });
        
        // 清理内容：去除广告和无关元素
        const clonedContent = contentEl.cloneNode(true) as HTMLElement;
        clonedContent.querySelectorAll('.rich_media_extra, .qr_code_pc, script, style').forEach(el => el.remove());
        
        return {
          title,
          content: clonedContent.innerHTML,
          images
        };
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
      if (this.browser) await this.browser.close();
      throw error;
    }
  }
  
  private async scrollToBottom(page: any) {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
    await page.waitForTimeout(2000);
  }
}
