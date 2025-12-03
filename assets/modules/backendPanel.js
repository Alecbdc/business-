import { supabaseConfig, getSupabaseOverrides, persistSupabaseOverrides, clearSupabaseOverrides, FORCE_DEMO_MODE } from '../config.js';
import { $, showToast } from './ui.js';

export function updateBackendStatus(isSupabaseConfigured) {
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

function reloadSoon() {
  setTimeout(() => window.location.reload(), 900);
}

export function initBackendSettingsPanel() {
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
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      clearSupabaseOverrides();
      showToast('Demo mode restored. Reloading...', 'info');
      reloadSoon();
    });
  }
}
