(() => {
  const rail = document.querySelector('.viral-card-rail');
  if (!rail) return;

  const posts = [
    { type: 'reel', code: 'DbNajc2Rdo4', label: 'Reel 01', title: 'Original Reel · direkt abspielbar' },
    { type: 'reel', code: 'Dbf1jZOMaQt', label: 'Reel 02', title: 'Original Reel · direkt abspielbar' },
    { type: 'reel', code: 'DcF9GhGxls2', label: 'Reel 03', title: 'Original Reel · direkt abspielbar' },
    { type: 'reel', code: 'DbsVHalgz3N', label: 'Reel 04', title: 'Original Reel · direkt abspielbar' },
    { type: 'p', code: 'DazuxLElEB4', label: 'Carousel', title: 'Original Beitrag · direkt eingebettet' },
    { type: 'reel', code: 'DZ44gXtvAob', label: 'Reel 05', title: 'Original Reel · direkt abspielbar' },
    { type: 'reel', code: 'DareM3sxe6n', label: 'Reel 06', title: 'Original Reel · direkt abspielbar' }
  ];

  const cleanUrl = post => `https://www.instagram.com/${post.type}/${post.code}/`;
  const embedUrl = post => `${cleanUrl(post)}embed/`;

  rail.classList.add('viral-card-rail-live');
  rail.innerHTML = posts.map((post, index) => `
    <article class="viral-post-card viral-post-card-live reveal visible" data-live-instagram>
      <div class="viral-post-media viral-post-media-live">
        <div class="ig-embed-shell">
          <div class="ig-loading" aria-hidden="true"><span></span><small>Instagram lädt</small></div>
          <iframe
            class="ig-live-embed"
            src="${embedUrl(post)}"
            title="Instagram ${post.label} von JJ-Media"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>
        </div>
        <span class="viral-platform viral-platform-live">IG</span>
      </div>
      <div class="viral-post-body viral-post-body-live">
        <span>${post.label} · Instagram</span>
        <h3>${post.title}</h3>
        <p>Echter Social-Media-Beitrag – inklusive Originalvideo bzw. Carousel, Account und Caption.</p>
        <a class="ig-original-link" href="${cleanUrl(post)}" target="_blank" rel="noopener noreferrer">Auf Instagram ansehen <span>↗</span></a>
      </div>
    </article>
  `).join('');

  rail.querySelectorAll('.ig-live-embed').forEach(frame => {
    frame.addEventListener('load', () => frame.closest('.ig-embed-shell')?.classList.add('is-loaded'));
  });

  const note = document.querySelector('.viral-live-note');
  if (note) {
    note.innerHTML = '<span class="viral-live-dot"></span><div><strong>7 echte Instagram-Beiträge live eingebettet</strong><p>Die Reels und der Carousel-Post werden direkt von Instagram geladen. Damit bleiben Video, Account und Originalbeitrag authentisch verknüpft.</p></div>';
  }

  if (!document.querySelector('link[data-instagram-embeds-css]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'instagram-embeds.css?v=20260831-1';
    css.dataset.instagramEmbedsCss = 'true';
    document.head.appendChild(css);
  }
})();
