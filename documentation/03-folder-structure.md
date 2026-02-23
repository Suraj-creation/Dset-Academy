# 03 — Folder Structure

Every file in this project has a reason to exist. This document explains what each folder and file does, and more importantly, **where to go when you need to change something**.

---

## The Big Picture

```
dset-web/
├── README.md                  ← Start here
├── documentation/             ← You are here
├── next.config.ts             ← Next.js configuration
├── package.json               ← Dependencies & scripts
├── tsconfig.json              ← TypeScript configuration
├── postcss.config.mjs         ← Tailwind CSS build config
├── public/                    ← Static files (images, logos)
└── src/                       ← All application code lives here
    ├── styles/                ← Global CSS
    ├── data/                  ← JSON data files (the "database")
    ├── lib/                   ← Utility/helper functions
    ├── context/               ← React global state (Context API)
    ├── components/            ← Reusable UI components
    └── pages/                 ← Routes, pages, and API endpoints
```

The most important folder is `src/pages/` — every file here is automatically a URL route.

---

## Root-Level Config Files

### `next.config.ts`
```ts
const nextConfig = {
  reactStrictMode: true,          // Catches bugs in dev by running effects twice
  images: {
    domains: ['images.unsplash.com'],  // Allow loading images from Unsplash
  },
};
```
**When to edit:** If you need to add a new image domain, change build settings, or add environment variable exposure to the browser.

---

### `package.json`
Lists all dependencies and defines scripts. **Never manually edit the `dependencies` section** — use `npm install <package>` or `npm uninstall <package>` instead.

---

### `tsconfig.json`
The most important part for day-to-day development:
```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```
This means anywhere in the code, `@/components/Navbar` is shorthand for `src/components/Navbar`. You'll see this import style everywhere.

---

### `postcss.config.mjs`
Just tells PostCSS to process Tailwind. You almost never touch this.

---

## `public/` — Static Assets

Files here are served directly from the root URL:
- `public/favicon.ico` → accessible at `http://localhost:3000/favicon.ico`
- `public/images/blog/` → blog post images
- `public/Partner_Logos/` → all 13 partner/certification logos shown in the footer

**When to add files here:** Any static asset — images, PDFs, icons, fonts.

---

## `src/styles/`

### `globals.css` (the only file)

This is the **entire design system** in one file. It:
1. Imports Tailwind with `@import "tailwindcss"`
2. Defines CSS custom properties (brand colors)
3. Adds custom component classes (`.btn`, `.container-custom`, `.glass-card`, etc.)
4. Defines custom animations (`animate-blob`, `animate-float`, `animate-spin-slow`, etc.)
5. Adds media queries for mobile, tablet, retina displays, landscape mobile, and reduced-motion

**When to edit:** When you need a new reusable style class, a new animation, or when adjusting mobile behavior site-wide.

---

## `src/data/`

### `assessment.json`

The complete 60-question Digital Maturity Assessment. Structure:

```json
{
  "assessmentMetadata": {
    "title": "Digital Maturity Assessment",
    "description": "...",
    "estimatedTime": "15-20 minutes",
    "version": "1.0"
  },
  "categories": [
    {
      "id": "digital_strategy",
      "name": "Digital Strategy & Vision",
      "weight": 20,
      "questions": [
        {
          "id": "q1",
          "question": "How would you describe your organization's digital strategy?",
          "options": [
            { "value": 1, "text": "We have no formal digital strategy" },
            { "value": 2, "text": "..." },
            { "value": 3, "text": "..." },
            { "value": 4, "text": "..." },
            { "value": 5, "text": "We have a comprehensive, board-approved digital strategy" }
          ]
        }
      ]
    }
  ]
}
```

**When to edit:** To add/change/remove questions or categories. Adding a category also requires updating the weights so the scoring math still works (see [05 — Backend & API Guide](./05-backend-api-guide.md) for how scoring works).

---

### `posts.json`

The blog's data store. Acts as a simple database:

