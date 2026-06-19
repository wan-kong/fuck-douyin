import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn } from 'vite-plugin-monkey';
import path from 'node:path'

/**
 * In `vite dev` the userscript is served from the loopback dev server
 * (127.0.0.1:5173) but executes on a public origin (https://www.douyin.com).
 * Chrome's Private Network Access blocks that cross-space request unless the
 * server answers the CORS preflight with `Access-Control-Allow-Private-Network`.
 *
 * Vite's built-in CORS middleware answers the OPTIONS preflight and ends it
 * *before* any plugin middleware runs, so it never gets that header (neither
 * vite-plugin-monkey's own attempt nor a plain `server.middlewares.use` can
 * reach the preflight). We therefore unshift our handler to the very front of
 * the middleware stack — ahead of CORS — and answer the preflight ourselves.
 * Dev-only: the production build emits a plain `.user.js` with no server.
 */
function privateNetworkAccess(): Plugin {
  return {
    name: 'fd-private-network-access',
    apply: 'serve',
    configureServer(server) {
      // Returned hook runs after internal middlewares are installed; unshifting
      // here guarantees we sit before Vite's CORS handler.
      return () => {
        server.middlewares.stack.unshift({
          route: '',
          handle: (req: any, res: any, next: () => void) => {
            const origin = req.headers.origin;
            res.setHeader('Access-Control-Allow-Origin', origin ?? '*');
            res.setHeader('Access-Control-Allow-Private-Network', 'true');
            res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', '*');
            if (req.method === 'OPTIONS') {
              res.statusCode = 204;
              res.end();
              return;
            }
            next();
          },
        });
      };
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Private-Network': 'true',
      'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    privateNetworkAccess(),
    vue(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: '抖音净化 fuck-douyin',
        description: '净化抖音网页版：视频播放器与直播间增强配置',
        icon: 'https://lf1-cdn-tos.bytegoofy.com/goofy/ies/douyin_web/public/favicon.ico',
        namespace: 'https://github.com/fuck-douyin',
        match: [
          'https://douyin.com/*',
          'https://www.douyin.com/*',
          'https://*.douyin.com/*',
          'https://live.douyin.com/*',
          'https://www.wankong.top/*'
        ],
        'run-at': 'document-idle',
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
        },
      },
    }),
  ],
});
