const HOSTS=['instagram.com','tiktok.com','linkedin.com','facebook.com','threads.net'];
const IG_APP_ID='936619743392459';

const clean=(v='',max=1400)=>String(v??'').replace(/\r/g,'').replace(/[\t ]+/g,' ').replace(/\n{3,}/g,'\n\n').trim().slice(0,max);
const finite=v=>Number.isFinite(Number(v))?Number(v):null;
const pick=(...values)=>values.find(v=>v!==null&&v!==undefined&&v!=='')??null;

function send(res,status,body){
  res.statusCode=status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.end(JSON.stringify(body));
}
function hostOk(host=''){const h=String(host).toLowerCase().replace(/^www\./,'');return HOSTS.some(root=>h===root||h.endsWith(`.${root}`));}
function platform(host=''){const h=String(host).toLowerCase();if(h.includes('instagram.'))return'Instagram';if(h.includes('tiktok.'))return'TikTok';if(h.includes('linkedin.'))return'LinkedIn';if(h.includes('facebook.'))return'Facebook';if(h.includes('threads.'))return'Threads';return'Social Media';}
function normalise(raw=''){
  let v=String(raw).trim().slice(0,500);
  if(!v)throw new Error('Bitte gib einen Social-Media-Link ein.');
  if(/^@[a-z0-9._-]{2,80}$/i.test(v))v=`https://www.instagram.com/${v.slice(1)}/`;
  if(!/^https?:\/\//i.test(v))v=`https://${v}`;
  const u=new URL(v);
  if(!hostOk(u.hostname))throw new Error('Aktuell unterstützen wir Instagram, TikTok, LinkedIn, Facebook und Threads.');
  u.hash='';
  return u;
}
function handle(u,p){const parts=u.pathname.split('/').filter(Boolean);if(p==='LinkedIn'&&['in','company','school'].includes(parts[0]))return parts[1]||'';if(p==='Facebook'&&parts[0]==='profile.php')return u.searchParams.get('id')||'';return(parts[0]||'').replace(/^@/,'');}

async function request(url,options={},timeout=7500){const c=new AbortController();const t=setTimeout(()=>c.abort(),timeout);try{return await fetch(url,{...options,signal:c.signal});}finally{clearTimeout(t);}}
const browserHeaders={
  'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36',
  'accept-language':'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
  'cache-control':'no-cache'
};
const igHeaders=username=>({...browserHeaders,accept:'*/*','x-ig-app-id':IG_APP_ID,referer:`https://www.instagram.com/${username}/`});

function decode(v=''){return clean(String(v).replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n))).replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCharCode(parseInt(n,16))),1800);}
function parseMeta(html=''){
  const meta={};
  for(const tag of html.match(/<meta\b[^>]*>/gi)||[]){
    const attrs={};const re=/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;let m;
    while((m=re.exec(tag)))attrs[m[1].toLowerCase()]=decode(m[2]??m[3]??m[4]??'');
    const k=(attrs.property||attrs.name||attrs.itemprop||'').toLowerCase();
    if(k&&attrs.content&&!meta[k])meta[k]=attrs.content;
  }
  const title=html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'';
  return{title:decode(meta['og:title']||meta['twitter:title']||title),description:decode(meta['og:description']||meta.description||meta['twitter:description']||''),image:meta['og:image']||meta['twitter:image']||''};
}
function num(v=''){
  if(v==null||v==='')return null;
  let s=String(v).trim().replace(/\s/g,'');
  if(/^\d{1,3}(,\d{3})+$/.test(s))s=s.replace(/,/g,'');else s=s.replace(',','.');
  const m=s.match(/([\d.]+)([KMB])?/i);if(!m)return null;
  let n=Number(m[1]);if(!Number.isFinite(n))return null;
  const unit=(m[2]||'').toUpperCase();if(unit==='K')n*=1e3;if(unit==='M')n*=1e6;if(unit==='B')n*=1e9;
  return Math.round(n);
}
function first(text,regexes){for(const re of regexes){const n=num(String(text).match(re)?.[1]);if(n!=null)return n;}return null;}
function metaMetrics(html,description,p){const corpus=`${description} ${html.slice(0,1000000)}`;return{followers:first(corpus,[/([\d.,]+\s*[KMB]?)\s+Followers?/i,/"follower_count"\s*:\s*(\d+)/i]),following:first(corpus,[/([\d.,]+\s*[KMB]?)\s+Following/i,/"following_count"\s*:\s*(\d+)/i]),posts:first(corpus,[/([\d.,]+\s*[KMB]?)\s+Posts?/i,/"media_count"\s*:\s*(\d+)/i,/"videoCount"\s*:\s*(\d+)/i]),likes:p==='TikTok'?first(corpus,[/([\d.,]+\s*[KMB]?)\s+Likes?/i,/"heartCount"\s*:\s*(\d+)/i]):null};}

