# 04 — Frontend Guide

This document covers everything about the UI — pages, components, the design system, animations, and how to build new things consistently with the existing style.

---

## How a Page is Rendered

Before diving into individual pages, understand this flow:

```
Browser requests /about
        ↓
Next.js matches pages/about.tsx
        ↓
pages/_app.tsx wraps it in <AuthProvider>
        ↓
about.tsx renders → uses <Layout> component
        ↓
Layout renders:
  <Head> (meta tags)
  <PromoBanner>
  <Navbar>
  <main>
    → your page content
  </main>
  <Footer>
        ↓
Framer Motion animates elements as they enter the viewport
```

Every page follows this structure. If you're building a new page, start with:

```tsx
import Layout from '../components/layout/Layout';
import Section from '../components/ui/Section';

export default function MyNewPage() {
  return (
    <Layout title="Page Title" description="SEO description">
      <Section bgColor="dark" spacing="xl">
        {/* your content */}
      </Section>
    </Layout>
  );
}
```

---

## The Design System

The design system is defined in `src/styles/globals.css`. Here are the key building blocks:

### Brand Colors

```
Navy Dark (Primary):   #001f3f  ← backgrounds, headings
Electric Purple:       #5e17ea  ← primary accent, buttons, active states
Dodger Blue:           #1e90ff  ← secondary accent, links
Vibrant Orange:        #ff851b  ← highlights, CTAs, important text
Gray:                  #4d4d4d  ← body text
Light Gray:            #f8f9fa  ← light section backgrounds
```

In Tailwind you use them with bracket notation:
```html
<div class="bg-[#001f3f]">...</div>
<span class="text-[#ff851b]">...</span>
<button class="bg-[#5e17ea]">...</button>
```

Or use the CSS variables in custom styles:
```css
.my-element {
  background: var(--accent-purple);
  color: var(--accent-orange);
}
```

### Typography

The site uses **Poppins** (Google Font, loaded in `pages/index.tsx`). It's applied globally.

Default text sizes from Tailwind's responsive classes:
- `h1` → 3xl (mobile) → 4xl → 5xl → 6xl (large desktop)
- `h2` → 2xl → 3xl → 4xl
- `h3` → xl → 2xl → 3xl

The CSS makes headings bold by default. You don't need to add `font-bold` to headings.

### Gradient Patterns

Used everywhere for visual richness:

```html
<!-- Purple to Blue (primary) -->
<div class="bg-gradient-to-r from-[#5e17ea] to-[#1e90ff]">

<!-- Dark Navy background sections -->
<div class="bg-gradient-to-r from-[#001f3f] to-[#003366]">

<!-- Orange highlight -->
<div class="bg-gradient-to-r from-[#ff851b] to-[#e67300]">

<!-- Subtle section overlay -->
<div class="bg-gradient-to-br from-[#5e17ea]/10 to-[#1e90ff]/10">
```

### Glassmorphism Cards

```html
<!-- Dark glass card -->
<div class="glass-card-dark">...</div>
<!-- = bg-[#001f3f]/95 border border-[#002b57] rounded-lg shadow-md -->

<!-- Light glass card -->
<div class="glass-card">...</div>
<!-- = bg-gray-800/95 border border-gray-700 rounded-lg shadow-md -->

<!-- Professional card with hover -->
<div class="professional-card">...</div>
<!-- = bg-gray-800 rounded-lg border border-gray-700 shadow-md hover:shadow-lg -->
```

### Glow Effects

```html
<div class="shadow-glow-purple">  <!-- Purple glow -->
<div class="shadow-glow-blue">    <!-- Blue glow -->
<div class="shadow-glow-orange">  <!-- Orange glow -->
```

### Gradient Text

For that "glowing headline" effect:
```html
<!-- Purple → Blue gradient text -->
<span class="gradient-text-accent">Digital Transformation</span>

<!-- Or inline with Tailwind -->
<span class="bg-gradient-to-r from-[#5e17ea] to-[#1e90ff] bg-clip-text text-transparent">
  Your Text
</span>
```

---

## Animations with Framer Motion

