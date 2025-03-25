import { ItemView, WorkspaceLeaf } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import { StrictMode } from "react";
import { App } from "@/App";
import { ArticleProvider } from "@/lib/context/article-context";
import { StorageService } from "@/lib/services/storage.service";

export const VIEW_TYPE_READ_IT_LATER = "read-it-later-view";

/**
 * Main view for the Read It Later plugin
 * Renders the React application with the ArticleProvider context
 */
export class ReadItLaterView extends ItemView {
  root: Root;
  storageService: StorageService;

  /**
   * Create a new ReadItLaterView
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
    return VIEW_TYPE_READ_IT_LATER;
  }

  /**
   * Get the display text for this view
   * @returns The display text
   */
  getDisplayText() {
    return "Read It Later";
  }

  /**
   * Called when the view is opened
   * Renders the React application with the ArticleProvider context
   */
  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    // Add the scoping class to the container element
    container.addClass('obsidian-read-it-later-plugin');
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
