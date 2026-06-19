/**
 * Live-room cleanup features: dynamic stylesheet for static hides, plus
 * hover-and-click automation for the gift-effect / danmaku settings panels.
 */

import { config } from '@/config/store';

const STYLE_ID = 'fd-live-style';
const HIDDEN_CLASS = 'fd-live-hidden';
const CHECK_MS = 1500;
const QUALITY_DELAY_MS = 5000;

let timer: number | undefined;
let triedQuality = false;
let triedGiftSettings = false;
let applyingGiftSettings = false;
let lastRoomKey = '';

function isLiveHost(): boolean {
  return location.hostname === 'live.douyin.com';
}

function enabled(key: string): boolean {
  return config.enabled && config.live[key] === true;
}

function syncRoomState(): void {
  const roomKey = location.pathname;
  if (roomKey === lastRoomKey) return;

  lastRoomKey = roomKey;
  triedQuality = false;
  triedGiftSettings = false;
  applyingGiftSettings = false;
}

function css(): string {
  const rules: string[] = [];

  if (enabled('removeGiftBar')) {
    rules.push(
      '#BottomLayout{display:none!important;}',
      '.xg-inner-controls{bottom:8px!important;}',
    );
  }

  if (enabled('removeGiftAnim')) {
    rules.push(
      '#flutterLike{display:none!important;}',
      '.VLPIYL3T{display:none!important;}',
      '.gpFFz2G_{display:none!important;}',
    );
  }

  if (enabled('removeAdvancedDanmaku')) {
    rules.push(
      '.YqmICJp1{opacity:0!important;}',
      '.webcast-chatroom___bottom-message{opacity:0!important;}',
      '.Mv2estbj{display:none!important;}',
      '.Y0sC3Fms{display:none!important;}',
      '.ZUGMpBcb{display:none!important;}',
    );
  }

  if (enabled('removeRoomInfoTags')) {
    rules.push(`.${HIDDEN_CLASS}{display:none!important;}`, '#room_info_bar{display:none!important;}');
  }

  return rules.join('\n');
}

function syncStyle(): void {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = css();
}

function removeHiddenMarkers(): void {
  for (const el of document.querySelectorAll(`.${HIDDEN_CLASS}`)) {
    el.classList.remove(HIDDEN_CLASS);
  }
}

function normalizeText(el: Element): string {
  return el.textContent?.replace(/\s+/g, '') ?? '';
}

function pointsToLiveHome(anchor: HTMLAnchorElement): boolean {
  try {
    const url = new URL(anchor.href, location.href);
    return url.hostname === 'live.douyin.com' && url.pathname === '/';
  } catch {
    return false;
  }
}

function hideSmallAnchorContainer(anchor: HTMLAnchorElement): void {
  const parent = anchor.parentElement;
  if (parent && parent.childElementCount === 1) {
    parent.classList.add(HIDDEN_CLASS);
    return;
  }

  anchor.classList.add(HIDDEN_CLASS);
}

function syncRoomInfoTags(): void {
  if (!enabled('removeRoomInfoTags')) {
    removeHiddenMarkers();
    return;
  }

  for (const anchor of document.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    if (!pointsToLiveHome(anchor)) continue;
    if (!normalizeText(anchor).includes('更多直播')) continue;
    hideSmallAnchorContainer(anchor);
  }
}

