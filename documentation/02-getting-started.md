# 02 — Getting Started

This guide gets you from zero to a running development server. Follow it top to bottom the first time.

---

## Prerequisites

You need these on your machine before anything else:

| Tool | Minimum Version | Check with |
|---|---|---|
| Node.js | v18+ (v16 works but 18 is recommended) | `node -v` |
| npm | v8+ (comes with Node) | `npm -v` |
| Git | Any recent version | `git --version` |

To install Node.js: go to [nodejs.org](https://nodejs.org) and download the LTS version. npm comes bundled with it.

---

## Step 1 — Clone the Repository

If you haven't already:

```bash
git clone <repository-url>
cd dset-web
```

---

## Step 2 — Install Dependencies

```bash
npm install
```

This reads `package.json` and downloads all the libraries into a `node_modules/` folder. It'll take a minute. You only need to run this once (and again whenever `package.json` changes).

---

## Step 3 — Environment Variables

Environment variables are configuration values that you keep out of the code — things like passwords, API keys, and email addresses.

Create a file called `.env.local` in the **root of the project** (same level as `package.json`):

```bash
touch .env.local
```

Then open it and add the variables you need. Here's the complete list with explanations:

```env
# ── Contact Form ──────────────────────────────────────────────────────────────
# The Gmail address that SENDS emails from the contact form
EMAIL_USER=your-gmail@gmail.com

# Gmail App Password (NOT your normal Gmail password — see note below)
EMAIL_PASS=xxxx-xxxx-xxxx-xxxx

# The email address that RECEIVES contact form submissions
CONTACT_EMAIL=sales@dset.com


# ── Lead Capture ──────────────────────────────────────────────────────────────
# Optional: save leads to a file (one JSON per line)
LEADS_FILE_PATH=/tmp/dset-leads.jsonl

# Optional: send leads to a CRM or webhook (e.g., HubSpot, Zapier)
LEADS_WEBHOOK=https://hooks.zapier.com/hooks/catch/...

# Optional: email address that receives new lead notifications
LEADS_EMAIL_RECIPIENT=sales@dset.com


# ── Azure OpenAI (Assessment AI Scoring) ──────────────────────────────────────
# Your Azure OpenAI resource endpoint
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com

# The deployment name you gave to your GPT-4o model in Azure
AZURE_OPENAI_DEPLOYMENT=gpt-4o

# Your Azure OpenAI API key
AZURE_OPENAI_KEY=your-key-here
```

**Important:** `.env.local` is listed in `.gitignore` — it will NOT be committed to git. That's intentional. Never commit secrets to git.

---

### Getting a Gmail App Password

You can't use your regular Gmail password with Nodemailer. Google requires an **App Password** for programmatic access.

Steps to get one:
1. Go to your Google Account → Security
2. Enable **2-Step Verification** (required)
3. Go to **App Passwords** (search for it in Security settings)
4. Select "Mail" and "Windows Computer" (or "Other")
5. Google gives you a 16-character password like `xxxx xxxx xxxx xxxx`
6. Remove the spaces and put it in `EMAIL_PASS`

---

### What Works Without Env Variables?

The site still runs without any env vars — some features just degrade:

| Feature | Without env vars |
|---|---|
| Homepage, About, Services, Blog | Works fully ✅ |
| Digital Assessment (questions) | Works fully ✅ |
| Assessment AI scoring | Falls back to generic recommendations ✅ |
| Contact form submission | Throws an email error ❌ |
| Lead capture | Saves to in-memory only (lost on restart) ⚠️ |
| Lead email notifications | Silent, no emails sent ⚠️ |

For day-to-day UI development, you don't need any env vars set up.

---

## Step 4 — Run the Development Server

```bash
npm run dev
```

Open your browser and go to: **http://localhost:3000**

The server watches for file changes and hot-reloads automatically. When you save a file, the browser refreshes without a full page reload.

---

## Step 5 — Explore the Site

Here's a suggested order to explore as a new developer:

1. **Homepage** (`/`) — See the full layout: PromoBanner → Navbar → Hero → sections → Footer
2. **Services** (`/services`) — The ARC framework, complex page with sections
3. **Assessment** (`/digital-assessment`) — The lead capture flow, then the 60-question assessment
4. **Admin login** (`/auth/signin`) — Username/password come from `ADMIN_USERNAME`/`ADMIN_PASSWORD` in your local `.env.local` (see `.env.example`) — ask a team member for the values, never commit them here
5. **Admin blog** (`/admin/blog`) — Create a test blog post with TinyMCE
6. **Blog** (`/blog`) — See your post appear here

---

## All Available Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript + build optimized production bundle |
| `npm run start` | Start production server (must `build` first) |
| `npm run lint` | Run ESLint to find code style/quality issues |

---

## Common Issues & Fixes

**"Cannot find module" error on `npm run dev`**
→ Run `npm install` again. A dependency is missing.

**Port 3000 already in use**
```bash
# Find what's using it
lsof -i :3000
# Kill it
kill -9 <PID>
# Or run on a different port
npm run dev -- -p 3001
```

**"Module not found: Can't resolve '@/...'"**
→ The `@` path alias maps to `src/`. So `@/components/Navbar` means `src/components/Navbar`. This is configured in `tsconfig.json`. If VS Code shows red underlines, reload the window: `Ctrl+Shift+P` → "Developer: Reload Window".

**Assessment shows generic recommendations instead of AI ones**
→ Your `AZURE_OPENAI_*` env vars are not set or incorrect. This is expected in local dev unless you have an Azure account set up.

**Contact form returns 500 error**
→ Your Gmail credentials in `.env.local` are wrong or missing. Check `EMAIL_USER` and `EMAIL_PASS`.

---

## Development Tips

**VS Code Extensions (Recommended)**
- Tailwind CSS IntelliSense — autocomplete for Tailwind classes
- TypeScript and JavaScript Language Features — type hints inline
- ESLint — highlights lint errors as you type
- Prettier — auto-format on save

**Useful keyboard shortcuts in Next.js dev**
- The browser console shows hydration warnings and React errors. Keep it open.
- `Ctrl+C` in the terminal stops the dev server cleanly.

---

## Where to Go Next

- Understand the file structure → [03 — Folder Structure](./03-folder-structure.md)
- Start building UI → [04 — Frontend Guide](./04-frontend-guide.md)
- Working with APIs → [05 — Backend & API Guide](./05-backend-api-guide.md)
- Set up a real database → [07 — Database Guide](./07-database-guide.md)
