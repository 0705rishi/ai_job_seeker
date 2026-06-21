# AI Job Seeker — Implementation Plan

The build blueprint for the AI Job Seeker platform. Pair this with `design.md` (UI system) and the SRS (requirements). Targeted at an AI coding tool (Cursor) and the development team.

---

## 0. Scope reminders (read first)

Three decisions are baked into this plan to keep it buildable and demo-safe:

- **Apply is two-track.** Jobs posted *inside* the platform get true one-click apply. External/aggregated jobs get a deep-link redirect ("Apply on company site"). Automated submission to LinkedIn/Naukri/Indeed is out of scope (against their ToS, no API, bot-blocked).
- **Overleaf is an outbound handoff.** The app *generates* a LaTeX resume and opens it in the user's Overleaf via the "Open in Overleaf" form mechanism. There is no inbound Overleaf API.
- **AI runs on Google Gemini.** Parsing, scoring explanations, ATS analysis, skill-gap, and cover letters use the Gemini API. Semantic matching uses Gemini embeddings.

> **Verify before coding:** Gemini SDK names, model IDs, and pricing change often. Check Google's current AI docs for the live SDK (`@google/genai`), the current flash model ID, and the current embedding model ID. The IDs in this doc are correct as of early 2026 but treat them as defaults to confirm.

---

## 1. Architecture overview

A three-tier MERN application.

```
┌─────────────────┐     HTTPS / JSON      ┌──────────────────────┐
│  React client   │  ───────────────────▶ │  Express REST API     │
│  (Vite + TS)    │  ◀─────────────────── │  (Node + TS)          │
│  TanStack Query │      JWT bearer       │  controllers/services │
└─────────────────┘                       └───────────┬──────────┘
                                                       │
                         ┌─────────────────────────────┼───────────────────────┐
                         ▼                             ▼                         ▼
                  ┌─────────────┐            ┌──────────────────┐      ┌──────────────────┐
                  │ MongoDB     │            │ Gemini API       │      │ Cloud storage    │
                  │ (Atlas)     │            │ (LLM + embed)    │      │ (Cloudinary/S3)  │
                  └─────────────┘            └──────────────────┘      └──────────────────┘
                                          (+ email gateway for OTP, Overleaf for resume handoff)
```

Secrets and the Gemini key live only on the server. The client never calls Gemini directly.

---

## 2. Tech stack

**Frontend (`/client`)**
- React 18 + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives) for the component system
- **Framer Motion** — match-ring count-up, transitions, micro-interactions
- **React Router** — routing
- **TanStack Query (React Query)** — server-state, caching, loading/error states
- **Zustand** — light global state (auth/session, UI)
- **React Hook Form** + **Zod** — forms and client validation
- **Axios** — API client (with a JWT interceptor)
- **Lucide** — icons

**Backend (`/server`)**
- **Node.js (LTS)** + **Express** + **TypeScript**
- **MongoDB** + **Mongoose**
- **jsonwebtoken** (JWT) + **bcrypt** (password hashing)
- **Zod** — request validation (shared schemas with the client where possible)
- **Multer** — multipart upload handling
- **Cloudinary** (or AWS S3) — resume file storage
- **pdf-parse** (or `pdfjs-dist`) — extract text from PDF resumes
- **@google/genai** — Gemini SDK (LLM + embeddings)
- **nodemailer** (or Resend) — OTP / notification email
- **helmet**, **cors**, **express-rate-limit** — security/hardening

**Infra**
- DB: MongoDB Atlas (free tier fine for the demo)
- Frontend host: Vercel / Netlify
- Backend host: Render / Railway
- Files: Cloudinary free tier

---

## 3. Folder structure

```
ai-job-seeker/
├── client/
│   ├── src/
│   │   ├── app/                 # router, providers, layout shells
│   │   ├── components/
│   │   │   ├── ui/              # shadcn components
│   │   │   ├── match-ring/      # the signature component
│   │   │   ├── jobs/            # JobCard, JobDetail, MatchBreakdown
│   │   │   ├── profile/         # ProfileForm, ResumeUpload, CompletenessBar
│   │   │   └── common/          # StatTile, Chip, EmptyState, Skeletons, Toast
│   │   ├── pages/               # Landing, Auth, Onboarding, Dashboard, JobDetail,
│   │   │                        #   ResumeAnalyzer, SkillGap, Applications, Recruiter
│   │   ├── features/            # api hooks per domain (useJobs, useRecommendations…)
│   │   ├── lib/                 # axios client, query client, utils, design tokens
│   │   ├── store/               # zustand stores (auth, ui)
│   │   ├── types/               # shared TS types (mirror server DTOs)
│   │   └── main.tsx
│   ├── tailwind.config.ts       # design tokens from design.md live here
│   └── .env                     # VITE_API_URL
└── server/
    ├── src/
    │   ├── config/              # db, env, cloudinary, gemini client
    │   ├── models/              # Mongoose schemas
    │   ├── controllers/         # request handlers (thin)
    │   ├── services/            # business logic (matching, ai, auth)
    │   │   ├── ai/              # gemini.service, parsing, scoring, generation
    │   │   └── matching/        # embedding + scoring engine
    │   ├── routes/              # express routers
    │   ├── middleware/          # auth, role guard, validate(zod), error handler, upload
    │   ├── utils/               # latex template, cosine sim, helpers
    │   ├── seed/                # demo data seeder
    │   └── index.ts
    └── .env
```

