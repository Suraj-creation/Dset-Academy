# 01 — Project Overview

## What Is DSeT?

**DSeT** (Digital Services & Transformation) is a consulting firm that helps **MSMEs** (Micro, Small and Medium Enterprises) transform digitally. Think of them as the bridge between a small business that's still using spreadsheets and WhatsApp for everything, and a modern, digitally-efficient operation.

Their services span strategy, AI, cloud, automation, healthcare tech, agriculture tech, and more.

This website is the **digital face of that business** — and it does three things:

1. **Sells the brand** — showcases services, expertise, testimonials, and partner logos
2. **Captures leads** — uses a free Digital Maturity Assessment to get contact details from interested businesses
3. **Publishes content** — a blog for thought leadership and SEO

---

## The Core Business Flow (Most Important Thing to Understand)

If you understand this one flow, everything else makes sense:

```
Visitor lands on site
        ↓
Sees banner: "Free Digital Maturity Assessment"
        ↓
Goes to /digital-assessment
        ↓
WALL: Must enter Name, Email, Phone
(This is how DSeT captures leads — you can't proceed without this)
        ↓
60-question assessment across 7 areas
        ↓
Azure OpenAI GPT-4o analyzes answers
        ↓
Visitor gets a personalized report:
  - Score (0-100)
  - Maturity Level (Beginner → Expert)
  - Strengths, Improvement Areas, Recommendations
        ↓
"Get Personalized Consulting" button → /contact
        ↓
Sales team gets the lead via email
```

This is the **primary revenue driver** of the site. Everything else (blog, services page, about page) exists to bring people to this funnel.

---

## Tech Stack — What's Used and Why

### Core Framework: Next.js 15

Next.js is built on top of React but adds a lot of things React doesn't have out of the box:

- **File-based routing** — create a file in `pages/`, it becomes a URL. No router configuration needed.
- **API Routes** — you can write backend code (Node.js) right inside the same project, in the `pages/api/` folder. No separate Express server needed.
- **SSG (Static Site Generation)** — pages like the blog can be pre-built at compile time for speed.
- **ISR (Incremental Static Regeneration)** — pages rebuild themselves automatically every N seconds without a full redeploy.

This is why there's **no separate backend server**. The API routes in `pages/api/` are the backend.

### TypeScript

TypeScript is JavaScript with types. Instead of:
```js
function add(a, b) { return a + b; }
```
You write:
```ts
function add(a: number, b: number): number { return a + b; }
```

This catches bugs before the code even runs. The project uses strict TypeScript (`"strict": true` in `tsconfig.json`).

### Tailwind CSS v4

Instead of writing CSS files, you put utility classes directly on HTML elements:
```html
<!-- Without Tailwind -->
<div class="card">...</div>
<!-- card { background: white; padding: 24px; border-radius: 8px; } -->

<!-- With Tailwind -->
<div class="bg-white p-6 rounded-lg">...</div>
```

No separate stylesheet to maintain. Styles live with the component.

### Framer Motion

Handles all the animations — page transitions, sliding cards, floating elements, staggered list entries. Marketing sites need to feel alive. Framer Motion makes that easy in React.

### Zod

A schema validation library. Used to validate incoming API request data:

```ts
const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});
// If the request doesn't match this, it throws an error with a clear message
```

This prevents garbage data from hitting the email sender or database.

### Nodemailer

Sends emails from the server. Used for:
- Contact form → email to sales team
- Lead capture → email notification of new lead

Uses Gmail SMTP (configured via env vars).

### Azure OpenAI (GPT-4o)

The most technically interesting dependency. After a user completes the 60-question assessment, the server builds a detailed prompt and sends it to Azure OpenAI's GPT-4o API. The AI generates:
- 3-4 organizational strengths
- 3-4 improvement areas
- 6-8 specific recommendations

This makes the assessment feel like a real consultant's report, not just a score counter.

---

## Partners & Ecosystem

The Footer shows DSeT's technology partnerships (these are the logos in `public/Partner_Logos/`):

- **Microsoft** (Success Partner)
- **Google Cloud Platform**
- **NVIDIA**
- **STPI** (Software Technology Parks of India)
- **Ingram Micro** (distribution partner)
- **Redington** (distribution partner)
- **eMudhra** (digital signatures)
- **DPIIT** (Dept. for Promotion of Industry & Internal Trade)
- **InSpace** (startup ecosystem)
- **ISO Certified**
- **MSME** certified
- **Utkarsh Odisha**

These are displayed as trust signals — "we work with Microsoft and NVIDIA" builds credibility with SME clients.

---

## What This Project Is NOT

- **Not a SaaS product** — there's no user accounts for clients, no dashboard, no subscription billing
- **Not a marketplace** — clients don't transact on the site
- **Not an app** — it's a marketing website with one interactive tool (the assessment)

---

## Where to Go Next

- Ready to run it? → [02 — Getting Started](./02-getting-started.md)
- Want to understand all files? → [03 — Folder Structure](./03-folder-structure.md)
- Working on UI? → [04 — Frontend Guide](./04-frontend-guide.md)
- Working on APIs? → [05 — Backend & API Guide](./05-backend-api-guide.md)
