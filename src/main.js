import './styles.css';
import { Application } from 'pixi.js';
import { loadAssets } from './render/assets.js';
import { Game } from './game.js';
import { ANALYTICS_EVENTS, trackEvent } from './logic/analytics.js';
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
  const appEl = document.getElementById('app');
  const app = new Application();
  await app.init({
    width: appEl.clientWidth || window.innerWidth,
    height: appEl.clientHeight || window.innerHeight,
    background: '#8ec9e8',
    antialias: true,
    resolution: Math.min(2, window.devicePixelRatio || 1),
    autoDensity: true,
  });
  appEl.appendChild(app.canvas);

  // Robust sizing: match the renderer to the #app box (the layout viewport) so
  // the canvas always fills the screen. Re-fit on every event that can change
  // the mobile viewport, plus delayed re-checks for the iOS Safari toolbar.
  const fit = () => {
    // viewport-fit=cover ⇒ innerWidth/Height span the full screen incl. notch
    const w = Math.max(window.innerWidth || 0, appEl.clientWidth || 0);
    const h = Math.max(window.innerHeight || 0, appEl.clientHeight || 0);
    if (w > 1 && h > 1) app.renderer.resize(w, h);
  };
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', () => { fit(); setTimeout(fit, 250); setTimeout(fit, 600); });
  if (window.visualViewport) window.visualViewport.addEventListener('resize', fit);

  const assets = await loadAssets();
  setLoading(false);

  const game = new Game(app, assets);
  game.start();
  fit();
  requestAnimationFrame(fit);
  setTimeout(fit, 300);
  window.__game = game;
  void trackEvent(ANALYTICS_EVENTS.gamePageView);
  onLangChange(() => { document.title = `${t('appTitle')} · PonyRun`; });
}

boot();
