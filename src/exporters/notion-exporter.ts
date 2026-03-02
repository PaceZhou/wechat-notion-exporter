import { Client } from '@notionhq/client';

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

export class NotionExporter {
  private notion: Client;
  
  constructor(apiKey: string) {
    this.notion = new Client({ auth: apiKey });
  }
  
  async export(article: WeChatArticle, databaseId: string): Promise<string> {
    // 创建页面
    const page = await this.notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: { title: [{ text: { content: article.title } }] },
        Date: { date: { start: new Date().toISOString().split('T')[0] } }
      }
    });
    
    // 转换内容为 Notion blocks
    const blocks = this.convertToNotionBlocks(article.content, article.images);
    
    // 添加内容到页面
    await this.notion.blocks.children.append({
      block_id: page.id,
      children: blocks
    });
    
    return page.id;
  }
  
  private convertToNotionBlocks(content: string, images: ImageInfo[]): any[] {
    const blocks: any[] = [];
    
    // 处理图片
    images.forEach(img => {
      blocks.push({
        type: "image",
        image: {
          type: "external",
          external: { url: img.url }
        }
      });
    });
    
    // 处理文字内容（简化版）
    const paragraphs = content.split('\n').filter(p => p.trim());
    paragraphs.forEach(paragraph => {
      if (paragraph.trim()) {
        blocks.push({
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: paragraph } }]
          }
        });
      }
    });
    
    return blocks;
  }
}