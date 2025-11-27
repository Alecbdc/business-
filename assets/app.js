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
import { state, hydrateStateFromCache, persistStateToCache } from './modules/state.js';
import { $, bind, setView as applyView, showToast, formatCurrency, setProfileName, setText } from './modules/ui.js';
import {
  initChartControls,
  renderSandboxCharts,
  filterSeriesByTimeframe,
  timeframeOptions,
  renderLineChart,
  renderMarketLabCharts
} from './modules/charts.js';
import { updateBackendStatus, initBackendSettingsPanel } from './modules/backendPanel.js';

function showSkeleton() {
  const el = document.querySelector('#loading-skeleton');
  if (el) el.classList.remove('hidden');
}

function hideSkeleton() {
  const el = document.querySelector('#loading-skeleton');
  if (el) el.classList.add('hidden');
}

const {
  courses,
  defaultSandboxState,
  initialPrices,
  assetSegments,
  assetFundamentals,
  quizTopics,
  sandboxBulletins,
  cryptoBulletins,
  marketLabBulletins,
  marketScenarioLevels,
  leaderboardPeers
} = data;

const pendingScenarioKey = 'aetherPendingScenarioStart';
const suppressScenarioAutoStartKey = 'aetherSuppressScenarioAutoStart';

const historyLimit = 1200;
const assetSymbols = Object.keys(initialPrices);
const totalQuizQuestions = quizTopics.reduce((acc, topic) => acc + topic.questions.length, 0);
const passingScoreThreshold = Number(featureToggles.passingScore ?? 70);
const autoCompleteAfterQuiz = featureToggles.autoMarkCompleteAfterQuiz !== false;
const maxVisibleAssets = 12;
const defaultTimeframe = '3M';
const bulletinRefreshMs = featureToggles.newsRefreshMs ?? 1000 * 60 * 60 * 2;
const priceTickMs = featureToggles.sandboxPriceUpdateMs ?? 8000;
const maxBulletins = 12;
let activeTickMs = priceTickMs;

const segmentSymbols = (segment) => assetSegments[segment] ?? assetSymbols;
const segmentForAsset = (symbol) => {
  if (assetSegments.stocks?.includes(symbol)) return 'stocks';
  if (assetSegments.crypto?.includes(symbol)) return 'crypto';
  return 'stocks';
};
let priceLoopId = null;
let marketLabLoopId = null;
let scenarioLoopId = null;

if (FORCE_DEMO_MODE) {
  clearSupabaseOverrides();
}

const isSupabaseConfigured = hasSupabaseCredentials() && !FORCE_DEMO_MODE;

function currentTickStep() {
  return Math.floor(Date.now() / activeTickMs);
}

function classifyNewsImpact(drift) {
  const magnitude = Math.abs(drift);
  if (magnitude >= 0.012) return 'major';
  if (magnitude >= 0.007) return 'medium';
  if (magnitude > 0) return 'minor';
  return null;
}

function computeNewsShock(drift, seedBase) {
  const tier = classifyNewsImpact(drift);
  if (!tier) return 0;
  const sign = Math.sign(drift) || 1;
  const ranges = {
    major: { min: 0.2, max: 0.3, chance: 0.45 },
    medium: { min: 0.05, max: 0.12, chance: 0.35 },
    minor: { min: 0.02, max: 0.06, chance: 0.25 }
  };
  const config = ranges[tier];
  const roll = seedBase != null ? seededRandom(seedBase + 37) : Math.random();
  if (roll > config.chance) return 0;
  const shockRoll = seedBase != null ? seededRandom(seedBase + 73) : Math.random();
  const shock = config.min + shockRoll * (config.max - config.min);
  return shock * sign;
}

function randomizePrice(price, drift = 0, seedBase = null) {
  const baseVolatility = 0.06; // wider swings to feel closer to live markets
  const rand = seedBase != null ? seededRandom(seedBase) : Math.random();
  const centered = rand - 0.5;
  const newsShock = computeNewsShock(drift, seedBase);
  const delta = centered * baseVolatility + drift + newsShock;
  return Math.max(0, price * (1 + delta));
}

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function seedFromLabel(label) {
  return String(label)
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function generateHistorySeries(anchorPrice, seedLabel = 'base') {
  const now = Date.now();
  const yearsMs = 1000 * 60 * 60 * 24 * 365 * 10;
  const basePoints = 520;
  const baseStep = yearsMs / basePoints;
  const series = [];
  let value = anchorPrice * 0.65;
  const baseSeed = seedFromLabel(seedLabel);
  for (let i = 0; i <= basePoints; i++) {
    const ts = now - yearsMs + i * baseStep;
    value = randomizePrice(value, 0, baseSeed + i);
    series.push({ ts, value: Number(value.toFixed(4)) });
  }
  const densePoints = 168; // hourly over last 7 days
  const denseSpan = 1000 * 60 * 60 * 24 * 7;
  const denseStart = now - denseSpan;
  value = series[series.length - 1]?.value ?? anchorPrice;
  for (let i = 0; i <= densePoints; i++) {
    const ts = denseStart + (i / densePoints) * denseSpan;
    value = randomizePrice(value, 0, baseSeed + 1000 + i);
    series.push({ ts, value: Number(value.toFixed(4)) });
  }
  return series.slice(-historyLimit);
}

function seedPriceHistoryMap(priceMap) {
  return Object.entries(priceMap).reduce((acc, [symbol, price]) => {
    acc[symbol] = generateHistorySeries(price, symbol);
    return acc;
  }, {});
}

function seedPortfolioSeries(anchorValue = defaultSandboxState.balance) {
  const series = generateHistorySeries(anchorValue, 'portfolio');
  return series.map((entry) => ({ ...entry, value: Math.max(entry.value, 0) }));
}

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

  persistStateToCache();
}

function resetHistorySnapshots() {
  state.priceHistory = seedPriceHistoryMap(state.prices);
  state.prices = Object.fromEntries(
    Object.entries(state.priceHistory).map(([symbol, series]) => [symbol, series[series.length - 1]?.value ?? 0])
  );
  state.portfolioHistory = seedPortfolioSeries(calculatePortfolioValue());
}

function calculatePortfolioValue() {
  return (
    Number(state.sandbox.balance) +
    Object.entries(state.sandbox.holdings).reduce((total, [symbol, units]) => total + units * state.prices[symbol], 0)
  );
}

function standardDeviation(values = []) {
  if (!values.length) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function deriveSegmentHistory(holdingsMap, priceHistory, balance = 0, allowedSymbols = null) {
  const allowed = allowedSymbols ? new Set(allowedSymbols) : null;
  const symbols = allowed ? Array.from(allowed) : Object.keys(priceHistory || {});
  const anchor = symbols.find((s) => priceHistory?.[s]?.length);
  const refSeries = anchor ? priceHistory[anchor] : [];
  if (!refSeries?.length) return [];
  return refSeries.map((point, idx) => {
    const value = symbols.reduce((sum, symbol) => {
      if (allowed && !allowed.has(symbol)) return sum;
      const history = priceHistory?.[symbol];
      if (!history?.length) return sum;
      const price = history[Math.min(idx, history.length - 1)].value ?? 0;
      const units = holdingsMap?.[symbol] ?? 0;
      return sum + units * price;
    }, balance ?? 0);
    return { ts: point.ts, value };
  });
}

function computeInsightsFrom(holdingsMap, pricesMap, historySeries, balance, allowedSymbols = null, priceHistory = null) {
  const allowed = allowedSymbols ? new Set(allowedSymbols) : null;
  const holdings = Object.entries(holdingsMap || {})
    .filter(([symbol, units]) => !allowed || allowed.has(symbol))
    .map(([symbol, units]) => ({
      symbol,
      value: units * (pricesMap?.[symbol] ?? 0)
    }));
  const investedHoldings = holdings.filter((h) => h.value > 0.01);
  const topHolding = investedHoldings.reduce((max, current) => (current.value > max.value ? current : max), {
    symbol: '—',
    value: 0
  });
  const portfolioValue = (balance ?? 0) + holdings.reduce((total, holding) => total + holding.value, 0);
  const concentrationShare = portfolioValue ? (topHolding.value / portfolioValue) * 100 : 0;

  const derivedHistory =
    allowed && priceHistory ? deriveSegmentHistory(holdingsMap, priceHistory, balance, allowed) : historySeries;
  const history = (derivedHistory ?? []).slice(-50);
  const returns = [];
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1].value || 1;
    returns.push((history[i].value - prev) / prev);
  }
  const volatilityScore = standardDeviation(returns);
  let volatilityLabel = 'Low';
  if (volatilityScore > 0.04) {
    volatilityLabel = 'High';
  } else if (volatilityScore > 0.015) {
    volatilityLabel = 'Moderate';
  }

  let riskProfile = 'Low';
  if (volatilityLabel === 'High') riskProfile = 'High';
  if (volatilityLabel === 'Moderate') riskProfile = 'Moderate';

  const concentrationLabel = portfolioValue && topHolding.value
    ? `${concentrationShare.toFixed(1)}% in ${topHolding.symbol}`
    : 'No positions yet';

  return {
    risk: riskProfile,
    concentration: concentrationLabel,
    volatility: volatilityLabel
  };
}

function computePortfolioInsights(segment = null) {
  const allowed = segment ? segmentSymbols(segment) : null;
  return computeInsightsFrom(
    state.sandbox.holdings,
    state.prices,
    state.portfolioHistory,
    state.sandbox.balance,
    allowed,
    state.priceHistory
  );
}

