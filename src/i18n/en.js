export default {
  appTitle: 'PonyRun',
  tagline: 'Gather round one phone — grab items and race to the finish',
  loading: 'Loading…',
  langName: 'EN',

  start: {
    ponies: 'How many ponies?',
    names: 'Name / colour (optional)',
    play: 'START',
    hint: 'Tap items flying by to cause chaos · rarer = faster = harder = wilder',
    tapName: 'tap to rename',
  },

  settings: {
    track: 'Track length',
    items: 'Item density',
    off: 'Off',
  },

  guide: {
    open: 'How to play',
    title: 'How to play',
    rulesTitle: 'Race rules',
    itemsTitle: 'Items',
    back: 'Back to setup',
    penaltyLegend: 'One 🤡 means one penalty. +1 adds a penalty; −1 removes one.',
    rules: {
      setup: 'Pick 2–4 ponies, lay the phone flat in landscape, and gather around.',
      catch: 'Tap items as they fly by; each item affects the pony in its lane.',
      finish: 'The first pony across wins with no penalty. Every other pony gets at least 1 penalty.',
    },
    items: {
      dash: { name: 'Dash', desc: 'The pony sprints forward with a short speed boost.' },
      banana: { name: 'Banana peel', desc: 'The pony slips, pauses, and falls back a short distance.' },
      penaltyPlus: { name: 'Penalty +1', desc: 'The pony gets 1 more final penalty.' },
      penaltyMinus: { name: 'Penalty −1', desc: 'The pony gets 1 fewer final penalty.' },
      missile: { name: 'Missile', desc: 'Blasts the pony back a long distance.' },
      hitchhike: { name: 'Free ride', desc: 'Drives the pony forward a long distance.' },
    },
  },

  race: {
    ready: 'Ready…',
    go: 'GO!',
    tapItems: 'Tap items!',
    photoFinish: 'Photo finish!',
  },

  result: {
    winner: 'Winner',
    loser: 'Loser',
    safe: 'No penalty',
    noPenalty: 'No penalty ✨',
    penalty: 'Penalty ×{n}!',
    complete: 'Race complete!',
    replay: 'Play again',
    setup: 'Setup',
    rankTitle: 'Results',
  },

  items: {
    dash: 'Dash!',
    banana: 'Slip!',
    penaltyPlus: 'Penalty +1',
    penaltyMinus: 'Penalty −1',
    swap: 'Swap!',
    missile: 'Missile!',
    hitchhike: 'Free ride!',
    miss: 'Missed…',
  },

  rotate: {
    title: 'Please rotate your phone',
    desc: 'Landscape, flat on the table, play together',
  },

  install: {
    tap1: 'Want fullscreen? Tap',
    tap2: 'Share → "Add to Home Screen"',
  },

  colors: {
    white: 'Snowy', brown: 'Cocoa', gray: 'Smoky', yellow: 'Sunny',
  },
};
