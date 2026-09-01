(() => {
  const rail = document.querySelector('.viral-card-rail');
  if (!rail) return;

  const reelViews = window.JJ_MEDIA_REEL_VIEWS || {};
  const formatViews = value => {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'string') return value;
    return new Intl.NumberFormat('de-DE').format(value);
  };

  const reels = [
    { code:'DbNajc2Rdo4', label:'Reel 01', image:'assets/insta-1.webp', alt:'Social-Media-Reel aus einer JJ-Media Content-Produktion mit dokumentierter Reichweite', context:'Storytelling · Feed Stopper' },
    { code:'Dbf1jZOMaQt', label:'Reel 02', image:'assets/insta-2.webp', alt:'Instagram-Reel aus einer von JJ-Media betreuten Social-Media-Kampagne', context:'Reise-Content · Community' },
    { code:'DcF9GhGxls2', label:'Reel 03', image:'assets/insta-3.webp', alt:'Top-Performance-Reel von JJ-Media mit mehr als sechzigtausend dokumentierten Aufrufen', context:'Top Performer · Reichweite' },
    { code:'DbsVHalgz3N', label:'Reel 04', image:'assets/insta-4.webp', alt:'Social-Media-Content von JJ-Media mit starkem visuellen Einstieg', context:'Hook · Markenbild' },
    { code:'DZ44gXtvAob', label:'Reel 05', image:'assets/insta-5.webp', alt:'Von JJ-Media entwickelter Social-Media-Beitrag mit dokumentierten Reel-Aufrufen', context:'Content-System · Wiedererkennung' },
    { code:'DareM3sxe6n', label:'Reel 06', image:'assets/insta-6.webp', alt:'Social-Media-Reel aus dem JJ-Media Portfolio mit dokumentierter organischer Performance', context:'Organic · Storytelling' }
  ];

  rail.className = 'jj-reel-proof-grid';
  rail.innerHTML = reels.map((post,index) => `
    <article class="jj-reel-proof-card reveal visible">
      <div class="jj-reel-proof-kpi">
        <div><span>AUFRUFE</span><strong>${formatViews(reelViews[post.code])}</strong></div>
        <small><i aria-hidden="true"></i> dokumentiert</small>
      </div>
      <figure class="jj-reel-proof-media">
        <img src="${post.image}" alt="${post.alt}" loading="${index < 3 ? 'eager' : 'lazy'}" decoding="async">
        <figcaption><span>Instagram Reel</span><strong>${post.context}</strong></figcaption>
      </figure>
      <div class="jj-reel-proof-footer"><span>${post.label}</span><a href="work.html">Case Studies ansehen <span aria-hidden="true">↗</span></a></div>
    </article>`).join('');

  const headingCopy = document.querySelector('.viral-showcase .viral-heading p');
  if (headingCopy) headingCopy.textContent = 'Sechs ausgewählte Reels mit dokumentierten Aufrufzahlen. Idee, Look und Performance stehen direkt nebeneinander – ohne dass der Proof hinter einer Plattformoberfläche verschwindet.';

  const note = document.querySelector('.viral-live-note');
  if (note) {
    note.className = 'jj-view-hero reveal visible';
    note.innerHTML = `
      <div class="jj-view-hero-copy">
        <span>TOP PERFORMANCE DER AUSWAHL</span>
        <strong>60,7K</strong>
        <em>AUFRUFE</em>
      </div>
      <p>Ein einzelnes Reel zeigt, was ein starker Einstieg, ein klares Thema und konsequente Distribution gemeinsam auslösen können. Entscheidend bleibt das System hinter dem einzelnen Peak.</p>`;
  }

  document.querySelector('.jj-feed-section')?.remove();

  if (!document.querySelector('link[data-instagram-embeds-css]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'instagram-embeds.css?v=20260901-10';
    css.dataset.instagramEmbedsCss = 'true';
    document.head.appendChild(css);
  }
})();