---

## 4. Environment variables

**Server `.env`**
```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SMTP_HOST=...        # or RESEND_API_KEY
SMTP_USER=...
SMTP_PASS=...
```

**Client `.env`**
```
VITE_API_URL=http://localhost:5000/api
```

---

## 5. Data models (Mongoose)

```
User            { name, email, phone, passwordHash, role: 'seeker'|'recruiter',
                  verified: bool, createdAt }

OtpToken        { userId, codeHash, purpose, expiresAt }   # short-lived, TTL index

SeekerProfile   { userId (ref User, unique),
                  education: [{ degree, institution, year }],
                  skills: [String],
                  projects: [{ title, description, tech: [String] }],
                  experience: [{ role, org, durationMonths, summary }],
                  preferences: { roles: [String], locations: [String],
                                 workMode: 'remote'|'onsite'|'hybrid'|'any' },
                  resumeUrl, resumeText,
                  embedding: [Number],      # profile vector for matching
                  completeness: Number }

Job             { recruiterId (ref User), title, company, description,
                  requirements: [String], skills: [String],
                  location, workMode, type: 'full-time'|'internship'|...,
                  source: 'internal'|'external', externalUrl,
                  status: 'active'|'closed',
                  embedding: [Number], createdAt }

Application     { seekerId (ref User), jobId (ref Job), resumeUrl,
                  matchScore: Number,
                  status: 'applied'|'review'|'shortlisted'|'rejected',
                  appliedAt }   # unique compound index (seekerId, jobId)

SavedJob        { seekerId, jobId, savedAt }   # unique compound index

Recommendation  { seekerId, jobId, matchScore, explanation, generatedAt }  # cache (optional)

Notification    { userId, type, message, read: bool, createdAt }
```

Add a `(seekerId, jobId)` unique index on `Application` to enforce "no duplicate applications" (FR-6.2) at the database level, not just in code.

---

## 6. API contract

All routes prefixed `/api`. Protected routes require `Authorization: Bearer <jwt>`. Keep this contract identical on both client and server — it is the single source of truth between the two halves.

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | – | Create account (seeker/recruiter), send OTP |
| POST | `/auth/verify-otp` | – | Verify OTP, activate, return JWT |
| POST | `/auth/resend-otp` | – | Resend verification code |
| POST | `/auth/login` | – | Authenticate, return JWT |
| GET | `/auth/me` | ✓ | Current user |
| GET | `/profile` | seeker | Get own profile |
| PUT | `/profile` | seeker | Update profile (recomputes embedding + completeness) |
| POST | `/profile/resume` | seeker | Upload resume → parse with Gemini → return structured fields |
| GET | `/jobs` | ✓ | List/search/filter/paginate jobs |
| GET | `/jobs/:id` | ✓ | Job detail |
| GET | `/jobs/:id/match` | seeker | Match score + breakdown for current seeker |
| POST | `/jobs` | recruiter | Create job (generates embedding) |
| PUT | `/jobs/:id` | recruiter | Edit job |
| DELETE | `/jobs/:id` | recruiter | Close/remove job |
| GET | `/jobs/:id/applicants` | recruiter | Applicants for a posting |
| GET | `/recommendations` | seeker | Ranked recommended jobs with scores + reasons |
| POST | `/applications` | seeker | Apply to an internal job (one-click) |
| GET | `/applications` | seeker | Own applications (tracker) |
| PATCH | `/applications/:id/status` | recruiter | Update application status |
| POST | `/saved/:jobId` / DELETE | seeker | Save / unsave a job |
| GET | `/saved` | seeker | Saved jobs |
| POST | `/ai/resume-score` | seeker | ATS-style resume score + suggestions |
| POST | `/ai/skill-gap` | seeker | Gap analysis vs. a target job |
| POST | `/ai/cover-letter` | seeker | Generate a tailored cover letter |
| POST | `/ai/latex-resume` | seeker | Generate LaTeX resume + Overleaf payload |
| GET | `/notifications` | ✓ | List notifications |
| PATCH | `/notifications/:id/read` | ✓ | Mark read |

