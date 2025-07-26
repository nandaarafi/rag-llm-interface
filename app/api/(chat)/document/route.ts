import { auth } from '@/app/(auth)/auth';
import type { ArtifactKind } from '@/components/artifact';
import {
  deleteDocumentsByIdAfterTimestamp,
  getDocumentsById,
  saveDocument,
} from '@/lib/db/queries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const session = await auth();

  // Try to get documents with appropriate context
  let documents;
  if (session?.user?.id) {
    // User is logged in - try to get documents (works for both private and public)
    documents = await getDocumentsById({ id, userId: session.user.id });
    
    // If logged-in user couldn't access it, try as anonymous (for public documents)
    if (documents.length === 0) {
      documents = await getDocumentsById({ id });
    }
  } else {
    // User not logged in - try to access public documents only
    documents = await getDocumentsById({ id });
  }

  const [document] = documents;

  if (!document) {
    return new Response('Not found', { status: 404 });
  }

  return Response.json(documents, { status: 200 });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const session = await auth();

  // POST (editing) requires authentication - anonymous users cannot edit documents
  if (!session?.user?.id) {
    return new Response('Unauthorized - Document editing requires authentication', { status: 401 });
  }

  const {
    content,
    title,
    kind,
  }: { content: string; title: string; kind: ArtifactKind } =
    await request.json();

  const documents = await getDocumentsById({ id, userId: session.user.id });

  if (documents.length > 0) {
    const [document] = documents;

    if (document.userId !== session.user.id) {
      return new Response('Forbidden', { status: 403 });
    }
  }

  const document = await saveDocument({
    id,
    content,
    title,
    kind,
    userId: session.user.id,
  });

  return Response.json(document, { status: 200 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const timestamp = searchParams.get('timestamp');

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  if (!timestamp) {
    return new Response('Missing timestamp', { status: 400 });
  }

  const session = await auth();

  // DELETE requires authentication - anonymous users cannot delete documents
  if (!session?.user?.id) {
    return new Response('Unauthorized - Document deletion requires authentication', { status: 401 });
  }

  const documents = await getDocumentsById({ id, userId: session.user.id });

  const [document] = documents;

  if (document.userId !== session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const documentsDeleted = await deleteDocumentsByIdAfterTimestamp({
    id,
    timestamp: new Date(timestamp),
  });

  return Response.json(documentsDeleted, { status: 200 });
}
