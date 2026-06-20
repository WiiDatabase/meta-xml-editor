import { emptyMeta, type MetaXml } from '../types';
import { isValidReleaseDate } from './releaseDate';

export interface ParseResult {
  data: MetaXml;
  warnings: string[];
}

export const ARGS_MAX_LEN = 1024;

export function argsByteLength(args: string[]): number {
  const used = args.filter((arg) => arg.trim().length > 0);
  if (used.length === 0) {
    return 0;
  }
  const encoder = new TextEncoder();
  const bytes = used.reduce((total, arg) => total + encoder.encode(arg).length, 0);
  return bytes + used.length;
}

function textOf(parent: Element, selector: string): string {
  const el = parent.querySelector(selector);
  return el?.textContent?.trim() ?? '';
}

export function parseMetaXml(xml: string): ParseResult {
  const warnings: string[] = [];
  const doc = new DOMParser().parseFromString(xml, 'application/xml');

  if (doc.querySelector('parsererror')) {
    throw new Error('The file is not valid XML.');
  }

  const app = doc.querySelector('app');
  if (!app) {
    throw new Error('No <app> root element found.');
  }

  const data = emptyMeta();
  data.name = textOf(app, 'name');
  // HBC reads <author> first and falls back to <coder>.
  data.coder = textOf(app, 'author') || textOf(app, 'coder');
  data.version = textOf(app, 'version');
  data.releaseDate = textOf(app, 'release_date');
  data.shortDescription = textOf(app, 'short_description');
  data.longDescription = textOf(app, 'long_description');

  // HBC reads each <arg> via _get_cdata without trimming, so preserve the value verbatim.
  for (const arg of app.querySelectorAll('arguments > arg')) {
    const value = arg.textContent ?? '';
    if (value.length > 0) {
      data.arguments.push(value);
    }
  }

  data.ahbAccess = app.querySelector('ahb_access') !== null;
  data.noIosReload = app.querySelector('no_ios_reload') !== null;

  if (data.releaseDate && !isValidReleaseDate(data.releaseDate)) {
    warnings.push(
      `release_date "${data.releaseDate}" is not in a format the Homebrew Channel understands ` +
        '(YYYYMMDD or YYYYMMDDhhmmss). It is kept as-is but date sorting will not work in HBC.',
    );
  }

  return { data, warnings };
}

function escapeXml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

export function serializeMetaXml(data: MetaXml): string {
  const lines: string[] = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>', '<app version="1">'];

  const addElement = (tag: string, value: string) => {
    if (value.trim().length === 0) {
      return;
    }
    lines.push(`  <${tag}>${escapeXml(value)}</${tag}>`);
  };

  addElement('name', data.name);
  addElement('coder', data.coder);
  addElement('version', data.version);
  addElement('release_date', data.releaseDate);
  addElement('short_description', data.shortDescription);
  addElement('long_description', data.longDescription);

  const args = data.arguments.filter((arg) => arg.trim().length > 0);
  if (args.length > 0) {
    lines.push('  <arguments>');
    for (const arg of args) {
      lines.push(`    <arg>${escapeXml(arg)}</arg>`);
    }
    lines.push('  </arguments>');
  }

  if (data.ahbAccess) {
    lines.push('  <ahb_access/>');
  }
  if (data.noIosReload) {
    lines.push('  <no_ios_reload/>');
  }

  lines.push('</app>', '');
  return lines.join('\n');
}
