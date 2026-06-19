/**
 * Drag behaviour for the floating launcher.
 *
 * - The button can be dragged anywhere; its position is clamped to the viewport
 *   and persisted, so it stays where the user dropped it across reloads.
 * - A small movement threshold distinguishes a drag from a tap, so dragging the
 *   button never accidentally opens/closes the panel (`wasDragged`).
 * - `placement` reports which corner the panel should open toward, derived from
 *   the button's quadrant, so the panel always expands into the screen.
 */

import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { loadValue, saveValue } from '@/config/storage';

const KEY = 'fd_fab_pos';
const SIZE = 40; // launcher button size, keep in sync with FloatButton.vue
const MARGIN = 16; // minimum gap from any viewport edge
const DEFAULT_GAP = 22; // initial inset from bottom-right
const DRAG_THRESHOLD = 4; // px of movement before a press counts as a drag

interface Pos {
  x: number;
  y: number;
}

export function useDraggable() {
  const pos = reactive<Pos>({ x: 0, y: 0 });
  const vw = ref(1280);
  const vh = ref(720);
  const dragging = ref(false);
  const ready = ref(false);

  let origin = { px: 0, py: 0, x: 0, y: 0 };
  let moved = false;

  function clamp() {
    const maxX = Math.max(MARGIN, vw.value - SIZE - MARGIN);
    const maxY = Math.max(MARGIN, vh.value - SIZE - MARGIN);
    pos.x = Math.min(Math.max(MARGIN, pos.x), maxX);
    pos.y = Math.min(Math.max(MARGIN, pos.y), maxY);
  }

  function syncViewport() {
    vw.value = window.innerWidth;
    vh.value = window.innerHeight;
    clamp();
  }

  function onMove(e: PointerEvent) {
    const dx = e.clientX - origin.px;
    const dy = e.clientY - origin.py;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) moved = true;
    pos.x = origin.x + dx;
    pos.y = origin.y + dy;
    clamp();
  }

  function onUp() {
    dragging.value = false;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    if (moved) saveValue(KEY, { x: pos.x, y: pos.y });
  }

  /** Attach to the launcher's pointerdown. */
  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return; // left button / touch only
    dragging.value = true;
    moved = false;
    origin = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  }

  /** True if the just-finished interaction was a drag, not a tap. */
  function wasDragged() {
    return moved;
  }

  /** Which corner the panel should anchor/expand from. */
  const placement = computed(() => ({
    vertical: pos.y + SIZE / 2 > vh.value / 2 ? 'up' : 'down',
    horizontal: pos.x + SIZE / 2 > vw.value / 2 ? 'right' : 'left',
  }));

  onMounted(() => {
    vw.value = window.innerWidth;
    vh.value = window.innerHeight;
    const saved = loadValue<Pos | null>(KEY, null);
    if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
      pos.x = saved.x;
      pos.y = saved.y;
    } else {
      pos.x = vw.value - SIZE - DEFAULT_GAP;
      pos.y = vh.value - SIZE - DEFAULT_GAP;
    }
    clamp();
    ready.value = true;
    window.addEventListener('resize', syncViewport);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', syncViewport);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
  });

  return { pos, dragging, ready, placement, onPointerDown, wasDragged };
}
