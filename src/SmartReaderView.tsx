import { ItemView, WorkspaceLeaf } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import { StrictMode } from "react";
import { App } from "@/App";
import { ArticleProvider } from "@/lib/context/article-context";
import { StorageService } from "@/lib/services/storage.service";

export const VIEW_TYPE_SMART_READER = "smart-reader-view";

/**
 * Main view for the Smart Reader plugin
 * Renders the React application with the ArticleProvider context
 */
export class SmartReaderView extends ItemView {
  root: Root;
  storageService: StorageService;

  /**
   * Create a new SmartReaderView
   * @param leaf The workspace leaf to render in
   * @param storageService The storage service for article data
   */
  constructor(leaf: WorkspaceLeaf, storageService: StorageService) {
    super(leaf);
    this.storageService = storageService;
  }

  /**
   * Get the type of this view
   * @returns The view type
   */
  getViewType() {
    return VIEW_TYPE_SMART_READER;
  }

  /**
   * Get the display text for this view
   * @returns The display text
   */
  getDisplayText() {
    return "Smart Reader";
  }

  /**
   * Called when the view is opened
   * Renders the React application with the ArticleProvider context
   */
  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    // Add the scoping class to the container element
    container.addClass('obsidian-smart-reader-plugin');
    this.root = createRoot(container);
    
    // Render the React application with the ArticleProvider context
    this.root.render(
      <StrictMode>
        <ArticleProvider storageService={this.storageService}>
          <App />
        </ArticleProvider>
      </StrictMode>
    );
  }

  /**
   * Called when the view is closed
   * Unmounts the React application
   */
  async onClose() {
    this.root.unmount();
  }
}
