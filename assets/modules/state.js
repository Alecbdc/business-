import { courses, defaultSandboxState, initialPrices, quizTopics } from '../data.js';
import { featureToggles } from '../config.js';

const cacheKey = 'aether-cache-v2';
const historyLimit = 600;
const quizLogLimit = 20;
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
  currentView: 'home',
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
    selectedAsset: assetSymbols[0] ?? 'AAPL',
    prices: { ...latestSeededPrices },
    priceHistory: seedPriceHistoryMap(initialPrices),
    portfolioHistory: seedPortfolioSeries(defaultSandboxState.balance),
    bulletin: { bucket: null, items: [] }
  },
  prices: { ...latestSeededPrices },
  priceHistory: seededPriceHistory,
  portfolioHistory: seededPortfolioHistory,
  chartTimeframes: {
    portfolio: defaultTimeframe,
    asset: defaultTimeframe,
    labPortfolio: defaultTimeframe,
    labAsset: defaultTimeframe
  },
  chartZoom: { portfolio: 1, asset: 1, labPortfolio: 1, labAsset: 1 },
  activeAsset: assetSymbols[0] ?? 'AAPL',
  sandboxMode: 'live',
  sandboxTab: 'portfolio',
  marketScenario: {
    active: false,
    levelId: '',
    scenarioId: '',
    isRunning: false,
    speed: 1,
    tick: 0,
    maxTicks: 120,
    startBalance: defaultSandboxState.balance,
    balance: defaultSandboxState.balance,
    portfolioValue: defaultSandboxState.balance,
    holdings: normalizeHoldings(defaultSandboxState.holdings),
    history: defaultSandboxState.history ?? [],
    prices: { ...latestSeededPrices },
    priceHistory: seedPriceHistoryMap(initialPrices),
    portfolioHistory: seedPortfolioSeries(defaultSandboxState.balance),
    bulletin: { bucket: null, items: [] },
    events: [],
    selectedAsset: assetSymbols[0] ?? 'AAPL',
    starsEarned: 0
  },
  bulletin: { bucket: null, items: [] },
  activeBulletinArticleId: null,
  activeBulletinSource: 'live',
  ui: { showAllAssets: false, labShowAllAssets: false, epsPeriod: 'annual', finPeriod: 'annual' }
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
    state.ui = { ...state.ui, ...(parsed.ui ?? {}) };
    state.ui.showAllAssets = !!state.ui.showAllAssets;
    state.ui.labShowAllAssets = !!state.ui.labShowAllAssets;
    state.ui.epsPeriod = parsed.ui?.epsPeriod ?? state.ui.epsPeriod ?? 'annual';
    state.ui.finPeriod = parsed.ui?.finPeriod ?? state.ui.finPeriod ?? 'annual';
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
      selectedAsset: assetSymbols[0] ?? 'AAPL',
      prices: { ...latestSeededPrices },
      priceHistory: seedPriceHistoryMap(initialPrices),
      portfolioHistory: seedPortfolioSeries(defaultSandboxState.balance),
      bulletin: { bucket: null, items: [] }
    };
    state.marketLab.balance = Number(state.marketLab.balance ?? defaultSandboxState.balance);
    state.marketLab.portfolioValue = Number(
      state.marketLab.portfolioValue ?? state.marketLab.balance ?? defaultSandboxState.balance
    );
    state.marketLab.holdings = normalizeHoldings(state.marketLab.holdings);
    state.marketLab.history = state.marketLab.history ?? [];
    state.marketLab.prices = state.marketLab.prices ?? { ...latestSeededPrices };
    state.marketLab.priceHistory = state.marketLab.priceHistory ?? seedPriceHistoryMap(initialPrices);
    state.marketLab.portfolioHistory = state.marketLab.portfolioHistory ?? seedPortfolioSeries(defaultSandboxState.balance);
    state.marketLab.bulletin = state.marketLab.bulletin ?? { bucket: null, items: [] };
    state.marketScenario = parsed.marketScenario ?? {
      active: false,
      levelId: '',
      scenarioId: '',
      isRunning: false,
      speed: 1,
      tick: 0,
      maxTicks: 120,
      startBalance: defaultSandboxState.balance,
      balance: defaultSandboxState.balance,
      portfolioValue: defaultSandboxState.balance,
      holdings: normalizeHoldings(defaultSandboxState.holdings),
      history: defaultSandboxState.history ?? [],
      prices: { ...latestSeededPrices },
      priceHistory: seedPriceHistoryMap(initialPrices),
      portfolioHistory: seedPortfolioSeries(defaultSandboxState.balance),
      bulletin: { bucket: null, items: [] },
      events: [],
      selectedAsset: assetSymbols[0] ?? 'AAPL',
      starsEarned: 0
    };
    state.marketScenario.balance = Number(state.marketScenario.balance ?? defaultSandboxState.balance);
    state.marketScenario.portfolioValue = Number(
      state.marketScenario.portfolioValue ?? state.marketScenario.balance ?? defaultSandboxState.balance
    );
    state.marketScenario.holdings = normalizeHoldings(state.marketScenario.holdings);
    state.marketScenario.history = state.marketScenario.history ?? [];
    state.marketScenario.prices = state.marketScenario.prices ?? { ...latestSeededPrices };
    state.marketScenario.priceHistory = state.marketScenario.priceHistory ?? seedPriceHistoryMap(initialPrices);
    state.marketScenario.portfolioHistory =
      state.marketScenario.portfolioHistory ?? seedPortfolioSeries(defaultSandboxState.balance);
    state.marketScenario.bulletin = state.marketScenario.bulletin ?? { bucket: null, items: [] };
  } catch (err) {
    console.warn('Failed to hydrate cache', err);
  }
}

