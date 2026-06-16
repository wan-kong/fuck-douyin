/**
 * Declarative config schema.
 *
 * The whole config UI is rendered from this schema, and the persisted config
 * shape is derived from it. To add a feature, add one item here: a row appears
 * in the panel and a typed, persisted, defaulted flag appears in the store.
 *
 * Note: this file describes *what* is configurable, not *how* it is applied to
 * the Douyin DOM. Feature logic lives elsewhere and reads `config[group][key]`.
 */

export type GroupId = 'video' | 'live';

export interface ConfigItem {
  /** Stable key, unique within its group. Persisted, never rename casually. */
  key: string;
  /** Row title shown to the user. */
  label: string;
  /** One-line explanation under the title. */
  desc: string;
  /** Default on/off state for a fresh install. */
  default: boolean;
  /** remixicon component name, resolved in the panel. */
  icon: string;
}

export interface ConfigGroup {
  id: GroupId;
  /** Tab label. */
  title: string;
  /** Short tab description, shown in the panel header when active. */
  subtitle: string;
  /** remixicon component name for the tab. */
  icon: string;
  items: ConfigItem[];
}

export const SCHEMA: ConfigGroup[] = [
  {
    id: 'video',
    title: '视频',
    subtitle: '净化与增强短视频播放器',
    icon: 'RiPlayCircleLine',
    items: [
      {
        key: 'skipAd',
        label: '自动跳过广告',
        desc: '检测到广告时自动跳过',
        default: true,
        icon: 'RiSpam2Line',
      },
      {
        key: 'autoUnmute',
        label: '自动开启声音',
        desc: '进入页面后自动取消静音',
        default: true,
        icon: 'RiVolumeUpLine',
      },
      {
        key: 'autoHD',
        label: '自动最高清晰度',
        desc: '播放时自动切换到最高画质',
        default: true,
        icon: 'RiHdLine',
      },
      {
        key: 'removeShare',
        label: '隐藏分享按钮',
        desc: '移除播放器侧边的分享入口',
        default: false,
        icon: 'RiShareForwardLine',
      },
      {
        key: 'removeFavorite',
        label: '隐藏收藏按钮',
        desc: '移除播放器侧边的收藏入口',
        default: false,
        icon: 'RiStarLine',
      },
      {
        key: 'removeComment',
        label: '隐藏评论入口',
        desc: '移除播放器侧边的评论入口',
        default: false,
        icon: 'RiChat3Line',
      },
    ],
  },
  {
    id: 'live',
    title: '直播',
    subtitle: '净化直播间，沉浸看播',
    icon: 'RiLiveLine',
    items: [
      {
        key: 'removeGiftBar',
        label: '移除礼物滚动条',
        desc: '隐藏顶部滚动的礼物横幅',
        default: true,
        icon: 'RiGiftLine',
      },
      {
        key: 'removeGiftAnim',
        label: '移除礼物动画',
        desc: '屏蔽全屏礼物特效与连击动画',
        default: true,
        icon: 'RiSparkling2Line',
      },
      {
        key: 'autoHD',
        label: '自动最高清晰度',
        desc: '进入直播间自动切换最高画质',
        default: true,
        icon: 'RiHdLine',
      },
      {
        key: 'removeAdvancedDanmaku',
        label: '移除高级弹幕',
        desc: '屏蔽彩色 / 特效 / 付费弹幕',
        default: true,
        icon: 'RiChatOffLine',
      },
      {
        key: 'blockGiftMsg',
        label: '自动屏蔽送礼信息',
        desc: '自动开启“屏蔽送礼信息”设置',
        default: true,
        icon: 'RiShieldCheckLine',
      },
      {
        key: 'cinemaMode',
        label: '沉浸式影院模式',
        desc: '仅保留直播画面与弹幕，移除其余元素',
        default: false,
        icon: 'RiFullscreenLine',
      },
    ],
  },
];

/** Persisted config shape: `{ enabled, video: {...}, live: {...} }`. */
export type GroupConfig = Record<string, boolean>;
export interface AppConfig {
  /** Master switch. When off, no feature is applied. */
  enabled: boolean;
  video: GroupConfig;
  live: GroupConfig;
}

/** Build the default config object from the schema. */
export function createDefaultConfig(): AppConfig {
  const config = { enabled: true } as AppConfig;
  for (const group of SCHEMA) {
    const groupConfig: GroupConfig = {};
    for (const item of group.items) groupConfig[item.key] = item.default;
    config[group.id] = groupConfig;
  }
  return config;
}
