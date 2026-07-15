# 06 — Frontend ↔ Backend Connection

This document explains exactly how the browser-side (React components, pages) talks to the server-side (API routes). If you're tracing a bug, adding a feature, or just trying to understand the data flow — this is the document to read.

---

## The Core Concept

In a traditional web app, the frontend and backend are completely separate servers. In this Next.js project, they're **in the same codebase**, but they still communicate over HTTP — just to `localhost:3000/api/*` instead of a remote server.

```
Browser (React)              Server (Next.js API Routes)
      │                              │
      │   fetch('/api/contact', ...) │
      │ ─────────────────────────►  │
      │                              │  runs contact.ts handler
      │                              │  sends email via Nodemailer
      │   { success: true }          │
      │ ◄─────────────────────────  │
      │                              │
```

The browser uses the native `fetch()` API. The server handles it in `pages/api/*.ts`.

---

## Pattern: How Every API Call is Made

All API calls in this project follow the same pattern:

```ts
// In a React component or page:
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key: 'value' }),
});

if (!response.ok) {
  const error = await response.json();
  // handle error
}

const data = await response.json();
// use data
```

---

## Feature 1: Contact Form

**Files involved:**
- Frontend: [src/pages/contact.tsx](../src/pages/contact.tsx)
- Backend: [src/pages/api/contact.ts](../src/pages/api/contact.ts)

**Full Flow:**

```
User fills form → clicks Submit
        ↓
contact.tsx: handleSubmit()
  setIsSubmitting(true)
  fetch('/api/contact', {
    method: 'POST',
    body: JSON.stringify({
      name: formData.firstName + ' ' + formData.lastName,
      email: formData.email,
      company: formData.company,
      service: formData.serviceInterest,
      message: formData.message,
    })
  })
        ↓
api/contact.ts: handler()
  Zod validates input
  Honeypot check
  Rate limit check
  nodemailer.sendMail()
  return { success: true }
        ↓
contact.tsx: response handling
  if response.ok:
    setSubmitted(true)    → shows "Thank you" message
  else:
    setError('error text') → shows error under form
  setIsSubmitting(false)
```

**What the user sees:**
1. Form with all fields
2. Submit button changes to "Sending..."
3. Success → entire form replaced with thank-you message
4. Error → error message shown below form, form stays

---

## Feature 2: Lead Capture → Assessment

**Files involved:**
- Frontend: [src/pages/digital-assessment.tsx](../src/pages/digital-assessment.tsx)
- Backend: [src/pages/api/leads.ts](../src/pages/api/leads.ts)
- Backend: [src/pages/api/assessment-scoring.ts](../src/pages/api/assessment-scoring.ts)

**Full Flow — Part A (Lead Capture):**

```
User arrives at /digital-assessment
        ↓
digital-assessment.tsx renders
  showContactForm = true  → renders the contact form
        ↓
User enters Name, Email, Phone → clicks "Start Assessment"
        ↓
Form onSubmit handler:
  setContactLoading(true)
  fetch('/api/leads', {
    method: 'POST',
    body: JSON.stringify({
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
      source: 'digital-assessment',
      timestamp: new Date().toISOString()
    })
  })
        ↓
api/leads.ts: handler()
  Validates input (Zod)
  Checks honeypot
  Checks rate limit (30s)
  Generates ID: '1736944200000-a3f7k2p'
  Stores in global.leadStore[]
  Optionally: writes to file, POSTs to webhook, sends email
  return { success: true, id: '...' }
        ↓
digital-assessment.tsx:
  setShowContactForm(false)  → assessment questions appear
  setContactLoading(false)
```

**Full Flow — Part B (Assessment):**

