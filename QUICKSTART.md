# Quick Start Guide - Simple Todo App

Get your Simple Todo application running in **5 minutes**! ⚡

---

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- A code editor (VS Code recommended)

---

## Step 1: Install Dependencies

```bash
pnpm install
```

This installs all dependencies for the monorepo (root, apps/web, packages/*).

---

## Step 2: Set Up Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local
```

**Edit `.env.local`** and leave these values as placeholders for now:

```bash
CONVEX_DEPLOYMENT=dev:your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
BETTER_AUTH_SECRET=placeholder
SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

We'll get the real values in the next step.

---

## Step 3: Start Convex Development Server

In your terminal, run:

```bash
npx convex dev
```

This will:
1. Ask you to log in (or create a Convex account)
2. Create a new project (or select an existing one)
3. Generate your deployment values
4. Start the Convex development server

**Copy the values** it prints:

```
✔ Deployment set to:
  CONVEX_DEPLOYMENT=dev:abc123
  NEXT_PUBLIC_CONVEX_URL=https://abc123.convex.cloud
```

**Update your `.env.local`** with these values.

---

## Step 4: Generate Better Auth Secret

In a **new terminal** (keep Convex running), generate a secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as `BETTER_AUTH_SECRET` in `.env.local`.

Your `.env.local` should now look like:

```bash
CONVEX_DEPLOYMENT=dev:abc123
NEXT_PUBLIC_CONVEX_URL=https://abc123.convex.cloud
BETTER_AUTH_SECRET=your-generated-secret-here
SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Step 5: Start Next.js Development Server

In the **same terminal** where you generated the secret:

```bash
cd apps/web
pnpm run dev
```

Or from the root directory:

```bash
pnpm run web:dev
```

---

## Step 6: Open the App

Open your browser to **http://localhost:3000**

You should see the **Sign In** page (you'll be redirected since you're not authenticated).

---

## Step 7: Create Your First Account

1. Click **"Sign up"** link
2. Enter:
   - **Name**: Your name
   - **Email**: your@email.com
   - **Password**: At least 8 characters with letters and numbers
3. Click **"Sign Up"**

You'll be redirected to the home page with your empty todo list! 🎉

---

## Step 8: Test the App

Try these actions:

1. **Create a task**: Type in the input field and click "Add Task"
2. **Mark as complete**: Click the checkbox next to a task
3. **Delete a task**: Click the trash icon
4. **Filter tasks**: Use the tabs (All / Active / Completed)
5. **View stats**: Check the statistics cards at the top

**Real-time test**: Open the app in two browser tabs and make changes in one - they'll appear instantly in the other! ⚡

---

## Troubleshooting

### "Not authenticated" error

- Make sure both Convex and Next.js servers are running
- Check that `.env.local` has the correct values
- Try clearing your browser cookies for localhost:3000

### "Rate limit exceeded" error

This is expected if you create tasks too quickly! Wait a few seconds and try again.

### "Missing NEXT_PUBLIC_CONVEX_URL" error

- Make sure `.env.local` exists in the **root directory**
- Restart the Next.js dev server after updating `.env.local`

### TypeScript errors

```bash
# Regenerate Convex types
npx convex dev --once
```

---

## Development Workflow

### Both servers at once (recommended):

```bash
# Terminal 1 (from root):
pnpm run dev
```

This starts both Convex and Next.js using `concurrently`.

### Separate terminals:

```bash
# Terminal 1 - Convex backend:
npx convex dev

# Terminal 2 - Next.js frontend:
cd apps/web && pnpm run dev
```

---

## Project Structure Overview

```
simple-todo-app/
├── convex/              # Backend (Convex)
│   ├── db/             # Database layer (CRUD operations)
│   ├── endpoints/      # API endpoints (business logic)
│   ├── helpers/        # Utilities (validation, etc.)
│   ├── schema.ts       # Database schema
│   └── auth.ts         # Authentication config
│
├── apps/web/           # Frontend (Next.js)
│   ├── app/           # App Router pages
│   ├── components/    # React components
│   └── lib/           # Client utilities
│
└── packages/          # Shared code
    ├── components/    # UI component library
    └── design-tokens/ # Theme configuration
```

---

## What's Next?

### Customize the App

1. **Change colors**: Edit `planning/theme.json`
2. **Add features**: See `PHASE_2_COMPLETE.md` for architecture guide
3. **Deploy**: See deployment section below

### Deploy to Production

**Backend (Convex)**:
```bash
npx convex deploy
```

**Frontend (Vercel)**:
```bash
npm install -g vercel
vercel
```

Update environment variables in Vercel dashboard:
- `NEXT_PUBLIC_CONVEX_URL` - from `npx convex deploy`
- `BETTER_AUTH_SECRET` - same as local
- `SITE_URL` - your production URL
- `NEXT_PUBLIC_SITE_URL` - your production URL

---

## Key Commands Reference

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start both Convex + Next.js |
| `pnpm run convex:dev` | Start only Convex |
| `pnpm run web:dev` | Start only Next.js |
| `pnpm run build` | Build for production |
| `pnpm run typecheck` | Check TypeScript types |
| `pnpm run storybook` | View component library |

---

## Need Help?

- **Architecture**: See `PHASE_2_COMPLETE.md`
- **Full documentation**: See `README.md`
- **Convex docs**: https://docs.convex.dev
- **Better Auth docs**: https://better-auth.com/docs
- **shadcn/ui docs**: https://ui.shadcn.com

---

**Happy coding!** 🚀

If everything is working, you now have a production-ready todo app with:
- ✅ Real-time synchronization
- ✅ User authentication
- ✅ Rate limiting
- ✅ Beautiful UI
- ✅ Type safety
- ✅ Clean architecture
