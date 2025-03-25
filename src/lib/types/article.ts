/**
 * Represents an article saved in the Read-It-Later plugin
 * Following TypeScript best practices with clear type definitions
 */
export interface Article {
  id: string;
  title: string;
  url: string;
  domain: string;
  addedAt: Date;
  status: ArticleStatus;
  tags?: string[];
  
  // Content properties extracted by Defuddle
  content: string;             // HTML content of the article
  contentChunkIds?: string[];  // References to chunked content for large articles
  excerpt?: string;            // Short excerpt/description
  author?: string;             // Article author
  siteName?: string;           // Name of the website
  image?: string;              // Featured image URL
  publishedAt?: Date;          // Publication date if available
}

/**
 * Discriminated union for article status
 * Provides type safety for status values
 */
export type ArticleStatus = 'read' | 'unread';
