<script setup lang="ts">
import { computed, ref } from 'vue';
import AppIcon from './components/AppIcon.vue';
import ImportDropzone from './components/ImportDropzone.vue';
import MetaForm from './components/MetaForm.vue';
import ThemeSwitcher from './components/ThemeSwitcher.vue';
import XmlPreview from './components/XmlPreview.vue';
import { parseMetaXml, serializeMetaXml } from './lib/metaXml';
import { emptyMeta, type MetaXml } from './types';

const meta = ref<MetaXml>(emptyMeta());
const warnings = ref<string[]>([]);
const error = ref('');

const xml = computed(() => serializeMetaXml(meta.value));

function onLoad(content: string): void {
  try {
    const result = parseMetaXml(content);
    meta.value = result.data;
    warnings.value = result.warnings;
    error.value = '';
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not read the file.';
    warnings.value = [];
  }
}

function reset(): void {
  meta.value = emptyMeta();
  warnings.value = [];
  error.value = '';
}
</script>

<template>
  <header class="navbar navbar-expand app-navbar mb-4">
    <div class="container">
      <span class="navbar-brand mb-0 h1">meta.xml Editor</span>
      <div class="d-flex align-items-center gap-2">
        <button type="button" class="btn btn-sm btn-outline-light" @click="reset">
          <AppIcon name="file-circle-plus" /> New
        </button>
        <ThemeSwitcher />
      </div>
    </div>
  </header>

  <main class="container pb-5">
    <div class="row g-4">
      <div class="col-lg-7">
        <ImportDropzone class="mb-4" @load="onLoad" />

        <div v-if="error" class="alert alert-danger d-flex align-items-center gap-2" role="alert">
          <AppIcon name="circle-exclamation" />{{ error }}
        </div>
        <div
          v-for="(warning, index) in warnings"
          :key="index"
          class="alert alert-warning d-flex align-items-center gap-2"
          role="alert"
        >
          <AppIcon name="triangle-exclamation" />{{ warning }}
        </div>

        <MetaForm v-model="meta" />
      </div>

      <div class="col-lg-5">
        <XmlPreview :xml="xml" />
      </div>
    </div>
  </main>
</template>
