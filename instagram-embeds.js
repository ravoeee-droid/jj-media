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
    { code: 'DbNajc2Rdo4', label: 'Reel 01', thumb: 'assets/insta-1.webp' },
    { code: 'Dbf1jZOMaQt', label: 'Reel 02', thumb: 'assets/insta-2.webp' },
    { code: 'DcF9GhGxls2', label: 'Reel 03', thumb: 'assets/insta-3.webp' },
    { code: 'DbsVHalgz3N', label: 'Reel 04', thumb: 'assets/insta-4.webp' },
    { code: 'DZ44gXtvAob', label: 'Reel 05', thumb: 'assets/insta-5.webp' },
    { code: 'DareM3sxe6n', label: 'Reel 06', thumb: 'assets/insta-6.webp' }
  ];

  const feedPosts = [
    { code: 'DazuxLElEB4', label: 'Carousel 01', thumb: 'assets/insta-1.webp' },
    { code: 'Db-17j9iMmK', label: 'Post 02', thumb: 'assets/insta-2.webp' },
    { code: 'DY7TFemFB6s', label: 'Carousel 03', thumb: 'assets/insta-3.webp' },
    { code: 'DYtmuYkEazt', label: 'Carousel 04', thumb: 'assets/insta-4.webp' }
  ];

  const cleanUrl = (type, code) => `https://www.instagram.com/${type}/${code}/`;
  const embedUrl = (type, code) => `${cleanUrl(type, code)}embed/`;

  const reelCard = post => {
    const views = formatViews(reelViews[post.code]);
    return `
      <button class="jj-reel-card reveal visible" type="button" data-instagram-open data-type="reel" data-code="${post.code}" aria-label="${post.label} ansehen">
        <div class="jj-reel-visual">
          <img src="${post.thumb}" alt="${post.label} von JJ-Media" loading="lazy">
          <div class="jj-reel-shade"></div>
          <div class="jj-reel-topline"><span>INSTAGRAM REEL</span><span>↗</span></div>
          <div class="jj-reel-proof ${views ? '' : 'is-empty'}">
            <small>VIEWS</small>
            <strong>${views || 'VIEW-ZAHL'}</strong>
          </div>
          <span class="jj-reel-play">▶</span>
        </div>
        <div class="jj-reel-meta">
          <span>${post.label}</span>
          <strong>Original ansehen</strong>
        </div>
      </button>`;
  };

  const feedCard = post => `
    <button class="jj-feed-card reveal visible" type="button" data-instagram-open data-type="p" data-code="${post.code}" aria-label="${post.label} ansehen">
      <div class="jj-feed-visual"><img src="${post.thumb}" alt="${post.label} von JJ-Media" loading="lazy"><span>IG</span></div>
      <div class="jj-feed-meta"><small>${post.label}</small><strong>Post ansehen ↗</strong></div>
    </button>`;

  rail.className = 'jj-reel-grid';
  rail.innerHTML = reels.map(reelCard).join('');

  const note = document.querySelector('.viral-live-note');
  if (note) {
    note.className = 'jj-view-hero reveal visible';
    note.innerHTML = `
      <div class="jj-view-hero-copy">
        <span>VERIFIZIERTER SOCIAL PROOF</span>
        <strong>29,5K</strong>
        <em>VIEWS</em>
      </div>
      <p>Ein einzelnes Reel aus einem belegten Kunden-Case. Die View-Zahl steht bewusst im Vordergrund — nicht versteckt im Instagram-Interface.</p>`;

    const section = document.createElement('section');
    section.className = 'jj-feed-section reveal visible';
    section.innerHTML = `
      <div class="jj-feed-heading">
        <div><div class="eyebrow">Posts & Carousels</div><h2>Feed Content,<br><span class="serif">der hängen bleibt.</span></h2></div>
        <p>Die Beiträge bleiben Teil des Portfolios, aber deutlich kompakter. Das echte Instagram-Original öffnet sich erst beim Klick.</p>
      </div>
      <div class="jj-feed-grid">${feedPosts.map(feedCard).join('')}</div>`;
    note.insertAdjacentElement('afterend', section);
  }

  const modal = document.createElement('div');
  modal.className = 'jj-instagram-modal';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div class="jj-instagram-backdrop" data-instagram-close></div>
    <div class="jj-instagram-dialog" role="dialog" aria-modal="true" aria-label="Instagram Beitrag">
      <button class="jj-instagram-close" type="button" data-instagram-close aria-label="Schließen">×</button>
      <div class="jj-instagram-frame-wrap"><div class="jj-instagram-loading">Instagram lädt …</div><iframe title="Instagram Beitrag" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>
      <a class="jj-instagram-original" target="_blank" rel="noopener noreferrer">Original auf Instagram öffnen ↗</a>
    </div>`;
  document.body.appendChild(modal);

  const frame = modal.querySelector('iframe');
  const original = modal.querySelector('.jj-instagram-original');
  const openModal = (type, code) => {
    const url = cleanUrl(type, code);
    frame.src = embedUrl(type, code);
    original.href = url;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('jj-modal-open');
  };
  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    frame.src = 'about:blank';
    document.body.classList.remove('jj-modal-open');
  };

  document.addEventListener('click', event => {
    const opener = event.target.closest('[data-instagram-open]');
    if (opener) openModal(opener.dataset.type, opener.dataset.code);
    if (event.target.closest('[data-instagram-close]')) closeModal();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });

  if (!document.querySelector('link[data-instagram-embeds-css]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'instagram-embeds.css?v=20260831-4';
    css.dataset.instagramEmbedsCss = 'true';
    document.head.appendChild(css);
  }
})();