This project uses [Framer Motion](https://www.framer.com/motion/) extensively. Here's how to use it correctly and consistently.

### The Standard Animation Pattern

Every animated section uses the same pattern — a "container" that staggers its "children":

```tsx
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,  // Each child animates 0.15s after the previous
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },  // Start invisible, 30px below
  visible: { opacity: 1, y: 0 },  // Animate to visible, normal position
};

// Usage:
<motion.div
  variants={containerVariants}
  initial="hidden"
  whileInView="visible"    // Triggers when element enters viewport
  viewport={{ once: true }} // Only animate once, not every time it enters view
>
  <motion.div variants={itemVariants}>Card 1</motion.div>
  <motion.div variants={itemVariants}>Card 2</motion.div>
  <motion.div variants={itemVariants}>Card 3</motion.div>
</motion.div>
```

### Button Animations

```tsx
<motion.button
  whileHover={{ scale: 1.02 }}  // Slightly grow on hover
  whileTap={{ scale: 0.98 }}    // Slightly shrink on click
>
  Click me
</motion.button>
```

### Page Entry Animation

```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  Page content
</motion.div>
```

### AnimatePresence (for conditional rendering)

Used in the assessment page when switching between questions:

```tsx
import { AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait">
  <motion.div
    key={questionId}  // Key changes = component remounts = animation replays
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -50 }}
    transition={{ duration: 0.3 }}
  >
    Question content
  </motion.div>
</AnimatePresence>
```

### CSS-Only Animations

Some animations are pure CSS (defined in `globals.css`):

```html
<!-- Blob animation (background morphing) -->
<div class="animate-blob animation-delay-2000">...</div>

<!-- Floating elements -->
<div class="animate-float">...</div>
<div class="animate-float-reverse">...</div>

<!-- Rotating rings (used in Hero) -->
<div class="animate-spin-slow">...</div>
<div class="animate-spin-reverse">...</div>

<!-- Floating particles -->
<div class="particle particle-1"></div>
```

**Mobile note:** All CSS animations are disabled on screens < 640px (`animation: none !important` in the mobile media query). This is intentional — phones shouldn't waste battery on decorative animations.

---

## Page-by-Page Breakdown

### Homepage (`pages/index.tsx`)

Pure composition — just stacks 6 components:

```tsx
<Layout>
  <Hero />
  <TransformationNarrative />
  <Services />
  <About />
  <Testimonials />
  <Contact />
</Layout>
```

To change the homepage, you edit the individual component files, not `index.tsx`.

---

### Hero (`components/home/Hero.tsx`)

The most visually complex component. It has:

**Left side:**
- Animated gradient headline
- Two CTA buttons ("Start Transformation" → assessment, "Explore Approach" → services)
- Animated benefit badges that float in ("Efficiency", "AI-Powered", "Growth")

**Right side:**
- 3D rotating rings animation (CSS: `animate-spin-slow`, `animate-spin-reverse`)
- Central logo
- Floating particles (hidden on mobile)

**Background:**
- Multiple animated blobs (`animate-blob`)
- SVG grid pattern overlay
- Gradient mesh

To edit the headline or CTAs, look for the `<h1>` and `<Link>` elements in `Hero.tsx`.

---

### Services (`pages/services.tsx`)

Introduces the **DSeT ARC™ Framework** — an iterative transformation model of six phases, grouped into three letters:

```
A: Assess → Analyze
R: Reimagine → Recreate
C: Collaborate → Capitalize
```

The page uses anchor-based navigation — clicking a service in the nav scrolls to `#digital`, `#strategy`, etc. There's a CSS hack for this in `globals.css`:

```css
#digital:target, #strategy:target, ... {
  opacity: 1 !important;
  transform: translateY(0) !important;
}
```

This is needed because Framer Motion controls opacity for entrance animations, and the CSS `:target` selector needs to override it to prevent the anchored section from appearing invisible.

---

### Digital Assessment (`pages/digital-assessment.tsx`)

The most complex page. It has **4 visual states**:

**State 1: Lead Capture Form** (`showContactForm = true`)
```
Name | Email | Phone
[Start Assessment →]
```

**State 2: Assessment Questions** (60 questions, auto-advance)
```
[Progress Bar: 23%]
[Category Badge: Digital Strategy (2/5)]
[Question text]
○ Option 1
○ Option 2
○ Option 3 ← User clicks → auto-advances in 500ms
○ Option 4
○ Option 5
```

**State 3: Loading** (`isLoading = true`)
```
[Spinning loader]
"Analyzing Your Responses..."
"Our AI is evaluating..."
```

**State 4: Results** (`isCompleted = true`)
```
Overall Score: 67 | Maturity Level: Advanced | Ready for Growth

Category Breakdown (progress bars):
  Digital Strategy ████████░░ 78%
  Technology Infra ██████░░░░ 62%
  ...

[Strengths Panel]    [Improvement Areas Panel]

Recommended Next Steps (numbered grid)

[Get Personalized Consulting →]
```

The state transitions:
```
State 1 → (lead form submit) → State 2
State 2 → (last answer selected) → State 3
State 3 → (API returns) → State 4
```

**The auto-advance logic** (this trips up newcomers):

```tsx
const handleAnswer = (value: number) => {
  const newAnswer = { questionId, value, categoryId };

  // Remove duplicate if re-answering, then add new answer
  const filteredAnswers = answers.filter(a => a.questionId !== questionId);
  setAnswers([...filteredAnswers, newAnswer]);

  // Wait 500ms so user sees their selection highlighted, then advance
  setTimeout(() => {
    if (/* more questions in category */) {
      setCurrentQuestionIndex(prev + 1);
    } else if (/* more categories */) {
      setCurrentCategoryIndex(prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      submitAssessment([...filteredAnswers, newAnswer]); // All done
    }
  }, 500);
};
```

---

### Blog (`pages/blog/index.tsx`)

Uses **Incremental Static Regeneration**:

```tsx
export async function getStaticProps() {
  const posts = await getPublishedPostsServer();
  return {
    props: { posts },
    revalidate: 60,  // Rebuild this page if a request comes in after 60 seconds
  };
}
```

What this means: The page is pre-built (super fast to load). If someone publishes a new blog post and then 60 seconds later a user visits `/blog`, Next.js rebuilds the page in the background and serves the new version to the next visitor.

---

### Admin Blog (`pages/admin/blog/`)

Three pages:

**`index.tsx`** — Lists all posts (draft + published) with Edit and Delete buttons. Protected by `withAuth`.

**`new.tsx`** — Form with TinyMCE editor for rich text. Fields: title, subtitle, content, imageUrl, author, status (draft/published), tags.

**`edit/[id].tsx`** — Same form pre-populated with existing post data. The `[id]` in the filename is the dynamic route — `/admin/blog/edit/1700000000000` loads the post with that ID.

---

## Building a New Page

Here's the template for a new page. Create a file in `src/pages/`:

```tsx
// src/pages/new-page.tsx
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';

// Define your data inline or import from a file
const items = [
  { id: 1, title: 'Item One', description: 'Description here' },
  { id: 2, title: 'Item Two', description: 'Description here' },
];

// Standard animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function NewPage() {
  return (
    <Layout
      title="New Page — DSeT"
      description="SEO description of this page"
    >
      {/* Dark hero section */}
      <Section bgColor="dark" spacing="xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-[#ff851b] mb-4">Page Heading</h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            Supporting paragraph text.
          </p>
        </motion.div>
      </Section>

      {/* Cards section */}
      <Section bgColor="light" spacing="lg">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {items.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-[#001f3f] mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* CTA section */}
      <Section bgColor="primary" spacing="lg">
        <div className="text-center">
          <Button href="/contact" variant="primary" size="lg">
            Get In Touch
          </Button>
        </div>
      </Section>
    </Layout>
  );
}
```

This page will automatically be available at `/new-page` once you save the file.

---

## Mobile Responsiveness

The project is **mobile-first**. Key patterns used throughout:

**Responsive grid:**
```html
<!-- 1 column on mobile, 2 on tablet, 3 on desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

**Responsive text:**
```html
<h1 class="text-3xl sm:text-4xl md:text-5xl">
```

**Hide on mobile:**
```html
<div class="hidden sm:block">Only visible on tablet+</div>
<div class="block sm:hidden">Only visible on mobile</div>
```

**Touch-friendly buttons** — the CSS enforces `min-height: 44px` on all buttons on mobile (Apple Human Interface Guidelines standard for tap targets).

---

## Common Patterns to Know

### Conditional className
```tsx
className={`base-classes ${condition ? 'active-class' : 'inactive-class'}`}
```

### Dynamic color based on value
```tsx
const getColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  return 'text-orange-600';
};

<span className={getColor(score)}>{score}%</span>
```

### State management in a form
```tsx
const [formData, setFormData] = useState({ name: '', email: '' });

// Update a field:
<input
  value={formData.name}
  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
/>
```

---

## Where to Go Next

- Understanding the API layer → [05 — Backend & API Guide](./05-backend-api-guide.md)
- How frontend calls the backend → [06 — Frontend ↔ Backend Connection](./06-frontend-backend-connection.md)
