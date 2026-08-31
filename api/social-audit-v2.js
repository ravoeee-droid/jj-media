const SOCIAL_HOSTS = ['instagram.com','tiktok.com','linkedin.com','facebook.com','threads.net'];
const IG_WEB_APP_ID = '936619743392459';

function send(res,status,body){
  res.statusCode=status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.end(JSON.stringify(body));
}

function allowedHost(hostname=''){
  const host=String(hostname).toLowerCase().replace(/^www\./,'');
  return SOCIAL_HOSTS.some(root=>host===root||host.endsWith(`.${root}`));
}

function platformFromHost(hostname=''){
  const host=String(hostname).toLowerCase();
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

function platformHandle(url,platform){
  const parts=url.pathname.split('/').filter(Boolean);
  if(platform==='LinkedIn'&&['in','company','school'].includes(parts[0])) return parts[1]||'';
  if(platform==='Facebook'&&parts[0]==='profile.php') return url.searchParams.get('id')||'';
  return (parts[0]||'').replace(/^@/,'');
}

function cleanText(value='',max=600){
  return String(value??'').replace(/\r/g,'').replace(/[\t ]+/g,' ').replace(/\n{3,}/g,'\n\n').trim().slice(0,max);
}

function decodeHtml(value=''){
  return cleanText(String(value)
    .replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'")
    .replace(/&lt;/gi,'<').replace(/&gt;/gi,'>')
    .replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCharCode(parseInt(n,16))),1200);
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
  return {
    title:decodeHtml(meta['og:title']||meta['twitter:title']||(titleMatch?.[1]||'')),
    description:decodeHtml(meta['og:description']||meta.description||meta['twitter:description']||''),
    image:meta['og:image']||meta['twitter:image']||''
  };
}

function numberFrom(value=''){
  if(value==null||value==='') return null;
  const normalized=String(value).trim().replace(/\s/g,'').replace(/(?<=\d),(?=\d{3}\b)/g,'').replace(',','.');
  const match=normalized.match(/([\d.]+)\s*([KMB])?/i);
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
    const match=String(text).match(re);
    const num=numberFrom(match?.[1]);
    if(num!=null) return num;
  }
  return null;
}

