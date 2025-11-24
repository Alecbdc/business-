import * as data from './data.js';
import {
  supabaseConfig,
  featureToggles,
  getSupabaseOverrides,
  persistSupabaseOverrides,
  clearSupabaseOverrides,
  hasSupabaseCredentials,
  FORCE_DEMO_MODE
} from './config.js';

const {
  courses,
  defaultSandboxState,
  initialPrices,
  quizTopics,
  sandboxBulletins,
  strategyCards,
  eventScenarios,
  learningTracks = []
} = data;

const cacheKey = 'aether-cache-v2';
const historyLimit = 1200;
const assetSymbols = Object.keys(initialPrices);
const totalQuizQuestions = quizTopics.reduce((acc, topic) => acc + topic.questions.length, 0);
const passingScoreThreshold = Number(featureToggles.passingScore ?? 70);
const autoCompleteAfterQuiz = featureToggles.autoMarkCompleteAfterQuiz !== false;
const maxVisibleAssets = 12;
const timeframeOptions = [
  { key: '1D', label: '1D', ms: 1000 * 60 * 60 * 24 },
  { key: '3D', label: '3D', ms: 1000 * 60 * 60 * 24 * 3 },
  { key: '5D', label: '5D', ms: 1000 * 60 * 60 * 24 * 5 },
  { key: '1M', label: '1M', ms: 1000 * 60 * 60 * 24 * 30 },
  { key: '3M', label: '3M', ms: 1000 * 60 * 60 * 24 * 90 },
  { key: '6M', label: '6M', ms: 1000 * 60 * 60 * 24 * 180 },
  { key: 'YTD', label: 'YTD', ms: null },
  { key: '12M', label: '12M', ms: 1000 * 60 * 60 * 24 * 365 },
  { key: '3Y', label: '3Y', ms: 1000 * 60 * 60 * 24 * 365 * 3 },
  { key: '5Y', label: '5Y', ms: 1000 * 60 * 60 * 24 * 365 * 5 },
  { key: '10Y', label: '10Y', ms: 1000 * 60 * 60 * 24 * 365 * 10 },
  { key: 'ALL', label: 'All', ms: null }
];
const defaultTimeframe = '3M';
const bulletinRefreshMs = featureToggles.newsRefreshMs ?? 1000 * 60 * 60 * 2;
const maxBulletins = 12;

if (FORCE_DEMO_MODE) {
  clearSupabaseOverrides();
}

const isSupabaseConfigured = hasSupabaseCredentials() && !FORCE_DEMO_MODE;

function randomizePrice(price, drift = 0) {
  const delta = (Math.random() - 0.5) * 0.04 + drift;
  return Math.max(0, price * (1 + delta));
}

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateHistorySeries(anchorPrice) {
  const now = Date.now();
  const yearsMs = 1000 * 60 * 60 * 24 * 365 * 10;
  const basePoints = 520;
  const baseStep = yearsMs / basePoints;
  const series = [];
  let value = anchorPrice * 0.65;
  for (let i = 0; i <= basePoints; i++) {
    const ts = now - yearsMs + i * baseStep;
    value = randomizePrice(value);
    series.push({ ts, value: Number(value.toFixed(4)) });
  }
  const densePoints = 168; // hourly over last 7 days
  const denseSpan = 1000 * 60 * 60 * 24 * 7;
  const denseStart = now - denseSpan;
  value = series[series.length - 1]?.value ?? anchorPrice;
  for (let i = 0; i <= densePoints; i++) {
    const ts = denseStart + (i / densePoints) * denseSpan;
    value = randomizePrice(value);
    series.push({ ts, value: Number(value.toFixed(4)) });
  }
  return series.slice(-historyLimit);
}

function seedPriceHistoryMap(priceMap) {
  return Object.entries(priceMap).reduce((acc, [symbol, price]) => {
    acc[symbol] = generateHistorySeries(price);
    return acc;
  }, {});
}

function seedPortfolioSeries(anchorValue = defaultSandboxState.balance) {
  const series = generateHistorySeries(anchorValue);
  return series.map((entry) => ({ ...entry, value: Math.max(entry.value, 0) }));
}

const seededPriceHistory = seedPriceHistoryMap(initialPrices);
const latestSeededPrices = Object.fromEntries(
  Object.entries(seededPriceHistory).map(([symbol, series]) => [symbol, series[series.length - 1]?.value ?? 0])
);
const seededPortfolioHistory = seedPortfolioSeries();

const deepClone = (value) =>
  typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));

const normalizeHoldings = (holdings = {}) => {
  return assetSymbols.reduce((acc, symbol) => {
    acc[symbol] = Number(holdings[symbol] ?? 0);
    return acc;
  }, {});
};

const supabaseClient =
  window.supabase && isSupabaseConfigured
    ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      })
    : null;

let demoEntered = false;

const state = {
  user: null,
  profile: null,
  previewMode: false,
  currentView: 'dashboard',
  previousView: 'dashboard',
  selectedLessonId: courses[0]?.lessons[0]?.id ?? null,
  selectedQuizTopicId: quizTopics[0]?.id ?? null,
  progress: {},
  quizScores: {},
  topicScores: {},
  quizLog: [],
  sandbox: {
    balance: defaultSandboxState.balance,
    holdings: normalizeHoldings(defaultSandboxState.holdings),
    history: defaultSandboxState.history ?? [],
    activeScenario: null,
    scenarioTicks: 0
  },
  prices: { ...latestSeededPrices },
  priceHistory: seededPriceHistory,
  portfolioHistory: seededPortfolioHistory,
  chartTimeframes: { portfolio: defaultTimeframe, asset: defaultTimeframe },
  chartZoom: { portfolio: 1, asset: 1 },
  activeAsset: assetSymbols[0] ?? 'BTC',
  bulletin: { bucket: null, items: [] },
  activeBulletinArticleId: null,
  ui: { showAllAssets: false },
  pendingTrade: null
};

const elements = {};

function $(selector) {
  if (!selector) return null;
  const key = selector.startsWith('#') ? selector.slice(1) : selector;
  if (!elements[key]) {
    elements[key] = document.getElementById(key);
  }
  return elements[key];
}

function setProfileName(value) {
  document.querySelectorAll('[data-profile-name]').forEach((node) => {
    node.textContent = value;
  });
}

function updateBackendStatus() {
  const status = $('#backend-status');
  if (!status) return;
  const label = isSupabaseConfigured
    ? 'Supabase connected'
    : FORCE_DEMO_MODE
      ? 'Demo enforced'
      : 'Demo mode';
  status.textContent = label;
  status.className = `badge ${
    isSupabaseConfigured ? 'bg-emerald-500/20 text-emerald-100' : 'bg-amber-500/20 text-amber-100'
  }`;
}

function showToast(message, type = 'info') {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `card-glass rounded-2xl p-4 text-sm ${
    type === 'error' ? 'bg-rose-600/80' : type === 'success' ? 'bg-emerald-600/80' : 'bg-slate-900/90'
  }`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

function hydrateCache() {
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    state.progress = parsed.progress ?? {};
    state.quizScores = parsed.quizScores ?? {};
    state.topicScores = parsed.topicScores ?? {};
    state.quizLog = (parsed.quizLog ?? []).map((entry) => ({
      ...entry,
      passed: entry.passed ?? (entry.score != null && entry.score >= passingScoreThreshold)
    }));
    state.selectedQuizTopicId = parsed.selectedQuizTopicId ?? state.selectedQuizTopicId;
    state.sandbox = parsed.sandbox ?? { ...deepClone(defaultSandboxState) };
    state.sandbox.balance = Number(state.sandbox.balance ?? defaultSandboxState.balance);
    state.sandbox.holdings = normalizeHoldings(state.sandbox.holdings);
    state.sandbox.history = state.sandbox.history ?? [];
  } catch (err) {
    console.warn('Failed to hydrate cache', err);
  }
}

