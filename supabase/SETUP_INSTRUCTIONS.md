# Supabase Database Setup Instructions

## Overview
This guide will help you run the SQL migrations to set up the Storyline database schema in your Supabase project.

---

## Method 1: Supabase Dashboard (Recommended)

### Step 1: Access SQL Editor
1. Go to your Supabase project dashboard: https://app.supabase.com
2. Select your project: **lwlvwkklpgcgtbgzynrn**
3. Click on **"SQL Editor"** in the left sidebar

### Step 2: Run Schema Migration
1. Create a new query
2. Copy the entire contents of `supabase/migrations/01_schema.sql`
3. Paste into the SQL editor
4. Click **"Run"** button
5. Verify success message appears

### Step 3: Run RLS Policies
1. Create another new query
2. Copy the entire contents of `supabase/migrations/02_rls_policies.sql`
3. Paste into the SQL editor
4. Click **"Run"** button
5. Verify success message appears

### Step 4: Verify Tables Created
1. Click on **"Table Editor"** in the left sidebar
2. You should see 5 new tables:
   - `movie_logs`
   - `book_logs`
   - `travel_logs`
   - `blog_posts`
   - `blog_comments`

---

## Method 2: Supabase CLI (Advanced)

### Prerequisites
```bash
npm install -g supabase
```

### Step 1: Link to Your Project
```bash
supabase link --project-ref lwlvwkklpgcgtbgzynrn
```

### Step 2: Run Migrations
```bash
supabase db push
```

This will automatically apply all migrations in the `supabase/migrations/` folder.

---

## Verification Checklist

After running the migrations, verify the following:

### Tables Created ✓
- [ ] `movie_logs` - 14 columns
- [ ] `book_logs` - 15 columns
- [ ] `travel_logs` - 12 columns
- [ ] `blog_posts` - 11 columns
- [ ] `blog_comments` - 6 columns

### Indexes Created ✓
- [ ] User ID indexes on all tables
- [ ] Date indexes for sorting
- [ ] Slug index on blog_posts

### Triggers Created ✓
- [ ] Auto-update `updated_at` on all tables

### RLS Enabled ✓
1. Go to **"Authentication"** → **"Policies"**
2. Each table should show:
   - **RLS Enabled**: ✓
   - **4 policies** for logs (SELECT, INSERT, UPDATE, DELETE)
   - **4 policies** for blog_posts
   - **4 policies** for blog_comments

### Test RLS Policies
You can test the policies manually:

```sql
-- This should fail (no user context)
SELECT * FROM movie_logs;

-- This should work (with authenticated user)
SELECT * FROM movie_logs WHERE user_id = auth.uid()::text;
```

---

## Database Schema Overview

### Movie Logs
```sql
- id (UUID, Primary Key)
- user_id (TEXT, Clerk User ID)
- imdb_id, title, year, director, genre, poster_url, plot
- rating (1-5 stars)
- notes, watched_date
- created_at, updated_at
```

### Book Logs
```sql
- id (UUID, Primary Key)
- user_id (TEXT, Clerk User ID)
- isbn, title, author, publish_year, cover_url, description, page_count
- rating (1-5 stars)
- notes, started_date, finished_date
- created_at, updated_at
```

### Travel Logs
```sql
- id (UUID, Primary Key)
- user_id (TEXT, Clerk User ID)
- location_name, country, latitude, longitude
- visit_date, duration_days, notes
- photo_url (Supabase Storage path)
- created_at, updated_at
```

### Blog Posts
```sql
- id (UUID, Primary Key)
- user_id (TEXT, Clerk User ID)
- title, slug, content (markdown), excerpt
- tags (text array)
- published, published_at
- created_at, updated_at
```

### Blog Comments
```sql
- id (UUID, Primary Key)
- blog_post_id (UUID, Foreign Key)
- user_id (TEXT, Clerk User ID)
- content
- created_at, updated_at
```

---

## RLS Policy Summary

### Private Logs (Movies, Books, Travel)
- **Rule**: Users can ONLY access their own logs
- **Check**: `auth.uid()::text = user_id`

### Blog Posts
- **Public**: Published posts visible to everyone
- **Private**: Draft posts only visible to author
- **Authors**: Can create, update, delete their own posts

### Blog Comments
- **Public**: Comments on published posts visible to all
- **Authenticated**: Signed-in users can comment
- **Deletion**: Users can delete their own comments; post authors can delete any comment on their posts

---

## Troubleshooting

### Error: "relation does not exist"
- **Cause**: Migration not run yet
- **Fix**: Run `01_schema.sql` first

### Error: "RLS policy already exists"
- **Cause**: Trying to run migrations twice
- **Fix**: Drop existing policies or skip

### Error: "auth.uid() is null"
- **Cause**: No authenticated user context
- **Fix**: This is expected in SQL editor; RLS will work in the app

### Error: "permission denied"
- **Cause**: RLS is working correctly!
- **Fix**: This is expected; users need to authenticate via Clerk

---

## Next Steps (Phase 3)

Once the database is set up, you can:
1. Test helper functions in `lib/supabase/queries.ts`
2. Connect the dashboard to show real stats
3. Implement movie tracking with OMDb API
4. Build book tracking with Open Library API

---

## Storage Bucket Setup (for Travel Photos)

### Create Storage Bucket
1. Go to **"Storage"** in Supabase dashboard
2. Click **"New bucket"**
3. Name: `travel-photos`
4. **Public**: No (keep private)
5. Click **"Create bucket"**

### Set RLS Policies for Storage
```sql
-- Allow users to upload their own travel photos
CREATE POLICY "Users can upload their own travel photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'travel-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own travel photos
CREATE POLICY "Users can view their own travel photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'travel-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

Folder structure: `travel-photos/{user_id}/{photo_id}.jpg`

---

## Success! 🎉

Your Storyline database is now ready for action.
