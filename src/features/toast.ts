/**
 * Minimal toast for feature feedback (e.g. "skipped an ad").
 *
 * Lives outside the Vue app on purpose: feature logic runs as plain DOM code,
 * not inside a component. Uses only inline styles on a single self-owned
 * element so it never leaks CSS into Douyin's page (see the style-isolation
 * rule in CLAUDE.md). Successive calls reuse / re-arm the same node.
 */

const TOAST_ID = 'fd-feature-toast';
let hideTimer: number | undefined;
let removeTimer: number | undefined;

export function showToast(text: string): void {
  let el = document.getElementById(TOAST_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = TOAST_ID;
    el.style.cssText = [
      'position:fixed',
      'top:15%',
      'left:50%',
      'transform:translate(-50%,-50%)',
      'background:rgba(0,0,0,0.85)',
      'color:#fff',
      'padding:10px 20px',
      'border-radius:50px',
      'z-index:2147483647',
      'font-size:14px',
      'font-weight:bold',
      'pointer-events:none',
      'box-shadow:0 4px 12px rgba(0,0,0,0.4)',
      'backdrop-filter:blur(4px)',
      'transition:opacity 0.3s',
      'font-family:system-ui,-apple-system,sans-serif',
    ].join(';');
    document.body.appendChild(el);
  }

  if (hideTimer) clearTimeout(hideTimer);
  if (removeTimer) clearTimeout(removeTimer);

  el.textContent = text;
  el.style.opacity = '1';

  hideTimer = window.setTimeout(() => {
    const node = document.getElementById(TOAST_ID);
    if (!node) return;
    node.style.opacity = '0';
    removeTimer = window.setTimeout(() => node.remove(), 500);
  }, 1500);
}
