/**
 * Tiny persistence helper shared by the config store and UI state (e.g. the
 * float button position). Uses Tampermonkey's GM storage when present, and
 * falls back to localStorage so everything also works in a plain dev browser.
 */

type GMGet = (key: string, def?: unknown) => unknown;
type GMSet = (key: string, value: unknown) => void;

const gmGet: GMGet | undefined =
  typeof GM_getValue === 'function' ? GM_getValue : undefined;
const gmSet: GMSet | undefined =
  typeof GM_setValue === 'function' ? GM_setValue : undefined;

export function loadValue<T>(key: string, fallback: T): T {
  try {
    if (gmGet) {
      const value = gmGet(key, null);
      return value == null ? fallback : (value as T);
    }
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveValue(key: string, value: unknown): void {
  try {
    if (gmSet) gmSet(key, value);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* persistence is best-effort */
  }
}
