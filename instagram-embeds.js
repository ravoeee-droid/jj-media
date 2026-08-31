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
    { type: 'reel', code: 'DbNajc2Rdo4', label: 'Reel 01' },
    { type: 'reel', code: 'Dbf1jZOMaQt', label: 'Reel 02' },
    { type: 'reel', code: 'DcF9GhGxls2', label: 'Reel 03' },
    { type: 'reel', code: 'DbsVHalgz3N', label: 'Reel 04' },
    { type: 'reel', code: 'DZ44gXtvAob', label: 'Reel 05' },
    { type: 'reel', code: 'DareM3sxe6n', label: 'Reel 06' }
  ];

  const feedPosts = [
    { type: 'p', code: 'DazuxLElEB4', label: 'Carousel 01' },
    { type: 'p', code: 'Db-17j9iMmK', label: 'Post 02' },
    { type: 'p', code: 'DY7TFemFB6s', label: 'Carousel 03' },
    { type: 'p', code: 'DYtmuYkEazt', label: 'Carousel 04' }
  ];

  const cleanUrl = post => `https://www.instagram.com/${post.type}/${post.code}/`;
  const embedUrl = post => `${cleanUrl(post)}embed/`;
  const frame = (post, mode = 'reel') => {
    const views = mode === 'reel' ? formatViews(reelViews[post.code]) : '';
    const viewBadge = views ? `<div class="ig-view-badge" aria-label="${views} Aufrufe"><span>Views</span><strong>${views}</strong></div>` : '';
    return `
    <article class="viral-post-card viral-post-card-live ${mode === 'post' ? 'viral-feed-card' : ''} reveal visible" data-live-instagram>
      <div class="viral-post-media viral-post-media-live ${mode === 'post' ? 'viral-feed-media' : ''}">
        <div class="ig-embed-shell ${mode === 'post' ? 'ig-feed-shell' : ''}">
          <div class="ig-loading" aria-hidden="true"><span></span><small>Instagram lädt</small></div>
          <iframe class="ig-live-embed" src="${embedUrl(post)}" title="Instagram ${post.label} von JJ-Media" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>
        <span class="viral-platform viral-platform-live">IG</span>
        ${viewBadge}
      </div>
      <div class="viral-post-body viral-post-body-live ${mode === 'post' ? 'viral-feed-body' : ''}">
        <span>${post.label} · Instagram</span>
        <h3>${mode === 'post' ? 'Original Post · direkt eingebettet' : 'Original Reel · direkt abspielbar'}</h3>
        <p>${mode === 'post' ? 'Echter Feed-Post bzw. Carousel – direkt im Originalformat auf der Website.' : 'Echtes Reel – Video, Account und Originalbeitrag bleiben direkt mit Instagram verbunden.'}</p>
        <a class="ig-original-link" href="${cleanUrl(post)}" target="_blank" rel="noopener noreferrer">Auf Instagram ansehen <span>↗</span></a>
      </div>
    </article>`;
  };

  rail.classList.add('viral-card-rail-live');
  rail.innerHTML = reels.map(post => frame(post, 'reel')).join('');

  const note = document.querySelector('.viral-live-note');
  if (note) {
    note.innerHTML = '<span class="viral-live-dot"></span><div><strong>6 echte Reels live eingebettet</strong><p>Die View-Zahlen werden separat als große KPI auf den Cards dargestellt, damit sie unabhängig vom Instagram-Embed sichtbar bleiben.</p></div>';

    const section = document.createElement('section');
    section.className = 'viral-feed-section reveal visible';
    section.innerHTML = `
      <div class="viral-feed-heading">
        <div><div class="eyebrow">Feed Design · Posts & Carousels</div><h2>Posts, die Marken<br><span class="serif">wiedererkennbar machen.</span></h2></div>
        <p>Nicht jeder starke Beitrag muss ein Reel sein. Hier zeigen wir echte Feed-Posts und Carousels – direkt eingebettet und im Original erlebbar.</p>
      </div>
      <div class="viral-feed-grid">${feedPosts.map(post => frame(post, 'post')).join('')}</div>
      <div class="viral-feed-proof"><span class="viral-live-dot"></span><strong>4 echte Feed-Posts & Carousels live eingebettet</strong></div>`;
    note.insertAdjacentElement('afterend', section);
  }

  const markLoaded = root => root.querySelectorAll('.ig-live-embed').forEach(frameEl => {
    frameEl.addEventListener('load', () => frameEl.closest('.ig-embed-shell')?.classList.add('is-loaded'));
  });
  markLoaded(document);

  if (!document.querySelector('link[data-instagram-embeds-css]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'instagram-embeds.css?v=20260831-3';
    css.dataset.instagramEmbedsCss = 'true';
    document.head.appendChild(css);
  }
})();
