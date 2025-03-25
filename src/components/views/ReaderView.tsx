import { Article } from "@/lib/types/article";
import { ArrowLeft, Bookmark, BookmarkCheck, ExternalLink, Share2, Moon, Sun, Minus, Plus, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useRef, useCallback } from "react";
import { useArticles } from "@/lib/context/article-context";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator
} from "@/components/ui/context-menu";
import "./reader-view.css";
import { createPortal } from "react-dom";

interface ReaderViewProps {
  article: Article;
  onBack: () => void;
  onStatusChange: (id: string, status: 'read' | 'unread') => void;
}

/**
 * Interface for content element props
 */
interface ContentElementProps {
  type: 'paragraph' | 'heading' | 'image' | 'list' | 'blockquote' | 'code';
  content: string;
  level?: number; // For headings (h1-h6)
  src?: string; // For images
  alt?: string; // For images
  isHighlighted?: boolean; // Whether the element is highlighted
  onDelete: () => void;
  onCopy: () => void;
  onHighlight?: () => void; // Optional callback for highlighting
  onRemoveHighlight?: () => void; // Optional callback for removing highlight
}

/**
 * ContentElement component that wraps article content with context menu functionality
 * while allowing text selection
 */
function ContentElement({ 
  type, 
  content, 
  level = 1, 
  src, 
  alt, 
  isHighlighted = false,
  onDelete, 
  onCopy,
  onHighlight,
  onRemoveHighlight 
}: ContentElementProps) {
  // State to track if context menu is open
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  
  // Render the appropriate element based on type with proper text selection support
  const renderElement = () => {
    // Common props for all elements to ensure text selection works
    const commonProps = {
      className: 'selectable-content',
    };
    
    switch (type) {
      case 'heading':
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
        return <HeadingTag {...commonProps} dangerouslySetInnerHTML={{ __html: content }} />;
      case 'paragraph':
        return <p {...commonProps} dangerouslySetInnerHTML={{ __html: content }} />;
      case 'image':
        return <img src={src} alt={alt || ''} />;
      case 'list':
        return <div {...commonProps} dangerouslySetInnerHTML={{ __html: content }} />;
      case 'blockquote':
        return <blockquote {...commonProps} dangerouslySetInnerHTML={{ __html: content }} />;
      case 'code':
        return <pre {...commonProps} dangerouslySetInnerHTML={{ __html: content }} />;
      default:
        return <p {...commonProps} dangerouslySetInnerHTML={{ __html: content }} />;
    }
  };
  
  // Handle right-click to directly delete highlighted elements
  const handleContextMenu = (e: React.MouseEvent) => {
    // Only handle right-click for highlighted elements
    if (isHighlighted) {
      e.preventDefault();
      // We're using the onDelete prop which only deletes this single element
      // This is the intended behavior for right-click on a single element
      onDelete();
    }
  };
  
  return (
    <ContextMenu onOpenChange={setIsContextMenuOpen}>
      <ContextMenuTrigger asChild>
        <div 
          className={`content-element-wrapper ${isContextMenuOpen ? 'context-menu-active' : ''} ${isHighlighted ? 'highlighted' : ''}`}
          data-selectable="true"
          onContextMenu={handleContextMenu}
        >
          {renderElement()}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64 context-menu-content">
        <ContextMenuItem onClick={onCopy}>
          <Copy className="mr-2 h-4 w-4" />
          <span>Copy content</span>
        </ContextMenuItem>
        
        {onHighlight && !isHighlighted && (
          <ContextMenuItem onClick={onHighlight}>
            <Bookmark className="mr-2 h-4 w-4" />
            <span>Highlight</span>
          </ContextMenuItem>
        )}
        
        {onRemoveHighlight && isHighlighted && (
          <ContextMenuItem onClick={onRemoveHighlight}>
            <BookmarkCheck className="mr-2 h-4 w-4" />
            <span>Remove highlight</span>
          </ContextMenuItem>
        )}
        
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete element</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

/**
 * Interface for parsed content element
 */
interface ParsedContentElement {
  id: string;
  type: ContentElementProps['type'];
  content: string;
  level?: number;
  src?: string;
  alt?: string;
  isHighlighted?: boolean;
}

/**
 * Custom hook for parsing and managing article content
 */
function useArticleContent(article: Article) {
  const { toast } = useToast();
  const { updateArticle } = useArticles();
  const [parsedContent, setParsedContent] = useState<ParsedContentElement[]>([]);
  
  // Track selected elements for batch operations
  const [selectedElements, setSelectedElements] = useState<Set<string>>(new Set());
  
  // Use a ref to keep track of the current selected elements for async operations
  const selectedElementsRef = useRef<Set<string>>(new Set());
  
  // Parse the HTML content into structured elements
  const parseContent = useCallback(() => {
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = article.content;
    
    const elements: typeof parsedContent = [];
    let id = 0;
    
    // Process all content elements in document order to preserve structure
    const processNode = (node: Element) => {
      // Skip comment nodes and script/style tags
      if (node.nodeType === Node.COMMENT_NODE || 
          node.nodeName.toLowerCase() === 'script' || 
          node.nodeName.toLowerCase() === 'style') {
        return;
      }
      
      const nodeName = node.nodeName.toLowerCase();
      
      // Handle different element types
      switch (nodeName) {
        case 'p':
          elements.push({
            id: `p-${id++}`,
            type: 'paragraph',
            content: node.innerHTML
          });
          break;
          
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          elements.push({
            id: `${nodeName}-${id++}`,
            type: 'heading',
            content: node.innerHTML,
            level: parseInt(nodeName.substring(1))
          });
          break;
          
        case 'img':
          const imgElement = node as HTMLImageElement;
          elements.push({
            id: `img-${id++}`,
            type: 'image',
            content: '',
            src: imgElement.src,
            alt: imgElement.alt || ''
          });
          break;
          
        case 'ul':
        case 'ol':
          elements.push({
            id: `list-${id++}`,
            type: 'list',
            content: node.outerHTML
          });
          break;
          
        case 'blockquote':
          elements.push({
            id: `blockquote-${id++}`,
            type: 'blockquote',
            content: node.innerHTML
          });
          break;
          
        case 'pre':
        case 'code':
          elements.push({
            id: `code-${id++}`,
            type: 'code',
            content: node.outerHTML
          });
          break;
          
        default:
          // For container elements, process their children
          if (node.children && node.children.length > 0) {
            Array.from(node.children).forEach(childNode => {
              processNode(childNode as Element);
            });
          } else if (node.textContent && node.textContent.trim()) {
            // For text-only elements with content, wrap in paragraph
            elements.push({
              id: `text-${id++}`,
              type: 'paragraph',
              content: node.textContent
            });
          }
          break;
      }
    };
    
    // Start processing from the main content containers
    const mainContent = tempDiv.querySelector('article') || 
                        tempDiv.querySelector('main') || 
                        tempDiv.querySelector('.content') || 
                        tempDiv;
    
    // Process all direct children of the main content container
    Array.from(mainContent.children).forEach(node => {
      processNode(node as Element);
    });
    
    setParsedContent(elements);
  }, [article.content]);
  
  // Initialize parsed content when article changes
  useEffect(() => {
    parseContent();
  }, [article.content, parseContent]);
  
  // Handle copying element content
  const handleCopy = (elementId: string) => {
    const element = parsedContent.find(el => el.id === elementId);
    if (!element) return;
    
    // Create a temporary div to extract text content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = element.content;
    const textContent = tempDiv.textContent || '';
    
    navigator.clipboard.writeText(textContent);
    toast({
      title: "Content copied",
      description: "Element content copied to clipboard",
    });
  };
  
  // Toggle highlight for an element
  const handleToggleHighlight = (elementId: string) => {
    // Log for debugging
    console.log('Toggling highlight for element:', elementId);
    
    const updatedContent = parsedContent.map(el => {
      if (el.id === elementId) {
        return { ...el, isHighlighted: !el.isHighlighted };
      }
      return el;
    });
    
    // Update the content state
    setParsedContent(updatedContent);
    
    // Find the element we just updated
    const element = updatedContent.find(el => el.id === elementId);
    
    // Update selected elements if highlighted
    if (element?.isHighlighted) {
      // Add to selected elements
      setSelectedElements(prev => {
        const newSet = new Set(prev);
        newSet.add(elementId);
        console.log('Added to selected elements, new count:', newSet.size);
        // Update the ref
        selectedElementsRef.current = newSet;
        return newSet;
      });
      
      toast({
        title: "Element highlighted",
        description: "The element has been highlighted",
      });
    } else {
      // Remove from selected elements
      setSelectedElements(prev => {
        const newSet = new Set(prev);
        newSet.delete(elementId);
        console.log('Removed from selected elements, new count:', newSet.size);
        // Update the ref
        selectedElementsRef.current = newSet;
        return newSet;
      });
      
      toast({
        title: "Highlight removed",
        description: "The highlight has been removed from the element",
      });
    }
    
    // Update the article with highlighted content
    saveContentToArticle(updatedContent);
  };
  
  // Delete all highlighted elements
  const handleDeleteHighlighted = async () => {
    // Use the ref to get the current selected elements
    const currentSelectedElements = selectedElementsRef.current;
    
    if (currentSelectedElements.size === 0) {
      console.log('No elements selected to delete');
      return;
    }
    
    try {
      // Log for debugging
      console.log('Deleting highlighted elements:', currentSelectedElements);
      console.log('Current content count:', parsedContent.length);
      
      // Store the count before deletion for the toast message
      const elementsToRemoveCount = currentSelectedElements.size;
      
      // Create a new array without the highlighted elements
      const updatedContent = parsedContent.filter(el => !currentSelectedElements.has(el.id));
      
      console.log('Updated content count:', updatedContent.length);
      console.log('Elements removed:', parsedContent.length - updatedContent.length);
      
      // Update state with the new content
      setParsedContent(updatedContent);
      
      // Clear the selected elements set
      setSelectedElements(new Set());
      selectedElementsRef.current = new Set();
      
      // Save the updated content
      await saveContentToArticle(updatedContent);
      
      toast({
        title: "Highlighted elements removed",
        description: `${elementsToRemoveCount} element(s) have been removed from the article`,
      });
    } catch (error) {
      console.error('ReaderView: Failed to delete highlighted elements:', error);
      toast({
        title: "Delete failed",
        description: "Failed to remove the highlighted elements",
        variant: "destructive"
      });
    }
  };
  
  // Clear all highlights without deleting elements
  const handleClearHighlights = async () => {
    // Use the ref to get the current selected elements
    const currentSelectedElements = selectedElementsRef.current;
    
    if (currentSelectedElements.size === 0) {
      console.log('No elements selected to clear');
      return;
    }
    
    try {
      console.log('Clearing highlights for elements:', currentSelectedElements.size);
      
      // Create a new array with highlights removed
      const updatedContent = parsedContent.map(el => ({
        ...el,
        isHighlighted: false
      }));
      
      setParsedContent(updatedContent);
      setSelectedElements(new Set());
      selectedElementsRef.current = new Set();
      
      // Save the updated content
      await saveContentToArticle(updatedContent);
      
      toast({
        title: "Selection cleared",
        description: "All highlights have been removed"
      });
    } catch (error) {
      console.error('ReaderView: Failed to clear highlights:', error);
      toast({
        title: "Clear failed",
        description: "Failed to clear the highlights",
        variant: "destructive"
      });
    }
  };
  
  // Helper function to save content to article
  const saveContentToArticle = async (contentElements: ParsedContentElement[]) => {
    console.log('Saving content to article, elements count:', contentElements.length);
    console.log('Highlighted elements count:', contentElements.filter(el => el.isHighlighted).length);
    
    // Rebuild the HTML content
    const tempDiv = document.createElement('div');
    contentElements.forEach(el => {
      let element: HTMLElement;
      
      switch (el.type) {
        case 'heading':
          element = document.createElement(`h${el.level || 1}`);
          element.innerHTML = el.content;
          break;
        case 'paragraph':
          element = document.createElement('p');
          element.innerHTML = el.content;
          break;
        case 'image':
          element = document.createElement('img');
          if (el.src) element.setAttribute('src', el.src);
          if (el.alt) element.setAttribute('alt', el.alt || '');
          break;
        case 'list':
          const listContainer = document.createElement('div');
          listContainer.innerHTML = el.content;
          element = listContainer.firstChild as HTMLElement || document.createElement('div');
          break;
        case 'blockquote':
          element = document.createElement('blockquote');
          element.innerHTML = el.content;
          break;
        case 'code':
          const codeContainer = document.createElement('div');
          codeContainer.innerHTML = el.content;
          element = codeContainer.firstChild as HTMLElement || document.createElement('pre');
          break;
        default:
          element = document.createElement('div');
          element.innerHTML = el.content;
      }
      
      // Add highlight class if element is highlighted
      if (el.isHighlighted) {
        element.classList.add('highlighted-content');
        console.log('Adding highlight class to element:', el.id);
      }
      
      tempDiv.appendChild(element);
    });
    
    // Update the article with the new content
    const updatedArticle = {
      ...article,
      content: tempDiv.innerHTML
    };
    
    try {
      console.log('Updating article with new content');
      await updateArticle(updatedArticle);
      console.log('Article updated successfully');
    } catch (error) {
      console.error('Failed to update article:', error);
      throw error;
    }
  };
  
  // Handle deleting element from the article
  const handleDelete = async (elementId: string) => {
    try {
      // Create a new array without the deleted element
      const updatedContent = parsedContent.filter(el => el.id !== elementId);
      setParsedContent(updatedContent);
      
      // Remove from selected elements if it was highlighted
      if (selectedElements.has(elementId)) {
        setSelectedElements(prev => {
          const newSet = new Set(prev);
          newSet.delete(elementId);
          return newSet;
        });
      }
      
      // Save the updated content
      await saveContentToArticle(updatedContent);
      
      toast({
        title: "Element removed",
        description: "The selected element has been removed from the article",
      });
    } catch (error) {
      console.error('ReaderView: Failed to delete element:', error);
      toast({
        title: "Delete failed",
        description: "Failed to remove the element",
        variant: "destructive"
      });
    }
  };
  
  return { 
    parsedContent, 
    handleCopy, 
    handleDelete, 
    handleToggleHighlight, 
    handleDeleteHighlighted,
    handleClearHighlights,
    hasHighlightedElements: selectedElements.size > 0 
  };
}

/**
 * ReaderView component for displaying article content in a clean, readable format
 * Following:
 * - Single Responsibility Principle: Component only handles article reading view
 * - Open/Closed Principle: Extensible through props without modification
 */
/**
 * ReaderView component for displaying and editing article content
 * Following Single Responsibility Principle by separating UI rendering from data management
 */
export function ReaderView({ article, onBack, onStatusChange }: ReaderViewProps) {
  const { toast } = useToast();
  const [fontSize, setFontSize] = useState<number>(18); // Default font size
  const [isFullWidth, setIsFullWidth] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(document.body.classList.contains('theme-dark'));
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Use the custom hook to manage article content
  const { 
    content, 
    isHighlighted,
    hasHighlightedElements,
    toggleHighlight,
    copyElementContent,
    deleteElement,
    deleteSelectedElements,
    clearHighlights
  } = useArticleContent(article);
  
  // Handle keyboard shortcuts for content cleanup
  const handleKeyDown = useCallback((e: React.KeyboardEvent | KeyboardEvent) => {
    // Only process if we have highlighted elements
    if (!hasHighlightedElements) return;
    
    // Delete key to remove highlighted elements
    if (e.key === 'Delete' || e.key === 'Backspace') {
      // Prevent default only if we're not in an input field
      if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        deleteSelectedElements();
      }
    }
    
    // Escape key to clear selection
    if (e.key === 'Escape') {
      e.preventDefault();
      clearHighlights();
    }
  }, [hasHighlightedElements, deleteSelectedElements, clearHighlights]);

  // Add keyboard event listeners with capture phase to ensure it works
  useEffect(() => {
    // Using the capture phase ensures our handler runs before other handlers
    // This helps with key events that might be intercepted by other components
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [handleKeyDown]);

  // Use a ref to track if we've already marked this article as read
  const hasMarkedAsRead = useRef<boolean>(false);

  // Mark article as read when opened (only once)
  useEffect(() => {
    // Only mark as read if the article is unread and we haven't already marked it
    if (article.status === 'unread' && !hasMarkedAsRead.current) {
      hasMarkedAsRead.current = true;
      onStatusChange(article.id, 'read');
    }
  }, [article.id]);

  // Handle sharing the article
  const handleShare = () => {
    navigator.clipboard.writeText(article.url);
    toast({
      title: "URL copied to clipboard",
      description: "You can now paste the link anywhere",
    });
  };

  // Handle toggling read status
  const toggleReadStatus = () => {
    const newStatus = article.status === 'read' ? 'unread' : 'read';
    onStatusChange(article.id, newStatus);
  };

  // Handle opening in browser
  const openInBrowser = () => {
    window.open(article.url, "_blank");
  };

  // Increase font size
  const increaseFontSize = () => {
    if (fontSize < 24) {
      setFontSize(fontSize + 1);
    }
  };

  // Decrease font size
  const decreaseFontSize = () => {
    if (fontSize > 14) {
      setFontSize(fontSize - 1);
    }
  };

  // Toggle full width reading
  const toggleFullWidth = () => {
    setIsFullWidth(!isFullWidth);
  };

  // Toggle dark/light mode for reading
  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
    }
    setIsDarkMode(!isDarkMode);
  };
  
  // This function is now handled by the useArticleContent hook

  return (
    <div className="h-full flex flex-col">
      {/* Header with article info and controls */}
      <div className="border-b p-2 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="hover:bg-background-modifier-hover"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleReadStatus}
              title={article.status === 'read' ? "Mark as unread" : "Mark as read"}
            >
              {article.status === 'read' ? 
                <BookmarkCheck className="w-4 h-4 text-interactive-accent" /> : 
                <Bookmark className="w-4 h-4" />
              }
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={openInBrowser}
              title="Open in browser"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleShare}
              title="Copy link"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <h1 className="text-xl font-bold leading-tight">{article.title}</h1>
        
        <div className="flex items-center text-sm text-muted-foreground gap-2">
          {article.author && <span>{article.author}</span>}
          {article.author && article.publishedAt && <span>•</span>}
          {article.publishedAt && (
            <span>
              {new Date(article.publishedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          )}
          {(article.author || article.publishedAt) && <span>•</span>}
          <span>{article.domain}</span>
        </div>
        
        {/* Reading controls */}
        <div className="flex items-center justify-between mt-2 text-sm">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={decreaseFontSize}
              className="h-7 w-7 p-0"
              title="Decrease font size"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={increaseFontSize}
              className="h-7 w-7 p-0"
              title="Increase font size"
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleFullWidth}
              className="h-7"
              title={isFullWidth ? "Narrow width" : "Full width"}
            >
              {isFullWidth ? "Narrow" : "Full width"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleDarkMode}
              className="h-7 w-7 p-0"
              title={isDarkMode ? "Light mode" : "Dark mode"}
            >
              {isDarkMode ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Article content */}
      <div className="flex-1 overflow-auto">
        <div 
          className={`py-4 mx-auto ${isFullWidth ? 'px-4' : 'px-4 max-w-2xl'}`}
          style={{ 
            backgroundColor: isDarkMode ? 'var(--background-primary)' : 'var(--background-primary)',
            color: isDarkMode ? 'var(--text-normal)' : 'var(--text-normal)'
          }}
        >
          {article.image && (
            <div className="mb-6">
              <img 
                src={article.image} 
                alt={article.title} 
                className="w-full h-auto rounded-lg object-cover max-h-80"
              />
            </div>
          )}
          
          <div 
            ref={contentRef}
            className={`reader-view-content ${isDarkMode ? 'theme-dark' : 'theme-light'}`}
            style={{ fontSize: `${fontSize}px` }}
          >
            {hasHighlightedElements && (
              <div className="batch-actions p-2 mb-4 bg-muted rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Multiple elements selected</span>
                  <span className="text-xs text-muted-foreground">(Right-click individual highlighted elements to delete them, or press Delete key to remove all highlighted elements)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearHighlights}
                    className="flex items-center gap-1"
                  >
                    <span>Clear Selection</span>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={deleteSelectedElements}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete selected</span>
                  </Button>
                </div>
              </div>
            )}
            {/* Add null check and fallback for content */}
            {Array.isArray(content) && content.length > 0 ? (
              content.map((element) => (
                <ContentElement
                  key={element.id}
                  element={element}
                  onCopy={() => copyElementContent(element.id)}
                  onDelete={() => deleteElement(element.id)}
                  onToggleHighlight={() => toggleHighlight(element.id)}
                />
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                <p>No content available for this article.</p>
                <p className="text-sm">Try refreshing or selecting another article.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
