import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { TableOfContents } from '@/components/blog/table-of-contents';
import { MarkdownWithHeadings } from '@/components/blog/markdown-with-headings';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);
  
  if (!post) {
    return {
      title: 'Post not found',
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          Back to blog
        </Link>
        
        {/* Thumbnail Image */}
        {post.thumbnail && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img 
              src={post.thumbnail} 
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>
        )}
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span 
                key={tag}
                className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Title */}
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        
        {/* Author and Published Date */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
          <span>By {post.author}</span>
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          {post.readingTime && (
            <span>{post.readingTime} min read</span>
          )}
        </div>
        
        {/* Description */}
        <p className="text-xl text-muted-foreground mb-6 border-b pb-6">{post.description}</p>
      </div>
      
      {/* Main content area with sidebar */}
      <div className="flex gap-8">
        {/* Article content */}
        <article className="prose prose-gray dark:prose-invert max-w-none flex-1 min-w-0">
          <MarkdownWithHeadings content={post.content} />
        </article>
        
        {/* Table of Contents sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <TableOfContents content={post.content} />
        </aside>
      </div>
    </div>
  );
}