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

export interface ExportResult {
  notionPageId?: string;
  htmlFilePath?: string;
  success: boolean;
  message: string;
}