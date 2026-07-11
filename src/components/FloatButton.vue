<script setup lang="ts">
defineProps<{ open: boolean; dragging?: boolean }>();
defineEmits<{ toggle: [] }>();
</script>

<template>
  <button
    type="button"
    class="fab"
    :class="{ open, dragging }"
    :aria-label="open ? '关闭设置' : '打开抖音净化设置（可拖动）'"
    @click="$emit('toggle')"
  >
    <span class="mark">净</span>
  </button>
</template>

<style scoped>
.fab {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.72);
  cursor: grab;
  touch-action: none;
  background: rgba(48, 48, 48, 0.34);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
  transition: transform 0.2s var(--fd-ease), border-radius 0.2s var(--fd-ease),
    color 0.2s, background-color 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.fab:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(48, 48, 48, 0.5);
  border-color: rgba(255, 255, 255, 0.14);
}
.fab:active {
  transform: scale(0.95);
}
.fab.open {
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.92);
  background: rgba(48, 48, 48, 0.58);
}
/* while dragging: lift, follow the cursor, no springy hover transform fighting */
.fab.dragging {
  cursor: grabbing;
  transition: box-shadow 0.2s;
  transform: scale(1.04);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.24);
}

.mark {
  position: relative;
  z-index: 1;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.02em;
  transition: transform 0.3s var(--fd-ease);
}
.fab.open .mark {
  transform: scale(0.9);
}
</style>
