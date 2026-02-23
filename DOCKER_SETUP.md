# Docker Setup Guide

This guide explains how to run the Knowledge Graph Builder with PostgreSQL using Docker.

## Prerequisites

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (included with Docker Desktop)
- Google Gemini API key

## Quick Start

### Option 1: Development Mode (PostgreSQL only)

Run just PostgreSQL in Docker, and the app locally:

```bash
# 1. Start PostgreSQL
docker-compose -f docker-compose.dev.yml up -d

# 2. Wait for PostgreSQL to be ready (about 10 seconds)
docker-compose -f docker-compose.dev.yml ps

# 3. Install dependencies
npm install

# 4. Run migrations
npx prisma migrate dev --name init

# 5. Start the app
npm run dev
```

Access the app at http://localhost:3000

### Option 2: Full Docker (App + PostgreSQL)

Run both the app and PostgreSQL in Docker:

```bash
# 1. Make sure GEMINI_API_KEY is set in .env file
# Edit .env and add your API key

# 2. Build and start all services
docker-compose up --build

# 3. Access the app
# Open http://localhost:3000
```

## Detailed Instructions

### Development Mode Setup

**Step 1: Start PostgreSQL**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

This starts PostgreSQL on port 5432.

**Step 2: Verify PostgreSQL is running**
```bash
docker-compose -f docker-compose.dev.yml ps
```

You should see:
```
NAME                IMAGE                  STATUS
kg-postgres-dev     postgres:16-alpine     Up (healthy)
```

**Step 3: Install dependencies**
```bash
npm install
```

**Step 4: Generate Prisma Client**
```bash
npx prisma generate
```

**Step 5: Run database migrations**
```bash
npx prisma migrate dev --name init
```

**Step 6: Start the development server**
```bash
npm run dev
```

**Step 7: Open your browser**
Navigate to http://localhost:3000

### Full Docker Setup

**Step 1: Configure environment**

Edit `.env` file:
```env
GEMINI_API_KEY=your_actual_api_key_here
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/knowledge_graph"
```

**Step 2: Build and start**
```bash
docker-compose up --build
```

This will:
- Build the Next.js app
- Start PostgreSQL
- Run database migrations
- Start the app on port 3000

**Step 3: Access the app**
Open http://localhost:3000

## Useful Commands

### Development Mode

```bash
# Start PostgreSQL
docker-compose -f docker-compose.dev.yml up -d

# Stop PostgreSQL
docker-compose -f docker-compose.dev.yml down

# View PostgreSQL logs
docker-compose -f docker-compose.dev.yml logs -f

# Access PostgreSQL CLI
docker exec -it kg-postgres-dev psql -U postgres -d knowledge_graph

# Reset database (WARNING: deletes all data)
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
npx prisma migrate dev --name init
```

### Full Docker Mode

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View app logs only
docker-compose logs -f app

# View PostgreSQL logs only
docker-compose logs -f postgres

# Rebuild and restart
docker-compose up --build --force-recreate

# Reset everything (WARNING: deletes all data)
docker-compose down -v
docker-compose up --build
```

## Database Management

### Using Prisma Studio

```bash
# With development mode (PostgreSQL in Docker, app local)
npx prisma studio
```

Opens a GUI at http://localhost:5555 to view and edit data.

### Direct PostgreSQL Access

```bash
# Connect to PostgreSQL
docker exec -it kg-postgres-dev psql -U postgres -d knowledge_graph

# Common SQL commands
\dt              # List tables
\d+ Workspace    # Describe Workspace table
SELECT * FROM "Workspace";
\q               # Quit
```

### Backup and Restore

**Backup:**
```bash
docker exec kg-postgres-dev pg_dump -U postgres knowledge_graph > backup.sql
```

**Restore:**
```bash
cat backup.sql | docker exec -i kg-postgres-dev psql -U postgres knowledge_graph
```

## Switching Between SQLite and PostgreSQL

### To SQLite (local file)

1. Edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

2. Edit `.env`:
```env
DATABASE_URL="file:./dev.db"
```

3. Run migrations:
```bash
npx prisma migrate dev --name switch_to_sqlite
```

### To PostgreSQL (Docker)

1. Edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Edit `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/knowledge_graph"
```

3. Start PostgreSQL:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

4. Run migrations:
```bash
npx prisma migrate dev --name switch_to_postgresql
```

## Troubleshooting

### PostgreSQL won't start

**Error:** Port 5432 already in use

**Solution:**
```bash
# Check what's using port 5432
netstat -ano | findstr :5432

# Stop existing PostgreSQL service
# Or change port in docker-compose.dev.yml:
ports:
  - "5433:5432"  # Use 5433 instead

# Update DATABASE_URL in .env:
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/knowledge_graph"
```

### Connection refused

**Error:** Can't connect to PostgreSQL

**Solution:**
```bash
# Check if PostgreSQL is healthy
docker-compose -f docker-compose.dev.yml ps

# View logs
docker-compose -f docker-compose.dev.yml logs postgres

# Restart PostgreSQL
docker-compose -f docker-compose.dev.yml restart postgres
```

### Migrations fail

**Error:** Migration failed

**Solution:**
```bash
# Reset database
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d

# Wait 10 seconds, then run migrations
npx prisma migrate dev --name init
```

### App can't connect in Docker

**Error:** App container can't reach PostgreSQL

**Solution:**
Make sure `DATABASE_URL` uses `postgres` as hostname (not `localhost`):
```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/knowledge_graph"
```

## Performance Tips

### PostgreSQL Configuration

For better performance, you can customize PostgreSQL settings:

Create `postgres.conf`:
```conf
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB
```

Update `docker-compose.dev.yml`:
```yaml
postgres:
  # ... existing config
  volumes:
    - postgres_data_dev:/var/lib/postgresql/data
    - ./postgres.conf:/etc/postgresql/postgresql.conf
  command: postgres -c config_file=/etc/postgresql/postgresql.conf
```

## Production Deployment

For production, use managed PostgreSQL services:

- **Vercel**: Use Vercel Postgres
- **Railway**: Built-in PostgreSQL
- **Heroku**: Heroku Postgres
- **AWS**: RDS PostgreSQL
- **Google Cloud**: Cloud SQL

See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.

## Data Persistence

Data is stored in Docker volumes:

- Development: `postgres_data_dev`
- Production: `postgres_data`

To view volumes:
```bash
docker volume ls
```

To remove volumes (deletes all data):
```bash
docker-compose -f docker-compose.dev.yml down -v
```

## Security Notes

- Default password is `postgres` - change for production
- PostgreSQL is exposed on port 5432 - restrict in production
- Use strong passwords and environment variables
- Enable SSL for production databases

## Next Steps

1. Start PostgreSQL: `docker-compose -f docker-compose.dev.yml up -d`
2. Run migrations: `npx prisma migrate dev`
3. Start app: `npm run dev`
4. Upload documents and build your knowledge graph!

For more help, see:
- [README.md](./README.md) - General setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
