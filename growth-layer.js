(() => {
  if (document.documentElement.dataset.jjGrowthLoaded) return;
  document.documentElement.dataset.jjGrowthLoaded = 'true';

  const doc = document;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const params = new URLSearchParams(location.search);
  const path = location.pathname.toLowerCase();
  const referrer = (document.referrer || '').toLowerCase();
  const isHome = Boolean(doc.querySelector('.hero-premium'));
  const ANALYTICS_KEY = 'jj-analytics-consent-v1';
  const SESSION_KEY = 'jj-growth-session-v1';
  const EXPERIMENT_KEY = 'jj-hero-cta-2026-08';

  const css = doc.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'growth-layer.css?v=20260831-1';
  doc.head.appendChild(css);

  const getSession = () => {
    try {
      let id = sessionStorage.getItem(SESSION_KEY);
      if (!id) {
        id = crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;
        sessionStorage.setItem(SESSION_KEY,id);
      }
      return id;
    } catch (_) {
      return `ephemeral-${Math.random().toString(36).slice(2,10)}`;
    }
  };
  const sessionId = getSession();

  const consent = () => {
    try { return localStorage.getItem(ANALYTICS_KEY) || ''; } catch (_) { return ''; }
  };

  const track = (event, properties = {}) => {
    if (consent() !== 'yes') return;
    const payload = {
      event: String(event).slice(0,80),
      session: sessionId.slice(0,80),
      path: location.pathname.slice(0,300),
      referrer_host: (() => { try { return document.referrer ? new URL(document.referrer).hostname.slice(0,120) : ''; } catch (_) { return ''; } })(),
      properties: Object.fromEntries(Object.entries(properties).slice(0,20).map(([key,value]) => [String(key).slice(0,60),String(value ?? '').slice(0,200)]))
    };
    try {
      if (window.posthog?.capture) window.posthog.capture(payload.event,payload.properties);
      fetch('/api/conversion-event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),keepalive:true}).catch(()=>{});
    } catch (_) {}
  };
  window.JJTrack = track;

  const experimentVariant = () => {
    try {
      const stored = sessionStorage.getItem(EXPERIMENT_KEY);
      if (stored === 'A' || stored === 'B') return stored;
      let hash = 0;
      for (let i = 0; i < sessionId.length; i += 1) hash = ((hash << 5) - hash + sessionId.charCodeAt(i)) | 0;
      const variant = Math.abs(hash) % 2 === 0 ? 'A' : 'B';
      sessionStorage.setItem(EXPERIMENT_KEY,variant);
      return variant;
    } catch (_) { return 'A'; }
  };
  const heroVariant = experimentVariant();

  const privacy = () => {
    if (consent()) return;
    const panel = doc.createElement('aside');
    panel.className = 'jj-privacy';
    panel.setAttribute('aria-label','Datenschutzeinstellungen');
    panel.innerHTML = `<strong>Privatsphäre zuerst.</strong><p>Notwendige Funktionen laufen immer. Optionale, anonyme Nutzungsstatistiken helfen uns, Inhalte und Nutzerführung zu verbessern.</p><div class="jj-privacy-actions"><button type="button" data-consent="no">Nur notwendig</button><button class="primary" type="button" data-consent="yes">Statistik erlauben</button></div><a href="datenschutz.html">Datenschutzerklärung ansehen</a>`;
    doc.body.appendChild(panel);
    requestAnimationFrame(() => panel.classList.add('visible'));
    panel.addEventListener('click',event => {
      const button = event.target.closest('[data-consent]');
      if (!button) return;
      try { localStorage.setItem(ANALYTICS_KEY,button.dataset.consent); } catch (_) {}
      panel.classList.remove('visible');
      setTimeout(() => panel.remove(),350);
      if (button.dataset.consent === 'yes') track('analytics_consent',{source:'privacy_panel'});
    });
  };

  const accessibility = () => {
    if (!doc.querySelector('.jj-skip-link')) {
      const skip = doc.createElement('a');
      skip.href = '#jj-main-content';
      skip.className = 'jj-skip-link';
      skip.textContent = 'Zum Inhalt springen';
      doc.body.prepend(skip);
    }
    const mainTarget = doc.querySelector('main,header.hero-premium,header.page-hero,header.travel-hero');
    if (mainTarget && !mainTarget.id) mainTarget.id = 'jj-main-content';
  };

  const scrollProgress = () => {
    const wrap = doc.createElement('div');
    wrap.className = 'jj-scroll-progress';
    wrap.setAttribute('aria-hidden','true');
    wrap.innerHTML = '<span></span>';
    doc.body.appendChild(wrap);
    const bar = wrap.firstElementChild;
    let ticking = false;
    const paint = () => {
      const max = Math.max(1,doc.documentElement.scrollHeight - innerHeight);
      bar.style.width = `${Math.min(100,Math.max(0,scrollY / max * 100))}%`;
      ticking = false;
    };
    addEventListener('scroll',() => { if (!ticking) { requestAnimationFrame(paint); ticking = true; } },{passive:true});
    addEventListener('resize',paint);
    paint();
  };

  const audienceContext = () => {
    if (path.includes('reisebranche')) return {label:'Travel Growth Check',goal:'Mehr qualifizierte Anfragen'};
    const source = `${params.get('utm_source') || ''} ${referrer}`;
    if (/instagram|facebook|meta|tiktok/.test(source)) return {label:'Social-Profil kostenlos prüfen',goal:'Mehr Reichweite und Bekanntheit'};
    if (/linkedin/.test(source)) return {label:'LinkedIn-Auftritt kostenlos prüfen',goal:'Mehr qualifizierte Anfragen'};
    return {label:'Kostenlose Social-Media-Analyse',goal:''};
  };
  const context = audienceContext();

  const buildAnalysisUrl = ({goal = '',challenge = '',industry = ''} = {}) => {
    const url = new URL('analyse.html',location.href);
    const resolvedGoal = goal || context.goal;
    if (resolvedGoal) url.searchParams.set('goal',resolvedGoal);
    if (challenge) url.searchParams.set('challenge',challenge);
    if (industry) url.searchParams.set('industry',industry);
    ['utm_source','utm_medium','utm_campaign'].forEach(key => { const value = params.get(key); if (value) url.searchParams.set(key,value); });
    url.searchParams.set('entry','growth-layer');
    return `${url.pathname.split('/').pop()}${url.search}`;
  };

  const enhanceCtas = () => {
    const heroCta = doc.querySelector('.hero-actions .btn');
    if (heroCta) {
      heroCta.href = buildAnalysisUrl();
      heroCta.dataset.track = 'hero_audit';
      heroCta.innerHTML = heroVariant === 'A' ? 'Kostenlosen Social-Media-Check starten <span>↗</span>' : '250-€-Analyse kostenlos sichern <span>↗</span>';
      track('experiment_exposure',{experiment:'hero-cta-2026-08',variant:heroVariant});
    }
    const navCta = doc.querySelector('.nav .btn.desktop');
    if (navCta) {
      navCta.href = buildAnalysisUrl();
      navCta.dataset.track = 'nav_audit';
      navCta.innerHTML = `${context.label} <span>↗</span>`;
    }
    const actions = doc.querySelector('.hero-actions');
    if (actions && !doc.querySelector('.jj-hero-microtrust')) {
      actions.insertAdjacentHTML('afterend','<div class="jj-hero-microtrust"><span>✓ persönlich geprüft</span><i></i><span>kostenlos &amp; unverbindlich</span><i></i><span>wenige Fragen</span></div>');
    }
    doc.querySelectorAll('a[href="contact.html"].btn').forEach(link => {
      if (link.closest('footer') || link.closest('.contact-layout')) return;
      link.dataset.track ||= 'secondary_contact';
    });
  };

  const stickyConversion = () => {
    if (doc.querySelector('.jj-sticky-convert') || path.includes('analyse')) return;
    const dock = doc.createElement('aside');
    dock.className = 'jj-sticky-convert';
    dock.setAttribute('aria-label','Kostenlose Social-Media-Analyse');
    dock.innerHTML = `<div class="jj-sticky-copy"><span class="jj-sticky-dot"></span><div><strong>${context.label}</strong><span>Persönlich geprüft · Wert 250 € · unverbindlich</span></div></div><a class="btn" data-track="sticky_audit" href="${buildAnalysisUrl()}">Analyse starten ↗</a>`;
    doc.body.appendChild(dock);
    const triggerAt = Math.min(520,Math.max(220,innerHeight * .55));
    const toggle = () => {
      const nearFooter = doc.querySelector('footer')?.getBoundingClientRect().top < innerHeight * .88;
      dock.classList.toggle('visible',scrollY > triggerAt && !nearFooter);
    };
    addEventListener('scroll',toggle,{passive:true});
    addEventListener('resize',toggle);
    toggle();
  };

  const injectQuickAudit = () => {
    if (!isHome || doc.querySelector('.jj-growth-section')) return;
    const anchor = doc.querySelector('.trust-proof-section') || doc.querySelector('.case-section');
    if (!anchor) return;
    anchor.insertAdjacentHTML('afterend',`
      <section class="jj-growth-section" aria-labelledby="jj-growth-title">
        <div class="container jj-growth-inner">
          <div class="jj-growth-head reveal">
            <div><div class="eyebrow">Interaktiver Schnellcheck</div><h2 id="jj-growth-title">Wo steckt gerade dein größter <span class="serif">Wachstumshebel?</span></h2></div>
            <p>Drei Selbsteinschätzungen reichen für eine erste Orientierung. Danach kannst du Jessica deinen echten Auftritt für die persönliche Analyse schicken.</p>
          </div>
          <div class="jj-growth-grid">
            <article class="jj-audit-card reveal" aria-live="polite">
              <div class="jj-audit-top"><span class="jj-audit-badge">60-Sekunden Potenzialcheck</span><span class="jj-audit-step" data-jj-step>1 / 3</span></div>
              <div class="jj-audit-question" data-jj-question></div>
              <div class="jj-audit-result" data-jj-result>
                <div class="jj-score-ring" data-jj-ring><div><strong data-jj-score>—</strong><small>Potenzialindikator</small></div></div>
                <div><span class="eyebrow">Erste Orientierung</span><h3 data-jj-result-title>Potenzial vorhanden.</h3><p data-jj-result-copy></p><a class="btn" data-jj-result-link data-track="quick_audit_complete" href="analyse.html">Jetzt persönlich prüfen lassen ↗</a><small class="jj-result-note">Der Wert ist nur eine Orientierung aus deinen Antworten – keine automatisierte Profilanalyse.</small></div>
              </div>
              <div class="jj-audit-progress" data-jj-progress><span></span></div>
            </article>
            <aside class="jj-proof-engine reveal">
              <div class="eyebrow">Proof statt Versprechen</div>
              <h3>Was bereits messbar funktioniert hat.</h3>
              <div class="jj-proof-stack">
                <a class="jj-proof-row" href="#cases" data-track="proof_101k"><strong>101.188</strong><p>Impressions mit einem strategischen Content-Piece.</p><span>Proof ↓</span></a>
                <a class="jj-proof-row" href="#cases" data-track="proof_490"><strong>+490%</strong><p>Follower-Wachstum bei Village Adventures in vier Monaten.</p><span>Case ↓</span></a>
                <a class="jj-proof-row" href="work.html" data-track="proof_cases"><strong>Cases</strong><p>Originalscreenshots, Kundenstimmen und nachvollziehbare Ergebnisse.</p><span>Öffnen ↗</span></a>
              </div>
              <div class="jj-proof-footer"><small>Ergebnisse vergangener Projekte sind keine Garantie für zukünftige Resultate.</small><a href="work.html" data-track="all_cases">Alle Case Studies ↗</a></div>
            </aside>
          </div>
        </div>
      </section>`);

    const questions = [
      {key:'consistency',title:'Wie konstant ist euer Social Media aktuell?',options:[['stark','Klar & konstant','Wir posten mit erkennbarem System.'],['mittel','Unregelmäßig','Wir sind aktiv, aber ohne echte Linie.'],['schwach','Kaum aktiv','Social Media läuft eher nebenbei.']]},
      {key:'goal',title:'Was wäre für euch aktuell am wertvollsten?',options:[['leads','Mehr Anfragen','Social Media soll konkreter zum Geschäft beitragen.'],['reach','Mehr Reichweite','Mehr relevante Menschen sollen uns entdecken.'],['brand','Stärkeres Vertrauen','Der Auftritt soll hochwertiger und klarer wirken.']]},
      {key:'proof',title:'Wie gut zeigt euer Auftritt heute, warum man euch wählen sollte?',options:[['stark','Sehr klar','Cases, Persönlichkeit und Differenzierung sind sichtbar.'],['mittel','Teilweise','Man versteht uns, aber Proof könnte stärker sein.'],['schwach','Noch zu wenig','Der echte Wert kommt online kaum rüber.']]}
    ];
    const state = {};
    let step = 0;
    const q = doc.querySelector('[data-jj-question]');
    const stepEl = doc.querySelector('[data-jj-step]');
    const progress = doc.querySelector('[data-jj-progress] span');
    const result = doc.querySelector('[data-jj-result]');
    const progressWrap = doc.querySelector('[data-jj-progress]');
    const render = () => {
      const item = questions[step];
      stepEl.textContent = `${step + 1} / ${questions.length}`;
      progress.style.width = `${((step + 1) / questions.length) * 100}%`;
      q.innerHTML = `<h3>${item.title}</h3><div class="jj-audit-options">${item.options.map(([value,label,copy]) => `<button type="button" class="jj-audit-option" data-value="${value}"><small>${label}</small><strong>${copy}</strong></button>`).join('')}</div>`;
      q.querySelectorAll('[data-value]').forEach(button => button.addEventListener('click',() => {
        state[item.key] = button.dataset.value;
        button.classList.add('active');
        track('quick_audit_answer',{question:item.key,answer:button.dataset.value,step:step + 1});
        setTimeout(() => {
          if (step < questions.length - 1) { step += 1; render(); }
          else finish();
        },reduceMotion ? 0 : 180);
      }));
    };
    const finish = () => {
      const consistency = {stark:22,mittel:12,schwach:5}[state.consistency] || 8;
      const proof = {stark:22,mittel:12,schwach:5}[state.proof] || 8;
      const score = Math.min(91,Math.max(48,45 + consistency + proof));
      const highOpportunity = score < 72;
      q.style.display = 'none';
      progressWrap.style.display = 'none';
      result.classList.add('active');
      doc.querySelector('[data-jj-ring]').style.setProperty('--score',score);
      doc.querySelector('[data-jj-score]').textContent = `${score}/100`;
      doc.querySelector('[data-jj-result-title]').textContent = highOpportunity ? 'Hier liegt sichtbar Potenzial.' : 'Gute Basis – jetzt geht es um den nächsten Hebel.';
      doc.querySelector('[data-jj-result-copy]').textContent = highOpportunity ? 'Deine Antworten deuten darauf hin, dass vor allem System, Proof oder Klarheit noch stärker für Anfragen arbeiten könnten.' : 'Die Basis wirkt nach deiner Selbsteinschätzung solide. Eine persönliche Analyse zeigt, wo Reichweite, Conversion oder Positionierung noch geschärft werden können.';
      const goalMap = {leads:'Mehr qualifizierte Anfragen',reach:'Mehr Reichweite und Bekanntheit',brand:'Professioneller Markenauftritt'};
      const challengeMap = state.consistency === 'schwach' ? 'Wir starten gerade erst' : state.proof === 'schwach' ? 'Content bringt kaum Reichweite oder Anfragen' : state.consistency === 'mittel' ? 'Es fehlt eine klare Strategie' : '';
      doc.querySelector('[data-jj-result-link]').href = buildAnalysisUrl({goal:goalMap[state.goal] || '',challenge:challengeMap});
      track('quick_audit_result',{score,goal:state.goal || '',consistency:state.consistency || '',proof:state.proof || ''});
    };
    render();
  };

  const trackInteraction = () => {
    doc.addEventListener('click',event => {
      const target = event.target.closest('[data-track]');
      if (!target) return;
      track('cta_click',{id:target.dataset.track,href:target.getAttribute('href') || '',text:(target.textContent || '').trim().slice(0,100)});
    });
    const marks = new Set();
    const depths = [25,50,75,90];
    const onScroll = () => {
      if (consent() !== 'yes') return;
      const max = Math.max(1,doc.documentElement.scrollHeight - innerHeight);
      const pct = scrollY / max * 100;
      depths.forEach(depth => { if (pct >= depth && !marks.has(depth)) { marks.add(depth); track('scroll_depth',{depth}); } });
    };
    addEventListener('scroll',onScroll,{passive:true});
  };

  const prefetchAudit = () => {
    const prefetch = () => {
      if (doc.head.querySelector('link[data-jj-prefetch]')) return;
      const link = doc.createElement('link');
      link.rel = 'prefetch';
      link.href = 'analyse.html';
      link.as = 'document';
      link.dataset.jjPrefetch = 'true';
      doc.head.appendChild(link);
    };
    doc.addEventListener('pointerover',event => { if (event.target.closest('a[href*="analyse"]')) prefetch(); },{passive:true});
  };

  const initLenis = () => {
    if (reduceMotion || !matchMedia('(pointer:fine) and (min-width:901px)').matches) return;
    const script = doc.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/lenis@1.3.11/dist/lenis.min.js';
    script.async = true;
    script.onload = () => {
      if (!window.Lenis) return;
      try {
        const lenis = new window.Lenis({duration:1.05,smoothWheel:true,wheelMultiplier:.92,touchMultiplier:1.05});
        const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
      } catch (_) {}
    };
    doc.head.appendChild(script);
  };

  accessibility();
  scrollProgress();
  enhanceCtas();
  injectQuickAudit();
  stickyConversion();
  trackInteraction();
  prefetchAudit();
  privacy();
  initLenis();
  track('page_view',{variant:heroVariant,entry:params.get('entry') || '',utm_source:params.get('utm_source') || ''});
})();
