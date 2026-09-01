(() => {
  const doc=document;
  const isHome=Boolean(doc.querySelector('.hero-premium'));
  const css=doc.createElement('link');
  css.rel='stylesheet';
  css.href='social-audit-bridge.css?v=20260901-1';
  doc.head.appendChild(css);

  const auditHref='analyse.html?entry=website-audit';
  const hero=doc.querySelector('.hero-actions .btn');
  if(hero){
    hero.href=auditHref;
    hero.dataset.track='hero_personal_audit';
    hero.innerHTML='Kostenlose Social-Media-Analyse <span>↗</span>';
  }
  const nav=doc.querySelector('.nav .btn.desktop');
  if(nav){
    nav.href=auditHref;
    nav.dataset.track='nav_personal_audit';
    nav.innerHTML='Kostenlose Analyse <span>↗</span>';
  }
  const sticky=doc.querySelector('.jj-sticky-convert a');
  if(sticky){
    sticky.href=auditHref;
    sticky.dataset.track='sticky_personal_audit';
    sticky.textContent='Analyse anfragen ↗';
  }
  const stickyTitle=doc.querySelector('.jj-sticky-copy strong');
  const stickySub=doc.querySelector('.jj-sticky-copy span');
  if(stickyTitle) stickyTitle.textContent='Social Media persönlich analysieren lassen';
  if(stickySub) stickySub.textContent='Instagram · Facebook · YouTube · LinkedIn';
  const micro=doc.querySelector('.jj-hero-microtrust');
  if(micro) micro.innerHTML='<span>✓ persönlich geprüft</span><i></i><span>kostenlos</span><i></i><span>keine Standardauswertung</span>';

  if(!isHome||doc.querySelector('.jj-live-audit')) return;
  const heroSection=doc.querySelector('.hero-premium');
  if(!heroSection) return;
  heroSection.insertAdjacentHTML('afterend',`
    <section class="jj-live-audit" aria-labelledby="jj-live-audit-title">
      <div class="container jj-live-audit-inner">
        <div class="jj-live-audit-copy reveal">
          <div class="eyebrow">Kostenlose Social-Media-Analyse · persönlich</div>
          <h2 id="jj-live-audit-title">Profil rein.<br><span>Jessica schaut hin.</span></h2>
          <p>Schick uns deinen Auftritt. Wir sammeln die relevanten öffentlichen Signale vor, Jessica prüft Positionierung, Content und Conversion-Potenzial persönlich – und meldet sich mit einer individuellen Einschätzung statt mit einem austauschbaren Auto-Report.</p>
          <div class="jj-live-audit-trust"><span>✓ persönlich geprüft</span><span>✓ kostenlos & unverbindlich</span><span>✓ individuelle Rückmeldung</span></div>
        </div>
        <form class="jj-live-audit-form reveal" data-live-audit-form>
          <div class="jj-live-audit-input"><span class="jj-live-audit-icon">↗</span><input type="text" aria-label="Social-Media-Profil" placeholder="instagram.com/deinprofil oder @deinprofil" autocomplete="url" inputmode="url" required></div>
          <div class="jj-live-audit-badges" aria-label="Unterstützte Plattformen">
            <span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1"></circle></svg>Instagram</span>
            <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.6 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.3H7.8V13h2.7v8h3.1z"></path></svg>Facebook</span>
            <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8.2a2.8 2.8 0 0 0-2-2C17.3 5.7 12 5.7 12 5.7s-5.3 0-7 .5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2.5 12 29 29 0 0 0 3 15.8a2.8 2.8 0 0 0 2 2c1.7.5 7 .5 7 .5s5.3 0 7-.5a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .5-3.8 29 29 0 0 0-.5-3.8z"></path><path class="jj-logo-cut" d="M10 15.1V8.9l5.2 3.1z"></path></svg>YouTube</span>
            <span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="9" width="3.5" height="11"></rect><circle cx="5.75" cy="5.5" r="1.8"></circle><path d="M10 9h3.3v1.5h.1c.5-.9 1.6-1.9 3.4-1.9 3.6 0 4.2 2.3 4.2 5.4v6h-3.5v-5.3c0-1.3 0-2.9-1.8-2.9s-2.1 1.4-2.1 2.8V20H10V9z"></path></svg>LinkedIn</span>
          </div>
          <button type="submit">Kostenlose Analyse anfragen ↗</button>
          <small>Du bekommst keinen generischen Sofort-Score. Deine Angaben gehen intern an JJ-Media und werden für eine persönliche oder individuell vorbereitete Analyse genutzt.</small>
        </form>
      </div>
    </section>`);

  const form=doc.querySelector('[data-live-audit-form]');
  form?.addEventListener('submit',event=>{
    event.preventDefault();
    const value=form.querySelector('input')?.value.trim()||'';
    if(value.length<3){form.querySelector('input')?.focus();return;}
    const lower=value.toLowerCase();
    const platform=lower.includes('instagram')||value.startsWith('@')?'instagram':lower.includes('facebook')?'facebook':lower.includes('youtu')?'youtube':lower.includes('linkedin')?'linkedin':'other';
    window.JJTrack?.('personal_audit_home_submit',{platform});
    const url=new URL('analyse.html',location.href);
    url.searchParams.set('profile',value);
    url.searchParams.set('entry','home-audit');
    location.href=`${url.pathname.split('/').pop()}${url.search}`;
  });
})();