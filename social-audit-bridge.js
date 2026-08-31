(() => {
  const doc=document;
  const isHome=Boolean(doc.querySelector('.hero-premium'));
  const css=doc.createElement('link');
  css.rel='stylesheet';
  css.href='social-audit-bridge.css?v=20260831-1';
  doc.head.appendChild(css);

  const auditHref='social-audit.html';
  const hero=doc.querySelector('.hero-actions .btn');
  if(hero){
    hero.href=auditHref;
    hero.dataset.track='hero_live_audit';
    hero.innerHTML='Social-Profil live analysieren <span>↗</span>';
  }
  const nav=doc.querySelector('.nav .btn.desktop');
  if(nav){
    nav.href=auditHref;
    nav.dataset.track='nav_live_audit';
    nav.innerHTML='Profil kostenlos prüfen <span>↗</span>';
  }
  const sticky=doc.querySelector('.jj-sticky-convert a');
  if(sticky){
    sticky.href=auditHref;
    sticky.dataset.track='sticky_live_audit';
    sticky.textContent='Live-Audit starten ↗';
  }
  const stickyTitle=doc.querySelector('.jj-sticky-copy strong');
  const stickySub=doc.querySelector('.jj-sticky-copy span');
  if(stickyTitle) stickyTitle.textContent='Social-Profil live analysieren';
  if(stickySub) stickySub.textContent='Öffentliche Signale · sofort · ohne Login';
  const micro=doc.querySelector('.jj-hero-microtrust');
  if(micro) micro.innerHTML='<span>✓ Ergebnis sofort</span><i></i><span>ohne Login</span><i></i><span>keine Fantasiezahlen</span>';

  if(!isHome||doc.querySelector('.jj-live-audit')) return;
  const heroSection=doc.querySelector('.hero-premium');
  if(!heroSection) return;
  heroSection.insertAdjacentHTML('afterend',`
    <section class="jj-live-audit" aria-labelledby="jj-live-audit-title">
      <div class="container jj-live-audit-inner">
        <div class="jj-live-audit-copy reveal">
          <div class="eyebrow">JJ Social Audit™ · Sofort-Analyse</div>
          <h2 id="jj-live-audit-title">Link rein.<br><span>Hebel sehen.</span></h2>
          <p>Instagram, TikTok, LinkedIn, Facebook oder Threads einfügen. Der Audit prüft sofort die verlässlich öffentlich zugänglichen Signale und zeigt, wo Profil, Positionierung, Proof oder Conversion noch stärker arbeiten können.</p>
          <div class="jj-live-audit-trust"><span>✓ Ergebnis vor Kontaktdaten</span><span>✓ nur öffentliche Signale</span><span>✓ persönliche Vertiefung optional</span></div>
        </div>
        <form class="jj-live-audit-form reveal" data-live-audit-form>
          <div class="jj-live-audit-input"><span class="jj-live-audit-icon">↗</span><input type="text" aria-label="Social-Media-Profil" placeholder="instagram.com/deinprofil oder @deinprofil" autocomplete="url" inputmode="url" required></div>
          <div class="jj-live-audit-badges"><span>Instagram</span><span>TikTok</span><span>LinkedIn</span><span>Facebook</span><span>Threads</span></div>
          <button type="submit">Profil jetzt live prüfen ↗</button>
          <small>Kein Login nötig. Wenn eine Plattform öffentliche Daten blockiert, zeigen wir bewusst keinen künstlichen Score.</small>
        </form>
      </div>
    </section>`);

  const form=doc.querySelector('[data-live-audit-form]');
  form?.addEventListener('submit',event=>{
    event.preventDefault();
    const value=form.querySelector('input')?.value.trim()||'';
    if(value.length<3){form.querySelector('input')?.focus();return;}
    window.JJTrack?.('live_audit_home_submit',{platform:value.includes('instagram')||value.startsWith('@')?'instagram':value.includes('tiktok')?'tiktok':value.includes('linkedin')?'linkedin':'other'});
    const url=new URL('social-audit.html',location.href);
    url.searchParams.set('profile',value);
    url.searchParams.set('auto','1');
    location.href=`${url.pathname.split('/').pop()}${url.search}`;
  });
})();