function seedDemoStateIfEmpty() {
  if (supabaseClient) return;
  const hasProgress = Object.keys(state.progress ?? {}).length > 0;
  const hasTrades = (state.sandbox.history ?? []).length > 0;
  const hasHoldings = Object.values(state.sandbox.holdings ?? {}).some((v) => v > 0);
  const hasQuiz = (state.quizLog ?? []).length > 0;
  if (hasProgress || hasTrades || hasHoldings || hasQuiz) return;

  const now = new Date();
  state.profile = {
    full_name: 'Aether Power User',
    email: 'guest@aether.academy',
    joined_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 120).toISOString()
  };
  setProfileName(state.profile.full_name);

  const demoLessons = courses.flatMap((course) => course.lessons).slice(0, 8);
  demoLessons.forEach((lesson, idx) => {
    const score = 72 + (idx % 5) * 4;
    state.progress[lesson.id] = {
      completed: true,
      quiz_score: score,
      updated_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * (8 - idx)).toISOString()
    };
    state.quizScores[lesson.id] = score;
  });

  const topicSeed = quizTopics.slice(0, 4);
  topicSeed.forEach((topic, idx) => {
    const score = 68 + idx * 6;
    state.topicScores[topic.id] = score;
    state.quizLog.push({
      topicId: topic.id,
      topicTitle: topic.title,
      lessonId: topic.relatedLessons[0],
      lessonTitle: topic.title,
      score,
      passed: score >= passingScoreThreshold,
      ts: new Date(now.getTime() - 1000 * 60 * 60 * 12 * (idx + 1)).toISOString()
    });
  });

  state.quizLog = state.quizLog.slice(-50);

  state.sandbox.balance = 18450;
  state.sandbox.holdings = normalizeHoldings({
    ...state.sandbox.holdings,
    BTC: 0.45,
    ETH: 3.4,
    SOL: 18,
    USDT: 2400,
    AVAX: 30,
    LINK: 60
  });

  state.sandbox.history = [
    { type: 'buy', detail: 'Bought 0.25 BTC @ $62.2k', ts: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString() },
    { type: 'buy', detail: 'Added 1.5 ETH @ $3.1k', ts: new Date(now.getTime() - 1000 * 60 * 60 * 18).toISOString() },
    { type: 'sell', detail: 'Trimmed 200 LINK @ $14.1', ts: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString() },
    { type: 'buy', detail: 'Rotated 10 SOL @ $147', ts: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString() },
    { type: 'buy', detail: 'Hedged with 800 USDT', ts: new Date(now.getTime() - 1000 * 60 * 30).toISOString() }
  ];

  state.portfolioHistory = seedPortfolioSeries(22000);

  persistCache();
}