function computeMarketLabInsights(segment = null) {
  const allowed = segment ? segmentSymbols(segment) : null;
  return computeInsightsFrom(
    state.marketLab.holdings,
    state.marketLab.prices,
    state.marketLab.portfolioHistory,
    state.marketLab.balance,
    allowed,
    state.marketLab.priceHistory
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

function formatBillions(value) {
  if (value == null || Number.isNaN(value)) return '—';
  return `€${Number(value).toFixed(1)}B`;
}

function formatPercent(value) {
  if (value == null || Number.isNaN(value)) return '—';
  return `${Number(value).toFixed(2)}%`;
}

function currentActiveAsset() {
  if (state.sandboxMode === 'scenario') return state.marketScenario.selectedAsset;
  if (state.sandboxMode === 'lab') return state.marketLab.selectedAsset;
  return state.activeAsset;
}

function bulletinPoolForSegment(segment, source = 'live') {
  if (segment === 'crypto') return cryptoBulletins.slice();
  if (source === 'lab') return marketLabBulletins.slice();
  return sandboxBulletins.slice();
}

function refreshBulletins(segment = state.liveMarketSegment) {
  const bucket = currentBulletinBucket();
  if (state.bulletin.bucket === bucket && state.bulletin.items.length && state.bulletin.segment === segment) return;
  const pool = bulletinPoolForSegment(segment, 'live');
  const items = [];
  const count = Math.min(maxBulletins, pool.length);
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(seededRandom(bucket + i) * pool.length);
    const base = pool.splice(idx, 1)[0];
    const hourOffset = Math.floor(seededRandom(bucket * (i + 2)) * 6);
    const ts = Date.now() - hourOffset * 60 * 60 * 1000;
    items.push({ ...base, ts });
  }
  state.bulletin = { bucket, items, segment };
}

function refreshLabBulletins(segment = state.labMarketSegment) {
  const bucket = currentBulletinBucket();
  if (
    state.marketLab.bulletin.bucket === bucket &&
    state.marketLab.bulletin.items.length &&
    state.marketLab.bulletin.segment === segment
  )
    return;
  const pool = bulletinPoolForSegment(segment, 'lab');
  const items = [];
  const count = Math.min(maxBulletins, pool.length);
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(seededRandom(bucket + i) * pool.length);
    const base = pool.splice(idx, 1)[0];
    const hourOffset = Math.floor(seededRandom(bucket * (i + 3)) * 6);
    const ts = Date.now() - hourOffset * 60 * 60 * 1000;
    items.push({ ...base, ts });
  }
  state.marketLab.bulletin = { bucket, items, segment };
}

function buildBulletinDriftMap(items = state.bulletin.items ?? []) {
  const impacts = {};
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

function buildLabBulletinDriftMap(items = state.marketLab.bulletin.items ?? []) {
  const impacts = {};
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
  // TODO: Replace template string rendering with element creation to avoid innerHTML for dynamic course data.
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

  renderCourseToc('course-toc', 'Courses');
  renderCourseToc('assessment-toc', state.curriculumTab === 'exam' ? 'Exam contents' : 'Quiz contents');
}

function renderCourseToc(containerId, heading = 'Courses') {
  const container = $(`#${containerId}`);
  if (!container) return;
  container.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <div>
        <p class="text-sm text-slate-400">${heading}</p>
        <h3 class="text-xl font-semibold">Table of contents</h3>
      </div>
      <span class="badge">${courses.length} courses</span>
    </div>
    <div class="space-y-3">
      ${courses
        .map((course) => {
          const completed = course.lessons.filter((lesson) => state.progress[lesson.id]?.completed).length;
          return `
            <div class="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs uppercase tracking-[0.25em] text-slate-400">${course.level}</p>
                  <p class="font-semibold">${course.title}</p>
                </div>
                <span class="mini-badge">${completed}/${course.lessons.length}</span>
              </div>
              <div class="mt-2 grid gap-2">
                ${course.lessons
                  .map(
                    (lesson) => `
                      <button data-lesson="${lesson.id}" class="w-full text-left rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm ${
                        state.selectedLessonId === lesson.id ? 'border-white/40' : ''
                      }">
                        ${lesson.title}
                      </button>
                    `
                  )
                  .join('')}
              </div>
            </div>
          `;
        })
        .join('')}
    </div>
  `;

  container.querySelectorAll('button[data-lesson]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setSelectedLesson(btn.dataset.lesson);
    });
  });
}

function setCurriculumTab(tab) {
  state.curriculumTab = tab;
  document.querySelectorAll('[data-curriculum-tab]').forEach((btn) => {
    const isActive = btn.dataset.curriculumTab === tab;
    btn.classList.toggle('active', isActive);
  });
  const coursePane = $('#course-pane');
  const assessmentPane = $('#assessment-pane');
  if (coursePane) coursePane.classList.toggle('hidden', tab !== 'courses');
  if (assessmentPane) assessmentPane.classList.toggle('hidden', tab === 'courses');

  const isExam = tab === 'exam';
  const modeLabel = $('#quiz-mode-label');
  const modeTitle = $('#quiz-mode-title');
  const submitBtn = $('#submit-quiz');
  if (modeLabel) modeLabel.textContent = isExam ? 'Exam mode' : 'Knowledge check';
  if (modeTitle) modeTitle.textContent = isExam ? 'Exam arena' : 'Topic arena';
  if (submitBtn) submitBtn.textContent = isExam ? 'Submit exam' : 'Submit quiz';

  renderCourseToc('course-toc', 'Courses');
  renderCourseToc('assessment-toc', isExam ? 'Exam contents' : 'Quiz contents');
  renderQuiz();
  renderQuizTopics();
}

function setQuizTopic(topicId) {
  if (!topicId || topicId === state.selectedQuizTopicId) return;
  state.selectedQuizTopicId = topicId;
  persistStateToCache();
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
  const isExam = state.curriculumTab === 'exam';
  form.innerHTML = topic.questions
    .map((question, idx) => {
      if (isExam) {
        return `
          <fieldset class="space-y-2">
            <legend class="font-medium">${idx + 1}. ${question.prompt}</legend>
            <textarea name="${question.id}" rows="3" class="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm" placeholder="Type your response" required></textarea>
          </fieldset>
        `;
      }
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

function getPortfolioValueAt(ts) {
  const history = state.portfolioHistory;
  if (!history.length) return null;
  let candidate = history[0];
  for (const point of history) {
    if (point.ts >= ts) return point.value;
    candidate = point;
  }
  return candidate?.value ?? null;
}

function computeWeeklyPerformance() {
  const nowValue = calculatePortfolioValue();
  const weekAgo = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const weekStartValue = getPortfolioValueAt(weekAgo) ?? nowValue;
  const pnl = nowValue - weekStartValue;
  const pct = weekStartValue ? pnl / weekStartValue : 0;
  return { pct, pnl, base: weekStartValue };
}

function buildLeaderboardEntries() {
  const weekBucket = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
  const peers = (leaderboardPeers ?? []).map((peer, idx) => {
    const variance = (seededRandom(weekBucket + idx) - 0.5) * 0.06;
    const pct = peer.baseReturn + variance;
    const pnl = peer.capital * pct;
    return { name: peer.name, pct, pnl, capital: peer.capital, self: false };
  });
  const selfPerformance = computeWeeklyPerformance();
  const selfEntry = {
    name: state.profile?.full_name || 'You',
    pct: selfPerformance.pct,
    pnl: selfPerformance.pnl,
    capital: selfPerformance.base ?? defaultSandboxState.balance,
    self: true
  };
  return [...peers, selfEntry]
    .sort((a, b) => b.pnl - a.pnl)
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }))
    .slice(0, 7);
}

function renderLeaderboard() {
  const list = $('#leaderboard-list');
  if (!list) return;
  const entries = buildLeaderboardEntries();
  list.innerHTML = entries
    .map((entry) => {
      const pnlLabel = `${entry.pnl >= 0 ? '+' : ''}${formatCurrency(entry.pnl)}`;
      return `
        <div class="flex items-center justify-between rounded-2xl bg-white/5 p-3 ${
          entry.self ? 'border border-emerald-400/30' : 'border border-white/5'
        }">
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-2xl bg-white/10 flex items-center justify-center text-sm font-semibold">${
              entry.rank
            }</span>
            <div>
              <p class="font-semibold">${entry.name}${entry.self ? ' (you)' : ''}</p>
              <p class="text-xs text-slate-400">${pnlLabel} this week</p>
            </div>
          </div>
          <span class="text-sm font-semibold ${entry.pct >= 0 ? 'text-emerald-300' : 'text-rose-300'}">${
            (entry.pct * 100).toFixed(1)
          }%</span>
        </div>
      `;
    })
    .join('');
  const badge = $('#live-feed-badge');
  if (badge) badge.textContent = 'Shared feed';
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
  renderLeaderboard();
}

function setSandboxTab(tab) {
  state.sandboxTab = tab;
  document.querySelectorAll('[data-sandbox-tab]').forEach((btn) => {
    const isActive = btn.dataset.sandboxTab === tab;
    btn.classList.toggle('active', isActive);
  });
  const portfolioSection = $('#sandbox-portfolio-section');
  const tradeSection = $('#sandbox-trade-section');
  if (portfolioSection) portfolioSection.classList.toggle('hidden', tab !== 'portfolio');
  if (tradeSection) tradeSection.classList.toggle('hidden', tab !== 'trade');
}

function setLiveMarketSegment(segment) {
  state.liveMarketSegment = segment === 'crypto' ? 'crypto' : 'stocks';
  document.querySelectorAll('[data-market-segment]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.marketSegment === state.liveMarketSegment);
  });
  state.bulletin = { bucket: null, items: [], segment: state.liveMarketSegment };
  refreshBulletins(state.liveMarketSegment);
  renderAssetSelects();
  renderSandbox();
  requestAnimationFrame(renderSandboxCharts);
}

function setLabMarketSegment(segment) {
  state.labMarketSegment = segment === 'crypto' ? 'crypto' : 'stocks';
  document.querySelectorAll('[data-lab-segment]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.labSegment === state.labMarketSegment);
  });
  state.marketLab.bulletin = { bucket: null, items: [], segment: state.labMarketSegment };
  refreshLabBulletins(state.labMarketSegment);
  renderLabAssetSelects();
  renderMarketLab();
  requestAnimationFrame(renderMarketLabCharts);
}

function updateCurriculumSidebarVisibility(view) {
  const subnav = $('#curriculum-subnav');
  if (subnav) {
    subnav.classList.toggle('hidden', view !== 'curriculum');
  }
}

function updateSandboxSidebarVisibility(view) {
  const subnav = $('#sandbox-subnav');
  if (subnav) {
    subnav.classList.toggle('hidden', view !== 'sandbox');
  }
}

function setSandboxMode(mode) {
  state.sandboxMode = mode === 'scenario' ? 'scenario' : mode === 'lab' ? 'lab' : 'live';
  const isScenario = state.sandboxMode === 'scenario';
  const isLab = state.sandboxMode === 'lab';
  if (isScenario) {
    renderScenarioSelection();
  }
  document.querySelectorAll('[data-sandbox-mode]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.sandboxMode === state.sandboxMode);
  });
  const liveSection = $('#sandbox-live-container');
  const labSection = $('#sandbox-lab-container');
  const scenarioSection = $('#sandbox-scenarios');
  const marketLabel = $('#sandbox-market-label');
  const marketNote = $('#sandbox-market-note');
  const showSelection = isScenario && !state.marketScenario.active;
  if (liveSection) liveSection.classList.toggle('hidden', isLab || showSelection);
  if (labSection) labSection.classList.toggle('hidden', !isLab);
  if (scenarioSection) scenarioSection.classList.toggle('hidden', !isScenario || !showSelection);
  const liveTab = $('#sandbox-tab-live');
  if (liveTab) liveTab.classList.toggle('active', state.sandboxMode === 'live');
  if (marketLabel)
    marketLabel.textContent = isScenario ? 'Market scenarios' : isLab ? 'Market lab' : 'Live market';
  if (marketNote)
    marketNote.textContent = isScenario
      ? 'Personal scenario drills with targets.'
      : isLab
      ? 'Personal accelerated feed.'
      : 'Synchronized demo feed.';
  state.activeBulletinSource = isLab ? 'lab' : isScenario ? 'scenario' : 'live';
  if (state.sandboxMode === 'live') {
    pauseMarketLabLoop();
    pauseScenarioLoop();
    state.marketLab.isActive = false;
    state.marketScenario.isRunning = false;
  } else if (isScenario) {
    pauseMarketLabLoop();
    state.marketLab.isActive = false;
    if (state.marketScenario.active && state.marketScenario.isRunning) {
      startScenarioLoop();
    }
  } else {
    state.marketLab.isActive = true;
    setMarketLabTab(state.marketLab.tab ?? 'portfolio');
    renderMarketLab();
    requestAnimationFrame(renderMarketLabCharts);
    refreshLabBulletins();
    if (state.marketLab.isRunning) {
      startMarketLabLoop();
    } else {
      pauseMarketLabLoop();
    }
  }
  startPriceLoop();
  renderSandbox();
  requestAnimationFrame(renderSandboxCharts);
}

function renderPortfolioInsights(segment) {
  const container = $('#portfolio-insights');
  if (!container) return;
  const insights = computePortfolioInsights(segment);
  const riskEl = $('#insight-risk');
  const concentrationEl = $('#insight-concentration');
  const volatilityEl = $('#insight-volatility');
  if (riskEl) riskEl.textContent = insights.risk;
  if (concentrationEl) concentrationEl.textContent = insights.concentration;
  if (volatilityEl) volatilityEl.textContent = insights.volatility;
}

function renderBulletinBoard() {
  const container = $('#sandbox-bulletin');
  if (!container) return;
  const source = state.activeBulletinSource;
  const segment = source === 'lab' ? state.labMarketSegment : state.liveMarketSegment;
  if (source === 'scenario') {
    advanceScenarioBulletins();
  } else if (source === 'lab') {
    refreshLabBulletins(segment);
  } else {
    refreshBulletins(segment);
  }
  const refreshLabel = $('#bulletin-refresh-label');
  if (refreshLabel) {
    const hours = Math.round(bulletinRefreshMs / (1000 * 60 * 60));
    refreshLabel.textContent = source === 'scenario' ? 'Scenario-driven cues' : `Auto-updates ~${hours}h`;
  }
  const items =
    source === 'scenario'
      ? state.marketScenario.bulletin.items ?? []
      : source === 'lab'
      ? state.marketLab.bulletin.items ?? []
      : state.bulletin.items ?? [];
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
    card.addEventListener('click', () => openBulletinArticle(card.dataset.articleId, source || 'live'));
  });
}

function renderLabBulletinBoard() {
  const container = $('#lab-bulletin');
  if (!container) return;
  const segment = state.labMarketSegment;
  refreshLabBulletins(segment);
  const refreshLabel = $('#lab-bulletin-refresh-label');
  if (refreshLabel) {
    const hours = Math.round(bulletinRefreshMs / (1000 * 60 * 60));
    refreshLabel.textContent = `Auto-updates ~${hours}h`;
  }
  const items = state.marketLab.bulletin.items ?? [];
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
              <span>${formatRelativeTime(item.ts ?? Date.now())}</span>
              <span class="badge ${toneClass}">${item.sentiment}</span>
            </div>
            <div class="space-y-1">
              <p class="font-semibold text-slate-100">${item.title}</p>
              <p class="text-xs text-slate-400">${item.summary}</p>
            </div>
            <div class="flex flex-wrap gap-2 text-[11px] text-slate-300">
              <span class="mini-badge">Focus: ${focusAssets}</span>
              <span class="mini-badge">Bias: ${driftLabel}</span>
            </div>
            <p class="text-[11px] text-sky-200">Open full brief →</p>
          </article>
        `;
      })
      .join('') || '<p class="text-slate-400 text-sm">Bulletins will refresh shortly.</p>';

  container.querySelectorAll('[data-article-id]').forEach((card) => {
    card.addEventListener('click', () => openBulletinArticle(card.dataset.articleId, 'lab'));
  });
}

