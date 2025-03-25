import { Command } from '@/lib/types/command';
import { ContentChunkingTester } from '../utils/testContentChunking';

/**
 * Command to test the content chunking functionality
 * This helps verify that large article content is properly saved and loaded
 */
export const testContentChunkingCommand: Command = {
  id: 'test-content-chunking',
  name: 'Test Content Chunking',
  icon: 'file-text',
  
  execute: async (plugin: any) => {
    // Create a notification to inform the user
    plugin.app.notices.createNotice('Running content chunking test...');
    
    // Create the tester
    const tester = new ContentChunkingTester(plugin);
    
    try {
      // Test with different sizes
      await tester.testSaveAndLoadLargeArticle(50); // 50KB
      await tester.testSaveAndLoadLargeArticle(200); // 200KB
      
      // Notify user of completion
      plugin.app.notices.createNotice('Content chunking test completed. Check console for results.');
    } catch (error) {
      console.error('Error running content chunking test:', error);
      plugin.app.notices.createNotice('Content chunking test failed. Check console for details.');
    }
  }
};
