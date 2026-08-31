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
  let activeRun=0;

  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const formatNumber=value=>{
    if(value==null||!Number.isFinite(Number(value))) return '—';
    const n=Number(value);
    if(n>=1000000) return `${(n/1000000).toLocaleString('de-DE',{maximumFractionDigits:1})} Mio.`;
    if(n>=1000) return `${(n/1000).toLocaleString('de-DE',{maximumFractionDigits:1})} Tsd.`;
    return n.toLocaleString('de-DE');
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
    if(icon) icon.textContent={Instagram:'◎',TikTok:'♪',LinkedIn:'in',Facebook:'f',Threads:'@'}[platform]||'↗';
    errorEl.textContent='';
  });

  const animateScanner=runId=>{
    const states=[
      [14,'Profil & Plattform werden verifiziert …',0],
      [32,'Mehrere öffentliche Datenquellen werden abgeglichen …',1],
      [54,'Aktuelle Inhalte werden einzeln gelesen …',2],
      [76,'Hooks, CTAs, Proof und Aktivität werden bewertet …',3],
      [92,'Evidence und Prioritäten werden zusammengesetzt …',3]
    ];
    let index=0;
    const apply=()=>{
      if(runId!==activeRun) return;
      const [percent,title,active]=states[index];
      scanTitle.textContent=title;
      scanPercent.textContent=`${percent}%`;
      scanTrack.style.width=`${percent}%`;
      scanSteps.forEach((step,i)=>step.classList.toggle('active',i<=active));
      if(index<states.length-1){index+=1;setTimeout(apply,520);}
    };
    apply();
  };

  const setComplete=()=>{
    scanTitle.textContent='Audit abgeschlossen.';
    scanPercent.textContent='100%';
    scanTrack.style.width='100%';
    scanSteps.forEach(step=>step.classList.add('active'));
  };

  const scoreCopy=result=>{
    const score=result.score;
    if(score==null){
      if(result.auditLevel==='content-only') return ['Content-Audit belastbar. Gesamt-Score bewusst aus.',`${result.analyzedPosts||0} aktuelle Inhalte wurden analysiert. Bio/Positionierung waren öffentlich nicht zuverlässig genug – deshalb bewerten wir nicht künstlich den gesamten Account.`];
      if(result.auditLevel==='profile-only') return ['Profil-Audit belastbar. Content-Score bewusst aus.','Positionierung und Conversion-Signale konnten geprüft werden, aktuelle Inhalte aber nicht ausreichend. Ein Gesamt-Score wäre deshalb irreführend.'];
      return ['Teil-Audit statt Fantasiescore.',`Wir konnten ${result.dataCompleteness||0}% der vorgesehenen öffentlichen Signale sicher prüfen. Einzelwerte bleiben sichtbar; ein Gesamtwert erscheint erst bei ausreichender Profil- und Content-Basis.`];
    }
    if(score>=82) return ['Sehr starke öffentliche Basis.','Profilstrategie und aktueller Content greifen bereits überdurchschnittlich sauber ineinander. Der Hebel liegt jetzt in Skalierung und Gewinner-Formaten.'];
    if(score>=68) return ['Gute Basis – aber noch nicht ausgereizt.','Profil, Content und Conversion funktionieren grundsätzlich. Einzelne Schwächen zeigen klar, wo aus Aufmerksamkeit häufiger Nachfrage werden kann.'];
    if(score>=52) return ['Mehrere klare Wachstumshebel.','Der Auftritt ist grundsätzlich verständlich, lässt aber bei Positionierung, Proof, Content oder Conversion sichtbar Potenzial liegen.'];
    return ['Der Auftritt bremst aktuell Potenzial.','Mehr Klarheit, stärkerer Proof und bewusstere Content-Hooks würden den größten Unterschied machen.'];
  };

  const renderCoverage=result=>{
    const wrap=document.querySelector('[data-coverage]');
    if(!wrap) return;
    const value=Math.max(0,Math.min(100,Number(result.dataCompleteness)||0));
    wrap.querySelector('[data-coverage-value]').textContent=`${value}%`;
    wrap.querySelector('[data-coverage-track]').style.width=`${value}%`;
    const level={full:'Vollständiger öffentlicher Audit',partial:'Teil-Audit','content-only':'Content-Teil-Audit','profile-only':'Profil-Teil-Audit',limited:'Begrenzter öffentlicher Audit'}[result.auditLevel]||'Öffentlicher Audit';
    wrap.querySelector('[data-coverage-copy]').textContent=result.analyzedPosts>=3
      ? `${level} · ${result.analyzedPosts} aktuelle Inhalte konkret analysiert.`
      : `${level} · aktuelle Content-Daten waren nicht ausreichend öffentlich verfügbar.`;
  };

  const renderMetrics=result=>{
    const metricEntries=[['Follower',result.metrics?.followers],['Following',result.metrics?.following],['Beiträge',result.metrics?.posts],['Likes gesamt',result.metrics?.likes]].filter(([,value])=>value!=null);
    const metrics=document.querySelector('[data-metrics]');
    metrics.innerHTML=metricEntries.length
      ? metricEntries.map(([label,value])=>`<div class="audit-metric"><strong>${formatNumber(value)}</strong><span>${label}</span></div>`).join('')
      : '<div class="audit-metric audit-metric-muted"><strong>Public</strong><span>keine belastbare Vanity-Metric verfügbar</span></div>';
  };

  const renderCategories=result=>{
    const categories=document.querySelector('[data-categories]');
    categories.innerHTML=(result.categories||[]).map(item=>{
      const available=item.available&&item.score!=null;
      return `<article class="audit-category ${available?'':'is-unavailable'}">
        <div class="audit-category-top"><div><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.evidence||'')}</small></div><span>${available?`${item.score}/100`:'nicht bewertet'}</span></div>
        <div class="audit-category-track"><i style="width:${available?item.score:0}%"></i></div>
      </article>`;
    }).join('');
  };

  const renderEvidence=result=>{
    const findings=document.querySelector('[data-findings]');
    findings.innerHTML=(result.evidence||[]).map(item=>`<article class="audit-evidence ${escapeHtml(item.tone||'neutral')}"><span></span><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.text)}</p></div></article>`).join('')||'<article class="audit-evidence warning"><span></span><div><strong>Datengrenze</strong><p>Für dieses Profil konnten nur wenige belastbare öffentliche Signale gelesen werden.</p></div></article>';
  };

  const renderRecommendations=result=>{
    const recs=document.querySelector('[data-recommendations]');
    recs.innerHTML=(result.recommendations||[]).map((item,index)=>`<article class="audit-recommendation-v2">
      <div class="audit-rec-index">${String(index+1).padStart(2,'0')}</div>
      <div class="audit-rec-main"><div class="audit-rec-tags"><span>${escapeHtml(item.priority||'Priorität')}</span><span>${escapeHtml(item.impact||'Hebel')}</span></div><h4>${escapeHtml(item.title||'Optimierung')}</h4><p class="audit-rec-because">Warum: ${escapeHtml(item.because||'')}</p><p class="audit-rec-action"><strong>Konkreter Schritt:</strong> ${escapeHtml(item.action||'')}</p></div>
    </article>`).join('');
  };

  const renderContent=result=>{
    const section=document.querySelector('[data-content-section]');
    const grid=document.querySelector('[data-content-samples]');
    const items=result.recentContent||[];
    if(!section||!grid) return;
    if(!items.length){section.hidden=true;return;}
    section.hidden=false;
    grid.innerHTML=items.slice(0,6).map((item,index)=>`<article class="audit-content-card">
      <div class="audit-content-head"><span>${escapeHtml(item.type||'Content')} ${String(index+1).padStart(2,'0')}</span><strong>${item.performanceLabel?escapeHtml(item.performanceLabel):(item.hookScore!=null?`Hook ${item.hookScore}/100`:'Analysiert')}</strong></div>
      <blockquote>${item.hook?`„${escapeHtml(item.hook)}“`:'Keine belastbare erste Caption-Zeile auslesbar.'}</blockquote>
      <div class="audit-content-signals"><span class="${item.hasCta?'good':'weak'}">${item.hasCta?'✓':'–'} CTA</span><span class="${item.specific?'good':'weak'}">${item.specific?'✓':'–'} konkrete Aussage</span>${item.hookScore!=null?`<span>Hook ${item.hookScore}/100</span>`:''}${item.daysAgo!=null?`<span>${item.daysAgo} Tage alt</span>`:''}</div>
      <div class="audit-content-metrics">${item.views!=null?`<span>${formatNumber(item.views)} Views</span>`:''}${item.likes!=null?`<span>${formatNumber(item.likes)} Likes</span>`:''}${item.comments!=null?`<span>${formatNumber(item.comments)} Kommentare</span>`:''}</div>
    </article>`).join('');
  };

  const renderMissing=result=>{
    const scoreCard=document.querySelector('.audit-score-card');
    if(!scoreCard) return;
    scoreCard.querySelector('.audit-missing-signals')?.remove();
    const missing=result.missingSignals||[];
    const partials=[];
    if(result.profileScore!=null) partials.push(`Profil ${result.profileScore}/100`);
    if(result.contentScore!=null) partials.push(`Content ${result.contentScore}/100`);
    if(!missing.length&&!partials.length) return;
    const box=document.createElement('div');
    box.className='audit-missing-signals';
    box.innerHTML=`${partials.length?`<div class="audit-partial-scores">${partials.map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div>`:''}${missing.length?`<small>Für einen vollständigen Gesamt-Score fehlen öffentlich:</small><div>${missing.map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div>`:''}`;
    scoreCard.appendChild(box);
  };

  const render=result=>{
    document.querySelector('[data-platform]').textContent=result.platform||'Social Media';
    document.querySelector('[data-profile-title]').textContent=result.title||result.handle||'Profil';
    const profileLink=document.querySelector('[data-profile-link]');profileLink.href=result.profileUrl||'#';
    const imageWrap=document.querySelector('[data-profile-image]');imageWrap.innerHTML='';
    if(result.image){const img=document.createElement('img');img.src=result.image;img.alt=`Profilbild ${result.title||result.handle||''}`.trim();img.referrerPolicy='no-referrer';img.onerror=()=>{imageWrap.innerHTML='<span>↗</span>';};imageWrap.appendChild(img);}else imageWrap.innerHTML='<span>↗</span>';

    const description=document.querySelector('[data-description]');
    if(result.description){description.textContent=result.description;description.hidden=false;}else{description.hidden=true;description.textContent='';}
    const category=document.querySelector('[data-category]');if(category){category.textContent=result.category||'';category.hidden=!result.category;}

    renderMetrics(result);renderCoverage(result);renderCategories(result);renderEvidence(result);renderRecommendations(result);renderContent(result);renderMissing(result);

    const ring=document.querySelector('[data-score-ring]');
    ring.style.setProperty('--score',Number.isFinite(result.score)?result.score:0);
    ring.classList.toggle('is-limited',!Number.isFinite(result.score));
    document.querySelector('[data-score]').textContent=Number.isFinite(result.score)?`${result.score}/100`:(result.profileScore!=null||result.contentScore!=null?'TEIL':'—');
    const [title,copy]=scoreCopy(result);document.querySelector('[data-score-title]').textContent=title.trim();document.querySelector('[data-score-copy]').textContent=copy;
    const level={full:'Gesamt-Audit',partial:'Teil-Audit','content-only':'Content-Teil-Audit','profile-only':'Profil-Teil-Audit',limited:'Begrenzte Datenbasis'}[result.auditLevel]||'Öffentliche Datenbasis';
    document.querySelector('[data-confidence]').textContent=`${level} · ${result.dataCompleteness||0}% Datenabdeckung`;
    document.querySelector('[data-note]').textContent=result.note||'';

    const personal=document.querySelector('[data-personal-analysis]');
    const target=new URL('analyse.html',location.href);target.searchParams.set('entry','social-audit-v3');if(result.profileUrl) target.searchParams.set('profile',result.profileUrl);if(result.auditLevel)target.searchParams.set('audit',result.auditLevel);personal.href=`${target.pathname.split('/').pop()}${target.search}`;
    try{
      const existing=JSON.parse(sessionStorage.getItem('jj-analysis-draft')||'{}');existing.profile=result.profileUrl||input.value.trim();sessionStorage.setItem('jj-analysis-draft',JSON.stringify(existing));sessionStorage.setItem('jj-social-audit-last',JSON.stringify({version:3,profile:existing.profile,platform:result.platform,score:result.score,profileScore:result.profileScore,contentScore:result.contentScore,auditLevel:result.auditLevel,confidence:result.confidence,completeness:result.dataCompleteness,analyzedPosts:result.analyzedPosts}));
    }catch(_){}

    scanner.hidden=true;results.hidden=false;
    requestAnimationFrame(()=>results.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}));
    window.JJTrack?.('live_social_audit_v3_result',{platform:result.platform||'',mode:result.mode||'',audit_level:result.auditLevel||'',score:result.score??'none',confidence:result.confidence||'',completeness:result.dataCompleteness||0,analyzed_posts:result.analyzedPosts||0});
  };

  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const url=input.value.trim();
    if(url.length<3){errorEl.textContent='Bitte gib einen Social-Media-Link oder @Nutzernamen ein.';input.focus();return;}
    const runId=++activeRun;const button=form.querySelector('button[type="submit"]');button.disabled=true;button.textContent='Audit läuft …';errorEl.textContent='';results.hidden=true;scanner.hidden=false;animateScanner(runId);scanner.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});window.JJTrack?.('live_social_audit_v3_start',{platform:platformGuess(url)});
    try{
      const response=await fetch('/api/social-audit-v3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url})});
      const result=await response.json().catch(()=>({}));
      if(!response.ok||result.version!==3) throw new Error(result.error||'Der Audit konnte gerade nicht vollständig geladen werden.');
      if(runId!==activeRun) return;setComplete();setTimeout(()=>{if(runId===activeRun) render(result);},220);
    }catch(error){
      if(runId!==activeRun) return;scanner.hidden=true;errorEl.textContent=error?.message||'Der Link konnte gerade nicht geprüft werden.';window.JJTrack?.('live_social_audit_v3_error',{reason:error?.message||'unknown'});input.focus();
    }finally{if(runId===activeRun){button.disabled=false;button.innerHTML='Profil analysieren <span>↗</span>';}}
  });

  document.querySelector('[data-new-audit]')?.addEventListener('click',()=>{results.hidden=true;input.value='';input.focus();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});
  const prefill=params.get('profile')||params.get('url')||'';
  if(prefill){input.value=prefill;input.dispatchEvent(new Event('input'));if(params.get('auto')==='1') requestAnimationFrame(()=>form.requestSubmit());}
})();
