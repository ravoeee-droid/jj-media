(() => {
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const target = 'virale-posts.html';

  const ensureNavLink = () => {
    const nav = document.querySelector('.nav-links');
    if (!nav) return;
    let link = [...nav.querySelectorAll('a')].find(a => (a.getAttribute('href') || '').includes(target));
    if (!link) {
      link = document.createElement('a');
      link.href = target;
      link.textContent = 'Virale Posts';
      const contact = [...nav.querySelectorAll('a')].find(a => (a.getAttribute('href') || '').includes('contact.html'));
      if (contact) nav.insertBefore(link, contact); else nav.appendChild(link);
    }
    if (page === target || page === 'virale-posts') link.classList.add('active');
  };

  const ensureFooterLink = () => {
    document.querySelectorAll('.footer-links').forEach(footer => {
      if ([...footer.querySelectorAll('a')].some(a => (a.getAttribute('href') || '').includes(target))) return;
      const link = document.createElement('a');
      link.href = target;
      link.textContent = 'Virale Posts';
      const projects = [...footer.querySelectorAll('a')].find(a => (a.getAttribute('href') || '').includes('work.html'));
      if (projects?.nextSibling) footer.insertBefore(link, projects.nextSibling); else footer.appendChild(link);
    });
  };

  ensureNavLink();
  ensureFooterLink();
})();
