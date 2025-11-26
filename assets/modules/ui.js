const elements = {};

export function $(selector) {
  if (!selector) return null;
  const key = selector.startsWith('#') ? selector.slice(1) : selector;
  if (!elements[key]) {
    elements[key] = document.getElementById(key);
  }
  return elements[key];
}

export function bind(selector, event, handler) {
  const el = $(selector);
  if (!el) {
    console.warn(`Missing element for selector: ${selector}`);
    return;
  }
  el.addEventListener(event, handler);
}

export function showToast(message, type = 'info') {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `card-glass rounded-2xl p-4 text-sm ${
    type === 'error' ? 'bg-rose-600/80' : type === 'success' ? 'bg-emerald-600/80' : 'bg-slate-900/90'
  }`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

export function setView(state, view, hooks = {}) {
  const {
    stopReplayIfNeeded,
    updateCurriculumSidebarVisibility,
    updateSandboxSidebarVisibility,
    onEnterSandbox,
    onEnterArticle,
    onEnterCurriculum
  } = hooks;

  if (view !== 'sandbox' && typeof stopReplayIfNeeded === 'function') {
    stopReplayIfNeeded();
  }

  state.currentView = view;

  if (typeof updateCurriculumSidebarVisibility === 'function') {
    updateCurriculumSidebarVisibility(view);
  }
  if (typeof updateSandboxSidebarVisibility === 'function') {
    updateSandboxSidebarVisibility(view);
  }

  document.querySelectorAll('.app-view').forEach((section) => {
    section.classList.toggle('hidden', section.id !== `view-${view}`);
  });
  document.querySelectorAll('[data-view]').forEach((btn) => {
    const isActive = btn.dataset.view === view;
    btn.classList.toggle('active', isActive);
  });

  if (view === 'sandbox' && typeof onEnterSandbox === 'function') {
    onEnterSandbox();
  }
  if (view === 'article' && typeof onEnterArticle === 'function') {
    onEnterArticle();
  }
  if (view === 'curriculum' && typeof onEnterCurriculum === 'function') {
    onEnterCurriculum();
  }
}
