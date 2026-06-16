<script setup lang="ts">
import FdSwitch from './FdSwitch.vue';
import FdIcon from './FdIcon.vue';
import type { ConfigItem } from '@/config/schema';

const props = defineProps<{ item: ConfigItem; modelValue: boolean; disabled?: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [boolean] }>();

function toggle() {
  if (!props.disabled) emit('update:modelValue', !props.modelValue);
}
</script>

<template>
  <button
    type="button"
    class="row"
    :class="{ on: modelValue, disabled }"
    :disabled="disabled"
    @click="toggle"
  >
    <span class="ico">
      <FdIcon :name="item.icon" :size="18" />
    </span>
    <span class="text">
      <span class="label">{{ item.label }}</span>
      <span class="desc">{{ item.desc }}</span>
    </span>
    <FdSwitch
      :model-value="modelValue"
      :disabled="disabled"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </button>
</template>

<style scoped>
.row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 11px 14px 11px 13px;
  text-align: left;
  border-radius: var(--fd-radius-sm);
  transition: background 0.18s var(--fd-ease-out);
}
.row:hover:not(.disabled) {
  background: var(--fd-surface-hover);
}
/* left accent bar appears when active */
.row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 3px;
  height: 0;
  border-radius: 999px;
  background: var(--fd-accent);
  transform: translateY(-50%);
  transition: height 0.26s var(--fd-ease);
}
.row.on::before {
  height: 20px;
}

.ico {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  border-radius: 9px;
  color: var(--fd-text-dim);
  background: var(--fd-surface-active);
  border: 1px solid var(--fd-border);
  transition: color 0.2s, background 0.2s, border-color 0.2s;
}
.row.on .ico {
  color: var(--fd-cyan);
  background: rgba(37, 244, 238, 0.08);
  border-color: rgba(37, 244, 238, 0.22);
}

.text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1 1 auto;
  gap: 1px;
}
.label {
  font-size: 13.5px;
  font-weight: 540;
  letter-spacing: 0.01em;
  color: var(--fd-text);
}
.desc {
  font-size: 11.5px;
  color: var(--fd-text-faint);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row.disabled {
  cursor: not-allowed;
}
.row.disabled .label,
.row.disabled .desc,
.row.disabled .ico {
  opacity: 0.45;
}
</style>
