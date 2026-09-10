# 08 — Blog Content & Approval Workflow

This is the process document for creating, reviewing, and publishing DSeT blog content. Read this if you are a Content Creator, PMO/BA Reviewer, Leadership Reviewer, or Publisher.

---

## 1. The Workflow at a Glance

```
Creator writes post (Draft)
        │
        ▼
   Submit for PMO/BA Review
        │
   ┌────┴────┐
   ▼         ▼
Approve   Refer Back / Reject Permanently
   │         │                    │
   ▼         ▼                    ▼
Leadership   Back to Draft    Rejected (dead end,
  Review     (Creator edits    never published)
   │         and resubmits)
┌──┴──┐
▼     ▼
Approve  Refer Back / Reject Permanently
   │
   ▼
Ready to Publish
   │
   ▼
Publisher clicks "Publish Now" (or schedules a future date/time)
   │
   ▼
Published — live on the website, pushed to Buffer as a LinkedIn draft
```

A post can be sent back to **Draft** ("Refer Back") at either review stage — the Creator revises it and resubmits. A post can also be **Rejected Permanently** at either stage — this is a dead end; it will never be published, no matter how it's edited.

---

## 2. Roles

Every admin login has exactly one role. Roles are defined in `.env.local` as `ADMIN_USERS` (see `src/lib/auth.ts`):

```
ADMIN_USERS=creator1:pass123:creator,pmo1:pass123:pmo,lead1:pass123:leadership,pub1:pass123:publisher
```

Format per entry: `username:password:role`, comma-separated.

| Role | Can do |
|---|---|
| **creator** | Write/edit posts while in Draft. Submit a Draft for PMO/BA review. |
| **pmo** | Approve, Refer Back, or Reject Permanently a post sitting in "PMO/BA Review". |
| **leadership** | Approve, Refer Back, or Reject Permanently a post sitting in "Leadership Review". |
| **publisher** | Publish or schedule a post once it's "Ready to Publish". Manage author profiles (`/admin/authors`). |
| **admin** | The original `ADMIN_USERNAME`/`ADMIN_PASSWORD` login. Can do everything above, at any stage — used for testing and as a fallback. |

A role can only act on a post at the specific stage that role owns — e.g. a `pmo` login cannot approve a post that's in "Leadership Review".

---

## 3. Post Statuses

| Status | Meaning |
|---|---|
| `draft` | Being written/edited by the Creator. Not visible anywhere public. |
| `pmo_review` | Submitted, waiting on a PMO/BA to approve, refer back, or reject. |
| `leadership_review` | PMO/BA approved it; waiting on Leadership. |
| `ready_to_publish` | Leadership approved it; waiting on a Publisher to actually publish/schedule it. |
| `scheduled` | Publisher set a future publish date/time; will go live automatically at that time. |
| `published` | Live on `/blog` and `/blog/[slug]`. |
| `rejected_permanently` | Dead end — will never be published. |

---

## 4. Step-by-Step: Writing and Publishing a Post

1. **Creator** logs in, goes to `/admin/blog/new`, writes the post.
   - Optionally selects an **Author** from the dropdown (see §6) and adds **Contributors** (comma-separated names of people who supplied content/expertise, shown alongside the author).
   - Clicks **"Save Draft"** to keep working on it later, or **"Submit for PMO Review"** to send it into the approval chain immediately.
2. **PMO/BA** logs in, opens the post from `/admin/blog`, reviews it, and either:
   - **Approves** → moves to Leadership Review.
   - **Refers Back** (comment required) → post returns to Draft; Creator sees the comment on the post's "Approval Status" card and can revise + resubmit.
   - **Rejects Permanently** (comment required) → post is dead; will not be published.
3. **Leadership** does the same review at their stage.
4. **Publisher** opens a "Ready to Publish" post and clicks **"Publish Now"** (or sets a future date/time and clicks **"Schedule"**).
5. On publish, the post:
   - Goes live immediately on `/blog` and `/blog/[slug]`.
   - Is pushed to Buffer as a LinkedIn draft (see §7) — a human still has to open Buffer and click "Share Now".

A "Refer Back" or "Reject Permanently" always requires a comment — this is enforced both in the UI and by the API (`/api/blog/review`), so it can't be skipped.

---

## 5. Scheduled Posts

If a Publisher sets a publish date/time in the future, the post's status becomes `scheduled`. A cron job (`/api/api/cron/publish-scheduled`, called on a schedule by the hosting platform) checks every so often for scheduled posts whose time has passed and flips them to `published` automatically.

---

## 6. Author Profiles

Author profiles are managed separately from posts, at **`/admin/authors`** — only **Publisher** and **Admin** roles can add, edit, or deactivate an author. This keeps bios/photos consistent and stops anyone publishing under an author identity that isn't set up properly.

