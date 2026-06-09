# 🗄️ Database Recommendation for Boarded

## TL;DR: **Use Supabase** ✅

For Boarded's specific needs, **Supabase is the best choice**.

---

## 📊 Comparison Matrix

| Feature | Supabase | Firestore | MongoDB |
|---------|----------|-----------|---------|
| **Best for** | Full-stack apps | Mobile/real-time | Complex queries |
| **Learning curve** | Easy | Medium | Medium-Hard |
| **Pricing** | Free tier generous | Pay as you grow | Expensive |
| **Real-time** | ✅ Built-in | ✅ Native | ❌ Complex |
| **SQL/Relations** | ✅ PostgreSQL | ❌ NoSQL | ❌ NoSQL |
| **Auth built-in** | ✅ Yes | ✅ Yes | ❌ No |
| **Storage** | ✅ Included | ✅ Separate | ❌ GridFS |
| **Row-level security** | ✅ Native | ❌ Manual | ❌ Manual |
| **Edge functions** | ✅ Yes | ❌ Cloud Functions | ❌ External |
| **TypeScript support** | ✅ Auto-generated | ✅ Manual | ✅ Manual |
| **Open source** | ✅ Yes | ❌ No | ✅ Yes |
| **Self-hosting** | ✅ Easy | ❌ No | ✅ Complex |
| **Vendor lock-in** | ❌ Low (PostgreSQL) | ✅ High | ❌ Low |

---

## 🎯 Why Supabase for Boarded?

### 1. **Perfect for SaaS Apps**
```
Supabase = PostgreSQL + Auth + Storage + Real-time
```

You get everything you need in one package:
- ✅ User authentication (email, OAuth, magic links)
- ✅ PostgreSQL database (relational, reliable)
- ✅ File storage (for contracts, invoices PDFs)
- ✅ Real-time subscriptions (live updates)
- ✅ Row-level security (privacy per user/client)
- ✅ Edge functions (serverless backend)

### 2. **Relational Data Model**

Boarded has clear relationships:
```sql
users → clients → projects → time_entries
users → invoices → line_items
users → contracts → signatures
clients → files → shared_links
```

**PostgreSQL (Supabase)** handles this beautifully with foreign keys, joins, and transactions.

**Firestore/MongoDB** would require denormalization and complex data management.

### 3. **Row-Level Security (RLS)**

Critical for multi-tenant SaaS:

```sql
-- In Supabase:
CREATE POLICY "Users can only see their own clients"
ON clients FOR SELECT
USING (auth.uid() = user_id);

-- Private timesheet entries
CREATE POLICY "Private entries hidden from clients"
ON time_entries FOR SELECT
USING (is_private = false OR auth.uid() = user_id);
```

**With Firestore/MongoDB:** You'd have to implement this in application code (error-prone, security risk).

### 4. **Cost-Effective**

#### Supabase Pricing:
```
Free tier:
- 500 MB database
- 1 GB file storage
- 50,000 monthly active users
- 2 GB bandwidth

Pro tier ($25/month):
- 8 GB database
- 100 GB file storage
- 100,000 monthly active users
- 250 GB bandwidth
```

#### Firestore Pricing:
```
Free tier:
- 1 GB storage
- 50K reads/day
- 20K writes/day

After free tier:
- $0.06 per 100K reads
- $0.18 per 100K writes
← Costs can skyrocket quickly!
```

#### MongoDB Atlas:
```
Free tier:
- 512 MB storage
- Shared cluster

Dedicated cluster:
- Starts at $57/month
- More expensive than Supabase
```

### 5. **Developer Experience**

**Supabase:**
```javascript
// Auto-generated TypeScript types
import { supabase } from './supabase'

// Simple, clean API
const { data, error } = await supabase
  .from('clients')
  .select('*, projects(*)')
  .eq('user_id', userId)

// Real-time subscriptions
supabase
  .channel('time_entries')
  .on('INSERT', payload => updateUI(payload))
  .subscribe()
```

**Firestore:**
```javascript
// More verbose
import { collection, query, where, getDocs } from 'firebase/firestore'

const q = query(
  collection(db, 'clients'),
  where('userId', '==', userId)
)
const snapshot = await getDocs(q)
// Manual type definitions needed
```

### 6. **Complex Queries**

**Boarded needs:**
- Weekly timesheet totals by client
- Invoice line items with tax calculations
- Client revenue reports
- Time tracking analytics

**Supabase (SQL):**
```sql
SELECT 
  c.name,
  SUM(t.duration) as total_hours,
  SUM(CASE WHEN t.billable THEN t.duration ELSE 0 END) as billable_hours
FROM clients c
JOIN time_entries t ON t.client_id = c.id
WHERE t.date >= '2025-10-01'
GROUP BY c.name
ORDER BY total_hours DESC
```
✅ Easy, efficient

