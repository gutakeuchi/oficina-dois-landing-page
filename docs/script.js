const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('open', !open);
});

nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

const progress = document.createElement('div');
progress.className = 'scroll-progress';
progress.setAttribute('aria-hidden', 'true');
document.body.prepend(progress);

const updateScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
};
addEventListener('scroll', updateScroll, { passive: true });
updateScroll();

const revealTargets = document.querySelectorAll('.reveal, .section-index, .section h2, .steps article, .faq details, .instagram');
revealTargets.forEach((element, index) => {
  element.classList.add('motion-reveal');
  element.style.setProperty('--reveal-delay', `${(index % 4) * 70}ms`);
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -30px' });
revealTargets.forEach(element => observer.observe(element));

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...nav.querySelectorAll('a')];
const activeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55%' });
sections.forEach(section => activeObserver.observe(section));

if (!reduceMotion && matchMedia('(pointer: fine)').matches) {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  glow.setAttribute('aria-hidden', 'true');
  document.body.append(glow);
  addEventListener('pointermove', event => {
    glow.style.setProperty('--glow-x', `${event.clientX}px`);
    glow.style.setProperty('--glow-y', `${event.clientY}px`);
  }, { passive: true });

  document.querySelectorAll('.card, .build-card, .quote-form, .hero-art').forEach(element => {
    element.classList.add('tilt-surface');
    element.addEventListener('pointermove', event => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      element.style.setProperty('--tilt-x', `${(-y * 3.5).toFixed(2)}deg`);
      element.style.setProperty('--tilt-y', `${(x * 4.5).toFixed(2)}deg`);
      element.style.setProperty('--spot-x', `${((x + 0.5) * 100).toFixed(1)}%`);
      element.style.setProperty('--spot-y', `${((y + 0.5) * 100).toFixed(1)}%`);
    });
    element.addEventListener('pointerleave', () => {
      element.style.setProperty('--tilt-x', '0deg');
      element.style.setProperty('--tilt-y', '0deg');
    });
  });
}

document.querySelector('#quote-form').addEventListener('submit', async event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const message = `Olá, Oficina Dois! Meu nome é ${data.get('nome')}.\n\nPreciso de: ${data.get('servico')}\nUso principal: ${data.get('uso')}\nWhatsApp: ${data.get('whatsapp') || 'prefiro falar pelo Direct'}\nDetalhes: ${data.get('detalhes') || 'podemos conversar sobre a configuração.'}`;
  const status = event.currentTarget.querySelector('.form-status');
  try {
    await navigator.clipboard.writeText(message);
    status.textContent = 'Pedido copiado! Abrindo o Instagram — é só colar no Direct.';
  } catch {
    status.textContent = 'Abrindo o Instagram para você enviar seu pedido pelo Direct.';
  }
  setTimeout(() => window.open('https://www.instagram.com/oficinadois.pc/', '_blank', 'noopener'), 350);
});
