// Top-level orchestration: a small state machine wiring the DOM UI to the
// PixiJS RaceView and the audio. menu → countdown → racing → result → repeat.

import { RaceView } from './render/RaceView.js';
import { UI } from './ui/screens.js';
import { randomSeed } from './logic/rng.js';
import { startBgm, stopBgm, setBgmTempo } from './audio/bgm.js';
import { unlockAudio } from './audio/sfx.js';

export class Game {
  constructor(app, assets) {
    this.app = app;
    this.view = new RaceView(app, assets);
    this.view.mount();
    this.ui = new UI(document.getElementById('app'), assets, {
      onStart: (ponies) => this._begin(ponies),
      onReplay: () => this._begin(this.ponies, randomSeed()),
      onSetup: () => this._toMenu(),
    });
    this.ponies = null;
    app.renderer.on('resize', () => { this.view.relayout(); this._checkOrientation(); });
    window.addEventListener('orientationchange', () => setTimeout(() => this._checkOrientation(), 200));
    this._checkOrientation();
  }

  start() { this._toMenu(); }

  _toMenu() {
    stopBgm();
    this.ui.showStart();
  }

  _begin(ponies, seed = randomSeed()) {
    this.ponies = ponies;
    unlockAudio();
    this.ui.hideAll();
    this.view.setup({ ponies, seed });
    this.ui.countdown(() => {
      setBgmTempo(1);
      startBgm();
      this.view.start((results) => this._finish(results));
    });
  }

  _finish(results) {
    setTimeout(() => stopBgm(), 400);
    this.ui.showResult(results);
  }

  _checkOrientation() {
    const portrait = window.innerHeight > window.innerWidth * 1.05;
    this.ui.setRotate(portrait);
  }
}
