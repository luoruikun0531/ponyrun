import './styles.css';
import { Application } from 'pixi.js';
import { loadAssets } from './render/assets.js';
import { Game } from './game.js';
import { t, onLangChange } from './i18n/index.js';

function setLoading(show) {
  let l = document.getElementById('loading');
  if (show) {
    if (!l) {
      l = document.createElement('div');
      l.id = 'loading';
      l.innerHTML = `<div class="load-pony">🐴</div><div class="load-text">${t('loading')}</div>`;
      document.getElementById('app').appendChild(l);
    }
  } else if (l) {
    l.remove();
  }
}

async function boot() {
  setLoading(true);
  const app = new Application();
  await app.init({
    resizeTo: window,
    background: '#8ec9e8',
    antialias: true,
    resolution: Math.min(2, window.devicePixelRatio || 1),
    autoDensity: true,
  });
  document.getElementById('app').appendChild(app.canvas);

  const assets = await loadAssets();
  setLoading(false);

  const game = new Game(app, assets);
  game.start();
  window.__game = game;
  onLangChange(() => { document.title = `${t('appTitle')} · Line Pony`; });
}

boot();
