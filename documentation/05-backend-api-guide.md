# 05 — Backend & API Guide

In Next.js, there's no separate backend server. API routes live inside `src/pages/api/` and run as **serverless functions** — each file is one endpoint.

> **Key concept:** Files in `pages/api/` are **server-only**. They never run in the browser. They can access the filesystem, send emails, call external APIs, query databases — anything Node.js can do.

---

## How API Routes Work

```
Browser makes a request to /api/contact
          ↓
Next.js routes it to: src/pages/api/contact.ts
          ↓
The exported default function runs on the server
          ↓
Returns a JSON response
```

Every API file exports one function:

```ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // req = incoming request (method, body, query, headers)
  // res = what you send back

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ... do the work ...
  return res.status(200).json({ success: true });
}
```

---

## All API Endpoints

### 1. `/api/hello` — Health Check

**Method:** GET
**Purpose:** Sanity check — confirms the API is running.

```bash
curl http://localhost:3000/api/hello
# Response: { "name": "John Doe" }
```

---

### 2. `/api/contact` — Contact Form

**Method:** POST only

**What it does:**
1. Validates input with Zod
2. Checks for bot submissions (honeypot)
3. Rate limits by IP (1 submission per minute per IP)
4. Sends an email via Gmail SMTP

**Request Body:**
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh@company.com",
  "phone": "9876543210",
  "company": "Kumar Enterprises",
  "service": "Digital Strategy",
  "message": "I'd like to learn more about your services."
}
```

**Validation Rules:**
| Field | Required | Rule |
|---|---|---|
| `name` | Yes | Minimum 2 characters |
| `email` | Yes | Must be a valid email format |
| `phone` | No | Optional |
| `company` | No | Optional |
| `service` | No | Optional |
| `message` | Yes | Minimum 10 characters |

**Successful Response:**
```json
{ "success": true }
```

**Error Responses:**
```json
// Validation failed
{ "error": "Validation failed", "message": "Name must be at least 2 characters" }

// Rate limited
{ "error": "Too many requests. Please try again later." }

// Email sending failed
{ "error": "Failed to send message. Please try again later." }
```

**Environment Variables Needed:**
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
CONTACT_EMAIL=where-to-send@company.com
```

**Honeypot:** The form has a hidden `_honeypot` field. Real users never fill it in. If the value is present, the API silently returns `200` without actually sending an email. Bots that fill all fields get fooled into thinking they succeeded.

**Rate limiting:** Uses a `global.lastSubmissions` Map — stores `IP → timestamp`. On each request, checks if the last submission from that IP was less than 60,000ms (1 minute) ago.

**Warning:** `global.lastSubmissions` resets on every server restart. In production (serverless), it resets constantly. For real rate limiting, use a Redis-based solution.

---

### 3. `/api/leads` — Lead Capture

**Method:** POST only

**What it does:**
1. Validates input
2. Checks honeypot
3. Rate limits (30 second cooldown per IP)
4. Generates a unique lead ID
5. Stores lead in memory (`global.leadStore`)
6. Optionally writes to a JSONL file
7. Optionally POSTs to an external webhook (CRM, Zapier, etc.)
8. Optionally sends an email notification

**Request Body:**
```json
{
  "name": "Priya Sharma",
  "email": "priya@startup.in",
  "phone": "9123456789",
  "company": "Sharma Tech",
  "source": "digital-assessment",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Validation Rules:**
| Field | Required | Rule |
|---|---|---|
| `name` | Yes | Minimum 2 characters |
| `email` | Yes | Valid email |
| `phone` | Yes | Minimum 6 characters |
| `company` | No | Optional |
| `source` | No | Defaults to `'digital-assessment'` |
| `metadata` | No | Any key-value object |
| `timestamp` | No | ISO 8601 string |

**Successful Response:**
```json
{
  "success": true,
  "id": "1736944200000-a3f7k2p"
}
```

**The Lead ID format:** `${Date.now()}-${random 7-character alphanumeric}`
Example: `1736944200000-a3f7k2p`

This is unique enough for a consulting firm's lead volume. Not universally unique (UUID) but completely fine for this use case.

**How leads are stored:**

| Storage method | How to enable | Notes |
|---|---|---|
| In-memory (`global.leadStore[]`) | Always enabled | Lost on restart — for debugging only |
| JSONL file | Set `LEADS_FILE_PATH=/tmp/leads.jsonl` | Appends one JSON per line. Survives restarts. |
| External webhook | Set `LEADS_WEBHOOK=https://...` | POSTs full lead object. Works with Zapier, HubSpot, etc. |
| Email notification | Set `EMAIL_USER` + `EMAIL_PASS` | Sends formatted email with lead details |

