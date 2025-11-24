export const FORCE_DEMO_MODE = true; // set to false for real deployments

const storageKey = 'aether-supabase-overrides';

const canUseStorage = () => {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch (error) {
    console.warn('Storage unavailable', error);
    return false;
  }
};

const readOverrides = () => {
  if (!canUseStorage()) return {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) ?? {} : {};
  } catch (error) {
    console.warn('Unable to parse Supabase overrides', error);
    return {};
  }
};

const defaultOrigin = typeof window !== 'undefined' ? window.location.origin : undefined;

const providedGoogleRedirectHost =
  '983804861266-mm08o6gnraom8gltluomi8t5gvukic36.apps.googleusercontent.com';

const defaultConfig = {
  url: 'https://eaoiexsemsiqqpisjkhj.supabase.co',
  anonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhb2lleHNlbXNpcXFwaXNqa2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMTQ0OTcsImV4cCI6MjA3ODY5MDQ5N30.dXwq-aKuleIpBvFkefiw_KGFLte7kilgXwtHqpYeIwo',
  googleRedirectTo: providedGoogleRedirectHost ? `https://${providedGoogleRedirectHost}` : defaultOrigin
};

const runtimeOverrides = readOverrides();

export const supabaseConfig = {
  url: runtimeOverrides.url || defaultConfig.url,
  anonKey: runtimeOverrides.anonKey || defaultConfig.anonKey,
  googleRedirectTo: runtimeOverrides.googleRedirectTo || defaultConfig.googleRedirectTo
};

export const featureToggles = {
  autoMarkCompleteAfterQuiz: true,
  sandboxPriceUpdateMs: 7000,
  passingScore: 70
};

export function getSupabaseOverrides() {
  return { ...readOverrides() };
}

export function persistSupabaseOverrides(overrides = {}) {
  if (!canUseStorage()) return;
  const payload = {
    url: overrides.url?.trim() ?? '',
    anonKey: overrides.anonKey?.trim() ?? '',
    googleRedirectTo: overrides.googleRedirectTo?.trim() ?? ''
  };
  window.localStorage.setItem(storageKey, JSON.stringify(payload));
}

export function clearSupabaseOverrides() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(storageKey);
}

export function hasSupabaseCredentials() {
  return Boolean(
    supabaseConfig.url &&
      supabaseConfig.anonKey &&
      !supabaseConfig.url.includes('YOUR-PROJECT') &&
      !supabaseConfig.anonKey.includes('YOUR-ANON-KEY')
  );
}
