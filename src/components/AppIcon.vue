<script setup lang="ts">
import { computed } from 'vue';

const modules = import.meta.glob('../assets/icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const icons: Record<string, string> = {};
for (const path in modules) {
  const name = path.slice(path.lastIndexOf('/') + 1, -4);
  icons[name] = modules[path];
}

const props = defineProps<{ name: string }>();

const svg = computed(() => icons[props.name] ?? '');
</script>

<template>
  <span class="icon" aria-hidden="true" v-html="svg"></span>
</template>