function resolveBulletinArticle(id, source = state.activeBulletinSource || 'live') {
  if (!id) return null;
  const segment = source === 'lab' ? state.marketLab.bulletin.segment : state.bulletin.segment;
  const livePool = segment === 'crypto' ? cryptoBulletins : sandboxBulletins;
  const labPool = segment === 'crypto' ? cryptoBulletins : marketLabBulletins;
  if (source === 'scenario') {
    return state.marketScenario.bulletin.items.find((item) => item.id === id) || null;
  }
  return (
    (source === 'lab' ? state.marketLab.bulletin.items : state.bulletin.items).find((item) => item.id === id) ||
    (source === 'lab' ? labPool.find((item) => item.id === id) : livePool.find((item) => item.id === id)) ||
    null
  );
}

function openBulletinArticle(articleId, source = 'live') {
  if (!articleId) return;
  state.previousView = state.currentView;
  state.activeBulletinArticleId = articleId;
  state.activeBulletinSource = source;
  setView('article');
  renderBulletinArticle();
}

function renderBulletinArticle() {
  const article = resolveBulletinArticle(state.activeBulletinArticleId, state.activeBulletinSource);
  const titleEl = $('#bulletin-article-title');
  const summaryEl = $('#bulletin-article-summary');
  const assetsEl = $('#bulletin-article-assets');
  const effectEl = $('#bulletin-article-effect');
  const bodyEl = $('#bulletin-article-body');
  const badgeEl = $('#bulletin-article-sentiment');
  const timeEl = $('#bulletin-article-time');
  if (!titleEl || !summaryEl || !assetsEl || !effectEl || !bodyEl || !badgeEl || !timeEl) return;

  if (!article) {
    setText(titleEl, 'Select a bulletin to open its full article');
    setText(
      summaryEl,
      'Click any headline in the sandbox bulletin board to read a deeper brief and the projected market tilt.'
    );
    setText(assetsEl, 'Focus assets: —');
    setText(effectEl, 'Projected impact will appear here.');
    setText(bodyEl, 'No article selected.');
    setText(badgeEl, 'Signals');
    badgeEl.className = 'badge';
    setText(timeEl, '');
    return;
  }

  setText(titleEl, article.title);
  setText(summaryEl, article.summary);
  setText(assetsEl, `Focus assets: ${article.assets?.join(', ') || 'Market-wide'}`);
  const projection = article.projection
    ? article.projection
    : article.drift
    ? `Expected ${(article.drift * 100).toFixed(1)}% ${article.drift > 0 ? 'upward' : 'downward'} tilt in sentiment-weighted ticks.`
    : 'Neutral baseline expected.';
  setText(effectEl, projection);

  const paragraphs = article.articleBody?.length
    ? article.articleBody
    : [article.summary, article.impact, projection].filter(Boolean);
  // TODO: Replace innerHTML assembly with createElement-based rendering to avoid string concatenation for external content.
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
  setText(badgeEl, article.sentiment ?? 'Signal');
  badgeEl.className = `badge ${toneClass}`;
  setText(timeEl, formatRelativeTime(article.ts ?? Date.now()));
}

