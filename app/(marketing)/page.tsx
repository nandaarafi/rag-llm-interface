import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MarketingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          AI-Powered Conversations
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience the future of AI assistance with our advanced chatbot platform.
          Create, collaborate, and explore with intelligent conversations.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/login">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/blog">Read Blog</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}