function persistCache() {
  try {
    const payload = {
      progress: state.progress,
      quizScores: state.quizScores,
      topicScores: state.topicScores,
      quizLog: state.quizLog,
      sandbox: state.sandbox,
      selectedQuizTopicId: state.selectedQuizTopicId
    };
    localStorage.setItem(cacheKey, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to persist cache', err);
  }
}

function resetHistorySnapshots() {
  state.priceHistory = seedPriceHistoryMap(state.prices);
  state.prices = Object.fromEntries(
    Object.entries(state.priceHistory).map(([symbol, series]) => [symbol, series[series.length - 1]?.value ?? 0])
  );
  state.portfolioHistory = seedPortfolioSeries(calculatePortfolioValue());
}

function formatCurrency(value) {
  return `€${Number(value ?? 0).toLocaleString('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  })}`;
}

function calculatePortfolioValue() {
  return (
    Number(state.sandbox.balance) +
    Object.entries(state.sandbox.holdings).reduce((total, [symbol, units]) => total + units * state.prices[symbol], 0)
  );
}

function currentBulletinBucket() {
  return Math.floor(Date.now() / bulletinRefreshMs);
}

function formatRelativeTime(ts) {
  const diffHours = Math.max(0, Math.round((Date.now() - ts) / (1000 * 60 * 60)));
  if (diffHours < 24) return `${Math.max(1, diffHours)}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.round(diffDays / 30);
  return `${diffMonths}mo ago`;
}

function refreshBulletins() {
  const bucket = currentBulletinBucket();
  if (state.bulletin.bucket === bucket && state.bulletin.items.length) return;
  const pool = sandboxBulletins.slice();
  const items = [];
  const count = Math.min(maxBulletins, pool.length);
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(seededRandom(bucket + i) * pool.length);
    const base = pool.splice(idx, 1)[0];
    const hourOffset = Math.floor(seededRandom(bucket * (i + 2)) * 6);
    const ts = Date.now() - hourOffset * 60 * 60 * 1000;
    items.push({ ...base, ts });
  }
  state.bulletin = { bucket, items };
}

function buildBulletinDriftMap() {
  const impacts = {};
  const items = state.bulletin.items ?? [];
  items.forEach((item, idx) => {
    const drift = item.drift ?? 0;
    if (!drift) return;
    const softened = drift * (1 - idx * 0.1);
    item.assets?.forEach((symbol) => {
      impacts[symbol] = (impacts[symbol] ?? 0) + softened;
    });
    if (!item.assets?.length) {
      assetSymbols.forEach((symbol) => {
        impacts[symbol] = (impacts[symbol] ?? 0) + softened * 0.6;
      });
    }
  });
  return impacts;
}

function findLesson(lessonId) {
  for (const course of courses) {
    const lesson = course.lessons.find((l) => l.id === lessonId);
    if (lesson) return { lesson, course };
  }
  return { lesson: null, course: null };
}

function findTopic(topicId) {
  return quizTopics.find((topic) => topic.id === topicId) ?? null;
}

function getLessonTitles(ids = []) {
  return ids
    .map((lessonId) => findLesson(lessonId).lesson?.title)
    .filter(Boolean);
}

function calculateUniqueStudyDays() {
  const days = new Set();
  Object.values(state.progress).forEach((entry) => {
    if (entry?.updated_at) {
      days.add(new Date(entry.updated_at).toDateString());
    }
  });
  state.quizLog.forEach((entry) => {
    if (entry?.ts) {
      days.add(new Date(entry.ts).toDateString());
    }
  });
  return days.size;
}

function getGamifiedStats() {
  const lessonsComplete = Object.values(state.progress).filter((p) => p.completed).length;
  const avgTopicScore = (() => {
    const values = Object.values(state.topicScores);
    if (!values.length) return 0;
    return Math.round(values.reduce((acc, val) => acc + val, 0) / values.length);
  })();
  const tradesLogged = state.sandbox.history.length;
  const xp = lessonsComplete * 120 + avgTopicScore * 3 + tradesLogged * 20;
  const ranks = [
    { label: 'Cadet', threshold: 0 },
    { label: 'Navigator', threshold: 800 },
    { label: 'Strategist', threshold: 1800 },
    { label: 'Oracle', threshold: 3200 },
    { label: 'Mythic', threshold: 5200 }
  ];
  const currentRank = ranks
    .slice()
    .reverse()
    .find((rank) => xp >= rank.threshold) ?? { label: 'Cadet', threshold: 0 };
  const nextRank = ranks.find((rank) => rank.threshold > currentRank.threshold);
  const xpIntoRank = xp - currentRank.threshold;
  const xpToNext = nextRank ? nextRank.threshold - currentRank.threshold : 1000;
  const meterPct = nextRank ? Math.min(100, (xpIntoRank / xpToNext) * 100) : 100;
  const streak = Math.min(30, calculateUniqueStudyDays());
  const questsCleared = Object.values(state.topicScores).filter((score) => score >= passingScoreThreshold).length;
  return {
    xp,
    rank: currentRank.label,
    toNext: nextRank ? Math.max(0, nextRank.threshold - xp) : 0,
    meterPct,
    streak,
    questsCleared
  };
}

function renderCourses() {
  const container = $('#course-list');
  if (!container) return;
  container.innerHTML = courses
    .map((course) => {
      const totalLessons = course.lessons.length;
      const completed = course.lessons.filter((lesson) => state.progress[lesson.id]?.completed).length;
      const isActive = course.lessons.some((lesson) => lesson.id === state.selectedLessonId);
      return `
        <article class="p-4 rounded-2xl border transition ${
          isActive ? 'border-white/40 bg-white/5' : 'border-white/5 bg-white/0'
        }">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-widest text-slate-400">${course.level}</p>
              <h3 class="text-xl font-semibold">${course.title}</h3>
            </div>
            <span class="badge">${course.badge}</span>
          </div>
          <p class="text-slate-400 text-sm mt-2">${course.description}</p>
          <div class="flex items-center justify-between mt-4 text-xs text-slate-400">
            <p>${completed}/${totalLessons} lessons</p>
            <button data-course="${course.id}" class="text-sky-300 hover:text-white" aria-label="View lessons">
              Open lessons
            </button>
          </div>
        </article>
      `;
    })
    .join('');

  container.querySelectorAll('button[data-course]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const course = courses.find((c) => c.id === btn.dataset.course);
      if (course) {
        const nextLesson = course.lessons.find((l) => !state.progress[l.id]?.completed) ?? course.lessons[0];
        setSelectedLesson(nextLesson.id);
      }
    });
  });
}

function setSelectedLesson(lessonId) {
  state.selectedLessonId = lessonId;
  renderLessonDetail();
  renderQuiz();
}

function renderLessonDetail() {
  const container = $('#lesson-detail');
  if (!container) return;
  const { lesson, course } = findLesson(state.selectedLessonId);
  if (!lesson) {
    container.innerHTML = '<p class="text-slate-400">Select a lesson to get started.</p>';
    return;
  }
  const progress = state.progress[lesson.id];
  const relatedTopics = quizTopics.filter((topic) => topic.relatedLessons.includes(lesson.id));
  const topicTags = relatedTopics
    .map((topic) => `<span class="mini-badge">${topic.title}</span>`)
    .join('');
  const completed = Boolean(progress?.completed);
  container.innerHTML = `
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-sm text-slate-400">${course?.title ?? 'Course'}</p>
        <h3 class="text-2xl font-semibold mt-1">${lesson.title}</h3>
        <p class="text-slate-400 text-sm">${lesson.duration} • ${lesson.summary}</p>
      </div>
      <div class="text-right">
        <p class="text-xs text-slate-400 uppercase tracking-[0.2em]">Quest tier</p>
        <p class="text-lg font-semibold">${course?.badge ?? 'Core'}</p>
      </div>
    </div>
    <div class="aspect-video rounded-2xl overflow-hidden border border-white/10">
      <iframe
        src="${lesson.videoUrl}"
        title="${lesson.title}"
        class="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
    <div class="rounded-2xl bg-white/5 p-4 space-y-2">
      <div class="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p class="${completed ? 'text-emerald-300' : 'text-slate-300'}">${
          completed ? 'Quest cleared' : 'Quest in progress'
        }</p>
        <p class="text-slate-400">${progress?.quiz_score ? `Last quiz: ${progress.quiz_score}%` : 'No quiz yet'}</p>
      </div>
      <div class="w-full h-2 rounded-full bg-white/10 overflow-hidden">
        <span class="block h-full bg-gradient-to-r from-sky-400 to-emerald-400" style="width: ${
          completed ? '100' : progress?.quiz_score ? Math.min(100, progress.quiz_score) : 12
        }%;"></span>
      </div>
      <div class="flex flex-wrap items-center gap-2 text-xs text-slate-300">${
        topicTags || '<span class="mini-badge">Core mastery</span>'
      }</div>
    </div>
  `;
  const completeBtn = $('#complete-lesson-btn');
  if (completeBtn) {
    completeBtn.disabled = completed;
    completeBtn.textContent = completed ? 'Lesson completed' : 'Mark lesson complete';
  }
}

function renderCurriculumSummary() {
  const container = $('#curriculum-progress');
  if (!container) return;
  const totalLessons = courses.reduce((acc, course) => acc + course.lessons.length, 0);
  const completed = Object.values(state.progress).filter((p) => p.completed).length;
  const percent = totalLessons ? Math.round((completed / totalLessons) * 100) : 0;
  const gamified = getGamifiedStats();
  const nextLesson = (() => {
    for (const course of courses) {
      const pending = course.lessons.find((lesson) => !state.progress[lesson.id]?.completed);
      if (pending) return { lesson: pending, course };
    }
    const fallback = courses[0]?.lessons[0];
    return fallback ? { lesson: fallback, course: courses[0] } : null;
  })();
  container.innerHTML = `
    <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <p class="text-sm text-slate-400">Overall progress</p>
        <h3 class="text-3xl font-semibold">${completed}/${totalLessons} lessons • ${percent}%</h3>
        <div class="w-full h-3 rounded-full bg-white/5 overflow-hidden mt-4">
          <span class="block h-full bg-gradient-to-r from-violet-400 via-sky-400 to-emerald-400" style="width: ${percent}%;"></span>
        </div>
        <p class="text-xs text-slate-400 mt-2">${gamified.rank} • ${gamified.xp.toLocaleString()} XP collected</p>
      </div>
      <div class="rounded-2xl bg-white/5 p-4 space-y-2 quest-panel">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-400">Up next</p>
            <p class="text-lg font-semibold">${nextLesson?.lesson.title ?? 'All lessons done!'}</p>
            <p class="text-sm text-slate-400">${nextLesson?.course.title ?? 'You can review any module.'}</p>
          </div>
          <span class="badge">${percent}%</span>
        </div>
        <div class="rounded-xl bg-white/10 p-3 text-sm">
          <p class="text-xs text-slate-400">Topic question bank</p>
          <p class="font-semibold">${totalQuizQuestions} questions ready</p>
        </div>
      </div>
    </div>
  `;
  renderLearningTracks();
  renderStrategyCards();
}

function renderLearningTracks() {
  const list = $('#learning-track-list');
  if (!list) return;
  list.innerHTML = learningTracks
    .map((track) => {
      const total = track.lessonIds.length;
      const done = track.lessonIds.filter((lessonId) => state.progress[lessonId]?.completed).length;
      const percent = total ? Math.round((done / total) * 100) : 0;
      return `
        <div class="rounded-2xl border border-white/10 p-4 space-y-2">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold">${track.name}</p>
              <p class="text-xs text-slate-400">${track.description}</p>
            </div>
            <span class="badge">${done}/${total}</span>
          </div>
          <div class="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <span class="block h-full bg-gradient-to-r from-sky-400 to-emerald-400" style="width: ${percent}%;"></span>
          </div>
          <button class="text-xs px-3 py-1 rounded-full border border-white/15 hover:border-white/40" data-track="${track.id}">
            Continue
          </button>
        </div>
      `;
    })
    .join('');
  list.querySelectorAll('button[data-track]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const track = learningTracks.find((t) => t.id === btn.dataset.track);
      if (!track) return;
      const next = track.lessonIds.find((lessonId) => !state.progress[lessonId]?.completed) ?? track.lessonIds[0];
      if (next) {
        state.selectedLessonId = next;
        renderLessonDetail();
        setView('curriculum');
      }
    });
  });
}

function renderStrategyCards() {
  const list = $('#strategy-card-list');
  if (!list) return;
  list.innerHTML = strategyCards
    .map(
      (card) => `
        <div class="rounded-2xl border border-white/10 p-4 space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold">${card.name}</p>
            <span class="mini-badge">${card.difficulty}</span>
          </div>
          <p class="text-sm text-slate-300">${card.description}</p>
          <p class="text-xs text-slate-400">${card.note}</p>
        </div>
      `
    )
    .join('');
}

function setQuizTopic(topicId) {
  if (!topicId || topicId === state.selectedQuizTopicId) return;
  state.selectedQuizTopicId = topicId;
  persistCache();
  renderQuiz();
  renderQuizTopics();
}

function renderQuizTopics() {
  const list = $('#quiz-topic-list');
  if (!list) return;
  if (!quizTopics.some((topic) => topic.id === state.selectedQuizTopicId)) {
    state.selectedQuizTopicId = quizTopics[0]?.id ?? null;
  }
  const quizTopicCountEl = $('#quiz-topic-count');
  if (quizTopicCountEl) {
    quizTopicCountEl.textContent = `${totalQuizQuestions} total questions`;
  }
  list.innerHTML = quizTopics
    .map((topic) => {
      const score = state.topicScores[topic.id];
      const lessonsCleared = topic.relatedLessons.filter((lessonId) => state.progress[lessonId]?.completed).length;
      const totalLessons = topic.relatedLessons.length;
      const active = topic.id === state.selectedQuizTopicId;
      return `
        <button data-topic="${topic.id}" class="topic-card ${active ? 'active' : ''}">
          <div class="flex items-center justify-between gap-3">
            <p class="font-semibold">${topic.title}</p>
            <span class="badge">${score != null ? `${score}%` : `${lessonsCleared}/${totalLessons}`}</span>
          </div>
          <p class="text-sm text-slate-400">${topic.summary}</p>
          <p class="text-xs text-slate-400">Linked lessons: ${lessonsCleared}/${totalLessons}</p>
        </button>
      `;
    })
    .join('');
  list.querySelectorAll('button[data-topic]').forEach((btn) => {
    btn.addEventListener('click', () => setQuizTopic(btn.dataset.topic));
  });
}

function renderQuiz() {
  const form = $('#quiz-form');
  if (!form) return;
  const chip = $('#quiz-score-chip');
  const topic = findTopic(state.selectedQuizTopicId) ?? quizTopics[0];
  if (!topic) {
    form.innerHTML = '<p class="text-slate-400">Add quiz topics to begin.</p>';
    chip?.classList.add('hidden');
    return;
  }
  state.selectedQuizTopicId = topic.id;
  const lessons = getLessonTitles(topic.relatedLessons);
  const topicName = $('#quiz-topic-name');
  if (topicName) topicName.textContent = topic.title;
  const topicDescription = $('#quiz-topic-description');
  if (topicDescription) topicDescription.textContent = topic.summary;
  const topicLessons = $('#quiz-topic-lessons');
  if (topicLessons) {
    topicLessons.textContent = lessons.length ? lessons.join(', ') : 'Core topics';
  }
  form.innerHTML = topic.questions
    .map((question, idx) => {
      return `
        <fieldset class="space-y-2">
          <legend class="font-medium">${idx + 1}. ${question.prompt}</legend>
          ${question.options
            .map(
              (option, optIdx) => `
                <label class="flex items-center gap-2 text-sm text-slate-200">
                  <input type="radio" name="${question.id}" value="${optIdx}" class="rounded-full" required />
                  <span>${option}</span>
                </label>
              `
            )
            .join('')}
        </fieldset>
      `;
    })
    .join('');
  if (chip) {
    const score = state.topicScores[topic.id];
    chip.textContent = score != null ? `${score}%` : 'Score';
    chip.classList.toggle('hidden', score == null);
  }
}

function renderQuizThresholdHint() {
  const hint = $('#quiz-threshold');
  if (!hint) return;
  const requirement = autoCompleteAfterQuiz
    ? `Choose a topic, clear all ${totalQuizQuestions} questions, and score ${passingScoreThreshold}%+ to auto-complete linked lessons.`
    : `Passing score is ${passingScoreThreshold}%. Use the complete button to finish the lesson after attempting a topic.`;
  hint.textContent = requirement;
}

function renderProgressList() {
  const container = $('#dashboard-progress');
  if (!container) return;
  const rows = courses
    .flatMap((course) =>
      course.lessons.map((lesson) => {
        const progress = state.progress[lesson.id];
        return {
          lesson,
          course,
          completed: progress?.completed ?? false,
          score: progress?.quiz_score
        };
      })
    )
    .map((entry) => {
      return `
        <div class="flex items-center justify-between border border-white/5 rounded-2xl p-4">
          <div>
            <p class="text-xs text-slate-400">${entry.course.title}</p>
            <p class="font-semibold">${entry.lesson.title}</p>
          </div>
          <div class="text-right text-sm">
            <p class="${entry.completed ? 'text-emerald-300' : 'text-slate-400'}">${
              entry.completed ? 'Complete' : 'Pending'
            }</p>
            <p class="text-slate-400">${entry.score != null ? `${entry.score}%` : 'No quiz'}</p>
          </div>
        </div>
      `;
    })
    .join('');
  container.innerHTML = rows;
}

function renderQuizLog() {
  const logContainer = $('#quiz-log');
  if (!logContainer) return;
  logContainer.innerHTML = state.quizLog
    .slice(-8)
    .reverse()
    .map(
      (entry) => {
        const passed = entry.passed ?? entry.score >= passingScoreThreshold;
        return `
        <div class="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2">
          <div>
            <p class="text-sm font-medium">${entry.topicTitle ?? entry.lessonTitle}</p>
            <p class="text-xs text-slate-400">${new Date(entry.ts).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-semibold">${entry.score}%</p>
            <p class="text-xs ${passed ? 'text-emerald-300' : 'text-rose-300'}">${
              passed ? 'Passed' : 'Retry'
            }</p>
          </div>
        </div>
      `;
      }
    )
    .join('');
}

function renderQuestBoard() {
  const questList = $('#quest-list');
  if (!questList) return;
  const lessonsComplete = Object.values(state.progress).filter((p) => p.completed).length;
  const topicsCleared = Object.values(state.topicScores).filter((score) => score >= passingScoreThreshold).length;
  const trades = state.sandbox.history.length;
  const quests = [
    { id: 'watch', label: 'Watch 3 lessons', current: lessonsComplete, target: 3, reward: '+150 XP' },
    { id: 'quiz', label: 'Pass 2 quizzes', current: topicsCleared, target: 2, reward: '+250 XP' },
    { id: 'trade', label: 'Execute 3 trades', current: trades, target: 3, reward: '+120 XP' }
  ];
  questList.innerHTML = quests
    .map((quest) => {
      const pct = Math.min(100, (quest.current / quest.target) * 100);
      const done = quest.current >= quest.target;
      return `
        <div class="quest-card ${done ? 'complete' : ''}">
          <div class="flex items-center justify-between text-sm">
            <p class="font-semibold">${quest.label}</p>
            <span class="badge">${quest.reward}</span>
          </div>
          <div class="flex items-center justify-between text-xs text-slate-400">
            <p>${Math.min(quest.current, quest.target)}/${quest.target}</p>
            <p>${done ? 'Claimed' : 'In progress'}</p>
          </div>
          <div class="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <span class="block h-full bg-gradient-to-r from-amber-400 to-emerald-400" style="width: ${pct}%;"></span>
          </div>
        </div>
      `;
    })
    .join('');
}

function renderDashboard() {
  const lessonsComplete = Object.values(state.progress).filter((p) => p.completed).length;
  $('#dashboard-lessons').textContent = lessonsComplete;
  const quizValues = Object.values(state.topicScores);
  const avg = quizValues.length ? Math.round(quizValues.reduce((acc, val) => acc + val, 0) / quizValues.length) : 0;
  $('#dashboard-quiz').textContent = `${avg}%`;
  $('#dashboard-sandbox').textContent = formatCurrency(calculatePortfolioValue());
  const gamified = getGamifiedStats();
  const xpRank = $('#xp-rank');
  if (xpRank) xpRank.textContent = gamified.rank;
  const xpPoints = $('#xp-points');
  if (xpPoints) xpPoints.textContent = `${gamified.xp.toLocaleString()} XP`;
  const xpMeter = $('#xp-meter-fill');
  if (xpMeter) xpMeter.style.width = `${gamified.meterPct}%`;
  const xpLabel = $('#xp-meter-label');
  if (xpLabel) {
    xpLabel.textContent = gamified.toNext
      ? `${gamified.toNext.toLocaleString()} XP to next rank`
      : 'Max rank reached';
  }
  const xpStreak = $('#xp-streak');
  if (xpStreak) xpStreak.textContent = `${gamified.streak} day${gamified.streak === 1 ? '' : 's'}`;
  const xpQuests = $('#xp-quests');
  if (xpQuests) xpQuests.textContent = `${gamified.questsCleared} cleared`;
  renderQuizLog();
  renderProgressList();
  renderQuestBoard();
}

function filterSeriesByTimeframe(series = [], timeframeKey = defaultTimeframe) {
  if (!series.length) return [];
  const selected = timeframeOptions.find((opt) => opt.key === timeframeKey) ?? timeframeOptions[0];
  if (selected.key === 'ALL') return series;
  if (selected.key === 'YTD') {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();
    return series.filter((point) => point.ts >= startOfYear);
  }
  if (!selected.ms) return series;
  const cutoff = Date.now() - selected.ms;
  return series.filter((point) => point.ts >= cutoff);
}

function drawLineChart(canvas, series, color, zoom = 1, inspector) {
  if (!canvas) return;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height) return;
  const dpr = window.devicePixelRatio ?? 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const points = series.length ? series : [{ value: 0, ts: Date.now() }];
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const center = points[points.length - 1]?.value ?? 0;
  const zoomRange = zoom > 1 ? Math.max(range / zoom, range * 0.15) : range;
  const zoomMin = zoom > 1 ? center - zoomRange / 2 : min;
  const zoomMax = zoom > 1 ? center + zoomRange / 2 : max;
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.beginPath();
  points.forEach((point, idx) => {
    const x = (idx / (points.length - 1 || 1)) * width;
    const y = height - ((point.value - zoomMin) / (zoomMax - zoomMin || 1)) * height;
    if (idx === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
  if (inspector) {
    const latest = points[points.length - 1];
    inspector.textContent = latest
      ? `${new Date(latest.ts).toLocaleString()} • ${formatCurrency(latest.value)}`
      : 'No data';
  }
}

function bindChartHover(canvas, series, inspector) {
  if (!canvas || !inspector) return;
  if (!series.length) {
    inspector.textContent = 'No data';
    return;
  }
  canvas.onmousemove = (event) => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const idx = Math.min(series.length - 1, Math.round(ratio * (series.length - 1)));
    const point = series[idx];
    inspector.textContent = `${new Date(point.ts).toLocaleString()} • ${formatCurrency(point.value)}`;
  };
  canvas.onmouseleave = () => {
    const latest = series[series.length - 1];
    inspector.textContent = latest
      ? `${new Date(latest.ts).toLocaleString()} • ${formatCurrency(latest.value)}`
      : 'No data';
  };
}

function updateTimeframeSelection(chartKey) {
  document.querySelectorAll(`[data-chart="${chartKey}"][data-timeframe]`).forEach((btn) => {
    const isActive = btn.dataset.timeframe === state.chartTimeframes[chartKey];
    btn.classList.toggle('bg-white/10', isActive);
    btn.classList.toggle('border-white/40', isActive);
  });
}

function bindTimeframeControls(containerId, chartKey) {
  const container = $(`#${containerId}`);
  if (!container) return;
  container.innerHTML = timeframeOptions
    .map(
      (option) => `
        <button
          type="button"
          class="px-3 py-1 rounded-full border border-white/15 text-xs text-slate-200 hover:border-white/40"
          data-chart="${chartKey}"
          data-timeframe="${option.key}"
        >
          ${option.label}
        </button>
      `
    )
    .join('');
  container.querySelectorAll('button[data-timeframe]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.chartTimeframes[chartKey] = btn.dataset.timeframe;
      updateTimeframeSelection(chartKey);
      renderSandboxCharts();
    });
  });
  updateTimeframeSelection(chartKey);
}

