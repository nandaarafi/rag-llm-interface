import { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read our latest blog posts and insights.',
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-lg text-muted-foreground">
          Insights, tutorials, and updates from our team.
        </p>
      </div>
      
      <div className="grid gap-6">
        {posts.map((post) => (
          <article key={post.slug} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <Link href={`/blog/${post.slug}`} className="block">
              <h2 className="text-2xl font-semibold mb-2 hover:text-blue-600 transition-colors">
                {post.title}
              </h2>
              <p className="text-muted-foreground mb-3">{post.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}