import { Article } from '../types/article';
import { requestUrl, RequestUrlResponse } from 'obsidian';

/**
 * Type definition for extracted article data
 * This ensures type safety when working with the extraction results
 */
interface ExtractedArticleData {
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
  siteName?: string;
  image?: string;
  publishDate?: string;
}

/**
 * Interface for article extraction response
 * Following Interface Segregation Principle with a focused interface
 */
export interface ArticleExtractionResult {
  success: boolean;
  article?: Article;
  error?: string;
}

/**
 * Service for extracting article content from URLs using Defuddle
 * Following:
 * - Single Responsibility Principle: Service only handles article extraction
 * - Open/Closed Principle: Extensible through configuration without modification
 */
export class ArticleExtractorService {
  /**
   * Extracts article content from a URL using regex-based parsing
   * @param url The URL to extract content from
   * @returns Promise with extraction result containing success status and article data or error
   */
  public async extractFromUrl(url: string): Promise<ArticleExtractionResult> {
    try {
      console.log('ArticleExtractorService: Starting extraction for URL:', url);
      
      // Validate URL format
      if (!this.isValidUrl(url)) {
        console.error('ArticleExtractorService: Invalid URL format:', url);
        return {
          success: false,
          error: 'Invalid URL format'
        };
      }

      // Ensure URL has protocol
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
        console.log('ArticleExtractorService: Added protocol to URL:', url);
      }

      // Fetch the HTML content using Obsidian's requestUrl API to avoid CORS issues
      let response: RequestUrlResponse;
      try {
        console.log('ArticleExtractorService: Fetching URL content...');
        response = await requestUrl({
          url: url,
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
          },
        });
        console.log('ArticleExtractorService: Fetch successful, status:', response.status);
      } catch (fetchError) {
        console.error('ArticleExtractorService: Failed to fetch URL:', fetchError);
        return {
          success: false,
          error: `Failed to fetch URL: ${fetchError instanceof Error ? fetchError.message : 'Network error'}`
        };
      }

      if (response.status !== 200) {
        console.error('ArticleExtractorService: HTTP error:', response.status);
        return {
          success: false,
          error: `Failed to fetch URL: HTTP ${response.status}`
        };
      }

      const html = response.text;
      console.log('ArticleExtractorService: HTML content received, length:', html.length);
      
      // Use regex-based extraction instead of JSDOM to avoid Canvas and CSS issues
      const extractedData = this.extractArticleDataWithRegex(html, url);
      console.log('ArticleExtractorService: Data extracted:', {
        title: extractedData.title,
        contentLength: extractedData.content?.length || 0,
        excerpt: extractedData.excerpt?.substring(0, 50) + '...',
      });
      
      // Extract domain from URL
      const domain = this.extractDomain(url);

      // Create article object with extracted data
      const article: Article = {
        id: this.generateId(),
        title: extractedData.title || 'Untitled Article',
        url: url,
        domain: domain,
        addedAt: new Date(),
        status: 'unread',
        content: extractedData.content || '<div><p>Content could not be extracted properly.</p></div>',
        excerpt: extractedData.excerpt || '',
        author: extractedData.author || '',
        siteName: extractedData.siteName || domain,
        image: extractedData.image || '',
        publishedAt: extractedData.publishDate ? new Date(extractedData.publishDate) : undefined
      };

