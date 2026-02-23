import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function extractEntitiesAndRelationships(text: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Analyze the following text and extract entities and relationships.

Text: ${text}

Return a JSON object with this exact structure:
{
  "entities": [
    {
      "name": "entity name",
      "type": "PERSON|ORGANIZATION|LOCATION|DATE|FEATURE|CONCEPT",
      "confidence": 0.0-1.0,
      "context": "brief context from text"
    }
  ],
  "relationships": [
    {
      "from": "entity name",
      "to": "entity name",
      "type": "relationship type (e.g., WORKS_FOR, LOCATED_IN, CREATED, RELATED_TO)",
      "strength": 0.0-1.0,
      "context": "brief context"
    }
  ]
}

Extract as many meaningful entities and relationships as possible. Be thorough.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const textResponse = response.text();
  
  // Extract JSON from markdown code blocks if present
  const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/) || 
                    textResponse.match(/```\n([\s\S]*?)\n```/);
  
  const jsonText = jsonMatch ? jsonMatch[1] : textResponse;
  
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Failed to parse Gemini response:', textResponse);
    throw new Error('Failed to parse entity extraction response');
  }
}

export async function checkGeminiConnection(): Promise<boolean> {
  try {
    
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    const result = await model.generateContent('Hello');
    await result.response;
    return true;
  } catch (error) {
    console.error('Gemini connection failed:', error);
    return false;
  }
}