async function htmlPage(url){
  let current=new URL(url);
  for(let i=0;i<4;i++){
    if(!hostOk(current.hostname))throw new Error('Nicht erlaubte Weiterleitung.');
    const r=await request(current,{redirect:'manual',headers:{...browserHeaders,accept:'text/html,application/xhtml+xml'}},7500);
    if([301,302,303,307,308].includes(r.status)){const l=r.headers.get('location');if(!l)return{response:r,current};current=new URL(l,current);continue;}
    return{response:r,current};
  }
  throw new Error('Zu viele Weiterleitungen.');
}
function jsonScripts(html=''){
  const out=[];const re=/<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi;let m;
  while((m=re.exec(html))){if(!m[1]||m[1].length>2500000)continue;try{out.push(JSON.parse(m[1]));}catch(_){}}
  return out;
}
function deepFindUser(root,username){
  const q=[root],seen=new Set();let best=null;
  while(q.length&&seen.size<12000){
    const v=q.shift();if(!v||typeof v!=='object'||seen.has(v))continue;seen.add(v);
    const candidate=String(v.username||v.user_name||v.uniqueId||'').toLowerCase();
    if(candidate===String(username).toLowerCase()&&(v.biography||v.full_name||v.profile_pic_url||v.external_url||v.edge_followed_by||v.follower_count)){
      best=v;if(v.biography&&v.full_name)break;
    }
    for(const c of Object.values(v))if(c&&typeof c==='object')q.push(c);
  }
  return best;
}