      console.log('ArticleExtractorService: Article object created successfully');
      return {
        success: true,
        article
      };
    } catch (error) {
      console.error('ArticleExtractorService: Extraction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during article extraction'
      };
    }
  }
  
  /**
   * Extracts article data using regex patterns instead of DOM parsing
   * This avoids JSDOM-related issues with Canvas and CSS
   * @param html HTML content to parse
   * @param baseUrl Base URL for resolving relative paths
   * @returns Extracted article data
   */
  private extractArticleDataWithRegex(html: string, baseUrl: string): ExtractedArticleData {
    // Clean the HTML to remove scripts and styles that might cause issues
    html = this.cleanHtml(html);
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? this.decodeHtmlEntities(titleMatch[1].trim()) : 'Untitled Article';
    
    // Extract meta description as excerpt
    const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) || 
                            html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i);
    const excerpt = descriptionMatch ? this.decodeHtmlEntities(descriptionMatch[1].trim()) : '';
    
    // Extract author
    const authorMatch = html.match(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["'][^>]*>/i) || 
                       html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']author["'][^>]*>/i);
    const author = authorMatch ? this.decodeHtmlEntities(authorMatch[1].trim()) : '';
    
    // Extract site name
    const siteNameMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["'][^>]*>/i) || 
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:site_name["'][^>]*>/i);
    const siteName = siteNameMatch ? this.decodeHtmlEntities(siteNameMatch[1].trim()) : this.extractDomain(baseUrl);
    
    // Extract main image
    const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) || 
                      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i);
    const image = imageMatch ? this.resolveUrl(imageMatch[1].trim(), baseUrl) : '';
    
    // Extract publish date
    const publishDateMatch = html.match(/<meta[^>]*property=["']article:published_time["'][^>]*content=["']([^"']+)["'][^>]*>/i) || 
                           html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']article:published_time["'][^>]*>/i);
    const publishDate = publishDateMatch ? publishDateMatch[1].trim() : undefined;
    
    // Extract main content - try different common content containers
    let content = this.extractMainContent(html);
    
    return {
      title,
      content,
      excerpt,
      author,
      siteName,
      image,
      publishDate
    };
  }
  
  /**
   * Extracts the main content from HTML using regex patterns
   * Tries different common content containers
   * @param html HTML content
   * @returns Extracted main content HTML
   */
  private extractMainContent(html: string): string {
    // Try to find content in common containers
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    const contentMatch = html.match(/<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    
    let content = '';
    
    if (articleMatch) {
      content = articleMatch[1];
    } else if (mainMatch) {
      content = mainMatch[1];
    } else if (contentMatch) {
      content = contentMatch[1];
    } else if (bodyMatch) {
      // If we have to use body, try to extract just the main content area
      // by removing headers, footers, sidebars, etc.
      let bodyContent = bodyMatch[1];
      
      // Remove common non-content elements
      bodyContent = bodyContent.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
      bodyContent = bodyContent.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
      bodyContent = bodyContent.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
      bodyContent = bodyContent.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');
      bodyContent = bodyContent.replace(/<div[^>]*class=["'][^"']*sidebar[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
      bodyContent = bodyContent.replace(/<div[^>]*class=["'][^"']*menu[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
      bodyContent = bodyContent.replace(/<div[^>]*class=["'][^"']*comment[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
      
      content = bodyContent;
    }
    
    // Clean up the content
    content = this.cleanContent(content);
    
    // If content is too short or empty, create a minimal content wrapper
    if (!content || content.trim().length < 50) {
      content = '<div><p>The article content could not be extracted properly.</p></div>';
    } else {
      // Wrap in a div if not already wrapped
      if (!content.trim().startsWith('<div')) {
        content = `<div>${content}</div>`;
      }
    }
    
    return content;
  }
  
  /**
   * Clean HTML content by removing scripts, styles, and comments
   * @param html HTML content to clean
   * @returns Cleaned HTML
   */
  private cleanHtml(html: string): string {
    if (!html) return '';
    
    // Remove scripts
    html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
    
    // Remove styles
    html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
    
    // Remove comments
    html = html.replace(/<!--[\s\S]*?-->/g, '');
    
    return html;
  }
  
  /**
   * Clean extracted content for better readability
   * @param content HTML content to clean
   * @returns Cleaned content
   */
  private cleanContent(content: string): string {
    if (!content) return '';
    
    // Remove potentially problematic attributes
    content = content.replace(/\s+on\w+="[^"]*"/g, ''); // Remove event handlers
    content = content.replace(/\s+style="[^"]*"/g, '');  // Remove inline styles
    content = content.replace(/\s+class="[^"]*"/g, '');  // Remove classes
    content = content.replace(/\s+id="[^"]*"/g, '');     // Remove IDs
    
    // Remove empty paragraphs
    content = content.replace(/<p>\s*<\/p>/gi, '');
    
    return content;
  }
  
  /**
   * Decode HTML entities in a string
   * @param text Text with HTML entities
   * @returns Decoded text
   */
  private decodeHtmlEntities(text: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }
  
  /**
   * Resolve a relative URL against a base URL
   * @param url Relative or absolute URL
   * @param baseUrl Base URL for resolving
   * @returns Resolved absolute URL
   */
  private resolveUrl(url: string, baseUrl: string): string {
    try {
      return new URL(url, baseUrl).href;
    } catch (e) {
      return url;
    }
  }

  /**
   * Validates URL format
   * @param url URL to validate
   * @returns boolean indicating if URL is valid
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Extracts domain from URL
   * @param url Full URL
   * @returns Domain name
   */
  private extractDomain(url: string): string {
    try {
      const { hostname } = new URL(url);
      return hostname.replace(/^www\./, '');
    } catch (error) {
      return '';
    }
  }

  /**
   * Generates a unique ID for the article
   * @returns Unique ID string
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
