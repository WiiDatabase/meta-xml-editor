<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ARGS_MAX_LEN, argsByteLength } from '../lib/metaXml';
import {
  fromDateInput,
  fromDateTimeInput,
  isValidReleaseDate,
  type ReleaseDateMode,
  toDateInput,
  toDateTimeInput,
} from '../lib/releaseDate';
import type { MetaXml } from '../types';
import AppIcon from './AppIcon.vue';

const model = defineModel<MetaXml>({ required: true });

const dateMode = ref<ReleaseDateMode>('date');
const keepValue = ref('');

function resolveMode(value: string): ReleaseDateMode {
  if (value === '') {
    return 'date';
  }
  if (/^\d{14}$/.test(value) && isValidReleaseDate(value)) {
    return 'datetime';
  }
  if (isValidReleaseDate(value)) {
    return 'date';
  }
  return 'keep';
}

// "Keep as-is" only makes sense once an unparseable value has been imported.
const canKeep = computed(() => keepValue.value !== '');

// Pick a sensible mode and remember any unparseable value whenever a meta.xml is loaded.
watch(
  () => model.value,
  (m) => {
    const mode = resolveMode(m.releaseDate);
    keepValue.value = mode === 'keep' ? m.releaseDate : '';
    dateMode.value = mode;
  },
  { immediate: true },
);

// Normalize the stored value to the selected picker's format when switching modes.
watch(dateMode, (mode) => {
  if (mode === 'date') {
    const value = toDateInput(model.value.releaseDate);
    model.value.releaseDate = value ? fromDateInput(value) : '';
  } else if (mode === 'datetime') {
    const value = toDateTimeInput(model.value.releaseDate);
    model.value.releaseDate = value ? fromDateTimeInput(value) : '';
  } else {
    model.value.releaseDate = keepValue.value;
  }
});

const keepInput = computed({
  get: () => model.value.releaseDate,
  set: (value: string) => {
    model.value.releaseDate = value;
    keepValue.value = value;
  },
});

const releaseDateValid = computed(() => model.value.releaseDate === '' || isValidReleaseDate(model.value.releaseDate));

const dateInput = computed({
  get: () => toDateInput(model.value.releaseDate),
  set: (value: string) => {
    model.value.releaseDate = value ? fromDateInput(value) : '';
  },
});

const dateTimeInput = computed({
  get: () => toDateTimeInput(model.value.releaseDate),
  set: (value: string) => {
    model.value.releaseDate = value ? fromDateTimeInput(value) : '';
  },
});

const argsLength = computed(() => argsByteLength(model.value.arguments));

function addArg(): void {
  model.value.arguments.push('');
}

function removeArg(index: number): void {
  model.value.arguments.splice(index, 1);
}

function moveArg(index: number, delta: number): void {
  const target = index + delta;
  if (target < 0 || target >= model.value.arguments.length) {
    return;
  }
  const args = model.value.arguments;
  [args[index], args[target]] = [args[target], args[index]];
}
</script>