Standard response envelope: `{ success, data, error }`. Errors return a consistent shape with a human-readable `message` the frontend can show directly.

---

## 7. Gemini AI integration

All AI lives in `server/src/services/ai`. A single configured client is shared:

```ts
// config/gemini.ts (illustrative — confirm the SDK surface against current docs)
import { GoogleGenAI } from "@google/genai";
export const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const MODELS = {
  text: "gemini-2.0-flash",          // fast + cheap for parsing/generation
  embedding: "text-embedding-004",   // confirm current embedding model id
};
```

### 7.1 Resume parsing
1. Extract text (`pdf-parse` for PDF; read `.tex` directly).
2. Call Gemini with **structured-output mode** — set `responseMimeType: "application/json"` and a `responseSchema` describing the profile shape. This makes parsing reliable instead of regex-fragile.
3. Validate the returned JSON with Zod before mapping onto `SeekerProfile`.
4. On failure or low confidence, return an error that tells the user to fill the profile manually (never crash).

### 7.2 Semantic matching (embeddings)
- On job create/update: embed `title + description + requirements + skills` → store `Job.embedding`.
- On profile save: embed `skills + experience + projects + preferences` → store `SeekerProfile.embedding`.
- Recommendations: load active jobs, compute **cosine similarity** between the profile vector and each job vector in Node (simple loop — fine at project scale). Optional upgrade: MongoDB Atlas Vector Search if the catalog grows.

### 7.3 Match score (the number behind the ring)
Deterministic and explainable — **no LLM call per job** (keeps the dashboard fast and cheap):

```
semantic = normalize(cosine(profile.embedding, job.embedding))   // 0..1
skillOverlap = matchedRequiredSkills / totalRequiredSkills        // 0..1
contextBoost = (locationMatch ? 0.5 : 0) + (workModeMatch ? 0.5 : 0)  // 0..1

score = round(100 * ( 0.55*semantic + 0.35*skillOverlap + 0.10*contextBoost ))
```
Clamp 0–100. Color buckets: **75+ emerald, 50–74 amber, <50 rose** (matches `design.md`). The "why you match" breakdown is built deterministically from matched vs. missing required skills — no API cost, instant render.

> Optional polish: generate the *one-line natural-language* reason with Gemini once and cache it on `Recommendation`, so you don't call the API on every page load.

### 7.4 Other AI features
- **Resume/ATS score** — Gemini scores structure, keyword coverage, clarity, completeness (structured JSON) and returns prioritized suggestions.
- **Skill-gap** — compare profile skills to a target job; return missing skills + a learning suggestion + projected score lift.
- **Cover letter** — generate an editable draft from profile + job; never auto-submit.
- **LaTeX resume** — render profile into a LaTeX template string server-side (see 7.5).

### 7.5 Overleaf handoff
- Backend renders `SeekerProfile` into a clean, ATS-friendly LaTeX template and returns the `.tex` string.
- Frontend "Open in Overleaf" performs a form POST to Overleaf's open endpoint with the encoded LaTeX (the documented "Open in Overleaf" snippet mechanism). Confirm the exact field name (`snip` / `encoded_snip` / `snip_uri`) against current Overleaf docs.
- Always also offer a plain `.tex` and PDF download as a fallback.

### 7.6 Cost & latency discipline
- Cache embeddings (recompute only on meaningful change). Cache recommendation explanations.
- Show skeleton loaders (per `design.md`) on every AI call.
- Wrap every Gemini call in try/catch with a graceful fallback; rate-limit AI routes.

---

## 8. Frontend architecture

- **Routing:** public (`/`, `/login`, `/signup`), seeker app (`/dashboard`, `/jobs`, `/jobs/:id`, `/resume`, `/applications`, `/profile`), recruiter app (`/recruiter/...`). A `ProtectedRoute` checks JWT + role.
- **State:** TanStack Query owns all server data (jobs, recommendations, applications). Zustand holds session + UI state only. Don't duplicate server data into Zustand.
- **API hooks:** one hook file per domain in `features/` (`useAuth`, `useProfile`, `useJobs`, `useRecommendations`, `useApplications`, `useAi`). Components never call Axios directly.
- **Design system:** put every token from `design.md` into `tailwind.config.ts` (colors, radius, fonts). Build `MatchRing` first — it is the signature component used across the dashboard, job cards, and detail.
- **Component → screen map:** Landing, Auth (+OTP), Onboarding (ResumeUpload + ProfileForm + CompletenessBar), Dashboard (StatTiles + TopMatchSpotlight + JobCard grid), JobDetail (MatchBreakdown + ApplyButton), ResumeAnalyzer (ScoreGauge + SuggestionCards), SkillGap, Applications (status board), Recruiter portal. Every screen ships loading / empty / error states.
- **Motion:** MatchRing count-up, card hover lift, route fade-slide, one confetti moment on successful apply, all gated behind `prefers-reduced-motion`.

