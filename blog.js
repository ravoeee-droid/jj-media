(() => {
  const doc=document;
  doc.documentElement.classList.add('js');
  const inArticle=location.pathname.includes('/blog/');
  const prefix=inArticle?'../':'';
  const assetVersion='20260905-6';

  const loadScript=(src)=>{
    if([...doc.scripts].some(script=>(script.getAttribute('src')||'').includes(src.split('?')[0])))return;
    const script=doc.createElement('script');script.src=`${prefix}${src}`;doc.head.appendChild(script);
  };
  loadScript('brand-runtime.js?v=20260905-1');

  if(!doc.querySelector('link[data-jj-quality-css]')){
    const qualityCss=doc.createElement('link');qualityCss.rel='stylesheet';qualityCss.dataset.jjQualityCss='true';qualityCss.href=`${prefix}site-quality.css?v=20260905-6`;doc.head.appendChild(qualityCss);
  }
  if(!doc.documentElement.dataset.jjQualityLoaded){
    const qualityScript=doc.createElement('script');qualityScript.src=`${prefix}site-quality.js?v=20260905-6`;doc.head.appendChild(qualityScript);
  }
  if(!doc.querySelector('link[data-blog-final]')){
    const style=doc.createElement('link');style.rel='stylesheet';style.dataset.blogFinal='true';style.href=`${prefix}blog-final.css?v=${assetVersion}`;doc.head.appendChild(style);
  }
  if(!doc.querySelector('link[data-blog-premium]')){
    const premium=doc.createElement('link');premium.rel='stylesheet';premium.dataset.blogPremium='true';premium.href=`${prefix}blog-premium.css?v=${assetVersion}`;doc.head.appendChild(premium);
  }
  if(!doc.querySelector('link[data-jj-ui-hotfix]')){
    const hotfix=doc.createElement('link');hotfix.rel='stylesheet';hotfix.dataset.jjUiHotfix='true';hotfix.href=`${prefix}ui-hotfix-20260902.css?v=20260905-6`;doc.head.appendChild(hotfix);
  }

  const fallbacks={
    'linkedin-authenticity-automation-2026.webp':'linkedin-performance-proof.jpg',
    'linkedin-performance-proof.jpg':'social-media-strategie-2026.webp',
    'instagram-seo-search-console-2026.webp':'social-media-strategie-2026.webp',
    'instagram-vs-facebook-eu-2026.webp':'social-media-strategie-2026.webp',
    'youtube-shopping-amazon-2026.webp':'social-media-strategie-2026.webp',
    'youtube-shorts-vs-reels-2026.jpg':'social-media-strategie-2026.webp'
  };

  doc.querySelectorAll('img').forEach(img=>{
    const raw=img.getAttribute('src')||'';
    if(!raw.includes('assets/blog/'))return;
    const name=raw.split('?')[0].split('/').pop();
    if(name==='linkedin-authenticity-automation-2026.webp'){
      img.src=`${prefix}assets/blog/linkedin-performance-proof.jpg?v=${assetVersion}`;
      img.alt='LinkedIn-Performance-Auswertung als realer Social-Media-Proof';
    }else if(!raw.includes('?')){
      img.src=`${raw}?v=${assetVersion}`;
    }
    img.addEventListener('error',()=>{
      if(img.dataset.jjFallback==='1')return;
      img.dataset.jjFallback='1';
      const current=(img.getAttribute('src')||'').split('?')[0].split('/').pop();
      const fallback=fallbacks[current]||'social-media-strategie-2026.webp';
      img.src=`${prefix}assets/blog/${fallback}?v=${assetVersion}`;
    },{once:true});
  });

  const footerLinks=doc.querySelector('.blog-footer span:last-child');
  if(footerLinks&&![...footerLinks.querySelectorAll('a')].some(a=>(a.getAttribute('href')||'').includes('barrierefreiheit'))){
    const link=doc.createElement('a');link.href=`${prefix}barrierefreiheit.html`;link.textContent='Barrierefreiheit';footerLinks.appendChild(link);
  }

  const cards=[...doc.querySelectorAll('[data-blog-card]')];
  const filters=[...doc.querySelectorAll('[data-blog-filter]')];
  const search=doc.querySelector('[data-blog-search]');
  const empty=doc.querySelector('[data-blog-empty]');
  let active='all';
  const normalise=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const apply=()=>{
    const query=normalise(search?.value.trim());let visible=0;
    cards.forEach(card=>{
      const types=normalise(card.dataset.type).split(/\s+/);const haystack=normalise(card.textContent+' '+(card.dataset.keywords||''));
      const show=(active==='all'||types.includes(active))&&(!query||haystack.includes(query));card.hidden=!show;if(show)visible+=1;
    });
    if(empty)empty.style.display=visible?'none':'block';
  };
  filters.forEach(button=>button.addEventListener('click',()=>{filters.forEach(item=>item.classList.toggle('active',item===button));active=button.dataset.blogFilter||'all';apply()}));
  search?.addEventListener('input',apply);

  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealTargets=[...doc.querySelectorAll('.blog-hero-grid>* ,.blog-section-head>* ,.blog-card,.blog-principles,.blog-cta,.article-content>section,.article-cover,.article-toc')];
  revealTargets.forEach((el,index)=>{el.classList.add('reveal');el.style.setProperty('--reveal-delay',`${Math.min(index%4,3)*40}ms`)});
  if('IntersectionObserver' in window&&!reduceMotion){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){requestAnimationFrame(()=>entry.target.classList.add('visible'));observer.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -5%'});
    revealTargets.forEach(el=>observer.observe(el));
  }else revealTargets.forEach(el=>el.classList.add('visible'));

  doc.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
    const id=link.getAttribute('href');if(!id||id==='#')return;const target=doc.querySelector(id);if(!target)return;
    event.preventDefault();target.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});history.replaceState(null,'',id);
  }));

  const progress=doc.querySelector('[data-reading-progress]');
  if(progress){
    let ticking=false;
    const update=()=>{const max=Math.max(1,doc.documentElement.scrollHeight-innerHeight);progress.style.width=`${Math.min(100,Math.max(0,scrollY/max*100))}%`;ticking=false};
    addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(update);ticking=true}},{passive:true});update();
  }

  doc.querySelectorAll('[data-copy-link]').forEach(button=>button.addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(location.href);const old=button.textContent;button.textContent='Link kopiert ✓';setTimeout(()=>button.textContent=old,1800)}catch(_){prompt('Link kopieren:',location.href)}
  }));
})();