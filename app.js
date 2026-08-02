const nav=document.querySelector('.nav');
window.addEventListener('scroll',()=>nav?.classList.toggle('scrolled',scrollY>20));
const menuBtn=document.querySelector('.menu-btn');
const navLinks=document.querySelector('.nav-links');
menuBtn?.addEventListener('click',()=>navLinks.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>navLinks.classList.remove('open')));

const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

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

document.querySelectorAll('.faq-q').forEach(q=>q.addEventListener('click',()=>q.parentElement.classList.toggle('open')));
