import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import type { DBMessage } from '@/lib/db/schema';
import type { Attachment, UIMessage } from 'ai';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await auth();

  // Try to get chat with appropriate context
  let chat: Awaited<ReturnType<typeof getChatById>>;
  if (session?.user?.id) {
    // User is logged in - try to get chat (works for both private and public)
    chat = await getChatById({ id, userId: session.user.id });
  } else {
    // User not logged in - can only access public chats
    chat = await getChatById({ id });
  }

  // If logged-in user couldn't access the chat, try as anonymous (for public chats)
  if (!chat && session?.user?.id) {
    chat = await getChatById({ id });
  }

  if (!chat) {
    notFound();
  }

  // Additional access control for private chats
  if (chat.visibility === 'private') {
    if (!session || !session.user) {
      return notFound();
    }

    if (session.user.id !== chat.userId) {
      return notFound();
    }
  }

  // Determine if user is the owner
  const isOwner = session?.user?.id === chat.userId;
  
  // Get messages with appropriate context
  // For public chats, non-owners should access like anonymous users
  const messagesFromDb = await getMessagesByChatId({
    id,
    userId: isOwner ? session?.user?.id : undefined,
  });

  function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
    return messages.map((message) => ({
      id: message.id,
      parts: message.parts as UIMessage['parts'],
      role: message.role as UIMessage['role'],
      // Note: content will soon be deprecated in @ai-sdk/react
      content: '',
      createdAt: message.createdAt,
      experimental_attachments:
        (message.attachments as Array<Attachment>) ?? [],
    }));
  }

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');

  if (!chatModelFromCookie) {
    return (
      <>
        <Chat
          id={chat.id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          selectedChatModel={DEFAULT_CHAT_MODEL}
          selectedVisibilityType={chat.visibility}
          isReadonly={!isOwner}
        />
        <DataStreamHandler id={id} />
      </>
    );
  }

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedChatModel={chatModelFromCookie.value}
        selectedVisibilityType={chat.visibility}
        isReadonly={!isOwner}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