function bindZoomControls(containerId, chartKey) {
  const container = $(`#${containerId}`);
  if (!container) return;
  const adjustZoom = (delta) => {
    const next = Math.min(6, Math.max(1, state.chartZoom[chartKey] + delta));
    state.chartZoom[chartKey] = next;
    renderSandboxCharts();
  };
  container.querySelectorAll('[data-zoom]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.zoom;
      if (mode === 'in') adjustZoom(0.5);
      if (mode === 'out') adjustZoom(-0.5);
      if (mode === 'reset') {
        state.chartZoom[chartKey] = 1;
        renderSandboxCharts();
      }
    });
  });
}

function initChartControls() {
  bindTimeframeControls('portfolio-timeframe-controls', 'portfolio');
  bindTimeframeControls('asset-timeframe-controls', 'asset');
  bindZoomControls('portfolio-zoom-controls', 'portfolio');
  bindZoomControls('asset-zoom-controls', 'asset');
}

function renderSandboxCharts() {
  const portfolioSeries = filterSeriesByTimeframe(state.portfolioHistory, state.chartTimeframes.portfolio);
  drawLineChart($('#portfolio-chart'), portfolioSeries, '#34d399', state.chartZoom.portfolio, $('#portfolio-inspect'));
  bindChartHover($('#portfolio-chart'), portfolioSeries, $('#portfolio-inspect'));

  const assetSeries = filterSeriesByTimeframe(state.priceHistory[state.activeAsset] ?? [], state.chartTimeframes.asset);
  drawLineChart($('#asset-chart'), assetSeries, '#60a5fa', state.chartZoom.asset, $('#asset-inspect'));
  bindChartHover($('#asset-chart'), assetSeries, $('#asset-inspect'));
}