function findScenario(levelId, scenarioId) {
  const level = marketScenarioLevels.find((lvl) => lvl.id === levelId) ?? marketScenarioLevels[0];
  const scenario = level?.scenarios.find((s) => s.id === scenarioId) ?? level?.scenarios?.[0];
  return { level, scenario };
}

function renderScenarioSelection() {
  const container = $('#scenario-levels');
  if (!container) return;
  container.innerHTML = marketScenarioLevels
    .map((level) => {
      const scenarios = level.scenarios
        .map(
          (scenario) => `
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3 scenario-row" data-level="${
              level.id
            }" data-scenario="${scenario.id}">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <p class="text-sm font-semibold">${scenario.title}</p>
                  <p class="text-xs text-slate-400">${scenario.teaser}</p>
                  <p class="text-[11px] text-slate-500">★ 15% • ★★ 25% • ★★★ 40%</p>
                </div>
                <span class="mini-badge">${level.name}</span>
              </div>
              <button
                class="scenario-continue w-full py-2 rounded-2xl border border-white/15 hover:border-white/40 text-sm"
                type="button"
              >
                Continue
              </button>
            </div>
          `
        )
        .join('');
      return `
        <div class="card-glass rounded-3xl p-5 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-400">${level.name}</p>
              <p class="text-xs text-slate-400">${level.tagline}</p>
            </div>
            <span class="badge">${level.scenarios.length} scenario${level.scenarios.length === 1 ? '' : 's'}</span>
          </div>
          <div class="grid md:grid-cols-3 gap-3">${scenarios}</div>
        </div>
      `;
    })
    .join('');

  container.querySelectorAll('.scenario-continue').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      const row = event.currentTarget.closest('.scenario-row');
      if (!row) return;
      const levelId = row.dataset.level;
      const scenarioId = row.dataset.scenario;
      openScenarioModal(levelId, scenarioId);
    });
  });
}

function resetScenarioSelection() {
  pauseScenarioLoop();
  state.marketScenario.active = false;
  state.marketScenario.isRunning = false;
  state.marketScenario.levelId = '';
  state.marketScenario.scenarioId = '';
  state.marketScenario.tick = 0;
  const modal = $('#scenario-modal');
  if (modal) modal.classList.add('hidden');
  renderScenarioSelection();
}

function openScenarioModal(levelId, scenarioId) {
  const { level, scenario } = findScenario(levelId, scenarioId);
  if (!scenario) return;
  const modal = $('#scenario-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  setText($('#scenario-modal-title'), scenario.title);
  setText($('#scenario-modal-level'), `${level.name} • ${scenario.durationDays}d window`);
  setText($('#scenario-modal-description'), scenario.description);
  const tipsEl = $('#scenario-modal-tips');
  if (tipsEl) {
    tipsEl.innerHTML = (scenario.tips || [])
      .map((tip) => `<li class="text-sm text-slate-300 list-disc ml-4">${tip}</li>`)
      .join('');
  }
  $('#scenario-begin')?.setAttribute('data-level', level.id);
  $('#scenario-begin')?.setAttribute('data-scenario', scenario.id);
}

function startScenarioSession(levelId, scenarioId, options = {}) {
  const { level, scenario } = findScenario(levelId, scenarioId);
  if (!scenario) return;
  const autoStart = options.autoStart !== undefined ? options.autoStart : true;
  const hideModal = options.hideModal !== false;
  applyView(state, 'sandbox');
  state.marketScenario = {
    ...state.marketScenario,
    active: true,
    levelId: level.id,
    scenarioId: scenario.id,
    isRunning: autoStart,
    speed: 1,
    tick: 0,
    startBalance: defaultSandboxState.balance,
    balance: defaultSandboxState.balance,
    portfolioValue: defaultSandboxState.balance,
    holdings: normalizeHoldings(defaultSandboxState.holdings),
    history: [],
    prices: { ...state.prices },
    priceHistory: seedPriceHistoryMap(initialPrices),
    portfolioHistory: seedPortfolioSeries(defaultSandboxState.balance),
    bulletin: { bucket: null, items: [] },
    events: [],
    selectedAsset: assetSymbols[0] ?? 'BTC',
    starsEarned: 0
  };
  state.sandboxMode = 'scenario';
  setSandboxTab('portfolio');
  setSandboxMode('scenario');
  if (autoStart) startScenarioLoop();
  const modal = $('#scenario-modal');
  if (modal && hideModal) modal.classList.add('hidden');
}

function beginScenario(levelId, scenarioId) {
  const { level, scenario } = findScenario(levelId, scenarioId);
  if (!scenario) return;
  const isPrepared =
    state.marketScenario.active &&
    state.marketScenario.levelId === level.id &&
    state.marketScenario.scenarioId === scenario.id &&
    !state.marketScenario.isRunning;
  if (isPrepared) {
    state.marketScenario.isRunning = true;
    setSandboxMode('scenario');
    startScenarioLoop();
    $('#scenario-modal')?.classList.add('hidden');
    return;
  }
  startScenarioSession(level.id, scenario.id);
}

function tryLaunchPendingScenario() {
  if (sessionStorage.getItem(suppressScenarioAutoStartKey) === 'true') return;
  const raw = localStorage.getItem(pendingScenarioKey);
  if (!raw) return;
  try {
    const payload = JSON.parse(raw);
    localStorage.removeItem(pendingScenarioKey);
    if (payload?.levelId && payload?.scenarioId) {
      startScenarioSession(payload.levelId, payload.scenarioId);
    }
  } catch (err) {
    console.warn('Failed to parse pending scenario', err);
  }
}

function renderScenarioHud() {
  const hud = $('#scenario-hud');
  const liveContainer = $('#sandbox-live-container');
  const headerCard = liveContainer?.querySelector(':scope > .card-glass:not(#scenario-hud)');
  if (liveContainer && headerCard && hud) {
    if (state.sandboxMode === 'scenario') {
      if (liveContainer.firstElementChild !== hud) {
        liveContainer.insertBefore(hud, headerCard);
      }
    } else {
      if (liveContainer.firstElementChild !== headerCard) {
        liveContainer.insertBefore(headerCard, liveContainer.firstElementChild);
      }
      if (headerCard.nextElementSibling !== hud) {
        liveContainer.insertBefore(hud, headerCard.nextElementSibling);
      }
    }
  }
  if (!hud) return;
  const show = state.sandboxMode === 'scenario' && state.marketScenario.active;
  hud.classList.toggle('hidden', !show);
  if (!show) return;
  const scenario = getActiveScenarioDefinition();
  const perf = state.marketScenario.startBalance
    ? ((calculateScenarioPortfolioValue() - state.marketScenario.startBalance) / state.marketScenario.startBalance) * 100
    : 0;
  const targets = scenario?.starTargets ?? [15, 25, 40];
  const starsEarned = targets.filter((t) => perf >= t).length;
  setText($('#scenario-hud-name'), scenario?.title || 'Market scenario');
  setText($('#scenario-hud-difficulty'), `${scenario?.difficulty ?? 1} • ${state.marketScenario.tick.toFixed(0)}d`);
  setText($('#scenario-hud-progress'), `${perf >= 0 ? '+' : ''}${perf.toFixed(2)}% return`);
  setText($('#scenario-hud-stars'), `${'★'.repeat(starsEarned)}${'☆'.repeat(3 - starsEarned)}`);
  const bar = $('#scenario-progress-bar');
  if (bar) {
    const nextTarget = targets[Math.min(targets.length - 1, starsEarned)] ?? targets[targets.length - 1];
    const pct = Math.max(0, Math.min(100, (perf / nextTarget) * 100));
    bar.style.width = `${pct}%`;
  }
}


function renderSandbox() {
  const isScenario = state.sandboxMode === 'scenario';
  const marketState = isScenario ? state.marketScenario : state.sandbox;
  const basePrices = isScenario ? state.marketScenario.prices : state.prices;
  const holdings = marketState.holdings ?? {};
  const segment = isScenario
    ? 'stocks'
    : state.sandboxMode === 'lab'
    ? state.labMarketSegment
    : state.liveMarketSegment;
  const allowed = new Set(segmentSymbols(segment));
  const prices = Object.fromEntries(Object.entries(basePrices).filter(([symbol]) => allowed.has(symbol)));
  const filteredHoldings = Object.fromEntries(Object.entries(holdings).filter(([symbol]) => allowed.has(symbol)));
  const portfolioValue = isScenario ? calculateScenarioPortfolioValue() : calculatePortfolioValue();
  $('#sandbox-balance').textContent = formatCurrency(marketState.balance);
  $('#sandbox-portfolio-value').textContent = formatCurrency(portfolioValue);
  const holdingsContainer = $('#sandbox-holdings');
  const historyContainer = $('#sandbox-history');
  const holdingsEntries = Object.entries(filteredHoldings)
    .filter(([, units]) => units > 0)
    .map(([symbol, units]) => {
      const price = prices[symbol];
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

  // TODO: Refactor trade history rendering to build DOM nodes instead of concatenated HTML strings.
  const historyEntries = (marketState.history || []).filter((entry) => {
    const derivedSegment = entry.segment || (entry.asset ? segmentForAsset(entry.asset) : null);
    if (segment && derivedSegment && derivedSegment !== segment) return false;
    if (entry.asset) return allowed.has(entry.asset);
    return !segment || derivedSegment === segment;
  });
  const historyMarkup = historyEntries
    .slice(-10)
    .reverse()
    .map((entry) => {
      const toneClass =
        entry.type === 'buy'
          ? 'bg-emerald-500/20 text-emerald-100'
          : entry.type === 'sell'
          ? 'bg-rose-500/20 text-rose-100'
          : 'bg-sky-500/20 text-sky-100';
      const timeLabel = formatRelativeTime(new Date(entry.ts).getTime());
      return `
        <div class="flex items-start justify-between rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs">
              <span class="badge ${toneClass} capitalize">${entry.type || 'event'}</span>
              <span class="text-slate-400">${timeLabel}</span>
            </div>
            <p class="text-sm text-slate-100 leading-snug">${entry.detail}</p>
          </div>
        </div>`;
    })
    .join('');
  historyContainer.innerHTML =
    historyMarkup || '<p class="text-slate-400 text-sm">No trades yet. Your fills will appear here.</p>';

  renderPortfolioInsights(segment);
  const allowedSymbols = [...allowed];
  const activeAsset = prices[isScenario ? marketState.selectedAsset : state.activeAsset] != null
    ? isScenario
      ? marketState.selectedAsset
      : state.activeAsset
    : allowedSymbols[0];
  if (isScenario) {
    state.marketScenario.selectedAsset = activeAsset;
  } else {
    state.activeAsset = activeAsset;
  }
  const activeHistory = (isScenario ? state.marketScenario.priceHistory[activeAsset] : state.priceHistory[activeAsset]) ?? [];
  const activePrice = prices[activeAsset];
  const activePrev = activeHistory.length > 1 ? activeHistory[activeHistory.length - 2]?.value : activePrice;
  const activeChange = activePrev ? ((activePrice - activePrev) / activePrev) * 100 : 0;
  const activeUnits = holdings[activeAsset] ?? 0;
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
  renderAssetDetails(activeAsset, segment, 'live');
  const stripContainer = $('#sandbox-asset-strip');
  if (stripContainer) {
    const entries = Object.entries(prices);
    const visible = state.ui?.showAllAssets ? entries : entries.slice(0, 5);
    stripContainer.innerHTML = visible
      .map(([symbol, price]) => {
        const history = (isScenario ? state.marketScenario.priceHistory[symbol] : state.priceHistory[symbol]) ?? [];
        const prev = history.length > 1 ? history[history.length - 2]?.value : price;
        const changePct = prev ? ((price - prev) / prev) * 100 : 0;
        const initial = symbol[0] ?? '?';
        return `
          <button data-asset="${symbol}" class="min-w-[120px] flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left hover:border-white/40">
            <div class="flex items-center gap-2">
              <span class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-semibold">${initial}</span>
              <div>
                <p class="font-semibold">${symbol}</p>
                <p class="text-xs text-slate-400">${formatCurrency(price)}</p>
              </div>
            </div>
            <p class="text-xs mt-1 ${changePct >= 0 ? 'text-emerald-300' : 'text-rose-300'}">${
              changePct >= 0 ? '+' : ''
            }${changePct.toFixed(2)}%</p>
          </button>
        `;
      })
      .join('');

    stripContainer.querySelectorAll('button[data-asset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (isScenario) {
          state.marketScenario.selectedAsset = btn.dataset.asset;
        } else {
          state.activeAsset = btn.dataset.asset;
        }
        setSandboxTab('trade');
        renderSandbox();
        requestAnimationFrame(renderSandboxCharts);
      });
    });

    const toggleBtn = $('#asset-strip-toggle');
    if (toggleBtn) {
      toggleBtn.textContent = state.ui?.showAllAssets ? 'Show less' : 'See all';
      toggleBtn.onclick = () => {
        state.ui.showAllAssets = !state.ui.showAllAssets;
        renderSandbox();
      };
    }
  }

  renderBulletinBoard();

  renderScenarioHud();
  requestAnimationFrame(renderSandboxCharts);
}

