import { Client } from '@notionhq/client';
import { WeChatArticle } from '../types';

export class NotionExporterV2 {
  private notion: Client;
  
  constructor(apiKey: string) {
    this.notion = new Client({ auth: apiKey });
  }
  
  async export(article: WeChatArticle, databaseId: string): Promise<string> {
    try {
      const page = await this.notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          Name: { 
            title: [{ text: { content: article.title.substring(0, 2000) } }] 
          },
          Date: { 
            date: { start: new Date().toISOString().split('T')[0] } 
          }
        }
      });
      
      const blocks = this.htmlToNotionBlocks(article.content, article.images);
      
      for (let i = 0; i < blocks.length; i += 100) {
        const chunk = blocks.slice(i, i + 100);
        await this.notion.blocks.children.append({
          block_id: page.id,
          children: chunk
        });
      }
      
      return page.id;
    } catch (error) {
      console.error('❌ Notion 导出失败:', error);
      throw error;
    }
  }
  
  private htmlToNotionBlocks(content: string, images: any[]): any[] {
    const blocks: any[] = [];
    const lines = content.split(/<\/p>|<br\s*\/?>/i);
    
    lines.forEach(line => {
      const text = line.replace(/<[^>]+>/g, '').trim();
      if (text && text.length > 0) {
        blocks.push({
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: text.substring(0, 2000) } }]
          }
        });
      }
    });
    
    images.forEach(img => {
      if (img.url) {
        blocks.push({
          type: 'image',
          image: { type: 'external', external: { url: img.url } }
        });
      }
    });
    
    return blocks;
  }
}
