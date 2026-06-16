<script setup lang="ts">
import { computed } from 'vue';
import { iconPath } from './icons';

const props = withDefaults(defineProps<{ name: string; size?: number }>(), {
  size: 20,
});
const inner = computed(() => iconPath(props.name));
</script>

<template>
  <svg
    class="fd-icon"
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    fill="currentColor"
    aria-hidden="true"
    v-html="inner"
  />
</template>

<style scoped>
.fd-icon {
  display: block;
  flex: 0 0 auto;
}
</style>
