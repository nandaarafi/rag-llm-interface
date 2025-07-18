import Link from 'next/link';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto p-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              AI Chatbot
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/blog" className="text-sm hover:text-blue-600 transition-colors">
                Blog
              </Link>
              <Link href="/pricing" className="text-sm hover:text-blue-600 transition-colors">
                Pricing
              </Link>
              <Link href="/login" className="text-sm hover:text-blue-600 transition-colors">
                Login
              </Link>
            </div>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}