---

## 9. Backend architecture

- **Layering:** `routes → middleware (validate, auth, role) → controller (thin) → service (logic) → model`. Controllers never contain business logic.
- **Auth flow:** register → create unverified user + hashed OTP → email the code → `verify-otp` activates and returns JWT → returning users `login`. (For the demo, **email OTP** via nodemailer/Resend is realistic and free; SMS costs money — note it as a production upgrade. You can also log the OTP to the server console in dev.)
- **Validation:** every request body validated by a Zod schema in `validate` middleware before it reaches a controller.
- **File upload:** Multer (memory storage) → stream to Cloudinary → store the returned URL; never keep binaries in MongoDB.
- **Security:** bcrypt hashing, JWT verification middleware, role guard middleware, helmet, CORS locked to `CLIENT_URL`, rate-limit on auth + AI routes, no secrets sent to the client.
- **Errors:** a central error-handling middleware returns the consistent `{ success:false, error:{ message } }` envelope; async handlers wrapped so rejections reach it.

---

## 10. Build phases (sequenced and demoable)

Each phase ends in something you can show. Build in this order.

1. **Foundation** — repos, TS configs, env, DB connection, Tailwind + shadcn + design tokens, router, layout shells, Axios + Query client, error handler. *Demo: themed empty app shell.*
2. **Auth** — register → OTP → login → JWT → `/auth/me`, ProtectedRoute, role guard. *Demo: sign up and reach a gated dashboard.*
3. **Profile & resume parsing** — profile model + form, resume upload → Gemini parse → review/edit, completeness bar. *Demo: upload a PDF, watch it auto-fill.*
4. **Jobs & recruiter posting** — Job model, recruiter create/edit, browse/search/filter, seed demo jobs. *Demo: a populated job board.*
5. **Matching engine** — embeddings on save, scoring algorithm, `/recommendations`, `/jobs/:id/match`, wire the MatchRing. *Demo: ranked matches with live scores + reasons.*
6. **Apply & tracker** — one-click apply (internal), external redirect, duplicate guard, application tracker with statuses. *Demo: apply and watch it appear in the tracker.*
7. **AI features** — resume/ATS score, skill-gap, cover letter, LaTeX + Overleaf handoff. *Demo: the "wow" AI tools.*
8. **Polish** — every loading/empty/error state, motion, notifications, dark mode, responsive QA, seed a rich realistic dataset. *Demo: looks like a finished product.*
9. **Deploy** — Atlas, Render/Railway (server), Vercel (client), env wiring, smoke test. *Demo: a live URL.*

For demo day, phases 1–6 + the strongest one or two items from phase 7 + phase 8 polish beat trying to ship every AI feature half-finished.

---

## 11. Seeding & demo data

Write a `seed` script that inserts ~30–50 realistic jobs across roles/locations and a couple of demo seeker + recruiter accounts with pre-parsed profiles, and **pre-computes all embeddings**. A populated, fast app on demo day reads as "finished"; an empty one reads as a prototype. Pre-seeding embeddings also avoids burning API quota live.

---

## 12. Deployment

- **MongoDB Atlas** free cluster; whitelist the server host.
- **Server** on Render/Railway with all env vars set; HTTPS by default.
- **Client** on Vercel with `VITE_API_URL` pointing at the server.
- Lock CORS to the deployed client origin. Smoke-test the full auth → match → apply flow on the live URLs before demo day.

---

## 13. Testing & correctness

- **Zod everywhere** at the API boundary — invalid data never reaches a controller.
- DB-level uniqueness on `Application(seekerId, jobId)` and `SavedJob(seekerId, jobId)`.
- Unit-test the scoring function with fixed inputs (it must be deterministic).
- Mock Gemini in tests so the suite doesn't hit the network or cost money.
- Manual end-to-end pass of the full seeker journey before each demo.

---

## 14. Realistic notes

- AI coding tools won't correctly one-shot a full-stack app this size. Build phase by phase (Section 10); commit and verify each phase before moving on.
- Gemini model IDs, the SDK API surface, and free-tier limits change — verify against Google's current docs, and have a funded key ready for demo day with caching in place so you stay within limits.
- Resume parsing quality depends on resume formatting; always keep the manual-entry fallback working.
- The match score is heuristic, not ground truth — that's fine and expected; the explainable breakdown is what sells it.
