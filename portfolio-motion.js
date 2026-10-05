(() => {
  const footer = document.querySelector('footer');
  if (footer && !footer.querySelector('.footer-brand')) {
    const brand = document.createElement('a');
    brand.className = 'footer-brand';
    brand.href = 'index.html';
    brand.setAttribute('aria-label', 'JJ Media – Social Media Marketing – zur Startseite');
    brand.innerHTML = '<span class="footer-brand-crop"><img src="assets/brand/jj-media-uploaded.png" alt="JJ Media – Social Media Marketing" loading="lazy"><img class="footer-brand-type" src="assets/brand/jj-media-uploaded.png" alt="" aria-hidden="true" loading="lazy"></span>';
    footer.querySelector('.container')?.prepend(brand);
    const contact = document.createElement('div');
    contact.className = 'footer-general-contact';
    contact.innerHTML = '<a class="btn" href="mailto:service@jj-media.info">E-Mail schreiben</a><a class="btn" href="contact.html">Allgemeine Anfrage</a>';
    footer.querySelector('.footer-main')?.after(contact);
  }
  const isShowcase = document.querySelector('.hero-premium') || /\/services(?:\.html)?\/?$/.test(location.pathname);
  if (footer && isShowcase && !document.querySelector('.post-flow')) {
    const examples = [
      ['assets/portfolio/legacy/design-1.webp', 'Kissling · Digitale Lieferkette', 'content-design.html'],
      ['assets/portfolio/legacy/design-2.webp', 'Kissling · Daten als Gold der Zukunft', 'content-design.html'],
      ['assets/portfolio/legacy/design-3.webp', 'Kissling · Maschinen und Menschen', 'content-design.html'],
      ['assets/portfolio/exports/set-2-01.webp', 'Annika Fischer · The Work', 'work.html#arbeitsproben'],
      ['assets/portfolio/exports/set-2-04.webp', 'Annika Fischer · Persönliche Markenarbeit', 'work.html#arbeitsproben'],
      ['assets/portfolio/exports/set-1-01.webp', 'Lighthouse Cruises · Werbegrafik', 'work.html#arbeitsproben']
    ];
    const section = document.createElement('section');
    section.className = 'post-flow';
    section.id = 'beispiel-posts';
    section.setAttribute('aria-label', 'Beispiel-Posts aus dem Portfolio');
    const cards = examples.map(([src, alt, href]) => `<a href="${href}"><img src="${src}" alt="${alt}" loading="eager" decoding="async" width="320" height="400"></a>`).join('');
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
    const sources = ['assets/portfolio/exports/set-2-04.webp', 'assets/portfolio/legacy/design-1.webp', 'assets/portfolio/exports/set-1-01.webp'];
    if (!sources[i]) return;
    const img = document.createElement('img');
    img.className = 'service-detail-preview';
    img.src = sources[i];
    img.alt = ['Strategie und gemeinsame Planung', 'Einblick in einen gestalteten Kunden-Feed', 'Content für Social-Media-Kampagnen'][i];
    img.loading = 'lazy';
    const link = document.createElement('a');
    link.href = ['strategie-analyse.html', 'content-design.html', 'social-ads.html'][i];
    link.append(img);
    section.querySelector('.sticky')?.append(link);
  });
  const tabs = [...document.querySelectorAll('.service-tab')];
  const panel = document.querySelector('.service-panel');
  if (!tabs.length || !panel) return;
  const previews = [
    ['assets/portfolio/exports/set-2-04.webp', 'Redaktionsserie aus meiner Arbeit für Annika Fischer'],
    ['assets/portfolio/legacy/design-1.webp', 'Social-Media-Design aus meinem eigenen Portfolio'],
    ['assets/portfolio/exports/set-1-01.webp', 'Kampagnenmotiv aus meiner Arbeit für Lighthouse Cruises']
  ];
  const preview = document.createElement('a');
  preview.href = tabs[0].href;
  preview.setAttribute('aria-label', 'Mehr über Strategie und Analyse erfahren');
  preview.className = 'service-visual';
  preview.innerHTML = previews.map(([src, alt], i) => `<img src="${src}" alt="${alt}" loading="lazy" class="${i === 0 ? 'is-active' : ''}">`).join('');
  panel.append(preview);
  panel.closest('.services').classList.add('services-visual');
  tabs.forEach((tab, index) => {
    tab.removeAttribute('aria-pressed');
    const select = () => {
      preview.href = tab.href;
      preview.setAttribute('aria-label', ['Mehr über Strategie und Analyse erfahren','Content und Design ansehen','Mehr über Social Ads erfahren'][index]);
      tabs.forEach((item, i) => { item.classList.toggle('active', i === index); item.removeAttribute('aria-pressed'); });
      preview.querySelectorAll('img').forEach((img, i) => img.classList.toggle('is-active', i === index));
      document.querySelector('[data-service-title]').textContent = ['Strategie & Analyse', 'Content & Design', 'Social Ads'][index];
      document.querySelector('[data-service-text]').textContent = [
        'Zielgruppenanalyse, Markt- und Wettbewerbsanalyse, Content-Strategie und Redaktionsplanung – mit verständlichem Reporting und laufender Optimierung für Unternehmen in Deutschland.',
        'Individuelle Social-Media-Designs, authentische Reels und passende Texte – mit Ihrer Markenstimme, vom Konzept bis zum fertigen Content.',
        'Instagram- und Facebook-Werbung für Ihre Zielgruppe in Deutschland: passende Werbemotive, Kampagnenplanung und laufende Optimierung.'
      ][index];
    };
    tab.addEventListener('mouseenter', select);
    tab.addEventListener('focus', select);
    tab.addEventListener('click', select);
  });
  tabs[0].dispatchEvent(new Event('mouseenter'));
})();
