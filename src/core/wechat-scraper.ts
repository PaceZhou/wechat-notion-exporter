import puppeteer from 'puppeteer';

export interface ImageInfo {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface WeChatArticle {
  title: string;
  author: string;
  content: string;
  images: ImageInfo[];
  originalUrl: string;
  publishDate: string;
}

export class WeChatScraper {
  async scrape(url: string): Promise<WeChatArticle> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // 设置用户代理绕过简单检测
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // 滚动到底部加载所有图片
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(3000);
      
      // 提取文章信息
      const article = await page.evaluate((inputUrl: string) => {
        const title = document.querySelector('h1')?.textContent || '';
        const author = document.querySelector('#meta_content')?.textContent || '';
        const publishDate = document.querySelector('#publish_time')?.textContent || '';
        const content = document.querySelector('#js_content')?.innerHTML || '';
        
        // 提取真实图片地址
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
        
        return { 
          title, 
          author, 
          content, 
          images,
          originalUrl: inputUrl,
          publishDate
        };
      }, url);
      
      return article;
    } finally {
      await browser.close();
    }
  }
}