function renderBulletinBoard() {
  const container = $('#sandbox-bulletin');
  if (!container) return;
  refreshBulletins();
  const refreshLabel = $('#bulletin-refresh-label');
  if (refreshLabel) {
    const hours = Math.round(bulletinRefreshMs / (1000 * 60 * 60));
    refreshLabel.textContent = `Auto-updates ~${hours}h`;
  }
  const items = state.bulletin.items ?? [];
  container.innerHTML =
    items
      .map((item) => {
        const toneClass =
          item.sentiment === 'bullish'
            ? 'bg-emerald-500/20 text-emerald-100'
            : item.sentiment === 'bearish'
            ? 'bg-rose-500/20 text-rose-100'
            : item.sentiment === 'speculative'
            ? 'bg-amber-500/20 text-amber-100'
            : 'bg-sky-500/20 text-sky-100';
        const focusAssets = item.assets?.slice(0, 5).join(', ') ?? 'Market-wide';
        const driftLabel = item.drift
          ? `${item.drift > 0 ? '↗︎ +' : '↘︎ '}${(item.drift * 100).toFixed(1)}% tilt`
          : 'Neutral drift';
        return `
          <article data-article-id="${item.id}" class="rounded-2xl border border-white/10 bg-white/5 p-3 space-y-2 cursor-pointer hover:border-white/30 transition">
            <div class="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-slate-400">
              <span class="badge ${toneClass}">${item.sentiment}</span>
              <span>${formatRelativeTime(item.ts)}</span>
            </div>
            <p class="text-sm font-semibold">${item.title}</p>
            <p class="text-xs text-slate-300 leading-relaxed">${item.summary}</p>
            <div class="flex flex-wrap gap-2 text-[11px] text-slate-300">
              <span class="mini-badge">Focus: ${focusAssets}</span>
              <span class="mini-badge">Cue: ${item.impact}</span>
              <span class="mini-badge">Bias: ${driftLabel}</span>
            </div>
            <p class="text-[11px] text-sky-200">Open full brief →</p>
          </article>
        `;
      })
      .join('') || '<p class="text-slate-400 text-sm">Bulletins will refresh shortly.</p>';

  container.querySelectorAll('[data-article-id]').forEach((card) => {
    card.addEventListener('click', () => openBulletinArticle(card.dataset.articleId));
  });
}

function resolveBulletinArticle(id) {
  if (!id) return null;
  return state.bulletin.items.find((item) => item.id === id) || sandboxBulletins.find((item) => item.id === id) || null;
}

function openBulletinArticle(articleId) {
  if (!articleId) return;
  state.previousView = state.currentView;
  state.activeBulletinArticleId = articleId;
  setView('article');
  renderBulletinArticle();
}

function renderBulletinArticle() {
  const article = resolveBulletinArticle(state.activeBulletinArticleId);
  const titleEl = $('#bulletin-article-title');
  const summaryEl = $('#bulletin-article-summary');
  const assetsEl = $('#bulletin-article-assets');
  const effectEl = $('#bulletin-article-effect');
  const bodyEl = $('#bulletin-article-body');
  const badgeEl = $('#bulletin-article-sentiment');
  const timeEl = $('#bulletin-article-time');
  if (!titleEl || !summaryEl || !assetsEl || !effectEl || !bodyEl || !badgeEl || !timeEl) return;

  if (!article) {
    titleEl.textContent = 'Select a bulletin to open its full article';
    summaryEl.textContent = 'Click any headline in the sandbox bulletin board to read a deeper brief and the projected market tilt.';
    assetsEl.textContent = 'Focus assets: —';
    effectEl.textContent = 'Projected impact will appear here.';
    bodyEl.innerHTML = '<p class="text-sm text-slate-300">No article selected.</p>';
    badgeEl.textContent = 'Signals';
    badgeEl.className = 'badge';
    timeEl.textContent = '';
    return;
  }

  titleEl.textContent = article.title;
  summaryEl.textContent = article.summary;
  assetsEl.textContent = `Focus assets: ${article.assets?.join(', ') || 'Market-wide'}`;
  const projection = article.projection
    ? article.projection
    : article.drift
    ? `Expected ${(article.drift * 100).toFixed(1)}% ${article.drift > 0 ? 'upward' : 'downward'} tilt in sentiment-weighted ticks.`
    : 'Neutral baseline expected.';
  effectEl.textContent = projection;

  const paragraphs = article.articleBody?.length
    ? article.articleBody
    : [article.summary, article.impact, projection].filter(Boolean);
  bodyEl.innerHTML = paragraphs
    .map((p) => `<p class="text-sm text-slate-200 leading-relaxed">${p}</p>`)
    .join('');

  const toneClass =
    article.sentiment === 'bullish'
      ? 'bg-emerald-500/20 text-emerald-100'
      : article.sentiment === 'bearish'
      ? 'bg-rose-500/20 text-rose-100'
      : article.sentiment === 'speculative'
      ? 'bg-amber-500/20 text-amber-100'
      : 'bg-sky-500/20 text-sky-100';
  badgeEl.textContent = article.sentiment ?? 'Signal';
  badgeEl.className = `badge ${toneClass}`;
  timeEl.textContent = formatRelativeTime(article.ts ?? Date.now());
}

function computePortfolioInsights() {
  const totalValue = calculatePortfolioValue();
  const entries = Object.entries(state.sandbox.holdings || {}).filter(([, units]) => units > 0);
  const values = entries.map(([symbol, units]) => ({ symbol, value: units * (state.prices[symbol] ?? 0) }));
  const top = values.sort((a, b) => b.value - a.value)[0];
  const concentration = totalValue && top ? `${Math.round((top.value / totalValue) * 100)}% in ${top.symbol}` : 'No holdings';
  const series = filterSeriesByTimeframe(state.portfolioHistory, state.chartTimeframes.portfolio);
  const returns = [];
  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1].value;
    const cur = series[i].value;
    if (prev) returns.push((cur - prev) / prev);
  }
  const vol = computeStdDev(returns);
  const volLabel = vol < 0.005 ? 'Low' : vol < 0.015 ? 'Moderate' : 'High';
  const risk = vol < 0.005 ? 'Conservative' : vol < 0.015 ? 'Moderate' : 'Aggressive';
  return { concentration, volatility: volLabel, risk };
}

function renderPortfolioInsights() {
  const insight = computePortfolioInsights();
  const riskEl = $('#insight-risk');
  const concEl = $('#insight-concentration');
  const volEl = $('#insight-volatility');
  if (!riskEl || !concEl || !volEl) return;
  riskEl.textContent = insight.risk;
  concEl.textContent = insight.concentration;
  volEl.textContent = insight.volatility;
}

function updateTradeAssistant() {
  const tipEl = $('#trade-assistant-text');
  if (!tipEl) return;
  const holdings = Object.entries(state.sandbox.holdings || {}).filter(([, units]) => units > 0);
  const totalValue = calculatePortfolioValue();
  const activePriceHistory = state.priceHistory[state.activeAsset] ?? [];
  const latest = activePriceHistory.slice(-5);
  const vol = computeStdDev(
    latest.map((point, idx) => {
      if (idx === 0) return 0;
      const prev = latest[idx - 1].value;
      return prev ? (point.value - prev) / prev : 0;
    })
  );
  const concentration = holdings.sort((a, b) => b[1] - a[1]).slice(0, 1);
  if (vol > 0.02) {
    tipEl.textContent = 'High volatility increases both risk and potential reward. Consider your position sizing.';
  } else if (concentration.length && totalValue) {
    const symbol = concentration[0][0];
    tipEl.textContent = `A big share of your simulated portfolio sits in ${symbol}. Diversification reduces single-asset swings.`;
  } else if (holdings.length < 1) {
    tipEl.textContent = 'Start with small position sizes and review the sentiment pulse before placing trades.';
  } else {
    tipEl.textContent = 'Avoid trading solely on short-term spikes; combine news cues with your timeframe of choice.';
  }
}