**Firestore/MongoDB:**
❌ Need client-side aggregation or complex queries

### 7. **No Vendor Lock-in**

**Supabase** = PostgreSQL under the hood
- Can export to any PostgreSQL host
- Can self-host if needed
- Standard SQL - portable

**Firestore** = Proprietary Google service
- Hard to migrate away
- Vendor lock-in risk

---

## ⚠️ When NOT to Use Supabase

Use **Firestore** if:
- Building mobile-first app (Flutter, React Native)
- Need Google Cloud integration
- Team already knows Firebase
- Don't need complex queries

Use **MongoDB** if:
- Extremely flexible schema needed
- Document-heavy application
- Already using MongoDB Atlas
- Need advanced full-text search

---

## 🏗️ Boarded Schema (Supabase/PostgreSQL)

### Core Tables:

```sql
-- Users (handled by Supabase Auth)
-- Automatically created, no need to define

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  website TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  client_id UUID REFERENCES clients ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time Entries
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  client_id UUID REFERENCES clients,
  project_id UUID REFERENCES projects,
  task TEXT NOT NULL,
  notes TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL, -- seconds
  billable BOOLEAN DEFAULT true,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  client_id UUID REFERENCES clients,
  invoice_number TEXT UNIQUE NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'draft',
  subtotal DECIMAL(10,2),
  tax_rate DECIMAL(5,2),
  tax_amount DECIMAL(10,2),
  total DECIMAL(10,2),
  notes TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice Line Items
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2),
  rate DECIMAL(10,2),
  amount DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contracts
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  client_id UUID REFERENCES clients,
  title TEXT NOT NULL,
  type TEXT,
  content TEXT,
  status TEXT DEFAULT 'draft',
  amount DECIMAL(10,2),
  signature_data TEXT,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Files
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  client_id UUID REFERENCES clients,
  project_id UUID REFERENCES projects,
  name TEXT NOT NULL,
  type TEXT,
  size INTEGER,
  storage_path TEXT NOT NULL,
  shared_link TEXT,
  link_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preview Links
CREATE TABLE preview_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  client_id UUID REFERENCES clients,
  title TEXT NOT NULL,
  short_code TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,
  password TEXT,
  max_views INTEGER,
  views INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row-Level Security Policies:

```sql
-- Clients: Users can only access their own
CREATE POLICY "Users manage own clients"
ON clients FOR ALL
USING (auth.uid() = user_id);

-- Time entries: Hide private from shared views
CREATE POLICY "Users see all their entries"
ON time_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Shared links show non-private entries"
ON time_entries FOR SELECT
USING (
  is_private = false 
  AND EXISTS (
    SELECT 1 FROM preview_links 
    WHERE client_id = time_entries.client_id
    AND short_code = current_setting('request.jwt.claims')::json->>'link_code'
  )
);
```

---

## 🚀 Migration Path

### Phase 1: Start with Supabase
```
1. Create Supabase project (free)
2. Set up tables and policies
3. Implement auth
4. Connect Next.js app
```

### Phase 2: As You Grow
```
1. Upgrade to Pro tier ($25/mo)
2. Enable point-in-time recovery
3. Add read replicas if needed
4. Consider self-hosting if very large
```

### Exit Strategy (if needed)
```
Supabase = PostgreSQL
→ Can migrate to:
  - AWS RDS
  - Google Cloud SQL
  - Self-hosted PostgreSQL
  - Supabase self-hosted
```

---

## 💰 Cost Projection

### Scenario: 100 paying users

**Supabase Pro: $25/month**
- Supports 100K+ users
- 8 GB database (plenty)
- 100 GB storage
- Predictable cost

**Firestore: $50-200/month**
- Variable based on reads/writes
- Can spike unexpectedly
- Need careful optimization

**MongoDB Atlas: $57-500/month**
- Dedicated cluster required
- More expensive at scale

---

## 🎯 Final Recommendation

### Use **Supabase** because:

1. ✅ **Perfect fit** - Built for SaaS apps like Boarded
2. ✅ **Cost-effective** - Generous free tier, predictable pricing
3. ✅ **Complete solution** - Auth + DB + Storage + Real-time
4. ✅ **Developer-friendly** - Great DX, auto-generated types
5. ✅ **Scalable** - Handles growth easily
6. ✅ **No lock-in** - PostgreSQL is portable
7. ✅ **Row-level security** - Critical for multi-tenant apps
8. ✅ **Open source** - Can self-host if needed

### Start today:
```bash
npm install @supabase/supabase-js
```

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Create `lib/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
```

**You're ready to build!** 🚀

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Pricing](https://supabase.com/pricing)

---

**In summary: Supabase gives you the most value with the least complexity for a SaaS like Boarded.** ✅

