import { Article } from '../types/article';
import { v4 as uuidv4 } from 'uuid';

// Constants for content chunking
const CONTENT_CHUNK_SIZE = 50000; // 50KB chunks to avoid Obsidian data storage limitations

/**
 * Service for handling article storage using Obsidian's data API
 */
/**
 * Service for handling article storage using Obsidian's data API
 * Following Single Responsibility Principle - this class only handles data persistence
 */
export class StorageService {
  private plugin: any;
  // Use a simple key without hyphens to avoid potential issues
  private storageKey = 'smartReaderArticles';
  private contentChunksKey = 'smartReaderContentChunks';

  /**
   * Initialize the storage service with the plugin instance
   * @param plugin The Obsidian plugin instance
   */
  constructor(plugin: any) {
    this.plugin = plugin;
  }

  /**
   * Split content into chunks to avoid Obsidian's data size limitations
   * @param content The content to split
   * @returns Array of content chunks
   */
  private splitContentIntoChunks(content: string): string[] {
    const chunks: string[] = [];
    let remainingContent = content;
    
    while (remainingContent.length > 0) {
      const chunk = remainingContent.substring(0, CONTENT_CHUNK_SIZE);
      chunks.push(chunk);
      remainingContent = remainingContent.substring(CONTENT_CHUNK_SIZE);
    }
    
    return chunks;
  }
  
  /**
   * Reassemble content from chunks
   * @param chunkIds Array of chunk IDs
   * @param contentChunks Map of all content chunks
   * @returns Reassembled content string
   */
  private reassembleContentFromChunks(chunkIds: string[], contentChunks: Record<string, string>): string {
    let fullContent = '';
    
    for (const chunkId of chunkIds) {
      const chunk = contentChunks[chunkId];
      if (chunk) {
        fullContent += chunk;
      } else {
        console.error(`StorageService: Missing content chunk with ID ${chunkId}`);
      }
    }
    
    return fullContent;
  }

