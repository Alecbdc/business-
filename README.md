# Aether Trading Academy

A lightweight MVP that combines learning, quizzes, and a virtual trading sandbox. The entire experience runs in the browser with Supabase as the backend for auth, user profiles, lesson progress, quiz attempts, and the fake-trading portfolio.

## Features

- **Authentication**: email + password signup/login, Google OAuth trigger, user profiles stored in Supabase.
- **Video lessons**: curated course list, inline video player, lesson completion tracking.
- **Quizzes**: multiple-choice quizzes, score calculation, optional auto-complete of lessons after a passing score.
- **Fake trading sandbox**: BTC/ETH prices update with a random walk, users start with €10k, can buy/sell, and the portfolio value is persisted.
- **Dashboard**: shows completed lessons, quiz history, sandbox KPIs, and a profile summary.
- **Tailwind UI**: modern dark-mode interface powered by the CDN build of TailwindCSS so no build tooling is required.

## Getting started

1. Copy the Supabase config template and fill it with your project credentials:

   ```bash
   cp assets/config.example.js assets/config.js
   # Edit the file with your project URL + anon key + Google redirect URL
   ```

2. Serve the static files with any HTTP server (examples):

   ```bash
   python -m http.server 4173
   # or use any static host such as Vercel/Netlify
   ```

3. Open `http://localhost:4173` in a browser. Authentication, progress, quizzes and sandbox data will sync with Supabase once the keys are configured. Without Supabase credentials, the app still works in an offline/local-storage mode so you can demo the UX quickly.

## Supabase schema

Run `supabase/schema.sql` inside your project (SQL editor or migration) to create the required tables and row-level security policies:

- `profiles`: stores the learner display name.
- `lesson_progress`: marks completed lessons + quiz scores per lesson.
- `quiz_attempts`: history of quiz submissions.
- `sandbox_state`: balance, holdings JSON and trade history for the fake-trading sandbox.

## Configuration notes

- `supabaseConfig.googleRedirectTo` defaults to `window.location.origin` so Google OAuth redirects back to the same origin.
- The `featureToggles` export lets you control quiz thresholds, sandbox tick speed, and whether a passing quiz auto-marks the lesson as complete.
- All Supabase calls are wrapped with graceful fallbacks: if no credentials are present the UI keeps working with `localStorage` persistence.

## Technology choices

Because npm installs are blocked in this environment, the MVP is delivered as framework-free ES modules with CDN-powered Tailwind and Supabase. The codebase stays small, inspectable, and ready to migrate to React/Next.js if desired later.
