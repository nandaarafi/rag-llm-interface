import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { AgentAwareChat } from '@/components/agent-aware-chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';

export default async function Page() {
  // Require authentication for general /chat page
  const session = await auth();
  if (!session) {
    redirect('/login');
  }
  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');

  const selectedChatModel = modelIdFromCookie?.value || DEFAULT_CHAT_MODEL;

  return (
    <>
      <AgentAwareChat
        key={id}
        id={id}
        initialMessages={[]}
        selectedChatModel={selectedChatModel}
        selectedVisibilityType="private"
        isReadonly={false}
        userId={session.user?.id}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
