'use client';

import type { Attachment, UIMessage } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useState , } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, generateUUID } from '@/lib/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import type { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { toast } from 'sonner';
import { unstable_serialize } from 'swr/infinite';
import { getChatHistoryPaginationKey } from './sidebar-history';
import { PaywallModal } from './paywall-modal';

import { useCredits } from '@/contexts/credit-context';

export function Chat({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const { mutate } = useSWRConfig();
  const { decrementCredit, refetchCredits, credits, planType } = useCredits();

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
  } = useChat({
    id,
    body: { id, selectedChatModel: selectedChatModel },
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
      // Update credits immediately for better UX, then refetch to ensure accuracy
      decrementCredit();
      // Refetch credits from server to ensure sync (in case of any discrepancies)
      setTimeout(async () => {
        try {
          await refetchCredits();
          console.log('✅ Credits refetched successfully after message');
        } catch (error) {
          console.error('❌ Failed to refetch credits after message:', error);
          // Retry once more after 3 seconds if first attempt fails
          setTimeout(() => refetchCredits(), 3000);
        }
      }, 1000);
    },
    onError: (error: any) => {
      console.log('💥 Chat Error:', error);
      
      const isCreditError = 
        error?.message?.includes('credit limit');
      if (isCreditError) {
        // console.log('💳 Credit error detected, showing paywall and stopping any ongoing requests');
        
        // Stop any ongoing streaming/generation
        if (status === 'streaming') {
          // console.log('🛑 Stopping ongoing chat request due to credit error');
          stop();
        }
        
        setShowPaywall(true);
        setPaywallDismissed(false); // Reset dismissed state when user tries to send message
        // Refetch credits to ensure UI is in sync
        refetchCredits();
      } else {
        console.log('⚠️ Other error:', error);
        toast.error('An error occurred, please try again!');
      }
    },
  });

  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallDismissed, setPaywallDismissed] = useState(false);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  // Only show paywall modal when explicitly triggered by API error responses
  const shouldShowPaywall = showPaywall;

  // Debug logging
  // console.log('🔍 Chat Component State:', {
  //   showPaywall,
  //   paywallDismissed,
  //   shouldShowPaywall,
  //   chatStatus: status
  // });

  const handlePaywallClose = (open: boolean) => {
    console.log('🔧 handlePaywallClose called with:', open);
    if (!open) {
      console.log('✅ Setting showPaywall to false and marking as dismissed');
      
      // Stop any ongoing streaming/generation when modal is closed
      if (status === 'streaming') {
        console.log('🛑 Stopping ongoing chat request due to modal close');
        stop();
      }
      
      setShowPaywall(false);
      setPaywallDismissed(true);
    }
  };

  const handleShowPaywall = () => {
    console.log('🎭 Showing paywall from UI-level check');
    setShowPaywall(true);
    setPaywallDismissed(false);
  };

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedChatModel}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />

        <Messages
          chatId={id}
          status={status}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
              credits={credits}
              planType={planType}
              hasAccess={planType === 'pro' || planType === 'ultra'}
              onShowPaywall={handleShowPaywall}
            />
          )}
        </form>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
      />

      <PaywallModal 
        open={shouldShowPaywall} 
        onOpenChange={handlePaywallClose} 
      />
    </>
  );
}
