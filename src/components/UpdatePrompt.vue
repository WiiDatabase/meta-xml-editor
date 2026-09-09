<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue';
import AppIcon from './AppIcon.vue';

const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000;

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
  onRegisteredSW(_url, registration) {
    if (!registration) {
      return;
    }
    setInterval(() => {
      if (navigator.onLine) {
        void registration.update();
      }
    }, UPDATE_CHECK_INTERVAL);
  },
});

function dismiss(): void {
  offlineReady.value = false;
  needRefresh.value = false;
}
</script>

<template>
  <div v-if="offlineReady || needRefresh" class="app-toast" role="status" aria-live="polite">
    <div class="alert shadow-lg mb-0" :class="needRefresh ? 'alert-primary' : 'alert-success'">
      <div class="d-flex align-items-start gap-2">
        <AppIcon :name="needRefresh ? 'cloud-arrow-up' : 'circle-check'" class="mt-1" />
        <div class="flex-grow-1">
          <p class="fw-semibold mb-1">{{ needRefresh ? 'A new version is available' : 'Ready to work offline' }}</p>
          <p class="small mb-0">
            {{
              needRefresh
                ? 'Reload to use it. Download your meta.xml first, all changes will be lost.'
                : 'This page is now cached and opens without a connection.'
            }}
          </p>
        </div>
        <button type="button" class="btn-close" aria-label="Dismiss" @click="dismiss"></button>
      </div>
      <button
        v-if="needRefresh"
        type="button"
        class="btn btn-sm btn-secondary w-100 mt-3"
        @click="updateServiceWorker(true)"
      >
        <AppIcon name="cloud-arrow-up" class="me-2" /> Reload now
      </button>
    </div>
  </div>
</template>
