(() => {
  const doc = document;
  if (!doc.querySelector('link[data-blog-final]')) {
    const style = doc.createElement('link');
    style.rel = 'stylesheet';
    style.dataset.blogFinal = 'true';
    style.href = location.pathname.includes('/blog/') ? '../blog-final.css?v=20260901-1' : 'blog-final.css?v=20260901-1';
    doc.head.appendChild(style);
  }

  const cards = [...doc.querySelectorAll('[data-blog-card]')];
  const filters = [...doc.querySelectorAll('[data-blog-filter]')];
  const search = doc.querySelector('[data-blog-search]');
  const empty = doc.querySelector('[data-blog-empty]');
  let active = 'all';

  const normalise = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const apply = () => {
    const query = normalise(search?.value.trim());
    let visible = 0;
    cards.forEach(card => {
      const types = normalise(card.dataset.type).split(/\s+/);
      const haystack = normalise(card.textContent + ' ' + (card.dataset.keywords || ''));
      const showType = active === 'all' || types.includes(active);
      const showSearch = !query || haystack.includes(query);
      const show = showType && showSearch;
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (empty) empty.style.display = visible ? 'none' : 'block';
  };

  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(item => item.classList.toggle('active', item === button));
    active = button.dataset.blogFilter || 'all';
    apply();
  }));
  search?.addEventListener('input', apply);

  const progress = doc.querySelector('[data-reading-progress]');
  if (progress) {
    const updateProgress = () => {
      const root = doc.documentElement;
      const max = Math.max(1, root.scrollHeight - innerHeight);
      progress.style.width = `${Math.min(100, Math.max(0, scrollY / max * 100))}%`;
    };
    addEventListener('scroll', updateProgress, {passive:true});
    updateProgress();
  }

  doc.querySelectorAll('[data-copy-link]').forEach(button => button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      const old = button.textContent;
      button.textContent = 'Link kopiert ✓';
      setTimeout(() => button.textContent = old, 1800);
    } catch (_) {
      prompt('Link kopieren:', location.href);
    }
  }));
})();