import { Client } from '@notionhq/client';
import { WeChatArticle } from '../types';

export class NotionExporter {
  private notion: Client;
  
  constructor(apiKey: string) {
    this.notion = new Client({ auth: apiKey });
  }
  
  async export(article: WeChatArticle, databaseId: string): Promise<string> {
    try {
      // 创建 Notion 页面
      const page = await this.notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          Name: { 
            title: [{ 
              text: { content: article.title } 
            }] 
          },
          Date: { 
            date: { 
              start: new Date().toISOString().split('T')[0] 
            } 
          }
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
      
    } catch (error) {
      console.error('❌ Notion export failed:', error);
      throw error;
    }
  }
  
  private convertToNotionBlocks(content: string, images: any[]): any[] {
    const blocks: any[] = [];
    
    // 处理图片
    images.forEach(img => {
      if (img.url) {
        blocks.push({
          type: "image",
          image: {
            type: "external",
            external: { url: img.url }
          }
        });
      }
    });
    
    // 处理文字内容
    if (content) {
      const paragraphs = content.split('\n').filter(p => p.trim());
      paragraphs.forEach(paragraph => {
        if (paragraph.trim()) {
          blocks.push({
            type: "paragraph",
            paragraph: {
              rich_text: [{ 
                type: "text", 
                text: { content: paragraph.substring(0, 2000) } // Notion 限制
              }]
            }
          });
        }
      });
    }
    
    return blocks;
  }
}