import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Use Gemini's vision model to extract text from PDF
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const prompt = `Extract all text content from this PDF document. Return only the text, no explanations or formatting. If there are multiple pages, combine all text into one continuous output.`;
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType: 'application/pdf',
        },
      },
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text extracted from PDF');
    }
    
    return text.trim();
  } catch (error) {
    console.error('PDF text extraction failed:', error);
    throw new Error('Failed to extract text from PDF using AI');
  }
}