function tradeEl(id, context = 'live') {
  const prefix = context === 'lab' ? 'lab-' : '';
  return document.getElementById(`${prefix}${id}`);
}

function toggleTradeSegmentSections(segment, context = 'live') {
  const container = context === 'lab' ? $('#sandbox-lab-trade') : $('#sandbox-trade-section');
  if (container) {
    container.querySelectorAll('[data-segment-only="stocks"]').forEach((el) => {
      el.classList.toggle('hidden', segment !== 'stocks');
    });
  }
  const newsHeading = tradeEl('stock-news-heading', context);
  if (newsHeading) newsHeading.textContent = segment === 'stocks' ? 'Company news' : 'Coin news';
  const buyLabel = tradeEl('buy-form-label', context);
  if (buyLabel) buyLabel.textContent = segment === 'stocks' ? 'Buy stock' : 'Buy crypto';
  const sellLabel = tradeEl('sell-form-label', context);
  if (sellLabel) sellLabel.textContent = segment === 'stocks' ? 'Sell stock' : 'Sell crypto';
}

function renderStockDetailsForContext(symbol, context = 'live') {
  const nameEl = tradeEl('stock-profile-name', context);
  if (!nameEl) return;
  const detail = assetFundamentals[symbol];
  if (!detail) return;
  setText(nameEl, `${detail.name} (${symbol})`);
  setText(tradeEl('stock-profile-meta', context), `${detail.country} • ${detail.sector}`);
  setText(tradeEl('stock-profile-sector', context), detail.sector ?? 'Sector');
  setText(tradeEl('stock-summary', context), detail.summary ?? '');

  const metricsEl = tradeEl('stock-metrics', context);
  if (metricsEl) {
    const { metrics = {} } = detail;
    metricsEl.innerHTML = `
      <div class="flex items-center justify-between"><span>Market cap</span><span>${formatBillions(metrics.marketCap)}</span></div>
      <div class="flex items-center justify-between"><span>P/E ratio</span><span>${metrics.pe?.toFixed(1) ?? '—'}</span></div>
      <div class="flex items-center justify-between"><span>EPS</span><span>${metrics.eps?.toFixed(2) ?? '—'}</span></div>
      <div class="flex items-center justify-between"><span>Dividend yield</span><span>${formatPercent(metrics.dividendYield)}</span></div>
    `;
  }

  const eventsEl = tradeEl('stock-events', context);
  if (eventsEl) {
    const events = detail.events ?? [];
    eventsEl.innerHTML =
      events
        .map(
          (event) => `
            <div class="flex items-start justify-between rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
              <div class="space-y-1">
                <p class="font-semibold">${event.title}</p>
                <p class="text-xs text-slate-400">${event.description}</p>
              </div>
              <span class="text-xs text-slate-300">${event.date}</span>
            </div>
          `
        )
        .join('') || '<p class="text-sm text-slate-400">No upcoming events.</p>';
  }

  const epsPeriod = state.ui?.epsPeriod ?? 'annual';
  document.querySelectorAll('[data-eps-period]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.epsPeriod === epsPeriod);
  });
  const epsEl = tradeEl('stock-eps-list', context);
  if (epsEl) {
    const earnings = detail.earnings?.[epsPeriod] ?? [];
    epsEl.innerHTML =
      earnings
        .map(
          (row) => `
            <div class="flex items-center justify-between rounded-2xl border border-white/5 px-3 py-2">
              <span class="text-xs text-slate-400">${row.period}</span>
              <div class="text-right">
                <p class="text-sm text-slate-100">Actual: ${row.actual?.toFixed(2) ?? '—'}</p>
                <p class="text-xs text-slate-400">Estimate: ${row.estimate?.toFixed(2) ?? '—'}</p>
              </div>
            </div>
          `
        )
        .join('') || '<p class="text-sm text-slate-400">No earnings data.</p>';
  }

  const finPeriod = state.ui?.finPeriod ?? 'annual';
  document.querySelectorAll('[data-fin-period]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.finPeriod === finPeriod);
  });
  const perfEl = tradeEl('stock-performance', context);
  if (perfEl) {
    const performance = detail.performance?.[finPeriod] ?? [];
    perfEl.innerHTML =
      performance
        .map(
          (row) => `
            <div class="flex items-center justify-between rounded-2xl border border-white/5 px-3 py-2">
              <span class="text-xs text-slate-400">${row.period}</span>
              <div class="text-right text-sm">
                <p>Revenue growth: ${formatPercent(row.revenueGrowth)}</p>
                <p>Net income: ${formatPercent(row.netIncome)}</p>
                <p>Margin: ${formatPercent(row.margin)}</p>
                <p>Cash: €${(row.cash ?? 0).toFixed(1)}B</p>
              </div>
            </div>
          `
        )
        .join('') || '<p class="text-sm text-slate-400">No performance data.</p>';
  }

  const newsEl = tradeEl('stock-news', context);
  if (newsEl) {
    const news = detail.news ?? [];
    newsEl.innerHTML =
      news
        .map(
          (item) => `
            <div class="rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
              <p class="font-semibold">${item.title}</p>
              <p class="text-xs text-slate-400">${item.summary}</p>
            </div>
          `
        )
        .join('') || '<p class="text-sm text-slate-400">No news yet.</p>';
  }
}

