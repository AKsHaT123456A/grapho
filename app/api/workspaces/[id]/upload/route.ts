import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractEntitiesAndRelationships } from '@/lib/gemini';

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
    });
    
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 files allowed' },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id }
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    const results = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      let content = '';
      const fileType = file.type;

      if (fileType === 'application/pdf') {
        try {
          content = await extractTextFromPDF(buffer);
        } catch (pdfError) {
          console.error('PDF parsing failed:', pdfError);
          results.push({
            filename: file.name,
            error: 'Failed to extract text from PDF'
          });
          continue;
        }
      } else if (fileType === 'text/plain' || file.name.endsWith('.txt')) {
        content = buffer.toString('utf-8');
      } else {
        results.push({
          filename: file.name,
          error: 'Unsupported file type. Please use TXT or PDF files.'
        });
        continue;
      }

      if (!content || content.trim().length === 0) {
        results.push({
          filename: file.name,
          error: 'Empty file or no text content found'
        });
        continue;
      }

      // Create document
      const document = await prisma.document.create({
        data: {
          workspaceId: id,
          filename: file.name,
          content,
          fileType
        }
      });

      // Extract entities and relationships
      try {
        const extracted = await extractEntitiesAndRelationships(content);

        // Create entities
        const entityMap = new Map();
        for (const entity of extracted.entities || []) {
          const created = await prisma.entity.create({
            data: {
              workspaceId: id,
              documentId: document.id,
              name: entity.name,
              type: entity.type,
              confidence: entity.confidence || 1.0,
              context: entity.context || ''
            }
          });
          entityMap.set(entity.name, created.id);
        }

        // Create relationships
        for (const rel of extracted.relationships || []) {
          const fromId = entityMap.get(rel.from);
          const toId = entityMap.get(rel.to);

          if (fromId && toId) {
            await prisma.relationship.create({
              data: {
                workspaceId: id,
                fromEntityId: fromId,
                toEntityId: toId,
                relationshipType: rel.type,
                strength: rel.strength || 1.0,
                context: rel.context || null
              }
            });
          }
        }

        results.push({
          filename: file.name,
          documentId: document.id,
          entitiesCount: extracted.entities?.length || 0,
          relationshipsCount: extracted.relationships?.length || 0
        });
      } catch (error) {
        console.error('Extraction failed for', file.name, error);
        results.push({
          filename: file.name,
          documentId: document.id,
          error: 'Entity extraction failed'
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
