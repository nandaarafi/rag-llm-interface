import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { auth } from '@/app/(auth)/auth';
import { getDocumentsByUserId } from '@/lib/db/queries';
import type { Document } from '@/lib/db/schema';
import { DocumentManagerClient } from './components/document-manager-client';

type DocumentWithFormatted = Document & {
  formattedDate: string;
};

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export default async function DocumentManager() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return (
      <div className="container py-8 space-y-6 px-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Manage and organize your uploaded documents
          </p>
        </div>
        <Card className="text-center p-8">
          <div className="text-muted-foreground">
            <h3 className="text-lg font-medium">Sign in required</h3>
            <p className="mt-2">Please sign in to view your documents</p>
            <Button asChild className="mt-4">
              <a href="/login">Sign In</a>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  let documents: DocumentWithFormatted[] = [];
  let error: string | null = null;

  try {
    const userDocuments = await getDocumentsByUserId({ userId: session.user.id });
    documents = userDocuments.map(doc => ({
      ...doc,
      formattedDate: formatRelativeDate(doc.createdAt)
    }));
  } catch (err) {
    console.error('Error fetching documents:', err);
    error = 'Failed to load documents';
  }

  return <DocumentManagerClient documents={documents} error={error} />;
}