function renderSandbox() {
  const portfolioValue = calculatePortfolioValue();
  $('#sandbox-balance').textContent = formatCurrency(state.sandbox.balance);
  $('#sandbox-portfolio-value').textContent = formatCurrency(portfolioValue);
  const holdingsContainer = $('#sandbox-holdings');
  const historyContainer = $('#sandbox-history');
  const holdingsEntries = Object.entries(state.sandbox.holdings)
    .filter(([, units]) => units > 0)
    .map(([symbol, units]) => {
      const price = state.prices[symbol];
      const value = units * price;
      return `
        <div class="flex items-center justify-between border border-white/5 rounded-2xl px-3 py-2">
          <div>
            <p class="text-sm font-semibold">${symbol}</p>
            <p class="text-xs text-slate-400">${units.toFixed(4)} units</p>
          </div>
          <p class="text-sm font-semibold">${formatCurrency(value)}</p>
        </div>
      `;
    })
    .join('');
  holdingsContainer.innerHTML = holdingsEntries || '<p class="text-slate-400 text-sm">No holdings yet</p>';

  const historyMarkup = state.sandbox.history
    .slice(-8)
    .reverse()
    .map(
      (entry) =>
        `<p>${new Date(entry.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${entry.type} • ${entry.detail}</p>`
    )
    .join('');
  historyContainer.innerHTML = historyMarkup || '<p class="text-slate-400 text-sm">No trades yet</p>';

  renderBulletinBoard();
  renderSentiment();

  const activeAsset = state.prices[state.activeAsset] != null ? state.activeAsset : assetSymbols[0];
  state.activeAsset = activeAsset;
  const activeHistory = state.priceHistory[activeAsset] ?? [];
  const activePrice = state.prices[activeAsset];
  const activePrev = activeHistory.length > 1 ? activeHistory[activeHistory.length - 2]?.value : activePrice;
  const activeChange = activePrev ? ((activePrice - activePrev) / activePrev) * 100 : 0;
  const activeUnits = state.sandbox.holdings[activeAsset] ?? 0;
  const activeValueShare = portfolioValue ? (activeUnits * activePrice / portfolioValue) * 100 : 0;
  $('#active-asset-label').textContent = activeAsset;
  $('#active-asset-price').textContent = formatCurrency(activePrice);
  const changeBadge = $('#active-asset-change');
  if (changeBadge) {
    changeBadge.textContent = `${activeChange >= 0 ? '+' : ''}${activeChange.toFixed(2)}%`;
    changeBadge.className = `badge ${
      activeChange >= 0 ? 'bg-emerald-500/20 text-emerald-100' : 'bg-rose-500/20 text-rose-100'
    }`;
  }
  $('#active-asset-units').textContent = activeUnits.toFixed(4);
  $('#active-asset-share').textContent = `${activeValueShare.toFixed(2)}%`;
  const pricesContainer = $('#sandbox-prices');
  if (pricesContainer) {
    const entries = Object.entries(state.prices);
    const visibleEntries = (state.ui?.showAllAssets ? entries : entries.slice(0, maxVisibleAssets)) || entries;
    pricesContainer.innerHTML = visibleEntries
      .map(([symbol, price]) => {
        const history = state.priceHistory[symbol] ?? [];
        const prev = history.length > 1 ? history[history.length - 2]?.value : price;
        const changePct = prev ? ((price - prev) / prev) * 100 : 0;
        return `
          <button data-asset="${symbol}" class="w-full flex items-center justify-between border rounded-2xl px-4 py-3 ${
            state.activeAsset === symbol ? 'border-white/40 bg-white/5' : 'border-white/10 bg-white/0'
          }">
            <div>
              <p class="text-sm font-semibold">${symbol}</p>
              <p class="text-xs text-slate-400">${formatCurrency(price)}</p>
            </div>
            <p class="text-sm font-semibold ${changePct >= 0 ? 'text-emerald-300' : 'text-rose-300'}">
              ${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%
            </p>
          </button>
        `;
      })
      .join('');
    pricesContainer.querySelectorAll('button[data-asset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activeAsset = btn.dataset.asset;
        renderSandbox();
        requestAnimationFrame(renderSandboxCharts);
        updateTradeAssistant();
      });
    });
    const toggleBtn = $('#asset-toggle');
    if (toggleBtn) {
      toggleBtn.textContent = state.ui?.showAllAssets ? 'Show less' : 'Show more';
      toggleBtn.onclick = () => {
        state.ui.showAllAssets = !state.ui.showAllAssets;
        renderSandbox();
      };
    }
  }

  updateTradeAssistant();
  renderPortfolioInsights();
  requestAnimationFrame(renderSandboxCharts);
}

async function handleSignup(event) {
  event.preventDefault();
  if (!supabaseClient) {
    showToast('Configure Supabase to enable sign up.', 'error');
    return;
  }
  const email = $('#signup-email').value.trim();
  const password = $('#signup-password').value.trim();
  const name = $('#signup-name').value.trim();
  const { error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name }
    }
  });
  if (error) {
    showToast(error.message, 'error');
    return;
  }
  showToast('Check your inbox to confirm your account.', 'success');
  event.target.reset();
}

async function handleLogin(event) {
  event.preventDefault();
  if (!supabaseClient) {
    showToast('Configure Supabase to enable login.', 'error');
    return;
  }
  const email = $('#login-email').value.trim();
  const password = $('#login-password').value.trim();
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    showToast(error.message, 'error');
    return;
  }
  showToast('Signed in successfully', 'success');
  event.target.reset();
}

async function handleGoogle() {
  if (!supabaseClient) {
    showToast('Configure Supabase first', 'error');
    return;
  }
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: supabaseConfig.googleRedirectTo ?? window.location.origin
    }
  });
  if (error) showToast(error.message, 'error');
}

async function handleLogout() {
  if (!supabaseClient) {
    showToast('You are in local-only mode.', 'info');
    return;
  }
  await supabaseClient.auth.signOut();
}

async function handleMarkComplete() {
  const { lesson } = findLesson(state.selectedLessonId);
  if (!lesson) return;
  if (!state.user) {
    showToast('Login to track progress in Supabase.', 'error');
  }
  state.progress[lesson.id] = {
    completed: true,
    quiz_score: state.quizScores[lesson.id] ?? null,
    updated_at: new Date().toISOString()
  };
  persistCache();
  renderLessonDetail();
  renderCurriculumSummary();
  renderDashboard();
  if (supabaseClient && state.user) {
    await supabaseClient.from('lesson_progress').upsert({
      user_id: state.user.id,
      lesson_id: lesson.id,
      completed: true,
      quiz_score: state.quizScores[lesson.id] ?? null
    });
  }
}

async function handleQuizSubmit(event) {
  event.preventDefault();
  const topic = findTopic(state.selectedQuizTopicId) ?? quizTopics[0];
  if (!topic) return;
  const formData = new FormData($('#quiz-form'));
  let correct = 0;
  topic.questions.forEach((question) => {
    const response = Number(formData.get(question.id));
    if (response === question.answer) correct += 1;
  });
  const score = Math.round((correct / topic.questions.length) * 100);
  const passed = score >= passingScoreThreshold;
  const now = new Date().toISOString();
  state.topicScores[topic.id] = score;
  topic.relatedLessons.forEach((lessonId) => {
    const previous = state.progress[lessonId] ?? {};
    state.quizScores[lessonId] = score;
    state.progress[lessonId] = {
      completed: autoCompleteAfterQuiz && passed ? true : Boolean(previous.completed),
      quiz_score: score,
      updated_at: now
    };
  });
  const primaryLessonId = topic.relatedLessons[0] ?? state.selectedLessonId;
  const { lesson: primaryLesson } = findLesson(primaryLessonId);
  state.quizLog.push({
    topicId: topic.id,
    topicTitle: topic.title,
    lessonId: primaryLessonId,
    lessonTitle: primaryLesson?.title ?? topic.title,
    score,
    passed,
    ts: now
  });
  state.quizLog = state.quizLog.slice(-40);
  persistCache();
  renderQuiz();
  renderQuizTopics();
  renderCurriculumSummary();
  renderDashboard();
  if (state.user && supabaseClient) {
    await Promise.all([
      primaryLessonId
        ? supabaseClient.from('quiz_attempts').insert({
            user_id: state.user.id,
            lesson_id: primaryLessonId,
            score,
            passed
          })
        : null,
      topic.relatedLessons.length
        ? supabaseClient.from('lesson_progress').upsert(
            topic.relatedLessons.map((lessonId) => ({
              user_id: state.user.id,
              lesson_id: lessonId,
              completed: state.progress[lessonId]?.completed ?? false,
              quiz_score: score
            }))
          )
        : null
    ]);
  }
  const toastMsg = passed
    ? `You scored ${score}% on ${topic.title} and cleared the ${passingScoreThreshold}% threshold.`
    : `You scored ${score}% on ${topic.title}. ${passingScoreThreshold}% is needed to pass.`;
  showToast(toastMsg, passed ? 'success' : 'info');
}

function recordPriceSnapshot() {
  Object.keys(state.prices).forEach((symbol) => {
    if (!state.priceHistory[symbol]) state.priceHistory[symbol] = [];
    state.priceHistory[symbol].push({ ts: Date.now(), value: state.prices[symbol] });
    state.priceHistory[symbol] = state.priceHistory[symbol].slice(-historyLimit);
  });
}

function recordPortfolioSnapshot() {
  state.portfolioHistory.push({ ts: Date.now(), value: calculatePortfolioValue() });
  state.portfolioHistory = state.portfolioHistory.slice(-historyLimit);
}

