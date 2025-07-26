import { auth } from '@/app/(auth)/auth';
import { getChatById, getVotesByChatId, voteMessage } from '@/lib/db/queries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new Response('chatId is required', { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Try to get chat with user context first
  let chat = await getChatById({ id: chatId, userId: session.user.id });
  
  // If user can't access it, try as anonymous (for public chats)
  if (!chat) {
    chat = await getChatById({ id: chatId });
  }

  if (!chat) {
    return new Response('Chat not found', { status: 404 });
  }

  // Allow access if user owns the chat OR if it's a public chat
  const isOwner = chat.userId === session.user.id;
  const isPublic = chat.visibility === 'public';
  
  if (!isOwner && !isPublic) {
    return new Response('Unauthorized', { status: 401 });
  }

  const votes = await getVotesByChatId({ id: chatId });

  return Response.json(votes, { status: 200 });
}

export async function PATCH(request: Request) {
  const {
    chatId,
    messageId,
    type,
  }: { chatId: string; messageId: string; type: 'up' | 'down' } =
    await request.json();

  if (!chatId || !messageId || !type) {
    return new Response('messageId and type are required', { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    return new Response('Unauthorized', { status: 401 });
  }

  const chat = await getChatById({ id: chatId, userId: session.user.id });

  if (!chat) {
    return new Response('Chat not found', { status: 404 });
  }

  // Only chat owners can vote on messages
  if (chat.userId !== session.user.id) {
    return new Response('Unauthorized - Only chat owners can vote', { status: 401 });
  }

  await voteMessage({
    chatId,
    messageId,
    type: type,
  });

  return new Response('Message voted', { status: 200 });
}
