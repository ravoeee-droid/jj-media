(() => {
  if(document.documentElement.dataset.jjBrandRuntime==='20260905-4')return;
  document.documentElement.dataset.jjBrandRuntime='20260905-4';
  const src='/assets/brand/jj-media-logo-final.png?v=20260905-1';
  const style=document.createElement('style');
  style.textContent='.jj-brand-master{display:block!important;width:auto!important;height:42px!important;max-width:64px!important;object-fit:contain!important;object-position:center!important}.jj-brand-link{display:inline-flex!important;align-items:center!important;justify-content:flex-start!important;flex:0 0 auto!important;min-width:58px!important;text-decoration:none!important}.blog-nav .jj-brand-master{height:38px!important}.nav-on-dark .jj-brand-master{filter:none!important}@media(max-width:620px){.jj-brand-master{height:35px!important;max-width:54px!important}.jj-brand-link{min-width:50px!important}}';
  document.head.appendChild(style);
  const apply=()=>{
    document.querySelectorAll('a.logo,a.blog-logo').forEach(link=>{
      link.classList.add('jj-brand-link');
      link.setAttribute('aria-label','JJ-Media Startseite');
      let img=link.querySelector('img.jj-master-logo');
      if(!img) img=document.createElement('img');
      img.className='jj-brand-master jj-master-logo';
      img.alt='JJ-Media';
      img.width=160;
      img.height=113;
      img.decoding='async';
      img.src=src;
      if(link.childNodes.length!==1 || link.firstChild!==img) link.replaceChildren(img);
    });
  };
  apply();
  const observer=new MutationObserver(apply);
  if(document.body)observer.observe(document.body,{childList:true,subtree:true});
  else addEventListener('DOMContentLoaded',()=>{apply();observer.observe(document.body,{childList:true,subtree:true})},{once:true});
})();