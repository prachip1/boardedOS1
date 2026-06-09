# Boarded - Setup Guide

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.local.example .env.local
   ```

   Fill in your Firebase credentials and payment gateway keys:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Payment Integration (Optional)
   NEXT_PUBLIC_RAZORPAY_KEY=your_razorpay_key
   NEXT_PUBLIC_STRIPE_KEY=your_stripe_key
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Create Firestore Database
5. Enable Storage

### 2. Firestore Database Structure

```
/clients
  /{clientId}
    - name: string
    - email: string
    - phone: string
    - company: string
    - address: string
    - website: string
    - notes: string
    - createdAt: timestamp
    - updatedAt: timestamp

/contracts
  /{contractId}
    - title: string
    - type: string
    - clientId: string
    - status: string (draft, pending, signed, rejected)
    - amount: number
    - terms: string
    - signatureUrl: string (optional)
    - createdAt: timestamp
    - signedAt: timestamp (optional)

/invoices
  /{invoiceId}
    - invoiceNumber: string
    - clientId: string
    - items: array
    - subtotal: number
    - tax: number
    - total: number
    - status: string (draft, pending, paid, overdue)
    - dueDate: timestamp
    - paidAt: timestamp (optional)
    - createdAt: timestamp

/timeEntries
  /{entryId}
    - clientId: string
    - projectId: string
    - task: string
    - duration: number (seconds)
    - billable: boolean
    - date: timestamp

/previews
  /{previewId}
    - title: string
    - clientId: string
    - url: string
    - shortCode: string
    - password: string (optional)
    - expiresAt: timestamp
    - maxViews: number (optional)
    - views: number
    - status: string (active, expired)
    - createdAt: timestamp

/files
  /{fileId}
    - name: string
    - clientId: string
    - projectId: string
    - type: string
    - size: number
    - url: string
    - sharedLink: string (optional)
    - uploadedAt: timestamp
```

### 3. Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /files/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clients/{clientId} {
      allow read, write: if request.auth != null;
    }
    match /contracts/{contractId} {
      allow read, write: if request.auth != null;
    }
    match /invoices/{invoiceId} {
      allow read, write: if request.auth != null;
    }
    match /timeEntries/{entryId} {
      allow read, write: if request.auth != null;
    }
    match /previews/{previewId} {
      allow read: true;
      allow write: if request.auth != null;
    }
    match /files/{fileId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Payment Integration

### Razorpay Setup

1. Sign up at [Razorpay](https://razorpay.com/)
2. Get your API keys from Dashboard
3. Add keys to `.env.local`

### Stripe Setup

1. Sign up at [Stripe](https://stripe.com/)
2. Get your publishable key
3. Add key to `.env.local`

## Features Implementation Status

### ✅ Completed Features

- **Dashboard Overview** - Stats, recent activity, quick actions
- **Client Management** - Full CRUD, grid/list view, detailed profiles
- **Contracts & Legal Docs** - Templates, digital signatures, PDF generation
- **Invoices & Payments** - Create, track, payment links
- **Time Tracking** - Timer, manual entry, timesheets
- **Live Preview Sharing** - Temporary links, password protection
- **Collaboration & Feedback** - Comment threads, status tracking
- **File Management** - Upload, share, organize files
- **Notifications** - Activity feed, preferences

### 🚧 To Be Implemented (Backend)

- Firebase integration
- Authentication system
- Email notifications (using SendGrid/Mailgun)
- PDF generation (jsPDF implementation)
- Payment gateway integration
- Live preview tunneling (similar to ngrok)

## Development Tips

### Adding New Pages

```javascript
// pages/example.js
import Layout from '../components/Layout'

export default function Example() {
  return (
    <Layout>
      <div className="space-y-6 fade-in">
        {/* Your content */}
      </div>
    </Layout>
  )
}
```

### Using Tailwind Classes

All components use the design system defined in `tailwind.config.js`:
- Colors: `bg-background`, `text-text-primary`, `border-border`, `text-accent`
- Buttons: `btn btn-primary`, `btn btn-secondary`, `btn btn-ghost`
- Inputs: `input`, `textarea`, `select`
- Cards: `card`, `card-elevated`
- Badges: `badge`, `badge-accent`, `badge-success`

### Adding Icons

Using `react-icons/fi` (Feather Icons):
```javascript
import { FiHome, FiUser, FiSettings } from 'react-icons/fi'

<FiHome size={20} className="text-accent" />
```

## Build for Production

```bash
npm run build
npm run start
```

## Deploy

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

- **Netlify**: Configure build settings (build: `npm run build`, publish: `.next`)
- **AWS/DigitalOcean**: Use Next.js standalone build

## Support

For issues or questions, please refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

## License

MIT License - feel free to use this for your projects!

