<script setup lang="ts">
import { ref } from 'vue';
import FloatButton from './components/FloatButton.vue';
import ConfigPanel from './components/ConfigPanel.vue';
import { useDraggable } from './composables/useDraggable';

const open = ref(false);
const { pos, dragging, ready, placement, onPointerDown, wasDragged } = useDraggable();

// A tap toggles the panel; a drag must not.
function onTap() {
  if (wasDragged()) return;
  open.value = !open.value;
}
</script>

<template>
  <div class="fd-root">
    <div
      v-show="ready"
      class="dock"
      :class="[placement.vertical, placement.horizontal, { dragging }]"
      :style="{ left: pos.x + 'px', top: pos.y + 'px' }"
    >
      <transition name="panel">
        <ConfigPanel v-if="open" class="panel-slot" @close="open = false" />
      </transition>
      <FloatButton
        class="fab-slot"
        :open="open"
        :dragging="dragging"
        @pointerdown="onPointerDown"
        @toggle="onTap"
      />
    </div>
  </div>
</template>

<style scoped>
.dock {
  position: fixed;
  width: 40px;
  height: 40px;
  z-index: 2147483600;
  /* left/top set inline from the drag composable */
}

.fab-slot {
  position: absolute;
  inset: 0;
}

/* panel is positioned relative to the launcher anchor and expands toward
   the screen, depending on which quadrant the button currently sits in */
.panel-slot {
  position: absolute;
}
.dock.up .panel-slot {
  bottom: calc(100% + 10px);
}
.dock.down .panel-slot {
  top: calc(100% + 10px);
}
.dock.right .panel-slot {
  right: 0;
}
.dock.left .panel-slot {
  left: 0;
}

/* spring the panel out of the button's nearest corner */
.dock.up.right .panel-slot {
  transform-origin: bottom right;
}
.dock.up.left .panel-slot {
  transform-origin: bottom left;
}
.dock.down.right .panel-slot {
  transform-origin: top right;
}
.dock.down.left .panel-slot {
  transform-origin: top left;
}

.panel-enter-active {
  transition: transform 0.36s var(--fd-ease), opacity 0.24s var(--fd-ease-out);
}
.panel-leave-active {
  transition: transform 0.22s var(--fd-ease-out), opacity 0.18s var(--fd-ease-out);
}
.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.92);
}
.dock.down .panel-enter-from,
.dock.down .panel-leave-to {
  transform: translateY(-12px) scale(0.92);
}
</style>
