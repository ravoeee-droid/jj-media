(() => {
  const rail=document.querySelector('.viral-card-rail');
  if(!rail)return;

  const reelViews=window.JJ_MEDIA_REEL_VIEWS||{};
  const formatViews=value=>{
    if(value===null||value===undefined||value==='')return '—';
    if(typeof value==='string')return value;
    return new Intl.NumberFormat('de-DE').format(value);
  };

  const reels=[
    {code:'DbNajc2Rdo4',label:'Reel 01',context:'Storytelling · Feed Stopper'},
    {code:'Dbf1jZOMaQt',label:'Reel 02',context:'Reise-Content · Community'},
    {code:'DcF9GhGxls2',label:'Reel 03',context:'Top Performer · Reichweite'},
    {code:'DbsVHalgz3N',label:'Reel 04',context:'Hook · Markenbild'},
    {code:'DZ44gXtvAob',label:'Reel 05',context:'Content-System · Wiedererkennung'},
    {code:'DareM3sxe6n',label:'Reel 06',context:'Organic · Storytelling'}
  ];

  const css=document.querySelector('link[href*="instagram-embeds.css"]')||document.createElement('link');
  css.rel='stylesheet';
  css.href='instagram-embeds.css?v=20260905-11';
  css.dataset.instagramEmbedsCss='true';
  if(!css.parentNode)document.head.appendChild(css);

  rail.className='jj-reel-proof-grid';
  rail.innerHTML=reels.map((post,index)=>{
    const reelUrl=`https://www.instagram.com/reel/${post.code}/`;
    const embedUrl=`${reelUrl}embed/`;
    return `
      <article class="jj-reel-proof-card reveal visible">
        <div class="jj-reel-proof-kpi">
          <div><span>AUFRUFE</span><strong>${formatViews(reelViews[post.code])}</strong></div>
          <small><i aria-hidden="true"></i> dokumentiert</small>
        </div>
        <div class="jj-reel-proof-media jj-instagram-player">
          <iframe
            src="${embedUrl}"
            title="${post.label}: ${post.context}"
            loading="${index<2?'eager':'lazy'}"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"></iframe>
        </div>
        <div class="jj-reel-proof-footer">
          <span>${post.label} · ${post.context}</span>
          <a href="${reelUrl}" target="_blank" rel="noopener noreferrer">Auf Instagram öffnen <span aria-hidden="true">↗</span></a>
        </div>
      </article>`;
  }).join('');

  const headingCopy=document.querySelector('.viral-showcase .viral-heading p');
  if(headingCopy)headingCopy.textContent='Sechs echte Instagram-Reels mit dokumentierten Aufrufzahlen. Die Originalposts lassen sich direkt hier abspielen.';

  document.querySelector('.jj-feed-section')?.remove();
})();