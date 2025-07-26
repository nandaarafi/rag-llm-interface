import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';
import { BlogWithFilter } from '@/components/blog/blog-with-filter';

export const metadata: Metadata = {
  title: 'Mindscribe | Blog',
  description: 'Read our latest blog posts and insights.',
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="container max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Insights, tutorials, and updates from our team.
        </p>
      </div>
      
      <BlogWithFilter posts={posts} />
    </div>
  );
}