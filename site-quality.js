(() => {
  if(document.documentElement.dataset.jjQualityLoaded)return;
  document.documentElement.dataset.jjQualityLoaded='true';
  const doc=document;
  const path=location.pathname.toLowerCase();

  if(!doc.querySelector('link[data-jj-quality-css]')){
    const css=doc.createElement('link');css.rel='stylesheet';css.href='site-quality.css?v=20260901-1';css.dataset.jjQualityCss='true';doc.head.appendChild(css);
  }

  const normalizePath=value=>(value||'').split('?')[0].split('#')[0].replace(/^\//,'').replace(/\.html$/,'')||'index';
  const current=normalizePath(path);

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
    doc.querySelectorAll('a.logo').forEach(link=>{if(!link.getAttribute('aria-label'))link.setAttribute('aria-label','JJ-Media Startseite')});
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
      if(index>2&&!img.closest('.hero-premium,.analysis-intro,.page-hero'))img.loading||='lazy';
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
      const meta=doc.querySelector('meta[name="description"]');if(meta)meta.content='Kontakt zu JJ-Media: persönliche Beratung für Social-Media-Strategie, Content und Performance auf Instagram, Facebook, YouTube und LinkedIn.';
    }
    if(doc.body.classList.contains('viral-page')){
      doc.body.classList.add('jj-no-sticky');
      doc.querySelector('.jj-sticky-convert')?.remove();
    }
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
    });
    observer.observe(doc.body,{childList:true,subtree:true});
  };

  ensureSkip();navigation();faqA11y();forms();images();patchCopy();footerA11y();watchDynamic();
  doc.body.classList.add('jj-quality-ready');
})();
