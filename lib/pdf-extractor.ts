export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Import from lib/pdf-parse to avoid Next.js bundling issues
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js" as any)).default;
    const data = await pdfParse(buffer);
    
    if (!data.text || !data.text.trim()) {
      throw new Error("No extractable text found in PDF.");
    }

    return data.text.trim();
  } catch (error) {
    console.error("PDF extraction failed:", error);
    if (error instanceof Error) {
      throw new Error(`PDF parsing error: ${error.message}`);
    }
    throw new Error("PDF parsing failed with unknown error");
  }
}