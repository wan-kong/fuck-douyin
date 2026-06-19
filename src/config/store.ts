/**
 * Reactive config store.
 *
 * - Loads persisted config, deep-merged over schema defaults (so newly added
 *   features get their default without wiping the user's existing choices).
 * - Persists every change automatically via a deep watcher.
 * - Uses Tampermonkey's GM_getValue/GM_setValue when available, and falls back
 *   to localStorage so the panel also works in a plain `vite dev` browser.
 */

import { reactive, watch } from 'vue';
import { loadValue, saveValue } from './storage';
import {
  createDefaultConfig,
  SCHEMA,
  type AppConfig,
  type GroupId,
} from './schema';

const STORAGE_KEY = 'fd_config';

/** Merge persisted values over defaults, keeping only keys known to the schema. */
function hydrate(): AppConfig {
  const defaults = createDefaultConfig();
  const stored = loadValue<Partial<AppConfig> | null>(STORAGE_KEY, null);
  if (!stored) return defaults;

  if (typeof stored.enabled === 'boolean') defaults.enabled = stored.enabled;
  for (const group of SCHEMA) {
    const storedGroup = stored[group.id];
    if (!storedGroup) continue;
    for (const item of group.items) {
      const value = storedGroup[item.key];
      const type = item.type ?? 'boolean';
      if (type === 'boolean' && typeof value === 'boolean') {
        defaults[group.id][item.key] = value;
      }
      if (type === 'number' && typeof value === 'number' && Number.isFinite(value)) {
        defaults[group.id][item.key] = value;
      }
    }
  }
  return defaults;
}

export const config = reactive<AppConfig>(hydrate());

watch(config, (value) => saveValue(STORAGE_KEY, value), { deep: true });

/** Reset every flag back to its schema default. */
export function resetConfig(): void {
  const defaults = createDefaultConfig();
  config.enabled = defaults.enabled;
  for (const group of SCHEMA) {
    Object.assign(config[group.id], defaults[group.id]);
  }
}

/** Count of enabled features in a group, for the header summary. */
export function activeCount(groupId: GroupId): number {
  return Object.values(config[groupId]).filter((value) => value === true).length;
}
