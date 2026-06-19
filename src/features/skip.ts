/**
 * Auto-skip engine for the recommend feed.
 *
 * The detection rules intentionally mirror `example/jump.js`: only fully
 * visible markers in the left 2/3 of the viewport are considered. This avoids
 * Douyin's virtual-list offscreen/next-item DOM from being mistaken for the
 * currently playing video.
 */

import { config } from '@/config/store';
import { showToast } from './toast';

const DEFAULT_DETECT_INTERVAL_MS = 500;
const MIN_DETECT_INTERVAL_MS = 100;
const MAX_DETECT_INTERVAL_MS = 5000;
const COOLDOWN_MS = 1000;
const AD_LABEL_MAX_WIDTH = 120;
const AD_LABEL_MAX_HEIGHT = 48;
const AD_CTA_MAX_WIDTH = 220;
const AD_CTA_MAX_HEIGHT = 64;
const AD_CTA_MAX_TEXT_LENGTH = 24;
const AD_LABEL_RE = /(^|[·|｜/\\\-【[(（])(?:广告|品牌广告)([·|｜/\\\-】\])）]|$)/;
const AD_CTA_RE = /推广|赞助|立即(了解|查看|领取|体验|下载|预约|咨询|购买)|去看看|查看详情|了解详情/;

let isSkipping = false;
let timer: number | undefined;

function detectInterval(): number {
  const value = config.video.detectInterval;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_DETECT_INTERVAL_MS;
  }
  return Math.min(Math.max(value, MIN_DETECT_INTERVAL_MS), MAX_DETECT_INTERVAL_MS);
}

function isFeedHost(): boolean {
  return location.hostname === 'www.douyin.com' || location.hostname === 'douyin.com';
}

function simulateArrowDown(): void {
  const target = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : document.body || document.documentElement || document;

  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      code: 'ArrowDown',
      keyCode: 40,
      which: 40,
      bubbles: true,
      cancelable: true,
    }),
  );
}

function normalizeText(text: string): string {
  return text.replace(/[\s\u200b-\u200f\ufeff]+/g, '');
}

function elementText(el: HTMLElement): string {
  return (
    el.innerText ||
    el.textContent ||
    el.getAttribute('aria-label') ||
    el.getAttribute('title') ||
    ''
  ).trim();
}

function isCompact(el: HTMLElement, maxWidth: number, maxHeight: number): boolean {
  return el.offsetWidth < maxWidth && el.offsetHeight < maxHeight;
}

function executeSkip(): void {
  if (isSkipping) return;

  isSkipping = true;
  simulateArrowDown();
  window.setTimeout(() => {
    isSkipping = false;
  }, COOLDOWN_MS);
}

/**
 * Ported from `example/jump.js`.
 *
 * The strict `top >= 0 && bottom <= viewport` check is deliberate: Douyin keeps
 * next/previous videos mounted in a virtual list, so partial intersection is
 * not enough to mean "current video".
 */
function isElementInViewport(el: Element | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const rect = el.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  return (
    rect.top >= 0 &&
    rect.bottom <= windowHeight &&
    rect.left < windowWidth * 0.66 &&
    rect.width > 10 &&
    rect.height > 10
  );
}

function isInSidebar(el: Element): boolean {
  return !!(
    el.closest('[class*="drawer"]') ||
    el.closest('[class*="sideslip"]') ||
    el.closest('[class*="UserPanel"]')
  );
}

function checkAd(): boolean {
  if (!config.video.skipAd) return false;

  for (const el of document.querySelectorAll<HTMLElement>('button, a, div, span')) {
    if (!isElementInViewport(el) || isInSidebar(el)) continue;

    const text = elementText(el);
    if (!text) continue;

    const cleanText = normalizeText(text);
    if (
      cleanText.length <= AD_CTA_MAX_TEXT_LENGTH &&
      AD_LABEL_RE.test(cleanText) &&
      isCompact(el, AD_LABEL_MAX_WIDTH, AD_LABEL_MAX_HEIGHT)
    ) {
      showToast('发现广告，已跳过');
      executeSkip();
      return true;
    }

    if (
      AD_CTA_RE.test(cleanText) &&
      cleanText.length < AD_CTA_MAX_TEXT_LENGTH &&
      isCompact(el, AD_CTA_MAX_WIDTH, AD_CTA_MAX_HEIGHT)
    ) {
      showToast('发现广告，已跳过');
      executeSkip();
      return true;
    }
  }

  return false;
}

function checkShop(): boolean {
  if (!config.video.skipShop) return false;

  const cart = document.querySelector('[data-e2e="video-cart-entry"]');
  if (cart && isElementInViewport(cart)) {
    showToast('发现购物车，已跳过');
    executeSkip();
    return true;
  }

  const matches = document.evaluate(
    "//*[contains(text(), '购物')]",
    document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null,
  );

  for (let i = 0; i < matches.snapshotLength; i++) {
    const el = matches.snapshotItem(i) as HTMLElement | null;
    if (!el || !isElementInViewport(el) || el.offsetParent === null) continue;

    const text = el.innerText.trim();
    const parentText = el.parentElement?.innerText.trim() ?? '';
    if (text.includes('车') || parentText.includes('车')) continue;

    const combinedText = `${text} ${parentText}`;
    const looksLikeProduct =
      combinedText.includes('|') ||
      combinedText.includes('销量') ||
      combinedText.includes('评价') ||
      combinedText.includes('同款') ||
      combinedText.includes('推荐') ||
      combinedText.includes('抢购');

    if (looksLikeProduct && el.offsetWidth < 350 && el.offsetHeight < 100) {
      showToast('发现购物链接，已跳过');
      executeSkip();
      return true;
    }
  }

  return false;
}

function checkLive(): boolean {
  if (!config.video.skipLive) return false;

  const matches = document.evaluate(
    "//*[text()='直播中']",
    document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null,
  );

  for (let i = 0; i < matches.snapshotLength; i++) {
    const el = matches.snapshotItem(i) as HTMLElement | null;
    if (!el || !isElementInViewport(el) || el.offsetParent === null) continue;

    showToast('发现直播，已跳过');
    executeSkip();
    return true;
  }

  return false;
}

function scan(): void {
  if (isSkipping || !config.enabled) return;

  if (checkAd()) return;
  if (checkShop()) return;
  checkLive();
}

function runLoop(): void {
  scan();
  timer = window.setTimeout(runLoop, detectInterval());
}

function startLoop(): void {
  if (timer !== undefined) return;
  runLoop();
}

export function startSkipEngine(): void {
  if (!isFeedHost()) return;
  if (document.body) {
    startLoop();
    return;
  }

  window.addEventListener('DOMContentLoaded', startLoop, { once: true });
}
