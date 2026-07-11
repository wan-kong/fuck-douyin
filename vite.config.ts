import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn } from 'vite-plugin-monkey';
import path from 'node:path'


// https://vitejs.dev/config/
export default defineConfig({

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    vue(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: '抖音净化 fuck-douyin',
        license: "MIT",
        homepageURL: "https://github.com/wan-kong/fuck-douyin",
        description: '净化抖音网页版：视频播放器与直播间增强配置',
        icon: 'https://lf1-cdn-tos.bytegoofy.com/goofy/ies/douyin_web/public/favicon.ico',
        namespace: 'https://github.com/wan-kong/fuck-douyin',
        match: [
          'https://douyin.com/*',
          'https://www.douyin.com/*',
          'https://*.douyin.com/*',
          'https://live.douyin.com/*',
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
