import { auth } from '@/app/(auth)/auth';
import { getUserById } from '@/lib/db/queries';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // Ensure user can only access their own credits
    if (userId !== session.user.id) {
      return new Response('Forbidden', { status: 403 });
    }

    const user = await getUserById(session.user.id);
    
    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    return Response.json({
      credits: user.credits,
      planType: user.planType,
      lastCreditReset: user.lastCreditReset,
    });
  } catch (error) {
    console.error('Failed to fetch user credits:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}