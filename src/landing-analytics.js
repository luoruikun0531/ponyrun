import { ANALYTICS_EVENTS, trackEvent } from './logic/analytics.js';

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest('a[href^="/play/"], a[href="/play"]');
  if (!link) return;

  void trackEvent(ANALYTICS_EVENTS.homePlayClick, {
    href: link.getAttribute('href'),
    label: link.textContent.trim().slice(0, 80),
  });
});
