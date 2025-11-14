import { courses, defaultSandboxState, initialPrices } from './data.js';
import {
  supabaseConfig,
  featureToggles,
  getSupabaseOverrides,
  persistSupabaseOverrides,
  clearSupabaseOverrides,
  hasSupabaseCredentials
} from './config.js';

const cacheKey = 'aether-cache-v2';
const historyLimit = 60;
const assetSymbols = Object.keys(initialPrices);
const passingScoreThreshold = Number(featureToggles.passingScore ?? 70);
const autoCompleteAfterQuiz = featureToggles.autoMarkCompleteAfterQuiz !== false;

const isSupabaseConfigured = hasSupabaseCredentials();

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

const state = {
  user: null,
  profile: null,
  previewMode: false,
  currentView: 'dashboard',
  selectedLessonId: courses[0]?.lessons[0]?.id ?? null,
  progress: {},
  quizScores: {},
  quizLog: [],
  sandbox: {
    balance: defaultSandboxState.balance,
    holdings: normalizeHoldings(defaultSandboxState.holdings),
    history: defaultSandboxState.history ?? []
  },
  prices: { ...initialPrices },
  priceHistory: Object.fromEntries(Object.entries(initialPrices).map(([symbol, value]) => [symbol, [value]])),
  portfolioHistory: [defaultSandboxState.balance],
  activeAsset: assetSymbols[0] ?? 'BTC'
};

const elements = {};

function $(id) {
  if (!elements[id]) {
    elements[id] = document.getElementById(id);
  }
  return elements[id];
}

function setProfileName(value) {
  document.querySelectorAll('[data-profile-name]').forEach((node) => {
    node.textContent = value;
  });
}

function updateBackendStatus() {
  const status = $('#backend-status');
  if (!status) return;
  const label = isSupabaseConfigured ? 'Supabase connected' : 'Demo mode';
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
    state.quizLog = (parsed.quizLog ?? []).map((entry) => ({
      ...entry,
      passed: entry.passed ?? (entry.score != null && entry.score >= passingScoreThreshold)
    }));
    state.sandbox = parsed.sandbox ?? { ...deepClone(defaultSandboxState) };
    state.sandbox.balance = Number(state.sandbox.balance ?? defaultSandboxState.balance);
    state.sandbox.holdings = normalizeHoldings(state.sandbox.holdings);
    state.sandbox.history = state.sandbox.history ?? [];
  } catch (err) {
    console.warn('Failed to hydrate cache', err);
  }
}

