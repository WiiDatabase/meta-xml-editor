<script setup lang="ts">
import { useTheme } from '../composables/useTheme';

const { theme, setTheme } = useTheme();
</script>

<template>
  <select
    class="form-select form-select-sm w-auto"
    :value="theme"
    aria-label="Theme"
    @change="setTheme(($event.target as HTMLSelectElement).value as 'auto' | 'light' | 'dark')"
  >
    <option value="auto">Auto</option>
    <option value="light">Light</option>
    <option value="dark">Dark</option>
  </select>
</template>
