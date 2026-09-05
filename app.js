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
    hotfix.href='ui-hotfix-20260902.css?v=20260902-1';
    hotfix.dataset.jjUiHotfix='true';
    document.head.appendChild(hotfix);
  }

  const isLegal=/\/(datenschutz|impressum|barrierefreiheit)(\.html)?\/?$/i.test(location.pathname);
  const bootGrowth=()=>{
    if(isLegal)return;
    load('growth-layer-v2.js?v=20260905-1',()=>load('privacy-controls.js?v=20260905-1',()=>load('social-audit-bridge.js?v=20260901-3')));
  };

  const bootPage=()=>{
    if(document.querySelector('.viral-page'))load('instagram-embeds.js?v=20260901-10');
    if(document.querySelector('.hero-premium')){
      load('home-proof.js?v=20260804-3',()=>load('app-core.js?v=20260804-3',bootGrowth));
    }else{
      load('app-core.js?v=20260804-3',bootGrowth);
    }
  };

  load('site-quality.js?v=20260901-2',()=>load('viral-nav.js?v=20260901-3',()=>load('insights-bridge.js?v=20260901-1',bootPage)));
})();