function renderAssetDetails(symbol, segment, context = 'live') {
  toggleTradeSegmentSections(segment, context);
  const detail = assetFundamentals[symbol];
  const nameEl = tradeEl('stock-profile-name', context);
  if (!detail) {
    if (nameEl) setText(nameEl, symbol);
    return;
  }

  if (segment !== 'stocks') {
    if (nameEl) setText(nameEl, `${detail.name ?? symbol} (${symbol})`);
    setText(tradeEl('stock-profile-meta', context), detail.sector ?? '');
    setText(tradeEl('stock-summary', context), detail.summary ?? 'Select a coin to explore details.');
    const metricsEl = tradeEl('stock-metrics', context);
    if (metricsEl) {
      const metrics = detail.metrics ?? {};
      metricsEl.innerHTML = `
        <div class="flex items-center justify-between"><span>Market cap</span><span>${formatBillions(metrics.marketCap)}</span></div>
        <div class="flex items-center justify-between"><span>Circulating</span><span>${metrics.circulating ? metrics.circulating.toLocaleString() : '—'}</span></div>
      `;
    }
    ['stock-events', 'stock-eps-list', 'stock-performance'].forEach((id) => {
      const el = tradeEl(id, context);
      if (el) el.innerHTML = '';
    });
    const newsEl = tradeEl('stock-news', context);
    if (newsEl) {
      const news = detail.news ?? [];
      newsEl.innerHTML =
        news
          .map(
            (item) => `
              <div class="rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
                <p class="font-semibold">${item.title}</p>
                <p class="text-xs text-slate-400">${item.summary}</p>
              </div>
            `
          )
          .join('') || '<p class="text-sm text-slate-400">No coin news yet.</p>';
    }
    return;
  }

  renderStockDetailsForContext(symbol, context);
}

function setMarketLabTab(tab) {
  state.marketLab.tab = tab;
  document.querySelectorAll('[data-lab-tab]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.labTab === tab);
  });
  const portfolioSection = $('#sandbox-lab-portfolio');
  const tradeSection = $('#sandbox-lab-trade');
  if (portfolioSection) portfolioSection.classList.toggle('hidden', tab !== 'portfolio');
  if (tradeSection) tradeSection.classList.toggle('hidden', tab !== 'trade');
}

function renderMarketLabInsights() {
  const container = $('#lab-portfolio-insights');
  if (!container) return;
  const insights = computeMarketLabInsights(state.labMarketSegment);
  setText($('#lab-insight-risk'), insights.risk);
  setText($('#lab-insight-concentration'), insights.concentration);
  setText($('#lab-insight-volatility'), insights.volatility);
}

function renderMarketLab() {
  const portfolioValue = calculateMarketLabPortfolioValue();
  setText($('#lab-balance'), formatCurrency(state.marketLab.balance));
  setText($('#lab-portfolio-value'), formatCurrency(portfolioValue));

  const allowed = new Set(segmentSymbols(state.labMarketSegment));
  const prices = Object.fromEntries(Object.entries(state.marketLab.prices).filter(([symbol]) => allowed.has(symbol)));
  const holdings = Object.fromEntries(Object.entries(state.marketLab.holdings).filter(([symbol]) => allowed.has(symbol)));

  const holdingsContainer = $('#lab-holdings');
  if (holdingsContainer) {
    const holdingsEntries = Object.entries(holdings)
      .filter(([, units]) => units > 0)
      .map(([symbol, units]) => {
        const price = prices[symbol];
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
  }

  const historyContainer = $('#lab-history');
  if (historyContainer) {
    const allowedHistory = (state.marketLab.history || []).filter((entry) => {
      const derivedSegment = entry.segment || (entry.asset ? segmentForAsset(entry.asset) : null);
      if (derivedSegment && derivedSegment !== state.labMarketSegment) return false;
      if (entry.asset) return allowed.has(entry.asset);
      return true;
    });
    const historyMarkup = allowedHistory
      ?.slice(-10)
      .reverse()
      .map((entry) => {
        const toneClass =
          entry.type === 'buy'
            ? 'bg-emerald-500/20 text-emerald-100'
            : entry.type === 'sell'
            ? 'bg-rose-500/20 text-rose-100'
            : 'bg-sky-500/20 text-sky-100';
        const timeLabel = formatRelativeTime(new Date(entry.ts).getTime());
        return `
          <div class="flex items-start justify-between rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
            <div class="space-y-1">
              <div class="flex items-center gap-2 text-xs">
                <span class="badge ${toneClass} capitalize">${entry.type || 'event'}</span>
                <span class="text-slate-400">${timeLabel}</span>
              </div>
              <p class="text-sm text-slate-100 leading-snug">${entry.detail}</p>
            </div>
          </div>`;
      })
      .join('');
    historyContainer.innerHTML =
      historyMarkup || '<p class="text-slate-400 text-sm">No trades yet. Your fills will appear here.</p>';
  }

  renderMarketLabInsights();

  const allowedSymbols = [...allowed];
  const activeAsset = prices[state.marketLab.selectedAsset] != null
    ? state.marketLab.selectedAsset
    : allowedSymbols[0];
  state.marketLab.selectedAsset = activeAsset;
  const activeHistory = state.marketLab.priceHistory[activeAsset] ?? [];
  const activePrice = prices[activeAsset];
  const activePrev = activeHistory.length > 1 ? activeHistory[activeHistory.length - 2]?.value : activePrice;
  const activeChange = activePrev ? ((activePrice - activePrev) / activePrev) * 100 : 0;
  const activeUnits = state.marketLab.holdings[activeAsset] ?? 0;
  const activeValueShare = portfolioValue ? (activeUnits * activePrice / portfolioValue) * 100 : 0;
  setText($('#lab-active-asset-label'), activeAsset);
  setText($('#lab-active-asset-price'), formatCurrency(activePrice));
  const changeBadge = $('#lab-active-asset-change');
  if (changeBadge) {
    changeBadge.textContent = `${activeChange >= 0 ? '+' : ''}${activeChange.toFixed(2)}%`;
    changeBadge.className = `badge ${
      activeChange >= 0 ? 'bg-emerald-500/20 text-emerald-100' : 'bg-rose-500/20 text-rose-100'
    }`;
  }
  setText($('#lab-active-asset-units'), activeUnits.toFixed(4));
  setText($('#lab-active-asset-share'), `${activeValueShare.toFixed(2)}%`);
  renderAssetDetails(activeAsset, state.labMarketSegment, 'lab');

  const stripContainer = $('#lab-asset-strip');
  if (stripContainer) {
    const entries = Object.entries(state.marketLab.prices).filter(([symbol]) => allowed.has(symbol));
    const visible = state.ui?.labShowAllAssets ? entries : entries.slice(0, 5);
    stripContainer.innerHTML = visible
      .map(([symbol, price]) => {
        const history = state.marketLab.priceHistory[symbol] ?? [];
        const prev = history.length > 1 ? history[history.length - 2]?.value : price;
        const changePct = prev ? ((price - prev) / prev) * 100 : 0;
        const initial = symbol[0] ?? '?';
        return `
          <button data-lab-asset="${symbol}" class="min-w-[120px] flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left hover:border-white/40">
            <div class="flex items-center gap-2">
              <span class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-semibold">${initial}</span>
              <div>
                <p class="font-semibold">${symbol}</p>
                <p class="text-xs text-slate-400">${formatCurrency(price)}</p>
              </div>
            </div>
            <p class="text-xs mt-1 ${changePct >= 0 ? 'text-emerald-300' : 'text-rose-300'}">${
              changePct >= 0 ? '+' : ''
            }${changePct.toFixed(2)}%</p>
          </button>
        `;
      })
      .join('');

    stripContainer.querySelectorAll('button[data-lab-asset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.marketLab.selectedAsset = btn.dataset.labAsset || btn.dataset.asset || state.marketLab.selectedAsset;
        setMarketLabTab('trade');
        renderMarketLab();
        requestAnimationFrame(renderMarketLabCharts);
      });
    });

    const toggleBtn = $('#lab-asset-strip-toggle');
    if (toggleBtn) {
      toggleBtn.textContent = state.ui?.labShowAllAssets ? 'Show less' : 'See all';
      toggleBtn.onclick = () => {
        state.ui.labShowAllAssets = !state.ui.labShowAllAssets;
        renderMarketLab();
      };
    }
  }

  updateLabSpeedButtons();
  renderLabBulletinBoard();

  requestAnimationFrame(renderMarketLabCharts);
}

function updateLabSpeedButtons() {
  document.querySelectorAll('.lab-speed-btn').forEach((btn) => {
    const active = Number(btn.dataset.speed || '1') === Number(state.marketLab.speed || 1);
    btn.classList.toggle('bg-white/20', active);
    btn.classList.toggle('border-white/40', active);
  });
}

function setLabSpeed(speed) {
  state.marketLab.speed = speed;
  updateLabSpeedButtons();
  if (state.marketLab.isRunning) {
    startMarketLabLoop();
  }
}

function startLabSimulation() {
  state.marketLab.isRunning = true;
  startMarketLabLoop();
  showToast('Market Lab started', 'success');
}

