(() => {
  const footer = document.querySelector('footer');
  if (footer && !footer.querySelector('.footer-brand')) {
    const brand = document.createElement('a');
    brand.className = 'footer-brand';
    brand.href = 'index.html';
    brand.setAttribute('aria-label', 'JJ Media – zur Startseite');
    brand.innerHTML = '<span class="footer-brand-crop"><img src="assets/brand/jj-media-uploaded.png" alt="JJ Media Social Media Management" loading="lazy"><img class="footer-brand-type" src="assets/brand/jj-media-uploaded.png" alt="" aria-hidden="true" loading="lazy"></span>';
    footer.querySelector('.container')?.prepend(brand);
    const contact = document.createElement('div');
    contact.className = 'footer-general-contact';
    contact.innerHTML = '<a class="btn" href="mailto:service@jj-media.info">E-Mail schreiben</a><a class="btn" href="contact.html">Allgemeine Anfrage</a>';
    footer.querySelector('.footer-main')?.after(contact);
  }
  const isShowcase = document.querySelector('.hero-premium') || /\/services(?:\.html)?\/?$/.test(location.pathname);
  if (footer && isShowcase && !document.querySelector('.post-flow')) {
    const examples = [
      ['assets/cases/oezhan-after.jpg', 'Content-Beispiel aus dem Immobilienbereich'],
      ['assets/travel-gallery-final/01-schildkroeten.png', 'Beispiel-Post: Schildkröten auf Reisen'],
      ['assets/cases/reisen-erleben-feed.jpg', 'Feed-Beispiel für Reisen & Erleben'],
      ['assets/travel-gallery-final/04-flamingos.png', 'Beispiel-Post: Flamingos'],
      ['assets/cases/village-after.jpg', 'Social-Media-Feed aus einem Kundenprojekt'],
      ['assets/travel-gallery-final/06-kein-filter.png', 'Beispiel-Post aus dem Reiseportfolio']
    ];
    const section = document.createElement('section');
    section.className = 'post-flow';
    section.id = 'beispiel-posts';
    section.setAttribute('aria-label', 'Beispiel-Posts aus dem Portfolio');
    const cards = examples.map(([src, alt]) => `<a href="work.html"><img src="${src}" alt="${alt}" loading="eager" decoding="async" width="320" height="400"></a>`).join('');
    section.innerHTML = `<div class="post-flow-heading"><span class="eyebrow">Einblicke in die Gestaltung</span><button type="button" class="post-flow-toggle" aria-pressed="false">Bildlauf pausieren</button></div><div class="post-flow-window"><div class="post-flow-track"><div class="post-flow-group">${cards}</div><div class="post-flow-group" aria-hidden="true">${cards.replaceAll('<a href=', '<a tabindex="-1" href=').replace(/alt="[^"]*"/g, 'alt=""')}</div></div></div>`;
    footer.before(section);
    const toggle = section.querySelector('button');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let paused = reduced;
    const sync = () => {
      section.classList.toggle('is-paused', paused);
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.textContent = paused ? 'Bildlauf starten' : 'Bildlauf pausieren';
    };
    sync();
    toggle.addEventListener('click', () => { paused = !paused; sync(); });
  }
  document.querySelectorAll('.service-detail').forEach((section, i) => {
    const sources = ['assets/insta-1.webp', 'assets/cases/oezhan-after.jpg', 'assets/insta-5.webp'];
    if (!sources[i]) return;
    const img = document.createElement('img');
    img.className = 'service-detail-preview';
    img.src = sources[i];
    img.alt = ['Strategie und gemeinsame Planung', 'Einblick in einen gestalteten Kunden-Feed', 'Content für Social-Media-Kampagnen'][i];
    img.loading = 'lazy';
    section.querySelector('.sticky')?.append(img);
  });
  const tabs = [...document.querySelectorAll('.service-tab')];
  const panel = document.querySelector('.service-panel');
  if (!tabs.length || !panel) return;
  const previews = [
    ['assets/insta-1.webp', 'Strategie und gemeinsame Planung'],
    ['assets/cases/oezhan-after.jpg', 'Content Creation: Beispiel eines Kunden-Feeds'],
    ['assets/insta-5.webp', 'Gestaltung für Social-Media-Kampagnen']
  ];
  const preview = document.createElement('div');
  preview.className = 'service-visual';
  preview.innerHTML = previews.map(([src, alt], i) => `<img src="${src}" alt="${alt}" loading="lazy" class="${i === 0 ? 'is-active' : ''}">`).join('');
  panel.append(preview);
  panel.closest('.services').classList.add('services-visual');
  tabs.forEach((tab, index) => {
    tab.setAttribute('aria-pressed', String(index === 0));
    const select = () => {
      tabs.forEach((item, i) => { item.classList.toggle('active', i === index); item.setAttribute('aria-pressed', String(i === index)); });
      preview.querySelectorAll('img').forEach((img, i) => img.classList.toggle('is-active', i === index));
      document.querySelector('[data-service-title]').textContent = ['Strategie & Analyse', 'Content Creation', 'Social Ads'][index];
      document.querySelector('[data-service-text]').textContent = [
        'Eine klare Strategie für deine Marke: Zielgruppen verstehen, Inhalte planen und anhand echter Ergebnisse optimieren.',
        'Designs, Reels und Texte mit deiner Markenstimme – von der Idee bis zum fertigen Content.',
        'Kreative Werbeanzeigen und gezielte Kampagnen, die die passenden Menschen für dein Angebot erreichen.'
      ][index];
    };
    tab.addEventListener('mouseenter', select);
    tab.addEventListener('focus', select);
    tab.addEventListener('click', select);
  });
  tabs[0].dispatchEvent(new Event('mouseenter'));
})();
