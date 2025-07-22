import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read our latest blog posts and insights.',
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Insights, tutorials, and updates from our team.
        </p>
      </div>
      
      <div className="grid gap-8">
        {posts.map((post) => (
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
        ))}
      </div>
    </div>
  );
}