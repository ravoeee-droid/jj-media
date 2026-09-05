(() => {
  if(document.documentElement.dataset.jjQualityLoaded)return;
  document.documentElement.dataset.jjQualityLoaded='true';
  const doc=document;
  const path=location.pathname.toLowerCase();
  const BRAND_SRC='data:image/webp;base64,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';

  if(!doc.querySelector('link[data-jj-quality-css]')){
    const css=doc.createElement('link');css.rel='stylesheet';css.href='/site-quality.css?v=20260905-5';css.dataset.jjQualityCss='true';doc.head.appendChild(css);
  }

  const normalizePath=value=>(value||'').split('?')[0].split('#')[0].replace(/^\//,'').replace(/\.html$/,'')||'index';
  const current=normalizePath(path);

  const ensureBrand=()=>{
    if(!doc.getElementById('jj-master-logo-style')){
      const style=doc.createElement('style');
      style.id='jj-master-logo-style';
      style.textContent='.jj-master-logo-link{display:inline-flex!important;align-items:center!important;justify-content:flex-start!important;flex:0 0 auto!important;text-decoration:none!important;line-height:1!important;gap:0!important}.jj-master-logo{display:block!important;width:auto!important;height:40px!important;max-width:58px!important;object-fit:contain!important;object-position:center!important;filter:none!important;transform:translateZ(0);transition:transform .28s ease,filter .28s ease}.jj-master-logo-link:hover .jj-master-logo{transform:translateY(-1px) scale(1.025);filter:saturate(1.04)}.blog-nav .jj-master-logo{height:36px!important;max-width:52px!important}.analysis-topbar .jj-master-logo{height:38px!important;max-width:55px!important}@media(max-width:620px){.jj-master-logo{height:34px!important;max-width:49px!important}.blog-nav .jj-master-logo,.analysis-topbar .jj-master-logo{height:33px!important;max-width:47px!important}}';
      doc.head.appendChild(style);
    }
    doc.querySelectorAll('a.logo,a.blog-logo').forEach(link=>{
      link.classList.add('jj-master-logo-link');
      link.setAttribute('aria-label','JJ-Media Startseite');
      let img=link.querySelector('.jj-master-logo');
      if(!img){img=doc.createElement('img');img.className='jj-master-logo';img.alt='JJ-Media';img.width=160;img.height=113;img.decoding='async';link.replaceChildren(img);}
      if(img.src!==BRAND_SRC)img.src=BRAND_SRC;
    });
  };

  const ensureSkip=()=>{
    if(doc.querySelector('.jj-skip-link'))return;
    const target=doc.querySelector('main')||doc.querySelector('header.page-hero,header.hero-premium,header.travel-hero,header.viral-hero,main');
    if(!target)return;
    if(!target.id)target.id='jj-main-content';
    const skip=doc.createElement('a');skip.className='jj-skip-link';skip.href=`#${target.id}`;skip.textContent='Zum Hauptinhalt springen';doc.body.prepend(skip);
  };

  const navigation=()=>{
    doc.querySelectorAll('.nav-links a').forEach(link=>{
      const href=normalizePath(link.getAttribute('href'));
      if(href===current)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
    });
    doc.querySelectorAll('a[target="_blank"]').forEach(link=>{
      const rel=new Set((link.getAttribute('rel')||'').split(/\s+/).filter(Boolean));rel.add('noopener');rel.add('noreferrer');link.setAttribute('rel',[...rel].join(' '));
    });
    doc.querySelectorAll('a.logo,.blog-logo').forEach(link=>{if(!link.getAttribute('aria-label'))link.setAttribute('aria-label','JJ-Media Startseite')});
  };

  const faqA11y=()=>{
    doc.querySelectorAll('.faq-item').forEach((item,index)=>{
      const button=item.querySelector('.faq-q');const answer=item.querySelector('.faq-a');if(!button||!answer)return;
      if(!button.id)button.id=`faq-question-${index+1}`;if(!answer.id)answer.id=`faq-answer-${index+1}`;
      button.setAttribute('aria-controls',answer.id);answer.setAttribute('role','region');answer.setAttribute('aria-labelledby',button.id);
      const sync=()=>{const open=item.classList.contains('open');button.setAttribute('aria-expanded',String(open));answer.hidden=!open};
      sync();new MutationObserver(sync).observe(item,{attributes:true,attributeFilter:['class']});
    });
  };

  const forms=()=>{
    doc.querySelectorAll('.funnel-field').forEach((wrap,index)=>{
      const field=wrap.querySelector('input,select,textarea');const help=wrap.querySelector('small');if(!field||!help)return;
      if(!help.id)help.id=`field-help-${field.id||index+1}`;
      const described=new Set((field.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean));described.add(help.id);field.setAttribute('aria-describedby',[...described].join(' '));
    });
    doc.querySelectorAll('input,select,textarea').forEach(field=>{
      field.addEventListener('invalid',()=>field.setAttribute('aria-invalid','true'));
      field.addEventListener('input',()=>{if(field.checkValidity())field.removeAttribute('aria-invalid')});
      if(!field.getAttribute('autocomplete')&&field.type==='email')field.autocomplete='email';
    });
    doc.querySelectorAll('[aria-live]').forEach(region=>{if(!region.getAttribute('aria-atomic'))region.setAttribute('aria-atomic','true')});
  };

  const images=()=>{
    doc.querySelectorAll('img').forEach((img,index)=>{
      img.decoding='async';
      if(index>2&&!img.closest('.hero-premium,.analysis-intro,.page-hero,.article-cover'))img.loading||='lazy';
      if(!img.hasAttribute('alt'))img.alt='';
    });
  };

  const patchCopy=()=>{
    if(current==='analyse'){
      const meta=doc.querySelector('meta[name="description"]');if(meta)meta.content='Kostenlose persönliche Social-Media-Analyse von JJ-Media für Instagram, Facebook, YouTube und LinkedIn.';
      const value=doc.querySelector('.analysis-value');if(value)value.textContent='Kostenlose persönliche Analyse';
      const profileLabel=doc.querySelector('label[for="profile"]');if(profileLabel)profileLabel.textContent='Instagram, Facebook, YouTube oder LinkedIn *';
    }
    if(current==='contact'){
      doc.querySelectorAll('.faq-a').forEach(answer=>{
        if(answer.textContent.includes('TikTok'))answer.textContent='Das hängt von Zielgruppe, Angebot und Content-Stärke ab. Instagram und Facebook sind stark für Community und visuelle Markenführung, YouTube für nachhaltige Sichtbarkeit und erklärungsstarke Inhalte, LinkedIn vor allem im B2B.';
      });
    }
    if(doc.body.classList.contains('viral-page')){doc.body.classList.add('jj-no-sticky');doc.querySelector('.jj-sticky-convert')?.remove();}
    if(['contact','analyse','datenschutz','impressum','barrierefreiheit'].includes(current))doc.body.classList.add('jj-no-sticky');
  };

  const footerA11y=()=>{
    doc.querySelectorAll('footer .footer-links').forEach(links=>{
      if(![...links.querySelectorAll('a')].some(a=>normalizePath(a.getAttribute('href'))==='barrierefreiheit')){
        const link=doc.createElement('a');link.href='barrierefreiheit.html';link.textContent='Barrierefreiheit';links.appendChild(link);
      }
    });
  };

  const watchDynamic=()=>{
    const observer=new MutationObserver(()=>{
      if(doc.body.classList.contains('jj-no-sticky'))doc.querySelector('.jj-sticky-convert')?.remove();
      const privacy=doc.querySelector('.jj-privacy');
      if(privacy&&!privacy.dataset.qualityReady){privacy.dataset.qualityReady='true';privacy.setAttribute('role','dialog');privacy.setAttribute('aria-label','Datenschutzeinstellungen')}
      ensureBrand();
    });
    observer.observe(doc.body,{childList:true,subtree:true});
  };

  ensureSkip();ensureBrand();navigation();faqA11y();forms();images();patchCopy();footerA11y();watchDynamic();
  doc.body.classList.add('jj-quality-ready');
})();