function computeStdDev(values = []) {
  if (!values.length) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function buildScenarioDriftMap() {
  const map = {};
  const scenario = state.sandbox.activeScenario;
  if (!scenario || !scenario.impact) return map;
  if (state.sandbox.scenarioTicks <= 0) {
    state.sandbox.activeScenario = null;
    return map;
  }
  state.sandbox.scenarioTicks -= 1;
  const { affectedAssets = [], shockMagnitude = 0 } = scenario.impact;
  const targets = affectedAssets.includes('ALT_BASKET')
    ? [...assetSymbols.filter((sym) => sym !== 'BTC' && sym !== 'ETH' && !sym.startsWith('USD')), ...affectedAssets]
    : affectedAssets;
  targets.forEach((symbol) => {
    if (symbol === 'ALT_BASKET') return;
    map[symbol] = (map[symbol] ?? 0) + shockMagnitude;
  });
  return map;
}

function computeSentimentPulse() {
  const series = filterSeriesByTimeframe(state.portfolioHistory, state.chartTimeframes.portfolio) || [];
  if (series.length < 4) {
    return { label: 'Neutral', fg: 50, volatilityLabel: 'Medium', description: 'Awaiting more simulated history.' };
  }
  const first = series[0].value;
  const last = series[series.length - 1].value;
  const change = first ? (last - first) / first : 0;
  const returns = [];
  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1].value;
    const cur = series[i].value;
    if (prev) returns.push((cur - prev) / prev);
  }
  const vol = computeStdDev(returns);
  const fg = Math.max(0, Math.min(100, Math.round(50 + change * 800 - vol * 2000)));
  const label = change > 0.03 ? 'Bullish' : change < -0.03 ? 'Bearish' : 'Neutral';
  const volatilityLabel = vol < 0.005 ? 'Low' : vol < 0.015 ? 'Medium' : 'High';
  return {
    label,
    fg,
    volatilityLabel,
    description: label === 'Bullish' ? 'Positive drift in your simulated portfolio.' : label === 'Bearish' ? 'Downward tilt detected.' : 'Sideways chop with balanced sentiment.'
  };
}

function renderSentiment() {
  const pulse = computeSentimentPulse();
  const labelEl = $('#sentiment-label');
  const fgEl = $('#sentiment-fg');
  const volEl = $('#sentiment-volatility');
  const descEl = $('#sentiment-description');
  if (!labelEl || !fgEl || !volEl || !descEl) return;
  labelEl.textContent = pulse.label;
  labelEl.className = `badge ${
    pulse.label === 'Bullish'
      ? 'bg-emerald-500/20 text-emerald-100'
      : pulse.label === 'Bearish'
      ? 'bg-rose-500/20 text-rose-100'
      : 'bg-sky-500/20 text-sky-100'
  }`;
  fgEl.textContent = `${pulse.fg} / 100`;
  volEl.textContent = pulse.volatilityLabel;
  descEl.textContent = pulse.description;
}

function tickPrices() {
  const driftMap = { ...buildBulletinDriftMap() };
  const scenarioMap = buildScenarioDriftMap();
  Object.keys(scenarioMap).forEach((symbol) => {
    driftMap[symbol] = (driftMap[symbol] ?? 0) + scenarioMap[symbol];
  });
  Object.keys(state.prices).forEach((symbol) => {
    const drift = driftMap[symbol] ?? 0;
    state.prices[symbol] = randomizePrice(state.prices[symbol], drift);
  });
  recordPriceSnapshot();
  recordPortfolioSnapshot();
  renderSandbox();
  renderDashboard();
  renderSentiment();
  renderPortfolioInsights();
}

function startPriceLoop() {
  tickPrices();
  setInterval(() => {
    tickPrices();
  }, featureToggles.sandboxPriceUpdateMs ?? 8000);
}

function recordTrade(entry) {
  state.sandbox.history.push({ ...entry, ts: new Date().toISOString() });
  state.sandbox.history = state.sandbox.history.slice(-50);
}

function renderAssetSelects() {
  const options = assetSymbols.map((symbol) => `<option value="${symbol}">${symbol}</option>`).join('');
  ['buy-asset', 'sell-asset'].forEach((id) => {
    const select = $(`#${id}`);
    if (select) {
      select.innerHTML = options;
    }
  });
}

function renderEventSelect() {
  const select = $('#event-select');
  if (!select) return;
  select.innerHTML = ['<option value="">Choose a scenario…</option>',
    ...eventScenarios.map((scenario) => `<option value="${scenario.id}">${scenario.name}</option>`)
  ].join('');
}

function handleScenarioChange(event) {
  const scenarioId = event.target.value;
  const desc = $('#event-description');
  if (!scenarioId) {
    state.sandbox.activeScenario = null;
    state.sandbox.scenarioTicks = 0;
    if (desc) desc.textContent = 'Select a scenario to simulate its impact on your sandbox prices.';
    return;
  }
  const scenario = eventScenarios.find((s) => s.id === scenarioId);
  if (!scenario) return;
  state.sandbox.activeScenario = scenario;
  state.sandbox.scenarioTicks = scenario.impact?.duration ?? 5;
  if (desc) desc.textContent = scenario.description;
  showToast(`Scenario applied: ${scenario.name}`, 'info');
}

async function syncSandbox() {
  state.sandbox.holdings = normalizeHoldings(state.sandbox.holdings);
  persistCache();
  recordPortfolioSnapshot();
  renderSandbox();
  renderDashboard();
  if (state.user && supabaseClient) {
    await supabaseClient.from('sandbox_state').upsert({
      user_id: state.user.id,
      balance: state.sandbox.balance,
      holdings: state.sandbox.holdings,
      history: state.sandbox.history
    });
  }
}

function openTradeConfirm(summary, trade) {
  const modal = $('#trade-confirm-modal');
  const summaryEl = $('#trade-confirm-summary');
  if (!modal || !summaryEl) return;
  summaryEl.textContent = summary;
  state.pendingTrade = trade;
  modal.classList.remove('hidden');
}

function closeTradeConfirm() {
  const modal = $('#trade-confirm-modal');
  if (modal) modal.classList.add('hidden');
  state.pendingTrade = null;
}

async function executeTrade(trade) {
  if (!trade) return;
  if (trade.side === 'BUY') {
    state.sandbox.balance -= trade.amount;
    state.sandbox.holdings[trade.asset] = (state.sandbox.holdings[trade.asset] ?? 0) + trade.units;
    recordTrade({ type: 'BUY', detail: `${trade.asset} @ ${trade.price.toFixed(2)} (${trade.units.toFixed(4)} units)` });
  } else {
    state.sandbox.balance += trade.amount;
    state.sandbox.holdings[trade.asset] = Math.max(0, (state.sandbox.holdings[trade.asset] ?? 0) - trade.units);
    recordTrade({ type: 'SELL', detail: `${trade.asset} @ ${trade.price.toFixed(2)} (${trade.units.toFixed(4)} units)` });
  }
  await syncSandbox();
  closeTradeConfirm();
  if (trade.side === 'BUY') $('#buy-form')?.reset();
  if (trade.side === 'SELL') $('#sell-form')?.reset();
  showToast(`${trade.side === 'BUY' ? 'Purchase' : 'Sale'} executed`, 'success');
  updateTradeAssistant();
}

async function handleBuy(event) {
  event.preventDefault();
  const amount = Number($('#buy-amount').value);
  const asset = $('#buy-asset').value;
  if (!state.prices[asset]) {
    showToast('Select a supported asset', 'error');
    return;
  }
  if (amount <= 0 || amount > state.sandbox.balance) {
    showToast('Insufficient balance', 'error');
    return;
  }
  const price = state.prices[asset];
  const units = amount / price;
  const nextBalance = state.sandbox.balance - amount;
  openTradeConfirm(`Buy ${units.toFixed(4)} ${asset} at ${formatCurrency(price)} (est. total ${formatCurrency(amount)}). New cash balance: ${formatCurrency(nextBalance)}.`, {
    side: 'BUY',
    asset,
    amount,
    price,
    units
  });
}

async function handleSell(event) {
  event.preventDefault();
  const units = Number($('#sell-amount').value);
  const asset = $('#sell-asset').value;
  if (!state.prices[asset]) {
    showToast('Select a supported asset', 'error');
    return;
  }
  if (!state.sandbox.holdings[asset]) {
    showToast('No holdings for this asset', 'error');
    return;
  }
  if (units <= 0 || units > state.sandbox.holdings[asset]) {
    showToast('Not enough units to sell', 'error');
    return;
  }
  const price = state.prices[asset];
  const amount = units * price;
  const nextBalance = state.sandbox.balance + amount;
  openTradeConfirm(`Sell ${units.toFixed(4)} ${asset} at ${formatCurrency(price)} (est. ${formatCurrency(amount)}). New cash balance: ${formatCurrency(nextBalance)}.`, {
    side: 'SELL',
    asset,
    amount,
    price,
    units
  });
}

