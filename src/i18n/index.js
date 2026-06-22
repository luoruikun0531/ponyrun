// Tiny dependency-free i18n layer. UI subscribes to language changes so it
// can re-render everything live.

import zh from './zh.js';
import en from './en.js';
import th from './th.js';
import vi from './vi.js';
import id from './id.js';
import de from './de.js';
import it from './it.js';
import es from './es.js';
import ko from './ko.js';
import ja from './ja.js';

const DICTS = { zh, en, th, vi, id, de, it, es, ko, ja };
export const LANGUAGES = [
  { code: 'zh', label: '中文', htmlLang: 'zh-CN' },
  { code: 'en', label: 'English', htmlLang: 'en' },
  { code: 'th', label: 'ไทย', htmlLang: 'th' },
  { code: 'vi', label: 'Tiếng Việt', htmlLang: 'vi' },
  { code: 'id', label: 'Indonesia', htmlLang: 'id' },
  { code: 'de', label: 'Deutsch', htmlLang: 'de' },
  { code: 'it', label: 'Italiano', htmlLang: 'it' },
  { code: 'es', label: 'Español', htmlLang: 'es' },
  { code: 'ko', label: '한국어', htmlLang: 'ko' },
  { code: 'ja', label: '日本語', htmlLang: 'ja' },
];
const STORE_KEY = 'linepony.lang';
const subscribers = new Set();

function detect() {
  const requested = new URLSearchParams(window.location.search).get('lang');
  if (requested && DICTS[requested]) return requested;
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved && DICTS[saved]) return saved;
  } catch { /* ignore */ }
  const nav = (navigator.language || 'en').toLowerCase().split('-')[0];
  return DICTS[nav] ? nav : 'en';
}

let lang = detect();

export function getLang() {
  return lang;
}

export function setLang(next) {
  if (!DICTS[next] || next === lang) return;
  lang = next;
  try { localStorage.setItem(STORE_KEY, next); } catch { /* ignore */ }
  document.documentElement.lang = LANGUAGES.find(({ code }) => code === next)?.htmlLang || 'en';
  subscribers.forEach((fn) => fn(lang));
}

export function toggleLang() {
  const index = LANGUAGES.findIndex(({ code }) => code === lang);
  setLang(LANGUAGES[(index + 1) % LANGUAGES.length].code);
}

export function onLangChange(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

// t('result.replay') — dotted translation keys with optional interpolation.
// English plural helper: {s} → '' when n===1 else 's'.
export function t(key, params = {}) {
  const dict = DICTS[lang] || en;
  let str = key.split('.').reduce((o, k) => (o == null ? o : o[k]), dict);
  if (str == null) str = key;
  const p = { ...params };
  if (p.n != null && p.s == null) p.s = Number(p.n) === 1 ? '' : 's';
  return String(str).replace(/\{(\w+)\}/g, (_, k) => (p[k] != null ? p[k] : `{${k}}`));
}

document.documentElement.lang = LANGUAGES.find(({ code }) => code === lang)?.htmlLang || 'en';
