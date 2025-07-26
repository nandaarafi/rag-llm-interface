
import { auth } from '@/app/(auth)/auth';
import Header from './header';
import Footer from './footer';

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={!!session?.user} />
      <main className="pt-16">{children}</main>
      <Footer />
    </div>
  );
}