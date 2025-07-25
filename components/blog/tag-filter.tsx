'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TagFilterProps {
  allTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearAll: () => void;
}

export function TagFilter({ allTags, selectedTags, onTagToggle, onClearAll }: TagFilterProps) {
  return (
    <div className="sticky top-8">
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Choose topics</h3>
          {selectedTags.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                  isSelected 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
        
        {selectedTags.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {selectedTags.length} topic{selectedTags.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}
      </div>
    </div>
  );
}