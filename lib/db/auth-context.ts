import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

/**
 * Sets the current user context for Row Level Security policies
 * This should be called at the beginning of any database operation
 * that requires user-specific data access.
 * 
 * @param userId - The UUID of the current user
 */
export async function setUserContext(userId: string): Promise<void> {
  await db.execute(sql`SELECT set_current_user_id(${userId}::uuid)`);
}

/**
 * Clears the current user context
 * This should be called after completing database operations
 * to ensure context doesn't leak between requests.
 */
export async function clearUserContext(): Promise<void> {
  await db.execute(sql`SELECT set_config('app.current_user_id', '', true)`);
}

/**
 * Executes a function with user context set for RLS policies
 * Automatically handles setting and clearing the context.
 * 
 * @param userId - The UUID of the current user
 * @param fn - The function to execute with user context
 * @returns The result of the function
 */
export async function withUserContext<T>(
  userId: string,
  fn: () => Promise<T>
): Promise<T> {
  await setUserContext(userId);
  try {
    return await fn();
  } finally {
    await clearUserContext();
  }
}

/**
 * Gets the current user ID from the database context
 * Useful for debugging and verification
 */
export async function getCurrentUserContext(): Promise<string | null> {
  const result = await db.execute(sql`SELECT current_user_id() as user_id`);
  const userId = result[0]?.user_id;
  return userId ? String(userId) : null;
}