import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocumentViewer } from './components/document-viewer';
import { getDocumentById } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';

interface DocumentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: DocumentPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const document = await getDocumentById({ id, userId: undefined });
    
    if (!document) {
      return {
        title: 'Document Not Found',
        description: 'The requested document could not be found.',
      };
    }

    return {
      title: `${document.title} | MindScribe`,
      description: `View ${document.kind} document: ${document.title}`,
      openGraph: {
        title: document.title,
        description: `${document.kind} document created with MindScribe`,
        type: 'article',
      },
    };
  } catch {
    return {
      title: 'Document Not Found',
      description: 'The requested document could not be found.',
    };
  }
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const session = await auth();
  const document = await getDocumentById({ 
    id: (await params).id, 
    userId: session?.user?.id 
  });

  if (!document) {
    notFound();
  }

  // Check if document is private and user doesn't have access
  // For now, we'll allow public viewing, but you can add access control here
  // if (document.userId !== session?.user?.id && !document.isPublic) {
  //   notFound();
  // }

  return (
    <DocumentViewer 
      document={document}
      isReadonly={!session?.user?.id || document.userId !== session.user.id}
    />
  );
}