async function ensureProfile(user) {
  if (!supabaseClient || !user) return;
  const { data, error } = await supabaseClient.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (error) {
    console.warn(error);
  }
  if (!data) {
    const fallbackName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Learner';
    const { data: inserted } = await supabaseClient
      .from('profiles')
      .upsert({ id: user.id, full_name: fallbackName })
      .select()
      .maybeSingle();
    state.profile = inserted;
  } else {
    state.profile = data;
  }
  setProfileName(state.profile?.full_name ?? 'Learner');
}

async function fetchProgress() {
  if (!supabaseClient || !state.user) return;
  const { data } = await supabaseClient
    .from('lesson_progress')
    .select('lesson_id, completed, quiz_score, updated_at')
    .eq('user_id', state.user.id);
  if (!data) return;
  data.forEach((row) => {
    state.progress[row.lesson_id] = {
      completed: row.completed,
      quiz_score: row.quiz_score,
      updated_at: row.updated_at
    };
    if (row.quiz_score != null) {
      state.quizScores[row.lesson_id] = row.quiz_score;
    }
  });
  quizTopics.forEach((topic) => {
    const scores = topic.relatedLessons
      .map((lessonId) => state.progress[lessonId]?.quiz_score)
      .filter((score) => score != null);
    if (scores.length) {
      state.topicScores[topic.id] = Math.round(scores.reduce((acc, val) => acc + val, 0) / scores.length);
    }
  });
}

async function fetchQuizLog() {
  if (!supabaseClient || !state.user) return;
  const { data } = await supabaseClient
    .from('quiz_attempts')
    .select('lesson_id, score, passed, created_at')
    .eq('user_id', state.user.id)
    .order('created_at', { ascending: false })
    .limit(15);
  if (!data) return;
  state.quizLog = data.map((row) => {
    const { lesson } = findLesson(row.lesson_id);
    return {
      lessonId: row.lesson_id,
      lessonTitle: lesson?.title ?? row.lesson_id,
      score: row.score,
      passed: row.passed ?? row.score >= passingScoreThreshold,
      ts: row.created_at
    };
  });
}

async function fetchSandbox() {
  if (!supabaseClient || !state.user) return;
  const { data } = await supabaseClient
    .from('sandbox_state')
    .select('balance, holdings, history')
    .eq('user_id', state.user.id)
    .maybeSingle();
  if (!data) {
    await supabaseClient.from('sandbox_state').upsert({ user_id: state.user.id, ...deepClone(defaultSandboxState) });
    state.sandbox = {
      balance: Number(defaultSandboxState.balance),
      holdings: normalizeHoldings(defaultSandboxState.holdings),
      history: defaultSandboxState.history ?? []
    };
  } else {
    state.sandbox = {
      balance: Number(data.balance ?? defaultSandboxState.balance),
      holdings: normalizeHoldings(data.holdings ?? {}),
      history: data.history ?? []
    };
  }
  resetHistorySnapshots();
}

function enterAppShell() {
  $('#view-auth').classList.add('hidden');
  $('#app-shell').classList.remove('hidden');
  setView(state.currentView ?? 'dashboard');
}

function exitAppShell() {
  $('#app-shell').classList.add('hidden');
  $('#view-auth').classList.remove('hidden');
}

function setView(view) {
  state.currentView = view;
  document.querySelectorAll('.app-view').forEach((section) => {
    section.classList.toggle('hidden', section.id !== `view-${view}`);
  });
  document.querySelectorAll('[data-view]').forEach((btn) => {
    const isActive = btn.dataset.view === view;
    btn.classList.toggle('active', isActive);
  });
  if (view === 'sandbox') {
    requestAnimationFrame(renderSandboxCharts);
  }
  if (view === 'article') {
    renderBulletinArticle();
  }
}

function bindNavigation() {
  document.querySelectorAll('[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => setView(btn.dataset.view));
  });
  document.querySelectorAll('[data-view-target]').forEach((btn) => {
    btn.addEventListener('click', () => setView(btn.dataset.viewTarget));
  });
}

function toggleDemoHint() {
  const hint = $('#demo-hint');
  if (!hint) return;
  hint.classList.toggle('hidden', Boolean(supabaseClient));
}

function handleDemoEntry(auto = false) {
  if (demoEntered) return;
  demoEntered = true;
  state.previewMode = true;
  setProfileName('Guest');
  enterAppShell();
  if (!auto) {
    showToast('Demo mode: progress is stored locally.', 'info');
  }
}

function reloadSoon() {
  setTimeout(() => window.location.reload(), 900);
}

function initBackendSettingsPanel() {
  const urlInput = $('#supabase-url-input');
  const keyInput = $('#supabase-key-input');
  const redirectInput = $('#supabase-redirect-input');
  const saveBtn = $('#backend-save');
  const resetBtn = $('#backend-reset');
  if (!urlInput || !keyInput || !saveBtn) return;
  const overrides = getSupabaseOverrides();
  urlInput.value = overrides.url || supabaseConfig.url || '';
  keyInput.value = overrides.anonKey || supabaseConfig.anonKey || '';
  if (redirectInput) {
    redirectInput.value = overrides.googleRedirectTo || supabaseConfig.googleRedirectTo || window.location.origin;
  }
  saveBtn.addEventListener('click', () => {
    const url = urlInput.value.trim();
    const anonKey = keyInput.value.trim();
    if (!url || !anonKey) {
      showToast('Enter a Supabase URL and anon key.', 'error');
      return;
    }
    persistSupabaseOverrides({
      url,
      anonKey,
      googleRedirectTo: redirectInput?.value?.trim() || window.location.origin
    });
    showToast('Supabase credentials saved. Reloading...', 'success');
    reloadSoon();
  });
  resetBtn?.addEventListener('click', () => {
    clearSupabaseOverrides();
    showToast('Demo mode restored. Reloading...', 'info');
    reloadSoon();
  });
}

function bindEvents() {
  $('#signup-form')?.addEventListener('submit', handleSignup);
  $('#login-form')?.addEventListener('submit', handleLogin);
  $('#google-auth')?.addEventListener('click', handleGoogle);
  $('#logout-btn')?.addEventListener('click', handleLogout);
  $('#complete-lesson-btn')?.addEventListener('click', handleMarkComplete);
  $('#submit-quiz')?.addEventListener('click', handleQuizSubmit);
  $('#buy-form')?.addEventListener('submit', handleBuy);
  $('#sell-form')?.addEventListener('submit', handleSell);
  $('#refresh-courses')?.addEventListener('click', renderCourses);
  $('#enter-demo')?.addEventListener('click', handleDemoEntry);
  $('#bulletin-article-back')?.addEventListener('click', () => setView(state.previousView || 'sandbox'));
  $('#trade-confirm-cancel')?.addEventListener('click', closeTradeConfirm);
  $('#trade-confirm-accept')?.addEventListener('click', () => executeTrade(state.pendingTrade));
  $('#event-select')?.addEventListener('change', handleScenarioChange);
  bindNavigation();
}

async function bootstrapUser() {
  if (!supabaseClient) return;
  const { data } = await supabaseClient.auth.getSession();
  if (data?.session) {
    state.user = data.session.user;
    $('#logout-btn').classList.remove('hidden');
    await ensureProfile(state.user);
    await fetchProgress();
    await fetchQuizLog();
    await fetchSandbox();
    persistCache();
    state.previewMode = false;
    enterAppShell();
    renderCurriculumSummary();
    renderLessonDetail();
    renderQuizTopics();
    renderQuiz();
    renderSandbox();
    renderDashboard();
  }
}

function initAuthListener() {
  if (!supabaseClient) return;
  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    state.user = session?.user ?? null;
    if (state.user) {
      $('#logout-btn').classList.remove('hidden');
      state.previewMode = false;
      await ensureProfile(state.user);
      await fetchProgress();
      await fetchQuizLog();
      await fetchSandbox();
      persistCache();
      enterAppShell();
    } else {
      $('#logout-btn').classList.add('hidden');
      state.profile = null;
      setProfileName('Guest');
      if (!state.previewMode) {
        exitAppShell();
      }
    }
    renderCurriculumSummary();
    renderLessonDetail();
    renderQuizTopics();
    renderQuiz();
    renderSandbox();
    renderDashboard();
  });
}

function init() {
  const skeleton = $('#loading-skeleton');
  if (skeleton) {
    skeleton.classList.remove('hidden');
    setTimeout(() => skeleton.classList.add('hidden'), 500);
  }
  setProfileName('Guest');
  hydrateCache();
  seedDemoStateIfEmpty();
  if (!supabaseClient || FORCE_DEMO_MODE) {
    handleDemoEntry(true);
  }
  setTimeout(() => {
    if (!demoEntered) {
      handleDemoEntry(true);
    }
  }, 1200);
  resetHistorySnapshots();
  renderCourses();
  renderCurriculumSummary();
  renderLessonDetail();
  renderQuizTopics();
  renderQuiz();
  renderQuizThresholdHint();
  renderAssetSelects();
  renderEventSelect();
  initChartControls();
  renderSandbox();
  renderDashboard();
  bindEvents();
  startPriceLoop();
  initAuthListener();
  bootstrapUser();
  toggleDemoHint();
  updateBackendStatus();
  initBackendSettingsPanel();
}

window.addEventListener('DOMContentLoaded', init);
