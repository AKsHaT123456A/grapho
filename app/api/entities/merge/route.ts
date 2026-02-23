import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceId, targetId } = body;

    if (!sourceId || !targetId) {
      return NextResponse.json(
        { error: 'Source and target entity IDs required' },
        { status: 400 }
      );
    }

    // Update all relationships pointing to source to point to target
    await prisma.relationship.updateMany({
      where: { fromEntityId: sourceId },
      data: { fromEntityId: targetId }
    });

    await prisma.relationship.updateMany({
      where: { toEntityId: sourceId },
      data: { toEntityId: targetId }
    });

    // Delete the source entity
    await prisma.entity.delete({
      where: { id: sourceId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to merge entities:', error);
    return NextResponse.json(
      { error: 'Failed to merge entities' },
      { status: 500 }
    );
  }
}
