(() => {
  const form=document.getElementById('social-audit-form');
  if(!form) return;
  const input=document.getElementById('audit-url');
  const errorEl=document.getElementById('audit-error');
  const scanner=document.getElementById('audit-scanner');
  const results=document.getElementById('audit-results');
  const scanTitle=document.querySelector('[data-scan-title]');
  const scanPercent=document.querySelector('[data-scan-percent]');
  const scanTrack=document.querySelector('[data-scan-track]');
  const scanSteps=[...document.querySelectorAll('[data-scan-step]')];
  const params=new URLSearchParams(location.search);
  const ANALYTICS_KEY='jj-analytics-consent-v1';
  const SESSION_KEY='jj-growth-session-v1';
  let activeRun=0;
  let lastProfile='';

  const getSession=()=>{
    try{
      let id=sessionStorage.getItem(SESSION_KEY);
      if(!id){id=crypto.randomUUID?.()||`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;sessionStorage.setItem(SESSION_KEY,id);}
      return id;
    }catch(_){return `ephemeral-${Math.random().toString(36).slice(2,9)}`;}
  };
  const sessionId=getSession();
  const analyticsAllowed=()=>{try{return localStorage.getItem(ANALYTICS_KEY)==='yes';}catch(_){return false;}};
  const track=(event,properties={})=>{
    if(!analyticsAllowed()) return;
    fetch('/api/conversion-event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event:String(event).slice(0,80),session:sessionId,path:location.pathname,referrer_host:(()=>{try{return document.referrer?new URL(document.referrer).hostname:'';}catch(_){return '';}})(),properties}),keepalive:true}).catch(()=>{});
  };

  const platformGuess=value=>{
    const v=String(value||'').toLowerCase();
    if(v.includes('instagram')||v.startsWith('@')) return 'Instagram';
    if(v.includes('tiktok')) return 'TikTok';
    if(v.includes('linkedin')) return 'LinkedIn';
    if(v.includes('facebook')) return 'Facebook';
    if(v.includes('threads')) return 'Threads';
    return 'Social Media';
  };

  input.addEventListener('input',()=>{
    const platform=platformGuess(input.value);
    const icon=document.querySelector('[data-platform-icon]');
    icon.textContent={Instagram:'◎',TikTok:'♪',LinkedIn:'in',Facebook:'f',Threads:'@'}[platform]||'↗';
    errorEl.textContent='';
  });

  const formatNumber=value=>{
    if(value==null||!Number.isFinite(Number(value))) return '—';
    const n=Number(value);
    if(n>=1000000) return `${(n/1000000).toLocaleString('de-DE',{maximumFractionDigits:1})} Mio.`;
    if(n>=1000) return `${(n/1000).toLocaleString('de-DE',{maximumFractionDigits:1})} Tsd.`;
    return n.toLocaleString('de-DE');
  };

  const animateScanner=runId=>{
    const states=[
      [18,'Plattform und Profil werden erkannt …',0],
      [42,'Öffentliche Signale werden gelesen …',1],
      [68,'Profil-Readiness wird eingeordnet …',2],
      [88,'Konkrete Hebel werden priorisiert …',3]
    ];
    let index=0;
    const apply=()=>{
      if(runId!==activeRun) return;
      const [percent,title,active]=states[index];
      scanTitle.textContent=title;
      scanPercent.textContent=`${percent}%`;
      scanTrack.style.width=`${percent}%`;
      scanSteps.forEach((step,i)=>step.classList.toggle('active',i<=active));
      if(index<states.length-1){index+=1;setTimeout(apply,620);}
    };
    apply();
  };

  const setComplete=()=>{
    scanTitle.textContent='Analyse abgeschlossen.';
    scanPercent.textContent='100%';
    scanTrack.style.width='100%';
    scanSteps.forEach(step=>step.classList.add('active'));
  };

  const scoreCopy=score=>{
    if(score==null) return ['Kein künstlicher Score.','Die Plattform liefert aktuell nicht genug belastbare öffentliche Signale.'];
    if(score>=82) return ['Sehr starke Basis.','Das Profil wirkt in den öffentlich sichtbaren Grundlagen bereits gut vorbereitet. Der nächste Hebel liegt in Content-Qualität und Conversion.'];
    if(score>=68) return ['Gute Basis mit Luft nach oben.','Mehr Klarheit, Proof und ein stärkerer nächster Schritt können aus Aufmerksamkeit häufiger echte Nachfrage machen.'];
    if(score>=52) return ['Deutliches Optimierungspotenzial.','Die öffentlich sichtbaren Signale zeigen mehrere Hebel bei Profil-Klarheit, Positionierung oder Conversion.'];
    return ['Hier bleibt gerade Potenzial liegen.','Die öffentlich sichtbare Basis kann wesentlich klarer zeigen, für wen das Profil relevant ist und was als Nächstes passieren soll.'];
  };

  const render=result=>{
    lastProfile=result.profileUrl||input.value.trim();
    document.querySelector('[data-platform]').textContent=result.platform||'Social Media';
    document.querySelector('[data-profile-title]').textContent=result.title||(result.handle?`@${result.handle}`:'Profil');
    const profileLink=document.querySelector('[data-profile-link]');
    profileLink.href=result.profileUrl||'#';
    const imageWrap=document.querySelector('[data-profile-image]');
    imageWrap.innerHTML='';
    if(result.image){
      const img=document.createElement('img');
      img.src=result.image;
      img.alt=`Profilbild ${result.title||result.handle||''}`.trim();
      img.referrerPolicy='no-referrer';
      img.onerror=()=>{imageWrap.innerHTML='<span>↗</span>';};
      imageWrap.appendChild(img);
    }else imageWrap.innerHTML='<span>↗</span>';

    const description=document.querySelector('[data-description]');
    if(result.description){description.textContent=result.description;description.hidden=false;}else{description.textContent='';description.hidden=true;}

    const metricEntries=[['Follower',result.metrics?.followers],['Following',result.metrics?.following],['Content',result.metrics?.posts],['Likes',result.metrics?.likes]].filter(([,value])=>value!=null);
    const metrics=document.querySelector('[data-metrics]');
    metrics.innerHTML=metricEntries.length?metricEntries.map(([label,value])=>`<div class="audit-metric"><strong>${formatNumber(value)}</strong><span>${label}</span></div>`).join(''):'<div class="audit-metric"><strong>Public</strong><span>Datenbasis</span></div>';
    document.querySelector('[data-note]').textContent=result.note||'';
    document.querySelector('[data-confidence]').textContent=`Vertrauensgrad: ${result.confidence||'begrenzt'}`;

    const ring=document.querySelector('[data-score-ring]');
    ring.style.setProperty('--score',Number.isFinite(result.score)?result.score:0);
    document.querySelector('[data-score]').textContent=Number.isFinite(result.score)?`${result.score}/100`:'—';
    const [title,copy]=scoreCopy(result.score);
    document.querySelector('[data-score-title]').textContent=title;
    document.querySelector('[data-score-copy]').textContent=copy;

    const categories=document.querySelector('[data-categories]');
    const categoryData=(result.categories||[]);
    categories.innerHTML=categoryData.length?categoryData.map(item=>`<div class="audit-category"><div class="audit-category-top"><strong>${item.label}</strong><span>${item.available&&item.score!=null?`${item.score}/100`:'—'}</span></div><div class="audit-category-track"><i style="width:${item.available&&item.score!=null?item.score:0}%"></i></div><small>${item.available?'öffentlich bewertbar':'öffentlich nicht belastbar verfügbar'}</small></div>`).join(''):'<div class="audit-category"><div class="audit-category-top"><strong>Datengrundlage</strong><span>—</span></div><div class="audit-category-track"><i style="width:0%"></i></div><small>Plattform schützt Profildaten aktuell vor automatischem Zugriff.</small></div>';

    const findings=document.querySelector('[data-findings]');
    findings.innerHTML=(result.findings||[]).map(text=>`<div class="audit-finding"><span>✓</span><div>${escapeHtml(text)}</div></div>`).join('')||'<div class="audit-finding"><span>i</span><div>Für diesen Link konnten keine zusätzlichen belastbaren öffentlichen Signale gelesen werden.</div></div>';

    const recs=document.querySelector('[data-recommendations]');
    recs.innerHTML=(result.recommendations||[]).map((item,index)=>`<div class="audit-recommendation"><span>${String(index+1).padStart(2,'0')}</span><div><strong>${escapeHtml(item.title||'Optimierung')}</strong><p>${escapeHtml(item.text||'')}</p></div></div>`).join('');

    const personal=document.querySelector('[data-personal-analysis]');
    personal.href='analyse.html?entry=live-social-audit';
    try{
      const existing=JSON.parse(sessionStorage.getItem('jj-analysis-draft')||'{}');
      existing.profile=lastProfile;
      sessionStorage.setItem('jj-analysis-draft',JSON.stringify(existing));
      sessionStorage.setItem('jj-social-audit-last',JSON.stringify({profile:lastProfile,platform:result.platform||'',score:result.score,confidence:result.confidence||''}));
    }catch(_){}

    scanner.hidden=true;
    results.hidden=false;
    requestAnimationFrame(()=>results.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}));
    track('live_social_audit_result',{platform:result.platform||'',mode:result.mode||'',score:result.score??'none',confidence:result.confidence||''});
  };

  function escapeHtml(value=''){
    return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  }

  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const url=input.value.trim();
    if(url.length<3){errorEl.textContent='Bitte gib einen Social-Media-Link oder @Nutzernamen ein.';input.focus();return;}
    const runId=++activeRun;
    const button=form.querySelector('button[type="submit"]');
    button.disabled=true;
    errorEl.textContent='';
    results.hidden=true;
    scanner.hidden=false;
    scanner.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    animateScanner(runId);
    track('live_social_audit_start',{platform:platformGuess(url)});
    try{
      const response=await fetch('/api/social-audit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url})});
      const result=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(result.error||'Der Link konnte nicht geprüft werden.');
      if(runId!==activeRun) return;
      setComplete();
      setTimeout(()=>{if(runId===activeRun) render(result);},320);
    }catch(error){
      if(runId!==activeRun) return;
      scanner.hidden=true;
      errorEl.textContent=error?.message||'Der Link konnte gerade nicht geprüft werden.';
      track('live_social_audit_error',{reason:error?.message||'unknown'});
      input.focus();
    }finally{if(runId===activeRun) button.disabled=false;}
  });

  document.querySelector('[data-new-audit]')?.addEventListener('click',()=>{
    results.hidden=true;
    input.value='';
    input.focus();
    scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    track('live_social_audit_restart');
  });

  const prefill=params.get('profile')||params.get('url')||'';
  if(prefill){
    input.value=prefill;
    input.dispatchEvent(new Event('input'));
    if(params.get('auto')==='1') requestAnimationFrame(()=>form.requestSubmit());
  }
  track('live_social_audit_open',{prefilled:Boolean(prefill)});
})();
