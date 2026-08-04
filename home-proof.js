(() => {
  if (document.documentElement.dataset.jjProofLoaded) return;
  document.documentElement.dataset.jjProofLoaded = 'true';

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'home-proof.css?v=20260804-3';
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
            <div class="trust-proof-title">
              <div class="eyebrow">Echte Stimmen · echte Einblicke</div>
              <h2 id="trust-proof-title">Nicht wir sagen, wie gut es läuft. <span class="serif">Unsere Kunden tun es.</span></h2>
            </div>
            <div class="trust-proof-intro">
              <span class="proof-quote-mark" aria-hidden="true">“</span>
              <p>Keine einstudierten Sätze. Keine austauschbaren Sterne. Zwei Menschen erzählen selbst, wie sie die Zusammenarbeit mit Jessica erlebt haben.</p>
              <div class="proof-summary"><span>2 Videostimmen</span><i></i><span>1 Originalzertifikat</span></div>
            </div>
          </div>

          <div class="trust-proof-grid">
            <div class="video-testimonial-grid" aria-label="Video-Kundenstimmen">
              <article class="testimonial-video-card reveal">
                <div class="testimonial-video" data-youtube-id="VWYnnGcmF6w">
                  <button class="video-poster" type="button" aria-label="Erste Kundenstimme abspielen">
                    <img src="https://i.ytimg.com/vi/VWYnnGcmF6w/hqdefault.jpg" alt="Kundin berichtet über die Zusammenarbeit mit JJ-Media" loading="lazy">
                    <span class="testimonial-shade" aria-hidden="true"></span>
                    <span class="testimonial-label"><b>01</b> Kundenstimme</span>
                    <span class="testimonial-overlay-copy">
                      <small>Ehrlich · direkt · persönlich</small>
                      <strong>So klingt Vertrauen, wenn es nicht inszeniert ist.</strong>
                      <span>Video ansehen <i>↗</i></span>
                    </span>
                    <span class="play" aria-hidden="true"><span>▶</span></span>
                  </button>
                </div>
              </article>

              <article class="testimonial-video-card reveal">
                <div class="testimonial-video" data-youtube-id="2CbtOEdPQOk">
                  <button class="video-poster" type="button" aria-label="Zweite Kundenstimme abspielen">
                    <img src="https://i.ytimg.com/vi/2CbtOEdPQOk/hqdefault.jpg" alt="Kunde berichtet über die Zusammenarbeit mit JJ-Media" loading="lazy">
                    <span class="testimonial-shade" aria-hidden="true"></span>
                    <span class="testimonial-label"><b>02</b> Kundenstimme</span>
                    <span class="testimonial-overlay-copy">
                      <small>Ohne Skript · aus erster Hand</small>
                      <strong>Was Kunden sagen, wenn kein Werbetext vor ihnen liegt.</strong>
                      <span>Video ansehen <i>↗</i></span>
                    </span>
                    <span class="play" aria-hidden="true"><span>▶</span></span>
                  </button>
                </div>
              </article>
            </div>

            <article class="certificate-card reveal">
              <div class="certificate-topline"><span>Qualifikation</span><strong>Originalnachweis</strong></div>
              <a class="certificate-frame-link" href="certificate.html" target="_blank" rel="noopener" aria-label="Zertifikat von Jessica Just in voller Größe öffnen">
                <iframe class="certificate-frame" src="certificate.html" title="Zertifikat Digital Manager Soziale Medien von Jessica Just" loading="lazy" tabindex="-1"></iframe>
                <span class="certificate-open">Original öffnen ↗</span>
              </a>
              <div class="certificate-copy">
                <div class="eyebrow">IDK Bildungs GmbH · 2024</div>
                <h3>Qualifikation, die nicht nur behauptet wird.</h3>
                <p>Jessica hat die Abschlussprüfung zur „Digital Managerin Soziale Medien“ erfolgreich bestanden – mit 162 Unterrichtseinheiten rund um Strategie, Content, Ads, Funnel und Automatisierung.</p>
                <div class="certificate-facts"><span>162 UE</span><span>Prüfung bestanden</span><span>Original einsehbar</span></div>
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
