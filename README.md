# Knowledge Graph Builder

An AI-powered web application that extracts entities and relationships from documents to build interactive knowledge graphs using Google Gemini AI.

## Features

- Upload multiple documents (PDF, TXT)
- AI-powered entity extraction (people, organizations, locations, dates, features, concepts)
- Automatic relationship detection between entities
- Interactive graph visualization with React Flow
- Search and filter entities by type
- Entity editing and merging
- Export graphs as JSON
- Workspace management (last 5 workspaces)
- System health monitoring

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS, shadcn/ui
- **Graph Visualization**: React Flow
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **AI**: Google Gemini API
- **File Processing**: pdf-parse

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key
- Docker (optional, for PostgreSQL)

## Setup Instructions

### 1. Clone the repository

```bash
git clone git@github.com:AKsHaT123456A/grapho.git

cd knowledge-graph-builder
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```
GEMINI_API_KEY=your_actual_api_key_here
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/knowledge_graph"
```

Get your Gemini API key from: https://aistudio.google.com/api-keys

**Note:** The project is now configured for PostgreSQL. See options below.

### 4. Choose your database setup

**Option A: PostgreSQL with Docker (Recommended)**

```bash
# Start PostgreSQL
docker-compose -f docker-compose.dev.yml up -d

# Wait 10 seconds for PostgreSQL to start
```

**Option B: SQLite (No Docker needed)**

Edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

Edit `.env`:
```env
DATABASE_URL="file:./dev.db"
```

### 5. Set up the database

```bash
npx prisma generate
npx prisma migrate dev
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Quick Steps to See Your Knowledge Graph

1. **Create a Workspace**: On the home page, enter a name (e.g., "Tech News") and click "Create Workspace"

2. **Upload Documents**: 
   - Click on your newly created workspace
   - Click the "Upload Files" button in the sidebar
   - Select 3-10 TXT files
   - **Note**: PDF support is not available on hosted version. Convert PDFs to TXT using online tools like:
     - https://www.pdf2txt.com
     - https://pdftotext.com
     - Or copy-paste text from PDF to a TXT file
   - Use the sample documents in `sample-documents/` folder for testing
   - Wait 10-30 seconds for AI processing

3. **View the Graph**: 
   - The interactive knowledge graph will appear automatically
   - Colored nodes represent different entity types:
     - Blue: People
     - Purple: Organizations
     - Green: Locations
     - Orange: Dates
     - Pink: Features/Products
     - Indigo: Concepts
   - Arrows show relationships between entities
   - Animated arrows indicate strong relationships

4. **Interact with Entities**:
   - **Click any node** to see detailed information:
     - Source snippets from documents
     - All linked entities
     - Relationship types and strengths
     - Edit entity name/type
     - Merge with other entities
     - Delete entity
   - **Search**: Use the search box to find specific entities
   - **Filter**: Click entity type badges to filter the graph
   - **Export**: Download the graph as JSON

5. **Check System Status**: Visit `/status` page to verify all services are running

### Detailed Usage

1. **Create a Workspace**: Enter a name and optional description
2. **Upload Documents**: Click on a workspace and upload 3-10 documents (PDF or TXT)
3. **View the Graph**: The AI will extract entities and relationships automatically
4. **Interact**: 
   - Search entities by name
   - Filter by entity type (Person, Organization, Location, etc.)
   - Click nodes to view details
   - Export the graph as JSON
5. **Check Status**: Visit `/status` to monitor system health

## What's Done

- ✅ Document upload (PDF, TXT)
- ✅ AI entity extraction using Gemini
- ✅ Relationship detection
- ✅ Interactive graph visualization
- ✅ Search and filter functionality
- ✅ Workspace management (last 5)
- ✅ Export as JSON
- ✅ System health status page
- ✅ Entity type color coding
- ✅ Responsive design
- ✅ Error handling for empty/invalid inputs

## What's Not Done

- Advanced filters (date range, confidence score)
- CSV export
- Real-time extraction progress indicator
- Pagination for large graphs
- Graph layout customization
- Undo/redo functionality

## Troubleshooting

### Entity Extraction Fails

**Problem**: Documents upload but show "Entity extraction failed"

**Solutions**:
1. Check Gemini API key is correct in `.env`
2. Verify API key has quota remaining at [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Check terminal logs for specific error messages
4. Try with smaller documents first (< 5000 characters)
5. Ensure document has actual text content (not just images)

### Graph is Empty

**Problem**: Graph shows but no nodes appear

**Solutions**:
1. Check if entities were extracted (see Statistics panel)
2. Try clearing search/filter settings
3. Refresh the page
4. Check browser console for errors (F12)

### Can't Click on Nodes

**Problem**: Clicking nodes doesn't show details

**Solutions**:
1. Make sure you're clicking directly on the node (colored circle)
2. Check browser console for JavaScript errors
3. Try refreshing the page
4. Ensure the workspace loaded completely

### PostgreSQL Connection Issues

**Problem**: "Database connection failed" on status page

**Solutions**:
```bash
# Check if PostgreSQL is running
docker-compose -f docker-compose.dev.yml ps

# Restart PostgreSQL
docker-compose -f docker-compose.dev.yml restart

# Check logs
docker-compose -f docker-compose.dev.yml logs postgres
```

### Gemini API Issues

**Problem**: "LLM connection failed" on status page

**Solutions**:
1. Verify `GEMINI_API_KEY` in `.env` file
2. Check API key at https://makersuite.google.com/app/apikey
3. Ensure you're using `gemini-3.0-flash` model (check `lib/gemini.ts`)
4. Check API quota limits

### Build Errors

**Problem**: `npm run build` fails

**Solutions**:
```bash
# Clear build cache
Remove-Item -Recurse -Force .next

# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install

# Try building again
npm run build
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variable: `GEMINI_API_KEY`
4. Deploy

Note: SQLite works on Vercel but data is ephemeral. For production, consider PostgreSQL.

### Docker (Alternative)

```bash
docker build -t knowledge-graph-builder .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key knowledge-graph-builder
```

## Project Structure

```
knowledge-graph-builder/
├── app/
│   ├── api/              # API routes
│   ├── workspace/        # Workspace pages
│   ├── status/           # Status page
│   └── page.tsx          # Home page
├── components/
│   └── ui/               # Reusable UI components
├── lib/
│   ├── prisma.ts         # Database client
│   ├── gemini.ts         # AI integration
│   └── utils.ts          # Utilities
├── prisma/
│   └── schema.prisma     # Database schema
└── public/               # Static assets
```

## License

MIT
