import { useState, useMemo, useCallback } from 'react';

/**
 * Custom hook for managing selection of items with IDs
 * Follows single responsibility principle by focusing only on selection management
 */
export function useSelectionManager<T extends { id: string }>(items: T[]) {
  // State to track selected item IDs
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Memoized array of selected items for performance
  const selectedItems = useMemo(() => 
    items.filter(item => selectedIds.has(item.id)), 
    [items, selectedIds]
  );
  
  // Toggle selection status of an item
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);
  
  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);
  
  // Check if an item is selected
  const isSelected = useCallback((id: string) => 
    selectedIds.has(id), 
    [selectedIds]
  );
  
  return {
    selectedIds,
    selectedItems,
    isSelected,
    toggleSelection,
    clearSelection,
    hasSelection: selectedIds.size > 0
  };
}
