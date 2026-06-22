export default {
  appTitle: 'PonyRun', tagline: 'Reúnanse alrededor de un móvil, atrapen objetos y corran a la meta', loading: 'Cargando…', langName: 'ES',
  start: { ponies: '¿Cuántos ponis?', names: 'Nombre / color (opcional)', play: 'EMPEZAR', hint: 'Toca los objetos que pasan para sembrar el caos · más raro = más rápido = más difícil = más salvaje', tapName: 'toca para cambiar el nombre' },
  settings: { track: 'Longitud de pista', items: 'Cantidad de objetos', off: 'No' },
  guide: {
    open: 'Cómo jugar', title: 'Cómo jugar', rulesTitle: 'Reglas de la carrera', itemsTitle: 'Objetos', back: 'Volver a configurar',
    penaltyLegend: 'Un 🤡 equivale a una penalización. +1 añade una y −1 quita una.',
    rules: { setup: 'Elijan 2–4 ponis, pongan el móvil en horizontal sobre la mesa y reúnanse.', catch: 'Toquen los objetos cuando pasen; cada uno afecta al poni de su carril.', finish: 'El primer poni en llegar gana sin penalización. Los demás reciben al menos 1.' },
    items: {
      dash: { name: 'Turbo', desc: 'El poni acelera hacia delante durante un instante.' }, banana: { name: 'Cáscara de plátano', desc: 'El poni resbala, se detiene y retrocede un poco.' },
      penaltyPlus: { name: 'Penalización +1', desc: 'El poni recibe 1 penalización final más.' }, penaltyMinus: { name: 'Penalización −1', desc: 'El poni recibe 1 penalización final menos.' },
      missile: { name: 'Misil', desc: 'Lanza al poni muy hacia atrás.' }, hitchhike: { name: 'Viaje gratis', desc: 'Lleva al poni un buen trecho hacia delante.' },
    },
  },
  race: { ready: 'Preparados…', go: '¡YA!', tapItems: '¡Toca los objetos!', photoFinish: '¡Final de foto!' },
  result: { winner: 'Ganador', loser: 'Último', safe: 'Sin penalización', noPenalty: 'Sin penalización ✨', penalty: '¡Penalización ×{n}!', complete: '¡Carrera terminada!', replay: 'Jugar otra vez', setup: 'Configurar', rankTitle: 'Resultados' },
  items: { dash: '¡Turbo!', banana: '¡Resbalón!', penaltyPlus: 'Penalización +1', penaltyMinus: 'Penalización −1', swap: '¡Cambio!', missile: '¡Misil!', hitchhike: '¡Viaje gratis!', miss: 'Fallaste…' },
  rotate: { title: 'Gira el móvil', desc: 'Ponlo en horizontal sobre la mesa y jueguen juntos' },
  install: { tap1: '¿Quieres pantalla completa? Toca', tap2: 'Compartir → «Añadir a pantalla de inicio»' },
  colors: { white: 'Nieve', brown: 'Cacao', gray: 'Humo', yellow: 'Sol' },
};
