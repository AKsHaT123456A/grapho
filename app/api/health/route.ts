import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkGeminiConnection } from '@/lib/gemini';

export async function GET() {
  const health = {
    backend: true,
    database: false,
    llm: false,
    timestamp: new Date().toISOString()
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  try {
    health.llm = await checkGeminiConnection();
  } catch (error) {
    console.error('LLM health check failed:', error);
  }

  const allHealthy = health.backend && health.database && health.llm;
  
  return NextResponse.json(health, { 
    status: allHealthy ? 200 : 503 
  });
}
