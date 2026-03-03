import fs from 'fs';
import path from 'path';
import { WeChatArticle } from '../types';

export class HtmlExporter {
  constructor(private outputPath: string) {
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
  }
  
  async export(article: WeChatArticle): Promise<string> {
    try {
      const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px; 
            line-height: 1.6;
        }
        h1 { color: #333; margin-bottom: 20px; }
        img { max-width: 100%; height: auto; margin: 20px 0; }
        p { margin: 10px 0; }
    </style>
</head>
<body>
    <h1>${article.title}</h1>
    ${article.content}
</body>
</html>
      `;
      
      const safeTitle = article.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const fileName = `${safeTitle}.html`;
      const filePath = path.join(this.outputPath, fileName);
      
      fs.writeFileSync(filePath, htmlContent.trim());
      
      return filePath;
      
    } catch (error) {
      console.error('❌ HTML export failed:', error);
      throw error;
    }
  }
}