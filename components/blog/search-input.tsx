'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = "Search..." }: SearchInputProps) {
  return (
    <div className="relative max-w-md mx-auto mb-8">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="size-4 text-muted-foreground" />
      </div>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-16 bg-muted border-muted-foreground/20 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-muted-foreground/20 h-12 text-base"
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-medium text-muted-foreground bg-background border border-muted-foreground/20 rounded">
          Shift S
        </kbd>
      </div>
    </div>
  );
}