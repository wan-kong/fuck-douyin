/**
 * Auto-select the highest available quality on Douyin's short-video player.
 *
 * Ported from `example/jump.js`: find the current quality trigger, hover it to
 * open the quality menu, then click the best available option by priority.
 */

import { config } from '@/config/store';

const QUALITIES = ['超清 4K', '超清 2K', '高清 1080P'];
const QUALITY_KEYWORDS = ['智能', '标清', '高清', '超清', '4K', '1080P', '720P'];
const CHECK_MS = 800;
const MENU_DELAY_MS = 300;
const MAX_ATTEMPTS_PER_VIDEO = 10;

let timer: number | undefined;
let lastVideoSrc = '';
let checked = false;
let attempts = 0;
let selecting = false;

function isFeedHost(): boolean {
  return location.hostname === 'www.douyin.com' || location.hostname === 'douyin.com';
}

function enabled(): boolean {
  return config.enabled && config.video.autoHD === true;
}

function triggerPointerEvent(element: Element | null, eventType: string): void {
  if (!element) return;
  element.dispatchEvent(
    new PointerEvent(eventType, {
      bubbles: true,
      cancelable: true,
      view: window,
      pointerId: 1,
      width: 1,
      height: 1,
      isPrimary: true,
      pointerType: 'mouse',
    }),
  );
}

function findResolutionButton(): HTMLElement | null {
  for (const tag of ['span', 'div']) {
    const els = document.getElementsByTagName(tag);
    for (let i = els.length - 1; i >= 0; i--) {
      const el = els[i] as HTMLElement;
      const text = el.innerText?.trim();
      if (!text) continue;
      if (!QUALITY_KEYWORDS.some((keyword) => text.includes(keyword))) continue;
      if (el.clientHeight > 10 && el.clientHeight < 50 && el.clientWidth < 150) {
        return el;
      }
    }
  }
  return null;
}

function clickQualityOption(option: HTMLElement, trigger: HTMLElement): void {
  triggerPointerEvent(option, 'pointerdown');
  triggerPointerEvent(option, 'mousedown');
  triggerPointerEvent(option, 'pointerup');
  triggerPointerEvent(option, 'mouseup');
  option.click();

  triggerPointerEvent(trigger, 'pointerout');
  triggerPointerEvent(trigger, 'pointerleave');
  triggerPointerEvent(document.querySelector('.xgplayer-container') || document.body, 'pointermove');
}

function findQualityOption(label: string, trigger: HTMLElement): HTMLElement | null {
  for (const node of document.querySelectorAll<HTMLElement>('div, span, p')) {
    if (node === trigger) continue;
    if (node.innerText?.trim() === label) return node;
  }
  return null;
}

function syncVideoState(): HTMLVideoElement | null {
  const video = document.querySelector<HTMLVideoElement>('video');
  const src = video?.currentSrc || video?.src || '';
  if (src && src !== lastVideoSrc) {
    lastVideoSrc = src;
    checked = false;
    attempts = 0;
  }
  return video;
}

function markChecked(): void {
  checked = true;
  selecting = false;
}

function checkVideoQuality(): void {
  if (!enabled()) {
    checked = false;
    selecting = false;
    return;
  }
  if (checked || selecting) return;

  const video = syncVideoState();
  if (!video) return;
  if (attempts >= MAX_ATTEMPTS_PER_VIDEO) {
    checked = true;
    return;
  }

  const trigger = findResolutionButton();
  if (!trigger) return;

  const currentText = trigger.innerText || '';
  if (currentText.includes('4K')) {
    checked = true;
    return;
  }

  attempts += 1;
  selecting = true;
  triggerPointerEvent(trigger, 'pointerover');
  triggerPointerEvent(trigger, 'pointerenter');

  window.setTimeout(() => {
    let foundTarget = false;

    for (const quality of QUALITIES) {
      if (currentText.includes(quality)) {
        foundTarget = true;
        break;
      }

      const option = findQualityOption(quality, trigger);
      if (!option) continue;

      clickQualityOption(option, trigger);
      foundTarget = true;
      break;
    }

    if (foundTarget || !currentText.includes('智能')) {
      markChecked();
      triggerPointerEvent(trigger, 'pointerleave');
      return;
    }

    selecting = false;
  }, MENU_DELAY_MS);
}

export function startQualityEngine(): void {
  if (timer !== undefined) return;
  if (!isFeedHost()) return;

  timer = window.setInterval(checkVideoQuality, CHECK_MS);
  checkVideoQuality();
}