  /**
   * Save articles to Obsidian's data storage using a chunking strategy for large content
   * @param articles Array of articles to save
   * @returns Promise that resolves when articles are saved
   */
  async saveArticles(articles: Article[]): Promise<void> {
    try {
      console.log('StorageService: Saving articles, count:', articles.length);
      
      // Log content details before serialization
      if (articles.length > 0) {
        const firstArticle = articles[0];
        console.log(`StorageService: First article before serialization - ID: ${firstArticle.id}, Title: ${firstArticle.title}`);
        console.log(`StorageService: Content type: ${typeof firstArticle.content}, Content length: ${firstArticle.content?.length || 0}`);
        
        // Check content validity
        if (!firstArticle.content || typeof firstArticle.content !== 'string') {
          console.error('StorageService: Article content is invalid before serialization');
        } else {
          // Log a preview of the content
          console.log('StorageService: Content preview:', firstArticle.content.substring(0, 100) + '...');
        }
      }
      
      // Load existing content chunks or initialize empty object
      let contentChunks: Record<string, string> = {};
      try {
        const existingChunks = this.plugin.data?.[this.contentChunksKey] || {};
        contentChunks = typeof existingChunks === 'object' ? existingChunks : {};
      } catch (e) {
        console.warn('StorageService: Failed to load existing content chunks, initializing empty object');
        contentChunks = {};
      }
      
      // Create a deep copy of articles with content chunking for large content
      const serializedArticles = articles.map(article => {
        // Create a new object for serialization to avoid reference issues
        const articleToSerialize: any = {};
        
        // Copy all properties except content first
        Object.keys(article).forEach(key => {
          if (key !== 'content') {
            articleToSerialize[key] = article[key as keyof Article];
          }
        });
        
        // Handle dates
        articleToSerialize.addedAt = article.addedAt instanceof Date ? article.addedAt.toISOString() : article.addedAt;
        articleToSerialize.publishedAt = article.publishedAt instanceof Date ? article.publishedAt.toISOString() : article.publishedAt;
        
        // Special handling for content to ensure it's properly serialized
        if (!article.content || typeof article.content !== 'string') {
          console.warn(`StorageService: Article ${article.id} has invalid content before serialization, adding fallback`);
          articleToSerialize.content = '<p>Content was lost during serialization. Please try refreshing.</p>';
          // Store the fallback content directly in the article
          articleToSerialize.contentChunkIds = [];
        } else if (article.content.trim() === '') {
          console.warn(`StorageService: Article ${article.id} has empty content, adding fallback`);
          articleToSerialize.content = '<p>Article content appears to be empty. Please try refreshing.</p>';
          // Store the fallback content directly in the article
          articleToSerialize.contentChunkIds = [];
        } else {
          // Ensure content is a string and properly formatted
          let validContent = article.content;
          
          // Verify the content has HTML structure
          if (!validContent.includes('<')) {
            console.warn(`StorageService: Article ${article.id} content is not HTML, wrapping in paragraph tags`);
            validContent = `<p>${validContent}</p>`;
          }
          
          // For large content, split into chunks and store separately
          if (validContent.length > CONTENT_CHUNK_SIZE) {
            console.log(`StorageService: Article ${article.id} content is large (${validContent.length} chars), splitting into chunks`);
            
            // Split content into manageable chunks
            const contentChunksArray = this.splitContentIntoChunks(validContent);
            const chunkIds: string[] = [];
            
            // Store each chunk with a unique ID
            contentChunksArray.forEach((chunk, index) => {
              const chunkId = `${article.id}-chunk-${index}-${uuidv4().substring(0, 8)}`;
              contentChunks[chunkId] = chunk;
              chunkIds.push(chunkId);
            });
            
            // Store only chunk references in the article
            articleToSerialize.contentChunkIds = chunkIds;
            // Store a small preview of the content for validation
            articleToSerialize.content = validContent.substring(0, 200) + '... [Content stored in chunks]';
            
            console.log(`StorageService: Split article ${article.id} content into ${chunkIds.length} chunks`);
          } else {
            // For small content, store directly in the article
            articleToSerialize.content = validContent;
            articleToSerialize.contentChunkIds = [];
            console.log(`StorageService: Storing article ${article.id} content directly (${validContent.length} chars)`);
          }
        }
        
        return articleToSerialize;
      });
      
      // Debug the data being saved
      console.log('StorageService: Serialized articles for storage:', JSON.stringify(serializedArticles).substring(0, 100) + '...');
      
      // Verify serialized content
      if (serializedArticles.length > 0) {
        const firstSerializedArticle = serializedArticles[0];
        console.log(`StorageService: First serialized article - Content type: ${typeof firstSerializedArticle.content}`);
        console.log(`StorageService: Serialized content length: ${firstSerializedArticle.content?.length || 0}`);
      }
      
      // Create a data object if it doesn't exist
      if (!this.plugin.data) {
        this.plugin.data = {};
      }
      
      // Save content chunks separately
      this.plugin.data[this.contentChunksKey] = contentChunks;
      
      // Save articles without the full content
      this.plugin.data[this.storageKey] = serializedArticles;
      
      // Save the entire data object
      await this.plugin.saveData();
      console.log(`StorageService: Articles saved successfully with ${Object.keys(contentChunks).length} content chunks`);
    } catch (error) {
      console.error('StorageService: Failed to save articles:', error);
      throw new Error('Failed to save articles to Obsidian storage');
    }
  }

  /**
   * Load articles from Obsidian's data storage with improved error handling and validation
   * @returns Promise that resolves with the loaded articles
   */
  async loadArticles(): Promise<Article[]> {
    try {
      console.log('StorageService: Loading articles from storage');
      
      // Direct access to plugin data - this is the key fix
      // We're accessing the data directly from the plugin's data object
      let articlesData: any = null;
      const data = this.plugin.data?.[this.storageKey];
      console.log('StorageService: Direct data access result:', data ? 'Data found' : 'No data found');
      
      if (data !== undefined) {
        articlesData = data;
      } else {
        // Fallback to loadData API if direct access fails
        const loadedData = await this.plugin.loadData();
        console.log('StorageService: Fallback loadData result:', loadedData ? 'Data found' : 'No data found');
        
        // If we have data from loadData, use it
        if (loadedData && loadedData[this.storageKey]) {
          console.log('StorageService: Found articles in loadData');
          articlesData = loadedData[this.storageKey];
        }
      }
      
      // Validate the data structure
      if (!articlesData) {
        console.log('StorageService: No data found in storage, returning empty array');
        return [];
      }
      
      // Ensure we have an array
      if (!Array.isArray(articlesData)) {
        console.error('StorageService: Data is not an array, attempting to recover');
        
        // Try to recover if it's an object with articles inside
        if (typeof articlesData === 'object' && articlesData !== null) {
          const possibleArticles = Object.values(articlesData);
          if (Array.isArray(possibleArticles) && possibleArticles.length > 0) {
            console.log('StorageService: Recovered array from object');
            articlesData = possibleArticles;
          } else {
            console.error('StorageService: Could not recover array, returning empty array');
            return [];
          }
        } else {
          console.error('StorageService: Invalid data structure, returning empty array');
          return [];
        }
      }
      
      // Load content chunks
      let contentChunks: Record<string, string> = {};
      try {
        const loadedChunks = this.plugin.data?.[this.contentChunksKey];
        if (loadedChunks && typeof loadedChunks === 'object') {
          contentChunks = loadedChunks;
          console.log(`StorageService: Loaded ${Object.keys(contentChunks).length} content chunks`);
        } else {
          console.warn('StorageService: No content chunks found or invalid format');
        }
      } catch (e) {
        console.error('StorageService: Failed to load content chunks:', e);
      }
      
      // Process the article data with enhanced validation and content reassembly
      const processedArticles = this.processArticleData(articlesData, contentChunks);
      
      // Final validation check
      if (processedArticles.length > 0) {
        console.log(`StorageService: Successfully loaded ${processedArticles.length} articles`);
        
        // Verify content in the first article
        const firstArticle = processedArticles[0];
        if (!firstArticle.content || typeof firstArticle.content !== 'string') {
          console.error('StorageService: First article has invalid content after processing');
        } else {
          console.log(`StorageService: First article content length: ${firstArticle.content.length}`);
        }
      } else {
        console.warn('StorageService: No articles were processed');
      }
      
      return processedArticles;
    } catch (error) {
      console.error('StorageService: Failed to load articles:', error);
      return [];
    }
  }
  
