// All DOM screens: loading, start (pick ponies + names), countdown, result
// (loser reveal + ranking), rotate hint, and the top toggles (language / mute).
// Re-renders on language change. Pure DOM, mobile-first, landscape.

import { el, clear } from './dom.js';
import { t, getLang, toggleLang, onLangChange } from '../i18n/index.js';
import { PONIES, MIN_PONIES, MAX_PONIES } from '../logic/constants.js';
import { sfx, setMuted, isMuted, unlockAudio } from '../audio/sfx.js';

const baseUrl = (import.meta.env.BASE_URL || '/');
const asset = (p) => `${baseUrl}${p}`.replace(/([^:])\/\//g, '$1/');

export class UI {
  constructor(root, assets, callbacks) {
    this.assets = assets;
    this.cb = callbacks;
    this.count = MAX_PONIES;
    this.names = {};
    this.root = root;
    this.layer = el('div', { id: 'ui' });
    root.appendChild(this.layer);
    this.topbar = el('div', { class: 'topbar' });
    root.appendChild(this.topbar);
    this._buildTopbar();
    onLangChange(() => this._onLang());
  }

  // pony sprite thumbnail (frame 0 of an animation strip)
  thumb(key, anim = 'idle', h = 86) {
    const cell = this.assets.cell;
    const frames = this.assets.ponyAnims[key][anim].frames.length;
    const w = h * (cell.w / cell.h);
    return el('div', {
      class: 'thumb',
      style: {
        width: `${w}px`, height: `${h}px`,
        backgroundImage: `url(${asset(`assets/ponies/${key}/${anim}.png`)})`,
        backgroundSize: `${frames * 100}% 100%`,
        backgroundPosition: '0% 0%',
      },
    });
  }

  _buildTopbar() {
    this.langBtn = el('button', { class: 'chip-btn', onClick: () => { sfx.tapUI(); toggleLang(); } });
    this.muteBtn = el('button', { class: 'chip-btn', onClick: () => { unlockAudio(); setMuted(!isMuted()); this._syncMute(); sfx.tapUI(); } });
    this.topbar.append(this.langBtn, this.muteBtn);
    this._syncToggles();
  }

  _syncToggles() {
    this.langBtn.textContent = getLang() === 'zh' ? 'EN' : '中';
    this._syncMute();
  }

  _syncMute() { this.muteBtn.textContent = isMuted() ? '🔇' : '🔊'; }

  _onLang() {
    this._syncToggles();
    if (this._screen === 'start') this.showStart();
    else if (this._screen === 'result' && this._lastResults) this.showResult(this._lastResults);
    if (this._rotate) { this.setRotate(false); this.setRotate(true); }
  }

  hideAll() { clear(this.layer); this._screen = null; }

  // ── Start ────────────────────────────────────────────────────────────
  showStart() {
    this._screen = 'start';
    clear(this.layer);
    this.topbar.style.display = 'flex';

    const countChips = el('div', { class: 'chips' },
      Array.from({ length: MAX_PONIES - MIN_PONIES + 1 }, (_, i) => {
        const n = MIN_PONIES + i;
        return el('button', {
          class: 'chip' + (n === this.count ? ' on' : ''),
          onClick: () => { sfx.tapUI(); this.count = n; this.showStart(); },
        }, String(n));
      }));

    const roster = el('div', { class: 'roster' },
      PONIES.slice(0, this.count).map((p) => {
        const name = this.names[p.key] ?? t(p.nameKey);
        const input = el('input', { class: 'name-input', value: name, maxlength: 6, spellcheck: 'false',
          onInput: (e) => { this.names[p.key] = e.target.value; } });
        return el('div', { class: 'pony-card' }, [this.thumb(p.key, 'idle', 60), input]);
      }));

    const playBtn = el('button', { class: 'play-btn', onClick: () => { unlockAudio(); sfx.go(); this._start(); } }, t('start.play'));

    const panel = el('div', { class: 'panel start-panel' }, [
      el('div', { class: 'title' }, [el('span', { class: 'title-zh' }, t('appTitle')), el('span', { class: 'hoof' }, '🐴')]),
      el('div', { class: 'tagline' }, t('tagline')),
      el('div', { class: 'section-label' }, t('start.ponies')),
      countChips,
      roster,
      playBtn,
      el('div', { class: 'hint' }, t('start.hint')),
    ]);
    this.layer.appendChild(panel);
  }

  _start() {
    const ponies = PONIES.slice(0, this.count).map((p, i) => ({
      id: i, colorKey: p.key, accent: p.accent, name: (this.names[p.key] ?? t(p.nameKey)).trim() || t(p.nameKey),
    }));
    this.cb.onStart(ponies);
  }

  // ── Countdown ────────────────────────────────────────────────────────
  countdown(onGo) {
    this._screen = 'countdown';
    clear(this.layer);
    this.topbar.style.display = 'none';
    const big = el('div', { class: 'countdown' });
    this.layer.appendChild(big);
    const steps = ['3', '2', '1', t('race.go')];
    let i = 0;
    const tick = () => {
      big.textContent = steps[i];
      big.classList.remove('pop'); void big.offsetWidth; big.classList.add('pop');
      if (i === steps.length - 1) { big.classList.add('go'); sfx.go(); }
      else sfx.countdown();
      i++;
      if (i < steps.length) setTimeout(tick, 700);
      else setTimeout(() => { clear(this.layer); onGo(); }, 600);
    };
    tick();
  }

  // ── Result ───────────────────────────────────────────────────────────
  showResult(results) {
    this._screen = 'result';
    this._lastResults = results;
    clear(this.layer);
    this.topbar.style.display = 'flex';
    const { order, winner, loser } = results;
    // every pony owes 1 cup; the winner is exempt; items adjust the rest
    const drinksOf = (p) => (p === winner ? 0 : Math.max(1, p.penalty));

    const loserCard = el('div', { class: 'loser-reveal' }, [
      this.thumb(loser.colorKey, 'cry', 130),
      el('div', { class: 'loser-text' }, [
        el('div', { class: 'loser-label' }, '🍺 ' + t('result.loser')),
        el('div', { class: 'loser-name' }, this._nameOf(loser)),
        el('div', { class: 'loser-drink' }, t('result.drink', { n: drinksOf(loser) })),
      ]),
    ]);

    const cups = (p) => {
      const d = drinksOf(p);
      if (d === 0) return el('span', { class: 'rank-safe' }, '✅ ' + t('result.safe'));
      return el('span', { class: 'rank-cups' }, `🍺 ×${d}`);
    };
    const rankList = el('div', { class: 'rank-list' },
      order.map((p, i) => el('div', { class: 'rank-row' + (p === loser ? ' is-loser' : '') + (p === winner ? ' is-winner' : '') }, [
        el('span', { class: 'rank-no' }, i === 0 ? '👑' : `${i + 1}`),
        this.thumb(p.colorKey, i === 0 ? 'taunt' : 'idle', 44),
        el('span', { class: 'rank-name' }, this._nameOf(p)),
        cups(p),
      ])));

    const buttons = el('div', { class: 'result-btns' }, [
      el('button', { class: 'play-btn', onClick: () => { unlockAudio(); sfx.tapUI(); this.cb.onReplay(); } }, '🔄 ' + t('result.replay')),
      el('button', { class: 'ghost-btn', onClick: () => { sfx.tapUI(); this.cb.onSetup(); } }, t('result.setup')),
    ]);

    this.layer.appendChild(el('div', { class: 'panel result-panel' }, [
      loserCard,
      el('div', { class: 'section-label' }, t('result.rankTitle')),
      rankList,
      buttons,
    ]));
  }

  _nameOf(pony) {
    const def = PONIES.find((p) => p.key === pony.colorKey);
    return (this.names[pony.colorKey] ?? '').trim() || (def ? t(def.nameKey) : pony.name);
  }

  // ── Rotate hint ──────────────────────────────────────────────────────
  setRotate(show) {
    if (show && !this._rotate) {
      const ponies = el('div', { class: 'rotate-ponies' },
        PONIES.map((p) => this.thumb(p.key, 'idle', 60)));
      this._rotate = el('div', { class: 'rotate' }, [
        el('div', { class: 'rotate-brand' }, [t('appTitle'), el('span', { class: 'hoof' }, '🐴')]),
        ponies,
        el('div', { class: 'rotate-emoji' }, '📱'),
        el('div', { class: 'rotate-title' }, t('rotate.title')),
        el('div', { class: 'rotate-desc' }, t('rotate.desc')),
      ]);
      this.root.appendChild(this._rotate);
    } else if (!show && this._rotate) {
      this._rotate.remove(); this._rotate = null;
    }
  }
}
