import { chromium, Browser, Page } from 'playwright';

export async function resolveWeChatUrl(sogouUrl: string): Promise<string> {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });
  
  try {
    console.log('   访问搜狗链接...');
    await page.goto(sogouUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    
    // 检测并等待验证码
    for (let i = 0; i < 3; i++) {
      const hasVerify = await page.evaluate(() => {
        return document.body.innerText.includes('验证') || 
               document.querySelector('#seccodeImage') !== null ||
               document.querySelector('.verify') !== null;
      });
      
      if (hasVerify) {
        console.log(`   ⚠️  检测到验证码 (尝试 ${i+1}/3)，等待90秒手动处理...`);
        await page.waitForTimeout(90000);
      } else {
        break;
      }
    }
    
    // 等待跳转到微信（增加超时时间）
    console.log('   等待跳转到微信...');
    
    try {
      await page.waitForFunction(() => {
        return window.location.href.includes('mp.weixin.qq.com');
      }, { timeout: 45000 });
      
      const finalUrl = page.url();
      await browser.close();
      return finalUrl;
      
    } catch (e) {
      // 如果没有自动跳转，尝试点击链接
      const currentUrl = page.url();
      if (currentUrl.includes('mp.weixin.qq.com')) {
        await browser.close();
        return currentUrl;
      }
      throw new Error('跳转超时');
    }
    
  } catch (error) {
    await browser.close();
    throw new Error('无法解析微信链接');
  }
}

