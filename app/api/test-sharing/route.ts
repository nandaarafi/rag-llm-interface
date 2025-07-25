import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { chat, user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export async function GET() {
  try {
    console.log('🧪 Testing Chat Sharing with RLS...');

    // Find any public chat
    const [publicChat] = await db
      .select()
      .from(chat)
      .where(eq(chat.visibility, 'public'))
      .limit(1);

    if (!publicChat) {
      // Find a user to create a public chat
      const [testUser] = await db.select().from(user).limit(1);
      if (!testUser) {
        return Response.json({ error: 'No users found. Please create a user first.' }, { status: 400 });
      }

      // Create a test public chat
      const [newChat] = await db
        .insert(chat)
        .values({
          title: 'Test Public Chat - ' + new Date().toISOString(),
          userId: testUser.id,
          visibility: 'public',
          createdAt: new Date(),
        })
        .returning();

      const results = await testPublicChatAccess(newChat.id, testUser.id);
      return Response.json({
        message: 'Created test public chat',
        chatId: newChat.id,
        shareUrl: `/chat/${newChat.id}`,
        testResults: results
      });
    } else {
      const results = await testPublicChatAccess(publicChat.id, publicChat.userId);
      return Response.json({
        message: 'Found existing public chat',
        chatId: publicChat.id,
        shareUrl: `/chat/${publicChat.id}`,
        testResults: results
      });
    }

  } catch (error) {
    console.error('Test failed:', error);
    return Response.json({ error: 'Test failed', details: String(error) }, { status: 500 });
  }
}

async function testPublicChatAccess(chatId: string, ownerId: string) {
  const results: Array<{ test: string; passed: boolean; count?: number }> = [];

  // Test 1: Access as owner (with user context)
  const chatAsOwner = await getChatById({ id: chatId, userId: ownerId });
  results.push({ test: 'Owner access', passed: !!chatAsOwner });

  // Test 2: Access as anonymous user (no user context)
  const chatAsAnonymous = await getChatById({ id: chatId });
  results.push({ test: 'Anonymous access', passed: !!chatAsAnonymous });

  // Test 3: Get messages as owner
  const messagesAsOwner = await getMessagesByChatId({ id: chatId, userId: ownerId });
  results.push({ test: 'Owner messages', passed: true, count: messagesAsOwner.length });

  // Test 4: Get messages as anonymous user
  const messagesAsAnonymous = await getMessagesByChatId({ id: chatId });
  results.push({ test: 'Anonymous messages', passed: true, count: messagesAsAnonymous.length });

  return results;
}