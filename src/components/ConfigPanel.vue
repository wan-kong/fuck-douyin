<script setup lang="ts">
import { computed, ref } from 'vue';
import ToggleRow from './ToggleRow.vue';
import FdSwitch from './FdSwitch.vue';
import FdIcon from './FdIcon.vue';
import { config, resetConfig, activeCount } from '@/config/store';
import { SCHEMA, type GroupId } from '@/config/schema';

defineEmits<{ close: [] }>();

const active = ref<GroupId>('video');
const activeGroup = computed(() => SCHEMA.find((g) => g.id === active.value)!);
</script>

<template>
  <div class="panel" :class="{ off: !config.enabled }">
    <!-- header -->
    <header class="head">
      <div class="brand">
        <span class="mark" aria-hidden="true">净</span>
        <div class="titles">
          <div class="title">抖音净化</div>
          <div class="sub">{{ activeGroup.subtitle }}</div>
        </div>
      </div>
      <button class="close" type="button" aria-label="关闭" @click="$emit('close')">
        <FdIcon name="RiCloseLine" :size="18" />
      </button>
    </header>

    <!-- master switch -->
    <div class="master" :class="{ on: config.enabled }">
      <div class="master-text">
        <span class="master-label">总开关</span>
        <span class="master-hint">{{ config.enabled ? '功能已启用' : '已全部暂停' }}</span>
      </div>
      <FdSwitch v-model="config.enabled" />
    </div>

    <!-- tabs -->
    <nav class="tabs" :style="{ '--idx': active === 'video' ? 0 : 1 }">
      <span class="indicator" aria-hidden="true" />
      <button
        v-for="g in SCHEMA"
        :key="g.id"
        type="button"
        class="tab"
        :class="{ active: active === g.id }"
        @click="active = g.id"
      >
        <FdIcon :name="g.icon" :size="16" />
        <span>{{ g.title }}</span>
        <span class="count">{{ activeCount(g.id) }}</span>
      </button>
    </nav>

    <!-- body -->
    <div class="body">
      <transition name="swap" mode="out-in">
        <div :key="active" class="list">
          <ToggleRow
            v-for="item in activeGroup.items"
            :key="item.key"
            :item="item"
            v-model="config[active][item.key]"
            :disabled="!config.enabled"
          />
        </div>
      </transition>
    </div>

    <!-- footer -->
    <footer class="foot">
      <button class="reset" type="button" @click="resetConfig">
        <FdIcon name="RiRefreshLine" :size="14" />
        <span>恢复默认</span>
      </button>
      <span class="ver">v0.1.0</span>
    </footer>
  </div>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  width: min(340px, calc(100vw - 28px));
  max-height: min(72vh, 640px);
  background: var(--fd-bg);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid var(--fd-border-strong);
  border-radius: var(--fd-radius);
  box-shadow:
    0 24px 60px -18px rgba(0, 0, 0, 0.7),
    0 2px 8px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

/* header */
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}
.mark {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  border-radius: 10px;
  font-size: 17px;
  font-weight: 700;
  color: #0b0b0f;
  background: var(--fd-accent);
  box-shadow: 0 4px 14px -4px var(--fd-accent-glow);
}
.titles {
  min-width: 0;
}
.title {
  font-size: 15px;
  font-weight: 680;
  letter-spacing: 0.02em;
}
.sub {
  font-size: 11.5px;
  color: var(--fd-text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.close {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  border-radius: 8px;
  color: var(--fd-text-dim);
  transition: background 0.18s, color 0.18s;
}
.close:hover {
  background: var(--fd-surface-hover);
  color: var(--fd-text);
}

/* master switch */
.master {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 14px 12px;
  padding: 11px 13px;
  border-radius: var(--fd-radius-sm);
  background: var(--fd-surface);
  border: 1px solid var(--fd-border);
  transition: border-color 0.25s;
}
.master.on {
  border-color: rgba(37, 244, 238, 0.28);
}
.master-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.master-label {
  font-size: 13px;
  font-weight: 600;
}
.master-hint {
  font-size: 11px;
  color: var(--fd-text-faint);
}

/* tabs */
.tabs {
  position: relative;
  display: flex;
  margin: 0 14px;
  padding: 4px;
  gap: 4px;
  border-radius: 12px;
  background: var(--fd-surface);
  border: 1px solid var(--fd-border);
}
.indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc((100% - 8px - 4px) / 2);
  height: calc(100% - 8px);
  border-radius: 9px;
  background: var(--fd-surface-active);
  border: 1px solid var(--fd-border-strong);
  transform: translateX(calc(var(--idx) * (100% + 4px)));
  transition: transform 0.32s var(--fd-ease);
}
.tab {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
  padding: 8px 0;
  font-size: 13px;
  font-weight: 560;
  color: var(--fd-text-dim);
  transition: color 0.2s;
}
.tab.active {
  color: var(--fd-text);
}
.count {
  display: grid;
  place-items: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 10.5px;
  font-weight: 600;
  font-feature-settings: 'tnum';
  border-radius: 999px;
  color: var(--fd-text-dim);
  background: var(--fd-surface-active);
}
.tab.active .count {
  color: #0b0b0f;
  background: var(--fd-cyan);
}

/* body */
.body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 10px 8px 6px;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.18s var(--fd-ease-out), transform 0.18s var(--fd-ease-out);
}
.swap-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.swap-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* footer */
.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px 14px;
  border-top: 1px solid var(--fd-border);
}
.reset {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 540;
  color: var(--fd-text-dim);
  border-radius: 8px;
  transition: background 0.18s, color 0.18s;
}
.reset:hover {
  background: var(--fd-surface-hover);
  color: var(--fd-text);
}
.ver {
  font-size: 11px;
  font-feature-settings: 'tnum';
  letter-spacing: 0.04em;
  color: var(--fd-text-faint);
}
</style>
