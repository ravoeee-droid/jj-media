const nav=document.querySelector('.nav');
window.addEventListener('scroll',()=>nav?.classList.toggle('scrolled',scrollY>20));
const menuBtn=document.querySelector('.menu-btn');
const navLinks=document.querySelector('.nav-links');
const setMenuOpen=open=>{
 if(!menuBtn||!navLinks)return;
 navLinks.classList.toggle('open',open);
 document.body.classList.toggle('menu-open',open);
 menuBtn.classList.toggle('active',open);
 menuBtn.setAttribute('aria-expanded',String(open));
 menuBtn.setAttribute('aria-label',open?'Menü schließen':'Menü öffnen');
};
menuBtn?.addEventListener('click',()=>setMenuOpen(!navLinks.classList.contains('open')));
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>setMenuOpen(false)));
document.addEventListener('keydown',event=>{if(event.key==='Escape')setMenuOpen(false)});
document.addEventListener('pointerdown',event=>{
 if(navLinks?.classList.contains('open')&&!navLinks.contains(event.target)&&!menuBtn?.contains(event.target))setMenuOpen(false);
});
addEventListener('resize',()=>{if(innerWidth>900)setMenuOpen(false)});

const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer=window.matchMedia('(pointer:fine)').matches;

/* Load the optional motion layer without changing the shared page templates. */
if(!document.querySelector('link[data-jj-effects]')){
 const effects=document.createElement('link');
 effects.rel='stylesheet';
 effects.href='effects.css?v=20260803-1';
 effects.dataset.jjEffects='true';
 document.head.appendChild(effects);
}

/* Cinematic word-by-word hero reveal. */
const heroTitle=document.querySelector('.hero-title');
if(heroTitle&&!heroTitle.dataset.motionReady){
 const label=heroTitle.textContent.trim().replace(/\s+/g,' ');
 const words=label.split(' ');
 heroTitle.dataset.motionReady='true';
 heroTitle.setAttribute('aria-label',label);
 heroTitle.classList.add('hero-title-motion');
 heroTitle.innerHTML=words.map((word,index)=>{
  const accent=index===words.length-1?' hero-word-accent serif':'';
  return `<span class="hero-word${accent}" style="--word-delay:${150+index*115}ms" aria-hidden="true"><span>${word}</span></span>`;
 }).join(' ');
 const activate=()=>heroTitle.classList.add('is-active');
 if(reduceMotion)activate();else setTimeout(activate,170);
}

/* Pointer depth for the founder portrait and the two floating proof cards. */
const heroStage=document.querySelector('.hero-premium .hero-stage');
const heroVisual=document.querySelector('.hero-premium .hero-visual');
const floatingTop=document.querySelector('.hero-premium .floating-card-top');
const floatingBottom=document.querySelector('.hero-premium .floating-card-bottom');
if(heroStage&&heroVisual&&finePointer&&!reduceMotion){
 let depthFrame=0;
 let nextX=0;
 let nextY=0;
 const paintDepth=()=>{
  heroVisual.style.setProperty('--hero-depth-x',`${nextX*9}px`);
  heroVisual.style.setProperty('--hero-depth-y',`${nextY*7}px`);
  floatingTop?.style.setProperty('--float-top-x',`${nextX*17}px`);
  floatingTop?.style.setProperty('--float-top-y',`${nextY*11}px`);
  floatingBottom?.style.setProperty('--float-bottom-x',`${nextX*-13}px`);
  floatingBottom?.style.setProperty('--float-bottom-y',`${nextY*-9}px`);
  depthFrame=0;
 };
 heroStage.addEventListener('pointermove',event=>{
  const box=heroStage.getBoundingClientRect();
  nextX=((event.clientX-box.left)/box.width-.5)*2;
  nextY=((event.clientY-box.top)/box.height-.5)*2;
  if(!depthFrame)depthFrame=requestAnimationFrame(paintDepth);
 });
 heroStage.addEventListener('pointerleave',()=>{
  nextX=0;nextY=0;
  if(!depthFrame)depthFrame=requestAnimationFrame(paintDepth);
 });
}

