# Deployment Guide - Student Management System

## 🚀 Quick Deployment Options

Your app is ready to deploy! Choose the platform that fits your needs:

---

## Option 1: Vercel (Recommended - Easiest)

### Why Vercel?

- ✅ Free tier
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Auto-deployments from GitHub
- ✅ Perfect for full-stack apps

### Steps:

1. **Prepare your project**

   ```bash
   # Make sure you're in the project directory
   cd /Users/tttnguyen/Work/Student-Management

   # Push to GitHub if not already
   git init
   git add .
   git commit -m "Ready for deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/student-management.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect your GitHub repository
   - Configure:
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Add Environment Variables**
   In Vercel dashboard → Settings → Environment Variables:

   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_key
   ```

4. **Deploy!**
   - Click "Deploy"
   - Your app will be live in ~2 minutes at `your-project.vercel.app`

---

## Option 2: Railway (Great for Full-Stack)

### Why Railway?

- ✅ Free $5/month credit
- ✅ Easy Node.js deployment
- ✅ PostgreSQL included (but you're using Supabase)
- ✅ Simple CLI

### Steps:

1. **Install Railway CLI**

   ```bash
   npm i -g @railway/cli
   ```

2. **Login and Deploy**

   ```bash
   railway login
   railway init
   railway up
   ```

3. **Add Environment Variables**

   ```bash
   railway variables set SUPABASE_URL=your_url
   railway variables set SUPABASE_ANON_KEY=your_key
   ```

4. **Your app is live!**
   ```bash
   railway domain  # Get your deployment URL
   ```

---

## Option 3: Render (Free Tier Available)

### Steps:

1. **Push to GitHub** (see Vercel step 1)

2. **Create New Web Service**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect GitHub repository

3. **Configure**

   ```
   Name: student-management
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Environment Variables**
   Add in Render dashboard:
   ```
   SUPABASE_URL=your_url
   SUPABASE_ANON_KEY=your_key
   PORT=10000
   ```

---

## Option 4: Traditional VPS (DigitalOcean, AWS, etc.)

### Prerequisites:

- Ubuntu/Linux server
- Node.js 18+ installed
- Domain name (optional)

### Steps:

1. **SSH into your server**

   ```bash
   ssh user@your-server-ip
   ```

2. **Install Node.js**

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone your repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/student-management.git
   cd student-management
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Create .env file**

   ```bash
   nano .env
   ```

   Add:

   ```env
   SUPABASE_URL=your_url
   SUPABASE_ANON_KEY=your_key
   PORT=5000
   ```

6. **Build the app**

   ```bash
   npm run build
   ```

7. **Install PM2 (Process Manager)**

   ```bash
   sudo npm install -g pm2
   ```

8. **Start the app**

   ```bash
   pm2 start npm --name "student-management" -- start
   pm2 save
   pm2 startup
   ```

9. **Setup Nginx (Reverse Proxy)**

   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/student-management
   ```

   Add:

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable and restart:

   ```bash
   sudo ln -s /etc/nginx/sites-available/student-management /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

10. **Setup SSL (Optional but Recommended)**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] ✅ Supabase database is set up with all tables
- [ ] ✅ `.env` file is NOT committed (already in `.gitignore`)
- [ ] ✅ Environment variables are ready to add to hosting platform
- [ ] ✅ Build command works locally: `npm run build`
- [ ] ✅ Production start works: `npm start`
- [ ] ✅ All dependencies are in `package.json` (not devDependencies)

---

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` to GitHub
   - Use platform's environment variable system
   - Rotate keys periodically

2. **Supabase Security**
   - Enable Row Level Security (RLS) in Supabase
   - Set up proper policies for tables
   - Use anon key for client-side (already doing this)

3. **HTTPS**
   - All platforms provide HTTPS automatically
   - Never deploy without HTTPS in production

---

## 🧪 Test Your Deployment

After deployment:

1. **Check the URL** - Visit your deployment URL
2. **Create a student** - Test the form
3. **Check Supabase** - Verify data is saved in Supabase Table Editor
4. **Test all features** - Lessons, documents, etc.

---

## 🐛 Common Deployment Issues

### "Module not found"

```bash
# Make sure all dependencies are in package.json
npm install --save-prod package-name
```

### "Port already in use"

```bash
# Use environment variable PORT
# Most platforms set this automatically
```

### "Database connection failed"

- Check environment variables are set correctly
- Verify Supabase URL and key
- Check Supabase project is not paused

### Build fails

```bash
# Test locally first
npm run build

# Check TypeScript errors
npm run check
```

---

## 📊 Recommended Setup (Cost: Free)

For production with free tier:

1. **Database**: Supabase (Free - 500MB)
2. **Hosting**: Vercel (Free - Hobby plan)
3. **Domain**: Vercel gives you a free subdomain
4. **SSL**: Automatic with Vercel
5. **CI/CD**: Automatic deployments from GitHub

**Total Cost: $0/month** 🎉

---

## 🚀 Quick Deploy Commands

### For Vercel (via CLI):

```bash
npm i -g vercel
vercel login
vercel --prod
# Follow prompts and add environment variables
```

### For Railway:

```bash
npm i -g @railway/cli
railway login
railway init
railway up
railway variables set SUPABASE_URL=your_url SUPABASE_ANON_KEY=your_key
```

### For Render:

Use the web interface (easiest) or connect via GitHub

---

## 📚 Additional Resources

- [Vercel Deployment Docs](https://vercel.com/docs)
- [Railway Deployment Guide](https://docs.railway.app)
- [Render Node.js Guide](https://render.com/docs/deploy-node-express-app)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)

---

## 🎯 Next Steps After Deployment

1. Set up custom domain (optional)
2. Configure Row Level Security in Supabase
3. Add monitoring (Vercel Analytics, etc.)
4. Set up automated backups
5. Add error tracking (Sentry, etc.)

---

## 💡 Pro Tips

- Use **Vercel** for the easiest deployment
- Set up **automatic deployments** from GitHub main branch
- Keep **development** and **production** environments separate
- Use different Supabase projects for dev/prod
- Monitor your app with platform analytics

---

**Ready to deploy? Start with Vercel - it's the fastest way to get your app online!** 🚀
