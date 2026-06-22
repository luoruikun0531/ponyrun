export default {
  appTitle: 'PonyRun', tagline: 'Tutti intorno a un telefono: raccogli oggetti e corri al traguardo', loading: 'Caricamento…', langName: 'IT',
  start: { ponies: 'Quanti pony?', names: 'Nome / colore (facoltativo)', play: 'VIA', hint: 'Tocca gli oggetti al volo per scatenare il caos · più raro = più veloce = più difficile = più folle', tapName: 'tocca per rinominare' },
  settings: { track: 'Lunghezza pista', items: 'Densità oggetti', off: 'No' },
  guide: {
    open: 'Come si gioca', title: 'Come si gioca', rulesTitle: 'Regole della gara', itemsTitle: 'Oggetti', back: 'Torna alla preparazione',
    penaltyLegend: 'Un 🤡 equivale a una penalità. +1 ne aggiunge una; −1 ne rimuove una.',
    rules: { setup: 'Scegliete 2–4 pony, posate il telefono in orizzontale e radunatevi intorno.', catch: 'Toccate gli oggetti al volo; ciascuno agisce sul pony nella sua corsia.', finish: 'Il primo pony al traguardo vince senza penalità. Ogni altro pony riceve almeno 1 penalità.' },
    items: {
      dash: { name: 'Scatto', desc: 'Il pony scatta in avanti con un breve aumento di velocità.' }, banana: { name: 'Buccia di banana', desc: 'Il pony scivola, si ferma e arretra di poco.' },
      penaltyPlus: { name: 'Penalità +1', desc: 'Il pony riceve 1 penalità finale in più.' }, penaltyMinus: { name: 'Penalità −1', desc: 'Il pony riceve 1 penalità finale in meno.' },
      missile: { name: 'Missile', desc: 'Scaraventa il pony molto indietro.' }, hitchhike: { name: 'Passaggio gratis', desc: 'Porta il pony molto più avanti.' },
    },
  },
  race: { ready: 'Pronti…', go: 'VIA!', tapItems: 'Tocca gli oggetti!', photoFinish: 'Fotofinish!' },
  result: { winner: 'Vincitore', loser: 'Ultimo', safe: 'Nessuna penalità', noPenalty: 'Nessuna penalità ✨', penalty: 'Penalità ×{n}!', complete: 'Gara terminata!', replay: 'Gioca ancora', setup: 'Impostazioni', rankTitle: 'Risultati' },
  items: { dash: 'Scatto!', banana: 'Scivolata!', penaltyPlus: 'Penalità +1', penaltyMinus: 'Penalità −1', swap: 'Scambio!', missile: 'Missile!', hitchhike: 'Passaggio gratis!', miss: 'Mancato…' },
  rotate: { title: 'Ruota il telefono', desc: 'Mettilo in orizzontale sul tavolo e giocate insieme' },
  install: { tap1: 'Vuoi lo schermo intero? Tocca', tap2: 'Condividi → “Aggiungi alla schermata Home”' },
  colors: { white: 'Neve', brown: 'Cacao', gray: 'Fumo', yellow: 'Sole' },
};
