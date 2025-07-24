import 'server-only';

import { genSaltSync, hashSync } from 'bcrypt-ts';
import {
  and,
  asc,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  type SQL,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getPlanConfig, type PlanType } from '@/lib/pricing-config';

import {
  user,
  chat,
  type User,
  document,
  type Suggestion,
  suggestion,
  message,
  vote,
  type DBMessage,
  type Chat,
} from './schema';
import type { ArtifactKind } from '@/components/artifact';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

export async function updateUser(userId: string, data: Partial<User>) {
  try {
    return await db.update(user).set(data).where(eq(user.id, userId));
  } catch (error) {
    console.error('Failed to update user in database');
    throw error;
  }
}

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error('Failed to get user from database', error);
    throw error;
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const result = await db.select().from(user).where(eq(user.id, userId));
    return result[0] || null;
  } catch (error) {
    console.error('Failed to get user by ID from database');
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({ email, password: hash });
  } catch (error) {
    console.error('Failed to create user in database');
    throw error;
  }
}

export async function createUserWithEmailVerification(email: string, password: string): Promise<string> {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);
  const verificationToken = crypto.randomUUID();

  try {
    await db.insert(user).values({ 
      email, 
      password: hash,
      emailVerified: false,
      emailVerificationToken: verificationToken
    });
    return verificationToken;
  } catch (error) {
    console.error('Failed to create user with email verification');
    throw error;
  }
}
export async function createUserOauth(userData: {
  email: string;
  name: string;
  image?: string;
  provider?: string;
  providerId?: string;
}): Promise<User> {
  try {
    console.log('Creating OAuth user with data:', userData);
    
    const [newUser] = await db
      .insert(user)
      .values({
        email: userData.email,
        image: userData.image,
        emailVerified: true, // OAuth users are pre-verified
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning(); // This returns the inserted record(s)
    
    console.log('OAuth user created successfully:', newUser);
    return newUser;
  } catch (error) {
    console.error('Failed to create OAuth user:', error);
    throw error;
  }
}

// Password Reset Functions
export async function createPasswordResetToken(email: string): Promise<string> {
  try {
    const resetToken = crypto.randomUUID();
    const expiry = new Date(Date.now() + 3600000); // 1 hour from now
    
    await db
      .update(user)
      .set({
        resetToken,
        resetTokenExpiry: expiry,
        updatedAt: new Date(),
      })
      .where(eq(user.email, email));
    
    return resetToken;
  } catch (error) {
    console.error('Failed to create password reset token');
    throw error;
  }
}

export async function getUserByResetToken(token: string): Promise<User | null> {
  try {
    const result = await db
      .select()
      .from(user)
      .where(
        and(
          eq(user.resetToken, token),
          gt(user.resetTokenExpiry, new Date())
        )
      );
    
    return result[0] || null;
  } catch (error) {
    console.error('Failed to get user by reset token');
    throw error;
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  try {
    const salt = genSaltSync(10);
    const hash = hashSync(newPassword, salt);
    
    const result = await db
      .update(user)
      .set({
        password: hash,
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(user.resetToken, token),
          gt(user.resetTokenExpiry, new Date())
        )
      );
    
    return true;
  } catch (error) {
    console.error('Failed to reset password');
    throw error;
  }
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
    });
  } catch (error) {
    console.error('Failed to save chat in database');
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));

    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    throw error;
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id),
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Array<Chat> = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new Error(`Chat with id ${startingAfter} not found`);
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new Error(`Chat with id ${endingBefore} not found`);
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (error) {
    console.error('Failed to get chats by user from database');
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error('Failed to get chat by id from database');
    throw error;
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    throw error;
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    console.error('Failed to upvote message in database', error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    console.error('Failed to get votes by chat id from database', error);
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db
      .insert(document)
      .values({
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
      })
      .returning();
  } catch (error) {
    console.error('Failed to save document in database');
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function getDocumentsByUserId({ userId }: { userId: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.userId, userId))
      .orderBy(desc(document.createdAt));

    // Group by id to get only the latest version of each document
    const latestDocuments = documents.reduce((acc, doc) => {
      if (!acc[doc.id] || doc.createdAt > acc[doc.id].createdAt) {
        acc[doc.id] = doc;
      }
      return acc;
    }, {} as Record<string, typeof documents[0]>);

    return Object.values(latestDocuments);
  } catch (error) {
    console.error('Failed to get documents by user id from database');
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)))
      .returning();
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    console.error('Failed to save suggestions in database');
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    console.error(
      'Failed to get suggestions by document version from database',
    );
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    console.error('Failed to get message by id from database');
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
        );
    }
    return undefined;
  } catch (error) {
    console.error(
      'Failed to delete messages by id after timestamp from database',
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    console.error('Failed to update chat visibility in database');
    throw error;
  }
}

// Credit management functions
export async function getUserCredits(userId: string): Promise<number> {
  try {
    const [userRecord] = await db
      .select({ credits: user.credits })
      .from(user)
      .where(eq(user.id, userId));
    
    return userRecord?.credits || 0;
  } catch (error) {
    console.error('Failed to get user credits from database');
    throw error;
  }
}

export async function deductCredits(userId: string, amount = 1): Promise<boolean> {
  try {
    const userRecord = await getUserById(userId);
    if (!userRecord || userRecord.credits < amount) {
      return false; // Insufficient credits
    }

    await db
      .update(user)
      .set({ credits: userRecord.credits - amount })
      .where(eq(user.id, userId));
    
    return true;
  } catch (error) {
    console.error('Failed to deduct credits from database');
    throw error;
  }
}

export async function resetMonthlyCredits(): Promise<void> {
  try {
    const now = new Date();
    
    // Reset Pro users to 300 credits
    await db
      .update(user)
      .set({ 
        credits: 300,
        lastCreditReset: now
      })
      .where(eq(user.planType, 'pro'));

    // Reset Ultra users to 1000 credits  
    await db
      .update(user)
      .set({ 
        credits: 1000,
        lastCreditReset: now
      })
      .where(eq(user.planType, 'ultra'));
  } catch (error) {
    console.error('Failed to reset monthly credits');
    throw error;
  }
}

export async function updateUserPlan(userId: string, planType: PlanType): Promise<void> {
  try {
    const now = new Date();
    const planConfig = getPlanConfig(planType);

    await db
      .update(user)
      .set({ 
        planType,
        credits: planConfig.credits,
        lastCreditReset: now,
        hasAccess: planConfig.hasAccess
      })
      .where(eq(user.id, userId));
  } catch (error) {
    console.error('Failed to update user plan');
    throw error;
  }
}

// Email verification functions
export async function getUserByEmailVerificationToken(token: string): Promise<User | null> {
  try {
    const result = await db
      .select()
      .from(user)
      .where(eq(user.emailVerificationToken, token));
    
    return result[0] || null;
  } catch (error) {
    console.error('Failed to get user by email verification token');
    throw error;
  }
}

export async function verifyUserEmail(token: string): Promise<boolean> {
  try {
    const result = await db
      .update(user)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        updatedAt: new Date(),
      })
      .where(eq(user.emailVerificationToken, token));
    
    return true;
  } catch (error) {
    console.error('Failed to verify user email');
    throw error;
  }
}
