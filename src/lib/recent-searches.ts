const STORAGE_KEY = "blogcore:recent-authors";
const MAX_ITEMS = 8;

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(username: string): string[] {
  const value = username.trim();
  if (!value || typeof window === "undefined") return getRecentSearches();
  const next = [value, ...getRecentSearches().filter((item) => item !== value)].slice(0, MAX_ITEMS);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable
  }
  return next;
}
