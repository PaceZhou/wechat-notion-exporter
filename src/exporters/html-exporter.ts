import fs from 'fs';
import path from 'path';

export interface HtmlExportConfig {
  outputPath: string;
  includeAssets: boolean;
}

export class HtmlExporter {
  private config: HtmlExportConfig;
  
  constructor(config: HtmlExportConfig) {
    this.config = config;
    // 确保输出目录存在
    if (!fs.existsSync(config.outputPath)) {
      fs.mkdirSync(config.outputPath, { recursive: true });
    }
  }
  
  async export(article: any): Promise<string> {
    const htmlContent = `
<!DOCTYPE html>
<html>
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
        img { 
            max-width: 100%; 
            height: auto; 
            display: block; 
            margin: 20px 0;
        }
        h1 { color: #333; }
        p { margin: 16px 0; }
    </style>
</head>
<body>
    <h1>${article.title}</h1>
    ${article.content}
</body>
</html>
    `;
    
    const filePath = path.join(this.config.outputPath, `${this.slugify(article.title)}.html`);
    fs.writeFileSync(filePath, htmlContent);
    
    return filePath;
  }
  
  private slugify(text: string): string {
    return text.toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}