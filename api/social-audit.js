const SOCIAL_HOSTS = ['instagram.com','tiktok.com','linkedin.com','facebook.com','threads.net'];

function send(res,status,body){
  res.statusCode=status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.end(JSON.stringify(body));
}

function allowedHost(hostname=''){
  const host=hostname.toLowerCase().replace(/^www\./,'');
  return SOCIAL_HOSTS.some(root=>host===root||host.endsWith(`.${root}`));
}

function platformFromHost(hostname=''){
  const host=hostname.toLowerCase();
  if(host.includes('instagram.')) return 'Instagram';
  if(host.includes('tiktok.')) return 'TikTok';
  if(host.includes('linkedin.')) return 'LinkedIn';
  if(host.includes('facebook.')) return 'Facebook';
  if(host.includes('threads.')) return 'Threads';
  return 'Social Media';
}

function normaliseInput(raw=''){
  let value=String(raw).trim().slice(0,500);
  if(!value) throw new Error('Bitte gib einen Social-Media-Link ein.');
  if(/^@[a-z0-9._-]{2,80}$/i.test(value)) value=`https://www.instagram.com/${value.slice(1)}/`;
  if(!/^https?:\/\//i.test(value)) value=`https://${value}`;
  const url=new URL(value);
  if(!allowedHost(url.hostname)) throw new Error('Aktuell unterstützen wir Instagram, TikTok, LinkedIn, Facebook und Threads.');
  url.hash='';
  return url;
}

function decodeHtml(value=''){
  return String(value)
    .replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'")
    .replace(/&lt;/gi,'<').replace(/&gt;/gi,'>')
    .replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCharCode(parseInt(n,16)))
    .replace(/\s+/g,' ').trim();
}

function attrs(tag=''){
  const result={};
  const re=/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match;
  while((match=re.exec(tag))) result[match[1].toLowerCase()]=decodeHtml(match[2]??match[3]??match[4]??'');
  return result;
}

function parseMeta(html=''){
  const meta={};
  for(const tag of html.match(/<meta\b[^>]*>/gi)||[]){
    const a=attrs(tag);
    const key=(a.property||a.name||a.itemprop||'').toLowerCase();
    if(key&&a.content&&!meta[key]) meta[key]=a.content;
  }
  const titleMatch=html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title=decodeHtml(meta['og:title']||meta['twitter:title']||(titleMatch?.[1]||''));
  const description=decodeHtml(meta['og:description']||meta.description||meta['twitter:description']||'');
  const image=meta['og:image']||meta['twitter:image']||'';
  return {title,description,image};
}

function numberFrom(value=''){
  if(value==null||value==='') return null;
  const clean=String(value).replace(/\s/g,'').replace(/,/g,'');
  const match=clean.match(/([\d.]+)\s*([KMB])?/i);
  if(!match) return null;
  let num=Number(match[1]);
  if(!Number.isFinite(num)) return null;
  const unit=(match[2]||'').toUpperCase();
  if(unit==='K') num*=1e3;
  if(unit==='M') num*=1e6;
  if(unit==='B') num*=1e9;
  return Math.round(num);
}

function firstMetric(text,patterns){
  for(const re of patterns){
    const m=text.match(re);
    if(m?.[1]){
      const n=numberFrom(m[1]);
      if(n!=null) return n;
    }
  }
  return null;
}