Each author profile has:
- Name
- Designation (e.g. "Senior Data Engineer")
- Short bio (1–2 lines)
- Photo
- LinkedIn URL (optional)
- Active/Inactive toggle (inactive authors don't show up in the dropdown for new posts, but existing posts keep showing them)

When writing a post, a Creator picks an author from this list via a dropdown (they don't type a name freely). If no author is selected, the post falls back to the plain text "DSeT Consulting" — this keeps old posts (written before this feature existed) working without any changes.

On the published post page, the author's photo, name, designation, bio, and LinkedIn link appear in a card below the article content.

---

## 7. LinkedIn / Buffer Publishing

When a post is published, two things can happen (both fire-and-forget — neither can block or break the publish itself):

1. **Direct LinkedIn auto-post** (`src/lib/linkedin.ts`) — if a LinkedIn access token has been connected via `/admin/linkedin`, the post is posted directly to the DSeT LinkedIn Company Page.
2. **Buffer draft** (`src/lib/buffer.ts`) — if `BUFFER_ACCESS_TOKEN` and `BUFFER_LINKEDIN_CHANNEL_ID` are set in the environment, the post is pushed into Buffer as a **draft** on the LinkedIn channel. It is *not* auto-shared — someone still needs to open Buffer and click "Share Now" or schedule it from there. This is deliberate: the approval chain above already covers the content decision, so Buffer is just a hand-off queue.

Both are optional — if the environment variables aren't set, publishing to the website still works normally; it just skips that step.

---

## 8. Key Files (for developers)

| Concern | File(s) |
|---|---|
| Roles & login | `src/lib/auth.ts`, `src/pages/api/admin/login.ts`, `src/pages/api/admin/me.ts` |
| Post statuses & approval logic | `src/lib/blog.server.ts` (`reviewPostServer`), `src/pages/api/blog/review.ts` |
| Post CRUD | `src/lib/blog.server.ts`, `src/pages/api/blog.ts` |
| Creator/editor UI | `src/pages/admin/blog/new.tsx`, `src/pages/admin/blog/edit.tsx` |
| Blog list/dashboard | `src/pages/admin/blog/index.tsx` |
| Author profiles | `src/lib/authors.server.ts`, `src/pages/api/authors.ts`, `src/pages/admin/authors/index.tsx` |
| Public blog page | `src/pages/blog/[slug].tsx` |
| Scheduled auto-publish | `src/pages/api/cron/publish-scheduled.ts` |
| LinkedIn direct post | `src/lib/linkedin.ts` |
| Buffer integration | `src/lib/buffer.ts` |
| Database schema | `src/lib/schema.ts`, `schema.sql`, `migrations/*.sql` |

---

## 9. AI-Generated Content Declaration

When writing or editing a post, the Creator declares whether it's AI-generated: **No** (fully human-written), **Partially** (AI-assisted), or **Yes** (primarily AI-generated). This is a **self-declaration**, not an automated check — no plagiarism/AI-detection API is integrated (see §10 for why). If not "No", a disclaimer badge appears at the top of the article on the published post.

---

## 10. Free SEO Baseline

The following are set up and require no paid tool:

- **Meta tags** — every blog post page sends a title, description, and `keywords` (built from the post's tags) via `src/components/layout/Layout.tsx`.
- **Open Graph / Twitter cards** — so shared links on LinkedIn/Twitter/Slack show a proper title, description, and image.
- **Structured data (JSON-LD)** — every post emits `BlogPosting` schema (headline, image, publish date, author — pulling from the author's profile when one is set, tags as keywords) plus a `BreadcrumbList`. This is what lets Google show rich results (author, date) in search, and costs nothing — no Profound-style subscription needed for this baseline.
- **Dynamic sitemap** (`/sitemap.xml`, `src/pages/sitemap.xml.ts`) — automatically includes every published blog post pulled live from the database, alongside the site's static marketing pages. No manual edit is needed when a new post is published; the old hand-maintained `public/sitemap.xml` (which never listed blog posts) has been replaced by this.

**Still to do (free, not yet wired up):**
- Submit the site in **Google Search Console** (search.google.com/search-console) and verify ownership, then submit `https://dsetconsulting.com/sitemap.xml` there — this is what actually gets pages crawled/indexed and gives keyword/traffic data. This is an account-setup + verification step, not code, so it needs to be done by someone with access to the domain (DNS or an HTML file upload).

## 11. Not Yet Built

These were raised as requirements but are not implemented yet:

- **Azure Entra ID / SSO login** — reviewers currently log in with `.env`-based username/password, not company SSO.
- **Automated plagiarism / AI-content percentage detection.** Investigated Copyleaks, Originality.ai, and PlagiarismCheck.org — none has a free tier usable for ongoing API integration (Copyleaks' API requires a paid plan from $13.99/mo, Originality.ai has no free tier at all, PlagiarismCheck.org is quote-only/enterprise pricing). Independent tests also put real-world accuracy at only 80–92%, not the ~99% vendors advertise. Needs a budget decision before building — the manual declaration in §9 covers the requirement for free in the meantime.
- **Named reviewer assignment** — currently any `pmo` or `leadership` login can review any post at that stage; there's no per-post "assigned to [specific person]" concept.
- **AI-visibility tracking tooling** (e.g. Profound — tracks whether content shows up in ChatGPT/Perplexity/AI Overviews answers) — starts at $99/month with no free tier. The free SEO baseline (meta tags, structured data, dynamic sitemap) is done — see §10 — but Google Search Console still needs to be set up by someone with domain access.
