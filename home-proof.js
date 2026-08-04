(() => {
  if (document.documentElement.dataset.jjProofLoaded) return;
  document.documentElement.dataset.jjProofLoaded = 'true';

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'home-proof.css?v=20260804-1';
  document.head.appendChild(css);

  const navCta = document.querySelector('.nav .btn.desktop');
  if (navCta) {
    navCta.href = 'analyse.html';
    navCta.innerHTML = 'Kostenlose Analyse <span>↗</span>';
  }

  const heroCta = document.querySelector('.hero-actions .btn');
  if (heroCta) {
    heroCta.href = 'analyse.html';
    heroCta.innerHTML = 'Kostenlose Social-Media-Analyse <span>↗</span>';
  }

  const cases = document.querySelector('.case-section');
  if (cases && !document.querySelector('.trust-proof-section')) {
    cases.insertAdjacentHTML('afterend', `
      <section class="trust-proof-section" aria-labelledby="trust-proof-title">
        <div class="container">
          <div class="trust-proof-head reveal">
            <div><div class="eyebrow">Kundenstimmen · Originalnachweis</div><h2 id="trust-proof-title">Vertrauen, das man <span class="serif">sehen und hören</span> kann.</h2></div>
            <p>Zwei echte Video-Erfahrungen und Jessicas Abschlusszertifikat – transparent eingebettet, ohne austauschbare Siegel oder erfundene Versprechen.</p>
          </div>
          <div class="trust-proof-grid">
            <div class="video-testimonial-grid">
              <article class="testimonial-video-card reveal">
                <div class="testimonial-video" data-youtube-id="VWYnnGcmF6w">
                  <button class="video-poster" type="button" aria-label="Erstes Kunden-Testimonial abspielen">
                    <img src="https://i.ytimg.com/vi/VWYnnGcmF6w/hqdefault.jpg" alt="Vorschaubild des ersten Kunden-Testimonials" loading="lazy">
                    <span class="play" aria-hidden="true"><span>▶</span></span>
                  </button>
                </div>
                <div class="testimonial-video-copy"><strong>Erfahrung aus der Zusammenarbeit</strong><span>Persönlich erzählt – direkt im Video ansehen.</span></div>
              </article>
              <article class="testimonial-video-card reveal">
                <div class="testimonial-video" data-youtube-id="2CbtOEdPQOk">
                  <button class="video-poster" type="button" aria-label="Zweites Kunden-Testimonial abspielen">
                    <img src="https://i.ytimg.com/vi/2CbtOEdPQOk/hqdefault.jpg" alt="Vorschaubild des zweiten Kunden-Testimonials" loading="lazy">
                    <span class="play" aria-hidden="true"><span>▶</span></span>
                  </button>
                </div>
                <div class="testimonial-video-copy"><strong>Echte Stimme statt Werbeversprechen</strong><span>Ungekürzt und nachvollziehbar eingebettet.</span></div>
              </article>
            </div>
            <article class="certificate-card reveal">
              <a class="certificate-frame-link" href="certificate.html" target="_blank" rel="noopener" aria-label="Zertifikat von Jessica Just in voller Größe öffnen">
                <iframe class="certificate-frame" src="certificate.html" title="Zertifikat Digital Manager Soziale Medien von Jessica Just" loading="lazy" tabindex="-1"></iframe>
              </a>
              <div class="certificate-copy">
                <div class="eyebrow">IDK Bildungs GmbH · 2024</div>
                <h3>Digital Manager Soziale Medien</h3>
                <p>Abschlussprüfung erfolgreich bestanden. Die Weiterbildung umfasste 162 Unterrichtseinheiten – unter anderem Social Media, Content Marketing, bezahlte Werbung, Online-Funnel, Vertriebs- und Recruiting-Automatisierung.</p>
                <div class="certificate-facts"><span>162 Unterrichtseinheiten</span><span>Abschlussprüfung bestanden</span><span>Original einsehbar</span></div>
              </div>
            </article>
          </div>
        </div>
      </section>
    `);
  }

  const analysisCta = `
    <section class="analysis-cta">
      <div class="container reveal">
        <span class="analysis-cta-badge">Persönliche Analyse · Wert 250 €</span>
        <h2>Wo verliert dein Social Media gerade <span class="serif">Potenzial?</span></h2>
        <p>Beantworte wenige kurze Fragen. Jessica prüft deinen Auftritt persönlich und zeigt dir die wichtigsten Hebel für mehr Sichtbarkeit, Vertrauen und qualifizierte Anfragen.</p>
        <div class="analysis-cta-actions"><a class="btn" href="analyse.html">Kostenlose Analyse starten <span>↗</span></a></div>
        <span class="analysis-cta-note">Wenige Fragen · kostenlos · unverbindlich · kein Pitch, kein Druck</span>
      </div>
    </section>`;

  const oldCta = document.querySelector('body > .cta');
  if (oldCta) oldCta.outerHTML = analysisCta;
  else document.querySelector('footer')?.insertAdjacentHTML('beforebegin', analysisCta);
})();
