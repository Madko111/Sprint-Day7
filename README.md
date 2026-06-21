# AI Chat MVP

A production-ready ChatGPT-style AI chat application built with Next.js 14, Supabase, and OpenAI.

## Features

✅ **Multi-conversation support** - Create and manage multiple chat conversations  
✅ **Real-time streaming** - Progressive token streaming with OpenAI GPT-4o-mini  
✅ **Authentication** - Secure email/password auth with Supabase  
✅ **Auto-generated titles** - Conversations automatically titled from first message  
✅ **Token tracking** - Real-time token usage counter  
✅ **Custom system prompts** - Editable per-conversation assistant behavior  
✅ **Markdown rendering** - Code blocks, lists, and rich text formatting  
✅ **Mobile responsive** - Drawer sidebar for mobile devices  
✅ **Stop generation** - Cancel AI responses mid-stream  

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL + RLS)
- **Auth:** Supabase Auth
- **AI:** OpenAI GPT-4o-mini
- **Deployment:** Vercel Edge Runtime

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key

### Installation

1. **Clone and install dependencies**
```bash
git clone <your-repo>
cd ai-chat-mvp
npm install
```

2. **Set up Supabase**

Create a Supabase project at https://supabase.com

Execute the SQL schema:
```bash
# Open SQL Editor in Supabase Dashboard
# Copy and paste contents of supabase/schema.sql
# Click "Run"
```

3. **Configure environment variables**

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-openai-key
```

4. **Run development server**
```bash
npm run dev
```

Open http://localhost:3000

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

See full deployment instructions in the detailed README sections below.

## Documentation

- [BUSINESS.md](./BUSINESS.md) - Cost analysis, pricing recommendations, abuse vectors
- [DECISIONS.md](./DECISIONS.md) - Technical decisions, architecture rationale
- [.env.example](./.env.example) - Environment variables template

## Quick Test

After setup:
1. Navigate to `/signup` and create an account
2. Log in at `/login`
3. Create a new conversation
4. Send a message and watch it stream
5. Verify token counter updates

## Architecture Highlights

- **Streaming:** Native fetch with ReadableStream
- **Context Window:** Sliding window (last 10 messages) for cost efficiency
- **Security:** RLS policies, server-side API key
- **Cost:** ~$0.0005 per 5-turn session

## Database Schema

- `chat_conversations`: Stores conversation metadata
- `chat_messages`: Stores individual messages with token counts

## API Routes

- `POST /api/chat` - Streams AI responses
- `POST /api/generate-title` - Generates conversation titles

## Testing Checklist

- [ ] Sign up / Log in
- [ ] Create conversation
- [ ] Send messages (streaming works)
- [ ] Refresh page (messages persist)
- [ ] Switch conversations
- [ ] Delete conversation
- [ ] Mobile drawer works
- [ ] Stop generation button works

## License

MIT

---

**Built for Sprint Day 7 Evaluation**  
Production-ready AI chat MVP with streaming, auth, and cost-efficient context management.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
