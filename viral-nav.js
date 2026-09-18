(() => {
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const navLinks = [
    {target:'blog.html', label:'Insights', before:'contact.html'}
  ];
  const footerLinks = [
    {target:'virale-posts.html', label:'Virale Posts', before:'contact.html'},
    {target:'blog.html', label:'Insights', before:'contact.html'}
  ];

  const ensureLinks = (root, links) => {
    if (!root) return;
    links.forEach(item => {
      let link = [...root.querySelectorAll('a')].find(a => (a.getAttribute('href') || '').includes(item.target));
      if (!link) {
        link = document.createElement('a');
        link.href = item.target;
        link.textContent = item.label;
        const before = [...root.querySelectorAll('a')].find(a => (a.getAttribute('href') || '').includes(item.before));
        if (before) root.insertBefore(link, before); else root.appendChild(link);
      }
      if (page === item.target || page === item.target.replace('.html','')) link.classList.add('active');
    });
  };

  const ensureNavLinks = () => ensureLinks(document.querySelector('.nav-links'), navLinks);
  const ensureFooterLinks = () => document.querySelectorAll('.footer-links').forEach(footer => ensureLinks(footer, footerLinks));

  ensureNavLinks();
  ensureFooterLinks();
})();
