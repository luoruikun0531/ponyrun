// Tiny bilingual layer (zh / en). No dependency. UI subscribes to language
// changes so a toggle re-renders everything live.

import zh from './zh.js';
import en from './en.js';

const DICTS = { zh, en };
const STORE_KEY = 'linepony.lang';
const subscribers = new Set();

function detect() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved && DICTS[saved]) return saved;
  } catch { /* ignore */ }
  const nav = (navigator.language || 'en').toLowerCase();
  return nav.startsWith('zh') ? 'zh' : 'en';
}

let lang = detect();

export function getLang() {
  return lang;
}

export function setLang(next) {
  if (!DICTS[next] || next === lang) return;
  lang = next;
  try { localStorage.setItem(STORE_KEY, next); } catch { /* ignore */ }
  document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en';
  subscribers.forEach((fn) => fn(lang));
}

export function toggleLang() {
  setLang(lang === 'zh' ? 'en' : 'zh');
}

export function onLangChange(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

// t('result.drink', { n: 3 }) — dotted key + {placeholder} interpolation.
// English plural helper: {s} → '' when n===1 else 's'.
export function t(key, params = {}) {
  const dict = DICTS[lang] || en;
  let str = key.split('.').reduce((o, k) => (o == null ? o : o[k]), dict);
  if (str == null) str = key;
  const p = { ...params };
  if (p.n != null && p.s == null) p.s = Number(p.n) === 1 ? '' : 's';
  return String(str).replace(/\{(\w+)\}/g, (_, k) => (p[k] != null ? p[k] : `{${k}}`));
}

document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
