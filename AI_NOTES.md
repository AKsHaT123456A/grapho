# AI Usage Notes

This document outlines what AI tools were used for and what was manually verified during development.

## What AI Was Used For

### 1. Entity Extraction (Google Gemini API)
- **Purpose**: Extract entities (people, organizations, locations, dates, features, concepts) from document text
- **Implementation**: `lib/gemini.ts` - `extractEntitiesAndRelationships()` function
- **Prompt Engineering**: Structured prompt to return JSON with entities and relationships
- **Verification**: Tested with sample documents to ensure consistent JSON format and entity quality

### 2. Relationship Detection (Google Gemini API)
- **Purpose**: Identify relationships between extracted entities
- **Implementation**: Same function as entity extraction
- **Output**: Relationship type, strength (0-1), and context
- **Verification**: Manually checked that relationships make semantic sense

### 3. Code Generation (Development AI Assistant)
- **Used For**:
  - Boilerplate code for Next.js API routes
  - Prisma schema design
  - React component structure
  - TailwindCSS styling
  - TypeScript type definitions
- **Manually Verified**:
  - All API endpoints tested with Postman/browser
  - Database schema validated with Prisma Studio
  - Component rendering checked in browser
  - TypeScript compilation errors resolved

### 4. UI/UX Design
- **AI Suggested**: Color schemes, layout structure, component hierarchy
- **Manually Adjusted**: 
  - Entity type colors for better visibility
  - Graph node positioning algorithm
  - Responsive breakpoints
  - Button placements and interactions

## What Was Manually Checked

### 1. API Functionality
- ✅ Health check endpoint returns correct status
- ✅ Workspace CRUD operations work correctly
- ✅ File upload handles PDF and TXT properly
- ✅ Entity extraction processes documents correctly
- ✅ Error handling for invalid inputs

### 2. Database Operations
- ✅ Prisma migrations applied successfully
- ✅ Relationships cascade delete properly
- ✅ Queries return expected data structure
- ✅ No N+1 query issues

### 3. Frontend Functionality
- ✅ Graph visualization renders correctly
- ✅ Search filters entities in real-time
- ✅ Type filters update graph dynamically
- ✅ File upload shows progress and handles errors
- ✅ Navigation works between pages
- ✅ Responsive design on mobile/tablet/desktop

### 4. Integration Testing
- ✅ End-to-end flow: create workspace → upload docs → view graph
- ✅ Gemini API integration with proper error handling
- ✅ PDF parsing extracts text correctly
- ✅ JSON export contains complete data

### 5. Edge Cases
- ✅ Empty file upload rejected
- ✅ Invalid file types rejected
- ✅ Missing API key shows error on status page
- ✅ Workspace not found redirects to home
- ✅ Large documents handled (tested up to 50 pages)

## AI Limitations Encountered

1. **Entity Extraction Accuracy**: Gemini sometimes misclassifies entity types (e.g., treating a product name as a person). Manual review recommended for critical applications.

2. **Relationship Inference**: AI infers relationships based on proximity and context, which may not always be accurate. Confidence scores help but aren't perfect.

3. **JSON Parsing**: Gemini occasionally returns markdown-wrapped JSON. Added regex parsing to handle this.

4. **Performance**: Large documents (100+ pages) can take 10-30 seconds to process. Consider chunking for production.

## Recommendations for Production

1. Add human-in-the-loop review for entity classification
2. Implement confidence threshold filtering
3. Add batch processing for large document sets
4. Cache extraction results to avoid re-processing
5. Use PostgreSQL instead of SQLite for better concurrency
6. Add rate limiting for Gemini API calls
7. Implement retry logic with exponential backoff

## Testing Approach

- **Unit Tests**: Not implemented (time constraint)
- **Integration Tests**: Manual testing of all features
- **E2E Tests**: Manual walkthrough of user flows
- **Performance Tests**: Tested with 10 documents, 50+ entities

## Time Breakdown

- Setup & Configuration: 30 minutes
- Database Schema & API: 1.5 hours
- UI Components: 2 hours
- Graph Visualization: 1.5 hours
- Gemini Integration: 1 hour
- Testing & Debugging: 1.5 hours
- Documentation: 30 minutes

**Total**: ~8 hours
