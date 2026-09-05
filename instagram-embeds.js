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
  css.href='instagram-embeds.css?v=20260905-12';
  css.dataset.instagramEmbedsCss='true';
  if(!css.parentNode)document.head.appendChild(css);

  const reelUrl=code=>`https://www.instagram.com/reel/${code}/`;
  // Instagram's public media endpoint provides the original post preview without
  // relying on the fragile cross-origin embed player. If Instagram blocks the
  // preview, the card keeps a clean branded fallback and the original link.
  const previewUrl=code=>`https://www.instagram.com/p/${code}/media/?size=l`;

  rail.className='jj-reel-proof-grid';
  rail.innerHTML=reels.map((post,index)=>`
    <article class="jj-reel-proof-card reveal visible">
      <div class="jj-reel-proof-kpi">
        <div><span>AUFRUFE</span><strong>${formatViews(reelViews[post.code])}</strong></div>
        <small><i aria-hidden="true"></i> dokumentiert</small>
      </div>
      <a class="jj-reel-proof-media jj-instagram-preview" href="${reelUrl(post.code)}" target="_blank" rel="noopener noreferrer" aria-label="${post.label} auf Instagram öffnen">
        <img src="${previewUrl(post.code)}" alt="Originalvorschau von ${post.label}: ${post.context}" loading="${index<2?'eager':'lazy'}" decoding="async" referrerpolicy="no-referrer">
        <span class="jj-instagram-preview-shade" aria-hidden="true"></span>
        <span class="jj-instagram-preview-badge" aria-hidden="true">Instagram</span>
        <span class="jj-instagram-preview-play" aria-hidden="true"><b>▶</b></span>
        <span class="jj-instagram-preview-copy"><small>Original Reel</small><strong>${post.context}</strong><em>Auf Instagram ansehen ↗</em></span>
      </a>
      <div class="jj-reel-proof-footer">
        <span>${post.label} · ${post.context}</span>
        <a href="${reelUrl(post.code)}" target="_blank" rel="noopener noreferrer">Original öffnen <span aria-hidden="true">↗</span></a>
      </div>
    </article>`).join('');

  rail.querySelectorAll('.jj-instagram-preview img').forEach(img=>{
    const fail=()=>{
      const media=img.closest('.jj-instagram-preview');
      if(!media)return;
      media.classList.add('is-fallback');
      img.hidden=true;
    };
    img.addEventListener('error',fail,{once:true});
    if(img.complete&&!img.naturalWidth)fail();
  });

  const headingCopy=document.querySelector('.viral-showcase .viral-heading p');
  if(headingCopy)headingCopy.textContent='Sechs echte Instagram-Reels mit dokumentierten Aufrufzahlen. Jede Karte führt direkt zum jeweiligen Originalpost – ohne fehleranfällige Instagram-Einbettung.';

  document.querySelector('.jj-feed-section')?.remove();
})();