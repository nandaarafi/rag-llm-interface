"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {MinimalCardDemo}  from './features';
import { GoogleIcon } from "@/components/ui/google-icon";
import { signIn } from 'next-auth/react';
import { toast } from '@/components/toast';
import CTA from './cta';
import FAQ from './faq';

export default function MarketingPage() {

    const handleGoogleSignIn = async (e: React.MouseEvent) => {
      e.preventDefault();
      try {
        // Clear any previous form state when starting Google OAuth
        window.history.replaceState({}, '', '/login');
        await signIn('google', { callbackUrl: '/chat' });
      } catch (error) {
        console.error('Google sign-in error:', error);
        toast({
          type: 'error',
          description: 'Failed to sign in with Google. Please try again.',
        });
      }
    };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-24 lg:py-32">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <Badge variant="secondary" className="mx-auto">
              ✨ Powered by Advanced AI
            </Badge>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              AI-Powered Conversations
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience the future of AI assistance with our advanced chatbot platform.
              Create, collaborate, and explore with intelligent conversations that understand your needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button variant="outline" size="sm" className="text-lg px-8 py-6 rounded-full" onClick={handleGoogleSignIn}>
                <GoogleIcon /> Join With Google
              </Button>
              <Button asChild size="sm" className="text-lg px-8 py-6 rounded-full">
                <Link href="/blog">Start 3 Day Free Trial</Link>
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Free tier available
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-muted/30">
        {/* <div className="container mx-auto px-4"> */}
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Choose Our Platform?
            </h1>
            <div className="flex justify-center">
              <MinimalCardDemo/>
            </div>
          </div>
      </section>
      <CTA/>
      <FAQ/>

    </div>
  );
}