You can enable all four simultaneously. They're independent.

**Environment Variables:**
```env
LEADS_FILE_PATH=/path/to/leads.jsonl
LEADS_WEBHOOK=https://hooks.zapier.com/hooks/catch/...
LEADS_EMAIL_RECIPIENT=sales@dset.com
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

---

### 4. `/api/assessment-scoring` — Assessment Analysis

**Method:** POST only

**What it does:**
1. Calculates per-category scores using math
2. Calculates weighted overall score
3. Determines maturity level
4. Calls Azure OpenAI GPT-4o with a detailed prompt
5. Returns AI-generated strengths, improvements, recommendations
6. Falls back to hardcoded responses if AI fails

**Request Body:**
```json
{
  "answers": [
    { "questionId": "q1", "value": 3, "categoryId": "digital_strategy" },
    { "questionId": "q2", "value": 4, "categoryId": "digital_strategy" },
    ...
  ],
  "categories": [
    {
      "id": "digital_strategy",
      "name": "Digital Strategy & Vision",
      "weight": 20,
      "questions": [...]
    },
    ...
  ],
  "metadata": {
    "completionTime": 840000,
    "timestamp": "2025-01-15T10:45:00.000Z"
  }
}
```

**Scoring Math — How It Works:**

```
For each category:
  ┌─────────────────────────────────────────────────────┐
  │ All answers in this category are 1-5 (Likert scale) │
  │ categorySum = sum of all answer values in category  │
  │ maxPossible = number of questions × 5              │
  │ categoryScore = (categorySum / maxPossible) × 100  │
  └─────────────────────────────────────────────────────┘

For the overall score:
  ┌────────────────────────────────────────────────────────────────────┐
  │ weightedSum = Σ (categoryScore × category.weight / 100)           │
  │ totalWeight = Σ category.weight                                    │
  │ overallScore = (weightedSum / totalWeight) × 100                  │
  │                                                                    │
  │ Note: weights don't need to sum to 100 — the division normalizes  │
  └────────────────────────────────────────────────────────────────────┘
```

**Maturity Level Thresholds:**

| Score Range | Maturity Level |
|---|---|
| 0 – 19 | Beginner |
| 20 – 39 | Developing |
| 40 – 59 | Proficient |
| 60 – 79 | Advanced |
| 80 – 100 | Expert |

**AI Integration:**

The API builds a structured prompt containing every question-answer pair and sends it to Azure OpenAI:

```
System: "You are an expert digital transformation consultant..."
User: "Assessment Results:
  - Overall Score: 67.3%
  - Maturity Level: Advanced

  Category Breakdown:
  - Digital Strategy: 72.0% (Weight: 20%)
  - Technology Infrastructure: 60.0% (Weight: 25%)
  ...

  Detailed Responses:
  - How would you describe your digital strategy?: Score 4/5
  - What best describes your cloud infrastructure?: Score 3/5
  ...

  Provide: strengths (3-4), improvements (3-4), recommendations (6-8).
  Respond ONLY with valid JSON: { strengths: [], improvements: [], recommendations: [] }
"
```

**Azure OpenAI Settings:**
```ts
model: process.env.AZURE_OPENAI_DEPLOYMENT  // "gpt-4o"
max_tokens: 2000
temperature: 0.7   // Somewhat creative but consistent
top_p: 0.9
```

**Response Cleaning:** Sometimes GPT-4o wraps JSON in markdown code fences (```json ... ```) even when told not to. The code strips these:
```ts
aiAnalysisContent = aiAnalysisContent
  .replace(/```json\s*/gi, '')
  .replace(/```\s*$/gi, '')
  .trim();
```

**Fallback:** If the Azure API is down, unreachable, or returns an error, the catch block re-runs the math and returns hardcoded generic recommendations. The user always gets a result.

**Successful Response:**
```json
{
  "overallScore": 67.3,
  "categoryScores": {
    "digital_strategy": 72.0,
    "technology_infrastructure": 60.0,
    "data_analytics": 65.0,
    "digital_processes": 58.0,
    "customer_experience": 80.0,
    "workforce_skills": 55.0,
    "innovation_culture": 70.0
  },
  "maturityLevel": "Advanced",
  "strengths": [
    "Strong customer experience initiatives",
    "Clear digital strategy and leadership buy-in",
    "..."
  ],
  "improvements": [
    "Technology infrastructure needs modernization",
    "..."
  ],
  "recommendations": [
    "Migrate legacy systems to cloud infrastructure",
    "Implement a data governance framework",
    "..."
  ]
}
```

**Environment Variables:**
```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_KEY=your-key
```

---

### 5. `/api/blog` — Blog CRUD

**Methods:** GET, POST, PUT, DELETE

All operations delegate to `src/lib/blog.server.ts` which reads/writes `src/data/posts.json`.

#### GET — Fetch Posts

```bash
# Get all posts
GET /api/blog

