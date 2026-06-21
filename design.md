# AI Job Seeker — UI/UX Design Brief (`design.md`)

A complete design system + screen specs for generating the AI Job Seeker interface with an AI design tool (Figma Make / First Draft, v0, Lovable, Bolt, or similar).

## How to use this file

You can use it two ways:

1. **All at once** — paste the [Master Prompt](#master-prompt) at the bottom to generate a full design pass.
2. **Screen by screen (recommended)** — most tools produce better results one screen at a time. Each screen below has a self-contained, paste-ready prompt that already includes the design tokens, so you don't have to re-explain the system every time.

Keep the [Design Tokens](#design-tokens) section open as the source of truth. If a generated screen drifts off-palette or off-type, paste the tokens block again and ask it to conform.

---

## Product in one line

A confidence engine for fresh graduates: it turns the overwhelming job hunt into a clear, encouraging path by showing each person *which jobs fit them, why, and what's one step away*.

**Audience:** recent graduates (freshers), mostly on mobile, often anxious and inexperienced at job hunting. The interface should make them feel *capable and matched*, never judged.

**Emotional target:** calm, optimistic, momentum. "You're closer than you think."

---

## Design principles

1. **The score is the story.** The match score is the product's reason to exist. It is the one thing we make beautiful and memorable; everything else stays quiet so it can shine.
2. **Encourage, don't grade.** Copy and color frame gaps as *next steps*, not failures. A 60% match says "what to add," never "you fell short."
3. **One screen, one job.** Each screen has a single primary action. Reduce choices for an anxious first-time user.
4. **Premium through restraint.** Generous whitespace, a tight palette, real type hierarchy. We earn "premium" by what we leave out, not by what we add.
5. **Mobile is the real product.** Design every screen mobile-first; desktop is the widescreen version of the same layout.

---

## Brand & aesthetic direction

**The idea:** *AI intelligence meets human hope.* A duotone of deep **indigo** (the intelligent, analytical AI) and a warm **coral** (the human, aspirational seeker). This pairing is deliberately not the default single-accent SaaS look — the warmth is what makes it feel made for nervous freshers rather than for enterprise buyers.

**The signature element:** the **Match Ring** — an animated radial progress ring with the score set in a monospace face that counts up on load, paired with a single plain-language reason ("Strong fit — your React and Node skills match 7 of 9 requirements"). This appears on the dashboard spotlight and on every job. It is the only place we spend visual boldness.

**Overall feel:** modern, clean, confident SaaS — closer to Linear / Vercel / Stripe than to a job-board portal. Soft depth, not heavy shadows. Rounded but not bubbly.

---

## Design tokens

> Paste this block into any tool that drifts off-system.

### Color

| Token | Hex | Use |
|---|---|---|
| `ink` | `#0E1525` | Primary text, dark surfaces, footer |
| `ink-soft` | `#1C2740` | Secondary dark surfaces, sidebar |
| `indigo` | `#4F46E5` | Primary brand, primary buttons, links, active states |
| `indigo-tint` | `#EEF0FF` | Indigo backgrounds, selected chips, soft fills |
| `coral` | `#FF7A66` | Warm accent — human/aspirational moments, secondary highlights, illustrations |
| `coral-tint` | `#FFF0EC` | Coral soft fills, warm empty-state backgrounds |
| `emerald` | `#12B886` | Success, high match (75%+), "applied" confirmations |
| `amber` | `#F5A524` | Medium match (50–74%), warnings, "in review" |
| `rose` | `#F43F5E` | Errors, low match (<50%), destructive actions |
| `canvas` | `#F7F8FB` | App background |
| `surface` | `#FFFFFF` | Cards, inputs, sheets |
| `border` | `#E6E9F0` | Hairlines, dividers, input borders |
| `text-muted` | `#64748B` | Secondary text, captions, placeholders |

Match-score color logic: **75–100 → emerald, 50–74 → amber, 0–49 → rose.** Never use red as alarming; pair low scores with an encouraging next step.

### Typography

- **Display** (headings, the score, hero): **Clash Display** or **General Sans** (Fontshare, free). Fallback: Inter. Use it with restraint — big, confident, tight letter-spacing on large sizes.
- **Body / UI:** **Inter**. Comfortable, neutral, highly legible.
- **Data / numbers / score:** **Geist Mono** or **JetBrains Mono**. Gives match scores and stats a precise, "measured" feel.

Type scale (mobile → desktop): Display XL 40/56 · Display L 32/40 · H1 28/32 · H2 22/24 · H3 18/20 · Body 16 · Small 14 · Caption 12. Headings bold (600–700), body regular (400), labels medium (500). Sentence case everywhere — no ALL-CAPS shouting except tiny eyebrow labels with letter-spacing.

### Spacing, radius, depth

- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px. Be generous; let things breathe.
- **Radius:** inputs & buttons `12px`, cards `16px`, sheets/modals `24px`, pills/chips `999px`. The Match Ring is a perfect circle.
- **Shadows:** soft and low. Card rest: `0 1px 2px rgba(14,21,37,.04), 0 8px 24px rgba(14,21,37,.06)`. Hover: lift slightly + raise shadow. No harsh dark drop-shadows.
- **Borders:** 1px `border` hairlines. Prefer subtle borders over heavy shadows for separation.

### Iconography & imagery

- Line icons, 1.5–2px stroke, rounded caps (Lucide / Phosphor style). Indigo or ink, never multicolor.
- Illustrations (for empty states, onboarding) in the indigo+coral duotone, friendly and simple — soft geometric shapes, not corporate clip-art.
- Company logos shown as rounded-square avatars with a fallback monogram on `indigo-tint`.

---

## Core components

- **Buttons:** Primary = solid `indigo`, white text, `12px` radius, medium weight, subtle hover-darken. Secondary = `surface` with `border`, ink text. Tertiary = text-only indigo. Destructive = `rose`. Min height 44px for touch. Active labels say what happens ("Apply now", "Save job", not "Submit").
- **Match Ring:** circular SVG progress ring, 4–6px stroke, color by score logic, score number centered in mono, animates from 0 to value over ~900ms on mount. Sizes: large (spotlight, 120px), medium (job card, 56px), small (list row, 40px).
- **Job card:** surface card, company avatar + title + company, location/work-mode/type chips, a medium Match Ring top-right, a one-line match reason, and a primary "Apply" + secondary "Save". Hover lifts.
- **Chips / tags:** pill shape, `indigo-tint` background with indigo text for skills; neutral `canvas` with muted text for metadata.
- **Inputs:** surface fill, 1px border, 12px radius, label above, helper/error text below, clear focus ring in indigo. Error state uses `rose` border + plain-language message.
- **Score gauge** (resume analyzer): larger half- or full-circle gauge, same color logic, with a grade word ("Strong", "Getting there", "Needs work").
- **Stat tile:** small surface card with a mono number and a muted label (e.g., "12 · Applications").
- **Skeleton loaders:** shimmer placeholders matching final layout — use these, never spinners, for AI-powered loads.
- **Toast:** bottom (mobile) / bottom-right (desktop), emerald for success, rose for error, auto-dismiss.

---

## Screens

Each screen below is paste-ready. Prepend the [Design Tokens](#design-tokens) block when a tool needs reminding of the system.

### 1. Landing page

**Prompt:**
> Design a marketing landing page for "AI Job Seeker," an AI tool that helps fresh graduates find jobs that match them. Style: modern premium SaaS (Linear/Stripe feel), indigo `#4F46E5` + warm coral `#FF7A66` duotone on a near-white `#F7F8FB` canvas, Clash Display headings + Inter body, generous whitespace, soft low shadows, 16px card radius.
> Hero: a confident headline "Find the jobs that actually fit you", a subline "Upload your resume. We'll show you where you match — and what's one step away.", a primary "Get started free" button and a secondary "See how it works". To the right (or below on mobile), a product preview showing a job card with an animated circular match ring reading "92" in emerald and the reason "Strong fit — 7 of 9 skills match".
> Below: a three-step "how it works" row (Build your profile · Get matched · Apply in one click), a section showing the match-ring feature up close, a section on the AI resume score, and a simple footer. Keep it airy, one accent moment per section, mobile-first.

### 2. Sign up / log in (OTP)

**Prompt:**
> Design auth screens for AI Job Seeker using the indigo+coral system. A centered card on the `#F7F8FB` canvas. Sign-up: name, phone or email, password, and a role toggle (Job Seeker / Recruiter) as two selectable cards. Then an OTP verification screen with 4–6 single-digit boxes and a "Resend code" link. Log-in: phone/email + password with "Forgot password". Friendly, low-anxiety copy. Left side (desktop only): a duotone illustration and a one-line reassurance "Your information stays private." Primary buttons solid indigo, 44px tall, 12px radius.

### 3. Onboarding — build profile & upload resume

**Prompt:**
> Design a guided onboarding flow for a fresher. Step 1: a friendly "Let's build your profile" screen with a big drag-and-drop resume upload zone (PDF or .tex), and a "Skip — I'll fill it manually" link. Step 2: while parsing, show a skeleton/loading state with reassuring copy "Reading your resume…". Step 3: a review form pre-filled from parsing — sections for Education, Skills (as removable indigo-tint chips with an add field), Projects, Experience, and Preferences (role, location, work mode). A persistent "Profile completeness" progress bar at the top that fills as fields are added. Encouraging, never judgmental. Indigo+coral system, generous spacing, mobile-first.

### 4. Dashboard — recommended jobs (the star screen)

**Prompt:**
> Design the main dashboard for AI Job Seeker — the hero screen. Layout: left sidebar nav on desktop (Dashboard, Jobs, Applications, Resume, Profile), bottom tab bar on mobile. Background `#F7F8FB`.
> Top: a warm greeting "Good to see you, Priya" and a row of stat tiles (mono numbers): Match-ready jobs, Applications sent, Response rate.
> Hero block: a "Top match for you" spotlight card — large (120px) animated circular match ring reading e.g. "94" in emerald that counts up on load, the job title, company with logo avatar, a one-line AI reason "Strong fit — your React, Node, and MongoDB skills match this role", and a prominent "Apply now" + "View details".
> Below: a "Recommended for you" grid of job cards, each with a medium match ring (color by score: emerald 75+, amber 50–74, rose <50), title, company, location/work-mode chips, a one-line reason, and Apply/Save buttons. Use skeleton loaders while matches compute. Premium, airy, the match rings are the visual signature — keep everything else quiet.

### 5. Job detail + match breakdown

**Prompt:**
> Design a job detail screen for AI Job Seeker. Header: company avatar, job title, company, location, work mode, posted date, and a large Match Ring with the score. A prominent sticky "Apply now" button (and "Save"). 
> Signature section "Why you match": a breakdown list of requirements, each marked as met (emerald check) or a gap (amber dot), e.g. "React ✓ · Node.js ✓ · AWS — not yet on your profile". Below it an encouraging line: "You match 7 of 9 — add 2 skills to reach 100%."
> Then the full job description and requirements in clean readable type. For external jobs, replace "Apply now" with "Apply on company site" (opens new tab) and a small note. Indigo+coral system, lots of whitespace, mobile-first with the apply button pinned to the bottom on mobile.

### 6. Resume analyzer / ATS score

**Prompt:**
> Design an AI resume analyzer screen. Top: a large score gauge (semicircle or full ring) showing an ATS score 0–100 with color logic (emerald/amber/rose) and a grade word ("Strong", "Getting there", "Needs work") — encouraging tone. 
> Below: a prioritized list of improvement suggestions as cards, each with an icon, a plain-language title ("Add measurable results to your projects"), a one-line why, and a difficulty/impact tag. An optional "Check against a job" selector that re-scores and shows missing keywords as coral chips. A footer action "Generate an improved LaTeX resume" and "Open in Overleaf". Indigo+coral system, supportive copy, never harsh.

### 7. Skill-gap & learning path

**Prompt:**
> Design a skill-gap screen for a chosen target job. Show current match vs. potential: "You're at 78% — reach 95% by adding 2 skills." List each missing skill as a card with a short learning suggestion (a topic or resource) and the projected match-score lift if learned (e.g. "+9%"). Use coral for the "to learn" accent and emerald for skills already matched. Motivating, forward-looking copy. Indigo+coral system.

### 8. Application tracker

**Prompt:**
> Design an application tracking dashboard. A filterable list/board of applications grouped by status: Applied, Under review, Shortlisted, Rejected — each status with a distinct calm color (indigo / amber / emerald / muted rose). Each row: company avatar, role, date applied, match score (small ring), and current status as a pill. Top summary tiles: total applications, response rate, interviews. A status timeline appears when a row is expanded. Clean, scannable, mobile-first. Empty state: a friendly duotone illustration + "No applications yet — your matches are waiting" with a button to the dashboard.

### 9. Recruiter portal (secondary)

**Prompt:**
> Design a recruiter portal in the same indigo+coral system. A "Post a job" form (title, description, requirements as chips, location, work mode) and a "My postings" list. Each posting opens an applicants view: a clean table/list of applicants with name, match score (small ring), resume link, and a status dropdown (Applied → Under review → Shortlisted → Rejected). Keep it simple and professional — this side is utilitarian, not flashy.

---

## States (design all three for every screen)

- **Loading:** skeleton placeholders that mirror the final layout. For AI operations add a reassuring line ("Finding your matches…"). Never a bare spinner.
- **Empty:** a small duotone illustration + a plain, action-oriented line + one button. "No saved jobs yet — tap the bookmark on any match to keep it here."
- **Error:** calm, specific, in the product's voice, with a way out. "We couldn't read that resume. Try a PDF, or fill your profile manually." Never blame the user, never just "Something went wrong."

---

## Motion & interaction

- Match Ring counts up from 0 to value (~900ms, ease-out) on mount.
- Cards lift slightly and raise their shadow on hover; buttons darken on press.
- Page/route transitions: gentle fade + slight upward slide (~200ms).
- One tasteful celebratory moment: a brief, subtle confetti or check-burst when an application succeeds — used *only* here.
- Always honor `prefers-reduced-motion`: disable count-ups and transitions, show final values instantly.

---

## Responsive & accessibility (quality floor)

- Mobile-first; single column with bottom tab bar. Desktop adds the left sidebar and multi-column grids. Tablet ≈ desktop layout, narrower grid.
- Touch targets ≥ 44px. Sticky primary action on mobile (e.g. Apply).
- Text contrast meets WCAG AA; never rely on color alone — pair match colors with the number and a word.
- Visible keyboard focus rings (indigo). Full keyboard navigation. Label every input and icon-only button.

---

## Master prompt

> Generate a complete, premium, mobile-first UI design for "AI Job Seeker," an AI web app that helps fresh graduates find jobs that match their profile and apply in one click.
> **Design system:** indigo `#4F46E5` + warm coral `#FF7A66` duotone, on a near-white `#F7F8FB` canvas with white cards; emerald `#12B886` for success/high match, amber `#F5A524` for medium, rose `#F43F5E` for low/errors; text ink `#0E1525`, muted `#64748B`, hairline borders `#E6E9F0`. Clash Display (or General Sans) headings, Inter body, a monospace (Geist Mono) for scores and stats. Radius: buttons/inputs 12px, cards 16px, sheets 24px, pills full. Soft low shadows, generous whitespace, line icons.
> **Signature element:** an animated circular "Match Ring" showing a 0–100 score (color by score: emerald 75+, amber 50–74, rose under 50) with a one-line plain-language reason — featured on the dashboard and every job. Make this the memorable focal point; keep everything else calm and disciplined.
> **Tone:** encouraging and confidence-building for nervous first-time job seekers; copy frames gaps as next steps, never failures. Sentence case, plain active-voice labels.
> **Screens:** landing page, sign-up/login with OTP, onboarding (resume upload + AI-parsed profile review with a completeness bar), dashboard with a top-match spotlight and a recommended-jobs grid, job detail with a "why you match" breakdown, AI resume analyzer with a score gauge and improvement suggestions, skill-gap/learning path, application tracker by status, and a simpler recruiter portal. Include loading (skeletons), empty, and error states. Mobile-first with a bottom tab bar; desktop adds a left sidebar.
