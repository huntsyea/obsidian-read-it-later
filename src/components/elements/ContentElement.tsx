import React, { useState } from 'react';
import { Bookmark, BookmarkCheck, Copy, Trash2 } from 'lucide-react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '../ui/context-menu';
import { ParsedContentElement } from '../../utils/contentUtils';

interface ContentElementProps {
  element: ParsedContentElement;
  onCopy: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleHighlight: (id: string) => void;
}

/**
 * ContentElement component for rendering different types of article content
 * Following Single Responsibility Principle by focusing only on rendering
 */
export function ContentElement({ 
  element,
  onCopy, 
  onDelete,
  onToggleHighlight
}: ContentElementProps) {
  const [isContextMenuOpen, setIsContextMenuOpen] = useState<boolean>(false);
  
  // Handle right-click to directly delete highlighted elements
  const handleContextMenu = (e: React.MouseEvent) => {
    // Only handle right-click for highlighted elements
    if (element.isHighlighted) {
      e.preventDefault();
      onDelete(element.id);
    }
  };
  
  // Render the appropriate element based on type with improved type safety
  const renderElement = () => {
    // Guard against null or undefined element
    if (!element || !element.type) {
      console.error('Invalid element received in ContentElement', element);
      return <p className="text-destructive">Error: Invalid content element</p>;
    }
    
    // Use type-safe switch with exhaustive check
    switch (element.type) {
      case 'heading':
        // Handle heading levels properly
        switch (element.level) {
          case 1: return <h1 dangerouslySetInnerHTML={{ __html: element.content }} />;
          case 2: return <h2 dangerouslySetInnerHTML={{ __html: element.content }} />;
          case 3: return <h3 dangerouslySetInnerHTML={{ __html: element.content }} />;
          case 4: return <h4 dangerouslySetInnerHTML={{ __html: element.content }} />;
          case 5: return <h5 dangerouslySetInnerHTML={{ __html: element.content }} />;
          case 6: return <h6 dangerouslySetInnerHTML={{ __html: element.content }} />;
          default: return <h2 dangerouslySetInnerHTML={{ __html: element.content }} />;
        }
        
      case 'paragraph':
        return <p dangerouslySetInnerHTML={{ __html: element.content }} />;
        
      case 'image':
        return <img 
          src={element.src || ''} 
          alt={element.alt || ''} 
          className="w-full h-auto" 
          onError={(e) => {
            console.error('Failed to load image', element.src);
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPkltYWdlIGVycm9yPC90ZXh0Pjwvc3ZnPg==';
          }}
        />;
        
      case 'list':
        return <div dangerouslySetInnerHTML={{ __html: element.content }} />;
        
      case 'blockquote':
        return <blockquote dangerouslySetInnerHTML={{ __html: element.content }} />;
        
      case 'code':
        return <pre><code dangerouslySetInnerHTML={{ __html: element.content }} /></pre>;
        
      default:
        // Type-safe exhaustive check
        const exhaustiveCheck: never = element.type;
        console.error(`Unknown element type: ${exhaustiveCheck}`);
        return <div className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: element.content || 'Unknown content type' }} />;
    }
  };
  
  return (
    <ContextMenu onOpenChange={setIsContextMenuOpen}>
      <ContextMenuTrigger asChild>
        <div 
          className={`content-element-wrapper ${isContextMenuOpen ? 'context-menu-active' : ''} ${element.isHighlighted ? 'highlighted' : ''}`}
          data-selectable="true"
          onContextMenu={handleContextMenu}
        >
          {renderElement()}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onCopy(element.id)} className="flex items-center gap-2">
          <Copy className="h-4 w-4" />
          <span>Copy content</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onToggleHighlight(element.id)} className="flex items-center gap-2">
          {element.isHighlighted ? (
            <>
              <BookmarkCheck className="h-4 w-4" />
              <span>Remove highlight</span>
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4" />
              <span>Highlight</span>
            </>
          )}
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onDelete(element.id)} 
          className="flex items-center gap-2 text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