  /**
   * Process raw article data from storage with improved content validation
   * @param data The raw data from storage
   * @param contentChunks Map of content chunks for reassembly
   * @returns Processed article array with validated content
   */
  private processArticleData(data: any, contentChunks: Record<string, string> = {}): Article[] {
    // Ensure we have an array of articles
    const validArticles = Array.isArray(data) ? data : [];
    console.log('StorageService: Valid articles array length:', validArticles.length);
    
    if (validArticles.length > 0) {
      // Log more detailed information about the first article
      const sampleArticle = validArticles[0];
      console.log('StorageService: Sample article data:', JSON.stringify(sampleArticle).substring(0, 100) + '...');
      console.log('StorageService: Article content type:', typeof sampleArticle.content);
      console.log('StorageService: Article content length:', sampleArticle.content ? sampleArticle.content.length : 0);
      
      // Log the first 100 characters of content for debugging
      if (sampleArticle.content && typeof sampleArticle.content === 'string') {
        console.log('StorageService: Content preview:', sampleArticle.content.substring(0, 100) + '...');
      } else {
        console.warn('StorageService: Article content is not a string or is empty');
      }
    }
    
    // Convert date strings back to Date objects with proper error handling and content validation
    const processedArticles = validArticles.map(article => {
      try {
        // Log detailed information about each article's content
        console.log(`StorageService: Processing article ${article.id}, content type: ${typeof article.content}`);
        
        // Check for chunked content
        const contentChunkIds = article.contentChunkIds || [];
        let validContent = article.content;
        
        // If content is chunked, reassemble it
        if (Array.isArray(contentChunkIds) && contentChunkIds.length > 0) {
          console.log(`StorageService: Reassembling content for article ${article.id} from ${contentChunkIds.length} chunks`);
          const reassembledContent = this.reassembleContentFromChunks(contentChunkIds, contentChunks);
          
          if (reassembledContent && reassembledContent.length > 0) {
            console.log(`StorageService: Successfully reassembled content for article ${article.id}, length: ${reassembledContent.length}`);
            validContent = reassembledContent;
          } else {
            console.error(`StorageService: Failed to reassemble content for article ${article.id}`);
            validContent = '<p>Content could not be reassembled from chunks. The article may be corrupted.</p>';
          }
        } else {
          // For non-chunked content, validate it exists and is a string
          if (!validContent || typeof validContent !== 'string' || validContent.trim() === '') {
            console.warn(`StorageService: Article ${article.id} has invalid content, using fallback content`);
            validContent = '<p>Content could not be loaded properly. The article may be corrupted.</p>';
          } else {
            console.log(`StorageService: Article ${article.id} has valid content of length ${validContent.length}`);
          }
        }
        
        // Ensure content has at least some HTML structure
        if (!validContent.includes('<')) {
          console.warn(`StorageService: Article ${article.id} content is not HTML, wrapping in paragraph tags`);
          validContent = `<p>${validContent}</p>`;
        }
        
        // Create a processed article with validated content
        const processedArticle = {
          ...article,
          // Ensure content is valid
          content: validContent,
          // Ensure we have valid date objects
          addedAt: article.addedAt ? new Date(article.addedAt) : new Date(),
          publishedAt: article.publishedAt ? new Date(article.publishedAt) : undefined
        };
        
        // Final validation check
        if (!processedArticle.content || typeof processedArticle.content !== 'string') {
          console.error(`StorageService: Article ${article.id} still has invalid content after processing`);
        }
        
        return processedArticle;
      } catch (err) {
        console.error('StorageService: Error processing article:', err);
        // Return article with current date and fallback content
        return {
          ...article,
          content: '<p>Error loading article content. Please try refreshing.</p>',
          addedAt: new Date(),
          publishedAt: undefined
        };
      }
    });
    
    console.log('StorageService: Articles loaded and processed, count:', processedArticles.length);
    return processedArticles;
  }

