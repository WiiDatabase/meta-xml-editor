// HBC parses release_date only as YYYYMMDD (8 digits) or YYYYMMDDhhmmss (14 digits).
// Any other value fails to parse and disables date sorting.

export type ReleaseDateMode = 'keep' | 'date' | 'datetime';

const DATE_RE = /^\d{8}$/;
const DATETIME_RE = /^\d{14}$/;

export function isValidReleaseDate(value: string): boolean {
  if (DATE_RE.test(value)) {
    return isValidParts(value, false);
  }
  if (DATETIME_RE.test(value)) {
    return isValidParts(value, true);
  }
  return false;
}

function isValidParts(value: string, withTime: boolean): boolean {
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  if (withTime) {
    const hour = Number(value.slice(8, 10));
    const minute = Number(value.slice(10, 12));
    const second = Number(value.slice(12, 14));
    if (hour > 23 || minute > 59 || second > 59) {
      return false;
    }
  }
  return true;
}

// "20240429" -> "2024-04-29" for <input type="date">
export function toDateInput(value: string): string {
  if (value.length < 8) {
    return '';
  }
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

// "20240429081529" -> "2024-04-29T08:15:29" for <input type="datetime-local">
export function toDateTimeInput(value: string): string {
  const date = toDateInput(value);
  if (!date) {
    return '';
  }
  if (value.length >= 14) {
    return `${date}T${value.slice(8, 10)}:${value.slice(10, 12)}:${value.slice(12, 14)}`;
  }
  return `${date}T00:00:00`;
}

// "2024-04-29" -> "20240429"
export function fromDateInput(value: string): string {
  return value.replaceAll('-', '');
}

// "2024-04-29T08:15" or with seconds -> "20240429081500"
export function fromDateTimeInput(value: string): string {
  const [date, time = ''] = value.split('T');
  const digits = (date + time).replace(/[-:]/g, '');
  return digits.padEnd(14, '0').slice(0, 14);
}
