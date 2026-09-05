(() => {
  const KEY='jj-analytics-consent-v1';
  const footerLinks=document.querySelector('footer .footer-links')||document.querySelector('.analysis-footer-inner');
  if(!footerLinks||footerLinks.querySelector('[data-privacy-settings]'))return;

  const clearAnalytics=()=>{
    try{window.JJClarity?.deny?.()}catch(_){}
    try{
      if(typeof window.clarity==='function'){
        window.clarity('consentv2',{ad_Storage:'denied',analytics_Storage:'denied'});
        window.clarity('consent',false);
      }
    }catch(_){}
    ['_clck','_clsk'].forEach(name=>{
      try{document.cookie=`${name}=; Max-Age=0; path=/; SameSite=Lax`}catch(_){}
    });
    try{
      localStorage.removeItem(KEY);
      sessionStorage.removeItem('jj-growth-session-v2');
      sessionStorage.removeItem('jj-attribution-v1');
    }catch(_){}
  };

  const button=document.createElement('button');
  button.type='button';
  button.dataset.privacySettings='true';
  button.textContent='Datenschutz-Einstellungen';
  button.style.cssText='appearance:none;border:0;background:none;color:inherit;font:inherit;padding:0;cursor:pointer;text-align:left;opacity:.86';
  button.addEventListener('click',()=>{
    clearAnalytics();
    location.reload();
  });
  footerLinks.appendChild(button);
})();