function targetElement(el: Element): Element {
  if (el instanceof HTMLSlotElement && el.assignedElements) {
    return el.assignedElements()[0] ?? el;
  }
  return el;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function simulateHover(el: Element | null, delay = 500): Promise<Element | null> {
  if (!el) return null;

  const target = targetElement(el);
  const rect = target.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const eventOptions = {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: centerX,
    clientY: centerY,
    buttons: 0,
  };

  for (const eventType of ['mouseover', 'mouseenter', 'mousemove']) {
    target.dispatchEvent(new MouseEvent(eventType, eventOptions));
  }
  target.dispatchEvent(
    new MouseEvent('mousemove', {
      ...eventOptions,
      clientX: centerX + 1,
      clientY: centerY + 1,
    }),
  );

  await sleep(delay);
  return target;
}

async function simulateLeave(el: Element | null, delay = 500): Promise<void> {
  if (!el) return;

  const target = targetElement(el);
  const rect = target.getBoundingClientRect();
  const eventOptions = {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: rect.left - 10,
    clientY: rect.top - 10,
    buttons: 0,
  };

  for (const eventType of ['mousemove', 'mouseout', 'mouseleave']) {
    target.dispatchEvent(new MouseEvent(eventType, eventOptions));
  }
  document.querySelector('.UMXOdhRc')?.dispatchEvent(new MouseEvent('mouseleave', eventOptions));
  await sleep(delay);
}

function clickOriginalQuality(): boolean {
  if (!enabled('autoHD') || triedQuality) return false;

  const controls = document.querySelector('div.douyin-player-controls-right');
  if (!controls) return false;

  for (const el of controls.querySelectorAll<HTMLElement>('.tmNdnn5Q')) {
    if (!el.textContent?.includes('原画')) continue;
    el.click();
    triedQuality = true;
    return true;
  }

  return false;
}

type SettingResult = 'changed' | 'settled' | 'missing';
type GiftEffectState = 'needs-close' | 'closed';

function isSwitchChecked(el: HTMLElement, classHeuristic = false): boolean | undefined {
  const attrOwner = el.matches('[aria-checked], [data-state]')
    ? el
    : el.querySelector<HTMLElement>('[aria-checked], [data-state]');
  const ariaChecked = attrOwner?.getAttribute('aria-checked');
  if (ariaChecked === 'true') return true;
  if (ariaChecked === 'false') return false;

  const dataState = attrOwner?.getAttribute('data-state');
  if (dataState === 'checked' || dataState === 'on' || dataState === 'open') return true;
  if (dataState === 'unchecked' || dataState === 'off' || dataState === 'closed') return false;

  const input = el.matches('input')
    ? (el as HTMLInputElement)
    : el.querySelector<HTMLInputElement>('input[type="checkbox"]');
  if (input) return input.checked;

  if (classHeuristic) {
    if (el.classList.contains('SpsbqNUm')) return true;
    if (el.classList.length > 2) return true;
  }

  return undefined;
}

function readGiftEffectState(el: Element | null): GiftEffectState | undefined {
  const text = el?.textContent?.replace(/\s+/g, '');
  if (!text) return undefined;
  if (text.includes('屏蔽礼物特效')) return 'needs-close';
  if (text.includes('开启礼物特效')) return 'closed';
  return undefined;
}

function applyGiftEffectSwitch(): SettingResult {
  const legacyActionText = document.querySelector<HTMLElement>(
    '.xg-inner-controls > xg-right-grid > xg-icon:nth-child(5) div.WoNKVQmY.Z20k_Nsy',
  );
  const legacyButton = document.querySelector<HTMLElement>(
    '.xg-inner-controls > xg-right-grid > xg-icon:nth-child(5) > div > div:nth-child(2)',
  );
  const legacyState = readGiftEffectState(legacyActionText);
  if (legacyState === 'needs-close') {
    (legacyButton ?? legacyActionText)?.click();
    return 'changed';
  }
  if (legacyState === 'closed') {
    return 'settled';
  }

  const giftPanel = document.querySelector<HTMLElement>(
    'div.douyin-player-controls > div > div.douyin-player-controls-right > slot:nth-child(5) > div > div.BMrAdi9a',
  );
  if (!giftPanel) return 'missing';

  const giftEffectSwitch = document.querySelector<HTMLElement>(
    'div.douyin-player-controls > div > div.douyin-player-controls-right > slot:nth-child(5) > div > div.BMrAdi9a > div:nth-child(2) > div > div:nth-child(1) > div > div > div',
  );
  if (!giftEffectSwitch) return 'missing';

  const panelState = readGiftEffectState(giftPanel);
  if (panelState === 'needs-close') {
    giftEffectSwitch.click();
    return 'changed';
  }
  if (panelState === 'closed') {
    return 'settled';
  }

  const checked = isSwitchChecked(giftEffectSwitch);
  if (checked === true) {
    giftEffectSwitch.click();
    return 'changed';
  }
  if (checked === false) {
    return 'settled';
  }

  return 'missing';
}

function applyNamedDanmakuSwitches(): SettingResult {
  const targetNames = ['送礼信息', '福袋口令'];
  let found = 0;
  let changed = false;

  for (const row of document.querySelectorAll<HTMLElement>('.tvFMszYY')) {
    const label = row.querySelector<HTMLElement>('.FTgH60Qj');
    if (!label || !targetNames.includes(label.innerText.trim())) continue;

    found += 1;
    const switchContainer = row.querySelector<HTMLElement>('.dNuSIvAp');
    if (!switchContainer) continue;

    if (isSwitchChecked(switchContainer, true) === true) {
      switchContainer.click();
      changed = true;
    }
  }

  if (changed) return 'changed';
  return found > 0 ? 'settled' : 'missing';
}

async function withHover<T>(el: Element, callback: () => T | Promise<T>): Promise<T> {
  await simulateHover(el);
  try {
    return await callback();
  } finally {
    await simulateLeave(el, 300);
  }
}

async function applyGiftSettings(): Promise<boolean> {
  if (
    (!enabled('removeGiftAnim') && !enabled('blockGiftMsg')) ||
    triedGiftSettings ||
    applyingGiftSettings
  ) {
    return false;
  }
  const giftBtn = document.querySelector(
    'div.douyin-player-controls > div > div.douyin-player-controls-right > slot:nth-child(5) > div',
  );
  const danmakuBtn = document.querySelector(
    'div.douyin-player-controls > div > div.douyin-player-controls-right > slot:nth-child(6) > div > div',
  );

  if (!giftBtn && !danmakuBtn) return false;
  applyingGiftSettings = true;

  let changed = false;
  let settled = true;

  try {
    if (enabled('removeGiftAnim')) {
      if (!giftBtn) {
        settled = false;
      } else {
        const result = await withHover(giftBtn, applyGiftEffectSwitch);
        changed ||= result === 'changed';
        settled &&= result !== 'missing';
      }
    }

    if (enabled('blockGiftMsg')) {
      if (!danmakuBtn) {
        settled = false;
      } else {
        const result = await withHover(danmakuBtn, applyNamedDanmakuSwitches);
        changed ||= result === 'changed';
        settled &&= result !== 'missing';
      }
    }
  } finally {
    applyingGiftSettings = false;
  }

  if (settled) triedGiftSettings = true;
  return changed;
}

function tick(): void {
  syncRoomState();
  syncStyle();
  syncRoomInfoTags();
  clickOriginalQuality();
  void applyGiftSettings();
}

export function startLiveEngine(): void {
  if (timer !== undefined) return;
  if (!isLiveHost()) return;

  syncStyle();
  window.setTimeout(() => {
    clickOriginalQuality();
  }, QUALITY_DELAY_MS);
  timer = window.setInterval(tick, CHECK_MS);
  tick();
}
