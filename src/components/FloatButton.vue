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
    <span class="ring" aria-hidden="true" />
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
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  cursor: grab;
  touch-action: none;
  background: rgba(68, 68, 68, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow:
    0 0 24px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transition: transform 0.34s var(--fd-ease), border-radius 0.34s var(--fd-ease),
    box-shadow 0.3s;
}
.fab:hover {
  transform: translateY(-2px) scale(1.04);
  box-shadow:
    0 0 24px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}
.fab:active {
  transform: scale(0.95);
}
.fab.open {
  transform: rotate(0);
  border-radius: 50%;
}
/* while dragging: lift, follow the cursor, no springy hover transform fighting */
.fab.dragging {
  cursor: grabbing;
  transition: box-shadow 0.2s;
  transform: scale(1.08);
  box-shadow:
    0 0 24px rgba(0, 0, 0, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
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
  transform: scale(0.86);
}

/* breathing accent ring on idle */
.ring {
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  border: 1px solid var(--fd-accent);
  opacity: 0;
  animation: pulse 2.8s var(--fd-ease-out) infinite;
}
.fab:hover .ring,
.fab.open .ring {
  animation-play-state: paused;
  opacity: 0;
}
@keyframes pulse {
  0% {
    opacity: 0.5;
    transform: scale(0.92);
  }
  70%,
  100% {
    opacity: 0;
    transform: scale(1.25);
  }
}
@media (prefers-reduced-motion: reduce) {
  .ring {
    animation: none;
  }
}
</style>
