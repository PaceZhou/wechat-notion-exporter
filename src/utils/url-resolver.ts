import { chromium, Browser } from 'playwright';

export async function resolveWeChatUrl(sogouUrl: string): Promise<string> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto(sogouUrl, { waitUntil: 'networkidle', timeout: 15000 });
    const finalUrl = page.url();
    await browser.close();
    
    if (finalUrl.includes('mp.weixin.qq.com')) {
      return finalUrl;
    }
    throw new Error('无法解析微信链接');
  } catch (error) {
    await browser.close();
    throw error;
  }
}