# Get a specific post by slug
GET /api/blog?slug=my-post-title
```

Responses:
```json
// All posts: returns array
[{ "id": "...", "title": "...", "status": "published", ... }]

// Single post by slug:
{ "id": "...", "title": "...", "content": "<p>...</p>", ... }

// Post not found:
{ "error": "Post not found" }  // Status 404
```

#### POST — Create Post

```bash
POST /api/blog
Content-Type: application/json
```

```json
{
  "title": "Introduction to Digital Transformation",
  "subtitle": "A guide for MSMEs",
  "content": "<p>HTML content from TinyMCE</p>",
  "imageUrl": "https://images.unsplash.com/photo-xxx",
  "publishedAt": "2025-01-15T00:00:00.000Z",
  "author": "DSeT Team",
  "status": "published",
  "tags": [
    { "id": "1", "name": "Digital Transformation", "color": "#5e17ea" }
  ],
  "slug": "introduction-to-digital-transformation",
  "metaDescription": "A beginner's guide..."
}
```

Response:
```json
{
  "id": "1736944200000",
  "title": "Introduction to Digital Transformation",
  ...
}  // Status 201
```

The `id` is auto-generated as `Date.now().toString()`.

#### PUT — Update Post

```bash
PUT /api/blog?id=1736944200000
Content-Type: application/json
```

```json
{
  "title": "Updated Title",
  "status": "published"
}
```

You can send just the fields you want to update — the rest are preserved.

#### DELETE — Delete Post

```bash
DELETE /api/blog?id=1736944200000
```

Response:
```json
{ "success": true }
```

---

### 6. `/api/upload` — File Upload

Handles multipart form data for image uploads using Formidable. Used when creating blog posts with uploaded images rather than Unsplash URLs.

---

## Adding a New API Route

Create a file in `src/pages/api/`. Example — a new endpoint to get company stats:

```ts
// src/pages/api/stats.ts
import type { NextApiRequest, NextApiResponse } from 'next';

interface StatsResponse {
  clientsServed: number;
  projectsCompleted: number;
  yearsExperience: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatsResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // This could fetch from a database, external API, etc.
  const stats: StatsResponse = {
    clientsServed: 150,
    projectsCompleted: 200,
    yearsExperience: 8,
  };

  return res.status(200).json(stats);
}
```

This is immediately available at `GET /api/stats`. No configuration needed.

---

## Request/Response Patterns

**Always check the method first:**
```ts
if (req.method !== 'POST') {
  return res.status(405).json({ error: 'Method not allowed' });
}
```

**Always validate input with Zod:**
```ts
const schema = z.object({ name: z.string().min(2) });
try {
  const data = schema.parse(req.body);
  // data is now type-safe
} catch (err) {
  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: err.issues.map(i => i.message).join(', ') });
  }
}
```

**Reading query parameters:**
```ts
const { id, slug } = req.query;
// req.query values are always string | string[] — cast as needed
const postId = id as string;
```

**Reading environment variables:**
```ts
process.env.MY_VARIABLE  // Returns string | undefined
process.env.MY_VARIABLE || 'default'  // With fallback
```

---

## Security Notes

| Issue | Current State | What to do |
|---|---|---|
| Blog API has no auth | Any request can create/delete posts | Add auth check: verify sessionStorage or use httpOnly cookies |
| ~~Admin credentials hardcoded~~ | Resolved — read from `ADMIN_USERNAME`/`ADMIN_PASSWORD` env vars | N/A |
| Rate limiting uses in-memory Map | Resets on every server restart/cold start | Replace with Redis (`ioredis`) for production |
| No CSRF protection | Anyone can POST to the API | Add CSRF tokens for form submissions |

These are acceptable for early-stage development but should be addressed before the site gets significant traffic.

---

## Where to Go Next

- How frontend calls these APIs → [06 — Frontend ↔ Backend Connection](./06-frontend-backend-connection.md)
- Setting up a real database → [07 — Database Guide](./07-database-guide.md)
