(() => {
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const links = [
    {target:'virale-posts.html', label:'Virale Posts', before:'contact.html'},
    {target:'blog.html', label:'Insights', before:'contact.html'}
  ];

  const ensureNavLinks = () => {
    const nav = document.querySelector('.nav-links');
    if (!nav) return;
    links.forEach(item => {
      let link = [...nav.querySelectorAll('a')].find(a => (a.getAttribute('href') || '').includes(item.target));
      if (!link) {
        link = document.createElement('a');
        link.href = item.target;
        link.textContent = item.label;
        const before = [...nav.querySelectorAll('a')].find(a => (a.getAttribute('href') || '').includes(item.before));
        if (before) nav.insertBefore(link, before); else nav.appendChild(link);
      }
      if (page === item.target || page === item.target.replace('.html','')) link.classList.add('active');
    });
  };

  const ensureFooterLinks = () => {
    document.querySelectorAll('.footer-links').forEach(footer => {
      links.forEach(item => {
        if ([...footer.querySelectorAll('a')].some(a => (a.getAttribute('href') || '').includes(item.target))) return;
        const link = document.createElement('a');
        link.href = item.target;
        link.textContent = item.label;
        const contact = [...footer.querySelectorAll('a')].find(a => (a.getAttribute('href') || '').includes('contact.html'));
        if (contact) footer.insertBefore(link, contact); else footer.appendChild(link);
      });
    });
  };

  ensureNavLinks();
  ensureFooterLinks();
})();