function pauseLabSimulation() {
  pauseMarketLabLoop();
  showToast('Market Lab paused', 'info');
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
  persistStateToCache();
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
  const isExam = state.curriculumTab === 'exam';
  const formData = new FormData($('#quiz-form'));
  let score = 0;
  let passed = false;

  if (isExam) {
    const answeredCount = topic.questions.filter((question) => {
      const response = (formData.get(question.id) ?? '').toString().trim();
      return response.length > 0;
    }).length;
    if (answeredCount < topic.questions.length) {
      showToast('Please answer every exam prompt before submitting.', 'error');
      return;
    }
    score = 100;
    passed = true;
  } else {
    let correct = 0;
    topic.questions.forEach((question) => {
      const response = Number(formData.get(question.id));
      if (response === question.answer) correct += 1;
    });
    score = Math.round((correct / topic.questions.length) * 100);
    passed = score >= passingScoreThreshold;
  }
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
  persistStateToCache();
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

function calculateMarketLabPortfolioValue() {
  return (
    Number(state.marketLab.balance) +
    Object.entries(state.marketLab.holdings).reduce(
      (total, [symbol, units]) => total + units * (state.marketLab.prices?.[symbol] ?? 0),
      0
    )
  );
}

function recordLabPriceSnapshot() {
  Object.keys(state.marketLab.prices || {}).forEach((symbol) => {
    if (!state.marketLab.priceHistory[symbol]) state.marketLab.priceHistory[symbol] = [];
    state.marketLab.priceHistory[symbol].push({ ts: Date.now(), value: state.marketLab.prices[symbol] });
    state.marketLab.priceHistory[symbol] = state.marketLab.priceHistory[symbol].slice(-historyLimit);
  });
}

function recordLabPortfolioSnapshot() {
  state.marketLab.portfolioHistory.push({ ts: Date.now(), value: calculateMarketLabPortfolioValue() });
  state.marketLab.portfolioHistory = state.marketLab.portfolioHistory.slice(-historyLimit);
}


function tickPrices() {
  const driftMap = { ...buildBulletinDriftMap() };
  const tickStep = currentTickStep();
  Object.keys(state.prices).forEach((symbol) => {
    const drift = driftMap[symbol] ?? 0;
    state.prices[symbol] = randomizePrice(state.prices[symbol], drift, tickStep + symbol.charCodeAt(0));
  });
  recordPriceSnapshot();
  recordPortfolioSnapshot();
  renderSandbox();
  renderDashboard();
}

function tickMarketLabPrices() {
  const driftMap = { ...buildLabBulletinDriftMap() };
  const seedBase = state.marketLab.virtualTimeIndex++;
  Object.keys(state.marketLab.prices).forEach((symbol) => {
    const drift = driftMap[symbol] ?? 0;
    state.marketLab.prices[symbol] = randomizePrice(
      state.marketLab.prices[symbol],
      drift,
      seedBase + symbol.charCodeAt(0)
    );
  });
  recordLabPriceSnapshot();
  recordLabPortfolioSnapshot();
  renderMarketLab();
  requestAnimationFrame(renderMarketLabCharts);
  persistStateToCache();
}

function randomizeScenarioPrice(price, scenario, drift = 0, seedBase = null) {
  const volatility = scenario?.volatility ?? 0.08;
  const bias = scenario?.bias ?? 0;
  const rand = seedBase != null ? seededRandom(seedBase) : Math.random();
  const delta = (rand - 0.5) * volatility + bias + drift;
  return Math.max(0, price * (1 + delta));
}

function recordScenarioPriceSnapshot() {
  Object.keys(state.marketScenario.prices || {}).forEach((symbol) => {
    if (!state.marketScenario.priceHistory[symbol]) state.marketScenario.priceHistory[symbol] = [];
    state.marketScenario.priceHistory[symbol].push({ ts: Date.now(), value: state.marketScenario.prices[symbol] });
    state.marketScenario.priceHistory[symbol] = state.marketScenario.priceHistory[symbol].slice(-historyLimit);
  });
}

function recordScenarioPortfolioSnapshot() {
  state.marketScenario.portfolioHistory.push({ ts: Date.now(), value: calculateScenarioPortfolioValue() });
  state.marketScenario.portfolioHistory = state.marketScenario.portfolioHistory.slice(-historyLimit);
}

function advanceScenarioBulletins() {
  const scenario = getActiveScenarioDefinition();
  if (!scenario) return;
  const day = Math.floor(state.marketScenario.tick);
  const existingIds = new Set(state.marketScenario.bulletin.items.map((b) => b.id));
  scenario.news
    ?.filter((item) => day >= item.atDay && !existingIds.has(item.id))
    .forEach((item, idx) => {
      state.marketScenario.bulletin.items.unshift({
        ...item,
        ts: Date.now() - idx * 1000 * 60 * 30,
        sentiment: item.drift > 0 ? 'bullish' : 'bearish',
        impact: item.drift > 0 ? 'Positive cue' : 'Negative cue'
      });
    });
  state.marketScenario.bulletin.items = state.marketScenario.bulletin.items.slice(0, maxBulletins);
}

function buildScenarioDriftMap(items = state.marketScenario.bulletin.items ?? []) {
  const impacts = {};
  items.forEach((item, idx) => {
    const drift = item.drift ?? 0;
    if (!drift) return;
    const softened = drift * (1 - idx * 0.1);
    if (item.assets?.includes('ALT_BASKET')) {
      assetSymbols.forEach((symbol) => {
        impacts[symbol] = (impacts[symbol] ?? 0) + softened * 0.6;
      });
    }
    item.assets?.forEach((symbol) => {
      if (symbol === 'ALT_BASKET') return;
      impacts[symbol] = (impacts[symbol] ?? 0) + softened;
    });
    if (!item.assets?.length) {
      assetSymbols.forEach((symbol) => {
        impacts[symbol] = (impacts[symbol] ?? 0) + softened * 0.5;
      });
    }
  });
  return impacts;
}

function tickScenarioPrices() {
  if (!state.marketScenario.active) return;
  const scenario = getActiveScenarioDefinition();
  if (!scenario) return;
  const driftMap = { ...buildScenarioDriftMap() };
  const seedBase = state.marketScenario.tick++;
  Object.keys(state.marketScenario.prices).forEach((symbol) => {
    const drift = driftMap[symbol] ?? 0;
    state.marketScenario.prices[symbol] = randomizeScenarioPrice(
      state.marketScenario.prices[symbol],
      scenario,
      drift,
      seedBase + symbol.charCodeAt(0)
    );
  });
  advanceScenarioBulletins();
  recordScenarioPriceSnapshot();
  recordScenarioPortfolioSnapshot();
  renderSandbox();
  persistStateToCache();
  const daysElapsed = Math.floor(state.marketScenario.tick);
  if (daysElapsed >= scenario.durationDays) {
    completeScenario();
  }
}

function startScenarioLoop() {
  const interval = Math.max(400, (featureToggles?.sandboxPriceUpdateMs ?? 8000) / Math.max(1, state.marketScenario.speed));
  if (scenarioLoopId) clearInterval(scenarioLoopId);
  scenarioLoopId = setInterval(() => {
    if (!state.marketScenario.isRunning) return;
    tickScenarioPrices();
  }, interval);
  if (state.marketScenario.isRunning) {
    tickScenarioPrices();
  }
}

function pauseScenarioLoop() {
  state.marketScenario.isRunning = false;
  if (scenarioLoopId) clearInterval(scenarioLoopId);
  scenarioLoopId = null;
}

function getActiveScenarioDefinition() {
  if (!state.marketScenario.scenarioId) return null;
  for (const level of marketScenarioLevels) {
    const found = level.scenarios.find((s) => s.id === state.marketScenario.scenarioId);
    if (found) return found;
  }
  return null;
}

function calculateScenarioPortfolioValue() {
  return (
    Number(state.marketScenario.balance) +
    Object.entries(state.marketScenario.holdings).reduce(
      (total, [symbol, units]) => total + units * (state.marketScenario.prices[symbol] ?? 0),
      0
    )
  );
}

function completeScenario() {
  state.marketScenario.isRunning = false;
  const scenario = getActiveScenarioDefinition();
  const start = state.marketScenario.startBalance || defaultSandboxState.balance;
  const end = calculateScenarioPortfolioValue();
  const perf = start ? ((end - start) / start) * 100 : 0;
  const targets = scenario?.starTargets ?? [15, 25, 40];
  const starsEarned = targets.filter((t) => perf >= t).length;
  state.marketScenario.starsEarned = starsEarned;
  showToast(
    `Scenario complete: ${perf >= 0 ? '+' : ''}${perf.toFixed(2)}% (${starsEarned}★ earned)`,
    'success'
  );
  pauseScenarioLoop();
  renderSandbox();
}

function startPriceLoop() {
  const interval = featureToggles?.sandboxPriceUpdateMs ?? 8000;
  activeTickMs = interval;
  if (priceLoopId) clearInterval(priceLoopId);
  priceLoopId = setInterval(() => tickPrices(), interval);
  tickPrices();
}

function startMarketLabLoop() {
  const interval = Math.max(400, (featureToggles?.sandboxPriceUpdateMs ?? 8000) / Math.max(1, state.marketLab.speed));
  if (marketLabLoopId) clearInterval(marketLabLoopId);
  marketLabLoopId = setInterval(() => {
    if (!state.marketLab.isRunning) return;
    tickMarketLabPrices();
  }, interval);
  if (state.marketLab.isRunning) {
    tickMarketLabPrices();
  }
}

function pauseMarketLabLoop() {
  state.marketLab.isRunning = false;
  if (marketLabLoopId) clearInterval(marketLabLoopId);
  marketLabLoopId = null;
}

function recordTrade(entry) {
  const asset = entry.asset;
  const segment = asset ? segmentForAsset(asset) : state.liveMarketSegment;
  state.sandbox.history.push({ ...entry, asset, segment, ts: new Date().toISOString() });
  state.sandbox.history = state.sandbox.history.slice(-50);
}

function renderAssetSelects() {
  const symbols = segmentSymbols(state.liveMarketSegment);
  const options = symbols.map((symbol) => `<option value="${symbol}">${symbol}</option>`).join('');
  ['buy-asset', 'sell-asset'].forEach((id) => {
    const select = $(`#${id}`);
    if (select) {
      select.innerHTML = options;
    }
  });
}

function renderLabAssetSelects() {
  const symbols = segmentSymbols(state.labMarketSegment);
  const options = symbols.map((symbol) => `<option value="${symbol}">${symbol}</option>`).join('');
  ['lab-buy-asset', 'lab-sell-asset'].forEach((id) => {
    const select = $(`#${id}`);
    if (select) {
      select.innerHTML = options;
    }
  });
}

async function syncSandbox() {
  state.sandbox.holdings = normalizeHoldings(state.sandbox.holdings);
  persistStateToCache();
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

function syncMarketLab() {
  state.marketLab.holdings = normalizeHoldings(state.marketLab.holdings);
  persistStateToCache();
  recordLabPortfolioSnapshot();
  renderMarketLab();
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
  state.sandbox.balance -= amount;
  state.sandbox.holdings[asset] = (state.sandbox.holdings[asset] ?? 0) + units;
  recordTrade({ type: 'buy', asset, detail: `${asset} @ ${price.toFixed(2)} (${units.toFixed(4)} units)` });
  await syncSandbox();
  $('#buy-form')?.reset();
  showToast('Purchase executed', 'success');
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
  state.sandbox.balance += amount;
  state.sandbox.holdings[asset] = Math.max(0, (state.sandbox.holdings[asset] ?? 0) - units);
  recordTrade({ type: 'sell', asset, detail: `${asset} @ ${price.toFixed(2)} (${units.toFixed(4)} units)` });
  await syncSandbox();
  $('#sell-form')?.reset();
  showToast('Sale executed', 'success');
}

function handleLabBuy(event) {
  event.preventDefault();
  const asset = $('#lab-buy-asset')?.value;
  const amount = Number($('#lab-buy-amount')?.value);
  if (!asset || !amount || amount <= 0) return;
  const price = state.marketLab.prices[asset];
  if (amount > state.marketLab.balance) {
    showToast('Not enough balance in your lab account.', 'error');
    return;
  }
  const units = amount / price;
  state.marketLab.balance -= amount;
  state.marketLab.holdings[asset] = (state.marketLab.holdings[asset] ?? 0) + units;
  state.marketLab.history.push({
    type: 'buy',
    asset,
    segment: segmentForAsset(asset),
    detail: `Bought ${units.toFixed(4)} ${asset} for ${formatCurrency(amount)} in Market Labs`,
    ts: new Date().toISOString()
  });
  syncMarketLab();
  requestAnimationFrame(renderMarketLabCharts);
  $('#lab-buy-form')?.reset();
  showToast('Simulated buy placed in your Market Lab.', 'success');
}

function handleLabSell(event) {
  event.preventDefault();
  const asset = $('#lab-sell-asset')?.value;
  const units = Number($('#lab-sell-amount')?.value);
  if (!asset || !units || units <= 0) return;
  const owned = state.marketLab.holdings[asset] ?? 0;
  if (units > owned) {
    showToast('You do not have enough units to sell in your Market Lab.', 'error');
    return;
  }
  const price = state.marketLab.prices[asset];
  const proceeds = units * price;
  state.marketLab.balance += proceeds;
  state.marketLab.holdings[asset] = Math.max(0, owned - units);
  state.marketLab.history.push({
    type: 'sell',
    asset,
    segment: segmentForAsset(asset),
    detail: `Sold ${units.toFixed(4)} ${asset} for ${formatCurrency(proceeds)} in Market Labs`,
    ts: new Date().toISOString()
  });
  syncMarketLab();
  requestAnimationFrame(renderMarketLabCharts);
  $('#lab-sell-form')?.reset();
  showToast('Simulated sell placed in your Market Lab.', 'success');
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
  applyView(state, view, {
    updateCurriculumSidebarVisibility,
    updateSandboxSidebarVisibility,
    onEnterSandbox: () => {
      setSandboxMode(state.sandboxMode ?? 'live');
      setSandboxTab(state.sandboxTab ?? 'portfolio');
      requestAnimationFrame(renderSandboxCharts);
    },
    onEnterArticle: renderBulletinArticle,
    onEnterCurriculum: () => setCurriculumTab(state.curriculumTab ?? 'courses')
  });
}

function bindNavigation() {
  document.querySelectorAll('[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => setView(btn.dataset.view));
  });
  document.querySelectorAll('[data-view-target]').forEach((btn) => {
    btn.addEventListener('click', () => setView(btn.dataset.viewTarget));
  });

  document.querySelectorAll('[data-curriculum-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setView('curriculum');
      setCurriculumTab(btn.dataset.curriculumTab);
    });
  });

  document.querySelectorAll('[data-sandbox-tab]').forEach((btn) => {
    btn.addEventListener('click', () => setSandboxTab(btn.dataset.sandboxTab));
  });
  document.querySelectorAll('[data-market-segment]').forEach((btn) => {
    btn.addEventListener('click', () => setLiveMarketSegment(btn.dataset.marketSegment));
  });
  document.querySelectorAll('[data-lab-segment]').forEach((btn) => {
    btn.addEventListener('click', () => setLabMarketSegment(btn.dataset.labSegment));
  });

  document.querySelectorAll('[data-lab-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setView('sandbox');
      setSandboxMode('lab');
      setMarketLabTab(btn.dataset.labTab);
    });
  });

  document.querySelectorAll('[data-sandbox-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.sandboxMode === 'scenario') {
        resetScenarioSelection();
      }
      setView('sandbox');
      setSandboxMode(btn.dataset.sandboxMode);
    });
  });

  document.querySelectorAll('.lab-speed-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const speed = Number(btn.dataset.speed || '1');
      setLabSpeed(speed);
    });
  });

  bind('#lab-start', 'click', startLabSimulation);
  bind('#lab-pause', 'click', pauseLabSimulation);
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

