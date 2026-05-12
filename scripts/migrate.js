// One-time migration: JSON files → PostgreSQL
// Run: node scripts/migrate.js
// Requires DATABASE_URL in .env.local

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Load .env.local manually (dotenv not required)
const envFile = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const ROOT = path.join(__dirname, '..');

async function migrate() {
  const client = await pool.connect();
  let total = 0;

  try {
    // ── contacts ──────────────────────────────────────────────
    const contactsFile = path.join(ROOT, 'data', 'contacts.json');
    if (fs.existsSync(contactsFile)) {
      const contacts = JSON.parse(fs.readFileSync(contactsFile, 'utf-8'));
      let count = 0;
      for (const c of contacts) {
        await client.query(
          `INSERT INTO contacts (id, name, email, phone, company, service, message, submitted_at, read)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
           ON CONFLICT (id) DO NOTHING`,
          [c.id, c.name, c.email, c.phone ?? null, c.company ?? null,
           c.service ?? null, c.message, c.submittedAt, c.read ?? false]
        );
        count++;
      }
      console.log(`✅ contacts: ${count} rows`);
      total += count;
    } else {
      console.log('⏭  contacts.json not found — skipped');
    }

    // ── leads ─────────────────────────────────────────────────
    const leadsFile = path.join(ROOT, 'data', 'leads.json');
    if (fs.existsSync(leadsFile)) {
      const leads = JSON.parse(fs.readFileSync(leadsFile, 'utf-8'));
      let count = 0;
      for (const l of leads) {
        await client.query(
          `INSERT INTO leads (id, name, email, company, intent, score, messages, created_at, source)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
           ON CONFLICT (id) DO NOTHING`,
          [l.id, l.name ?? null, l.email ?? null, l.company ?? null,
           l.intent, l.score, l.messages ?? 0, l.createdAt, l.source ?? 'chat-widget']
        );
        count++;
      }
      console.log(`✅ leads: ${count} rows`);
      total += count;
    } else {
      console.log('⏭  leads.json not found — skipped');
    }

    // ── applications ──────────────────────────────────────────
    const appsFile = path.join(ROOT, 'data', 'applications.json');
    if (fs.existsSync(appsFile)) {
      const apps = JSON.parse(fs.readFileSync(appsFile, 'utf-8'));
      let count = 0;
      for (const a of apps) {
        await client.query(
          `INSERT INTO applications (id, job_id, job_title, name, email, phone, linkedin, portfolio, experience, notice_period, source, cover_note, resume_link, status, submitted_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
           ON CONFLICT (id) DO NOTHING`,
          [a.id, a.jobId, a.jobTitle, a.name, a.email, a.phone,
           a.linkedin ?? null, a.portfolio ?? null, a.experience,
           a.noticePeriod, a.source, a.coverNote, a.resumeLink,
           a.status ?? 'new', a.submittedAt]
        );
        count++;
      }
      console.log(`✅ applications: ${count} rows`);
      total += count;
    } else {
      console.log('⏭  applications.json not found — skipped');
    }

    // ── jobs ──────────────────────────────────────────────────
    const jobsFile = path.join(ROOT, 'data', 'jobs.json');
    const jobsSrc = fs.existsSync(jobsFile)
      ? JSON.parse(fs.readFileSync(jobsFile, 'utf-8'))
      : [
          { id: 1, title: 'AI/ML Engineer - Mining & Industrial', department: 'Engineering', location: 'Bengaluru, India', type: 'Full-time', level: 'Mid-Senior', color: '#ff851b', description: 'Build and deploy vertical AI models for OreBill AI and EdgeBay platforms with real-world OT/IT data from mining and industrial environments.', isActive: true },
          { id: 2, title: 'Full Stack Engineer (Next.js / Node)', department: 'Engineering', location: 'Bengaluru, India', type: 'Full-time', level: 'Mid-Level', color: '#1e90ff', description: 'Build platform UIs and APIs for our vertical AI products, including real-time dashboards, agentic workflows, and enterprise integrations.', isActive: true },
          { id: 3, title: 'Product Manager - Vertical AI Platforms', department: 'Product', location: 'Bengaluru, India', type: 'Full-time', level: 'Senior', color: '#5e17ea', description: "Own the roadmap for one of DSeT's vertical platforms and work across engineering, sales, and customers to shape products that solve operational problems.", isActive: true },
          { id: 4, title: 'DevOps / Platform Engineer', department: 'Infrastructure', location: 'Bengaluru / Remote', type: 'Full-time', level: 'Mid-Level', color: '#0ea5e9', description: 'Manage cloud, edge, and hybrid infrastructure for AI platform deployments across Azure, Docker, Kubernetes, and on-premise environments.', isActive: true },
          { id: 5, title: 'Enterprise Sales Executive', department: 'Sales', location: 'Bengaluru, India', type: 'Full-time', level: 'Senior', color: '#22c55e', description: 'Drive enterprise pipeline for DSeT AI platforms in mining, industrial, and healthcare sectors with a strong B2B SaaS or enterprise software sales motion.', isActive: true },
          { id: 6, title: 'Intern - AI/ML & Data Engineering', department: 'Engineering', location: 'Bengaluru, India', type: 'Internship', level: 'Fresher', color: '#a855f7', description: 'Work on real AI platform problems with full mentorship from the core team across OreBill AI, EdgeBay, and MedicsIQ pipelines.', isActive: true },
        ];
    let jobCount = 0;
    for (const j of jobsSrc) {
      await client.query(
        `INSERT INTO jobs (id, title, department, location, type, level, color, description, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO NOTHING`,
        [j.id, j.title, j.department, j.location, j.type, j.level,
         j.color ?? '#5e17ea', j.description, j.isActive ?? true]
      );
      jobCount++;
    }
    console.log(`✅ jobs: ${jobCount} rows`);
    total += jobCount;

    // ── blog posts ────────────────────────────────────────────
    const postsFile = path.join(ROOT, 'src', 'data', 'posts.json');
    if (fs.existsSync(postsFile)) {
      const { posts } = JSON.parse(fs.readFileSync(postsFile, 'utf-8'));
      let count = 0;
      for (const p of (posts || [])) {
        await client.query(
          `INSERT INTO blog_posts (id, title, subtitle, content, image_url, published_at, author, status, tags, meta_description, slug)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
           ON CONFLICT (id) DO NOTHING`,
          [p.id, p.title, p.subtitle ?? null, p.content, p.imageUrl ?? '',
           p.publishedAt ?? new Date().toISOString(), p.author ?? 'DSeT Team',
           p.status ?? 'draft', JSON.stringify(p.tags ?? []),
           p.metaDescription ?? null, p.slug]
        );
        count++;
      }
      console.log(`✅ blog_posts: ${count} rows`);
      total += count;
    } else {
      console.log('⏭  posts.json not found — skipped');
    }

    // ── events ────────────────────────────────────────────────
    const eventsFile = path.join(ROOT, 'src', 'data', 'events.json');
    if (fs.existsSync(eventsFile)) {
      const { events } = JSON.parse(fs.readFileSync(eventsFile, 'utf-8'));
      let count = 0;
      for (const e of (events || [])) {
        await client.query(
          `INSERT INTO gallery_events (id, title, date, description, status, cover_media_id, media, is_featured)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           ON CONFLICT (id) DO NOTHING`,
          [e.id, e.title, e.date, e.description ?? null, e.status ?? 'draft',
           e.coverMediaId ?? null, JSON.stringify(e.media ?? []), e.isFeatured ?? false]
        );
        count++;
      }
      console.log(`✅ gallery_events: ${count} rows`);
      total += count;
    } else {
      console.log('⏭  events.json not found — skipped');
    }

    console.log(`\n🎉 Migration complete — ${total} total rows inserted`);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
