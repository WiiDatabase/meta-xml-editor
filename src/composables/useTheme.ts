import { onMounted, ref } from 'vue';

export type Theme = 'auto' | 'light' | 'dark';

const STORAGE_KEY = 'theme';
const theme = ref<Theme>('auto');

function prefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

function resolve(value: Theme): 'light' | 'dark' {
  if (value === 'auto') {
    return prefersDark() ? 'dark' : 'light';
  }
  return value;
}

function apply(value: Theme): void {
  document.documentElement.setAttribute('data-bs-theme', resolve(value));
}

export function useTheme() {
  function setTheme(value: Theme): void {
    theme.value = value;
    if (value === 'auto') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, value);
    }
    apply(value);
  }

  onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    theme.value = stored === 'light' || stored === 'dark' ? stored : 'auto';
    apply(theme.value);

    window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'auto') {
        apply('auto');
      }
    });
  });

  return { theme, setTheme };
}
