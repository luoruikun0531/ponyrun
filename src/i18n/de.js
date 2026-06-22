export default {
  appTitle: 'PonyRun', tagline: 'Versammelt euch um ein Handy, sammelt Items und rast ins Ziel', loading: 'Lädt…', langName: 'DE',
  start: { ponies: 'Wie viele Ponys?', names: 'Name / Farbe (optional)', play: 'START', hint: 'Tippe auf vorbeifliegende Items und stifte Chaos · seltener = schneller = schwieriger = wilder', tapName: 'Zum Umbenennen tippen' },
  settings: { track: 'Streckenlänge', items: 'Item-Dichte', off: 'Aus' },
  guide: {
    open: 'Spielanleitung', title: 'Spielanleitung', rulesTitle: 'Rennregeln', itemsTitle: 'Items', back: 'Zurück zur Auswahl',
    penaltyLegend: 'Ein 🤡 bedeutet eine Strafe. +1 fügt eine hinzu, −1 entfernt eine.',
    rules: { setup: 'Wählt 2–4 Ponys, legt das Handy quer und flach hin und versammelt euch darum.', catch: 'Tippt auf vorbeifliegende Items; jedes wirkt auf das Pony in seiner Bahn.', finish: 'Das erste Pony im Ziel gewinnt ohne Strafe. Jedes andere Pony erhält mindestens 1 Strafe.' },
    items: {
      dash: { name: 'Sprint', desc: 'Das Pony sprintet mit einem kurzen Temposchub vorwärts.' }, banana: { name: 'Bananenschale', desc: 'Das Pony rutscht aus, stoppt und fällt ein kurzes Stück zurück.' },
      penaltyPlus: { name: 'Strafe +1', desc: 'Das Pony erhält am Ende 1 weitere Strafe.' }, penaltyMinus: { name: 'Strafe −1', desc: 'Das Pony erhält am Ende 1 Strafe weniger.' },
      missile: { name: 'Rakete', desc: 'Schleudert das Pony weit zurück.' }, hitchhike: { name: 'Freie Fahrt', desc: 'Fährt das Pony ein großes Stück vorwärts.' },
    },
  },
  race: { ready: 'Bereit…', go: 'LOS!', tapItems: 'Items antippen!', photoFinish: 'Fotofinish!' },
  result: { winner: 'Gewinner', loser: 'Verlierer', safe: 'Keine Strafe', noPenalty: 'Keine Strafe ✨', penalty: 'Strafe ×{n}!', complete: 'Rennen beendet!', replay: 'Noch einmal', setup: 'Auswahl', rankTitle: 'Ergebnisse' },
  items: { dash: 'Sprint!', banana: 'Ausgerutscht!', penaltyPlus: 'Strafe +1', penaltyMinus: 'Strafe −1', swap: 'Tausch!', missile: 'Rakete!', hitchhike: 'Freie Fahrt!', miss: 'Daneben…' },
  rotate: { title: 'Bitte drehe dein Handy', desc: 'Quer und flach auf den Tisch legen und gemeinsam spielen' },
  install: { tap1: 'Vollbild gewünscht? Tippe auf', tap2: 'Teilen → „Zum Home-Bildschirm“' },
  colors: { white: 'Schnee', brown: 'Kakao', gray: 'Rauch', yellow: 'Sonne' },
};
