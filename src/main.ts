import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

// Mount into a plain container appended to <body>. Styles are injected by
// vite-plugin-monkey into the page (GM_addStyle). To avoid touching Douyin's
// layout, our reset and design tokens are scoped to `.fd-root` and component
// styles are `scoped` (data-v hashed); we ship no global reset.
const host = document.createElement('div');
host.id = 'fd-douyin-host';
document.body.append(host);

createApp(App).mount(host);
