import Link from 'next/link';
import { ArrowLeft, FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFoundDocument() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 p-3 rounded-full bg-muted">
            <FileX className="size-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Document Not Found</CardTitle>
          <CardDescription className="text-base">
            The document you're looking for doesn't exist or you don't have permission to view it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>This could happen if:</p>
            <ul className="list-disc list-inside text-left space-y-1 ml-4">
              <li>The document was deleted</li>
              <li>The URL is incorrect</li>
              <li>You don't have access to this document</li>
              <li>The document is private</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button asChild variant="outline" className="w-full">
              <Link href="/chat/library">
                <ArrowLeft className="size-4 mr-2" />
                Back to Library
              </Link>
            </Button>
            <Button asChild className="w-full">
              <Link href="/">
                Start New Chat
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}