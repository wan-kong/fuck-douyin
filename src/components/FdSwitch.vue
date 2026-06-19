<script setup lang="ts">
defineProps<{ modelValue: boolean; disabled?: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [boolean] }>();
</script>

<template>
  <button
    type="button"
    class="sw"
    role="switch"
    :aria-checked="modelValue"
    :class="{ on: modelValue, disabled }"
    :disabled="disabled"
    @click.stop="emit('update:modelValue', !modelValue)"
  >
    <span class="knob" />
  </button>
</template>

<style scoped>
.sw {
  position: relative;
  width: 34px;
  height: 20px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: var(--fd-surface-active);
  border: 1px solid var(--fd-border);
  transition: background 0.25s var(--fd-ease-out), border-color 0.25s;
}
.sw.on {
  background: var(--fd-accent);
  border-color: transparent;
  box-shadow: 0 0 0 1px var(--fd-accent-glow), 0 2px 10px -2px var(--fd-accent-glow);
}
.sw.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  transition: transform 0.32s var(--fd-ease);
}
.sw.on .knob {
  transform: translateX(14px);
}
</style>
