/**
 * Cleanup for short-video side actions.
 *
 * Douyin keeps rebuilding the immersive player action bar, so these features
 * use a small dynamic stylesheet instead of one-shot DOM edits — CSS applies
 * as the DOM forms, so freshly rebuilt buttons never flash into view.
 *
 * Most action buttons carry a stable `data-e2e` attribute. "听抖音" does not
 * (only hashed classes), so it's matched structurally: it's the action item
 * right before the "更多" button that — unlike avatar/like/comment/share —
 * holds no `data-e2e` descendant of its own.
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

  if (enabled('removeAvatar')) {
    // The avatar wrapper exposes different stable hooks per variant: feed posts
    // carry `video-avatar`; a livestreaming author's avatar instead links to
    // live.douyin.com (its `data-e2e` is the entry source, not stable). The
    // follow "+" shares the wrapper but vanishes once you follow — so cover all.
    rules.push(
      'div:has(>[data-e2e="video-avatar"]){display:none!important;}',
      'div:has(>[data-e2e="feed-follow-icon"]){display:none!important;}',
      'div:has(>a[href*="//live.douyin.com"]){display:none!important;}',
    );
  }

  if (enabled('removeLike')) {
    rules.push(
      '[data-e2e="video-player-digg"]{display:none!important;}',
      'div[style*="position: relative"]:has(>[data-e2e="video-player-digg"]){display:none!important;}',
    );
  }

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

  if (enabled('removeListen')) {
    rules.push(
      'div[aria-describedby]:not(:has([data-e2e])):has(+ [data-e2e="video-play-more"]){display:none!important;}',
    );
  }

  if (enabled('removeMore')) {
    rules.push(
      '[data-e2e="video-play-more"]{display:none!important;}',
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
      config.video.removeAvatar,
      config.video.removeLike,
      config.video.removeShare,
      config.video.removeFavorite,
      config.video.removeComment,
      config.video.removeListen,
      config.video.removeMore,
    ],
    syncStyle,
  );
}
