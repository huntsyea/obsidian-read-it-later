/**
 * Represents a command that can be registered with Obsidian
 * Following TypeScript best practices with clear type definitions
 */
export interface Command {
  /**
   * Unique identifier for the command
   */
  id: string;
  
  /**
   * Display name for the command in the Obsidian command palette
   */
  name: string;
  
  /**
   * Icon to display for the command (using Obsidian's icon set)
   */
  icon?: string;
  
  /**
   * Hotkey to assign to the command (optional)
   */
  hotkey?: string;
  
  /**
   * Function to execute when the command is triggered
   * @param plugin Reference to the plugin instance
   */
  execute: (plugin: any) => Promise<void> | void;
}
