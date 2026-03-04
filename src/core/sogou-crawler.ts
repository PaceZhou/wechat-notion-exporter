import { chromium, Browser, Page } from 'playwright';

export interface ArticleListItem {
  title: string;
  url: string;
  date?: string;
  author?: string;
}

export class SogouWeChatCrawler {
  private browser: Browser | null = null;
  
  async searchArticles(keyword: string, maxPages: number = 1): Promise<ArticleListItem[]> {
    try {
      this.browser = await chromium.launch({
        headless: false,
        args: ['--disable-blink-features=AutomationControlled']
      });
      
      const context = await this.browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      });
      
      const page = await context.newPage();
      
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      });
      
      const articles: ArticleListItem[] = [];
      
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        console.log(`📄 抓取第 ${pageNum} 页...`);
        
        const url = `https://weixin.sogou.com/weixin?type=2&query=${encodeURIComponent(keyword)}&page=${pageNum}`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        await page.waitForTimeout(2000);
        
        const pageArticles = await page.evaluate(() => {
          const items: any[] = [];
          const results = document.querySelectorAll('.news-box .news-list li');
          
          results.forEach(item => {
            const link = item.querySelector('h3 a');
            const dateEl = item.querySelector('.s-p');
            
            if (link) {
              const href = link.getAttribute('href') || '';
              items.push({
                title: link.textContent?.trim() || '',
                url: href.startsWith('http') ? href : `https://weixin.sogou.com${href}`,
                date: dateEl?.textContent?.trim()
              });
            }
          });
          
          return items;
        });
        
        articles.push(...pageArticles);
        console.log(`✅ 第 ${pageNum} 页找到 ${pageArticles.length} 篇文章`);
        
        await page.waitForTimeout(3000);
      }
      
      await this.browser.close();
      this.browser = null;
      
      return articles;
      
    } catch (error) {
      if (this.browser) await this.browser.close();
      throw error;
    }
  }
}