function persistCache() {
  try {
    const payload = {
      progress: state.progress,
      quizScores: state.quizScores,
      quizLog: state.quizLog,
      sandbox: state.sandbox
    };
    localStorage.setItem(cacheKey, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to persist cache', err);
  }
}

function resetHistorySnapshots() {
  state.priceHistory = Object.entries(state.prices).reduce((acc, [symbol, value]) => {
    acc[symbol] = [value];
    return acc;
  }, {});
  state.portfolioHistory = [calculatePortfolioValue()];
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

function findLesson(lessonId) {
  for (const course of courses) {
    const lesson = course.lessons.find((l) => l.id === lessonId);
    if (lesson) return { lesson, course };
  }
  return { lesson: null, course: null };
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
  container.innerHTML = `
    <div>
      <p class="text-sm text-slate-400">${course?.title ?? 'Course'}</p>
      <h3 class="text-2xl font-semibold mt-1">${lesson.title}</h3>
      <p class="text-slate-400 text-sm">${lesson.duration} • ${lesson.summary}</p>
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
    <div class="flex items-center justify-between text-sm text-slate-400">
      <p>${progress?.completed ? 'Completed' : 'In progress'}</p>
      <p>${progress?.quiz_score ? `Last quiz: ${progress.quiz_score}%` : 'No quiz yet'}</p>
    </div>
  `;
  const completeBtn = $('#complete-lesson-btn');
  if (completeBtn) {
    const completed = Boolean(progress?.completed);
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
  const nextLesson = (() => {
    for (const course of courses) {
      const pending = course.lessons.find((lesson) => !state.progress[lesson.id]?.completed);
      if (pending) return { lesson: pending, course };
    }
    const fallback = courses[0]?.lessons[0];
    return fallback ? { lesson: fallback, course: courses[0] } : null;
  })();
  container.innerHTML = `
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-sm text-slate-400">Overall progress</p>
        <h3 class="text-3xl font-semibold">${completed}/${totalLessons} lessons • ${percent}%</h3>
        <div class="w-full h-3 rounded-full bg-white/5 overflow-hidden mt-4">
          <span class="block h-full bg-emerald-400" style="width: ${percent}%;"></span>
        </div>
      </div>
      <div class="rounded-2xl bg-white/5 p-4">
        <p class="text-xs text-slate-400">Up next</p>
        <p class="text-lg font-semibold">${nextLesson?.lesson.title ?? 'All lessons done!'}</p>
        <p class="text-sm text-slate-400">${nextLesson?.course.title ?? 'You can review any module.'}</p>
      </div>
    </div>
  `;
}

function renderQuiz() {
  const form = $('#quiz-form');
  if (!form) return;
  const chip = $('#quiz-score-chip');
  const { lesson } = findLesson(state.selectedLessonId);
  if (!lesson) {
    form.innerHTML = '<p class="text-slate-400">Choose a lesson to access its quiz.</p>';
    chip?.classList.add('hidden');
    return;
  }
  form.innerHTML = lesson.quiz
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
    const score = state.quizScores[lesson.id];
    chip.textContent = score != null ? `${score}%` : 'Score';
    chip.classList.toggle('hidden', score == null);
  }
}

function renderQuizThresholdHint() {
  const hint = $('#quiz-threshold');
  if (!hint) return;
  const requirement = autoCompleteAfterQuiz
    ? `Score ${passingScoreThreshold}%+ to auto-complete the lesson.`
    : `Passing score is ${passingScoreThreshold}%. Use the complete button to finish the lesson.`;
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
            <p class="text-sm font-medium">${entry.lessonTitle}</p>
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

function renderDashboard() {
  const lessonsComplete = Object.values(state.progress).filter((p) => p.completed).length;
  $('#dashboard-lessons').textContent = lessonsComplete;
  const quizValues = Object.values(state.quizScores);
  const avg = quizValues.length ? Math.round(quizValues.reduce((acc, val) => acc + val, 0) / quizValues.length) : 0;
  $('#dashboard-quiz').textContent = `${avg}%`;
  $('#dashboard-sandbox').textContent = formatCurrency(calculatePortfolioValue());
  renderQuizLog();
  renderProgressList();
}

function drawLineChart(canvas, values, color) {
  if (!canvas) return;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height) return;
  const dpr = window.devicePixelRatio ?? 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);
  const points = values.length ? values : [0];
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.beginPath();
  points.forEach((value, idx) => {
    const x = (idx / (points.length - 1 || 1)) * width;
    const y = height - ((value - min) / range) * height;
    if (idx === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
}

function renderSandboxCharts() {
  drawLineChart($('#portfolio-chart'), state.portfolioHistory, '#34d399');
  drawLineChart($('#asset-chart'), state.priceHistory[state.activeAsset] ?? [], '#60a5fa');
}

function renderSandbox() {
  $('#sandbox-balance').textContent = formatCurrency(state.sandbox.balance);
  $('#sandbox-portfolio-value').textContent = formatCurrency(calculatePortfolioValue());
  const holdingsContainer = $('#sandbox-holdings');
  const historyContainer = $('#sandbox-history');
  const holdingsEntries = Object.entries(state.sandbox.holdings)
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

  const pricesContainer = $('#sandbox-prices');
  pricesContainer.innerHTML = Object.entries(state.prices)
    .map(([symbol, price]) => {
      const history = state.priceHistory[symbol] ?? [];
      const prev = history.length > 1 ? history[history.length - 2] : price;
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
    });
  });

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
  const { lesson } = findLesson(state.selectedLessonId);
  if (!lesson) return;
  const formData = new FormData($('#quiz-form'));
  let correct = 0;
  lesson.quiz.forEach((question) => {
    const response = Number(formData.get(question.id));
    if (response === question.answer) correct += 1;
  });
  const score = Math.round((correct / lesson.quiz.length) * 100);
  const passed = score >= passingScoreThreshold;
  state.quizScores[lesson.id] = score;
  const now = new Date().toISOString();
  const previous = state.progress[lesson.id] ?? {};
  state.progress[lesson.id] = {
    completed: autoCompleteAfterQuiz && passed ? true : Boolean(previous.completed),
    quiz_score: score,
    updated_at: now
  };
  state.quizLog.push({ lessonId: lesson.id, lessonTitle: lesson.title, score, passed, ts: now });
  state.quizLog = state.quizLog.slice(-40);
  persistCache();
  renderQuiz();
  renderCurriculumSummary();
  renderDashboard();
  if (state.user && supabaseClient) {
    await Promise.all([
      supabaseClient.from('quiz_attempts').insert({
        user_id: state.user.id,
        lesson_id: lesson.id,
        score,
        passed
      }),
      supabaseClient.from('lesson_progress').upsert({
        user_id: state.user.id,
        lesson_id: lesson.id,
        completed: state.progress[lesson.id]?.completed ?? false,
        quiz_score: score
      })
    ]);
  }
  const toastMsg = passed
    ? `You scored ${score}% and cleared the ${passingScoreThreshold}% threshold.`
    : `You scored ${score}%. ${passingScoreThreshold}% is needed to pass.`;
  showToast(toastMsg, passed ? 'success' : 'info');
}

function randomizePrice(price) {
  const delta = (Math.random() - 0.5) * 0.04;
  return Math.max(0, price * (1 + delta));
}

function recordPriceSnapshot() {
  Object.keys(state.prices).forEach((symbol) => {
    if (!state.priceHistory[symbol]) state.priceHistory[symbol] = [];
    state.priceHistory[symbol].push(state.prices[symbol]);
    state.priceHistory[symbol] = state.priceHistory[symbol].slice(-historyLimit);
  });
}

function recordPortfolioSnapshot() {
  state.portfolioHistory.push(calculatePortfolioValue());
  state.portfolioHistory = state.portfolioHistory.slice(-historyLimit);
}

function tickPrices() {
  Object.keys(state.prices).forEach((symbol) => {
    state.prices[symbol] = randomizePrice(state.prices[symbol]);
  });
  recordPriceSnapshot();
  recordPortfolioSnapshot();
  renderSandbox();
  renderDashboard();
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

async function handleBuy(event) {
  event.preventDefault();
  const amount = Number($('#buy-amount').value);
  const asset = $('#buy-asset').value;
  if (!state.sandbox.holdings[asset]) {
    state.sandbox.holdings[asset] = 0;
  }
  if (amount <= 0 || amount > state.sandbox.balance) {
    showToast('Insufficient balance', 'error');
    return;
  }
  const price = state.prices[asset];
  const units = amount / price;
  state.sandbox.balance -= amount;
  state.sandbox.holdings[asset] += units;
  recordTrade({ type: 'BUY', detail: `${asset} @ ${price.toFixed(2)} (${units.toFixed(4)} units)` });
  await syncSandbox();
  $('#buy-form').reset();
  showToast('Purchase executed', 'success');
}

async function handleSell(event) {
  event.preventDefault();
  const units = Number($('#sell-amount').value);
  const asset = $('#sell-asset').value;
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
  state.sandbox.holdings[asset] = Math.max(0, state.sandbox.holdings[asset] - units);
  recordTrade({ type: 'SELL', detail: `${asset} @ ${price.toFixed(2)} (${units.toFixed(4)} units)` });
  await syncSandbox();
  $('#sell-form').reset();
  showToast('Sale executed', 'success');
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
  if (overrides.url) urlInput.value = overrides.url;
  if (overrides.anonKey) keyInput.value = overrides.anonKey;
  if (redirectInput) {
    redirectInput.value = overrides.googleRedirectTo || window.location.origin;
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
  $('#signup-form').addEventListener('submit', handleSignup);
  $('#login-form').addEventListener('submit', handleLogin);
  $('#google-auth').addEventListener('click', handleGoogle);
  $('#logout-btn').addEventListener('click', handleLogout);
  $('#complete-lesson-btn').addEventListener('click', handleMarkComplete);
  $('#submit-quiz').addEventListener('click', handleQuizSubmit);
  $('#buy-form').addEventListener('submit', handleBuy);
  $('#sell-form').addEventListener('submit', handleSell);
  $('#refresh-courses').addEventListener('click', renderCourses);
  $('#enter-demo').addEventListener('click', handleDemoEntry);
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
    renderQuiz();
    renderSandbox();
    renderDashboard();
  });
}

function init() {
  setProfileName('Guest');
  hydrateCache();
  resetHistorySnapshots();
  renderCourses();
  renderCurriculumSummary();
  renderLessonDetail();
  renderQuiz();
  renderQuizThresholdHint();
  renderSandbox();
  renderDashboard();
  bindEvents();
  startPriceLoop();
  initAuthListener();
  bootstrapUser();
  toggleDemoHint();
  updateBackendStatus();
  initBackendSettingsPanel();
  if (!supabaseClient) {
    handleDemoEntry(true);
  }
}

window.addEventListener('DOMContentLoaded', init);