```
User answers all 60 questions
(auto-advances on each answer, 500ms delay)
        ↓
After last answer: submitAssessment(finalAnswers)
  setIsLoading(true)
  fetch('/api/assessment-scoring', {
    method: 'POST',
    body: JSON.stringify({
      answers: finalAnswers,          // Array of { questionId, value, categoryId }
      categories: assessmentData.categories,  // From assessment.json
      metadata: {
        completionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    })
  })
        ↓
api/assessment-scoring.ts: handler()
  Calculates per-category scores
  Calculates weighted overall score
  Determines maturityLevel
  Builds AI prompt
  Calls Azure OpenAI GPT-4o
  Parses JSON response
  (Fallback: hardcoded if AI fails)
  return AssessmentResults
        ↓
digital-assessment.tsx:
  setResults(assessmentResults)
  setIsCompleted(true)    → results page appears
  setIsLoading(false)
```

**State machine summary:**

```
showContactForm=true      → Lead form visible
        ↓ (lead submitted)
showContactForm=false     → Assessment questions visible
        ↓ (all answered)
isLoading=true            → Loading spinner visible
        ↓ (API returns)
isCompleted=true          → Results visible
```

---

## Feature 3: Blog (Public Reading)

**Files involved:**
- Frontend: [src/pages/blog/index.tsx](../src/pages/blog/index.tsx)
- Server utility: [src/lib/blog.server.ts](../src/lib/blog.server.ts)
- Data: [src/data/posts.json](../src/data/posts.json)

**Important difference:** The blog listing page does NOT use `fetch()`. It uses Next.js's **`getStaticProps`**, which runs on the server at build time (and every 60 seconds via ISR).

```
Next.js builds the page (or revalidates after 60 seconds)
        ↓
blog/index.tsx → getStaticProps()
  calls getPublishedPostsServer()  ← direct function call, no HTTP
  reads src/data/posts.json
  filters status === 'published'
  sorts by publishedAt descending
  returns { props: { posts }, revalidate: 60 }
        ↓
The page component receives posts as props
Renders static HTML
        ↓
Browser downloads the pre-rendered HTML
No API call needed — the data is already in the HTML
```

This is why the blog page loads so fast. There's no "loading" spinner — the data arrives with the page itself.

---

## Feature 4: Blog (Admin CMS)

**Files involved:**
- Frontend: [src/pages/admin/blog/](../src/pages/admin/blog/)
- Client library: [src/lib/blog.ts](../src/lib/blog.ts)
- Backend: [src/pages/api/blog.ts](../src/pages/api/blog.ts)
- Server utility: [src/lib/blog.server.ts](../src/lib/blog.server.ts)
- Data: [src/data/posts.json](../src/data/posts.json)

**Creating a Post:**

```
Admin fills TinyMCE form → clicks "Publish"
        ↓
admin/blog/new.tsx → handleSubmit()
  calls createPost(postData) from blog.ts (client library)
        ↓
blog.ts → createPost()
  fetch('/api/blog', {
    method: 'POST',
    body: JSON.stringify(postData)
  })
        ↓
api/blog.ts → handler() → case 'POST'
  calls createPostServer(req.body)
        ↓
blog.server.ts → createPostServer()
  reads posts.json
  adds { id: Date.now().toString(), ...post }
  writes entire updated array back to posts.json
  returns newPost
        ↓
Response bubbles back up:
api/blog.ts → res.status(201).json(newPost)
blog.ts → returns newPost
admin/blog/new.tsx → router.push('/admin/blog')
```

**The two-layer library pattern:**

```
Page Component (admin/blog/new.tsx)
    calls ↓
Client Library (lib/blog.ts)
    fetch() ↓
API Route (api/blog.ts)
    calls ↓
Server Library (lib/blog.server.ts)
    reads/writes ↓
JSON File (data/posts.json)
```

Why this indirection? The client library (`blog.ts`) abstracts the fetch calls so admin pages don't hardcode URLs and HTTP methods everywhere. The server library (`blog.server.ts`) isolates filesystem code so it can't accidentally end up in browser bundles.

---

## Feature 5: Admin Authentication

**Files involved:**
- Frontend: [src/pages/auth/signin.tsx](../src/pages/auth/signin.tsx)
- Context: [src/context/AuthContext.tsx](../src/context/AuthContext.tsx)
- Library: [src/lib/auth.ts](../src/lib/auth.ts)
- HOC: [src/components/auth/withAuth.tsx](../src/components/auth/withAuth.tsx)

