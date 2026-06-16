# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **Tampermonkey/Greasemonkey userscript** that "purifies" the Douyin web app (video player + livestream tweaks). Despite the Vue 3 + Vite stack, the build output is a single `.user.js` file (via `vite-plugin-monkey`), **not** a normal web app. The userscript runs injected into `www.douyin.com` / `live.douyin.com` pages (see `match` in `vite.config.ts`).

## Commands

- `pnpm dev` — Vite dev server. The panel renders in a plain browser; GM APIs are absent so it falls back to `localStorage` (see `src/config/storage.ts`).
- `pnpm build` — `vue-tsc -b` typecheck **then** Vite build. Emits the userscript into `dist/`. There is no separate lint/test step; typechecking is the gate.
- `pnpm preview` — preview the built output.

Package manager is **pnpm** (see `pnpm-lock.yaml`). No test runner is configured.

## Architecture

### Schema-driven config (the core pattern)

`src/config/schema.ts` is the single source of truth. Everything — the persisted data shape, the default values, and every row in the UI — is derived from the `SCHEMA` array. **To add a configurable feature, add one `ConfigItem` to the relevant group in `SCHEMA`**; a typed/defaulted/persisted flag and a panel row both appear automatically. Do not hand-add flags elsewhere.

Config flow:
- `schema.ts` — declares groups (`video`, `live`) and items; `createDefaultConfig()` builds defaults from it.
- `store.ts` — `config` is a `reactive(hydrate())`. `hydrate()` deep-merges persisted values **over** schema defaults, keeping only schema-known keys (so adding a feature never wipes a user's existing choices, and removing one drops stale keys). A `deep` watcher auto-persists every change. `resetConfig()` / `activeCount()` are helpers.
- `storage.ts` — `loadValue`/`saveValue` prefer `GM_getValue`/`GM_setValue`, fall back to `localStorage`. All persistence goes through here.

Persisted under key `fd_config`; float-button position under `fd_fab_pos`. **`ConfigItem.key` values are persisted — never rename casually.**

### Feature application is NOT implemented yet

`schema.ts` describes *what* is configurable; the comment notes feature logic "lives elsewhere and reads `config[group][key]`". **That DOM-manipulation layer does not exist yet** — there is currently no `MutationObserver`/`querySelector` code that actually purifies Douyin. The repo today is the config model + floating UI only. When implementing a feature's effect, read the flag via the `config` reactive from `store.ts` and react to it.

### UI

- `src/main.ts` — mounts the app into a `<div id="fd-douyin-host">` appended to `<body>`. Styles are injected page-wide via `GM_addStyle`.
- **Style isolation is deliberate and load-bearing**: all tokens and resets are scoped to `.fd-root` (see `src/style.css`), and component styles use Vue `scoped`. There is **no global reset** — never add styles that touch Douyin's own DOM, or you'll break the host page.
- `App.vue` — owns the floating "dock": a draggable `FloatButton` + a `ConfigPanel` that springs from whichever screen corner the button currently sits in.
- `useDraggable.ts` (`src/composables/`) — drag/clamp/persist for the launcher; a movement threshold distinguishes drag from tap (`wasDragged()`), and `placement` reports which corner the panel expands toward.
- `ConfigPanel.vue` renders tabs and rows entirely from `SCHEMA`, binding each `ToggleRow`/`FdSwitch` to `config[group][key]`.

### Icons

`src/components/icons.ts` inlines only the ~16 Remix Icon SVG paths the UI uses. **Do not** add `@remixicon/vue` — its barrel doesn't tree-shake under the userscript build and bloats the bundle to 3MB+. When you reference a new `icon` name in `schema.ts`, add its inner SVG markup to `ICON_PATHS` too.

### Other conventions

- `@/` aliases `src/` (configured in `vite.config.ts` and the tsconfigs).
- `vue` is an `externalGlobals` CDN dependency in the build — it is **not** bundled into the userscript.
- **Styling is plain hand-written CSS** in `src/style.css` (scoped to `.fd-root`) plus Vue `scoped` styles. There is no Tailwind, no CSS framework, and no shadcn — `vue` is the only runtime dependency. Don't reintroduce a CSS framework. (`components.json` is a leftover shadcn-vue config file that nothing reads.)
- TS is strict with `noUnusedLocals`/`noUnusedParameters` on — unused symbols fail the build.
