import { StorageService } from '@/lib/services/storage.service';
import { Article } from '@/lib/types/article';
import { v4 as uuidv4 } from 'uuid';

/**
 * Utility to test content chunking functionality
 * This helps verify that large article content is properly saved and loaded
 */
export class ContentChunkingTester {
  private storageService: StorageService;
  
  constructor(plugin: any) {
    this.storageService = new StorageService(plugin);
  }
  
  /**
   * Generate a large article with content of specified size
   * @param sizeInKb Approximate size of content in KB
   * @returns Article with large content
   */
  generateLargeArticle(sizeInKb: number): Article {
    // Generate a paragraph of about 1KB
    const generateParagraph = (index: number) => {
      return `<p>This is paragraph ${index} with some random content to simulate a real article. 
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt 
      ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation 
      ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in 
      reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
      Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt 
      mollit anim id est laborum. ${Math.random().toString(36).substring(2)}</p>`;
    };
    
    // Generate enough paragraphs to reach the desired size
    let content = '<article>';
    for (let i = 0; i < sizeInKb; i++) {
      content += generateParagraph(i);
    }
    content += '</article>';
    
    return {
      id: uuidv4(),
      title: `Test Large Article (${sizeInKb}KB)`,
      url: 'https://example.com/test-large-article',
      domain: 'example.com',
      addedAt: new Date(),
      status: 'unread',
      content: content,
      excerpt: 'This is a test article with large content to verify chunking functionality',
      author: 'Test Author',
      siteName: 'Example Website',
      image: 'https://example.com/image.jpg',
      publishedAt: new Date()
    };
  }
  
  /**
   * Test saving and loading a large article
   * @param sizeInKb Size of test article in KB
   */
  async testSaveAndLoadLargeArticle(sizeInKb: number): Promise<void> {
    console.log(`ContentChunkingTester: Starting test with ${sizeInKb}KB article`);
    
    // Generate a large article
    const largeArticle = this.generateLargeArticle(sizeInKb);
    console.log(`ContentChunkingTester: Generated article with content length ${largeArticle.content.length}`);
    
    try {
      // Save the article
      await this.storageService.saveArticles([largeArticle]);
      console.log('ContentChunkingTester: Article saved successfully');
      
      // Load the articles
      const loadedArticles = await this.storageService.loadArticles();
      console.log(`ContentChunkingTester: Loaded ${loadedArticles.length} articles`);
      
      // Find our test article
      const loadedArticle = loadedArticles.find(a => a.id === largeArticle.id);
      
      if (!loadedArticle) {
        console.error('ContentChunkingTester: Test article not found after loading');
        return;
      }
      
      // Verify content integrity
      const originalLength = largeArticle.content.length;
      const loadedLength = loadedArticle.content.length;
      
      console.log(`ContentChunkingTester: Original content length: ${originalLength}`);
      console.log(`ContentChunkingTester: Loaded content length: ${loadedLength}`);
      
      if (originalLength === loadedLength) {
        console.log('ContentChunkingTester: TEST PASSED - Content length matches');
      } else {
        console.error(`ContentChunkingTester: TEST FAILED - Content length mismatch: ${originalLength} vs ${loadedLength}`);
      }
      
      // Check content integrity by comparing a sample
      const originalSample = largeArticle.content.substring(0, 100);
      const loadedSample = loadedArticle.content.substring(0, 100);
      
      if (originalSample === loadedSample) {
        console.log('ContentChunkingTester: TEST PASSED - Content sample matches');
      } else {
        console.error('ContentChunkingTester: TEST FAILED - Content sample mismatch');
        console.log('Original:', originalSample);
        console.log('Loaded:', loadedSample);
      }
    } catch (error) {
      console.error('ContentChunkingTester: Test failed with error:', error);
    }
  }
}
