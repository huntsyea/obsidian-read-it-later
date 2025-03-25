import { useState, useEffect, useCallback } from 'react';
import { Article } from '../lib/types/article';
import { useToast } from '../hooks/use-toast';
import { useArticles } from '../lib/context/article-context';
import { useSelectionManager } from './useSelectionManager';
import { 
  ParsedContentElement, 
  parseArticleContent, 
  saveContentToArticle as saveContent
} from '../utils/contentUtils';

/**
 * Custom hook for managing article content with selection capabilities
 * Follows single responsibility principle by handling only content management
 */
/**
 * Custom hook for managing article content with selection capabilities
 * Follows single responsibility principle by handling only content management
 * @param article The article object to manage content for (can be undefined during initial render)
 */
export function useArticleContent(article?: Article) {
  const { toast } = useToast();
  const { updateArticle } = useArticles();
  const [content, setContent] = useState<ParsedContentElement[]>([]);
  
  // Parse content on initial load and when article changes with improved validation
  useEffect(() => {
    try {
      // Enhanced debugging for article state
      if (!article) {
        console.log('useArticleContent: Article is undefined');
        setContent([{
          id: 'no-article',
          type: 'paragraph',
          content: 'No article selected. Please select an article to view.'
        }]);
        return;
      }
      
      // Log detailed article information
      console.log(`useArticleContent: Article state - ID: ${article.id}, Title: ${article.title}`);
      console.log(`useArticleContent: Content type: ${typeof article.content}, Length: ${article.content?.length || 0}`);
      
      // Deep content inspection
      if (article.content) {
        const contentPreview = typeof article.content === 'string' ? 
          article.content.substring(0, 100) : 
          JSON.stringify(article.content).substring(0, 100);
        console.log(`useArticleContent: Content preview: ${contentPreview}...`);
      } else {
        console.warn('useArticleContent: Article content is null or undefined');
      }
      
      // Enhanced content validation with more robust fallback
      let htmlContent = '';
      
      if (!article.content) {
        console.error('useArticleContent: Article content is missing');
        htmlContent = '<p>No content available for this article. The content may be missing or corrupted.</p>';
      } else if (typeof article.content !== 'string') {
        console.error(`useArticleContent: Article content is not a string, it is: ${typeof article.content}`);
        htmlContent = '<p>Content format is invalid. Please try refreshing the article.</p>';
      } else if (article.content.trim() === '') {
        console.warn('useArticleContent: Article content is an empty string');
        htmlContent = '<p>This article appears to be empty. Please try refreshing or selecting another article.</p>';
      } else {
        htmlContent = article.content;
        
        // Check if content is valid HTML
        if (!htmlContent.includes('<')) {
          console.warn('useArticleContent: Content is not valid HTML, wrapping in paragraph tags');
          htmlContent = `<p>${htmlContent}</p>`;
        }
      }
      
      // Parse the content with detailed logging
      console.log(`useArticleContent: Parsing content of length ${htmlContent.length}`);
      const parsedContent = parseArticleContent(htmlContent);
      console.log(`useArticleContent: Parsed ${parsedContent.length} content elements`);
      
      // Validate parsed content
      if (parsedContent.length === 0) {
        console.warn('useArticleContent: No content elements were parsed');
        setContent([{
          id: 'empty-parsed-content',
          type: 'paragraph',
          content: 'No content could be parsed from this article.'
        }]);
      } else if (parsedContent.length === 1 && parsedContent[0].content.includes('No content available')) {
        console.warn('useArticleContent: Only fallback content was parsed');
        // Try to update the article with valid content if it's missing
        if (article.id && updateArticle && article.content !== htmlContent) {
          console.log('useArticleContent: Attempting to repair article content');
          const updatedArticle = { ...article, content: htmlContent };
          updateArticle(updatedArticle).catch(err => {
            console.error('useArticleContent: Failed to repair article content:', err);
          });
        }
      }
      
      // Set the content state
      setContent(parsedContent);
    } catch (error) {
      console.error('useArticleContent: Failed to parse article content:', error);
      // Initialize with a meaningful error message instead of empty array
      setContent([{
        id: 'parsing-error',
        type: 'paragraph',
        content: 'There was an error parsing this article. Please try refreshing or selecting another article.'
      }]);
      
      toast({
        title: "Error parsing content",
        description: "There was an issue loading the article content",
        variant: "destructive"
      });
    }
  }, [article?.id, article?.content, updateArticle, toast]);
  
  // Use the selection manager hook for handling selections
  const { 
    selectedIds, 
    selectedItems, 
    isSelected, 
    toggleSelection, 
    clearSelection,
    hasSelection 
  } = useSelectionManager<ParsedContentElement>(content);
  
  // Toggle highlight status for an element
  const toggleHighlight = useCallback((id: string) => {
    // Update the content with the new highlight state
    setContent(prevContent => 
      prevContent.map(el => {
        if (el.id === id) {
          const newHighlightState = !el.isHighlighted;
          
          // Show appropriate toast message
          if (newHighlightState) {
            toast({
              title: "Element highlighted",
              description: "The element has been highlighted"
            });
          } else {
            toast({
              title: "Highlight removed",
              description: "The highlight has been removed from the element"
            });
          }
          
          return { ...el, isHighlighted: newHighlightState };
        }
        return el;
      })
    );
    
    // Toggle selection state
    toggleSelection(id);
  }, [toggleSelection, toast]);
  
  // Copy element content to clipboard
  const copyElementContent = useCallback(async (id: string) => {
    const element = content.find(el => el.id === id);
    if (!element) return;
    
    try {
      await navigator.clipboard.writeText(element.content);
      toast({
        title: "Content copied",
        description: "Element content copied to clipboard"
      });
    } catch (error) {
      console.error('Failed to copy content:', error);
      toast({
        title: "Copy failed",
        description: "Failed to copy content to clipboard",
        variant: "destructive"
      });
    }
  }, [content, toast]);
  
  // Delete a single element with optimistic UI update
  const deleteElement = useCallback(async (id: string) => {
    try {
      // Store original content for rollback if needed
      const originalContent = [...content];
      
      // Optimistic UI update - immediately update the UI
      const updatedContent = content.filter(el => el.id !== id);
      setContent(updatedContent);
      
      // If the element was selected, remove it from selection
      if (isSelected(id)) {
        toggleSelection(id);
      }
      
      // Save the updated content if article exists
      if (article) {
        await saveContent(updatedContent, article, updateArticle);
      } else {
        console.error('Cannot save content: article is undefined');
        toast({
          title: "Save failed",
          description: "Could not save changes because the article is not available",
          variant: "destructive"
        });
        // Revert to original content if save fails
        if (originalContent) {
          setContent(originalContent);
        }
      }
      
      toast({
        title: "Element removed",
        description: "The element has been removed from the article"
      });
    } catch (error) {
      console.error('Failed to delete element:', error);
      toast({
        title: "Delete failed",
        description: "Failed to remove the element",
        variant: "destructive"
      });
    }
  }, [content, isSelected, toggleSelection, article, updateArticle, toast]);
  
  // Delete all highlighted/selected elements with optimistic UI update
  const deleteSelectedElements = useCallback(async () => {
    if (!hasSelection) return;
    
    try {
      const elementsToRemoveCount = selectedIds.size;
      // Store original content for rollback if needed
      const originalContent = [...content];
      
      // Optimistic UI update - immediately update the UI
      const updatedContent = content.filter(el => !selectedIds.has(el.id));
      setContent(updatedContent);
      
      // Clear selection
      clearSelection();
      
      // Save the updated content if article exists
      if (article) {
        await saveContent(updatedContent, article, updateArticle);
      } else {
        console.error('Cannot save content: article is undefined');
        toast({
          title: "Save failed",
          description: "Could not save changes because the article is not available",
          variant: "destructive"
        });
        // Revert to original content if save fails
        if (originalContent) {
          setContent(originalContent);
        }
      }
      
      toast({
        title: "Elements removed",
        description: `${elementsToRemoveCount} element(s) have been removed from the article`
      });
    } catch (error) {
      console.error('Failed to delete selected elements:', error);
      toast({
        title: "Delete failed",
        description: "Failed to remove the selected elements",
        variant: "destructive"
      });
    }
  }, [content, selectedIds, hasSelection, clearSelection, article, updateArticle, toast]);
  
  // Clear all highlights without deleting elements
  const clearHighlights = useCallback(async () => {
    if (!hasSelection) return;
    
    try {
      // Store original content for rollback if needed
      const originalContent = [...content];
      
      // Update all elements to remove highlights
      const updatedContent = content.map(el => ({
        ...el,
        isHighlighted: false
      }));
      
      setContent(updatedContent);
      clearSelection();
      
      // Save the updated content if article exists
      if (article) {
        await saveContent(updatedContent, article, updateArticle);
      } else {
        console.error('Cannot save content: article is undefined');
        toast({
          title: "Save failed",
          description: "Could not save changes because the article is not available",
          variant: "destructive"
        });
        // Revert to original content if save fails
        if (originalContent) {
          setContent(originalContent);
        }
      }
      
      toast({
        title: "Selection cleared",
        description: "All highlights have been removed"
      });
    } catch (error) {
      console.error('Failed to clear highlights:', error);
      toast({
        title: "Clear failed",
        description: "Failed to clear the highlights",
        variant: "destructive"
      });
    }
  }, [content, hasSelection, clearSelection, article, updateArticle, toast]);
  
  return {
    content,
    isHighlighted: useCallback((id: string) => 
      content.find(el => el.id === id)?.isHighlighted || false, 
      [content]
    ),
    hasHighlightedElements: hasSelection,
    toggleHighlight,
    copyElementContent,
    deleteElement,
    deleteSelectedElements,
    clearHighlights
  };
}