**This feature has NO API call.** Authentication is handled entirely in the browser:

```
User opens /auth/signin
        ↓
signin.tsx renders login form
        ↓
User enters admin credentials → clicks Login
        ↓
signin.tsx → calls login(username, password) from AuthContext
        ↓
AuthContext → login()
  calls validateCredentials(username, password)
        ↓
auth.ts → validateCredentials()
  compares against ADMIN_USERNAME / ADMIN_PASSWORD env vars
  returns true if both match
        ↓
AuthContext → login()
  calls setAuthToken()
        ↓
auth.ts → setAuthToken()
  sessionStorage.setItem('isAuthenticated', 'true')
        ↓
AuthContext:
  setIsLoggedIn(true)
  returns true
        ↓
signin.tsx:
  router.push('/admin/blog')
```

**Visiting a protected page:**

```
Browser opens /admin/blog
        ↓
Next.js renders admin/blog/index.tsx
The page is wrapped: export default withAuth(AdminBlogPage)
        ↓
withAuth HOC renders:
  const { isLoggedIn, loading } = useAuth()
        ↓
AuthContext initializes:
  useEffect → isAuthenticated()
  → sessionStorage.getItem('isAuthenticated') === 'true'
        ↓
  if true:  setIsLoggedIn(true)
  if false: setIsLoggedIn(false)
        ↓
withAuth:
  if loading: show spinner
  if !isLoggedIn: router.push('/auth/signin')
  if isLoggedIn: render <AdminBlogPage />
```

**On browser refresh:**
The `useEffect` in AuthContext re-reads sessionStorage. Since sessionStorage persists through page refreshes (but not browser closes), you stay logged in until you close the tab or click logout.

---

## Data Flow Summary — Every Feature

| Feature | Frontend initiates | Goes to | Result |
|---|---|---|---|
| Contact form | `fetch('/api/contact')` | `api/contact.ts` → Nodemailer → Gmail | Email sent to sales |
| Lead capture | `fetch('/api/leads')` | `api/leads.ts` → file/webhook/email | Lead saved |
| Assessment scoring | `fetch('/api/assessment-scoring')` | `api/assessment-scoring.ts` → Azure OpenAI | Personalized report |
| Blog list (public) | `getStaticProps` (server-side) | `blog.server.ts` → `posts.json` | Pre-rendered HTML |
| Blog post creation | `createPost()` → `fetch('/api/blog')` | `api/blog.ts` → `blog.server.ts` → `posts.json` | New post saved |
| Admin login | `login()` in AuthContext | `auth.ts` → sessionStorage | Local session set |

---

## How to Add a New Full-Stack Feature

Let's say you want to add a **Newsletter Signup** — a form that saves an email address.

**Step 1 — Create the API route:**

```ts
// src/pages/api/newsletter.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import fs from 'fs/promises';

const schema = z.object({
  email: z.string().email(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email } = schema.parse(req.body);
    // Save to file (or database — see database guide)
    await fs.appendFile('/tmp/subscribers.txt', email + '\n', 'utf8');
    return res.status(200).json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'Invalid email' });
    return res.status(500).json({ error: 'Failed to save' });
  }
}
```

**Step 2 — Call it from a component:**

```tsx
// Inside any component or page:
const [email, setEmail] = useState('');
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setStatus('loading');

  const response = await fetch('/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (response.ok) {
    setStatus('success');
  } else {
    setStatus('error');
  }
};

return (
  <form onSubmit={handleSubmit}>
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="your@email.com"
    />
    <button type="submit" disabled={status === 'loading'}>
      {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
    </button>
    {status === 'success' && <p>You're subscribed!</p>}
  </form>
);
```

That's the complete pattern. API route handles server logic, component handles UI state, `fetch` connects them.

---

## Where to Go Next

- Upgrading from file storage to a real database → [07 — Database Guide](./07-database-guide.md)
