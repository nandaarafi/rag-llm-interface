import { NextResponse } from 'next/server';
import postgres from 'postgres';
import { myProvider } from '@/lib/ai/providers';

export async function GET() {
  // console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  const healthChecks = {
    status: 'healthy',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    database: 'connecting...',
    ai: 'connecting...',
    timestamp: new Date().toISOString(),
  };

  // Test database connection
  try {
    const client = postgres(process.env.DATABASE_URL!, { 
      ssl: 'require',
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10
    });
    await client`SELECT 1`;
    await client.end();
    // console.log('Database connection successful');
    healthChecks.database = 'connected';
  } catch (error) {
    console.error('Database connection error:', error);
    healthChecks.database = `error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    healthChecks.status = 'degraded';
  }

  // Test AI connection
  try {
    const model = myProvider.languageModel('chat-model');
    const result = await model.doGenerate({
      inputFormat: 'messages',
      mode: { type: 'regular' },
      prompt: [{ role: 'user', content: [{ type: 'text', text: 'health check' }] }],
      maxTokens: 5
    });
    
    if (result.text) {
      healthChecks.ai = 'connected';
    } else {
      healthChecks.ai = 'error: no response';
      healthChecks.status = 'degraded';
    }
  } catch (error) {
    healthChecks.ai = `error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    healthChecks.status = 'degraded';
  }

  const status = healthChecks.status === 'healthy' ? 200 : 503;
  return NextResponse.json(healthChecks, { status });
}