export function persistStateToCache() {
  try {
    const trimHistory = (history = []) => history.slice(-Math.floor(historyLimit / 2));
    const trimHoldings = (holdings = {}) =>
      Object.fromEntries(
        Object.entries(holdings)
          .map(([k, v]) => [k, Number(v)])
          .filter(([, v]) => v)
      );

    const compactSandbox = {
      balance: state.sandbox.balance,
      holdings: trimHoldings(state.sandbox.holdings),
      history: trimHistory(state.sandbox.history)
    };

    const compactLab = {
      isActive: state.marketLab.isActive,
      isRunning: state.marketLab.isRunning,
      speed: state.marketLab.speed,
      virtualTimeIndex: state.marketLab.virtualTimeIndex,
      balance: state.marketLab.balance,
      portfolioValue: state.marketLab.portfolioValue,
      holdings: trimHoldings(state.marketLab.holdings),
      history: trimHistory(state.marketLab.history),
      selectedAsset: state.marketLab.selectedAsset,
      prices: state.marketLab.prices,
      bulletin: state.marketLab.bulletin
    };

    const compactScenario = {
      active: state.marketScenario.active,
      levelId: state.marketScenario.levelId,
      scenarioId: state.marketScenario.scenarioId,
      isRunning: state.marketScenario.isRunning,
      speed: state.marketScenario.speed,
      tick: state.marketScenario.tick,
      maxTicks: state.marketScenario.maxTicks,
      startBalance: state.marketScenario.startBalance,
      balance: state.marketScenario.balance,
      portfolioValue: state.marketScenario.portfolioValue,
      holdings: trimHoldings(state.marketScenario.holdings),
      history: trimHistory(state.marketScenario.history),
      bulletin: state.marketScenario.bulletin,
      events: state.marketScenario.events,
      selectedAsset: state.marketScenario.selectedAsset,
      starsEarned: state.marketScenario.starsEarned
    };

    const payload = {
      progress: state.progress,
      quizScores: state.quizScores,
      topicScores: state.topicScores,
      quizLog: (state.quizLog ?? []).slice(-quizLogLimit),
      sandbox: compactSandbox,
      marketLab: compactLab,
      marketScenario: compactScenario,
      selectedQuizTopicId: state.selectedQuizTopicId,
      ui: state.ui
    };

    localStorage.setItem(cacheKey, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to persist cache', err);
    if (err?.name === 'QuotaExceededError') {
      try {
        localStorage.removeItem(cacheKey);
        console.warn('Cleared cache due to quota limits');
      } catch (cleanupErr) {
        console.warn('Failed to clear cache after quota issue', cleanupErr);
      }
    }
  }
}

export { assetSymbols, historyLimit, defaultTimeframe, seededPriceHistory, seededPortfolioHistory, latestSeededPrices, normalizeHoldings, seedPriceHistoryMap, seedPortfolioSeries };
