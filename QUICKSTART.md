# Quick Start Guide

Get the Knowledge Graph Builder running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- npm or yarn
- Google Gemini API key

## Steps

### 1. Install Dependencies (2 min)
```bash
npm install
```

### 2. Setup Environment (1 min)
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your Gemini API key
# Get key from: https://makersuite.google.com/app/apikey
```

Your `.env` should look like:
```env
GEMINI_API_KEY=AIzaSy...your_actual_key_here
DATABASE_URL="file:./dev.db"
```

### 3. Setup Database (1 min)
```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Run the App (1 min)
```bash
npm run dev
```

Open http://localhost:3000 in your browser!

## First Use

1. **Create a Workspace**
   - Enter a name like "Tech News Analysis"
   - Click "Create Workspace"

2. **Upload Documents**
   - Click on your workspace
   - Click "Upload Files"
   - Select files from `sample-documents/` folder
   - Wait for AI processing (10-30 seconds)

3. **Explore the Graph**
   - See entities as colored nodes
   - Relationships shown as arrows
   - Search entities in the sidebar
   - Filter by type (Person, Organization, etc.)
   - Export as JSON

## Troubleshooting

### "Gemini API not connected"
- Check your API key in `.env`
- Visit `/status` page to verify
- Get new key from https://makersuite.google.com/app/apikey

### "Database error"
- Delete `prisma/dev.db`
- Run `npx prisma migrate dev` again

### "Build fails"
- Delete `.next` folder
- Run `npm install` again
- Try `npm run build`

### "Port 3000 already in use"
- Kill the process: `npx kill-port 3000`
- Or use different port: `PORT=3001 npm run dev`

## Next Steps

- Read [README.md](./README.md) for detailed documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy online
- Review [AI_NOTES.md](./AI_NOTES.md) to understand AI usage

## Need Help?

1. Check the `/status` page in the app
2. Review error messages in terminal
3. Read the full README.md
4. Check GitHub issues

## Production Deployment

For deploying to Vercel (free):

```bash
# 1. Push to GitHub
git remote add origin <your-repo-url>
git push -u origin master

# 2. Go to vercel.com
# 3. Import your GitHub repo
# 4. Add GEMINI_API_KEY environment variable
# 5. Deploy!
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for more options.

---

**That's it!** You should now have a working Knowledge Graph Builder. 🎉

For the full experience, upload the sample documents and explore the interactive graph!