function metricsFromMeta(html,description,platform){
  const corpus=`${description} ${html.slice(0,1000000)}`;
  return {
    followers:firstMetric(corpus,[/([\d.,]+\s*[KMB]?)\s+Followers?/i,/"follower_count"\s*:\s*(\d+)/i,/"edge_followed_by"\s*:\s*\{\s*"count"\s*:\s*(\d+)/i]),
    following:firstMetric(corpus,[/([\d.,]+\s*[KMB]?)\s+Following/i,/"following_count"\s*:\s*(\d+)/i,/"edge_follow"\s*:\s*\{\s*"count"\s*:\s*(\d+)/i]),
    posts:firstMetric(corpus,[/([\d.,]+\s*[KMB]?)\s+Posts?/i,/"media_count"\s*:\s*(\d+)/i,/"edge_owner_to_timeline_media"\s*:\s*\{\s*"count"\s*:\s*(\d+)/i,/"videoCount"\s*:\s*(\d+)/i]),
    likes:platform==='TikTok'?firstMetric(corpus,[/([\d.,]+\s*[KMB]?)\s+Likes?/i,/"heartCount"\s*:\s*(\d+)/i]):null
  };
}

function generatedMetaDescription(text=''){
  const value=String(text);
  return /followers?|following|posts?|likes?/i.test(value)&&/instagram|tiktok|photos|videos|profil/i.test(value);
}

async function timedFetch(url,options={},timeout=7500){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeout);
  try{return await fetch(url,{...options,signal:controller.signal});}
  finally{clearTimeout(timer);}
}

async function fetchHtml(url){
  let current=new URL(url.toString());
  for(let hop=0;hop<4;hop+=1){
    if(!allowedHost(current.hostname)) throw new Error('Nicht erlaubte Weiterleitung.');
    const response=await timedFetch(current,{redirect:'manual',headers:{
      'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36',
      'accept':'text/html,application/xhtml+xml',
      'accept-language':'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
      'cache-control':'no-cache'
    }});
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

function captionFromNode(node={}){
  return cleanText(node?.edge_media_to_caption?.edges?.[0]?.node?.text||node?.caption?.text||node?.desc||'',1200);
}

function instagramPost(node={}){
  const caption=captionFromNode(node);
  const likes=node?.edge_liked_by?.count??node?.edge_media_preview_like?.count??null;
  const comments=node?.edge_media_to_comment?.count??node?.edge_media_to_parent_comment?.count??null;
  const views=node?.video_view_count??node?.video_play_count??null;
  const timestamp=node?.taken_at_timestamp??node?.taken_at??null;
  return {
    id:String(node?.shortcode||node?.code||node?.id||''),
    type:(node?.is_video||node?.product_type==='clips')?'Reel/Video':'Post',
    caption,
    likes:Number.isFinite(Number(likes))?Number(likes):null,
    comments:Number.isFinite(Number(comments))?Number(comments):null,
    views:Number.isFinite(Number(views))?Number(views):null,
    timestamp:Number.isFinite(Number(timestamp))?Number(timestamp):null
  };
}

async function fetchInstagramDeep(url){
  const username=platformHandle(url,'Instagram');
  if(!username||!/^[a-z0-9._]{2,80}$/i.test(username)) return null;
  const endpoint=`https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;
  const response=await timedFetch(endpoint,{headers:{
    'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36',
    'accept':'*/*',
    'accept-language':'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
    'x-ig-app-id':IG_WEB_APP_ID,
    'referer':`https://www.instagram.com/${username}/`
  }},7000);
  if(!response.ok) return null;
  const json=await response.json().catch(()=>null);
  const user=json?.data?.user||json?.user||null;
  if(!user) return null;
  const edges=user?.edge_owner_to_timeline_media?.edges||user?.edge_felix_video_timeline?.edges||[];
  const recentContent=edges.slice(0,9).map(edge=>instagramPost(edge?.node||edge)).filter(item=>item.id||item.caption);
  return {
    source:'instagram-profile-api',
    fullName:cleanText(user.full_name||username,180),
    handle:cleanText(user.username||username,100),
    bio:cleanText(user.biography||'',700),
    image:user.profile_pic_url_hd||user.profile_pic_url||'',
    externalUrl:user.external_url||'',
    category:cleanText(user.category_name||user.business_category_name||'',120),
    verified:Boolean(user.is_verified),
    business:Boolean(user.is_business_account||user.is_professional_account),
    metrics:{
      followers:Number.isFinite(Number(user?.edge_followed_by?.count))?Number(user.edge_followed_by.count):null,
      following:Number.isFinite(Number(user?.edge_follow?.count))?Number(user.edge_follow.count):null,
      posts:Number.isFinite(Number(user?.edge_owner_to_timeline_media?.count))?Number(user.edge_owner_to_timeline_media.count):null,
      likes:null
    },
    recentContent
  };
}

function collectJsonScripts(html=''){
  const scripts=[];
  const regex=/<script[^>]*(?:id=["'](?:__UNIVERSAL_DATA_FOR_REHYDRATION__|SIGI_STATE)["'])?[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while((match=regex.exec(html))){
    const raw=match[1].trim();
    if(!raw||raw.length>2500000) continue;
    try{scripts.push(JSON.parse(raw));}catch(_){}
  }
  return scripts;
}

function walkForTikTok(root){
  const seen=new Set();
  const queue=[root];
  let user=null,stats=null,items=[];
  while(queue.length&&seen.size<9000){
    const value=queue.shift();
    if(!value||typeof value!=='object'||seen.has(value)) continue;
    seen.add(value);
    if(!user&&value.uniqueId&&('nickname' in value||'signature' in value)) user=value;
    if(!stats&&('followerCount' in value)&&('followingCount' in value)) stats=value;
    if(Array.isArray(value.itemList)&&value.itemList.length) items=value.itemList;
    for(const child of Object.values(value)) if(child&&typeof child==='object') queue.push(child);
  }
  return {user,stats,items};
}

function tiktokPost(item={}){
  const stats=item.stats||item.statsV2||{};
  return {
    id:String(item.id||''),
    type:'Video',
    caption:cleanText(item.desc||'',1200),
    likes:Number.isFinite(Number(stats.diggCount))?Number(stats.diggCount):null,
    comments:Number.isFinite(Number(stats.commentCount))?Number(stats.commentCount):null,
    views:Number.isFinite(Number(stats.playCount))?Number(stats.playCount):null,
    timestamp:Number.isFinite(Number(item.createTime))?Number(item.createTime):null
  };
}

function extractTikTokDeep(html,url){
  for(const json of collectJsonScripts(html)){
    const found=walkForTikTok(json);
    if(!found.user&&!found.stats) continue;
    const user=found.user||{};
    const stats=found.stats||{};
    return {
      source:'tiktok-page-json',
      fullName:cleanText(user.nickname||platformHandle(url,'TikTok'),180),
      handle:cleanText(user.uniqueId||platformHandle(url,'TikTok'),100),
      bio:cleanText(user.signature||'',700),
      image:user.avatarLarger||user.avatarMedium||user.avatarThumb||'',
      externalUrl:user.bioLink?.link||'',
      category:'',
      verified:Boolean(user.verified),
      business:Boolean(user.commerceUserInfo?.commerceUser||false),
      metrics:{
        followers:Number.isFinite(Number(stats.followerCount))?Number(stats.followerCount):null,
        following:Number.isFinite(Number(stats.followingCount))?Number(stats.followingCount):null,
        posts:Number.isFinite(Number(stats.videoCount))?Number(stats.videoCount):null,
        likes:Number.isFinite(Number(stats.heartCount))?Number(stats.heartCount):null
      },
      recentContent:(found.items||[]).slice(0,9).map(tiktokPost).filter(item=>item.id||item.caption)
    };
  }
  return null;
}

function firstLine(text=''){
  return cleanText(String(text).split(/\n|[.!?]\s/)[0]||'',180);
}

function analyzeCaption(text=''){
  const caption=cleanText(text,1500);
  if(!caption) return {available:false,hookScore:null,cta:false,specific:false,hook:''};
  const hook=firstLine(caption);
  let hookScore=36;
  if(hook.length>=18&&hook.length<=110) hookScore+=15;
  if(/[?!]/.test(hook)) hookScore+=8;
  if(/^\d|\b\d+\b/.test(hook)) hookScore+=7;
  if(/\b(du|dein|deine|warum|wie|fehler|stop|achtung|niemand|dieser|diese|das|wenn|so|3|5|7|you|your|why|how|mistake|stop)\b/i.test(hook)) hookScore+=14;
  if(hook.length>150) hookScore-=12;
  const cta=/\b(folg|follow|komment|comment|schreib|dm|speicher|save|teil|share|link|bio|buch|termin|kontakt|mehr erfahren|mehr infos|jetzt)\b/i.test(caption);
  const specific=/\b\d+[.,]?\d*\s*(%|€|eur|tage|wochen|monate|kunden|leads|views|aufrufe|follower)?\b/i.test(caption);
  return {available:true,hookScore:Math.max(20,Math.min(95,hookScore)),cta,specific,hook};
}

function daysSince(timestamp){
  if(!timestamp) return null;
  const ms=Date.now()-(Number(timestamp)*1000);
  if(!Number.isFinite(ms)) return null;
  return Math.max(0,Math.round(ms/86400000));
}

function median(values=[]){
  const nums=values.filter(Number.isFinite).sort((a,b)=>a-b);
  if(!nums.length) return null;
  const mid=Math.floor(nums.length/2);
  return nums.length%2?nums[mid]:(nums[mid-1]+nums[mid])/2;
}

function contentSignals(items=[]){
  const analyzed=items.map(item=>({...item,analysis:analyzeCaption(item.caption)}));
  const usable=analyzed.filter(item=>item.analysis.available);
  const hookScores=usable.map(item=>item.analysis.hookScore).filter(Number.isFinite);
  const ctaRate=usable.length?usable.filter(item=>item.analysis.cta).length/usable.length:null;
  const specificRate=usable.length?usable.filter(item=>item.analysis.specific).length/usable.length:null;
  const timestamps=analyzed.map(item=>item.timestamp).filter(Number.isFinite).sort((a,b)=>b-a);
  const gaps=[];
  for(let i=0;i<timestamps.length-1;i+=1) gaps.push((timestamps[i]-timestamps[i+1])/86400);
  return {
    analyzed,
    usableCount:usable.length,
    avgHook:hookScores.length?Math.round(hookScores.reduce((a,b)=>a+b,0)/hookScores.length):null,
    ctaRate:ctaRate==null?null:Math.round(ctaRate*100),
    specificRate:specificRate==null?null:Math.round(specificRate*100),
    daysSinceLatest:timestamps[0]?daysSince(timestamps[0]):null,
    medianGap:gaps.length?Math.round(median(gaps)):null
  };
}

function bioSignals(bio='',externalUrl=''){
  const value=cleanText(bio,900);
  const hasAudience=/\b(für|for|helps?|helping|wir helfen|ich helfe|unternehmen|brands?|marken|hotels?|reisen|kunden|teams?|familien|frauen|männer|b2b|b2c)\b/i.test(value);
  const hasOutcome=/\b(mehr|steig|wachstum|growth|reichweite|sichtbar|anfragen|leads|umsatz|verkauf|sales|buchungen|bewerber|bekanntheit|vertrauen|ergebnis|results?)\b/i.test(value);
  const hasOffer=/\b(agentur|agency|beratung|consult|service|studio|coach|training|marketing|social media|content|design|shop|hotel|reisen|immobilien|software|saas)\b/i.test(value);
  const hasCta=/\b(kontakt|contact|book|buchen|termin|dm|message|anfrage|shop|link|website|call|email|mail|jetzt|hier)\b/i.test(value);
  const hasProof=/\b(\d+\+?|%|kunden|clients?|cases?|award|auszeichnung|seit\s+\d{4}|bewertungen|reviews?|million|mio\.?|tausend|k\b)\b/i.test(value);
  return {hasAudience,hasOutcome,hasOffer,hasCta,hasProof,hasExternal:Boolean(externalUrl),length:value.length};
}

function buildEvaluation(profile){
  const content=contentSignals(profile.recentContent||[]);
  const bio=bioSignals(profile.bio||'',profile.externalUrl||'');
  const categories=[];

  let clarity=30;
  if(profile.fullName) clarity+=16;
  if(profile.handle) clarity+=10;
  if(profile.image) clarity+=10;
  if(profile.bio) clarity+=22;
  if(profile.category) clarity+=8;
  categories.push({key:'clarity',label:'Profil-Klarheit',score:Math.min(96,clarity),available:Boolean(profile.fullName||profile.handle),evidence:profile.bio?'Name, Profilbild und Bio wurden erkannt.':'Profilidentität erkannt, Bio jedoch nicht belastbar auslesbar.'});

  if(profile.bio){
    let positioning=28 + (bio.hasAudience?22:0) + (bio.hasOutcome?22:0) + (bio.hasOffer?18:0) + (bio.length>=40&&bio.length<=260?10:0);
    categories.push({key:'positioning',label:'Positionierung',score:Math.min(96,positioning),available:true,evidence:[bio.hasAudience?'Zielgruppe erkennbar':'Zielgruppe nicht klar benannt',bio.hasOutcome?'Nutzen/Ergebnis erkennbar':'konkretes Ergebnis fehlt'].join(' · ')});

    let conversion=25 + (bio.hasCta?28:0) + (bio.hasExternal?28:0) + (bio.hasOutcome?10:0);
    categories.push({key:'conversion',label:'Conversion',score:Math.min(95,conversion),available:true,evidence:[bio.hasCta?'CTA erkannt':'kein klarer CTA erkannt',bio.hasExternal?'externer Link erkannt':'kein externer Link erkannt'].join(' · ')});

    let trust=30 + (profile.verified?20:0) + (profile.business?10:0) + (profile.category?8:0) + (bio.hasProof?22:0);
    if(content.specificRate!=null) trust+=Math.round(content.specificRate*.12);
    categories.push({key:'trust',label:'Proof & Vertrauen',score:Math.min(95,trust),available:true,evidence:bio.hasProof?'Konkrete Proof-Signale im sichtbaren Text erkannt.':'Wenig konkrete Proof-Signale in der Bio erkannt.'});
  }else{
    categories.push({key:'positioning',label:'Positionierung',score:null,available:false,evidence:'Bio nicht belastbar öffentlich verfügbar.'});
    categories.push({key:'conversion',label:'Conversion',score:null,available:false,evidence:'Bio/Link nicht vollständig öffentlich verfügbar.'});
    categories.push({key:'trust',label:'Proof & Vertrauen',score:null,available:false,evidence:'Zu wenig belastbare Textsignale.'});
  }

  if(content.usableCount>=3){
    let contentScore=content.avgHook??50;
    if(content.ctaRate!=null) contentScore=Math.round(contentScore*.72 + Math.min(95,35+content.ctaRate*.6)*.28);
    categories.push({key:'content',label:'Content & Hooks',score:Math.max(25,Math.min(95,contentScore)),available:true,evidence:`${content.usableCount} aktuelle Captions analysiert · Ø Hook ${content.avgHook??'—'}/100 · CTA in ${content.ctaRate??'—'}%.`});
  }else{
    categories.push({key:'content',label:'Content & Hooks',score:null,available:false,evidence:'Mindestens 3 aktuelle, öffentlich lesbare Captions nötig.'});
  }

  if(content.analyzed.filter(item=>item.timestamp).length>=3){
    let activity=78;
    if(content.daysSinceLatest!=null&&content.daysSinceLatest>14) activity-=18;
    if(content.daysSinceLatest!=null&&content.daysSinceLatest>45) activity-=18;
    if(content.medianGap!=null&&content.medianGap>14) activity-=15;
    if(content.medianGap!=null&&content.medianGap<=7) activity+=8;
    categories.push({key:'activity',label:'Aktivität',score:Math.max(25,Math.min(95,activity)),available:true,evidence:`Letzter sichtbarer Content vor ${content.daysSinceLatest??'—'} Tagen · Median-Abstand ${content.medianGap??'—'} Tage.`});
  }else{
    categories.push({key:'activity',label:'Aktivität',score:null,available:false,evidence:'Zeitstempel aktueller Inhalte nicht ausreichend verfügbar.'});
  }

  let completeness=0;
  if(profile.fullName||profile.handle) completeness+=12;
  if(profile.image) completeness+=6;
  if(profile.bio) completeness+=18;
  if(profile.externalUrl) completeness+=8;
  if(profile.category) completeness+=5;
  if(profile.metrics?.followers!=null) completeness+=6;
  if(profile.metrics?.posts!=null) completeness+=5;
  if(content.usableCount>=3) completeness+=25;
  if(content.analyzed.filter(item=>item.timestamp).length>=3) completeness+=8;
  if(content.analyzed.some(item=>item.likes!=null||item.comments!=null||item.views!=null)) completeness+=7;
  completeness=Math.min(100,completeness);

  const available=categories.filter(item=>item.available&&Number.isFinite(item.score));
  const substantive=available.filter(item=>item.key!=='clarity');
  const confidence=completeness>=75&&substantive.length>=4?'hoch':completeness>=55&&substantive.length>=2?'mittel':'begrenzt';
  const score=confidence==='begrenzt'?null:Math.round(available.reduce((sum,item)=>sum+item.score,0)/available.length);
  return {categories,content,bio,completeness,confidence,score};
}

function priorityFromScore(score){
  if(score==null) return 'Daten fehlen';
  if(score<50) return 'Hohe Priorität';
  if(score<68) return 'Mittlere Priorität';
  return 'Optimierung';
}

function buildEvidence(profile,evaluation,platform){
  const findings=[];
  const metrics=profile.metrics||{};
  if(profile.bio) findings.push({title:'Bio ausgelesen',text:`${profile.bio.length} Zeichen öffentlich analysierbar.`,tone:'positive'});
  if(metrics.followers!=null) findings.push({title:'Audience-Signal',text:`${metrics.followers.toLocaleString('de-DE')} Follower öffentlich sichtbar.`,tone:'neutral'});
  if(evaluation.content.usableCount) findings.push({title:'Content-Daten',text:`${evaluation.content.usableCount} aktuelle Captions konnten konkret auf Hook- und CTA-Signale geprüft werden.`,tone:'positive'});
  if(evaluation.content.avgHook!=null) findings.push({title:'Hook-Stärke',text:`Ø ${evaluation.content.avgHook}/100 über die analysierbaren aktuellen Inhalte.`,tone:evaluation.content.avgHook>=68?'positive':'warning'});
  if(evaluation.content.ctaRate!=null) findings.push({title:'CTA-Abdeckung',text:`In ${evaluation.content.ctaRate}% der analysierten Captions wurde ein klarer Handlungsimpuls erkannt.`,tone:evaluation.content.ctaRate>=50?'positive':'warning'});
  if(evaluation.content.daysSinceLatest!=null) findings.push({title:'Aktualität',text:`Letzter öffentlich erkannter Inhalt vor ${evaluation.content.daysSinceLatest} Tagen.`,tone:evaluation.content.daysSinceLatest<=14?'positive':'warning'});
  if(!findings.length) findings.push({title:'Öffentliche Datengrenze',text:`${platform} liefert für dieses Profil aktuell nur eine minimale öffentliche Datenbasis.`,tone:'warning'});
  return findings.slice(0,6);
}

function buildRecommendations(profile,evaluation){
  const map=Object.fromEntries(evaluation.categories.map(item=>[item.key,item]));
  const recs=[];
  if(map.positioning?.available&&map.positioning.score<70){
    recs.push({priority:priorityFromScore(map.positioning.score),impact:'Klarheit',title:'Positionierung in 3 Sekunden verständlich machen',because:map.positioning.evidence,action:evaluation.bio.hasAudience?'Nutzen und konkretes Ergebnis in die erste Bio-Zeile ziehen.':'Zielgruppe + konkretes Ergebnis direkt in der ersten Bio-Zeile benennen.'});
  }
  if(map.conversion?.available&&map.conversion.score<72){
    recs.push({priority:priorityFromScore(map.conversion.score),impact:'Conversion',title:'Einen einzigen nächsten Schritt definieren',because:map.conversion.evidence,action:profile.externalUrl?'Bio-CTA exakt auf den vorhandenen Link ausrichten.':'Einen klaren CTA plus passenden Ziel-Link ergänzen: Termin, Anfrage, Shop oder Lead-Magnet.'});
  }
  if(map.content?.available&&map.content.score<70){
    recs.push({priority:priorityFromScore(map.content.score),impact:'Aufmerksamkeit',title:'Hooks als eigenes Produktionssystem behandeln',because:map.content.evidence,action:'Für jedes Thema 3 Einstiege schreiben: Problem, Kontrast und konkrete Zahl/These. Gewinner anschließend wiederverwenden.'});
  }
  if(map.trust?.available&&map.trust.score<70){
    recs.push({priority:priorityFromScore(map.trust.score),impact:'Vertrauen',title:'Proof aus Behauptungen machen',because:map.trust.evidence,action:'Konkrete Resultate, Kundennamen/-situationen, Zahlen oder Vorher/Nachher-Belege näher an Profil und Top-Content holen.'});
  }
  if(map.activity?.available&&map.activity.score<68){
    recs.push({priority:priorityFromScore(map.activity.score),impact:'Konsistenz',title:'Content-Rhythmus stabilisieren',because:map.activity.evidence,action:'Weniger Formate, dafür 2–3 wiederkehrende Serien mit festem Wochenrhythmus planen.'});
  }
  if(evaluation.content.ctaRate!=null&&evaluation.content.ctaRate<45){
    recs.push({priority:'Mittlere Priorität',impact:'Conversion',title:'Mehr Posts mit bewusstem Ziel veröffentlichen',because:`Nur ${evaluation.content.ctaRate}% der analysierten Captions enthalten einen klaren Handlungsimpuls.`,action:'Vor Produktion festlegen: Soll dieser Post Reichweite, Vertrauen, Kommentar, DM oder Anfrage erzeugen? CTA passend dazu formulieren.'});
  }
  if(recs.length<3) recs.push({priority:'Optimierung',impact:'System',title:'Gewinner-Content systematisch vervielfachen',because:'Starke Einzelposts erzeugen mehr Wert, wenn ihr Muster erkannt und wiederverwendet wird.',action:'Top-Themen nach Hook, Format, Proof und CTA clustern und als wiederkehrende Serien ausbauen.'});
  if(recs.length<3) recs.push({priority:'Optimierung',impact:'Journey',title:'Profil → Content → Anfrage als eine Journey bauen',because:'Ein gutes Profil allein konvertiert nicht, wenn Content und nächster Schritt unterschiedliche Botschaften senden.',action:'Top-3 Content-Themen, Bio-Versprechen und Zielseite auf dieselbe Kernbotschaft ausrichten.'});
  return recs.slice(0,5);
}

function fallbackProfile({platform,url,html='',meta=null}){
  const parsed=meta||parseMeta(html);
  const metrics=metricsFromMeta(html,parsed.description,platform);
  const handle=platformHandle(url,platform);
  return {
    source:'page-metadata',
    fullName:cleanText(parsed.title||handle||platform,180),
    handle,
    bio:generatedMetaDescription(parsed.description)?'':cleanText(parsed.description,700),
    image:parsed.image||'',
    externalUrl:'',
    category:'',
    verified:/"is_verified"\s*:\s*true|verified badge|aria-label=["']verified["']/i.test(html),
    business:false,
    metrics,
    recentContent:[]
  };
}

function resultPayload({platform,url,profile}){
  const evaluation=buildEvaluation(profile);
  const evidence=buildEvidence(profile,evaluation,platform);
  const recommendations=buildRecommendations(profile,evaluation);
  const recentContent=evaluation.content.analyzed.slice(0,6).map(item=>({
    id:item.id,
    type:item.type,
    hook:item.analysis?.hook||'',
    hookScore:item.analysis?.hookScore??null,
    hasCta:Boolean(item.analysis?.cta),
    specific:Boolean(item.analysis?.specific),
    likes:item.likes,
    comments:item.comments,
    views:item.views,
    daysAgo:daysSince(item.timestamp)
  }));
  const mode=evaluation.confidence==='begrenzt'?'limited':profile.recentContent?.length?'deep-public':'profile-public';
  return {
    ok:true,
    version:2,
    mode,
    source:profile.source,
    platform,
    handle:profile.handle||platformHandle(url,platform),
    profileUrl:url.toString(),
    title:profile.fullName||profile.handle||platform,
    description:profile.bio||'',
    image:profile.image||'',
    externalUrl:profile.externalUrl||'',
    category:profile.category||'',
    verified:Boolean(profile.verified),
    metrics:profile.metrics||{followers:null,following:null,posts:null,likes:null},
    dataCompleteness:evaluation.completeness,
    analyzedPosts:evaluation.content.usableCount,
    score:evaluation.score,
    confidence:evaluation.confidence,
    categories:evaluation.categories,
    evidence,
    recommendations,
    recentContent,
    note:evaluation.score==null
      ?'Kein künstlicher Gesamt-Score: Für eine belastbare Bewertung fehlen aktuell ausreichend öffentlich lesbare Signale. Die sichtbaren Einzelbefunde stammen nur aus tatsächlich gefundenen Daten.'
      :'Der JJ Social Score bewertet öffentlich lesbare Profil-, Positionierungs-, Conversion-, Proof- und Content-Signale. Er nutzt keine privaten Insights und ist keine Reichweiten- oder Umsatzprognose.'
  };
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
    let html='',resolved=url,meta={title:'',description:'',image:''};
    let profile=null;

    if(platform==='Instagram'){
      try{profile=await fetchInstagramDeep(url);}catch(_){}
    }

    if(!profile||platform==='TikTok'){
      try{
        const fetched=await fetchHtml(url);
        resolved=fetched.current;
        const contentType=fetched.response.headers.get('content-type')||'';
        if(fetched.response.ok&&contentType.includes('text/html')){
          html=await fetched.response.text();
          if(html.length>1800000) html=html.slice(0,1800000);
          meta=parseMeta(html);
          if(platform==='TikTok') profile=extractTikTokDeep(html,url)||profile;
        }
      }catch(_){}
    }

    if(!profile) profile=fallbackProfile({platform,url:resolved,html,meta});
    const result=resultPayload({platform,url,profile});
    console.log('jj_social_audit_v2',JSON.stringify({platform,source:result.source,mode:result.mode,completeness:result.dataCompleteness,analyzedPosts:result.analyzedPosts,score:result.score,confidence:result.confidence}));
    return send(res,200,result);
  }catch(error){
    console.error('jj_social_audit_v2_error',error?.message||error);
    return send(res,400,{error:error?.message||'Der Link konnte gerade nicht geprüft werden.'});
  }
};