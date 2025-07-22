import {
  UIMessage,
  appendResponseMessages,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';
import { auth } from '@/app/(auth)/auth';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
  getUserById,
  getUserCredits,
  deductCredits,
  updateUser,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  getTrailingMessageId,
} from '@/lib/utils';
import { generateTitleFromUserMessage } from '../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';
import { getPlanConfig, type PlanType } from '@/lib/pricing-config';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const {
      id,
      messages,
      selectedChatModel,
    }: {
      id: string;
      messages: Array<UIMessage>;
      selectedChatModel: string;
    } = await request.json();

    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Check if user has access or credits
    const user = await getUserById(session.user.id);
    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    // Check credits for all users
    const userCredits = await getUserCredits(session.user.id);
    const planConfig = getPlanConfig((user.planType || 'free') as PlanType);
    const maxCredits = planConfig.credits;
    
    // If plan has 0 max credits, deny access regardless of current credits
    if (maxCredits === 0) {
      return new Response(
        JSON.stringify({
          error: 'no_credits_plan',
          message: 'Your current plan does not include AI credits. Please upgrade to continue chatting.',
          credits: userCredits,
          maxCredits: maxCredits,
          planType: user.planType || 'free'
        }),
        { 
          status: 402,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Standard credit check for plans with credits
    if (userCredits <= 0) {
      return new Response(
        JSON.stringify({
          error: 'insufficient_credits',
          message: 'You have reached your credit limit. Please upgrade to continue chatting.',
          credits: userCredits,
          maxCredits: maxCredits,
          planType: user.planType || 'free'
        }),
        { 
          status: 402,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    const chat = await getChatById({ id });

    if (!chat) {
      try {
        const title = await generateTitleFromUserMessage({
          message: userMessage,
        });

        // console.log('Saving new chat:', { id, userId: session.user.id, title });
        await saveChat({ id, userId: session.user.id, title });
        // console.log('Chat saved successfully');
      } catch (saveError) {
        console.error('Failed to save chat in database:', saveError);
        throw saveError;
      }
    } else {
      if (chat.userId !== session.user.id) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    try {
      // console.log('Saving user message:', { chatId: id, messageId: userMessage.id });
      await saveMessages({
        messages: [
          {
            chatId: id,
            id: userMessage.id,
            role: 'user',
            parts: userMessage.parts,
            attachments: userMessage.experimental_attachments ?? [],
            createdAt: new Date(),
          },
        ],
      });
      // console.log('User message saved successfully');
    } catch (messageError) {
      console.error('Failed to save user message:', messageError);
      throw messageError;
    }

    return createDataStreamResponse({
      execute: (dataStream) => {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPrompt({ selectedChatModel }),
          messages,
          maxSteps: 5,
          experimental_activeTools:
            selectedChatModel === 'chat-model-reasoning'
              ? []
              : [
                  'getWeather',
                  'createDocument',
                  'updateDocument',
                  'requestSuggestions',
                ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          tools: {
            getWeather,
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,
            }),
          },
          onFinish: async ({ response }) => {
            if (session.user?.id) {
              try {
                const assistantId = getTrailingMessageId({
                  messages: response.messages.filter(
                    (message) => message.role === 'assistant',
                  ),
                });

                if (!assistantId) {
                  throw new Error('No assistant message found!');
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [userMessage],
                  responseMessages: response.messages,
                });

                await saveMessages({
                  messages: [
                    {
                      id: assistantId,
                      chatId: id,
                      role: assistantMessage.role,
                      parts: assistantMessage.parts,
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ],
                });

                // Deduct 1 credit for successful AI response
                console.log('User hasAccess:', user.hasAccess, 'User credits:', user.credits);
                const deducted = await deductCredits(session.user.id, 1);
                console.log('Credit deduction result:', deducted, 'for user:', session.user.id);
                
                // Update hasAccess based on remaining credits
                const remainingCredits = await getUserCredits(session.user.id);
                const newHasAccess = remainingCredits > 0;
                if (user.hasAccess !== newHasAccess) {
                  await updateUser(session.user.id, { hasAccess: newHasAccess });
                  console.log('Updated hasAccess to:', newHasAccess, 'Credits remaining:', remainingCredits);
                }
              } catch (error) {
                console.error('Failed to save chat', error);
              }
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: () => {
        return 'Oops, an error occurred!';
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('An error occurred while processing your request!', {
      status: 500,
    });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request!', {
      status: 500,
    });
  }
}
