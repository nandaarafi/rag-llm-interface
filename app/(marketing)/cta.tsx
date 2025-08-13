"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GoogleIcon } from "@/components/ui/google-icon";
import { signIn } from 'next-auth/react';
import { toast } from '@/components/toast';

export default function CTA() {
  const handleGoogleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
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
    <section className="py-16 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto border-0 shadow-lg">
          <CardContent className="p-8 lg:p-12">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Ready to Get Started?
              </h2>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Join thousands of users who are already experiencing the power of AI-driven conversations. 
                Start your free trial today and unlock unlimited possibilities.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-6 rounded-full hover:scale-105 transition-transform shadow-lg border-t border-l border-gray-600 shadow-black/50" 
                  onClick={handleGoogleSignIn}
                >
                  <GoogleIcon />
                  Sign Up with Google
                </Button>
                <Button 
                  asChild 
                  size="lg" 
                  className="text-lg px-8 py-6 rounded-full hover:scale-105 transition-transform shadow-lg border-t border-l border-gray-600 shadow-black/50"
                >
                  <Link href="/register">Start With Free Credits</Link>
                </Button>
              </div>
              
              <div className="flex items-center justify-center gap-8 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="size-2 bg-green-500 rounded-full animate-pulse" />
                  Free Credits
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 bg-blue-500 rounded-full animate-pulse" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 bg-purple-500 rounded-full animate-pulse" />
                  Cancel anytime
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}