function extractMetrics(html,description,platform){
  const corpus=`${description} ${html.slice(0,900000)}`;
  const followers=firstMetric(corpus,[
    /([\d.,]+\s*[KMB]?)\s+Followers?/i,
    /"follower_count"\s*:\s*(\d+)/i,
    /"edge_followed_by"\s*:\s*\{\s*"count"\s*:\s*(\d+)/i,
    /"followers"\s*:\s*(\d+)/i
  ]);
  const following=firstMetric(corpus,[
    /([\d.,]+\s*[KMB]?)\s+Following/i,
    /"following_count"\s*:\s*(\d+)/i,
    /"edge_follow"\s*:\s*\{\s*"count"\s*:\s*(\d+)/i
  ]);
  const posts=firstMetric(corpus,[
    /([\d.,]+\s*[KMB]?)\s+Posts?/i,
    /"media_count"\s*:\s*(\d+)/i,
    /"edge_owner_to_timeline_media"\s*:\s*\{\s*"count"\s*:\s*(\d+)/i,
    /"videoCount"\s*:\s*(\d+)/i
  ]);
  const likes=platform==='TikTok'?firstMetric(corpus,[/([\d.,]+\s*[KMB]?)\s+Likes?/i,/"heartCount"\s*:\s*(\d+)/i,/"heart"\s*:\s*(\d+)/i]):null;
  return {followers,following,posts,likes};
}

function handleFromUrl(url,platform){
  const parts=url.pathname.split('/').filter(Boolean);
  if(platform==='LinkedIn'&&['in','company','school'].includes(parts[0])) return parts[1]||'';
  if(platform==='Facebook'&&parts[0]==='profile.php') return '';
  return (parts[0]||'').replace(/^@/,'');
}

function generatedMetricDescription(text=''){
  return /followers?|following|posts?|likes?/i.test(text)&&text.length<260;
}

function scoreProfile({title,description,image,handle,metrics,verified}){
  const categories=[];
  const bioUsable=description&&!generatedMetricDescription(description);
  let clarity=25;
  if(handle) clarity+=18;
  if(title&&title.length>3) clarity+=30;
  if(image) clarity+=22;
  categories.push({key:'profile',label:'Profil-Klarheit',score:Math.min(100,clarity),available:true});

  if(bioUsable){
    let positioning=35;
    const len=description.length;
    if(len>=45) positioning+=22;
    if(len>=80&&len<=220) positioning+=16;
    if(/\b(we|wir|ich|help|helfen|für|for|special|expert|studio|agency|agentur|beratung|coach|hotel|travel|shop|brand|marke)\b/i.test(description)) positioning+=15;
    categories.push({key:'positioning',label:'Positionierung',score:Math.min(100,positioning),available:true});

    let conversion=28;
    if(/kontakt|contact|book|buchen|termin|dm|message|anfrage|shop|link|website|call|email|mail/i.test(description)) conversion+=38;
    if(/https?:\/\//i.test(description)) conversion+=20;
    categories.push({key:'conversion',label:'Conversion-Signal',score:Math.min(100,conversion),available:true});
  }else{
    categories.push({key:'positioning',label:'Positionierung',score:null,available:false});
    categories.push({key:'conversion',label:'Conversion-Signal',score:null,available:false});
  }

  let proof=30;
  if(image) proof+=18;
  if(verified) proof+=25;
  if(metrics.followers!=null) proof+=15;
  if(metrics.posts!=null||metrics.likes!=null) proof+=12;
  categories.push({key:'proof',label:'Öffentlicher Proof',score:Math.min(100,proof),available:true});

  if(metrics.posts!=null){
    let content=35;
    if(metrics.posts>=9) content=55;
    if(metrics.posts>=30) content=70;
    if(metrics.posts>=100) content=82;
    if(metrics.posts>=300) content=90;
    categories.push({key:'content',label:'Content-Basis',score:content,available:true});
  }else{
    categories.push({key:'content',label:'Content-Basis',score:null,available:false});
  }

  const available=categories.filter(item=>item.available&&Number.isFinite(item.score));
  const score=available.length?Math.round(available.reduce((sum,item)=>sum+item.score,0)/available.length):null;
  const confidence=available.length>=5?'hoch':available.length>=3?'mittel':'begrenzt';
  return {score,categories,confidence,bioUsable};
}

function buildInsights(data){
  const {platform,meta,metrics,scoring,verified}=data;
  const findings=[];
  const recommendations=[];
  if(meta.title) findings.push('Profil und Name sind öffentlich klar erkennbar.');
  else findings.push('Der Profilname war öffentlich nicht zuverlässig auslesbar.');
  if(scoring.bioUsable) findings.push('Eine öffentlich lesbare Profilbeschreibung konnte in die Analyse einbezogen werden.');
  else findings.push(`${platform} liefert die Bio aktuell nicht verlässlich ohne Login aus – wir bewerten sie deshalb nicht künstlich.`);
  if(metrics.followers!=null) findings.push(`Öffentlich sichtbares Follower-Signal: ${metrics.followers.toLocaleString('de-DE')}.`);
  if(metrics.posts!=null) findings.push(`Öffentlich sichtbare Content-Basis: ${metrics.posts.toLocaleString('de-DE')} Beiträge/Inhalte.`);
  if(verified) findings.push('Ein öffentliches Verifizierungs-Signal wurde erkannt.');

  if(!scoring.bioUsable) recommendations.push({title:'Positionierung in der Bio schärfen',text:'In einem Satz muss klar werden, für wen der Account ist, welches Ergebnis er liefert und warum man bleiben sollte.'});
  else if(!/kontakt|contact|book|buchen|termin|dm|message|anfrage|shop|link|website|call|email|mail/i.test(meta.description)) recommendations.push({title:'Nächsten Schritt sichtbar machen',text:'Die öffentlich lesbare Beschreibung zeigt kein starkes Conversion-Signal. Ein klarer CTA reduziert Reibung.'});
  if(metrics.posts==null||metrics.posts<30) recommendations.push({title:'Wiedererkennbare Content-Serien aufbauen',text:'Statt Einzelposts: 3–5 wiederkehrende Formate mit klarer Erwartung, damit Profil und Marke schneller verstanden werden.'});
  recommendations.push({title:'Proof näher an den Einstieg holen',text:'Ergebnisse, echte Kundensituationen oder konkrete Vorher/Nachher-Belege sollten in den ersten sichtbaren Content-Flächen vorkommen.'});
  if(platform==='Instagram'||platform==='TikTok') recommendations.push({title:'Hooks systematisch testen',text:'Die ersten 1–2 Sekunden bzw. die erste Zeile entscheiden über Aufmerksamkeit. Mehrere Hook-Varianten pro Thema testen.'});
  if(platform==='LinkedIn') recommendations.push({title:'Expertise in klare POVs übersetzen',text:'Weniger allgemeine Tipps, mehr konkrete Standpunkte, echte Erfahrungen und dokumentierte Ergebnisse.'});
  if(platform==='Facebook') recommendations.push({title:'Profil und Community verbinden',text:'Beiträge sollten nicht nur informieren, sondern Kommentare, lokale Relevanz und konkrete nächste Schritte auslösen.'});
  if(recommendations.length<5) recommendations.push({title:'Conversion-Pfad verkürzen',text:'Vom ersten Interesse bis Kontakt oder Termin sollte der nächste Schritt ohne Suche verständlich sein.'});
  if(recommendations.length<5) recommendations.push({title:'Top-Content als System wiederverwenden',text:'Gewinner-Themen in Reel, Carousel, Story und Proof-Post übersetzen statt jedes Mal bei null zu starten.'});
  return {findings:findings.slice(0,5),recommendations:recommendations.slice(0,5)};
}

async function fetchPublic(url){
  let current=new URL(url.toString());
  for(let hop=0;hop<4;hop+=1){
    if(!allowedHost(current.hostname)) throw new Error('Nicht erlaubte Weiterleitung.');
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),7500);
    let response;
    try{
      response=await fetch(current,{redirect:'manual',signal:controller.signal,headers:{
        'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36',
        'accept':'text/html,application/xhtml+xml',
        'accept-language':'en-US,en;q=0.9,de;q=0.7',
        'cache-control':'no-cache'
      }});
    }finally{clearTimeout(timer);}
    if([301,302,303,307,308].includes(response.status)){
      const location=response.headers.get('location');
      if(!location) return {response,current};
      current=new URL(location,current);
      continue;
    }
    return {response,current};
  }
  throw new Error('Zu viele Weiterleitungen.');
}

module.exports = async function handler(req,res){
  if(req.method!=='POST'){
    res.setHeader('Allow','POST');
    return send(res,405,{error:'Method not allowed'});
  }
  try{
    const raw=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
    const url=normaliseInput(raw.url||raw.profile||'');
    const platform=platformFromHost(url.hostname);
    let fetched;
    try{fetched=await fetchPublic(url);}catch(error){
      return send(res,200,{ok:true,mode:'limited',platform,handle:handleFromUrl(url,platform),profileUrl:url.toString(),score:null,confidence:'begrenzt',categories:[],metrics:{followers:null,following:null,posts:null,likes:null},findings:[`${platform} hat den öffentlichen Abruf in diesem Moment eingeschränkt.`],recommendations:[
        {title:'Bio auf ein klares Ergebnis zuspitzen',text:'Zielgruppe + konkreter Nutzen + klare Positionierung in den ersten sichtbaren Zeilen.'},
        {title:'Proof früher zeigen',text:'Ergebnisse, Kundensituationen und glaubwürdige Belege direkt in Profil und Top-Content sichtbar machen.'},
        {title:'Hooks als eigenes System behandeln',text:'Nicht nur Content produzieren – Einstiege messen, Varianten testen und Gewinner wiederverwenden.'}
      ],note:'Wir zeigen bewusst keinen erfundenen Score, wenn die Plattform ihre öffentlichen Profildaten nicht verlässlich ausliefert.'});
    }
    const {response,current}=fetched;
    const contentType=response.headers.get('content-type')||'';
    if(!response.ok||!contentType.includes('text/html')){
      return send(res,200,{ok:true,mode:'limited',platform,handle:handleFromUrl(url,platform),profileUrl:url.toString(),score:null,confidence:'begrenzt',categories:[],metrics:{followers:null,following:null,posts:null,likes:null},findings:[`${platform} liefert für diesen Link aktuell keine verlässlich analysierbare öffentliche Profilseite.`],recommendations:[{title:'Profil persönlich prüfen lassen',text:'Jessica kann Positionierung, Content, Hooks und Conversion anhand des echten Profils vollständig bewerten.'}],note:'Keine Daten erfunden: Der automatische Score bleibt aus, wenn die öffentliche Datengrundlage nicht belastbar ist.'});
    }
    let html=await response.text();
    if(html.length>1500000) html=html.slice(0,1500000);
    const meta=parseMeta(html);
    const metrics=extractMetrics(html,meta.description,platform);
    const handle=handleFromUrl(current,platform)||handleFromUrl(url,platform);
    const verified=/"is_verified"\s*:\s*true|verified badge|aria-label="verified"/i.test(html);
    const scoring=scoreProfile({title:meta.title,description:meta.description,image:meta.image,handle,metrics,verified});
    const insights=buildInsights({platform,meta,metrics,scoring,verified});
    const meaningful=Boolean(meta.title||meta.description||meta.image||metrics.followers!=null||metrics.posts!=null);
    return send(res,200,{
      ok:true,
      mode:meaningful?'public-signals':'limited',
      platform,
      handle,
      profileUrl:url.toString(),
      resolvedUrl:current.toString(),
      title:meta.title||handle||platform,
      description:scoring.bioUsable?meta.description:'',
      image:meta.image||'',
      verified,
      score:meaningful?scoring.score:null,
      confidence:meaningful?scoring.confidence:'begrenzt',
      categories:meaningful?scoring.categories:[],
      metrics,
      findings:meaningful?insights.findings:[`${platform} schützt einen Teil der Profildaten vor automatischem Zugriff.`],
      recommendations:insights.recommendations,
      note:meaningful?'Der Score basiert ausschließlich auf öffentlich zugänglichen Profilsignalen – nicht auf privaten Insights wie Reichweite, Saves, Watchtime oder Conversions.':'Wir zeigen bewusst keinen erfundenen Score, wenn die öffentliche Datengrundlage nicht belastbar ist.'
    });
  }catch(error){
    return send(res,400,{error:error?.message||'Der Link konnte nicht geprüft werden.'});
  }
};
