# DSeT Web — Developer Documentation

This is the official codebase for the **DSeT Consulting** website — a B2B marketing, lead generation, and content platform built with Next.js 15 + TypeScript.

---

## Quick Start

```bash
npm install
npm run dev
# open http://localhost:3000
```

That's the minimum to get the site running. No database, no API keys needed to see the site. Specific features (email, AI scoring) need env vars — see the getting started guide.

---






## Documentation Map

All detailed documentation lives in the [`documentation/`](./documentation/) folder. Here's what each file covers and when to read it:

| File | What it covers | Read this when... |
|---|---|---|
| [01 — Project Overview](./documentation/01-project-overview.md) | What DSeT is, business purpose, tech stack, how everything fits together | You're new to the project and want the big picture |
| [02 — Getting Started](./documentation/02-getting-started.md) | Installation, env variables, running locally, all scripts | You want to set up the project on your machine |
| [03 — Folder Structure](./documentation/03-folder-structure.md) | Every file and folder explained, what lives where and why | You're trying to find where something lives in the code |
| [04 — Frontend Guide](./documentation/04-frontend-guide.md) | Pages, components, design system, animations, styling | You're building or changing any UI |
| [05 — Backend & API Guide](./documentation/05-backend-api-guide.md) | All API routes, request/response formats, validation rules | You're building or testing any API endpoint |
| [06 — Frontend ↔ Backend](./documentation/06-frontend-backend-connection.md) | How the browser calls the server, data flow diagrams for every feature | You're tracing a bug or adding a new full-stack feature |
| [07 — Database Guide](./documentation/07-database-guide.md) | Current file-based storage, how to swap in PostgreSQL/MongoDB/SQLite | You're setting up persistent storage or migrating data |
| [08 — Blog Approval Workflow](./documentation/08-blog-approval-workflow.md) | Roles, post statuses, approve/refer-back/reject flow, author profiles, LinkedIn/Buffer publishing | You're writing, reviewing, or publishing a blog post, or managing author profiles |

---

## Pages at a Glance

| URL | What it is |
|---|---|
| `/` | Homepage — marketing |
| `/about` | About the company |
| `/services` | Services with the ARC framework |
| `/digital-assessment` | Digital Maturity Assessment (the main lead capture tool) |
| `/contact` | Contact form |
| `/blog` | Blog listing |
| `/blog/[slug]` | Individual blog post |
| `/case-studies` | Coming soon placeholder |
| `/auth/signin` | Admin login |
| `/admin/blog` | Blog CMS (protected) |

---

## Tech Stack (Quick Reference)

- **Framework:** Next.js 15 (React 19, TypeScript 5)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Validation:** Zod
- **Email:** Nodemailer (Gmail SMTP)
- **AI:** Azure OpenAI GPT-4o (for assessment scoring)
- **Storage:** JSON files (file-based CMS, upgradeable to any DB)

---

## Scripts

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```
