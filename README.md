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
git clone <your-repo-url>
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

Get your Gemini API key from: https://makersuite.google.com/app/apikey

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

- Entity editing UI (API exists but no UI)
- Entity merging UI (API exists but no UI)
- Advanced filters (date range, confidence score)
- CSV export
- Workspace thumbnails
- Real-time extraction progress indicator
- Pagination for large graphs
- Graph layout customization
- Undo/redo functionality

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
