import { describe, expect, it } from 'vitest';
import zh from './zh.js';
import en from './en.js';
import th from './th.js';
import vi from './vi.js';
import id from './id.js';
import de from './de.js';
import italian from './it.js';
import es from './es.js';
import ko from './ko.js';
import ja from './ja.js';

const dictionaries = { zh, en, th, vi, id, de, it: italian, es, ko, ja };

function keysOf(value, prefix = '') {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof child === 'object' ? keysOf(child, path) : path;
  });
}

describe('translations', () => {
  it('keeps every language in sync with English', () => {
    const expected = keysOf(en).sort();
    for (const [language, dictionary] of Object.entries(dictionaries)) {
      expect(keysOf(dictionary).sort(), language).toEqual(expected);
    }
  });

  it('preserves result interpolation placeholders', () => {
    for (const [language, dictionary] of Object.entries(dictionaries)) {
      expect(dictionary.result.penalty, language).toContain('{n}');
    }
  });
});
