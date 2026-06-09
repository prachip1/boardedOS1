# 🔗 Preview Links - Complete Guide

## 💡 How Preview Links Work

Preview Links allow you to share your work with clients through:
- **Shareable URLs** - Easy to copy and send
- **QR Codes** - Scan with phone camera
- **Temporary Access** - Auto-expire after set time
- **View Limits** - Limit number of views
- **Password Protection** - Optional security

---

## 🌐 **Important: Localhost vs Public URLs**

### ❌ **This WON'T Work:**
```
localhost:3001 ← Only accessible on YOUR computer
127.0.0.1:3000 ← Only accessible on YOUR computer
```

### ✅ **This WILL Work:**
```
https://your-app.vercel.app ← Accessible worldwide
https://abc123.ngrok.io ← Temporary public tunnel
https://custom-domain.com ← Your production domain
```

---

## 🚀 **Best Solutions:**

### **Solution 1: After Deployment** ⭐ (RECOMMENDED)

**Once you deploy to Vercel:**

1. Your app is live: `https://boarded.vercel.app`
2. Create a preview link for: `https://boarded.vercel.app/dashboard`
3. Client gets QR code
4. Scans with phone → Opens on their phone! ✅
5. Link expires after your set time

**This is the BEST and EASIEST solution!**

---

### **Solution 2: Use ngrok (Development)** 🔧

For sharing localhost during development:

**Step 1: Install ngrok**
```bash
# Download from: https://ngrok.com/download
# Or install with: choco install ngrok (Windows)
```

**Step 2: Create tunnel**
```bash
ngrok http 3001
```

You'll see:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:3001
```

**Step 3: Use the ngrok URL**
- Create preview link with: `https://abc123.ngrok.io`
- Client can access it anywhere!
- **Note:** Free ngrok links expire after 2 hours

---

### **Solution 3: Vercel Preview Deployments** 🎯

**For each feature/branch:**

1. Push to GitHub branch: `git push origin feature/new-design`
2. Vercel auto-creates: `https://boarded-abc123.vercel.app`
3. Use that URL in preview link
4. Share with client
5. Merge to main when approved!

**Professional workflow!**

---

## 📱 **How Clients Use Preview Links:**

### **Method 1: QR Code (Easiest)**
1. You send/email the QR code image
2. Client opens camera app on phone
3. Points camera at QR code
4. Notification appears: "Open in browser"
5. Taps it → Preview opens! ✨

### **Method 2: Direct Link**
1. You copy the preview link
2. Send via email/WhatsApp/Slack
3. Client clicks
4. Opens in their browser

---

## ⏱️ **Expiry Options:**

You can set:
- **1 hour** - Quick reviews
- **6 hours** - Same-day feedback
- **24 hours** - Next-day reviews
- **3 days** - Weekend reviews
- **1 week** - Major milestones
- **Never** - Permanent (until deleted)

---

## 🔒 **Security Features:**

### **Max Views:**
- Limit to 5, 10, 50 views
- Auto-expires after limit reached
- Great for controlling access

### **Password Protection:**
- Set optional password
- Client must enter to view
- Extra security layer

### **Status Tracking:**
- See how many times viewed
- When last accessed
- Active/Expired status

---

## 💼 **Real-World Use Cases:**

### **Scenario 1: Design Review**
```
You: Created new homepage design
1. Deploy to Vercel preview
2. Create preview link (expires in 24 hours)
3. Generate QR code
4. Email to client
Client: Scans QR → Views on phone → Gives feedback
```

### **Scenario 2: Quick Demo**
```
You: Built new feature
1. Use ngrok for localhost
2. Create preview link (expires in 1 hour)
3. Send link to client on Slack
Client: Clicks → Sees feature → Approves
```

### **Scenario 3: Client Presentation**
```
You: Presenting to client in meeting
1. Create preview link before meeting
2. Show QR code on screen
3. Client scans with phone
4. Interacts on their own device!
```

---

## 🎨 **QR Code Features:**

- ✅ **High quality** - 200x200px
- ✅ **Error correction** - Works even if slightly damaged
- ✅ **White border** - Easy to scan
- ✅ **Download button** - Save as PNG
- ✅ **Works with any camera app**
- ✅ **Auto-detectable** - No QR reader app needed

---

## 🚀 **Recommended Workflow:**

### **During Development:**
Use ngrok or wait for deployment

### **In Production:**
1. Deploy feature to Vercel
2. Create preview link
3. Share QR code or URL
4. Client accesses from anywhere
5. Get feedback
6. Link auto-expires ✨

---

## 💡 **Pro Tips:**

1. **Use Vercel Preview URLs** - Most professional
2. **Set appropriate expiry** - 24 hours for most cases
3. **Add password for sensitive work**
4. **Download QR and email it** - Easier for clients
5. **Check view count** - See if client accessed it

---

## 🎯 **Next Steps:**

1. ✅ Feature is ready
2. ✅ QR codes work
3. 📦 Deploy to Vercel
4. 🔗 Use production URLs
5. 📱 Share with clients!

---

**Once deployed, this feature will work PERFECTLY for sharing with clients!** 🚀📱

**The QR code feature is ready - just waiting for deployment!** ✨

