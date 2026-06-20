<script setup lang="ts">
import { ref } from 'vue';
import AppIcon from './AppIcon.vue';

const emit = defineEmits<{ load: [content: string] }>();

const dragover = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

async function readFile(file: File): Promise<void> {
  const content = await file.text();
  emit('load', content);
}

function onDrop(event: DragEvent): void {
  dragover.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file) {
    void readFile(file);
  }
}

function onSelect(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    void readFile(file);
  }
}
</script>

<template>
  <div
    class="dropzone"
    :class="{ dragover }"
    role="button"
    tabindex="0"
    @click="fileInput?.click()"
    @keydown.enter.prevent="fileInput?.click()"
    @keydown.space.prevent="fileInput?.click()"
    @dragover.prevent="dragover = true"
    @dragleave.prevent="dragover = false"
    @drop.prevent="onDrop"
  >
    <p class="dropzone-icon mb-2 text-body-secondary"><AppIcon name="cloud-arrow-up" /></p>
    <p class="mb-1 fw-semibold">Import an existing meta.xml</p>
    <p class="mb-0 text-body-secondary small">Drop a file here or click to browse</p>
    <input ref="fileInput" type="file" accept=".xml,text/xml,application/xml" class="d-none" @change="onSelect" />
  </div>
</template>
