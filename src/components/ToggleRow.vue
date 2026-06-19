<script setup lang="ts">
import FdSwitch from './FdSwitch.vue';
import FdIcon from './FdIcon.vue';
import type { ConfigItem, ConfigValue } from '@/config/schema';

const props = defineProps<{ item: ConfigItem; modelValue: ConfigValue; disabled?: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [ConfigValue] }>();

function itemType() {
  return props.item.type ?? 'boolean';
}

function booleanValue(): boolean {
  return props.modelValue === true;
}

function clampNumber(value: number): number {
  const min = props.item.min ?? Number.NEGATIVE_INFINITY;
  const max = props.item.max ?? Number.POSITIVE_INFINITY;
  return Math.min(Math.max(value, min), max);
}

function toggle() {
  if (props.disabled || itemType() !== 'boolean') return;
  emit('update:modelValue', !props.modelValue);
}

function updateNumber(event: Event) {
  const input = event.target as HTMLInputElement;
  const value = Number(input.value);
  if (!Number.isFinite(value)) return;
  emit('update:modelValue', clampNumber(value));
}
</script>

<template>
  <div
    class="row"
    :class="{ on: itemType() === 'boolean' && modelValue === true, disabled, numeric: itemType() === 'number' }"
    @click="toggle"
  >
    <span class="ico">
      <FdIcon :name="item.icon" :size="16" />
    </span>
    <span class="text">
      <span class="label">{{ item.label }}</span>
      <span class="desc">{{ item.disabledReason ?? item.desc }}</span>
    </span>
    <FdSwitch
      v-if="itemType() === 'boolean'"
      :model-value="booleanValue()"
      :disabled="disabled"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <label v-else class="num-wrap" @click.stop>
      <input
        class="num"
        type="number"
        :value="modelValue"
        :min="item.min"
        :max="item.max"
        :step="item.step ?? 1"
        :disabled="disabled"
        @change="updateNumber"
      />
      <span v-if="item.unit" class="unit">{{ item.unit }}</span>
    </label>
  </div>
</template>

<style scoped>
.row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 8px 10px;
  text-align: left;
  cursor: pointer;
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
  height: 18px;
}

.ico {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  border-radius: 7px;
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
  font-size: 12.5px;
  font-weight: 540;
  letter-spacing: 0.01em;
  color: var(--fd-text);
}
.desc {
  font-size: 10.5px;
  color: var(--fd-text-faint);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row.disabled {
  cursor: not-allowed;
}
.row.numeric {
  cursor: default;
}
.row.disabled .label,
.row.disabled .desc,
.row.disabled .ico {
  opacity: 0.45;
}
.num-wrap {
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 0 0 auto;
}
.num {
  width: 66px;
  height: 26px;
  padding: 0 7px;
  border-radius: 7px;
  color: var(--fd-text);
  background: var(--fd-surface-active);
  border: 1px solid var(--fd-border);
  font: inherit;
  font-size: 11.5px;
  outline: none;
}
.num:focus {
  border-color: var(--fd-border-strong);
  box-shadow: 0 0 0 2px rgba(37, 244, 238, 0.14);
}
.num:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.unit {
  min-width: 18px;
  color: var(--fd-text-faint);
  font-size: 10.5px;
}
</style>
