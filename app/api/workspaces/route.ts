import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const workspaces = await prisma.workspace.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        _count: {
          select: {
            documents: true,
            entities: true,
            relationships: true
          }
        }
      }
    });

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error('Failed to fetch workspaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspaces' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Workspace name is required' },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null
      }
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error('Failed to create workspace:', error);
    return NextResponse.json(
      { error: 'Failed to create workspace' },
      { status: 500 }
    );
  }
}
