<script setup lang="ts">
import { ref } from 'vue';
import AppIcon from './AppIcon.vue';

const props = defineProps<{ xml: string }>();

const copied = ref(false);

async function copy(): Promise<void> {
  await navigator.clipboard.writeText(props.xml);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1500);
}

function download(): void {
  const blob = new Blob([props.xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'meta.xml';
  link.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="preview-pane">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h2 class="h5 mb-0"><AppIcon name="file-code" class="me-1" />Preview</h2>
      <div class="btn-group btn-group-sm">
        <button type="button" class="btn btn-outline-secondary" @click="copy">
          <AppIcon name="copy" /> {{ copied ? 'Copied!' : 'Copy' }}
        </button>
        <button type="button" class="btn btn-secondary" @click="download">
          <AppIcon name="download" /> Download
        </button>
      </div>
    </div>
    <pre class="xml-preview"><code>{{ xml }}</code></pre>
  </div>
</template>
