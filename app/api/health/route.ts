import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    // Check database connectivity
    const dbCheck = await checkDatabase();
    
    // Check external dependencies
    const externalChecks = await checkExternalServices();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      checks: {
        database: dbCheck,
        ...externalChecks,
      },
    };

    // Determine overall health status
    const allChecksHealthy = Object.values(health.checks).every(
      check => check.status === 'healthy'
    );
    
    if (!allChecksHealthy) {
      health.status = 'unhealthy';
      return NextResponse.json(health, { status: 503 });
    }

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}

async function checkDatabase() {
  try {
    // Simple query to check database connectivity
    await db.execute(`SELECT 1`);
    return {
      status: 'healthy',
      responseTime: Date.now(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}

async function checkExternalServices() {
  const checks: Record<string, any> = {};

  // Check if required environment variables are set
  checks.environment = {
    status: checkRequiredEnvVars() ? 'healthy' : 'unhealthy',
  };

  return checks;
}

function checkRequiredEnvVars(): boolean {
  const required = [
    'POSTGRES_URL',
    'AUTH_SECRET',
    'NEXTAUTH_URL',
  ];

  return required.every(env => process.env[env]);
}