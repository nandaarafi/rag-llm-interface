import Link from 'next/link';
import NavBar from './navbar';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header>
        <div className="container mx-auto p-4">
          <NavBar />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}