<template>
  <form @submit.prevent>
    <div class="mb-3">
      <label for="name" class="form-label"><AppIcon name="tag" class="me-1" />Name</label>
      <input id="name" v-model="model.name" type="text" class="form-control" placeholder="The Homebrew App" />
    </div>

    <div class="row">
      <div class="col-md-6 mb-3">
        <label for="coder" class="form-label"><AppIcon name="user" class="me-1" />Author / Coder</label>
        <input id="coder" v-model="model.coder" type="text" class="form-control" placeholder="Your name or group" />
      </div>
      <div class="col-md-6 mb-3">
        <label for="version" class="form-label"><AppIcon name="code-branch" class="me-1" />Version</label>
        <input id="version" v-model="model.version" type="text" class="form-control" placeholder="1.0" />
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label d-block"><AppIcon name="calendar-days" class="me-1" />Release date</label>
      <div class="btn-group btn-group-sm mb-2" role="group" aria-label="Release date mode">
        <template v-if="canKeep">
          <input id="rd-keep" v-model="dateMode" class="btn-check" type="radio" value="keep" />
          <label class="btn btn-outline-secondary" for="rd-keep">Keep as-is</label>
        </template>
        <input id="rd-date" v-model="dateMode" class="btn-check" type="radio" value="date" />
        <label class="btn btn-outline-secondary" for="rd-date">Date</label>
        <input id="rd-datetime" v-model="dateMode" class="btn-check" type="radio" value="datetime" />
        <label class="btn btn-outline-secondary" for="rd-datetime">Date &amp; time</label>
      </div>

      <input
        v-if="dateMode === 'keep'"
        v-model="keepInput"
        type="text"
        class="form-control"
        :class="{ 'is-invalid': !releaseDateValid }"
        placeholder="YYYYMMDD or YYYYMMDDhhmmss"
      />
      <input v-else-if="dateMode === 'date'" v-model="dateInput" type="date" class="form-control" />
      <input v-else v-model="dateTimeInput" type="datetime-local" step="1" class="form-control" />

      <div v-if="!releaseDateValid" class="form-text text-warning-emphasis">
        The Homebrew Channel only reads <code>YYYYMMDD</code> or <code>YYYYMMDDhhmmss</code>. This value is kept
        as-is, but HBC will not use it for sorting.
      </div>
      <div v-else class="form-text">Stored as <code>{{ model.releaseDate || '—' }}</code></div>
    </div>

    <div class="mb-3">
      <label for="short" class="form-label">
        <AppIcon name="comment" class="me-1" />Short description
        <span class="text-body-secondary small">({{ model.shortDescription.length }} chars)</span>
      </label>
      <input
        id="short"
        v-model="model.shortDescription"
        type="text"
        class="form-control"
        placeholder="Shown on the HBC main menu"
      />
      <div v-if="model.shortDescription.length > 40" class="form-text text-warning-emphasis">
        This may be truncated on the Homebrew Channel menu.
      </div>
    </div>

    <div class="mb-3">
      <label for="long" class="form-label"><AppIcon name="align-left" class="me-1" />Long description</label>
      <textarea
        id="long"
        v-model="model.longDescription"
        class="form-control"
        rows="6"
        placeholder="Shown after the app is selected"
      ></textarea>
    </div>

    <div class="mb-3">
      <label class="form-label d-block"><AppIcon name="terminal" class="me-1" />Arguments</label>
      <div v-for="(_, index) in model.arguments" :key="index" class="input-group mb-2">
        <input v-model="model.arguments[index]" type="text" class="form-control" placeholder="theme=&quot;random&quot;" />
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="index === 0"
          title="Move up"
          @click="moveArg(index, -1)"
        >
          <AppIcon name="chevron-up" />
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="index === model.arguments.length - 1"
          title="Move down"
          @click="moveArg(index, 1)"
        >
          <AppIcon name="chevron-down" />
        </button>
        <button type="button" class="btn btn-outline-danger" title="Remove" @click="removeArg(index)">
          <AppIcon name="xmark" />
        </button>
      </div>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="addArg">
        <AppIcon name="plus" /> Add argument
      </button>
      <div v-if="argsLength > ARGS_MAX_LEN" class="form-text text-warning-emphasis">
        These arguments total {{ argsLength }} bytes. The Homebrew Channel ignores all arguments once they
        exceed {{ ARGS_MAX_LEN }} bytes.
      </div>
    </div>

    <fieldset class="mb-3">
      <legend class="form-label"><AppIcon name="flag" class="me-1" />Flags</legend>
      <div class="form-check">
        <input id="ahb" v-model="model.ahbAccess" class="form-check-input" type="checkbox" />
        <label class="form-check-label" for="ahb">
          <code>ahb_access</code> — keep AHBPROT hardware access
        </label>
      </div>
      <div class="form-check">
        <input id="noios" v-model="model.noIosReload" class="form-check-input" type="checkbox" />
        <label class="form-check-label" for="noios">
          <code>no_ios_reload</code> — do not reload IOS
        </label>
      </div>
    </fieldset>
  </form>
</template>
