# Supabase Setup Guide

This application now supports Supabase for database management. Follow these steps to set it up:

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "student-management")
5. Enter a secure database password
6. Select a region close to you
7. Click "Create new project"

## 2. Get Your Supabase Credentials

1. Once your project is created, go to **Settings** → **API**
2. Find these two values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public** key (under "Project API keys")

## 3. Run the Database Migration

1. In your Supabase project, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase-schema.sql` from this project
4. Click "Run" to create all the tables

## 4. Configure Your Application

1. Open the `.env` file in your project root (create it if it doesn't exist)
2. Add your Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

## 5. Install Dependencies

```bash
npm install @supabase/supabase-js dotenv
```

## 6. Start Your Application

```bash
npm run dev
```

## Features

- **Automatic Switching**: The app will automatically use Supabase if credentials are provided, otherwise it falls back to in-memory storage with JSON files
- **Real Database**: All data is stored in PostgreSQL via Supabase
- **Data Persistence**: Data persists across server restarts
- **Scalable**: Can handle multiple users and larger datasets
- **Backup**: Supabase handles automatic backups

## Database Schema

The application creates these tables:

- `students` - Student information
- `lesson_packages` - Lesson packages for each student
- `lessons` - Individual lessons with scheduling and completion tracking
- `documents` - Documents uploaded for students

## Troubleshooting

### "Failed to create student/lesson/document"

- Check your Supabase credentials in `.env`
- Verify the tables were created by running the SQL migration
- Check your Supabase project is active (not paused)

### Data not showing up

- Make sure you ran the SQL migration in Supabase
- Check the Supabase dashboard → Table Editor to see your data
- Verify your `.env` file has correct credentials

### Using Memory Storage Instead

If you want to use the in-memory storage with JSON files instead:

1. Remove or comment out the Supabase variables from `.env`
2. Restart the application
3. Data will be stored in `data/*.json` files

## Security Notes

- **Never commit your `.env` file** - it's already in `.gitignore`
- The anon key is safe to use in client-side code (it has Row Level Security)
- For production, consider setting up Row Level Security policies in Supabase
