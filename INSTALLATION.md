# 📦 Boarded Installation Guide

Complete installation and setup instructions for Boarded.

---

## 🎯 Quick Start (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/boarded.git
cd boarded

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📋 Prerequisites

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Supabase account** (free at [supabase.com](https://supabase.com))
- **Git** for version control

---

## 🚀 Detailed Installation

### Step 1: Get the Code

**Option A: Clone from GitHub**
```bash
git clone https://github.com/yourusername/boarded.git
cd boarded
```

**Option B: Download ZIP**
- Download from GitHub
- Extract to your preferred location
- Open terminal in the folder

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- `@supabase/supabase-js` - Database & Auth
- `next` - React framework
- `tailwindcss` - Styling
- `date-fns` - Date utilities
- `react-icons` - Icon library
- `jspdf` - PDF generation
- `react-signature-canvas` - Digital signatures
- And more...

**Installation time:** ~2-3 minutes

### Step 3: Set Up Supabase

**Follow the comprehensive guide:** [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

**Quick summary:**
1. Create Supabase project
2. Get API credentials
3. Run database schema
4. Apply RLS policies
5. Create storage buckets

### Step 4: Configure Environment Variables

1. **Copy the example file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local`:**
   ```env
   # Required - Get from Supabase Dashboard
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   # Required - Your app URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Optional - Payment providers (add later)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
   RAZORPAY_KEY_ID=
   
   # Optional - Email services (add later)
   SENDGRID_API_KEY=
   MAILGUN_API_KEY=
   ```

3. **Save the file**

### Step 5: Run the Development Server

```bash
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

**Open** [http://localhost:3000](http://localhost:3000) in your browser!

---

## 🎨 First Time Setup

### 1. Create Your Account

- Go to [http://localhost:3000](http://localhost:3000)
- Click "Get Started" or go directly to `/auth/signup`
- Fill in your details:
  - Full Name
  - Email
  - Password (min 6 characters)
- Click "Create Account"

You'll be automatically signed in and redirected to the dashboard!

### 2. Verify Everything Works

**Check Authentication:**
- ✅ You should be logged in
- ✅ See your name in the header
- ✅ Dashboard loads without errors

**Test Database Connection:**
1. Go to "Clients" → "Add Client"
2. Fill in client details
3. Click "Save"
4. Client appears in the list ✅

**Check Supabase Dashboard:**
1. Go to your Supabase project
2. Table Editor → `clients`
3. You should see your new client!

### 3. Explore Features

- **Dashboard** - Overview of stats and activities
- **Clients** - Add and manage clients
- **Contracts** - Create agreements
- **Invoices** - Generate invoices
- **Time Tracking** - Track your hours
- **Timesheets** - Review time entries
- **Preview Links** - Share work
- **Files** - Upload documents
- **Collaboration** - Feedback threads
- **Notifications** - Activity feed

---

## 🏗️ Project Structure

```
boarded/
├── components/          # React components
│   ├── Layout.js       # Main layout wrapper
│   ├── ProtectedRoute.js
│   ├── Navigation/     # Sidebar, Header
│   ├── Dashboard/      # Dashboard widgets
│   └── Clients/        # Client components
├── contexts/           # React contexts
│   └── AuthContext.js  # Authentication state
├── hooks/              # Custom React hooks
│   └── useRequireAuth.js
├── lib/                # Utility libraries
│   ├── supabase.js     # Supabase client
│   └── api/            # API functions
│       ├── clients.js
│       ├── contracts.js
│       ├── invoices.js
│       ├── time-tracking.js
│       └── ...
├── pages/              # Next.js pages (routes)
│   ├── _app.js         # App wrapper
│   ├── index.js        # Landing page
│   ├── dashboard.js    # Main dashboard
│   ├── auth/           # Auth pages
│   ├── clients/        # Client pages
│   └── ...
├── public/             # Static files
├── styles/             # CSS files
│   └── globals.css
├── supabase/           # Database files
│   ├── schema.sql      # Database schema
│   └── rls-policies.sql # Security policies
├── .env.local.example  # Environment template
├── package.json        # Dependencies
├── tailwind.config.js  # Tailwind config
└── next.config.js      # Next.js config
```

---

## 🧪 Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint

# Package Management
npm install          # Install dependencies
npm update           # Update dependencies
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/boarded.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables from `.env.local`
   - Click "Deploy"

3. **Update Supabase URLs**
   - In Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel domain to "Redirect URLs"
   - Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables

### Deploy to Netlify

1. **Build command:** `npm run build`
2. **Publish directory:** `.next`
3. **Add environment variables** from `.env.local`

### Deploy to Custom Server

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm run start
   ```

3. **Use a process manager** like PM2:
   ```bash
   npm install -g pm2
   pm2 start npm --name "boarded" -- start
   ```

---

## 🔧 Configuration

### Customizing Colors

Edit `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      accent: {
        DEFAULT: '#your-color',
      },
      // Add more custom colors
    }
  }
}
```

### Adding OAuth Providers

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) Step 8 for:
- Google OAuth
- GitHub OAuth
- Other providers

### Email Configuration

For production, configure custom SMTP in Supabase:
- Dashboard → Settings → Auth
- SMTP Settings
- Add your email provider credentials

---

## 🐛 Troubleshooting

### Port 3000 already in use

```bash
# Use a different port
npm run dev -- -p 3001
```

### Dependencies won't install

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database connection errors

- Check `.env.local` credentials
- Verify Supabase project is running
- Check internet connection
- Review Supabase logs

### Authentication not working

- Verify email provider is enabled in Supabase
- Check redirect URLs configuration
- Clear browser cache and cookies
- Check browser console for errors

### Can't see data after login

- Verify RLS policies are applied
- Check that schema.sql ran successfully
- Review Supabase logs for errors

---

## 📚 Documentation

- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Complete Supabase setup
- **[FEATURES.md](./FEATURES.md)** - Feature documentation
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Project overview
- **[DATABASE_RECOMMENDATION.md](./DATABASE_RECOMMENDATION.md)** - Why Supabase

---

## 🆘 Getting Help

- **Issues:** Open an issue on GitHub
- **Discussions:** Check GitHub Discussions
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)

---

## ✅ Post-Installation Checklist

- [ ] Dependencies installed
- [ ] Supabase project created
- [ ] Database schema applied
- [ ] RLS policies applied
- [ ] Storage buckets created
- [ ] Environment variables configured
- [ ] Development server running
- [ ] Test account created
- [ ] Sample client created
- [ ] All features tested

---

## 🎉 You're Ready!

Your Boarded installation is complete. Start managing your clients, tracking time, and growing your business!

**Next steps:**
1. Customize branding and colors
2. Add your first real client
3. Explore all features
4. Deploy to production

**Happy building! 🚀**

