import Link from 'next/link';
import Header from './header';
import Footer from './footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">{children}</main>
      <Footer />
    </div>
  );
}