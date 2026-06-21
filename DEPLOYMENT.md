# AI Chat MVP - Deployment Checklist

## ✅ Pre-Deployment Checks

### Code Quality
- [x] No TypeScript errors
- [x] No build errors
- [x] Mock AI working locally
- [x] Auth flow tested
- [x] Database schema deployed
- [x] All components render correctly

### Environment Variables
Required in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY` (когда будешь готов)

⚠️ **Важно:** `USE_MOCK_AI=true` НЕ добавлять в Vercel (только для локальной разработки)

### Files Ready
- [x] `.env.example` - template для других
- [x] `.gitignore` - `.env.local` не будет в Git
- [x] `README.md` - документация
- [x] `BUSINESS.md` - cost analysis
- [x] `DECISIONS.md` - technical decisions
- [x] `supabase/schema.sql` - database schema

### Git Ready
- [x] All files saved
- [x] No sensitive data in code
- [x] `.env.local` in `.gitignore`

---

## 🚀 Deployment Steps

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: AI Chat MVP"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

5. Add Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://qiiryisovucikrxfolbj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpaXJ5aXNvdnVjaWtyeGZvbGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTE0MDMsImV4cCI6MjA5NTM4NzQwM30.1l84Ryq1dVKZbxxXVI0YtD5C9491fTVv7A99JMaeZL8
OPENAI_API_KEY=<leave-empty-for-now-or-add-real-key>
```

6. Click "Deploy"

### 3. Post-Deployment

1. **Test production URL:**
   - Sign up
   - Log in
   - Create conversation
   - Send message (will use Mock AI if no OpenAI key)

2. **Add OpenAI key when ready:**
   - Vercel Dashboard → Project → Settings → Environment Variables
   - Add `OPENAI_API_KEY=sk-proj-...`
   - Redeploy (Deployments → ... → Redeploy)

3. **Configure Supabase redirect URLs:**
   - Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel URL: `https://your-app.vercel.app/auth/callback`

---

## 🔒 Security Check

- [x] `.env.local` not in Git
- [x] No hardcoded secrets in code
- [x] API keys only in environment variables
- [x] RLS policies enabled in Supabase
- [x] Auth required for all conversations

---

## 📊 Monitoring After Deploy

- Check Vercel Analytics for errors
- Monitor Supabase Dashboard for database activity
- Watch OpenAI usage if API key added
- Check Vercel logs if issues occur

---

## 🐛 Common Deployment Issues

### Issue: "Module not found"
- Solution: Check `package.json` has all dependencies
- Run `npm install` locally first

### Issue: "Build failed"
- Solution: Run `npm run build` locally to catch errors
- Fix TypeScript/ESLint errors

### Issue: Auth redirect not working
- Solution: Add Vercel URL to Supabase redirect URLs

### Issue: Database connection fails
- Solution: Verify environment variables in Vercel
- Check Supabase project is running

### Issue: Mock AI still active in production
- Solution: Remove `USE_MOCK_AI` from Vercel env vars
- Add real `OPENAI_API_KEY`

---

## 📝 Notes

- **Free tier limits:**
  - Vercel: 100GB bandwidth/month
  - Supabase: 500MB database, 2GB bandwidth
  - OpenAI: Pay-as-you-go (no free tier)

- **Estimated costs:**
  - Development: $0 (Mock AI)
  - Production (100 users): ~$5-10/month (OpenAI)
  - Infrastructure: $0 (free tiers)

- **Next steps after deploy:**
  - Add custom domain
  - Enable Vercel Analytics
  - Set up monitoring/alerts
  - Implement rate limiting

---

**Ready to deploy!** 🚀
