# Quick Supabase Initialization Guide

## Step 1: Create Supabase Project

1. **Open Supabase**: https://supabase.com
2. **Sign in** or **Sign up** (free account)
3. Click the **"New Project"** button
4. Fill in the form:
   - **Name**: `student-management` (or your preferred name)
   - **Database Password**: Create a strong password and **SAVE IT**
   - **Region**: Choose the region closest to you
   - **Pricing Plan**: Free tier is perfect for this app
5. Click **"Create new project"**
6. Wait ~2 minutes for the project to be provisioned

---

## Step 2: Initialize Database Tables

### Option A: Using SQL Editor (Recommended)

1. In your Supabase project dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"** button
3. **Copy ALL the SQL below** and paste it into the editor:

```sql
-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lesson_packages table
CREATE TABLE IF NOT EXISTS lesson_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  package_type TEXT NOT NULL,
  total_lessons INTEGER NOT NULL,
  remaining_lessons INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES lesson_packages(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT false,
  notes TEXT,
  topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  notes TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lesson_packages_student_id ON lesson_packages(student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_package_id ON lessons(package_id);
CREATE INDEX IF NOT EXISTS idx_lessons_student_id ON lessons(student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_scheduled_date ON lessons(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_documents_student_id ON documents(student_id);
```

4. Click the **"Run"** button (or press Cmd/Ctrl + Enter)
5. You should see: ✅ **"Success. No rows returned"**

### Verify Tables Were Created

1. Click **"Table Editor"** in the left sidebar
2. You should see 4 tables:
   - ✅ students
   - ✅ lesson_packages
   - ✅ lessons
   - ✅ documents

---

## Step 3: Get Your API Credentials

1. Click the **"Settings"** icon (⚙️) in the left sidebar
2. Click **"API"** in the settings menu
3. Find and copy these two values:

   **A. Project URL**

   ```
   Example: https://abcdefghijklmnop.supabase.co
   ```

   **B. anon/public key** (under "Project API keys")

   ```
   Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...
   ```

---

## Step 4: Configure Your Application

1. **Open or create** the `.env` file in your project root:

   ```bash
   # If .env doesn't exist, create it:
   touch .env
   ```

2. **Add your credentials** to `.env`:

   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Replace** `your-project-id` with your actual Project URL
4. **Replace** the key with your actual anon key

---

## Step 5: Test the Connection

1. **Start your application**:

   ```bash
   npm run dev
   ```

2. **Look for this message** in the terminal:

   ```
   Using Supabase storage  ✅
   ```

3. **Test creating a student**:
   - Go to http://localhost:5001
   - Click "Add Student"
   - Fill in the form and submit

4. **Verify in Supabase**:
   - Go back to Supabase dashboard
   - Click "Table Editor" → "students"
   - You should see your new student! 🎉

---

## Step 6: (Optional) Add Sample Data

If you want to start with some test data, run this in SQL Editor:

```sql
-- Insert sample student
INSERT INTO students (first_name, last_name, email, phone)
VALUES
  ('John', 'Doe', 'john.doe@example.com', '555-0123'),
  ('Jane', 'Smith', 'jane.smith@example.com', '555-0124');

-- Get the student IDs (you'll need these for packages)
-- They will be displayed in the results
SELECT id, first_name, last_name FROM students;

-- Insert sample lesson packages (replace the UUIDs with actual student IDs from above)
INSERT INTO lesson_packages (student_id, package_type, total_lessons, remaining_lessons)
VALUES
  ('PASTE-STUDENT-ID-HERE', 'Piano Lessons', 10, 10);
```

---

## ✅ Checklist

- [ ] Supabase project created
- [ ] SQL schema executed successfully
- [ ] All 4 tables visible in Table Editor
- [ ] Project URL copied
- [ ] Anon key copied
- [ ] `.env` file configured
- [ ] App started and shows "Using Supabase storage"
- [ ] Successfully created a test student
- [ ] Verified data appears in Supabase dashboard

---

## 🆘 Troubleshooting

### "Failed to create student"

- Double-check your `.env` file has correct credentials
- Make sure there are no extra spaces or quotes
- Verify the tables exist in Supabase Table Editor

### "Using in-memory storage" message

- Your `.env` file might not be loaded
- Check the file is named exactly `.env` (not `.env.txt`)
- Restart the server after editing `.env`

### Can't find SQL Editor

- It's in the left sidebar, looks like: `</>`
- Make sure your project has finished initializing

---

## 🎉 Done!

Your Student Management System is now using Supabase!

- ✅ Professional PostgreSQL database
- ✅ Automatic backups
- ✅ Real-time data
- ✅ Scalable for production

Next: Start using the app and watch your data sync to Supabase in real-time!
