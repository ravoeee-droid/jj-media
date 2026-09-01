(() => {
  const doc = document;
  if (!doc.querySelector('.hero-premium') || doc.querySelector('.jj-insights-bridge')) return;
  const css = doc.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'insights-bridge.css?v=20260901-1';
  doc.head.appendChild(css);

  const anchor = doc.querySelector('.travel-teaser') || doc.querySelector('.cta') || doc.querySelector('footer');
  if (!anchor) return;
  anchor.insertAdjacentHTML('beforebegin', `
    <section class="jj-insights-bridge">
      <div class="container jj-insights-inner">
        <div class="jj-insights-head reveal">
          <div><div class="eyebrow">JJ Insights · Strategie & Plattform-Updates</div><h2>Wissen, das nicht nur informiert.<br><span>Es verändert Entscheidungen.</span></h2></div>
          <a href="blog.html">Alle Insights ansehen ↗</a>
        </div>
        <div class="jj-insights-grid">
          <a class="jj-insight-card jj-insight-featured reveal" href="blog/social-media-strategie-2026.html">
            <div class="jj-insight-meta"><span>Pillar Guide</span><small>Strategie · 12 Min.</small></div>
            <h3>Social-Media-Strategie 2026: Was Unternehmen wirklich brauchen – und was sie sich sparen können.</h3>
            <p>Ein klarer Leitfaden für Ziele, Plattformrollen, Content-System, Proof, Distribution und Messung.</p><b>Guide lesen ↗</b>
          </a>
          <a class="jj-insight-card reveal" href="blog/youtube-shopping-amazon-2026.html">
            <div class="jj-insight-meta"><span>Aktuell</span><small>YouTube · 27.08.2026</small></div>
            <h3>YouTube Shopping + Amazon: Was die Entwicklung für Marken bedeutet.</h3>
            <p>Die offizielle Ankündigung eingeordnet – ohne Hype, mit konkreten Konsequenzen für Content und Social Commerce.</p><b>Einordnung lesen ↗</b>
          </a>
        </div>
      </div>
    </section>`);
})();