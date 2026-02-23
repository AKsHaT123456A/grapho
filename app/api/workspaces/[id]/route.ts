import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
      include: {
        documents: true,
        entities: {
          include: {
            relationsFrom: {
              include: {
                toEntity: true
              }
            },
            relationsTo: {
              include: {
                fromEntity: true
              }
            }
          }
        },
        relationships: {
          include: {
            fromEntity: true,
            toEntity: true
          }
        }
      }
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(workspace);
  } catch (error) {
    console.error('Failed to fetch workspace:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspace' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.workspace.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete workspace:', error);
    return NextResponse.json(
      { error: 'Failed to delete workspace' },
      { status: 500 }
    );
  }
}
