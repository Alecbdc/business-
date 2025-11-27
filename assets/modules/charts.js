import { state } from './state.js';
import { $, showToast, formatCurrency } from './ui.js';
import { replayScenarios } from '../data.js';

export const timeframeOptions = [
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

function filterSeriesByTimeframe(series, timeframeKey) {
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

export function renderLineChart(canvas, series, color, zoom = 1, inspector) {
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
  // TODO: Build timeframe controls with DOM APIs instead of innerHTML if options become user-supplied.
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

export function initChartControls() {
  bindTimeframeControls('portfolio-timeframe-controls', 'portfolio');
  bindTimeframeControls('asset-timeframe-controls', 'asset');
  bindZoomControls('portfolio-zoom-controls', 'portfolio');
  bindZoomControls('asset-zoom-controls', 'asset');
}

function getPortfolioChartSeries() {
  if (state.replay.active && state.replay.series.length) {
    const endIndex = Math.min(state.replay.index + 1, state.replay.series.length);
    return state.replay.series.slice(0, endIndex);
  }
  return filterSeriesByTimeframe(state.portfolioHistory, state.chartTimeframes.portfolio);
}

export function renderSandboxCharts() {
  const portfolioSeries = getPortfolioChartSeries();
  renderLineChart($('#portfolio-chart'), portfolioSeries, '#34d399', state.chartZoom.portfolio, $('#portfolio-inspect'));
  bindChartHover($('#portfolio-chart'), portfolioSeries, $('#portfolio-inspect'));

  const assetSeries = filterSeriesByTimeframe(state.priceHistory[state.activeAsset] ?? [], state.chartTimeframes.asset);
  renderLineChart($('#asset-chart'), assetSeries, '#60a5fa', state.chartZoom.asset, $('#asset-inspect'));
  bindChartHover($('#asset-chart'), assetSeries, $('#asset-inspect'));
}

export function renderReplayView() {
  const valueEl = $('#replay-portfolio-value');
  const chartEl = $('#replay-portfolio-chart');
  if (!valueEl || !chartEl) return;
  valueEl.textContent = formatCurrency(state.sandbox.balance + calculatePortfolioValue() - state.sandbox.balance);
  const series = filterSeriesByTimeframe(state.portfolioHistory, state.chartTimeframes.portfolio);
  renderLineChart(chartEl, series, '#a78bfa', state.chartZoom.portfolio, $('#replay-inspect'));
  bindChartHover(chartEl, series, $('#replay-inspect'));
  const desc = $('#replay-description');
  const scenario = replayScenarios.find((s) => s.id === state.marketReplay.scenarioId);
  if (desc) {
    desc.textContent = scenario
      ? scenario.description
      : 'Switch to a synthetic week to practice reacting to predefined patterns.';
  }
  updateReplayBadge();
}

export function renderReplaySelect() {
  const select = $('#replay-select');
  if (!select) return;
  const options = [`<option value="">Live sandbox</option>`]
    .concat(replayScenarios.map((scenario) => `<option value="${scenario.id}">${scenario.name}</option>`))
    .join('');
  // TODO: Populate replay select with option elements instead of concatenated HTML when scenarios are user-defined.
  select.innerHTML = options;
  select.value = state.marketReplay.scenarioId || '';
}

export function updateReplayControls() {
  const startBtn = $('#replay-start');
  const stopBtn = $('#replay-stop');
  if (startBtn) startBtn.disabled = state.replay.active;
  if (stopBtn) stopBtn.disabled = !state.replay.active;
}

export function stopPortfolioReplay(skipRender = false) {
  if (state.replay.timer) {
    clearInterval(state.replay.timer);
  }
  state.replay = { active: false, timer: null, index: 0, series: [] };
  updateReplayControls();
  if (!skipRender) {
    renderSandboxCharts();
  }
}

export function startPortfolioReplay() {
  const series = filterSeriesByTimeframe(state.portfolioHistory, state.chartTimeframes.portfolio);
  if (!series || series.length < 2) {
    showToast('Not enough history to replay yet.', 'info');
    return;
  }
  stopPortfolioReplay(true);
  state.replay = { active: true, timer: null, index: 0, series };
  updateReplayControls();
  renderSandboxCharts();
  state.replay.timer = setInterval(() => {
    if (!state.replay.active) return;
    state.replay.index += 1;
    if (state.replay.index >= state.replay.series.length - 1) {
      stopPortfolioReplay();
      return;
    }
    renderSandboxCharts();
  }, 450);
}

export function updateReplayBadge() {
  const badge = $('#replay-badge') || $('#replay-mode-badge');
  if (!badge) return;
  if (badge.id === 'replay-mode-badge') {
    if (state.sandboxMode !== 'replay') {
      badge.textContent = 'Live sandbox';
      return;
    }
    const scenario = state.marketReplay.scenarioId
      ? replayScenarios.find((s) => s.id === state.marketReplay.scenarioId)
      : null;
    badge.textContent = scenario ? `Replay: ${scenario.name}` : 'Replay idle';
    return;
  }
  badge.classList.toggle('hidden', !state.marketReplay.active);
}

function calculatePortfolioValue() {
  return (
    Number(state.sandbox.balance) +
    Object.entries(state.sandbox.holdings).reduce((total, [symbol, units]) => total + units * state.prices[symbol], 0)
  );
}

export { filterSeriesByTimeframe, renderLineChart };
