import { auth } from '@/app/(auth)/auth';

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function refreshUserSession() {
  // This will be called after payment updates to refresh the session
  // The JWT callback will automatically fetch fresh data from the database
  return true;
}