function igItem(item={}){
  const caption=clean(item?.caption?.text||item?.edge_media_to_caption?.edges?.[0]?.node?.text||item?.desc||'',1600);
  return{id:String(item.code||item.shortcode||item.pk||item.id||''),type:(item.media_type===2||item.product_type==='clips'||item.is_video)?'Reel/Video':'Post',caption,likes:finite(item.like_count??item?.edge_liked_by?.count??item?.edge_media_preview_like?.count),comments:finite(item.comment_count??item?.edge_media_to_comment?.count),views:finite(item.play_count??item.view_count??item.video_view_count),timestamp:finite(item.taken_at??item.taken_at_timestamp)};
}
function igProfile(user={},items=[],source='instagram-public'){
  return{source,fullName:clean(user.full_name||user.username||'',180),handle:clean(user.username||'',100),bio:clean(user.biography||'',700),image:user.profile_pic_url_hd||user.profile_pic_url||'',externalUrl:user.external_url||'',category:clean(user.category_name||user.business_category_name||user.category||'',120),verified:Boolean(user.is_verified),business:Boolean(user.is_business_account||user.is_professional_account||user.is_business),metrics:{followers:finite(user?.edge_followed_by?.count??user.follower_count),following:finite(user?.edge_follow?.count??user.following_count),posts:finite(user?.edge_owner_to_timeline_media?.count??user.media_count),likes:null},recentContent:(items||[]).slice(0,12).map(x=>igItem(x?.node||x)).filter(x=>x.id||x.caption)};
}
function mergeItems(...lists){const seen=new Set(),out=[];for(const list of lists){for(const item of list||[]){const key=item.id||`${item.timestamp||''}:${item.caption||''}`;if(!key||seen.has(key))continue;seen.add(key);out.push(item);}}return out.slice(0,12);}
function mergeProfiles(username,profiles=[]){
  const usable=profiles.filter(Boolean);if(!usable.length)return null;
  const bySource=name=>usable.find(p=>p.source===name)||null;
  const web=bySource('instagram-web-profile'),embedded=bySource('instagram-page-json'),feed=bySource('instagram-feed-by-username'),meta=bySource('page-metadata');
  const order=[web,embedded,feed,meta,...usable].filter(Boolean);
  const field=key=>pick(...order.map(p=>p[key]));
  const metric=key=>pick(...order.map(p=>p.metrics?.[key]));
  return{
    source:usable.map(p=>p.source).filter(Boolean).join('+'),
    sources:usable.map(p=>p.source).filter(Boolean),
    fullName:field('fullName')||username,
    handle:field('handle')||username,
    bio:field('bio')||'',
    image:field('image')||'',
    externalUrl:field('externalUrl')||'',
    category:field('category')||'',
    verified:usable.some(p=>p.verified),
    business:usable.some(p=>p.business),
    metrics:{followers:metric('followers'),following:metric('following'),posts:metric('posts'),likes:metric('likes')},
    recentContent:mergeItems(feed?.recentContent,web?.recentContent,embedded?.recentContent,...usable.map(p=>p.recentContent))
  };
}
function metaFallback(p,url,html,meta){
  const h=handle(url,p);const generated=/followers?|following|posts?|likes?/i.test(meta.description)&&/instagram|tiktok|photos|videos|profil/i.test(meta.description);
  return{source:'page-metadata',fullName:clean(meta.title||h||p,180),handle:h,bio:generated?'':clean(meta.description,700),image:meta.image||'',externalUrl:'',category:'',verified:/"is_verified"\s*:\s*true|verified badge|aria-label=["']verified["']/i.test(html),business:false,metrics:metaMetrics(html,meta.description,p),recentContent:[]};
}
async function instagramBundle(url){
  const username=handle(url,'Instagram');if(!username||!/^[a-z0-9._]{2,80}$/i.test(username))return null;
  const tasks=[
    request(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,{headers:igHeaders(username)},7000).then(async r=>{if(!r.ok)return null;const j=await r.json().catch(()=>null);const user=j?.data?.user||j?.user;if(!user)return null;const edges=user?.edge_owner_to_timeline_media?.edges||user?.edge_felix_video_timeline?.edges||[];return igProfile(user,edges,'instagram-web-profile');}).catch(()=>null),
    request(`https://www.instagram.com/api/v1/feed/user/${encodeURIComponent(username)}/username/?count=12`,{headers:igHeaders(username)},7000).then(async r=>{if(!r.ok)return null;const j=await r.json().catch(()=>null);const items=j?.items||[];const user=j?.user||items?.[0]?.user||{};return igProfile({...user,username:user.username||username},items,'instagram-feed-by-username');}).catch(()=>null),
    htmlPage(url).then(async f=>{const type=f.response.headers.get('content-type')||'';if(!f.response.ok||!type.includes('text/html'))return null;let html=await f.response.text();if(html.length>1800000)html=html.slice(0,1800000);const meta=parseMeta(html);const profiles=[metaFallback('Instagram',f.current,html,meta)];for(const j of jsonScripts(html)){const user=deepFindUser(j,username);if(user){const edges=user?.edge_owner_to_timeline_media?.edges||[];profiles.unshift(igProfile(user,edges,'instagram-page-json'));break;}}return{profiles,html,meta,resolved:f.current};}).catch(()=>null)
  ];
  const [web,feed,page]=await Promise.all(tasks);
  const profiles=[web,feed,...(page?.profiles||[])].filter(Boolean);
  return{profile:mergeProfiles(username,profiles),html:page?.html||'',meta:page?.meta||{title:'',description:'',image:''},resolved:page?.resolved||url};
}

function findTikTok(root){const q=[root],seen=new Set();let user=null,stats=null,items=[];while(q.length&&seen.size<9000){const v=q.shift();if(!v||typeof v!=='object'||seen.has(v))continue;seen.add(v);if(!user&&v.uniqueId&&('nickname'in v||'signature'in v))user=v;if(!stats&&'followerCount'in v&&'followingCount'in v)stats=v;if(Array.isArray(v.itemList)&&v.itemList.length)items=v.itemList;for(const c of Object.values(v))if(c&&typeof c==='object')q.push(c);}return{user,stats,items};}
function tiktokDeep(html,url){
  for(const j of jsonScripts(html)){
    const f=findTikTok(j);if(!f.user&&!f.stats)continue;const u=f.user||{},s=f.stats||{};
    return{source:'tiktok-page-json',sources:['tiktok-page-json'],fullName:clean(u.nickname||handle(url,'TikTok'),180),handle:clean(u.uniqueId||handle(url,'TikTok'),100),bio:clean(u.signature||'',700),image:u.avatarLarger||u.avatarMedium||u.avatarThumb||'',externalUrl:u.bioLink?.link||'',category:'',verified:Boolean(u.verified),business:Boolean(u.commerceUserInfo?.commerceUser),metrics:{followers:finite(s.followerCount),following:finite(s.followingCount),posts:finite(s.videoCount),likes:finite(s.heartCount)},recentContent:(f.items||[]).slice(0,12).map(i=>({id:String(i.id||''),type:'Video',caption:clean(i.desc||'',1600),likes:finite(i?.stats?.diggCount),comments:finite(i?.stats?.commentCount),views:finite(i?.stats?.playCount),timestamp:finite(i.createTime)})).filter(x=>x.id||x.caption)};
  }
  return null;
}

function firstLine(text=''){return clean(String(text).split(/\n|[.!?]\s/)[0]||'',180);}
function captionSignals(text=''){
  const c=clean(text,1600);if(!c)return{available:false,hookScore:null,cta:false,specific:false,hook:''};
  const hook=firstLine(c);let s=34;
  if(hook.length>=16&&hook.length<=105)s+=17;if(/[?!]/.test(hook))s+=8;if(/\b\d+\b/.test(hook))s+=8;
  if(/\b(du|dein|deine|warum|wie|fehler|stop|achtung|niemand|wenn|so|mythos|wahrheit|you|your|why|how|mistake|truth)\b/i.test(hook))s+=14;
  if(/^(ich|wir|heute|hier|hello|hi)\b/i.test(hook)&&hook.length>70)s-=7;if(hook.length>150)s-=12;
  return{available:true,hookScore:Math.max(20,Math.min(95,s)),cta:/\b(folg|follow|komment|comment|schreib|dm|speicher|save|teil|share|link|bio|buch|termin|kontakt|mehr erfahren|mehr infos|jetzt|anfragen|buchen)\b/i.test(c),specific:/\b\d+[.,]?\d*\s*(%|€|eur|tage|wochen|monate|kunden|leads|views|aufrufe|follower|x)?\b/i.test(c),hook};
}
function daysAgo(ts){if(!ts)return null;const d=Math.round((Date.now()-Number(ts)*1000)/86400000);return Number.isFinite(d)?Math.max(0,d):null;}
function median(values=[]){const a=values.filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return null;const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;}
function contentEval(items=[]){
  const analyzed=items.map(i=>({...i,analysis:captionSignals(i.caption)}));
  const usable=analyzed.filter(i=>i.analysis.available);const hooks=usable.map(i=>i.analysis.hookScore).filter(Number.isFinite);
  const cta=usable.length?Math.round(usable.filter(i=>i.analysis.cta).length/usable.length*100):null;
  const specific=usable.length?Math.round(usable.filter(i=>i.analysis.specific).length/usable.length*100):null;
  const times=analyzed.map(i=>i.timestamp).filter(Number.isFinite).sort((a,b)=>b-a);const gaps=[];for(let i=0;i<times.length-1;i++)gaps.push((times[i]-times[i+1])/86400);
  const proxies=analyzed.map(i=>i.views!=null?i.views:(i.likes!=null||i.comments!=null?(i.likes||0)+(i.comments||0)*4:null)).filter(Number.isFinite);
  const perfMedian=median(proxies);
  const withPerformance=analyzed.map(i=>{const proxy=i.views!=null?i.views:(i.likes!=null||i.comments!=null?(i.likes||0)+(i.comments||0)*4:null);const ratio=proxy!=null&&perfMedian>0?proxy/perfMedian:null;return{...i,performanceProxy:proxy,performanceRatio:ratio,performanceLabel:ratio==null?'':ratio>=1.8?'Top-Performer':ratio>=1.2?'Über Median':ratio<=.65?'Unter Median':'Im Median'};});
  const best=withPerformance.filter(i=>Number.isFinite(i.performanceProxy)).sort((a,b)=>b.performanceProxy-a.performanceProxy)[0]||null;
  return{analyzed:withPerformance,usableCount:usable.length,avgHook:hooks.length?Math.round(hooks.reduce((a,b)=>a+b,0)/hooks.length):null,ctaRate:cta,specificRate:specific,daysSinceLatest:times[0]?daysAgo(times[0]):null,medianGap:gaps.length?Math.round(median(gaps)):null,performanceMedian:perfMedian,best};
}
function bioEval(bio='',external=''){
  const v=clean(bio,900);
  return{audience:/\b(für|for|helps?|helping|wir helfen|ich helfe|unternehmen|brands?|marken|hotels?|reisen|kunden|teams?|b2b|b2c)\b/i.test(v),outcome:/\b(mehr|wachstum|growth|reichweite|sichtbar|anfragen|leads|umsatz|sales|buchungen|bewerber|bekanntheit|vertrauen|ergebnis|results?)\b/i.test(v),offer:/\b(agentur|agency|beratung|consult|service|studio|coach|training|marketing|social media|content|design|shop|hotel|reisen|immobilien|software|saas)\b/i.test(v),cta:/\b(kontakt|contact|book|buchen|termin|dm|message|anfrage|shop|link|website|call|email|mail|jetzt|hier)\b/i.test(v),proof:/\b(\d+\+?|%|kunden|clients?|cases?|award|auszeichnung|seit\s+\d{4}|bewertungen|reviews?|million|mio\.?|tausend)\b/i.test(v),external:Boolean(external),length:v.length};
}
function average(items){const nums=items.filter(Number.isFinite);return nums.length?Math.round(nums.reduce((a,b)=>a+b,0)/nums.length):null;}
function evaluate(profile){
  const content=contentEval(profile.recentContent||[]),bio=bioEval(profile.bio,profile.externalUrl),cats=[];
  let clarity=30+(profile.fullName?16:0)+(profile.handle?10:0)+(profile.image?10:0)+(profile.bio?22:0)+(profile.category?8:0);
  cats.push({key:'clarity',label:'Profil-Klarheit',score:Math.min(96,clarity),available:Boolean(profile.fullName||profile.handle),evidence:profile.bio?'Name, Profilbild und Bio wurden erkannt.':'Profilidentität erkannt, Bio jedoch nicht belastbar auslesbar.'});
  if(profile.bio){
    const pos=Math.min(96,28+(bio.audience?22:0)+(bio.outcome?22:0)+(bio.offer?18:0)+(bio.length>=40&&bio.length<=260?10:0));
    cats.push({key:'positioning',label:'Positionierung',score:pos,available:true,evidence:[bio.audience?'Zielgruppe erkennbar':'Zielgruppe nicht klar benannt',bio.outcome?'Nutzen/Ergebnis erkennbar':'konkretes Ergebnis fehlt'].join(' · ')});
    const conv=Math.min(95,25+(bio.cta?28:0)+(bio.external?28:0)+(bio.outcome?10:0));
    cats.push({key:'conversion',label:'Conversion',score:conv,available:true,evidence:[bio.cta?'CTA erkannt':'kein klarer CTA erkannt',bio.external?'externer Link erkannt':'kein externer Link erkannt'].join(' · ')});
    const trust=Math.min(95,30+(profile.verified?20:0)+(profile.business?10:0)+(profile.category?8:0)+(bio.proof?22:0)+(content.specificRate!=null?Math.round(content.specificRate*.12):0));
    cats.push({key:'trust',label:'Proof & Vertrauen',score:trust,available:true,evidence:bio.proof?'Konkrete Proof-Signale im sichtbaren Text erkannt.':'Wenig konkrete Proof-Signale in der Bio erkannt.'});
  }else{
    for(const [key,label,evidence]of[['positioning','Positionierung','Bio nicht belastbar öffentlich verfügbar.'],['conversion','Conversion','Bio/Link nicht vollständig öffentlich verfügbar.'],['trust','Proof & Vertrauen','Zu wenig belastbare Profilsignale.']])cats.push({key,label,score:null,available:false,evidence});
  }
  if(content.usableCount>=3){
    let s=content.avgHook??50;if(content.ctaRate!=null)s=Math.round(s*.72+Math.min(95,35+content.ctaRate*.6)*.28);
    cats.push({key:'content',label:'Content & Hooks',score:Math.max(25,Math.min(95,s)),available:true,evidence:`${content.usableCount} aktuelle Captions analysiert · Ø Hook ${content.avgHook??'—'}/100 · CTA in ${content.ctaRate??'—'}%.`});
  }else cats.push({key:'content',label:'Content & Hooks',score:null,available:false,evidence:'Mindestens 3 aktuelle, öffentlich lesbare Captions nötig.'});
  if(content.analyzed.filter(i=>i.timestamp).length>=3){
    let s=78;if(content.daysSinceLatest>14)s-=18;if(content.daysSinceLatest>45)s-=18;if(content.medianGap>14)s-=15;if(content.medianGap!=null&&content.medianGap<=7)s+=8;
    cats.push({key:'activity',label:'Aktivität',score:Math.max(25,Math.min(95,s)),available:true,evidence:`Letzter sichtbarer Content vor ${content.daysSinceLatest??'—'} Tagen · Median-Abstand ${content.medianGap??'—'} Tage.`});
  }else cats.push({key:'activity',label:'Aktivität',score:null,available:false,evidence:'Zeitstempel aktueller Inhalte nicht ausreichend verfügbar.'});

  let completeness=0;if(profile.fullName||profile.handle)completeness+=10;if(profile.image)completeness+=5;if(profile.bio)completeness+=20;if(profile.externalUrl)completeness+=8;if(profile.category)completeness+=4;if(profile.metrics?.followers!=null)completeness+=5;if(profile.metrics?.posts!=null)completeness+=4;if(content.usableCount>=3)completeness+=26;if(content.analyzed.filter(i=>i.timestamp).length>=3)completeness+=8;if(content.analyzed.some(i=>i.likes!=null||i.comments!=null||i.views!=null))completeness+=10;completeness=Math.min(100,completeness);

  const profileReady=Boolean(profile.bio)&&cats.filter(i=>['positioning','conversion','trust'].includes(i.key)&&i.available).length>=3;
  const contentReady=content.usableCount>=3;
  const profileScore=profileReady?average(cats.filter(i=>['clarity','positioning','conversion','trust'].includes(i.key)&&i.available).map(i=>i.score)):null;
  const contentScore=contentReady?average(cats.filter(i=>['content','activity'].includes(i.key)&&i.available).map(i=>i.score)):null;
  const fullReady=profileReady&&contentReady&&completeness>=62;
  const score=fullReady?average([profileScore,contentScore]):null;
  const confidence=fullReady?(completeness>=82?'hoch':'mittel'):(profileReady||contentReady?'teilweise':'begrenzt');
  const auditLevel=fullReady?'full':profileReady&&contentReady?'partial':profileReady?'profile-only':contentReady?'content-only':'limited';
  const missing=[];
  if(!profile.bio)missing.push('Bio & Positionierung');
  if(!profile.externalUrl)missing.push('externer Profil-Link');
  if(!contentReady)missing.push('mindestens 3 aktuelle Captions');
  if(content.analyzed.filter(i=>i.timestamp).length<3)missing.push('Content-Zeitstempel');
  if(!content.analyzed.some(i=>i.likes!=null||i.comments!=null||i.views!=null))missing.push('öffentliche Performance-Signale');
  return{cats,content,bio,completeness,confidence,score,profileScore,contentScore,auditLevel,profileReady,contentReady,missing:[...new Set(missing)]};
}

function evidence(profile,e,p){
  const out=[];
  if(profile.bio)out.push({title:'Bio inhaltlich geprüft',text:`${profile.bio.length} Zeichen öffentlich auslesbar und in die Profilbewertung einbezogen.`,tone:'positive'});
  if(profile.metrics?.followers!=null)out.push({title:'Audience-Signal',text:`${profile.metrics.followers.toLocaleString('de-DE')} Follower öffentlich sichtbar.`,tone:'neutral'});
  if(e.content.usableCount)out.push({title:'Content-Sample',text:`${e.content.usableCount} aktuelle Captions wurden einzeln auf Hook-, CTA- und Spezifitäts-Signale geprüft.`,tone:'positive'});
  if(e.content.avgHook!=null)out.push({title:'Hook-Stärke',text:`Ø ${e.content.avgHook}/100 im analysierbaren Content-Sample.`,tone:e.content.avgHook>=68?'positive':'warning'});
  if(e.content.ctaRate!=null)out.push({title:'CTA-Abdeckung',text:`${e.content.ctaRate}% der analysierten Captions enthalten einen klaren Handlungsimpuls.`,tone:e.content.ctaRate>=50?'positive':'warning'});
  if(e.content.best?.analysis?.hook)out.push({title:'Stärkster öffentlicher Content im Sample',text:`„${clean(e.content.best.analysis.hook,120)}“${e.content.best.performanceLabel?` · ${e.content.best.performanceLabel}`:''}`,tone:'positive'});
  if(!profile.bio&&e.contentReady)out.push({title:'Teil-Audit statt Fantasiescore',text:'Aktuelle Inhalte sind analysierbar, die Bio/Positionierung aber nicht zuverlässig. Deshalb bleibt der Gesamt-Score bewusst aus.',tone:'warning'});
  if(!out.length)out.push({title:'Öffentliche Datengrenze',text:`${p} liefert für dieses Profil aktuell nur eine minimale öffentliche Datenbasis.`,tone:'warning'});
  return out.slice(0,7);
}
function recommendations(profile,e){
  const m=Object.fromEntries(e.cats.map(x=>[x.key,x])),out=[];const pri=s=>s<50?'Hohe Priorität':s<68?'Mittlere Priorität':'Optimierung';
  if(m.positioning?.available&&m.positioning.score<70)out.push({priority:pri(m.positioning.score),impact:'Klarheit',title:'Positionierung in 3 Sekunden verständlich machen',because:m.positioning.evidence,action:e.bio.audience?'Nutzen und konkretes Ergebnis in die erste Bio-Zeile ziehen.':'Zielgruppe + konkretes Ergebnis direkt in der ersten Bio-Zeile benennen.'});
  if(m.conversion?.available&&m.conversion.score<72)out.push({priority:pri(m.conversion.score),impact:'Conversion',title:'Einen einzigen nächsten Schritt definieren',because:m.conversion.evidence,action:profile.externalUrl?'Bio-CTA exakt auf den vorhandenen Link ausrichten.':'Einen klaren CTA plus passenden Ziel-Link ergänzen: Termin, Anfrage, Shop oder Lead-Magnet.'});
  if(m.content?.available&&m.content.score<70)out.push({priority:pri(m.content.score),impact:'Aufmerksamkeit',title:'Hooks als eigenes Produktionssystem behandeln',because:m.content.evidence,action:'Für jedes Thema drei Einstiege schreiben: Problem, Kontrast und konkrete Zahl/These. Gewinner wiederverwenden.'});
  if(m.trust?.available&&m.trust.score<70)out.push({priority:pri(m.trust.score),impact:'Vertrauen',title:'Proof konkreter machen',because:m.trust.evidence,action:'Resultate, Kundensituationen, Zahlen oder Vorher/Nachher-Belege näher an Profil und Top-Content holen.'});
  if(m.activity?.available&&m.activity.score<68)out.push({priority:pri(m.activity.score),impact:'Konsistenz',title:'Content-Rhythmus stabilisieren',because:m.activity.evidence,action:'Weniger Formate, dafür 2–3 wiederkehrende Serien mit festem Wochenrhythmus.'});
  if(e.content.ctaRate!=null&&e.content.ctaRate<45)out.push({priority:'Mittlere Priorität',impact:'Conversion',title:'Mehr Posts mit bewusstem Ziel veröffentlichen',because:`Nur ${e.content.ctaRate}% der analysierten Captions enthalten einen klaren Handlungsimpuls.`,action:'Vor Produktion festlegen: Reichweite, Vertrauen, Kommentar, DM oder Anfrage – und den CTA genau darauf bauen.'});
  if(e.content.best?.analysis?.hook&&e.content.best.performanceRatio>=1.4)out.push({priority:'Optimierung',impact:'Content-System',title:'Muster des stärksten Posts wiederverwenden',because:`Ein Inhalt liegt im öffentlichen Sample klar über dem Median. Sein Einstieg lautet: „${clean(e.content.best.analysis.hook,110)}“`,action:'Thema, Hook-Struktur und Format dieses Gewinners in 3 neue Varianten übersetzen – nicht einfach denselben Post kopieren.'});
  if(!profile.bio&&e.contentReady)out.push({priority:'Datenhinweis',impact:'Profil',title:'Profilstrategie nicht künstlich bewerten',because:'Die Plattform liefert Bio/Positionierung in diesem Abruf nicht zuverlässig aus.',action:'Die Content-Ergebnisse nutzen; Bio, Angebot und Conversion-Pfad in der persönlichen Analyse ergänzen.'});
  if(out.length<3)out.push({priority:'Optimierung',impact:'System',title:'Gewinner-Content systematisch vervielfachen',because:'Starke Einzelposts erzeugen mehr Wert, wenn ihr Muster erkannt und wiederverwendet wird.',action:'Top-Themen nach Hook, Format, Proof und CTA clustern und als Serien ausbauen.'});
  if(out.length<3)out.push({priority:'Optimierung',impact:'Journey',title:'Profil → Content → Anfrage als eine Journey bauen',because:'Ein gutes Profil konvertiert nicht, wenn Content und nächster Schritt unterschiedliche Botschaften senden.',action:'Top-3 Content-Themen, Bio-Versprechen und Zielseite auf dieselbe Kernbotschaft ausrichten.'});
  return out.slice(0,5);
}
function payload(p,url,profile){
  const e=evaluate(profile);
  return{ok:true,version:3,mode:e.auditLevel==='full'?'deep-public':e.auditLevel,source:profile.source,sources:profile.sources||[profile.source],platform:p,handle:profile.handle||handle(url,p),profileUrl:url.toString(),title:profile.fullName||profile.handle||p,description:profile.bio||'',image:profile.image||'',externalUrl:profile.externalUrl||'',category:profile.category||'',verified:Boolean(profile.verified),metrics:profile.metrics||{},dataCompleteness:e.completeness,analyzedPosts:e.content.usableCount,score:e.score,profileScore:e.profileScore,contentScore:e.contentScore,auditLevel:e.auditLevel,profileReady:e.profileReady,contentReady:e.contentReady,confidence:e.confidence,missingSignals:e.missing,categories:e.cats,evidence:evidence(profile,e,p),recommendations:recommendations(profile,e),recentContent:e.content.analyzed.slice(0,6).map(i=>({id:i.id,type:i.type,hook:i.analysis?.hook||'',hookScore:i.analysis?.hookScore??null,hasCta:Boolean(i.analysis?.cta),specific:Boolean(i.analysis?.specific),likes:i.likes,comments:i.comments,views:i.views,daysAgo:daysAgo(i.timestamp),performanceLabel:i.performanceLabel||'',performanceRatio:i.performanceRatio==null?null:Number(i.performanceRatio.toFixed(2))})),methodology:{totalScoreRule:'Gesamt-Score nur wenn Profilstrategie und mindestens 3 aktuelle Inhalte belastbar analysierbar sind.',privateInsights:false},note:e.score==null?'Teil-Audit: Wir zeigen keinen künstlichen Gesamt-Score, wenn Profil- oder Content-Signale fehlen. Alle sichtbaren Einzelwerte stammen nur aus tatsächlich gefundenen öffentlichen Daten.':'Vollständiger öffentlicher Audit: Profilstrategie und aktuelle Content-Signale waren ausreichend analysierbar. Private Insights wie Saves, Watchtime oder Conversions werden nicht verwendet.'};
}

module.exports=async function handler(req,res){
  if(req.method!=='POST'){res.setHeader('Allow','POST');return send(res,405,{error:'Method not allowed'});}
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{}),url=normalise(body.url||body.profile||''),p=platform(url.hostname);
    let profile=null,html='',meta={title:'',description:'',image:''},resolved=url;
    if(p==='Instagram'){
      const bundle=await instagramBundle(url).catch(()=>null);if(bundle){profile=bundle.profile;html=bundle.html;meta=bundle.meta;resolved=bundle.resolved;}
    }else{
      try{const f=await htmlPage(url);resolved=f.current;const type=f.response.headers.get('content-type')||'';if(f.response.ok&&type.includes('text/html')){html=await f.response.text();if(html.length>1800000)html=html.slice(0,1800000);meta=parseMeta(html);if(p==='TikTok')profile=tiktokDeep(html,url);}}catch(_){}
    }
    if(!profile)profile={...metaFallback(p,resolved,html,meta),sources:['page-metadata']};
    const out=payload(p,url,profile);
    console.log('jj_social_audit_v3',JSON.stringify({platform:p,sources:out.sources,mode:out.mode,completeness:out.dataCompleteness,analyzedPosts:out.analyzedPosts,score:out.score,profileScore:out.profileScore,contentScore:out.contentScore,confidence:out.confidence}));
    return send(res,200,out);
  }catch(error){console.error('jj_social_audit_v3_error',error?.message||error);return send(res,400,{error:error?.message||'Der Link konnte gerade nicht geprüft werden.'});}
};
