# Prompts Used During Development

This document records the prompts used with AI assistants during the development of this project.

## Initial Setup

### Prompt 1: Project Initialization
```
Create a Next.js 14 project with TypeScript, TailwindCSS, and App Router for a knowledge graph builder application. Include Prisma for database, Google Gemini API for AI, and React Flow for graph visualization.
```

**Result**: Project scaffolding and dependency installation

---

## Database Design

### Prompt 2: Prisma Schema
```
Design a Prisma schema for a knowledge graph application with:
- Workspaces (to organize multiple graphs)
- Documents (uploaded files)
- Entities (extracted from documents with name, type, confidence, context)
- Relationships (connections between entities with type and strength)

Use SQLite as the database. Include proper relations and cascade deletes.
```

**Result**: `prisma/schema.prisma` with complete data model

---

## AI Integration

### Prompt 3: Gemini API Integration
```
Create a function to extract entities and relationships from text using Google Gemini API. 
The function should:
- Take text as input
- Return JSON with entities (name, type, confidence, context) and relationships (from, to, type, strength, context)
- Handle markdown-wrapped JSON responses
- Include proper error handling

Entity types: PERSON, ORGANIZATION, LOCATION, DATE, FEATURE, CONCEPT
```

**Result**: `lib/gemini.ts` with extraction function

### Prompt 4: Entity Extraction Prompt Engineering
```
Write a prompt for Gemini that will extract entities and relationships from document text.
The prompt should:
- Request specific JSON structure
- Define entity types clearly
- Ask for confidence scores
- Request relationship types and strength
- Emphasize thoroughness
```

**Result**: Structured prompt in `extractEntitiesAndRelationships()` function

---

## API Routes

### Prompt 5: Health Check Endpoint
```
Create a Next.js API route at /api/health that checks:
- Backend status (always true)
- Database connection (test with Prisma query)
- Gemini API connection (test with simple request)

Return JSON with status for each and HTTP 200 if all healthy, 503 if any unhealthy.
```

**Result**: `app/api/health/route.ts`

### Prompt 6: Workspace CRUD
```
Create Next.js API routes for workspace management:
- GET /api/workspaces - List last 5 workspaces with counts
- POST /api/workspaces - Create new workspace with validation
- GET /api/workspaces/[id] - Get workspace with all entities and relationships
- DELETE /api/workspaces/[id] - Delete workspace

Include proper error handling and validation.
```

**Result**: Workspace API routes

### Prompt 7: File Upload Endpoint
```
Create a Next.js API route for document upload that:
- Accepts multiple files (max 10)
- Supports PDF and TXT files
- Extracts text from PDFs using pdf-parse
- Calls Gemini API to extract entities and relationships
- Saves everything to database
- Returns results for each file

Include validation and error handling.
```

**Result**: `app/api/workspaces/[id]/upload/route.ts`

---

## UI Components

### Prompt 8: shadcn/ui Components
```
Create shadcn/ui style components for:
- Button (with variants: default, outline, ghost, destructive)
- Card (with Header, Title, Description, Content, Footer)
- Input (styled text input)
- Badge (for entity type labels)

Use TailwindCSS and class-variance-authority. Include proper TypeScript types.
```

**Result**: Components in `components/ui/`

### Prompt 9: Home Page
```
Create a Next.js home page with:
- Hero section with app title and description
- Form to create new workspace
- Grid of last 5 workspaces with stats (documents, entities, relationships)
- Link to status page
- Gradient background (slate-900 to purple-900)
- Glass morphism cards

Use the UI components created earlier.
```

**Result**: `app/page.tsx`

### Prompt 10: Status Page
```
Create a status monitoring page that:
- Calls /api/health endpoint
- Shows status for backend, database, and LLM
- Uses green checkmark for healthy, red X for unhealthy
- Has refresh button
- Shows timestamp of last check
- Displays help text if Gemini API is not configured

Use glass morphism design matching the home page.
```

**Result**: `app/status/page.tsx`

### Prompt 11: Workspace Graph Page
```
Create a workspace detail page with:
- React Flow graph visualization
- Nodes colored by entity type
- Edges showing relationships (animated if strength > 0.7)
- Sidebar with:
  - File upload
  - Search entities
  - Filter by type
  - Statistics
- Export to JSON button
- Delete workspace button

Use force-directed layout for node positioning.
```

**Result**: `app/workspace/[id]/page.tsx`

---

## Styling

### Prompt 12: Color Scheme
```
Suggest a color scheme for entity types in a knowledge graph:
- PERSON
- ORGANIZATION
- LOCATION
- DATE
- FEATURE
- CONCEPT

Colors should be distinct and work well on dark backgrounds.
```

**Result**: Color mapping in workspace page

### Prompt 13: Gradient Background
```
Create a TailwindCSS gradient background that goes from slate-900 through purple-900 back to slate-900, suitable for a dark-themed AI application.
```

**Result**: Background classes used across pages

---

## Documentation

### Prompt 14: README Structure
```
Write a comprehensive README for a knowledge graph builder app including:
- Feature list
- Tech stack
- Setup instructions
- Usage guide
- What's done vs not done
- Deployment instructions
- Project structure

Make it clear and beginner-friendly.
```

**Result**: `README.md`

### Prompt 15: AI Notes Documentation
```
Create an AI_NOTES.md that documents:
- What AI was used for (with specifics)
- What was manually verified
- AI limitations encountered
- Testing approach
- Time breakdown

Be honest about AI usage and manual verification.
```

**Result**: `AI_NOTES.md`

---

## Debugging Prompts

### Prompt 16: Prisma Version Issue
```
I'm getting an error about datasource.url not being supported in Prisma schema. 
Error says to move connection URLs to prisma.config.ts. 
How do I fix this for SQLite with Prisma 7?
```

**Result**: Downgraded to Prisma 5 for compatibility

### Prompt 17: PDF Parsing
```
How do I extract text from PDF files in a Next.js API route? 
I need to handle the file as a Buffer from FormData.
```

**Result**: Implementation using pdf-parse library

### Prompt 18: React Flow Styling
```
How do I style React Flow nodes with custom colors based on entity type?
I want rounded corners, white borders, and the node label to show entity name and type.
```

**Result**: Node styling in workspace page

---

## Optimization Prompts

### Prompt 19: Graph Performance
```
My React Flow graph is slow with 100+ nodes. How can I optimize it?
Should I use pagination, clustering, or lazy loading?
```

**Result**: Noted in "What's Not Done" section for future improvement

### Prompt 20: Gemini Response Parsing
```
Gemini sometimes returns JSON wrapped in markdown code blocks like ```json\n{...}\n```.
How do I reliably extract the JSON regardless of format?
```

**Result**: Regex parsing in `lib/gemini.ts`

---

## Total Prompts Used: 20+

**Note**: This is a representative sample. Many smaller prompts for syntax questions, debugging, and refinements are not included.

## Prompt Engineering Lessons Learned

1. **Be Specific**: Detailed prompts with exact requirements produce better results
2. **Include Examples**: Showing desired output format helps AI understand
3. **Iterate**: First response is rarely perfect; refine based on results
4. **Validate**: Always test AI-generated code before committing
5. **Context Matters**: Providing tech stack and constraints upfront saves time

## AI Tools Used

- **Primary**: Kiro AI Assistant (for code generation and architecture)
- **Secondary**: Google Gemini API (for entity extraction in the app itself)
- **Documentation**: AI-assisted writing with manual editing
