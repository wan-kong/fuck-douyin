/**
 * Feature-application layer entry point.
 *
 * `src/config` declares *what* is configurable; this directory implements *how*
 * those flags act on the Douyin page. Each feature reads the reactive `config`
 * from the store so panel toggles take effect live. `startFeatures()` is called
 * once from main.ts after the app mounts.
 */

import { startSkipEngine } from './skip';
import { startQualityEngine } from './quality';
import { startLiveEngine } from './live';
import { startVideoActionsEngine } from './videoActions';

export function startFeatures(): void {
  startSkipEngine();
  startQualityEngine();
  startVideoActionsEngine();
  startLiveEngine();
}
