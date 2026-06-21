# PROGRESS.md — AI Job Seeker Build Log

## Overview
This file serves as a running chronological log of our build phases, decisions made, features implemented, and items deferred, ensuring the build is resumable if interrupted.

---

## [2026-06-18] Initial Setup & Checklist Creation
- **Checklist:** Created [task.md](file:///home/mrstark/.gemini/antigravity-ide/brain/132042dc-b603-4fd1-ae49-37bd05940ff4/task.md) to track tasks.
- **Database:** Successfully started local MongoDB process on port `27017` in the workspace background (`.agents/mongodb_data`).
- **Required Credentials Check:**
  - `MONGODB_URI`: Resolved (using local `mongodb://localhost:27017/ai-job-seeker`).
  - `GEMINI_API_KEY`: Missing.
  - `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`: Missing.
  - `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS`: Missing.

## [2026-06-18] Phase 2: Authentication
- **User & OTP Models:** Implemented mongoose models for `User` and `OtpToken` with TTL indexing (5 minutes).
- **Service Layer:** Created `auth.service` handling register, OTP code delivery (via console log fallback in local development), OTP verification, and password validation with bcrypt.
- **Middlewares:** Built Zod validation middleware for request bodies, secure route guard verification middleware (`protect`), and role-based path authorization (`authorize`).
- **UI screens:** Created `AuthPage` including custom seeker/recruiter role cards and single-digit OTP verification box. Integrated Zustand authentication store in client.
- **Gate Check:** Ran compilation and verification tests. Both client and server build cleanly. Account signup, OTP verification, and JWT session persistence verified via HTTP client. Protected endpoint rejects without JWT token.

## [2026-06-18] Phase 3: Profile & Resume Parsing
- **Profile Model:** Implemented `SeekerProfile` mongoose model with complete fields for education, skills, projects, experience, preferences, and embedding storage.
- **Upload Middleware & Service:** Configured Multer memory storage and created file upload service with fallback to local workspace storage (`/uploads/resumes/`) if Cloudinary credentials are omitted. Configure express static serving for local files.
- **Structured AI Resume Parser:** Integrated Gemini structured outputs via `@google/genai` library and created a heuristics-based keyword matching mock resume parser as fallback.
- **Mock Embedding Generator:** Engineered a deterministic 768-dimensional mock embedding generator based on common developer keyword indexing to power semantic matching in future phases.
- **UI Screens:** Implemented `OnboardingPage` with resume drag-and-drop zone, skeleton parsing loader, and full profile review form synced with a completeness percentage bar.
- **Gate Check:** Compilation passes on both apps. Resume parser and update profile API smoke checks successfully executed with sample developer resumes.

## [2026-06-18] Phase 4: Jobs & Recruiter Posting
- **Job Model:** Designed and created Mongoose schema for `Job` entity, containing title, requirements, skills, location, workMode, type, source (internal vs external), external URL, and embedding array.
- **Service & API Endpoints:** Developed `getJobs` query handler with keyword text search and filters for location, workMode, and type, with full offset pagination support. Restricted create/edit/delete endpoints to recruiter role.
- **DB Seeding Script:** Authored database seeder creating seeker/recruiter demo accounts and populating 30 realistic, high-fidelity tech jobs with pre-calculated mock embeddings.
- **UI Screens:** Implemented responsive `BrowseJobsPage` featuring live filter updates, paginated tables, and details overlay drawers with internal/external apply directions.
- **Gate Check:** Script executes successfully. GET /jobs returns 30 seeded jobs with fully functional search/filter queries. All TypeScript compilation passes.

## [2026-06-18] Phase 7: AI Features
- **Backend REST API:** Implemented `ai.controller` and `ai.routes` exposing endpoints for `/ai/resume-score`, `/ai/skill-gap`, `/ai/cover-letter`, and `/ai/latex-resume`.
- **Frontend Client Hooks:** Created `useAi` query and mutation hooks using TanStack Query, connecting all new backend endpoints.
- **UI Screens:** Designed and created `ResumeAnalyzerPage` showing a circular ATS score gauge, prioritized suggestions, target job evaluations, and LaTeX/Overleaf exports.
- **Skill Gap Screen:** Developed `SkillGapPage` displaying potential score lift, matched/missing skill chips, learning path resource tips, and dynamic cover letter generator.
- **One-Click Apply Connection:** Integrated `useApplyToJob` mutation directly in `JobDetailsDrawer` replacing the mock alert from Phase 6.
- **Gate Check:** Passed both server and client TypeScript compilation check (`tsc --noEmit`) with zero errors.
