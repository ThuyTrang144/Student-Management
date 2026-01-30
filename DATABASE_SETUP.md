# Student Management System - Database Migration Guide

## ✅ What Has Been Set Up

I've integrated **Supabase** as your database solution. Here's what's ready:

### 📁 New Files Created

1. **`supabase-schema.sql`** - SQL migration to create all tables in Supabase
2. **`server/supabase-storage.ts`** - Supabase storage implementation
3. **`SUPABASE_SETUP.md`** - Detailed setup instructions
4. **`setup-supabase.sh`** - Automated setup script
5. **`.env.example`** - Example environment configuration

### 🔄 Modified Files

1. **`server/index.ts`** - Added dotenv to load environment variables
2. **`server/routes.ts`** - Updated to use dynamic storage
3. **`server/storage.ts`** - Added `getStorage()` function for automatic switching

---

## 🚀 Quick Start (2 Options)

### Option 1: Use Supabase (Recommended for Production)

#### Step 1: Run the setup script

```bash
./setup-supabase.sh
```

#### Step 2: Create Supabase Project

1. Go to https://supabase.com
2. Sign up/Login
3. Click **"New Project"**
4. Fill in:
   - Name: `student-management`
   - Database Password: (create a strong password)
   - Region: (choose closest to you)
5. Click **"Create new project"** (takes ~2 minutes)

#### Step 3: Get Your Credentials

1. In Supabase, go to **Settings** → **API**
2. Copy:
   - **Project URL**
   - **anon/public key**

#### Step 4: Configure .env file

Open `.env` and add your credentials:

```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Step 5: Create Database Tables

1. In Supabase, click **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy the entire content of `supabase-schema.sql`
4. Paste into the editor
5. Click **"Run"**
6. You should see: ✅ Success. No rows returned

#### Step 6: Start Your App

```bash
npm run dev
```

### Option 2: Use Local JSON Files (Quick Testing)

Just start the app without setting up Supabase:

```bash
npm run dev
```

The app will automatically use in-memory storage with JSON file persistence.

---

## 🎯 How It Works

```
┌─────────────────────────────────────┐
│   Application Startup               │
└───────────┬─────────────────────────┘
            │
            ▼
    ┌───────────────┐
    │  Check .env   │
    └───────┬───────┘
            │
      ┌─────┴─────┐
      │           │
      ▼           ▼
┌──────────┐  ┌──────────────┐
│ Supabase │  │  Memory +    │
│ Storage  │  │  JSON Files  │
└──────────┘  └──────────────┘
      │              │
      └──────┬───────┘
             │
             ▼
    ┌─────────────────┐
    │  Your Routes    │
    │  Work the Same  │
    └─────────────────┘
```

### Automatic Detection:

- ✅ **If `.env` has Supabase credentials** → Uses Supabase (PostgreSQL)
- ❌ **If no Supabase credentials** → Uses in-memory storage with JSON files

---

## 📊 Database Structure

### Tables Created:

```
students
├── id (UUID, Primary Key)
├── first_name (Text)
├── last_name (Text)
├── email (Text, Unique)
├── phone (Text)
└── created_at (Timestamp)

lesson_packages
├── id (UUID, Primary Key)
├── student_id (FK → students)
├── package_type (Text)
├── total_lessons (Integer)
├── remaining_lessons (Integer)
├── is_active (Boolean)
└── created_at (Timestamp)

lessons
├── id (UUID, Primary Key)
├── package_id (FK → lesson_packages)
├── student_id (FK → students)
├── scheduled_date (Timestamp)
├── completed_date (Timestamp)
├── is_completed (Boolean)
├── notes (Text)
├── topic (Text)
└── created_at (Timestamp)

documents
├── id (UUID, Primary Key)
├── student_id (FK → students)
├── file_name (Text)
├── file_url (Text)
├── file_type (Text)
├── notes (Text)
└── uploaded_at (Timestamp)
```

---

## ✨ Benefits of Supabase

| Feature           | Memory Storage      | Supabase                |
| ----------------- | ------------------- | ----------------------- |
| Data Persistence  | JSON files          | PostgreSQL              |
| Multiple Users    | ❌ (file conflicts) | ✅ Real-time sync       |
| Scalability       | Limited             | Unlimited               |
| Backup            | Manual              | Automatic               |
| Real-time Updates | ❌                  | ✅                      |
| Free Tier         | N/A                 | 500MB DB, 2GB bandwidth |

---

## 🔍 Verify Your Setup

### Check if Supabase is connected:

When you start the app, look for this message:

```
Using Supabase storage  ← You're using Supabase ✅
```

or

```
Using in-memory storage with JSON persistence  ← Using local files
```

### View your data in Supabase:

1. Go to your Supabase project
2. Click **Table Editor** (left sidebar)
3. Select any table (`students`, `lessons`, etc.)
4. See your data in real-time!

---

## 🆘 Need Help?

### Common Issues:

**"Failed to create student"**

- ✅ Check `.env` has correct credentials
- ✅ Verify tables exist in Supabase (Table Editor)
- ✅ Make sure project is not paused

**"No data showing"**

- ✅ Run the SQL migration in Supabase
- ✅ Check browser console for errors
- ✅ Verify API keys in `.env`

**Want to switch back to JSON files?**

- Remove/comment out lines in `.env`
- Restart the app

---

## 📝 Next Steps

1. **Run the setup** (see Quick Start above)
2. **Test the app** - Create a student, add lessons
3. **Check Supabase dashboard** - See data appear in real-time
4. **Customize** - Modify tables, add features

---

## 🎉 You're All Set!

Your app now has:

- ✅ Professional database (PostgreSQL via Supabase)
- ✅ Automatic backups
- ✅ Scalable infrastructure
- ✅ Real-time capabilities
- ✅ Free tier (perfect for learning/testing)

Start coding! 🚀
