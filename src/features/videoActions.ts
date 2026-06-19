/**
 * Cleanup for short-video side actions.
 *
 * Douyin keeps rebuilding the immersive player action bar, so these features
 * use a small dynamic stylesheet instead of one-shot DOM edits.
 */

import { watch } from 'vue';
import { config } from '@/config/store';

const STYLE_ID = 'fd-video-actions-style';

function isFeedHost(): boolean {
  return location.hostname === 'www.douyin.com' || location.hostname === 'douyin.com';
}

function enabled(key: string): boolean {
  return config.enabled && config.video[key] === true;
}

function css(): string {
  const rules: string[] = [];

  if (enabled('removeShare')) {
    rules.push(
      '[data-e2e="video-player-share"]{display:none!important;}',
    );
  }

  if (enabled('removeFavorite')) {
    rules.push(
      '[data-e2e="video-player-collect"]{display:none!important;}',
    );
  }

  if (enabled('removeComment')) {
    rules.push(
      '[data-e2e="feed-comment-icon"]{display:none!important;}',
      'div[style*="position: relative"]:has(>[data-e2e="feed-comment-icon"]){display:none!important;}',
    );
  }

  return rules.join('\n');
}

function syncStyle(): void {
  let style = document.getElementById(STYLE_ID);
  const text = css();

  if (!text) {
    style?.remove();
    return;
  }

  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = text;
}

export function startVideoActionsEngine(): void {
  if (!isFeedHost()) return;

  syncStyle();
  watch(
    () => [
      config.enabled,
      config.video.removeShare,
      config.video.removeFavorite,
      config.video.removeComment,
    ],
    syncStyle,
  );
}
