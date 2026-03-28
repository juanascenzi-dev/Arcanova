const OVERRIDES_KEY = 'austral_exp_overrides';

export interface ExpTextOverride {
  en?: string;
  es?: string;
}

export interface ExperienceAdminOverride {
  imageUrl?: string;
  visible?: boolean;
  title?: ExpTextOverride;
  desc?: ExpTextOverride;
}

type AdminOverrides = Record<string, ExperienceAdminOverride>;

export function getAdminOverrides(): AdminOverrides {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as AdminOverrides) : {};
  } catch {
    return {};
  }
}

export function saveAdminOverride(id: string, data: ExperienceAdminOverride): void {
  const all = getAdminOverrides();
  all[id] = { ...all[id], ...data };
  try {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(all));
  } catch {
    // silent fail
  }
}

export function resetAdminOverride(id: string): void {
  const all = getAdminOverrides();
  delete all[id];
  try {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(all));
  } catch {
    // silent fail
  }
}

export function clearAllAdminOverrides(): void {
  try {
    localStorage.removeItem(OVERRIDES_KEY);
  } catch {
    // silent fail
  }
}
