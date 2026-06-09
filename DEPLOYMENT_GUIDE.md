# 🚀 Deployment Guide - Boarded

Complete guide to deploy your Boarded application to production.

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure you have:

- ✅ Supabase project set up
- ✅ All SQL schemas run (schema.sql, rls-policies.sql, tasks-schema.sql)
- ✅ Storage buckets created
- ✅ Environment variables configured
- ✅ Tested locally
- ✅ Git repository created

---

## 🎯 Recommended: Deploy to Vercel

Vercel is the best option for Next.js apps (created by the Next.js team).

### Step 1: Prepare Your Code

```bash
# Make sure everything is committed
git add .
git commit -m "Ready for deployment"

# Push to GitHub
git push origin main
```

### Step 2: Deploy to Vercel

1. **Go to** [vercel.com](https://vercel.com)
2. **Sign in** with GitHub
3. **Click** "New Project"
4. **Import** your GitHub repository
5. **Configure:**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `next build`
   - Output Directory: `.next`

### Step 3: Add Environment Variables

In Vercel project settings, add these:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lpzpmwrvkwxhwxtgxndh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Step 4: Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Your app is live! 🎉

### Step 5: Update Supabase Settings

1. **In Supabase Dashboard** → Authentication → URL Configuration
2. **Add your Vercel URL** to "Redirect URLs":
   ```
   https://your-domain.vercel.app/**
   ```
3. **Update Site URL:**
   ```
   https://your-domain.vercel.app
   ```

---

## 🌐 Alternative: Deploy to Netlify

### Step 1: Build Settings

```bash
# Build command
npm run build

# Publish directory
.next
```

### Step 2: Environment Variables

Add the same environment variables as above in Netlify dashboard.

### Step 3: Deploy

1. **Connect GitHub** repository
2. **Configure build** settings
3. **Add environment variables**
4. **Deploy**

---

## 🔒 Production Checklist

After deploying:

### Security:

- [ ] Enable database backups in Supabase
- [ ] Set up custom SMTP for emails
- [ ] Enable 2FA for admin accounts
- [ ] Review RLS policies
- [ ] Enable SSL (automatic on Vercel/Netlify)
- [ ] Set up monitoring

### Performance:

- [ ] Enable caching
- [ ] Optimize images
- [ ] Enable compression
- [ ] Set up CDN

### Monitoring:

- [ ] Set up error tracking (Sentry)
- [ ] Enable analytics
- [ ] Monitor database usage
- [ ] Set up uptime monitoring

---

## 📊 Supabase Production Settings

### 1. Database

- **Enable Backups**: Settings → Database → Backups
- **Connection Pooling**: Use connection pooling for better performance
- **Indexes**: Already created in schema

### 2. Authentication

- **Email Confirmations**: Enable/disable as needed
- **Password Requirements**: Minimum 6 characters (already set)
- **Session Timeout**: Configure in Auth settings

### 3. Storage

- **File Size Limits**: Configure per bucket
- **CDN**: Automatic with Supabase
- **Backup**: Enable for important files

---

## 🌍 Custom Domain

### On Vercel:

1. **Go to** Project Settings → Domains
2. **Add** your custom domain
3. **Configure DNS:**
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
4. **Wait** for DNS propagation (5-60 min)

### Update Supabase:

- Add custom domain to Redirect URLs
- Update APP_URL environment variable

---

## 📧 Email Configuration

### For Production Emails:

1. **Supabase Dashboard** → Settings → Auth → SMTP Settings
2. **Add your SMTP provider:**
   - SendGrid (recommended)
   - Mailgun
   - AWS SES
   - Custom SMTP

3. **Configure email templates:**
   - Confirmation email
   - Password reset
   - Magic link

---

## 💰 Cost Estimation

### Supabase (Free Tier):
- ✅ 500 MB database
- ✅ 1 GB file storage
- ✅ 50,000 monthly active users
- ✅ 2 GB bandwidth

**Upgrade to Pro ($25/mo) when you need:**
- More storage
- Daily backups
- Point-in-time recovery
- More bandwidth

### Vercel (Free Tier):
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth
- ✅ Serverless functions
- ✅ Automatic SSL

**Perfect for starting out!**

---

## 🐛 Common Deployment Issues

### Issue: "Invalid API key" in production

**Solution:**
- Verify environment variables in Vercel/Netlify
- Make sure you didn't use the service_role key
- Redeploy after updating env vars

### Issue: Authentication redirects to localhost

**Solution:**
- Update `NEXT_PUBLIC_APP_URL` to production URL
- Add production URL to Supabase redirect URLs
- Clear browser cache

### Issue: Database connection errors

**Solution:**
- Check Supabase project is running
- Verify environment variables are correct
- Check network settings in Supabase

### Issue: Files won't upload

**Solution:**
- Verify storage buckets exist
- Check storage policies are applied
- Ensure file size limits aren't exceeded

---

## 📱 Post-Deployment Testing

Test all features in production:

1. ✅ Sign up / Login
2. ✅ Create a client
3. ✅ Create an invoice
4. ✅ Track time
5. ✅ Upload a file
6. ✅ Create a task
7. ✅ Test all navigation
8. ✅ Mobile responsiveness

---

## 🔄 Continuous Deployment

**Automatic deployments** (Vercel/Netlify):

1. Push to GitHub
2. Automatic build starts
3. Deployed in 2-3 minutes
4. Live at your domain!

No manual deployment needed! ✨

---

## 🎯 Production Optimizations

### 1. Environment Variables

Create different `.env` files for staging/production:
- `.env.local` - Development
- `.env.production` - Production (in Vercel)

### 2. Database

- Enable connection pooling
- Set up read replicas (if needed)
- Monitor query performance

### 3. Caching

- Use Next.js ISR (Incremental Static Regeneration)
- Cache static assets
- Enable browser caching

---

## 📊 Monitoring & Analytics

### Recommended Tools:

1. **Vercel Analytics** - Built-in, free
2. **Supabase Logs** - Database monitoring
3. **Sentry** - Error tracking
4. **PostHog** - Product analytics
5. **Uptime Robot** - Downtime alerts

---

## 🚀 Launch Checklist

Before announcing your launch:

- [ ] All features working in production
- [ ] Mobile responsive tested
- [ ] SEO optimized (meta tags, etc.)
- [ ] Error pages configured (404, 500)
- [ ] Privacy policy added
- [ ] Terms of service added
- [ ] Email confirmations working
- [ ] Payment integration tested (if applicable)
- [ ] Backups configured
- [ ] Monitoring set up

---

## 🎉 You're Ready to Launch!

### Quick Deploy Commands:

```bash
# 1. Ensure everything is committed
git status

# 2. Push to GitHub
git push origin main

# 3. Deploy on Vercel (will auto-deploy)
# Or manually: vercel --prod

# 4. Visit your live site!
# https://your-domain.vercel.app
```

---

## 💡 Pro Tips

1. **Use staging environment** - Test changes before production
2. **Monitor logs** - Check for errors regularly
3. **Set up alerts** - Get notified of issues
4. **Backup database** - Regular exports
5. **Update dependencies** - Keep packages up to date

---

## 📞 Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

**Ready to deploy? Follow the Vercel steps above and you'll be live in minutes!** 🚀

**Happy launching! 🎊**

