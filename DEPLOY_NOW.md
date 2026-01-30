# 🚀 Quick Deployment Steps

## Your build is ready! ✅

Now choose your deployment method:

---

## Option 1: Vercel CLI (Continue where we left off)

1. **Authenticate:**

   ```bash
   npx vercel login
   ```

   Visit the URL shown and enter the code

2. **Deploy:**

   ```bash
   npx vercel --prod
   ```

3. **Add Environment Variables:**
   After deployment, go to:
   - Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add:
     - `SUPABASE_URL` = (your URL from .env)
     - `SUPABASE_ANON_KEY` = (your key from .env)

4. **Redeploy:**
   ```bash
   npx vercel --prod
   ```

---

## Option 2: Vercel Dashboard (Easier - Recommended)

### Step 1: Push to GitHub

```bash
# If not already done
git add .
git commit -m "Ready for deployment"

# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/student-management.git
git push -u origin main
```

### Step 2: Deploy via Vercel Dashboard

1. Go to https://vercel.com (opened in browser)
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repo
5. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

6. **Add Environment Variables:**
   Click "Environment Variables" and add:

   ```
   SUPABASE_URL = your_supabase_url_here
   SUPABASE_ANON_KEY = your_supabase_key_here
   ```

7. Click **"Deploy"**

8. **Your site will be live in ~2 minutes!** 🎉

---

## Option 3: Railway (Alternative)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Add environment variables
railway variables set SUPABASE_URL=your_url
railway variables set SUPABASE_ANON_KEY=your_key

# Get your URL
railway domain
```

---

## Get Your Supabase Credentials

Run this to see your credentials:

```bash
cat .env
```

Or get them from:
https://supabase.com/dashboard → Your Project → Settings → API

---

## After Deployment

Test your live site:

1. Visit the deployment URL
2. Create a student
3. Check Supabase Table Editor to see the data

---

## Need Help?

- Full deployment guide: `DEPLOYMENT.md`
- Check Vercel docs: https://vercel.com/docs
- Vercel support: https://vercel.com/support

---

## Quick Commands Reference

```bash
# Deploy with Vercel CLI
npx vercel login
npx vercel --prod

# Check build locally
npm run build
npm start

# View environment variables
cat .env

# Check Supabase status
./check-env.sh
```

---

**Recommended: Use Vercel Dashboard (Option 2) - it's the easiest!**
