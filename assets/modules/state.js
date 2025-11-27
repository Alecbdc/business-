import { courses, defaultSandboxState, initialPrices, quizTopics } from '../data.js';
import { featureToggles } from '../config.js';

const cacheKey = 'aether-cache-v2';
const historyLimit = 1200;
const assetSymbols = Object.keys(initialPrices);
const defaultTimeframe = '3M';
const passingScoreThreshold = Number(featureToggles.passingScore ?? 70);

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
  const baseVolatility = 0.06;
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
  const densePoints = 168;
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

const seededPriceHistory = seedPriceHistoryMap(initialPrices);
const latestSeededPrices = Object.fromEntries(
  Object.entries(seededPriceHistory).map(([symbol, series]) => [symbol, series[series.length - 1]?.value ?? 0])
);
const seededPortfolioHistory = seedPortfolioSeries();

const deepClone = (value) => (typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value)));

const normalizeHoldings = (holdings = {}) => {
  return assetSymbols.reduce((acc, symbol) => {
    acc[symbol] = Number(holdings[symbol] ?? 0);
    return acc;
  }, {});
};

export const state = {
  user: null,
  profile: null,
  previewMode: false,
  currentView: 'dashboard',
  previousView: 'dashboard',
  selectedLessonId: courses[0]?.lessons[0]?.id ?? null,
  selectedQuizTopicId: quizTopics[0]?.id ?? null,
  curriculumTab: 'courses',
  progress: {},
  quizScores: {},
  topicScores: {},
  quizLog: [],
  sandbox: {
    balance: defaultSandboxState.balance,
    holdings: normalizeHoldings(defaultSandboxState.holdings),
    history: defaultSandboxState.history ?? []
  },
  marketLab: {
    isActive: false,
    isRunning: false,
    speed: 1,
    virtualTimeIndex: 0,
    balance: defaultSandboxState.balance,
    portfolioValue: defaultSandboxState.balance,
    holdings: normalizeHoldings(defaultSandboxState.holdings),
    history: defaultSandboxState.history ?? [],
    selectedAsset: assetSymbols[0] ?? 'BTC'
  },
  prices: { ...latestSeededPrices },
  priceHistory: seededPriceHistory,
  portfolioHistory: seededPortfolioHistory,
  chartTimeframes: { portfolio: defaultTimeframe, asset: defaultTimeframe },
  chartZoom: { portfolio: 1, asset: 1 },
  activeAsset: assetSymbols[0] ?? 'BTC',
  sandboxMode: 'live',
  sandboxTab: 'portfolio',
  replay: { active: false, timer: null, index: 0, series: [] },
  marketReplay: { active: false, scenarioId: '', step: 0 },
  bulletin: { bucket: null, items: [] },
  activeBulletinArticleId: null,
  ui: { showAllAssets: false }
};

export function hydrateStateFromCache() {
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
    state.marketLab = parsed.marketLab ?? {
      isActive: false,
      isRunning: false,
      speed: 1,
      virtualTimeIndex: 0,
      balance: defaultSandboxState.balance,
      portfolioValue: defaultSandboxState.balance,
      holdings: normalizeHoldings(defaultSandboxState.holdings),
      history: defaultSandboxState.history ?? [],
      selectedAsset: assetSymbols[0] ?? 'BTC'
    };
    state.marketLab.balance = Number(state.marketLab.balance ?? defaultSandboxState.balance);
    state.marketLab.portfolioValue = Number(
      state.marketLab.portfolioValue ?? state.marketLab.balance ?? defaultSandboxState.balance
    );
    state.marketLab.holdings = normalizeHoldings(state.marketLab.holdings);
    state.marketLab.history = state.marketLab.history ?? [];
  } catch (err) {
    console.warn('Failed to hydrate cache', err);
  }
}

export function persistStateToCache() {
  try {
    const payload = {
      progress: state.progress,
      quizScores: state.quizScores,
      topicScores: state.topicScores,
      quizLog: state.quizLog,
      sandbox: state.sandbox,
      marketLab: state.marketLab,
      selectedQuizTopicId: state.selectedQuizTopicId
    };
    localStorage.setItem(cacheKey, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to persist cache', err);
  }
}

export { assetSymbols, historyLimit, defaultTimeframe, seededPriceHistory, seededPortfolioHistory, latestSeededPrices, normalizeHoldings, seedPriceHistoryMap, seedPortfolioSeries };