function bindEvents() {
  bind('#signup-form', 'submit', handleSignup);
  bind('#login-form', 'submit', handleLogin);
  bind('#google-auth', 'click', handleGoogle);
  bind('#logout-btn', 'click', handleLogout);
  bind('#complete-lesson-btn', 'click', handleMarkComplete);
  bind('#submit-quiz', 'click', handleQuizSubmit);
  bind('#buy-form', 'submit', handleBuy);
  bind('#sell-form', 'submit', handleSell);
  bind('#scenario-begin', 'click', (event) => {
    const btn = event.currentTarget;
    const levelId = btn?.dataset.level;
    const scenarioId = btn?.dataset.scenario;
    beginScenario(levelId, scenarioId);
  });
  bind('#scenario-modal-close', 'click', () => {
    const modal = $('#scenario-modal');
    if (modal) modal.classList.add('hidden');
  });
  bind('#scenario-start', 'click', () => {
    state.marketScenario.isRunning = true;
    startScenarioLoop();
  });
  bind('#scenario-pause', 'click', pauseScenarioLoop);
  bind('#home-crypto-btn', 'click', () => setView('dashboard'));
  bind('#home-stocks-btn', 'click', () => setView('dashboard'));
  document.querySelectorAll('[data-scenario-speed]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const speed = Number(btn.dataset.scenarioSpeed || '1');
      state.marketScenario.speed = speed;
      document.querySelectorAll('[data-scenario-speed]').forEach((el) => {
        el.classList.toggle('active', el === btn);
      });
      if (state.marketScenario.isRunning) startScenarioLoop();
    });
  });
  document.querySelectorAll('[data-eps-period]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.ui.epsPeriod = btn.dataset.epsPeriod || 'annual';
      const segment = state.sandboxMode === 'lab' ? state.labMarketSegment : state.liveMarketSegment;
      const context = state.sandboxMode === 'lab' ? 'lab' : 'live';
      renderAssetDetails(currentActiveAsset(), state.sandboxMode === 'scenario' ? 'stocks' : segment, context);
    });
  });
  document.querySelectorAll('[data-fin-period]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.ui.finPeriod = btn.dataset.finPeriod || 'annual';
      const segment = state.sandboxMode === 'lab' ? state.labMarketSegment : state.liveMarketSegment;
      const context = state.sandboxMode === 'lab' ? 'lab' : 'live';
      renderAssetDetails(currentActiveAsset(), state.sandboxMode === 'scenario' ? 'stocks' : segment, context);
    });
  });
  bind('#refresh-courses', 'click', renderCourses);
  bind('#enter-demo', 'click', handleDemoEntry);
  bind('#bulletin-article-back', 'click', () => setView(state.previousView || 'sandbox'));
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
    persistStateToCache();
    state.previewMode = false;
    enterAppShell();
    renderCurriculumSummary();
    renderLessonDetail();
    renderQuizTopics();
    renderQuiz();
    renderSandbox();
    renderDashboard();
    hideSkeleton();
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
      persistStateToCache();
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
  showSkeleton();
  setProfileName('Guest');
  hydrateStateFromCache();
  seedDemoStateIfEmpty();
  if (!supabaseClient || FORCE_DEMO_MODE) {
    handleDemoEntry(true);
  }
  resetHistorySnapshots();
  tryLaunchPendingScenario();
  renderCourses();
  renderCurriculumSummary();
  renderLessonDetail();
  renderQuizTopics();
  renderQuiz();
  renderQuizThresholdHint();
  setCurriculumTab(state.curriculumTab);
  setLiveMarketSegment(state.liveMarketSegment || 'stocks');
  setLabMarketSegment(state.labMarketSegment || 'stocks');
  renderAssetSelects();
  renderLabAssetSelects();
  renderScenarioSelection();
  initChartControls();
  setSandboxTab(state.sandboxTab);
  setSandboxMode(state.sandboxMode);
  renderSandbox();
  renderMarketLab();
  requestAnimationFrame(renderMarketLabCharts);
  renderDashboard();
  bindEvents();
  startPriceLoop();
  initAuthListener();
  bootstrapUser();
  toggleDemoHint();
  updateBackendStatus(isSupabaseConfigured);
  initBackendSettingsPanel();
  hideSkeleton();
}

window.addEventListener('DOMContentLoaded', init);
window.addEventListener('beforeunload', () => {
  if (priceLoopId) clearInterval(priceLoopId);
  if (marketLabLoopId) clearInterval(marketLabLoopId);
  if (scenarioLoopId) clearInterval(scenarioLoopId);
});