```json
{
  "posts": [
    {
      "id": "1700000000000",
      "title": "Post Title",
      "subtitle": "Subtitle shown on card",
      "content": "<p>HTML content from TinyMCE</p>",
      "imageUrl": "https://images.unsplash.com/...",
      "publishedAt": "2025-01-15T00:00:00.000Z",
      "author": "DSeT Team",
      "status": "published",
      "tags": [
        { "id": "1", "name": "Digital Transformation", "color": "#5e17ea" }
      ],
      "metaDescription": "SEO description",
      "slug": "post-title"
    }
  ]
}
```

**When to edit:** You can manually add posts here in an emergency, but the normal way is to use the Admin Blog (`/admin/blog`) which writes to this file automatically.

---

## `src/lib/`

Helper functions and utilities used by both pages and API routes.

### `auth.ts`

Client-side authentication utilities:

```ts
validateCredentials(username, password)  // Returns true/false
setAuthToken()                           // sessionStorage.setItem('isAuthenticated', 'true')
clearAuthToken()                         // sessionStorage.removeItem('isAuthenticated')
isAuthenticated()                        // sessionStorage check, returns boolean
```

The actual credentials are hardcoded here:
```ts
const ADMIN_CREDENTIALS = { username: 'admin', password: 'DSeTC@2025' };
```

**When to edit:** To change admin credentials, or to replace the session storage auth with a proper JWT/cookie system.

---

### `blog.ts`

Client-side functions that call the Blog API. Used by admin pages:

```ts
getAllPosts()           // GET /api/blog
getPublishedPosts()    // GET /api/blog → filter published, sort by date
getPostBySlug(slug)    // GET /api/blog?slug=xxx
createPost(post)       // POST /api/blog
deletePost(id)         // DELETE /api/blog?id=xxx
```

**When to edit:** When adding new blog-related API operations.

---

### `blog.server.ts`

Server-side functions that read/write `posts.json` directly. Used by API routes:

```ts
getAllPostsServer()           // fs.readFile('posts.json')
getPublishedPostsServer()    // getAllPostsServer() → filter + sort
getPostBySlugServer(slug)    // find by slug field
createPostServer(post)       // push to array, fs.writeFile entire file
updatePostServer(id, data)   // find by id, merge, fs.writeFile
deletePostServer(id)         // filter out, fs.writeFile
```

**Why separate from `blog.ts`?** Node.js `fs` (filesystem) only works on the server. If `blog.server.ts` were imported in a page component, the build would fail because `fs` doesn't exist in the browser. The split prevents that.

**When to edit:** When changing how blog data is stored (e.g., migrating to a real database — see [07 — Database Guide](./07-database-guide.md)).

---

## `src/context/`

### `AuthContext.tsx`

Provides authentication state to the entire application. Wraps the app in `_app.tsx`.

Any component can use:
```tsx
const { isLoggedIn, loading, login, logout } = useAuth();
```

