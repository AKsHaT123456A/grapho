import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const MODEL_NAME = 'gemini-3.0-flash';

export async function extractEntitiesAndRelationships(text: string) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  // Truncate text if too long (keep first 5000 chars for better performance)
  const truncatedText = text.length > 5000 ? text.substring(0, 5000) + '...' : text;

  const prompt = `You are an expert at extracting entities and relationships from text. Analyze the following text carefully and extract ALL meaningful entities and their relationships.

Text to analyze:
"""
${truncatedText}
"""

Extract entities in these categories:
- PERSON: People's names (e.g., Tim Cook, Elon Musk)
- ORGANIZATION: Companies, institutions (e.g., Apple Inc., Tesla)
- LOCATION: Places, cities, countries (e.g., Cupertino, California)
- DATE: Dates, times, periods (e.g., January 2024, 2025)
- FEATURE: Products, services, features (e.g., iPhone, Powerwall)
- CONCEPT: Abstract concepts, technologies (e.g., AI, sustainability)

For each entity, provide:
- name: The entity name
- type: One of the categories above
- confidence: A number between 0.0 and 1.0
- context: A brief quote from the text showing where this entity appears

For relationships, identify how entities are connected:
- from: Source entity name (must match an entity name exactly)
- to: Target entity name (must match an entity name exactly)
- type: Relationship type (e.g., WORKS_FOR, FOUNDED, LOCATED_IN, CREATED, COMPETES_WITH, OWNS)
- strength: A number between 0.0 and 1.0
- context: Brief description of the relationship

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "entities": [
    {
      "name": "Apple Inc.",
      "type": "ORGANIZATION",
      "confidence": 0.95,
      "context": "Apple Inc. announced today..."
    }
  ],
  "relationships": [
    {
      "from": "Tim Cook",
      "to": "Apple Inc.",
      "type": "WORKS_FOR",
      "strength": 0.9,
      "context": "CEO of Apple"
    }
  ]
}

IMPORTANT: Return ONLY the JSON object, nothing else. No explanations, no markdown formatting.`;

  let textResponse = '';
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    textResponse = response.text();
    
    console.log('Gemini raw response:', textResponse.substring(0, 500));
    
    // Try to extract JSON from various formats
    let jsonText = textResponse.trim();
    
    // Remove markdown code blocks if present
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    }
    
    // Remove any leading/trailing text that's not JSON
    const jsonStart = jsonText.indexOf('{');
    const jsonEnd = jsonText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
    }
    
    const parsed = JSON.parse(jsonText);
    
    // Validate the structure
    if (!parsed.entities || !Array.isArray(parsed.entities)) {
      throw new Error('Invalid response: missing entities array');
    }
    if (!parsed.relationships || !Array.isArray(parsed.relationships)) {
      parsed.relationships = [];
    }
    
    console.log(`Extracted ${parsed.entities.length} entities and ${parsed.relationships.length} relationships`);
    
    return parsed;
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
    if (textResponse) {
      console.error('Raw response was:', textResponse.substring(0, 1000));
    }
    throw new Error(`Failed to extract entities: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function checkGeminiConnection(): Promise<boolean> {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent('Hello');
    await result.response;
    return true;
  } catch (error) {
    console.error('Gemini connection failed:', error);
    return false;
  }
}
