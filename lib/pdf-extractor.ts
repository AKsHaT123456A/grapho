import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Use Gemini Pro - the most stable model
    // Note: gemini-pro doesn't support PDF directly, so we'll return an error
    // Users should convert PDF to TXT
    throw new Error('PDF extraction requires manual conversion. Please convert your PDF to TXT format using online tools like pdf2txt.com');
  } catch (error) {
    console.error('PDF text extraction failed:', error);
    throw error;
  }
}
