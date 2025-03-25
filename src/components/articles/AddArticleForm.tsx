import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { PlusCircle, Loader2 } from "lucide-react";
import { ArticleExtractorService } from "@/lib/services/article-extractor.service";
import { Article } from "@/lib/types/article";
import { useToast } from "@/hooks/use-toast";

/**
 * Props interface for AddArticleForm
 * Following Interface Segregation Principle with a focused interface
 */
interface AddArticleFormProps {
  onArticleAdded: (article: Article) => Promise<void>;
}

/**
 * Component for adding new articles via URL input
 * Following:
 * - Single Responsibility Principle: Component only handles adding articles
 * - Dependency Inversion: Depends on abstractions (interfaces) not implementations
 */
export function AddArticleForm({ onArticleAdded }: AddArticleFormProps) {
  // State management with proper typing
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Toast notifications
  const { toast } = useToast();
  
  // Article extractor service instance
  const articleExtractor = new ArticleExtractorService();

  /**
   * Handles form submission
   * Extracts article content from URL using Defuddle
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Extract article content using Defuddle
      const result = await articleExtractor.extractFromUrl(url);
      
      if (result.success && result.article) {
        try {
          // Add the article to the list
          await onArticleAdded(result.article);
          
          // Reset form and close dialog
          setUrl("");
          setIsOpen(false);
          
          // Success notification is now handled by the parent component
        } catch (addError) {
          setError("Failed to save the article. Please try again.");
        }
      } else {
        setError(result.error || "Failed to extract article content");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" />
          <span>Add Article</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Article</DialogTitle>
          <DialogDescription>
            Enter a URL to save an article for later reading
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              id="url"
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="w-full"
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isLoading || !url.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                "Save Article"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
