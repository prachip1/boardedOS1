# 🚀 Boarded - Quick Start Guide

## One-Command Setup

```bash
# Navigate to project
cd boarded

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Start development server
npm run dev
```

That's it! Open [http://localhost:3000](http://localhost:3000)

---

## ⚡ What You'll See

### Immediate Access To:
- ✅ Dashboard with stats and activities
- ✅ Client management (add, view, edit)
- ✅ Contract generator with templates
- ✅ Invoice creator with calculations
- ✅ Time tracker with live timer
- ✅ Preview link generator
- ✅ File manager
- ✅ Collaboration center
- ✅ Notification system

**Note**: All features work with mock data. To persist data, set up Firebase (see SETUP.md).

---

## 🎨 Design Features

### What Makes Boarded Beautiful:
- **Black & Yellow Theme** - Professional, modern aesthetic
- **Smooth Animations** - Buttery transitions everywhere
- **Responsive Design** - Perfect on all devices
- **Linear.app Inspired** - Clean, minimalist UI
- **Tailwind CSS** - Lightning-fast styling

### Interactive Elements:
- Collapsible sidebar
- Live search
- Grid/List view toggles
- Real-time timer
- Signature canvas
- Copy-to-clipboard
- Drag & drop ready

---

## 📱 Navigation Overview

### Main Sidebar:
1. **Dashboard** - Overview of everything
2. **Clients** - Manage client relationships
3. **Contracts** - Legal documents & signatures
4. **Invoices** - Billing & payments
5. **Time Tracking** - Hours & timesheets
6. **Live Previews** - Share work instantly
7. **Collaboration** - Feedback & comments
8. **Files** - Asset management
9. **Notifications** - Activity center

---

## 🎯 Try These First

### 1. Add a Client
- Click "Clients" in sidebar
- Click "Add Client" button
- Fill in the form
- See it in the list!

### 2. Create an Invoice
- Click "Invoices"
- Click "New Invoice"
- Add line items
- Watch totals calculate automatically

### 3. Start Time Tracking
- Click "Time Tracking"
- Select a project
- Enter task name
- Click "Start"
- Watch the timer run!

### 4. Generate Preview Link
- Click "Live Previews"
- Click "New Preview Link"
- Enter local URL
- Set expiry options
- Generate shareable link!

### 5. Create a Contract
- Click "Contracts"
- Click "New Contract"
- Choose template
- Fill details
- Generate contract!

---

## 🛠️ Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

---

## 🎨 Customization Quick Tips

### Change Colors:
Edit `tailwind.config.js`:
```js
colors: {
  accent: {
    DEFAULT: '#your-color', // Change yellow accent
  }
}
```

### Add New Page:
```js
// pages/example.js
import Layout from '../components/Layout'

export default function Example() {
  return (
    <Layout>
      <div className="space-y-6 fade-in">
        <h1 className="text-2xl font-semibold text-text-primary">
          Your Page
        </h1>
      </div>
    </Layout>
  )
}
```

### Add Sidebar Link:
Edit `components/Navigation/Sidebar.js`:
```js
const navigationItems = [
  // ... existing items
  { name: 'New Page', href: '/example', icon: FiStar },
]
```

---

## 🔥 Hot Features to Explore

### Live Timer
- Go to Time Tracking
- Timer updates every second
- Start/Pause/Stop functionality
- Automatically saves entries

### Signature Canvas
- Go to Contracts
- Create a contract
- View contract detail
- Sign with mouse/touch!

### Copy Links
- Generate preview link
- Click copy button
- Instant clipboard copy
- Visual feedback!

### Responsive Sidebar
- Click hamburger icon
- Sidebar collapses
- Icons-only view
- Smooth animation

---

## 📊 Sample Data

All pages have realistic mock data:
- 4 sample clients
- 5 invoices
- 3 contracts
- Time entries
- Preview links
- Notifications

This lets you explore features immediately!

---

## 🐛 Common Issues

### Port 3000 in use?
```bash
npm run dev -- -p 3001
```

### Styles not loading?
```bash
# Delete .next folder
rm -rf .next
npm run dev
```

### Dependencies error?
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

---

## 💡 Pro Tips

1. **Use Keyboard**: Cmd/Ctrl + K for search (UI ready)
2. **Bookmark Pages**: Add frequently used pages to browser
3. **Customize Mock Data**: Edit data directly in page files
4. **Test Responsive**: Open DevTools, toggle device mode
5. **Check Console**: Look for TODOs and feature notes

---

## 🎓 Learn the Codebase

### Start Here:
1. `pages/index.js` - Main dashboard
2. `components/Layout.js` - App structure
3. `styles/globals.css` - Design system
4. `tailwind.config.js` - Theme config

### Component Pattern:
```
Page Component
  ↓
Layout Wrapper
  ↓
Sidebar + Header + Content
  ↓
Child Components
```

---

## 🚀 Ready for Production?

### Before Deploying:
1. ✅ Set up Firebase (SETUP.md)
2. ✅ Add authentication
3. ✅ Connect database
4. ✅ Enable file uploads
5. ✅ Test all features
6. ✅ Add error handling
7. ✅ Optimize images
8. ✅ Set up analytics

### Deploy To:
- **Vercel** (Recommended) - One-click deploy
- **Netlify** - Easy setup
- **AWS/DigitalOcean** - Full control

---

## 📞 Need Help?

- **Setup Issues**: See SETUP.md
- **Feature Questions**: See FEATURES.md
- **Technical Details**: See PROJECT_SUMMARY.md
- **Next.js Help**: [Next.js Docs](https://nextjs.org/docs)
- **Tailwind Help**: [Tailwind Docs](https://tailwindcss.com/docs)

---

## 🎉 Enjoy Building!

You now have a fully functional client management platform. All the UI is ready, all the features are built, and all you need is to connect the backend!

**Time to create something amazing! 🚀**

---

**Quick Links:**
- [View Dashboard](http://localhost:3000)
- [Clients](http://localhost:3000/clients)
- [Invoices](http://localhost:3000/invoices)
- [Time Tracking](http://localhost:3000/time-tracking)

---

Made with ❤️ for freelancers and indie makers

