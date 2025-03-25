// Card components removed to make the data table fully responsive
import { DataTable } from "@/components/articles/data-table";
import { columns } from "@/components/articles/columns";
import { useState, FormEvent } from "react";
import { Article } from "@/lib/types/article";
import { useToast } from "@/hooks/use-toast";
import { ReaderView } from "@/components/views/ReaderView";
import { useArticles } from "@/lib/context/article-context";
import { Loader2, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArticleExtractorService } from "@/lib/services/article-extractor.service";

/**
 * SavesView component for displaying saved articles
 * Following:
 * - Single Responsibility Principle: Component only handles the saved articles view
 * - Dependency Inversion: Uses abstractions (DataTable) rather than concrete implementations
 */
export function SavesView() {
  // Local state for the selected article and URL input
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Article extractor service instance
  const articleExtractor = new ArticleExtractorService();

  // Use the article context to access articles and methods
  const { 
    articles, 
    loading, 
    error, 
    addArticle, 
    updateArticle, 
    deleteArticle, 
    updateArticleStatus,
    refreshArticles 
  } = useArticles();

  /**
   * Handles form submission for adding a new article
   * @param e Form event
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setInputError("Please enter a URL");
      return;
    }
    
    setIsLoading(true);
    setInputError(null);
    
    try {
      console.log("Extracting article from URL:", url);
      
      // Extract article content
      const result = await articleExtractor.extractFromUrl(url);
      console.log("Extraction result:", result);
      
      if (result.success && result.article) {
        try {
          console.log("Adding article to storage:", result.article);
          
          // Add the article to the list
          await addArticle(result.article);
          console.log("Article successfully added");
          
          // Reset form
          setUrl("");
          
          // Show success notification
          toast({
            title: "Article added",
            description: `"${result.article.title}" has been added to your list.`,
          });
          
          // Force refresh articles list
          await refreshArticles();
          console.log("Articles refreshed, current count:", articles.length);
        } catch (addError) {
          console.error("Error adding article:", addError);
          setInputError("Failed to save the article. Please try again.");
        }
      } else {
        console.error("Extraction failed:", result.error);
        setInputError(result.error || "Failed to extract article content");
      }
    } catch (err) {
      console.error("Unexpected error during extraction:", err);
      setInputError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles marking an article as read/unread
   * @param id The article ID
   * @param status The new status
   */
  const handleStatusChange = async (id: string, status: 'read' | 'unread') => {
    try {
      await updateArticleStatus(id, status);
      
      // If the status-changed article is currently selected, update its status in the selection
      if (selectedArticle && selectedArticle.id === id) {
        setSelectedArticle({
          ...selectedArticle,
          status
        });
      }
      
      toast({
        title: `Article marked as ${status}`,
        description: "The article status has been updated",
      });
    } catch (error) {
      toast({
        title: "Error updating status",
        description: "There was an error updating the article status. Please try again.",
        variant: "destructive",
      });
    }
  };

  /**
   * Handles deleting an article
   * @param id The article ID to delete
   */
  const handleDeleteArticle = async (id: string) => {
    try {
      await deleteArticle(id);
      
      // If the deleted article is currently selected, clear the selection
      if (selectedArticle && selectedArticle.id === id) {
        setSelectedArticle(null);
      }
      
      toast({
        title: "Article deleted",
        description: "The article has been removed from your saves",
      });
    } catch (error) {
      toast({
        title: "Error deleting article",
        description: "There was an error deleting the article. Please try again.",
        variant: "destructive",
      });
    }
  };

  // We don't need to modify the columns here since we've updated the column definition
  // to accept the handlers as parameters. Instead, we'll pass the handlers directly
  // to the DataTable component via a custom property.

  /**
   * Handles selecting an article to read
   * @param article The article to read
   */
  const handleArticleSelected = (article: Article) => {
    setSelectedArticle(article);
  };

  /**
   * Handles going back to the article list
   */
  const handleBackToList = () => {
    setSelectedArticle(null);
  };

  return (
    <div className="h-full flex flex-col">
      {selectedArticle ? (
        // Reader view when an article is selected
        <ReaderView 
          article={selectedArticle} 
          onBack={handleBackToList}
          onStatusChange={handleStatusChange}
        />
      ) : (
        // List view when no article is selected
        <>
          {/* URL input form */}
          <div className="p-2 pb-1">
            <form onSubmit={handleSubmit} className="flex flex-row gap-2">
              <Input
                id="url"
                placeholder="Enter article URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !url.trim()}
                className="flex items-center gap-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    <span>Add</span>
                  </>
                )}
              </Button>
            </form>
            {inputError && (
              <p className="text-sm text-destructive mt-1">{inputError}</p>
            )}
          </div>
          
          {/* Main content area that takes remaining height */}
          <div className="flex-1 overflow-auto p-2 pt-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading articles...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-destructive mb-4">{error}</p>
                <button 
                  onClick={() => refreshArticles()}
                  className="text-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : articles.length > 0 ? (
              <DataTable 
                columns={columns.map(col => {
                  // For the actions column, we pass our handlers
                  if (col.id === 'actions') {
                    return {
                      ...col,
                      // Type-safe approach using function reference
                      cell: function(props: any) {
                        // Ensure the cell property is a function before calling it
                        if (typeof col.cell === 'function') {
                          return col.cell({
                            ...props,
                            handleStatusChange,
                            handleDeleteArticle
                          });
                        }
                        return null;
                      }
                    };
                  }
                  return col;
                })} 
                data={articles}
                onRowClick={handleArticleSelected}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No saved articles yet. Enter a URL above to add content.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}