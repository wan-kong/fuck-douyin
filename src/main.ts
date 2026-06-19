import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { startFeatures } from './features';

// Mount into a plain container appended to <body>. Styles are injected by
// vite-plugin-monkey into the page (GM_addStyle). To avoid touching Douyin's
// layout, our reset and design tokens are scoped to `.fd-root` and component
// styles are `scoped` (data-v hashed); we ship no global reset.
const HOST_ID = 'fd-root-box';
const host = document.createElement('div');
host.id = HOST_ID;
let observedBody: HTMLElement | null = null;

function attachHost(): boolean {
  if (!document.body) return false;

  const existing = document.getElementById(HOST_ID);
  if (existing === host) return true;
  if (existing) existing.remove();

  document.body.appendChild(host);
  return true;
}

const bodyObserver = new MutationObserver(() => {
  attachHost();
});

function observeCurrentBody(): void {
  if (document.body === observedBody) return;

  bodyObserver.disconnect();
  observedBody = document.body;
  if (observedBody) {
    bodyObserver.observe(observedBody, { childList: true });
  }
}

function ensureHost(): void {
  if (attachHost()) observeCurrentBody();
}

function mountWhenBodyReady(): void {
  if (attachHost()) {
    observeCurrentBody();
    return;
  }

  window.addEventListener(
    'DOMContentLoaded',
    () => {
      ensureHost();
    },
    { once: true },
  );
}

mountWhenBodyReady();

createApp(App).mount(host);

// Apply the configured purifications to the page (DOM-side feature layer).
startFeatures();

new MutationObserver(() => {
  ensureHost();
}).observe(document.documentElement, { childList: true });
