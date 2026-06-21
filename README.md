# AI Job Seeker

> AI-powered job recommendation and one-click application platform for fresh graduates.

---

## What It Does

AI Job Seeker matches fresh graduates to relevant jobs using semantic embeddings and Gemini AI. Seekers upload their resume, get an instant parsed profile, and receive ranked job recommendations with an AI-generated match explanation. From there they can apply in one click (internal jobs) or be deep-linked to the source (external jobs).

**Key capabilities:**

- 🎯 **AI Recommendations** — Cosine-similarity matching on 768-dim Gemini embeddings, surfaced with a visual Match Ring score
- 📄 **Resume Parsing** — PDF upload → structured profile extraction via Gemini structured outputs
- 🔬 **ATS Score** — Circular gauge (0–100) with actionable improvement suggestions
- 🛤 **Skill Gap Analysis** — Missing skills, projected score lift, and curated learning path per job
- ✉️ **Cover Letter Generator** — AI-drafted, role-specific cover letter in one click
- 📝 **LaTeX Resume Export** — Generate a LaTeX resume and open directly in Overleaf
- 🏢 **Recruiter Portal** — Post, edit, and track jobs; review applications
- 🔐 **Auth** — JWT + bcrypt, OTP email verification, role-based access (seeker / recruiter)

---

## Tech Stack

| Layer | Stack |
|---|---|
| **Frontend** | React 18 + TypeScript + Vite, Tailwind CSS + shadcn/ui, Framer Motion, React Router v6, TanStack Query, Zustand, React Hook Form + Zod, Axios, Lucide |
| **Backend** | Node.js + Express + TypeScript, MongoDB + Mongoose, Zod validation, Multer, Cloudinary, pdf-parse, Nodemailer |
| **AI** | Google Gemini (`@google/genai`) — LLM + embeddings, server-side only |

---

## Project Structure

```
AI-Job-Seeker/
├── client/                  # Vite + React frontend
│   └── src/
│       ├── app/             # App shell, routing, global providers
│       ├── components/      # Shared UI components (MatchRing, JobCard, etc.)
│       ├── features/        # TanStack Query hooks (useJobs, useAi, useAuth…)
│       ├── pages/           # Route-level page components
│       ├── store/           # Zustand global stores
│       └── types/           # Shared TypeScript types
├── server/                  # Express + TypeScript backend
│   └── src/
│       ├── config/          # DB connection, environment config
│       ├── controllers/     # Thin request handlers
│       ├── middleware/      # Auth guard, Zod validation, role check
│       ├── models/          # Mongoose schemas (User, Job, Application, …)
│       ├── routes/          # Express routers
│       ├── seed/            # DB seeder (30 demo jobs + demo accounts)
│       └── services/        # Business logic (gemini, auth, upload, …)
├── uploads/                 # Local resume storage (dev only)
├── .gitignore
├── package.json             # Root monorepo scripts
└── README.md
```

---

## Prerequisites

- Node.js ≥ 18
- MongoDB running locally on `mongodb://localhost:27017` **or** a MongoDB Atlas URI
- (Optional) A Google Gemini API key — all AI features fall back to deterministic mocks without it
- (Optional) Cloudinary credentials — resumes are stored locally in `uploads/` without them
- (Optional) SMTP credentials — OTP codes are logged to console in dev without them

---

## Getting Started

### 1. Clone

```bash
git clone https://github.com/your-org/AI-Job-Seeker.git
cd AI-Job-Seeker
```

### 2. Configure environment variables

**`server/.env`**

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-job-seeker
JWT_SECRET=change_me_to_a_random_64_char_string
JWT_EXPIRES_IN=7d

# Optional — omit to use local mock fallbacks
GEMINI_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional — OTP codes log to console in dev if omitted
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@aijobseeker.dev
```

**`client/.env`**

```env
VITE_API_URL=http://localhost:5000
```

### 3. Install dependencies

```bash
# Server
npm --prefix server install

# Client
npm --prefix client install
```

### 4. Seed the database

```bash
npm --prefix server run seed
```

This creates:
- **Seeker demo account** — `seeker@demo.com` / `Demo@1234`
- **Recruiter demo account** — `recruiter@demo.com` / `Demo@1234`
- 30 realistic tech job listings with pre-computed mock embeddings

### 5. Run

```bash
# Both apps in parallel (from project root)
npm run dev
```

| App | URL |
|---|---|
| Client | http://localhost:5173 |
| Server | http://localhost:5000 |
| Health check | http://localhost:5000/api/health |

---

## API Overview

All endpoints are prefixed `/api`. Protected routes require `Authorization: Bearer <token>`.

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | — | Server health |
| `POST` | `/auth/register` | — | Register + send OTP |
| `POST` | `/auth/verify-otp` | — | Verify OTP |
| `POST` | `/auth/login` | — | Login → JWT |
| `GET` | `/profile` | seeker | Get parsed profile |
| `PUT` | `/profile` | seeker | Update profile |
| `POST` | `/profile/upload-resume` | seeker | Upload + parse PDF |
| `GET` | `/jobs` | any | Browse jobs (search, filters, pagination) |
| `POST` | `/jobs` | recruiter | Create job |
| `PUT` | `/jobs/:id` | recruiter | Update job |
| `DELETE` | `/jobs/:id` | recruiter | Delete job |
| `GET` | `/recommendations` | seeker | AI-ranked job matches |
| `POST` | `/applications` | seeker | One-click apply (internal) |
| `GET` | `/applications` | seeker | My applications |
| `GET` | `/applications/recruiter` | recruiter | Applications for my jobs |
| `POST` | `/ai/resume-score` | seeker | ATS score + suggestions |
| `POST` | `/ai/skill-gap` | seeker | Skill gap vs target job |
| `POST` | `/ai/cover-letter` | seeker | Draft cover letter |
| `POST` | `/ai/latex-resume` | seeker | Generate LaTeX resume |

---

## Key Design Decisions

**AI runs server-side only.** `GEMINI_API_KEY` is never sent to the browser. All AI calls are in `server/src/services/gemini.service.ts`.

**Graceful degradation.** Every Gemini call has a deterministic mock fallback so the app works fully without an API key.

**Two-track apply.** Internal jobs use one-click DB application; external jobs deep-link to the source (LinkedIn, Naukri, etc.). No automated submission to third-party platforms.

**Overleaf export is outbound-only.** The LaTeX resume is submitted via an HTML form POST to `https://www.overleaf.com/docs`. There is no inbound Overleaf API.

**No duplicate applications.** Enforced by a DB unique index on `Application(seekerId, jobId)`.

---

## Environment Fallback Behaviour

| Credential missing | Fallback |
|---|---|
| `GEMINI_API_KEY` | Mock embeddings + deterministic AI responses |
| `CLOUDINARY_*` | Resumes stored locally in `uploads/resumes/` |
| `SMTP_*` | OTP codes logged to server console |

---

## License

MIT
