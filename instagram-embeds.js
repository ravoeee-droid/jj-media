(() => {
  const rail = document.querySelector('.viral-card-rail');
  if (!rail) return;

  const reelViews = window.JJ_MEDIA_REEL_VIEWS || {};
  const formatViews = value => {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'string') return value;
    return new Intl.NumberFormat('de-DE').format(value);
  };

  const reels = [
    { code: 'DbNajc2Rdo4', label: 'Reel 01' },
    { code: 'Dbf1jZOMaQt', label: 'Reel 02' },
    { code: 'DcF9GhGxls2', label: 'Reel 03' },
    { code: 'DbsVHalgz3N', label: 'Reel 04' },
    { code: 'DZ44gXtvAob', label: 'Reel 05' },
    { code: 'DareM3sxe6n', label: 'Reel 06' }
  ];

  const feedPosts = [
    { code: 'DazuxLElEB4', label: 'Carousel 01' },
    { code: 'Db-17j9iMmK', label: 'Post 02' },
    { code: 'DY7TFemFB6s', label: 'Carousel 03' },
    { code: 'DYtmuYkEazt', label: 'Carousel 04' }
  ];

  const cleanUrl = (type, code) => `https://www.instagram.com/${type}/${code}/`;
  const embedUrl = (type, code) => `${cleanUrl(type, code)}embed/`;

  const reelCard = post => {
    const views = formatViews(reelViews[post.code]);
    return `
      <article class="jj-reel-live-card reveal visible">
        <div class="jj-reel-live-kpi">
          <div class="jj-kpi-copy"><span>AUFRUFE</span><strong>${views || '—'}</strong></div>
          <div class="jj-kpi-proof"><span class="jj-proof-dot"></span><small>echte Reel-Views</small></div>
        </div>
        <div class="jj-reel-live-frame">
          <div class="jj-reel-live-loading"><span></span><small>Reel wird geladen</small></div>
          <iframe data-instagram-src="${embedUrl('reel', post.code)}" title="${post.label} von JJ-Media" loading="lazy" scrolling="no" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>
        <div class="jj-reel-live-footer">
          <span>${post.label}</span>
          <a href="${cleanUrl('reel', post.code)}" target="_blank" rel="noopener noreferrer">Original ansehen ↗</a>
        </div>
      </article>`;
  };

  const feedCard = post => `
    <article class="jj-feed-live-card reveal visible">
      <div class="jj-feed-live-top"><span>${post.label}</span><strong>Instagram</strong></div>
      <div class="jj-feed-live-frame">
        <div class="jj-feed-live-loading"><span></span><small>Post wird geladen</small></div>
        <iframe data-instagram-src="${embedUrl('p', post.code)}" title="${post.label} von JJ-Media" loading="lazy" scrolling="no" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
      </div>
      <a class="jj-feed-live-link" href="${cleanUrl('p', post.code)}" target="_blank" rel="noopener noreferrer">Original auf Instagram ansehen <span>↗</span></a>
    </article>`;

  rail.className = 'jj-reel-live-grid';
  rail.innerHTML = reels.map(reelCard).join('');

  let hydrateSequence = 0;
  const hydrate = frame => {
    if (frame.src || !frame.dataset.instagramSrc) return;
    const delay = Math.min(hydrateSequence++, 6) * 100;
    setTimeout(() => {
      if (!frame.isConnected || frame.src) return;
      frame.src = frame.dataset.instagramSrc;
    }, delay);
  };

  const observeFrames = root => {
    const frames = [...root.querySelectorAll('iframe[data-instagram-src]')];
    frames.forEach(frame => frame.addEventListener('load', () => frame.parentElement?.classList.add('is-loaded'), { once: true }));
    if (!('IntersectionObserver' in window)) {
      frames.forEach(hydrate);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        hydrate(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '220px 0px', threshold: 0.01 });
    frames.forEach(frame => observer.observe(frame));
  };
  observeFrames(rail);

  const note = document.querySelector('.viral-live-note');
  if (note) {
    note.className = 'jj-view-hero reveal visible';
    note.innerHTML = `
      <div class="jj-view-hero-copy">
        <span>PERFORMANCE, DIE MAN SOFORT VERSTEHT</span>
        <strong>60,7K</strong>
        <em>AUFRUFE</em>
      </div>
      <p>Unser stärkstes Reel in dieser Auswahl. Die Reichweite steht bewusst im Vordergrund – direkt neben dem echten Content.</p>`;

    document.querySelector('.jj-feed-section')?.remove();
    const section = document.createElement('section');
    section.className = 'jj-feed-section reveal visible';
    section.innerHTML = `
      <div class="jj-feed-heading">
        <div><div class="eyebrow">Posts & Carousels</div><h2>Mehr als Reels.<br><span class="serif">Content, der Marken baut.</span></h2></div>
        <p>Auch klassische Posts und Carousels gehören zum System. Hier sind die echten Beiträge direkt eingebettet – kompakt, klar und ohne die Seite zu erschlagen.</p>
      </div>
      <div class="jj-feed-live-grid">${feedPosts.map(feedCard).join('')}</div>`;
    note.insertAdjacentElement('afterend', section);
    observeFrames(section);
  }

  if (!document.querySelector('link[data-instagram-embeds-css]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'instagram-embeds.css?v=20260831-8';
    css.dataset.instagramEmbedsCss = 'true';
    document.head.appendChild(css);
  }
})();