**How it initializes:** On mount, it reads `sessionStorage` to check if the user was previously logged in (so a browser refresh doesn't log you out).

**When to edit:** When changing the auth mechanism (e.g., adding user roles, moving to JWT).

---

## `src/components/`

Reusable UI building blocks. Organized by purpose:

```
components/
├── auth/
│   └── withAuth.tsx          ← HOC that protects admin pages
├── layout/
│   ├── Layout.tsx            ← Page wrapper (Head + Navbar + Footer)
│   ├── Navbar.tsx            ← Top navigation bar
│   ├── Footer.tsx            ← Site-wide footer
│   └── PromoBanner.tsx       ← Top promo strip ("Free Assessment")
├── ui/
│   ├── Button.tsx            ← Animated button primitive
│   └── Section.tsx           ← Section wrapper with bg/spacing options
└── home/
    ├── Hero.tsx              ← Homepage hero section
    ├── TransformationNarrative.tsx  ← "The gap" explainer section
    ├── Services.tsx          ← Service cards overview
    ├── About.tsx             ← Company overview
    ├── Testimonials.tsx      ← Client testimonials
    └── Contact.tsx           ← CTA contact section
```

### `withAuth.tsx`

A Higher-Order Component (HOC). Wraps any component and adds auth checking:

```tsx
// Usage in an admin page:
export default withAuth(AdminBlogPage);

// What it does internally:
function withAuth(WrappedComponent) {
  return function WithAuthComponent(props) {
    const { isLoggedIn, loading } = useAuth();
    if (loading) return <LoadingSpinner />;
    if (!isLoggedIn) { router.push('/auth/signin'); return null; }
    return <WrappedComponent {...props} />;
  };
}
```

### `Layout.tsx`

Every public page uses this. Props: `title`, `description`, `children`.
```tsx
<Layout title="DSeT — Services" description="Our service offerings">
  <YourPageContent />
</Layout>
```
It handles: `<head>` tags, PromoBanner, Navbar, the `<main>` wrapper, and Footer.

### `Navbar.tsx`

- Fixed to top of screen
- Monitors scroll position — changes background from transparent → dark navy on scroll
- Hamburger menu on mobile
- Links: Home, Services, About, Assessment, Case Studies, Blog, Contact + "Get Started" button

### `Button.tsx`

A smart button/link component:
```tsx
// Renders a <button> with motion effects:
<Button variant="primary" size="md" onClick={handleClick}>
  Submit
</Button>

// Renders a Next.js <Link> if href is provided:
<Button variant="secondary" href="/contact">
  Contact Us
</Button>
```

### `Section.tsx`

Controls the background color and vertical padding of any page section:
```tsx
<Section bgColor="dark" spacing="xl">
  ...your content...
</Section>

// bgColor options: 'white' | 'light' | 'dark' | 'primary' | 'gradient'
// spacing options: 'sm' | 'md' | 'lg' | 'xl'
```

---

## `src/pages/`

This is where Next.js magic happens. **Every `.tsx` file here = a URL route.**

```
pages/
├── _app.tsx               → Not a page. Wraps entire app in providers.
├── _document.tsx          → Not a page. Sets HTML shell (<html>, <body>)
├── index.tsx              → /
├── about.tsx              → /about
├── services.tsx           → /services
├── contact.tsx            → /contact
├── case-studies.tsx       → /case-studies
├── digital-assessment.tsx → /digital-assessment
├── blog/
│   ├── index.tsx          → /blog
│   └── [slug].tsx         → /blog/anything (dynamic route)
├── auth/
│   ├── signin.tsx         → /auth/signin
│   └── signup.tsx         → /auth/signup
├── admin/
│   └── blog/
│       ├── index.tsx      → /admin/blog
│       ├── new.tsx        → /admin/blog/new
│       └── edit/[id].tsx  → /admin/blog/edit/123
└── api/
    ├── hello.ts           → /api/hello (health check)
    ├── contact.ts         → /api/contact
    ├── leads.ts           → /api/leads
    ├── assessment-scoring.ts → /api/assessment-scoring
    ├── blog.ts            → /api/blog
    └── upload.ts          → /api/upload
```

**Important:** Files inside `api/` are **server-side only** — they're never sent to the browser. Everything else is a React component that renders HTML.

---

## "Where do I make this change?" — Quick Reference

| What you want to change | File to edit |
|---|---|
| Site title / meta tags | `src/components/layout/Layout.tsx` |
| Navigation links | `src/components/layout/Navbar.tsx` |
| Footer links or partners | `src/components/layout/Footer.tsx` |
| The promo banner text | `src/components/layout/PromoBanner.tsx` |
| Homepage hero text/buttons | `src/components/home/Hero.tsx` |
| Brand colors | `src/styles/globals.css` (CSS variables) |
| Assessment questions | `src/data/assessment.json` |
| Blog posts (manually) | `src/data/posts.json` |
| Admin login credentials | `src/lib/auth.ts` |
| Contact form email behavior | `src/pages/api/contact.ts` |
| Lead capture behavior | `src/pages/api/leads.ts` |
| Assessment AI scoring | `src/pages/api/assessment-scoring.ts` |
| Blog CRUD logic | `src/lib/blog.server.ts` |
| A specific page's content | `src/pages/<page-name>.tsx` |

---

## Where to Go Next

- Ready to build UI? → [04 — Frontend Guide](./04-frontend-guide.md)
- Working on an API? → [05 — Backend & API Guide](./05-backend-api-guide.md)