/* Magnetic buttons with cursor-aware lighting. */
document.querySelectorAll('.hero-actions .btn,.cta .btn,.travel-cta .btn,.nav .btn.desktop').forEach(btn=>{
 btn.classList.add('magnetic-btn');
 if(!finePointer||reduceMotion)return;
 btn.addEventListener('pointermove',event=>{
  const box=btn.getBoundingClientRect();
  const x=(event.clientX-box.left)/box.width-.5;
  const y=(event.clientY-box.top)/box.height-.5;
  btn.style.transform=`translate3d(${x*11}px,${y*8}px,0) scale(1.025)`;
  btn.style.setProperty('--magnet-x',`${(x+.5)*100}%`);
  btn.style.setProperty('--magnet-y',`${(y+.5)*100}%`);
 });
 btn.addEventListener('pointerleave',()=>{
  btn.style.transform='';
  btn.style.removeProperty('--magnet-x');
  btn.style.removeProperty('--magnet-y');
 });
});

/* Soft cursor spotlight on high-value content cards. */
const spotlightCards=[...document.querySelectorAll('.case-card,.work-card,.credential-card,.system-card,.audience-card,.travel-offer,.process-card,.service-panel')];
spotlightCards.forEach(card=>{
 card.classList.add('spotlight-card');
 if(!finePointer||reduceMotion)return;
 card.addEventListener('pointermove',event=>{
  const box=card.getBoundingClientRect();
  card.style.setProperty('--spotlight-x',`${event.clientX-box.left}px`);
  card.style.setProperty('--spotlight-y',`${event.clientY-box.top}px`);
 });
 card.addEventListener('pointerleave',()=>{
  card.style.removeProperty('--spotlight-x');
  card.style.removeProperty('--spotlight-y');
 });
});

