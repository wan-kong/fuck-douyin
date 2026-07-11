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
  /** Field type. Boolean rows render a switch; number rows render an input. */
  type?: 'boolean' | 'number';
  /** Row title shown to the user. */
  label: string;
  /** One-line explanation under the title. */
  desc: string;
  /** Default on/off state for a fresh install. */
  default: boolean | number;
  /** remixicon component name, resolved in the panel. */
  icon: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  disabledReason?: string;
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
        desc: '信息流刷到广告时自动下滑跳过',
        default: true,
        icon: 'RiSpam2Line',
      },
      {
        key: 'skipLive',
        label: '自动跳过直播',
        desc: '信息流刷到直播卡片时自动下滑跳过',
        default: true,
        icon: 'RiLiveLine',
      },
      {
        key: 'skipShop',
        label: '自动跳过购物',
        desc: '信息流刷到购物 / 带货内容时自动下滑跳过',
        default: false,
        icon: 'RiShoppingCart2Line',
      },
      {
        key: 'autoHD',
        label: '自动最高清晰度',
        desc: '播放时自动切换到最高画质',
        default: true,
        icon: 'RiHdLine',
      },
      {
        key: 'hideHeader',
        label: '隐藏顶部栏',
        desc: '隐藏页面顶部栏，并释放其占用的 56px 高度',
        default: false,
        icon: 'RiFullscreenLine',
      },
      {
        key: 'hideNavigation',
        label: '隐藏导航栏',
        desc: '隐藏页面左侧导航栏',
        default: false,
        icon: 'RiSpam2Line',
      },
      {
        key: 'removeAvatar',
        label: '隐藏用户头像',
        desc: '移除播放器侧边的头像与关注入口',
        default: false,
        icon: 'RiUserLine',
      },
      {
        key: 'removeLike',
        label: '隐藏点赞按钮',
        desc: '移除播放器侧边的点赞入口',
        default: false,
        icon: 'RiHeartLine',
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
      {
        key: 'removeListen',
        label: '隐藏听抖音按钮',
        desc: '移除播放器侧边的“听抖音”入口',
        default: false,
        icon: 'RiHeadphoneLine',
      },
      {
        key: 'removeMore',
        label: '隐藏更多按钮',
        desc: '移除播放器侧边的“…”更多菜单入口',
        default: false,
        icon: 'RiMoreLine',
      },
      {
        key: 'detectInterval',
        type: 'number',
        label: '检测间隔',
        desc: '广告 / 直播 / 购物检测频率',
        default: 500,
        min: 100,
        max: 5000,
        step: 50,
        unit: 'ms',
        icon: 'RiRefreshLine',
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
        key: 'removeRoomInfoTags',
        label: '移除直播间标签',
        desc: '隐藏顶部信息栏与“更多直播”等入口',
        default: true,
        icon: 'RiSpam2Line',
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
        desc: '暂未启用：直播 DOM 范围过大，待稳定选择器',
        default: false,
        icon: 'RiFullscreenLine',
        disabled: true,
        disabledReason: '待稳定选择器',
      },
    ],
  },
];

/** Persisted config shape: `{ enabled, video: {...}, live: {...} }`. */
export type ConfigValue = boolean | number;
export type GroupConfig = Record<string, ConfigValue>;
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
