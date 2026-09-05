(() => {
  if (document.documentElement.dataset.jjGrowthV2Loaded) return;
  document.documentElement.dataset.jjGrowthV2Loaded='true';

  const doc=document;
  const path=location.pathname.toLowerCase();
  const ANALYTICS_KEY='jj-analytics-consent-v1';
  const SESSION_KEY='jj-growth-session-v2';
  const ATTRIBUTION_KEY='jj-attribution-v1';

  if(!doc.querySelector('link[data-jj-growth-css]')){
    const css=doc.createElement('link');css.rel='stylesheet';css.href='growth-layer.css?v=20260901-3';css.dataset.jjGrowthCss='true';doc.head.appendChild(css);
  }

  const getConsent=()=>{try{return localStorage.getItem(ANALYTICS_KEY)||''}catch(_){return ''}};
  const setConsent=value=>{try{localStorage.setItem(ANALYTICS_KEY,value)}catch(_){}};
  const loadClarity=callback=>{
    if(window.JJClarity){callback?.();return}
    const existing=doc.querySelector('script[data-jj-clarity]');
    if(existing){existing.addEventListener('load',()=>callback?.(),{once:true});return}
    const script=doc.createElement('script');
    script.src='clarity.js?v=20260905-2';
    script.dataset.jjClarity='true';
    script.onload=()=>callback?.();
    doc.head.appendChild(script);
  };
  const startClarity=()=>loadClarity(()=>window.JJClarity?.init());

  const currentAttribution=()=>{
    const params=new URLSearchParams(location.search);
    let referrerHost='';
    try{referrerHost=document.referrer?new URL(document.referrer).hostname.toLowerCase():''}catch(_){}
    const source=(params.get('utm_source')||'').toLowerCase();
    const medium=(params.get('utm_medium')||'').toLowerCase();
    const aiHosts=['chatgpt.com','perplexity.ai','claude.ai','gemini.google.com','copilot.microsoft.com'];
    const socialHosts=['instagram.com','facebook.com','linkedin.com','tiktok.com','youtube.com','youtu.be'];
    let channel='referral';
    if(medium&&/(cpc|ppc|paid|ads?)/.test(medium))channel='paid';
    else if(aiHosts.some(host=>referrerHost===host||referrerHost.endsWith(`.${host}`)))channel='ai_referral';
    else if(/google|bing|duckduckgo/.test(referrerHost))channel='organic_search';
    else if(socialHosts.some(host=>referrerHost===host||referrerHost.endsWith(`.${host}`)))channel='social';
    else if(!referrerHost&&!source)channel='direct';
    else if(source&&/chatgpt|perplexity|claude|gemini|copilot/.test(source))channel='ai_referral';
    else if(source&&/instagram|facebook|linkedin|tiktok|youtube/.test(source))channel='social';
    return {
      utm_source:params.get('utm_source')||'',
      utm_medium:params.get('utm_medium')||'',
      utm_campaign:params.get('utm_campaign')||'',
      utm_content:params.get('utm_content')||'',
      utm_term:params.get('utm_term')||'',
      entry:params.get('entry')||'',
      channel
    };
  };

  const attribution=()=>{
    const current=currentAttribution();
    if(getConsent()!=='yes')return current;
    try{
      const saved=JSON.parse(sessionStorage.getItem(ATTRIBUTION_KEY)||'null');
      if(saved)return saved;
      sessionStorage.setItem(ATTRIBUTION_KEY,JSON.stringify(current));
    }catch(_){}
    return current;
  };

  let memorySession='';
  const analyticsSession=()=>{
    if(getConsent()!=='yes') return '';
    if(memorySession) return memorySession;
    try{
      memorySession=sessionStorage.getItem(SESSION_KEY)||'';
      if(!memorySession){memorySession=crypto.randomUUID?.()||`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;sessionStorage.setItem(SESSION_KEY,memorySession)}
    }catch(_){memorySession=`memory-${Math.random().toString(36).slice(2,10)}`}
    return memorySession;
  };

  const track=(event,properties={})=>{
    if(getConsent()!=='yes') return;
    const safeEvent=String(event).slice(0,80);
    const session=analyticsSession();
    const merged={...attribution(),...properties};
    const payload={
      event:safeEvent,session:session.slice(0,80),path:location.pathname.slice(0,300),
      referrer_host:(()=>{try{return document.referrer?new URL(document.referrer).hostname.slice(0,120):''}catch(_){return ''}})(),
      properties:Object.fromEntries(Object.entries(merged).slice(0,20).map(([k,v])=>[String(k).slice(0,60),String(v??'').slice(0,200)]))
    };
    try{fetch('/api/conversion-event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),keepalive:true}).catch(()=>{})}catch(_){}
    try{window.JJClarity?.event(safeEvent)}catch(_){}
  };
  window.JJTrack=track;

  const setupBehavior=()=>{
    if(getConsent()!=='yes'||doc.documentElement.dataset.jjBehaviorTracking)return;
    doc.documentElement.dataset.jjBehaviorTracking='true';
    track('page_view',{title:doc.title.slice(0,120)});

    const fired=new Set();
    const depthCheck=()=>{
      const max=Math.max(doc.documentElement.scrollHeight-doc.documentElement.clientHeight,1);
      const ratio=Math.min(1,Math.max(0,scrollY/max));
      [25,50,75,90].forEach(depth=>{
        if(ratio>=depth/100&&!fired.has(depth)){fired.add(depth);track(`scroll_${depth}`,{depth})}
      });
    };
    addEventListener('scroll',depthCheck,{passive:true});
    depthCheck();
    setTimeout(()=>track('engaged_30s'),30000);
    setTimeout(()=>track('engaged_60s'),60000);
  };

  const privacy=()=>{
    if(getConsent()) return;
    const panel=doc.createElement('aside');
    panel.className='jj-privacy';
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-label','Datenschutzeinstellungen');
    panel.innerHTML='<strong>Datenschutz-Einstellungen</strong><p>Notwendige Funktionen laufen ohne Tracking. Optionale Nutzungsstatistiken inklusive Microsoft Clarity helfen uns nur nach Ihrer Zustimmung, Inhalte und Nutzerführung zu verbessern.</p><div class="jj-privacy-actions"><button type="button" data-consent="no">Nur notwendig</button><button class="primary" type="button" data-consent="yes">Statistik erlauben</button></div><a href="datenschutz.html">Mehr zum Datenschutz</a>';
    doc.body.appendChild(panel);
    requestAnimationFrame(()=>panel.classList.add('visible'));
    panel.addEventListener('click',event=>{
      const button=event.target.closest('[data-consent]');if(!button)return;
      const choice=button.dataset.consent==='yes'?'yes':'no';setConsent(choice);
      if(choice==='yes'){
        startClarity();
        track('analytics_consent',{source:'privacy_panel'});
        setupBehavior();
        doc.dispatchEvent(new CustomEvent('jj:analytics-consent',{detail:{allowed:true}}));
      }else{
        doc.dispatchEvent(new CustomEvent('jj:analytics-consent',{detail:{allowed:false}}));
      }
      panel.classList.remove('visible');setTimeout(()=>panel.remove(),300);
    });
  };

  const buildAnalysisUrl=()=>{
    const url=new URL('analyse.html',location.href);
    ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(key=>{const value=new URLSearchParams(location.search).get(key);if(value)url.searchParams.set(key,value)});
    url.searchParams.set('entry','website');
    return `${url.pathname.split('/').pop()}${url.search}`;
  };

  const microTrust=()=>{
    const actions=doc.querySelector('.hero-actions');
    if(!actions||doc.querySelector('.jj-hero-microtrust'))return;
    actions.insertAdjacentHTML('afterend','<div class="jj-hero-microtrust"><span>✓ persönlich geprüft</span><i aria-hidden="true"></i><span>kostenlos &amp; unverbindlich</span><i aria-hidden="true"></i><span>Instagram · Facebook · YouTube · LinkedIn</span></div>');
  };

  const stickyConversion=()=>{
    if(doc.querySelector('.jj-sticky-convert'))return;
    const allowed=Boolean(doc.querySelector('.hero-premium'))||/(services|work|reisebranche|studio)(\.html)?\/?$/.test(path);
    if(!allowed)return;
    const dock=doc.createElement('aside');
    dock.className='jj-sticky-convert';dock.setAttribute('aria-label','Kostenlose Social-Media-Analyse');
    dock.innerHTML=`<div class="jj-sticky-copy"><span class="jj-sticky-dot" aria-hidden="true"></span><div><strong>Social Media persönlich analysieren lassen</strong><span>Persönlich geprüft · kostenlos · unverbindlich</span></div></div><a class="btn" data-track="sticky_audit" href="${buildAnalysisUrl()}">Analyse anfragen <span aria-hidden="true">↗</span></a>`;
    doc.body.appendChild(dock);
    const triggerAt=Math.min(620,Math.max(280,innerHeight*.7));
    let focusObscured=false;
    const wouldObscure=target=>{
      if(!target||!dock.classList.contains('visible'))return false;
      const targetBox=target.getBoundingClientRect();const dockBox=dock.getBoundingClientRect();
      return targetBox.bottom>dockBox.top-8&&targetBox.top<dockBox.bottom+8;
    };
    const toggle=()=>{
      const footer=doc.querySelector('footer');const nearFooter=footer&&footer.getBoundingClientRect().top<innerHeight*.92;
      const shouldShow=scrollY>triggerAt&&!nearFooter&&!focusObscured;
      dock.classList.toggle('visible',shouldShow);
    };
    doc.addEventListener('focusin',event=>{focusObscured=wouldObscure(event.target);toggle()});
    doc.addEventListener('focusout',()=>{focusObscured=false;requestAnimationFrame(toggle)});
    addEventListener('scroll',toggle,{passive:true});addEventListener('resize',toggle);toggle();
  };

  doc.addEventListener('click',event=>{
    const explicit=event.target.closest('[data-track]');
    if(explicit){
      track(explicit.dataset.track,{href:explicit.getAttribute('href')||'',label:(explicit.textContent||'').trim().slice(0,100)});
      return;
    }
    const target=event.target.closest('a,button');
    if(!target)return;
    const href=target.getAttribute('href')||'';
    const label=(target.textContent||'').trim().replace(/\s+/g,' ').slice(0,100);
    const highValue=target.matches('.btn,.text-link,.funnel-submit,.success-action')||/^mailto:|^tel:/i.test(href)||/calendly|analyse|contact/i.test(href);
    if(highValue)track('cta_click',{href,label});
  });

  if(getConsent()==='yes'){startClarity();setupBehavior()}
  microTrust();
  stickyConversion();
  privacy();
})();