  /**
   * Add a new article to storage
   * @param article The article to add
   * @returns Promise that resolves when the article is added
   */
  async addArticle(article: Article): Promise<void> {
    try {
      console.log('StorageService: Adding new article:', article.title);
      const articles = await this.loadArticles();
      
      // Check if article with same URL already exists
      const existingIndex = articles.findIndex(a => a.url === article.url);
      
      if (existingIndex >= 0) {
        console.log('StorageService: Article with same URL exists, updating it');
        articles[existingIndex] = {
          ...article,
          id: articles[existingIndex].id // Preserve the original ID
        };
      } else {
        console.log('StorageService: Adding new article to collection');
        articles.push(article);
      }
      
      await this.saveArticles(articles);
      console.log('StorageService: Article added successfully');
    } catch (error) {
      console.error('StorageService: Failed to add article:', error);
      throw new Error('Failed to add article to Obsidian storage');
    }
  }

  /**
   * Update an existing article in storage with content validation
   * @param updatedArticle The article with updated fields
   * @returns Promise that resolves when the article is updated
   */
  async updateArticle(updatedArticle: Article): Promise<void> {
    try {
      console.log(`StorageService: Updating article ${updatedArticle.id}`);
      
      // Validate content before saving
      if (!updatedArticle.content || typeof updatedArticle.content !== 'string') {
        console.warn(`StorageService: Article ${updatedArticle.id} has invalid content, using fallback content`);
        updatedArticle.content = '<p>Content could not be saved properly.</p>';
      }
      
      // Ensure content has proper HTML structure
      if (!updatedArticle.content.includes('<')) {
        console.warn(`StorageService: Article ${updatedArticle.id} content is not HTML, wrapping in paragraph tags`);
        updatedArticle.content = `<p>${updatedArticle.content}</p>`;
      }
      
      const articles = await this.loadArticles();
      const index = articles.findIndex(article => article.id === updatedArticle.id);
      
      if (index !== -1) {
        // Create a deep copy to avoid reference issues
        const articleToSave = {
          ...updatedArticle,
          // Preserve content explicitly
          content: updatedArticle.content
        };
        
        articles[index] = articleToSave;
        await this.saveArticles(articles);
        console.log(`StorageService: Article ${updatedArticle.id} updated successfully`);
      } else {
        throw new Error(`Article with ID ${updatedArticle.id} not found`);
      }
    } catch (error) {
      console.error('StorageService: Failed to update article:', error);
      throw new Error('Failed to update article in Obsidian storage');
    }
  }

  /**
   * Delete an article from storage
   * @param articleId ID of the article to delete
   * @returns Promise that resolves when the article is deleted
   */
  async deleteArticle(articleId: string): Promise<void> {
    try {
      const articles = await this.loadArticles();
      const filteredArticles = articles.filter(article => article.id !== articleId);
      
      if (articles.length === filteredArticles.length) {
        throw new Error(`Article with ID ${articleId} not found`);
      }
      
      await this.saveArticles(filteredArticles);
    } catch (error) {
      console.error('Failed to delete article:', error);
      throw new Error('Failed to delete article from Obsidian storage');
    }
  }

  /**
   * Update the status of an article
   * @param articleId ID of the article to update
   * @param status New status for the article
   * @returns Promise that resolves when the article status is updated
   */
  async updateArticleStatus(articleId: string, status: 'read' | 'unread'): Promise<void> {
    try {
      const articles = await this.loadArticles();
      const article = articles.find(a => a.id === articleId);
      
      if (article) {
        article.status = status;
        await this.saveArticles(articles);
      } else {
        throw new Error(`Article with ID ${articleId} not found`);
      }
    } catch (error) {
      console.error('Failed to update article status:', error);
      throw new Error('Failed to update article status in Obsidian storage');
    }
  }
}
