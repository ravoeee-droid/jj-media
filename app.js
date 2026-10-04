(() => {
  const load=(src,next)=>{
    const script=document.createElement('script');
    script.src=src;
    script.onload=()=>next?.();
    script.onerror=()=>next?.();
    document.head.appendChild(script);
  };

  if(!document.querySelector('link[data-jj-ui-hotfix]')){
    const hotfix=document.createElement('link');
    hotfix.rel='stylesheet';
    hotfix.href='ui-hotfix-20260902.css?v=20260905-6';
    hotfix.dataset.jjUiHotfix='true';
    document.head.appendChild(hotfix);
  }

  const hardenStudioPoster=()=>{
    const frame=document.querySelector('.video-card .video-frame');
    if(frame)frame.classList.add('visible');
    const img=document.querySelector('.video-card .video-poster img');
    if(!img)return;
    const revealFallback=()=>{img.style.display='none';img.setAttribute('aria-hidden','true')};
    img.addEventListener('error',revealFallback,{once:true});
    if(img.complete&&!img.naturalWidth)revealFallback();
  };
  hardenStudioPoster();

  const isLegal=/\/(datenschutz|impressum|agb|barrierefreiheit)(\.html)?\/?$/i.test(location.pathname);
  const bootGrowth=()=>{
    load('portfolio-motion.js?v=20261004-2');
    if(isLegal)return;
    load('growth-layer-v2.js?v=20261004-ugc22',()=>load('privacy-controls.js?v=20260918-1',()=>load('social-audit-bridge.js?v=20261004-ugc22')));
  };

  const bootPage=()=>{
    if(document.querySelector('.viral-page'))load('instagram-embeds.js?v=20260905-13');
    if(document.querySelector('.hero-premium')){
      load('home-proof.js?v=20261004-2',()=>load('app-core.js?v=20261004-youtube',bootGrowth));
    }else{
      load('app-core.js?v=20261004-youtube',bootGrowth);
    }
  };

  load('brand-runtime.js?v=20260905-4',()=>load('site-quality.js?v=20260905-6',()=>load('viral-nav.js?v=20261004-ugc2',()=>load('insights-bridge.js?v=20260901-1',()=>{const css=document.createElement('link');css.rel='stylesheet';css.href='content-review.css?v=20261004-layout2';document.head.appendChild(css);bootPage()}))));
})();