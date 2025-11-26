# Aether Trading Academy

A lightweight MVP that combines learning, quizzes, and a virtual trading sandbox. The entire experience runs in the browser with Supabase as the backend for auth, user profiles, lesson progress, quiz attempts, and the fake-trading portfolio.

## Features

- **Authentication**: email + password signup/login, Google OAuth trigger, user profiles stored in Supabase.
- **Video lessons**: 18 curated classes across four courses (including the new Market Prediction & Interpretation track) with inline video player and completion tracking.
- **Quizzes**: topic-based arenas with a 40-question bank (including a news-reaction exam), score calculation, and optional auto-complete of linked lessons after a passing score.
- **Fake trading sandbox**: €10k starting balance, random-walk prices, and 60+ tradable assets (BTC, ETH, USDT, XRP, SOL, etc.) with persisted portfolio value plus zoomable 1D → 10Y charts for both the portfolio and each asset on the synchronized live feed or replay scenarios.
- **Market bulletin board**: rotating, fictional headlines beneath the sandbox charts/logs that refresh every few hours so learners can practice reading sentiment, mapping it to assets, open full-length briefs with projected impacts, and watching those cues tilt simulated prices the way real-world events have historically moved crypto.
- **Shared live feed**: deterministic price ticks and synchronized headlines so every demo user sees the same market tape, plus a weekly leaderboard that ranks fictional peers and your account by simulated P&L.
- **Gamified progression**: XP ranks, streak tracking, quest board, and badges that react to your learning and trading activity.
- **Dashboard**: shows completed lessons, quiz history, sandbox KPIs, and a profile summary.
- **Tailwind UI**: modern dark-mode interface powered by the CDN build of TailwindCSS so no build tooling is required.
- **Backend status panel**: paste Supabase credentials at runtime (stored in the browser) or fall back to the fully offline demo mode instantly.

## Sandbox asset universe

The sandbox includes the full list requested for review so you can simulate trading across majors, stablecoins, and newer narratives without touching a real exchange:

`BTC`, `ETH`, `USDT`, `XRP`, `BNB`, `SOL`, `USDC`, `TRX`, `DOGE`, `ADA`, `WBTC`, `LINK`, `BCH`, `USDS`, `ZEC`, `XLM`, `USDE`, `LTC`, `XMR`, `HBAR`, `AVAX`, `SUI`, `SHIB`, `TON`, `DOT`, `DAI`, `UNI`, `CRO`, `M`, `WLFI`, `MNT`, `PYUSD`, `NEAR`, `ICP`, `TAO`, `USD1`, `AAVE`, `ETC`, `PEPE`, `APT`, `ASTER`, `ENA`, `XAUT`, `PUMP`, `JITOSOL`, `ONDO`, `POL`, `WLD`, `FIL`, `TRUMP`, `ALGO`, `PAXG`, `ATOM`, `ARB`, `QNT`, `KAS`, `SKY`, `USDG`, `RENDER`, `FLR`.

## Getting started

### Preconfigured Supabase backend

The repo already includes live credentials so email/password + Google OAuth logins work immediately:

- **Project URL**: `https://eaoiexsemsiqqpisjkhj.supabase.co`
- **Anon key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhb2lleHNlbXNpcXFwaXNqa2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMTQ0OTcsImV4cCI6MjA3ODY5MDQ5N30.dXwq-aKuleIpBvFkefiw_KGFLte7kilgXwtHqpYeIwo`
- **Google OAuth redirect**: `https://983804861266-mm08o6gnraom8gltluomi8t5gvukic36.apps.googleusercontent.com`

You can swap in your own Supabase project any time via the in-app backend panel or by editing `assets/config.js` (use `assets/config.example.js` as a template).

1. Copy the Supabase config template and fill it with your project credentials (optional if you plan to paste them through the new in-app backend panel):

   ```bash
   cp assets/config.example.js assets/config.js
   # Edit the file with your project URL + anon key + Google redirect URL
   ```

2. Serve the static files with any HTTP server (examples):

   ```bash
   # macOS/Linux if "python" is available on your PATH
   python -m http.server 4173

   # macOS systems where only Python 3 is available as "python3"
   python3 -m http.server 4173

   # Windows (PowerShell or Command Prompt)
   py -m http.server 4173

   # or use any static host such as Vercel/Netlify
   ```

   **Tip for VS Code users:** open the built-in terminal (`Ctrl+``), run whichever command above matches your OS (`python`,
   `python3`, or `py -m http.server 4173`) from the project root, and VS Code will host the files at
   [http://localhost:4173](http://localhost:4173). Keep the terminal tab open while you browse.

3. Open `http://localhost:4173` in a browser. Authentication, progress, quizzes and sandbox data will sync with Supabase once the keys are configured. Without Supabase credentials, the app still works in an offline/local-storage mode so you can demo the UX quickly.

   - When no Supabase credentials are detected the UI now auto-loads the full guest workspace so you immediately see the dashboard, curriculum, and sandbox views. The login card remains for reference, but you can use the "Explore demo workspace" button (or let the automatic guest mode kick in) to browse everything without signing in.
   - Prefer to configure Supabase without editing files? Expand the **Backend status** panel on the auth card, paste your project URL + anon key + optional Google redirect, and hit **Save & reload**. The credentials stay in the browser's `localStorage` and override `assets/config.js` automatically so you can deploy the static build anywhere and still wire up a real backend at runtime.

### Runtime backend overrides

The backend panel mentioned above is handy when you share a deployed preview or don't want to rebuild the static bundle:

1. Serve the site (local server or static host).
2. On the login screen, scroll to **Backend status** → **Supabase credentials**.
3. Paste your Supabase project URL, anon key, and the redirect URL you'd like Google OAuth to use.
4. Click **Save & reload**. The page restarts with a fully configured Supabase client.
5. Need to return to demo mode? Hit **Use demo mode** to clear the stored credentials and immediately fall back to the offline experience.

These overrides live only in the browser and can be rotated without touching source control, which makes the platform "fully operational" whether you're running locally, on Vercel/Netlify, or sharing a zipped build.

## Supabase schema

Run `supabase/schema.sql` inside your project (SQL editor or migration) to create the required tables and row-level security policies:

- `profiles`: stores the learner display name.
- `lesson_progress`: marks completed lessons + quiz scores per lesson.
- `quiz_attempts`: history of quiz submissions.
- `sandbox_state`: balance, holdings JSON and trade history for the fake-trading sandbox.

## Configuration notes

- `supabaseConfig.googleRedirectTo` points to `https://983804861266-mm08o6gnraom8gltluomi8t5gvukic36.apps.googleusercontent.com` by default and falls back to `window.location.origin` if you clear the preconfigured host via the backend panel.
- The `featureToggles` export lets you control quiz thresholds, sandbox tick speed, and whether a passing quiz auto-marks the lesson as complete.
- All Supabase calls are wrapped with graceful fallbacks: if no credentials are present the UI keeps working with `localStorage` persistence.

## Technology choices

Because npm installs are blocked in this environment, the MVP is delivered as framework-free ES modules with CDN-powered Tailwind and Supabase. The codebase stays small, inspectable, and ready to migrate to React/Next.js if desired later.
