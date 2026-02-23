import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid issues during build
    const pdfParse = (await import('pdf-parse')).default;
    
    const data = await pdfParse(buffer, {
      // Disable canvas to avoid DOMMatrix issues in serverless
      max: 0,
    });
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No text extracted from PDF');
    }
    
    return data.text.trim();
  } catch (error) {
    console.error('PDF text extraction failed:', error);
    throw new Error('Failed to extract text from PDF. The PDF may be image-based or corrupted.');
  }
}
