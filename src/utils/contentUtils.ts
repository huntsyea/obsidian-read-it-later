import { Article } from '../lib/types/article';

/**
 * Interface for parsed content elements with strong typing
 */
export interface ParsedContentElement {
  id: string;
  type: 'paragraph' | 'heading' | 'image' | 'list' | 'code' | 'blockquote';
  content: string;
  level?: number;
  src?: string;
  alt?: string;
  isHighlighted?: boolean;
}

/**
 * Pure function to parse HTML content into structured elements
 * Following single responsibility principle by focusing only on parsing
 * @param htmlContent HTML string to parse
 * @returns Array of parsed content elements
 */
export function parseArticleContent(htmlContent: string): ParsedContentElement[] {
  // Handle empty or undefined content
  if (!htmlContent || htmlContent.trim() === '') {
    console.warn('Empty content provided to parseArticleContent');
    return [{
      id: 'empty-content',
      type: 'paragraph',
      content: 'No content available for this article.'
    }];
  }
  
  try {
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const elements: ParsedContentElement[] = [];
    let id = 0;
    
    // If no children found after parsing, return a default message
    if (tempDiv.children.length === 0) {
      return [{
        id: 'empty-parsed-content',
        type: 'paragraph',
        content: 'Content could not be parsed properly.'
      }];
    }
  
  // Process all content elements in document order to preserve structure
  Array.from(tempDiv.children).forEach(node => {
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
        elements.push({
          id: `img-${id++}`,
          type: 'image',
          content: '',
          src: (node as HTMLImageElement).src,
          alt: (node as HTMLImageElement).alt
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
        
      case 'pre':
        elements.push({
          id: `code-${id++}`,
          type: 'code',
          content: node.innerHTML
        });
        break;
        
      case 'blockquote':
        elements.push({
          id: `blockquote-${id++}`,
          type: 'blockquote',
          content: node.innerHTML
        });
        break;
        
      default:
        // Handle other elements as paragraphs
        elements.push({
          id: `element-${id++}`,
          type: 'paragraph',
          content: node.outerHTML
        });
    }
  });
  
    return elements;
  } catch (error) {
    console.error('Error parsing article content:', error);
    // Return a fallback element when parsing fails
    return [{
      id: 'parsing-error',
      type: 'paragraph',
      content: 'An error occurred while parsing the article content.'
    }];
  }
}

/**
 * Pure function to generate HTML from parsed content elements
 * @param contentElements Array of content elements
 * @returns HTML string
 */
export function generateHtmlFromContent(contentElements: ParsedContentElement[]): string {
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
    
    tempDiv.appendChild(element);
  });
  
  return tempDiv.innerHTML;
}

/**
 * Pure function to save content to an article
 * @param content Array of content elements
 * @param article Article to update
 * @param updateArticle Function to update the article
 */
export async function saveContentToArticle(
  content: ParsedContentElement[], 
  article: Article, 
  updateArticle: (article: Article) => Promise<void>
): Promise<void> {
  const htmlContent = generateHtmlFromContent(content);
  
  await updateArticle({
    ...article,
    content: htmlContent
  });
}
