'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TagFilter } from '@/components/blog/tag-filter';
import { SearchInput } from '@/components/blog/search-input';
import type { BlogPost } from '@/lib/blog';

interface BlogWithFilterProps {
  posts: BlogPost[];
}

export function BlogWithFilter({ posts }: BlogWithFilterProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'S' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Get all unique tags from posts
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach(post => {
      post.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [posts]);

  // Filter posts based on search query and selected tags
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Filter by search query (title and description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query)
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(post => 
        selectedTags.some(selectedTag => 
          post.tags?.includes(selectedTag)
        )
      );
    }

    return filtered;
  }, [posts, searchQuery, selectedTags]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearAll = () => {
    setSelectedTags([]);
    setSearchQuery('');
  };

  return (
    <div>
      {/* Search Input */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search..."
      />
      
      <div className="flex gap-8">
        {/* Main content area */}
        <div className="flex-1 min-w-0">
          <div className="grid gap-8">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-4">
                  No posts found{searchQuery.trim() ? ' for your search' : selectedTags.length > 0 ? ' for the selected topics' : ''}.
                </p>
                <button
                  onClick={handleClearAll}
                  className="text-primary hover:underline"
                >
                  Clear {searchQuery.trim() && selectedTags.length > 0 ? 'search and filters' : searchQuery.trim() ? 'search' : 'filters'} to see all posts
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <article key={post.slug} className="group">
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="flex flex-col md:flex-row gap-6">
                      {post.thumbnail && (
                        <div className="md:w-1/3 overflow-hidden rounded-lg">
                          <div className="relative aspect-video">
                            <Image
                              src={post.thumbnail}
                              alt={post.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        </div>
                      )}
                      <div className="md:w-2/3">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {post.tags?.map((tag) => (
                            <span 
                              key={tag}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h2 className="text-2xl font-bold mb-2 inline group-hover:bg-gradient-to-r from-slate-50 via-stone-300 to-slate-50 transition-colors">
                          {post.title}
                        </h2>
                        <p className="text-muted-foreground mb-3 line-clamp-2">{post.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <time dateTime={post.publishedAt}>
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </time>
                          {post.readingTime && (
                            <span>• {post.readingTime} min read</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))
            )}
          </div>
        </div>

        {/* Sidebar with tag filter */}
        <aside className="hidden lg:block w-80 shrink-0">
          <TagFilter
            allTags={allTags}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            onClearAll={handleClearAll}
          />
        </aside>
      </div>
    </div>
  );
}