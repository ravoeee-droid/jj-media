(() => {
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const navLinks = [
    {target:'services.html#ugc', label:'UGC', before:'blog.html'},
    {target:'blog.html', label:'Insights', before:'contact.html'}
  ];
  const footerLinks = [
    {target:'services.html#ugc', label:'UGC', before:'contact.html'},
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
  const contentSections = document.querySelectorAll('#ugc, #ki-content');
  if (contentSections.length && 'IntersectionObserver' in window) {
    const visible = new Set();
    new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
      document.body.classList.toggle('ugc-focus', visible.size > 0);
    }, {threshold: 0.05}).observe(contentSections[0]);
    if (contentSections[1]) new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
      document.body.classList.toggle('ugc-focus', visible.size > 0);
    }, {threshold: 0.05}).observe(contentSections[1]);
  }
})();
