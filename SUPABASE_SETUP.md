# 🚀 Supabase Setup Guide for Boarded

Complete step-by-step guide to set up Supabase for your Boarded application.

---

## 📋 Prerequisites

- A Supabase account (free at [supabase.com](https://supabase.com))
- Node.js 18+ installed
- Boarded project cloned

---

## Step 1: Create Supabase Project

1. **Go to** [https://app.supabase.com](https://app.supabase.com)
2. **Click** "New Project"
3. **Fill in**:
   - Organization: Your organization or create new
   - Name: `boarded` (or your preferred name)
   - Database Password: **Save this securely!**
   - Region: Choose closest to your users
   - Pricing Plan: Free tier is perfect to start
4. **Click** "Create new project"
5. **Wait** 2-3 minutes for project to initialize

---

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** (gear icon) → **API**
2. You'll see two important values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. **Copy both** - you'll need them next

---

## Step 3: Configure Environment Variables

1. **In your Boarded project**, copy the example env file:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Open** `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Save** the file

---

## Step 4: Run Database Schema

1. **In Supabase Dashboard**, go to **SQL Editor** (left sidebar)
2. **Click** "New Query"
3. **Copy** the entire contents of `supabase/schema.sql` from your Boarded project
4. **Paste** into the SQL Editor
5. **Click** "Run" (or press Cmd/Ctrl + Enter)
6. **Wait** for success message: "Success. No rows returned"

This creates all your database tables!

---

## Step 5: Apply Row-Level Security Policies

1. **Still in SQL Editor**, click **"New Query"**
2. **Copy** the entire contents of `supabase/rls-policies.sql`
3. **Paste** into the editor
4. **Click** "Run"
5. **Wait** for success message

This secures your database so users can only see their own data!

---

## Step 6: Set Up Storage Buckets

1. **Go to** Storage (left sidebar) → **"Create a new bucket"**
2. **Create three buckets**:

   **Bucket 1: files**
   - Name: `files`
   - Public: ❌ No (private)
   - Click "Create bucket"

   **Bucket 2: signatures**
   - Name: `signatures`
   - Public: ❌ No (private)
   - Click "Create bucket"

   **Bucket 3: avatars**
   - Name: `avatars`
   - Public: ✅ Yes (public)
   - Click "Create bucket"

---

## Step 7: Configure Storage Policies

For each bucket, you need to set up access policies.

### For `files` bucket:

1. **Click** on the `files` bucket
2. **Go to** Policies tab
3. **Click** "New Policy" → "Create policy from scratch"
4. **Add INSERT policy:**
   - Policy name: `Users can upload own files`
   - Target roles: `authenticated`
   - Policy definition:
     ```sql
     (bucket_id = 'files'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
     ```
   - Click "Review" → "Save policy"

5. **Add SELECT policy:**
   - Policy name: `Users can view own files`
   - Target roles: `authenticated`
   - Policy definition:
     ```sql
     (bucket_id = 'files'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
     ```
   - Click "Review" → "Save policy"

6. **Add DELETE policy:**
   - Policy name: `Users can delete own files`
   - Target roles: `authenticated`
   - Policy definition:
     ```sql
     (bucket_id = 'files'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
     ```
   - Click "Review" → "Save policy"

### For `signatures` and `avatars` buckets:
- Repeat the same process above

---

## Step 8: Enable Authentication Providers

1. **Go to** Authentication (left sidebar) → **Providers**
2. **Email** is already enabled by default ✅
3. **Optional: Enable OAuth providers**

   **To enable Google:**
   - Click on "Google"
   - Toggle "Enable Sign in with Google"
   - Add your OAuth credentials (get from Google Cloud Console)
   - Click "Save"

   **To enable GitHub:**
   - Click on "GitHub"
   - Toggle "Enable Sign in with GitHub"
   - Add your OAuth credentials (get from GitHub Developer Settings)
   - Click "Save"

---

## Step 9: Install Dependencies

Back in your Boarded project:

```bash
npm install
```

This installs `@supabase/supabase-js` and all other dependencies.

---

## Step 10: Test Your Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open** [http://localhost:3000](http://localhost:3000)

3. **Go to** `/auth/signup` and create a test account

4. **Check Supabase Dashboard**:
   - Go to Authentication → Users
   - You should see your new user!
   - Go to Table Editor → `user_profiles`
   - Your profile should be there!

---

## ✅ You're Done!

Your Boarded app is now fully connected to Supabase!

---

## 🔧 Optional Configurations

### Email Templates

Customize auth emails in Authentication → Email Templates:
- Confirmation email
- Magic link email
- Password reset email

### URL Configuration

In Authentication → URL Configuration:
- Site URL: `http://localhost:3000` (change to your domain in production)
- Redirect URLs: Add your production domain

### Database Backups

In Settings → Database:
- Enable daily backups (on paid plans)
- Configure point-in-time recovery

---

## 🐛 Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` file
- Make sure you copied the **anon public** key, not the service key
- Restart your dev server after changing `.env.local`

### "relation does not exist" error
- Make sure you ran both SQL files (schema.sql and rls-policies.sql)
- Check the SQL Editor for any errors

### Can't upload files
- Verify storage buckets are created
- Check that storage policies are applied correctly
- Ensure bucket names match exactly: `files`, `signatures`, `avatars`

### Authentication not working
- Check that Email provider is enabled
- For OAuth, verify your client IDs and secrets are correct
- Check redirect URLs are configured

### Can't see data after login
- RLS policies might be blocking access
- Verify policies are applied correctly
- Check browser console for errors

---

## 📚 Next Steps

1. **Test all features** - Create clients, invoices, time entries
2. **Customize** - Adjust database schema for your needs
3. **Deploy** - Push to production (Vercel recommended)
4. **Monitor** - Check Supabase logs and analytics

---

## 🔗 Helpful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Community](https://github.com/supabase/supabase/discussions)

---

## 💡 Production Checklist

Before deploying to production:

- [ ] Change database password
- [ ] Enable SSL enforcement
- [ ] Set up database backups
- [ ] Configure custom SMTP for emails
- [ ] Add production domain to redirect URLs
- [ ] Enable MFA for admin accounts
- [ ] Set up monitoring and alerts
- [ ] Review and tighten RLS policies
- [ ] Enable rate limiting
- [ ] Set up database connection pooling

---

**Need help?** Check the Supabase docs or open an issue on GitHub.

**Happy building! 🚀**

