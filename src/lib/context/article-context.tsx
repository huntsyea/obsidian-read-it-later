import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Article } from '../types/article';
import { StorageService } from '../services/storage.service';

/**
 * Interface for the article context state and methods
 */
interface ArticleContextType {
  articles: Article[];
  loading: boolean;
  error: string | null;
  addArticle: (article: Article) => Promise<void>;
  updateArticle: (article: Article) => Promise<void>;
  deleteArticle: (articleId: string) => Promise<void>;
  updateArticleStatus: (articleId: string, status: 'read' | 'unread') => Promise<void>;
  refreshArticles: () => Promise<void>;
}

// Create the context with a default value
// Export the context so it can be imported in other components
export const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

/**
 * Props for the ArticleProvider component
 */
interface ArticleProviderProps {
  children: ReactNode;
  storageService: StorageService;
}

/**
 * Provider component for article data and operations
 */
export const ArticleProvider: React.FC<ArticleProviderProps> = ({ children, storageService }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load articles when the component mounts
  useEffect(() => {
    refreshArticles();
  }, []);

  /**
   * Refresh the articles list from storage
   */
  const refreshArticles = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('ArticleContext: Refreshing articles from storage');
      const loadedArticles = await storageService.loadArticles();
      console.log('ArticleContext: Loaded articles count:', loadedArticles.length);
      
      // Ensure we're getting the latest articles
      if (loadedArticles.length > 0) {
        console.log('ArticleContext: Sample article:', loadedArticles[0].title);
      }
      
      // Update state with the loaded articles
      setArticles(loadedArticles);
      console.log('ArticleContext: State updated with articles');
    } catch (err) {
      setError('Failed to load articles');
      console.error('ArticleContext: Error loading articles:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add a new article
   */
  const addArticle = async (article: Article): Promise<void> => {
    try {
      console.log('ArticleContext: Adding new article:', article.title);
      
      // First update the local state immediately for better UX
      setArticles(prevArticles => [...prevArticles, article]);
      console.log('ArticleContext: Local state updated with new article');
      
      // Then save to storage
      await storageService.addArticle(article);
      console.log('ArticleContext: Article saved to storage');
      
      // Refresh from storage to ensure consistency
      await refreshArticles();
    } catch (err) {
      setError('Failed to add article');
      console.error('ArticleContext: Error adding article:', err);
      throw err;
    }
  };

  /**
   * Update an existing article
   */
  const updateArticle = async (article: Article): Promise<void> => {
    try {
      await storageService.updateArticle(article);
      await refreshArticles();
    } catch (err) {
      setError('Failed to update article');
      console.error('Error updating article:', err);
      throw err;
    }
  };

  /**
   * Delete an article
   */
  const deleteArticle = async (articleId: string): Promise<void> => {
    try {
      await storageService.deleteArticle(articleId);
      await refreshArticles();
    } catch (err) {
      setError('Failed to delete article');
      console.error('Error deleting article:', err);
      throw err;
    }
  };

  /**
   * Update an article's status
   */
  const updateArticleStatus = async (articleId: string, status: 'read' | 'unread'): Promise<void> => {
    try {
      await storageService.updateArticleStatus(articleId, status);
      await refreshArticles();
    } catch (err) {
      setError('Failed to update article status');
      console.error('Error updating article status:', err);
      throw err;
    }
  };

  // Create the context value object with all the state and functions
  const contextValue: ArticleContextType = {
    articles,
    loading,
    error,
    addArticle,
    updateArticle,
    deleteArticle,
    updateArticleStatus,
    refreshArticles
  };
  
  // For debugging purposes
  console.log('ArticleContext: Context value updated', { articleCount: articles.length });

  return (
    <ArticleContext.Provider value={contextValue}>
      {children}
    </ArticleContext.Provider>
  );
};

/**
 * Custom hook to use the article context
 * @returns The article context
 * @throws Error if used outside of an ArticleProvider
 */
export const useArticles = (): ArticleContextType => {
  const context = useContext(ArticleContext);
  if (context === undefined) {
    throw new Error('useArticles must be used within an ArticleProvider');
  }
  return context;
};