document.querySelectorAll('[data-youtube-id]').forEach(frame=>{
 const button=frame.querySelector('.video-poster');
 button?.addEventListener('click',()=>{
  const iframe=document.createElement('iframe');
  iframe.src=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(frame.dataset.youtubeId)}?autoplay=1&rel=0&modestbranding=1`;
  iframe.title='JJ-Media Showreel mit Jessica';
  iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.referrerPolicy='strict-origin-when-cross-origin';
  iframe.allowFullscreen=true;
  frame.replaceChildren(iframe);
 });
});

const revealItems=[...document.querySelectorAll('.reveal')];
if('IntersectionObserver' in window&&!reduceMotion){
 const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('visible');revealObserver.unobserve(e.target)}
 }),{threshold:.08,rootMargin:'0px 0px -3%'});
 revealItems.forEach((el,index)=>{
  el.style.setProperty('--reveal-delay',`${Math.min(index%4,3)*55}ms`);
  revealObserver.observe(el);
 });
}else{
 revealItems.forEach(el=>el.classList.add('visible'));
}

/* Scroll-driven image masks for case studies and proof media. */
const motionMedia=[...document.querySelectorAll('.proof-comparison,.case-image,.travel-case-gallery,.travel-case>img,.founder-image,.about-image,.video-frame')];
motionMedia.forEach(item=>item.classList.add('motion-media'));
if('IntersectionObserver' in window&&!reduceMotion){
 const mediaObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add('media-visible');mediaObserver.unobserve(entry.target)}
 }),{threshold:.16,rootMargin:'0px 0px -7%'});
 motionMedia.forEach(item=>mediaObserver.observe(item));
}else{
 motionMedia.forEach(item=>item.classList.add('media-visible'));
}

/* Count proof metrics up only when they enter the viewport. */
function parseCountLabel(label){
 const match=label.trim().match(/^([^\d+-]*)([+-]?)(\d[\d.,]*)(.*)$/);
 if(!match)return null;
 const raw=match[3];
 const decimalPlaces=raw.includes(',')?Math.min(2,raw.split(',').pop().length):0;
 const value=Number(raw.replace(/\./g,'').replace(',','.'));
 if(!Number.isFinite(value))return null;
 return {prefix:match[1],sign:match[2],value,suffix:match[4],decimalPlaces,original:label.trim()};
}
function animateCount(element,parsed){
 if(element.dataset.countComplete)return;
 element.dataset.countComplete='true';
 element.classList.add('count-up','is-counting');
 element.setAttribute('aria-label',parsed.original);
 const formatter=new Intl.NumberFormat('de-DE',{minimumFractionDigits:parsed.decimalPlaces,maximumFractionDigits:parsed.decimalPlaces});
 const duration=1450;
 const started=performance.now();
 const step=now=>{
  const progress=Math.min(1,(now-started)/duration);
  const eased=1-Math.pow(1-progress,4);
  const current=parsed.value*eased;
  element.textContent=`${parsed.prefix}${parsed.sign}${formatter.format(current)}${parsed.suffix}`;
  if(progress<1)requestAnimationFrame(step);
  else{
   element.textContent=`${parsed.prefix}${parsed.sign}${formatter.format(parsed.value)}${parsed.suffix}`;
   setTimeout(()=>element.classList.remove('is-counting'),220);
  }
 };
 requestAnimationFrame(step);
}
const counterItems=[...document.querySelectorAll('.hero-proof strong,.case-metrics strong,.travel-proof-strip strong')]
 .map(element=>({element,parsed:parseCountLabel(element.textContent)}))
 .filter(item=>item.parsed);
if('IntersectionObserver' in window&&!reduceMotion){
 const countObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(!entry.isIntersecting)return;
  const item=counterItems.find(candidate=>candidate.element===entry.target);
  if(item)animateCount(item.element,item.parsed);
  countObserver.unobserve(entry.target);
 }),{threshold:.45});
 counterItems.forEach(item=>countObserver.observe(item.element));
}else{
 counterItems.forEach(item=>{
  item.element.classList.add('count-up');
  item.element.textContent=item.parsed.original;
 });
}

if(!reduceMotion&&finePointer){
 document.querySelectorAll('[data-tilt]').forEach(card=>{
  const strength=Number(card.dataset.tiltStrength||2.3);
  const move=event=>{
   const box=card.getBoundingClientRect();
   const x=(event.clientX-box.left)/box.width-.5;
   const y=(event.clientY-box.top)/box.height-.5;
   card.style.transform=`perspective(1100px) rotateX(${-y*strength}deg) rotateY(${x*strength}deg) translateY(-2px)`;
   card.style.setProperty('--spot-x',`${(x+.5)*100}%`);
   card.style.setProperty('--spot-y',`${(y+.5)*100}%`);
  };
  card.addEventListener('pointermove',move);
  card.addEventListener('pointerleave',()=>{card.style.transform='';card.style.removeProperty('--spot-x');card.style.removeProperty('--spot-y')});
 });
}

if(!reduceMotion&&window.matchMedia('(min-width: 901px)').matches){
 const parallaxItems=[...document.querySelectorAll('[data-parallax]')];
 let parallaxTicking=false;
 const paintParallax=()=>{
  const viewport=innerHeight;
  parallaxItems.forEach(item=>{
   const box=item.getBoundingClientRect();
   if(box.bottom<0||box.top>viewport)return;
   const speed=Number(item.dataset.parallax||0);
   const offset=(box.top+box.height/2-viewport/2)*speed;
   item.style.translate=`0 ${offset.toFixed(2)}px`;
  });
  parallaxTicking=false;
 };
 const queueParallax=()=>{if(!parallaxTicking){requestAnimationFrame(paintParallax);parallaxTicking=true}};
 addEventListener('scroll',queueParallax,{passive:true});
 addEventListener('resize',queueParallax);
 queueParallax();
}

const serviceContent=[
 {title:'Strategy & Analytics',text:'Wir entwickeln eine klare Social-Media-Strategie, analysieren Zielgruppen und Wettbewerber und optimieren laufend anhand echter Performance-Daten.'},
 {title:'Content Creation',text:'Hochwertige Designs, Reels und verkaufspsychologische Texte, die Ihre Marke unverwechselbar machen und Menschen in Bewegung bringen.'},
 {title:'Social Ads',text:'Kreative Werbeanzeigen, präzise Zielgruppen und kontinuierliche Tests – für mehr Reichweite, qualifizierte Anfragen und messbare Ergebnisse.'}
];
const tabs=document.querySelectorAll('.service-tab');
const serviceTitle=document.querySelector('[data-service-title]');
const serviceText=document.querySelector('[data-service-text]');
tabs.forEach((t,i)=>t.addEventListener('click',()=>{tabs.forEach(x=>x.classList.remove('active'));t.classList.add('active');if(serviceTitle)serviceTitle.textContent=serviceContent[i].title;if(serviceText)serviceText.textContent=serviceContent[i].text;}));

const testimonials=[
 {img:'assets/testimonial-peggy.png',quote:'Es war ein unglaubliches Gefühl, als ich meinen ersten Verkauf im eigenen Online-Shop sah. Jessica hat mir geholfen, meine Comics sichtbar zu machen.',name:'Peggy Gerschler',role:'Comic-Händlerin'},
 {img:'assets/testimonial-oezhan.jpg',quote:'Ich hätte nie gedacht, dass ich jemals Spaß daran haben würde, Videos zu drehen. Jetzt bekomme ich Nachrichten und Anfragen, ohne etwas tun zu müssen.',name:'Özhan Büyükant',role:'Immobilienmakler'},
 {img:'assets/testimonial-anna.jpg',quote:'Dann kam Jessica – und plötzlich hatte meine Marke eine Stimme. Mehr Reichweite, echte Anfragen und das Gefühl, dass mein Business endlich wächst.',name:'Anna Weber',role:'Gründerin von WeberJewlery'},
 {img:'assets/testimonial-raphael.jpg',quote:'Endlich gewinne ich planbar Kunden und kann skalieren. Keine Unsicherheiten mehr, sondern kontinuierliches Wachstum. Ihre Strategie funktioniert.',name:'Raphael Hermann',role:'Employer Branding Experte'}
];
let ti=0;
function renderTestimonial(){const t=testimonials[ti];const img=document.querySelector('[data-t-img]');if(!img)return;img.src=t.img;document.querySelector('[data-t-quote]').textContent='„'+t.quote+'“';document.querySelector('[data-t-name]').textContent=t.name;document.querySelector('[data-t-role]').textContent=t.role;}
document.querySelector('[data-prev]')?.addEventListener('click',()=>{ti=(ti-1+testimonials.length)%testimonials.length;renderTestimonial()});
document.querySelector('[data-next]')?.addEventListener('click',()=>{ti=(ti+1)%testimonials.length;renderTestimonial()});

let months=6,industry='service';
document.querySelectorAll('.choice[data-month]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.choice[data-month]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');months=+btn.dataset.month;calcROI()}));
document.querySelectorAll('.choice[data-industry]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.choice[data-industry]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');industry=btn.dataset.industry;calcROI()}));
['revenue','value','customers'].forEach(id=>document.getElementById(id)?.addEventListener('input',calcROI));
function eur(v){return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(v)}
function calcROI(){
 const revenue=+document.getElementById('revenue')?.value||0;
 const value=+document.getElementById('value')?.value||0;
 const customers=+document.getElementById('customers')?.value||0;
 const mult={local:.78,service:1,ecommerce:.68,coach:1.15,gastro:.62,realestate:1.25}[industry]||1;
 const won=Math.round(customers*months*.72*mult);
 const extra=won*value;
 const invest=months*1490;
 const profit=extra-invest;
 const roi=invest>0?Math.round((profit/invest)*100):0;
 const growth=revenue>0?Math.round((extra/(revenue*months))*100):0;
 const breakEven=value>0?Math.max(1,Math.ceil(invest/value/customers||1)):0;
 const set=(sel,val)=>{const el=document.querySelector(sel);if(el)el.textContent=val};
 set('[data-roi]',(roi>=0?'+':'')+roi+'%');set('[data-new]',won);set('[data-extra]',eur(extra));set('[data-invest]',eur(invest));set('[data-profit]',eur(profit));set('[data-break]',breakEven?breakEven+'. Monat':'–');set('[data-growth]',growth+'%');
 document.querySelectorAll('.bar').forEach((b,i)=>b.style.height=Math.max(8,Math.min(100,18+(i+1)*(growth/Math.max(1,months))*1.4))+'%');
}
calcROI();

document.querySelectorAll('.faq-q').forEach(q=>{
 const item=q.parentElement;
 q.setAttribute('aria-expanded',String(item.classList.contains('open')));
 q.addEventListener('click',()=>{
  const open=item.classList.toggle('open');
  q.setAttribute('aria-expanded',String(open));
 });
});