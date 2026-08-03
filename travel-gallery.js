(() => {
  if (!document.body.classList.contains('travel-body') || document.querySelector('.travel-inspiration')) return;

  const posts = [
    { src: 'assets/travel-gallery/02-orangutan-baby.svg', alt: 'Orang-Utan-Mutter mit Baby im Regenwald', place: 'Borneo · Malaysia', likes: '12.408', caption: 'Nähe, die keine Inszenierung braucht.' },
    { src: 'assets/travel-gallery/06-whale-boat.svg', alt: 'Wal springt neben einem Expeditionsboot aus dem Meer', place: 'Nordmeer · Expedition', likes: '18.912', caption: 'Der Moment, in dem aus Zuschauen Staunen wird.' },
    { src: 'assets/travel-gallery/07-tiger-eyes.svg', alt: 'Tiger blickt aus hohem Gras über das Wasser', place: 'Ranthambore · Indien', likes: '9.847', caption: 'Manchmal erzählt ein Blick die ganze Reise.' },
    { src: 'assets/travel-gallery/12-bioluminescent-sea.svg', alt: 'Paar steht nachts in blau leuchtendem Meer', place: 'Inselnacht · Indischer Ozean', likes: '21.306', caption: 'Das Meer leuchtete. Und plötzlich war alles still.' },
    { src: 'assets/cases/reisen-erleben-feed.jpg', alt: 'Instagram-Feed von Reisen und Erleben', place: 'Alpenpässe · Motorradreisen', likes: '6.284', caption: 'Aus Route wird Vorfreude. Aus Content wird Nachfrage.' },
    { src: 'assets/jessica/jessica-travel-premium.webp', alt: 'Jessica auf einer mediterranen Hotelterrasse', place: 'Mediterranean · Hospitality', likes: '4.971', caption: 'Strategie, die sich wie Fernweh anfühlt.' },
    { src: 'assets/cases/village-before.jpg', alt: 'Village Adventures Instagram-Profil vor der Zusammenarbeit', place: 'Village Adventures · Start', likes: '225', caption: 'Jede starke Wachstumsgeschichte beginnt irgendwo.' },
    { src: 'assets/cases/village-after.jpg', alt: 'Village Adventures Instagram-Profil nach vier Monaten', place: 'Village Adventures · Wachstum', likes: '1.327', caption: 'Vier Monate später: sichtbar, relevant, gewachsen.' }
  ];

  const style = document.createElement('style');
  style.textContent = `
  .travel-inspiration{position:relative;overflow:hidden;padding:120px 0;background:#f4efe8;color:#111014}
  .travel-inspiration:before{content:'';position:absolute;width:680px;height:680px;border-radius:50%;background:rgba(228,81,103,.13);filter:blur(140px);right:-260px;top:10%;pointer-events:none}
  .travel-inspiration:after{content:'SCROLL THE FEED';position:absolute;left:-2vw;bottom:22px;font-size:clamp(4rem,10vw,9rem);font-weight:800;letter-spacing:-.07em;color:rgba(17,16,20,.035);white-space:nowrap;pointer-events:none}
  .travel-inspiration-grid{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,.78fr) minmax(430px,1.22fr);gap:clamp(60px,8vw,120px);align-items:center}
  .travel-inspiration-copy{max-width:500px}
  .travel-inspiration-copy h2{font-size:clamp(3.5rem,6.2vw,6.7rem);line-height:.9;letter-spacing:-.065em;margin:16px 0 28px}
  .travel-inspiration-copy h2 span{font-family:'Playfair Display',serif;color:var(--coral)}
  .travel-inspiration-copy p{font-size:1.1rem;line-height:1.75;color:var(--muted);max-width:470px}
  .travel-inspiration-hint{display:flex;align-items:center;gap:12px;margin-top:34px;font-size:.78rem;font-weight:800;letter-spacing:.11em;text-transform:uppercase}
  .travel-inspiration-hint i{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:var(--ink);color:white;font-style:normal;animation:travelHint 1.8s ease-in-out infinite}
  @keyframes travelHint{50%{transform:translateY(5px)}}

  .travel-phone-stage{position:relative;min-height:760px;display:grid;place-items:center;perspective:1400px}
  .travel-phone-glow{position:absolute;width:430px;height:430px;border-radius:50%;background:radial-gradient(circle,rgba(255,157,172,.7),rgba(228,81,103,.12) 55%,transparent 72%);filter:blur(26px);opacity:.55}
  .travel-phone{position:relative;z-index:3;width:min(390px,86vw);height:min(750px,78vh);min-height:620px;padding:11px;border-radius:52px;background:#08080b;box-shadow:0 50px 120px rgba(28,19,23,.35),0 0 0 1px rgba(255,255,255,.08) inset;transform:rotateY(-4deg) rotateX(1deg);transition:transform .5s cubic-bezier(.2,.8,.2,1)}
  .travel-phone:hover{transform:rotateY(0) rotateX(0) translateY(-5px)}
  .travel-phone:before{content:'';position:absolute;z-index:10;top:18px;left:50%;translate:-50% 0;width:108px;height:28px;border-radius:999px;background:#050507;box-shadow:0 1px 0 rgba(255,255,255,.06)}
  .travel-phone-screen{position:relative;height:100%;overflow:hidden;border-radius:42px;background:#fff;color:#111}
  .travel-ig-header{position:absolute;z-index:7;top:0;left:0;right:0;height:78px;padding:24px 18px 10px;display:flex;align-items:end;justify-content:space-between;background:linear-gradient(#fff 76%,rgba(255,255,255,.94));border-bottom:1px solid #eee}
  .travel-ig-brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:.92rem}
  .travel-ig-avatar{width:31px;height:31px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#ff9dac,#e45167);color:#fff;font-size:.66rem;border:2px solid #fff;box-shadow:0 0 0 2px #e45167}
  .travel-ig-actions{display:flex;gap:13px;font-size:1.15rem}
  .travel-feed{position:absolute;inset:78px 0 0;overflow-y:auto;overscroll-behavior:contain;scroll-snap-type:y mandatory;scrollbar-width:none;touch-action:pan-y;cursor:grab;background:#f7f7f7}
  .travel-feed::-webkit-scrollbar{display:none}.travel-feed.is-dragging{cursor:grabbing;scroll-snap-type:none}
  .travel-post{scroll-snap-align:start;scroll-snap-stop:always;background:#fff;margin:0 0 10px;min-height:calc(100% - 1px);display:flex;flex-direction:column}
  .travel-post-head{height:54px;padding:10px 13px;display:flex;align-items:center;justify-content:space-between}
  .travel-post-user{display:flex;align-items:center;gap:9px}.travel-post-user strong{display:block;font-size:.78rem}.travel-post-user span{display:block;font-size:.61rem;color:#777;margin-top:1px}
  .travel-post-avatar{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:#141218;color:#fff;font-size:.6rem;font-weight:800}
  .travel-post-media{position:relative;flex:1;min-height:0;background:#111;overflow:hidden}
  .travel-post-media img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .8s cubic-bezier(.2,.8,.2,1)}
  .travel-post.is-active .travel-post-media img{transform:scale(1.018)}
  .travel-post-meta{padding:11px 13px 16px;background:#fff}
  .travel-post-toolbar{display:flex;justify-content:space-between;font-size:1.2rem;margin-bottom:8px}.travel-post-toolbar div{display:flex;gap:15px}
  .travel-post-likes{font-size:.72rem;font-weight:800}.travel-post-caption{font-size:.69rem;line-height:1.45;margin-top:5px}.travel-post-caption strong{margin-right:5px}
  .travel-post-number{position:absolute;right:13px;top:13px;padding:6px 9px;border-radius:999px;background:rgba(10,9,12,.66);color:#fff;font-size:.62rem;font-weight:800;backdrop-filter:blur(10px)}

  .travel-phone-controls{position:absolute;z-index:5;right:clamp(-28px,-3vw,-12px);top:50%;translate:0 -50%;display:grid;gap:10px}
  .travel-phone-btn{width:48px;height:48px;border-radius:50%;border:1px solid rgba(17,16,20,.13);background:rgba(255,255,255,.78);backdrop-filter:blur(14px);box-shadow:0 12px 35px rgba(17,16,20,.12);cursor:pointer;font-size:1rem;transition:.25s}
  .travel-phone-btn:hover{transform:scale(1.08);background:#fff}.travel-phone-btn:disabled{opacity:.35;cursor:default;transform:none}
  .travel-phone-progress{position:absolute;z-index:5;left:calc(50% + 220px);top:50%;translate:0 -50%;display:grid;gap:9px}
  .travel-phone-dot{width:7px;height:7px;padding:0;border:0;border-radius:999px;background:rgba(17,16,20,.18);cursor:pointer;transition:.3s}.travel-phone-dot.active{height:28px;background:var(--coral)}
  .travel-phone-counter{position:absolute;z-index:5;bottom:30px;left:50%;translate:-50% 0;padding:8px 12px;border-radius:999px;background:rgba(17,16,20,.82);color:#fff;font-size:.68rem;font-weight:800;letter-spacing:.08em;backdrop-filter:blur(12px)}
  .travel-float-card{position:absolute;z-index:1;width:205px;aspect-ratio:4/5;border-radius:24px;overflow:hidden;box-shadow:0 25px 70px rgba(31,19,24,.2);opacity:.78;transition:.5s}
  .travel-float-card img{width:100%;height:100%;object-fit:cover}.travel-float-card.one{left:2%;top:8%;transform:rotate(-9deg)}.travel-float-card.two{right:0;bottom:7%;transform:rotate(10deg)}
  .travel-phone-stage:hover .travel-float-card.one{transform:rotate(-12deg) translate(-8px,-8px)}.travel-phone-stage:hover .travel-float-card.two{transform:rotate(13deg) translate(8px,8px)}

  @media(max-width:1050px){.travel-inspiration-grid{grid-template-columns:1fr;gap:55px}.travel-inspiration-copy{max-width:760px}.travel-phone-stage{min-height:720px}.travel-float-card.one{left:12%}.travel-float-card.two{right:10%}}
  @media(max-width:680px){.travel-inspiration{padding:84px 0}.travel-inspiration-copy h2{font-size:clamp(3rem,14vw,4rem)}.travel-inspiration-copy p{font-size:1rem}.travel-phone-stage{min-height:auto}.travel-phone{width:min(380px,94vw);height:690px;min-height:0;border-radius:45px;transform:none}.travel-phone-screen{border-radius:36px}.travel-float-card,.travel-phone-progress{display:none}.travel-phone-controls{right:6px;top:auto;bottom:74px;translate:0 0}.travel-phone-btn{width:44px;height:44px}.travel-phone-counter{bottom:18px}.travel-inspiration-hint i{animation:none}}
  @media(max-height:760px) and (min-width:681px){.travel-phone{height:650px;min-height:580px}.travel-phone-stage{min-height:680px}}
  @media(prefers-reduced-motion:reduce){.travel-inspiration-hint i{animation:none}.travel-phone,.travel-float-card,.travel-post-media img{transition:none;transform:none!important}.travel-feed{scroll-behavior:auto}}
  `;
  document.head.appendChild(style);

  const section = document.createElement('section');
  section.className = 'travel-inspiration';
  section.setAttribute('aria-labelledby', 'travel-inspiration-title');
  section.innerHTML = `
    <div class="container travel-inspiration-grid">
      <div class="travel-inspiration-copy reveal">
        <div class="eyebrow">Travel Content Playground</div>
        <h2 id="travel-inspiration-title">Scrollen Sie durch <span>Fernweh.</span></h2>
        <p>Ein Feed wie auf Instagram – nur direkt auf der Website. Wischen, scrollen oder die Pfeile nutzen und erleben, wie aus starken Bildern, Hooks und Geschichten Content entsteht, der hängen bleibt.</p>
        <div class="travel-inspiration-hint"><i aria-hidden="true">↓</i><span>Im Handy scrollen oder wischen</span></div>
      </div>
      <div class="travel-phone-stage reveal">
        <div class="travel-phone-glow" aria-hidden="true"></div>
        <figure class="travel-float-card one" aria-hidden="true"><img src="assets/travel-gallery/07-tiger-eyes.svg" alt=""></figure>
        <figure class="travel-float-card two" aria-hidden="true"><img src="assets/travel-gallery/12-bioluminescent-sea.svg" alt=""></figure>
        <div class="travel-phone" data-travel-phone>
          <div class="travel-phone-screen">
            <div class="travel-ig-header">
              <div class="travel-ig-brand"><span class="travel-ig-avatar">JJ</span><span>jjmedia.travel</span></div>
              <div class="travel-ig-actions" aria-hidden="true"><span>♡</span><span>⌁</span></div>
            </div>
            <div class="travel-feed" tabindex="0" aria-label="Interaktiver Instagram-ähnlicher Travel-Feed"></div>
          </div>
        </div>
        <div class="travel-phone-controls" aria-label="Galerie steuern">
          <button class="travel-phone-btn" type="button" data-feed-prev aria-label="Vorheriger Beitrag">↑</button>
          <button class="travel-phone-btn" type="button" data-feed-next aria-label="Nächster Beitrag">↓</button>
        </div>
        <div class="travel-phone-progress" aria-label="Beitragsauswahl"></div>
        <div class="travel-phone-counter" aria-live="polite"><span data-feed-current>01</span> / ${String(posts.length).padStart(2,'0')}</div>
      </div>
    </div>`;

  const anchor = document.querySelector('#travel-cases');
  anchor?.parentNode.insertBefore(section, anchor);

  const feed = section.querySelector('.travel-feed');
  const progress = section.querySelector('.travel-phone-progress');
  const current = section.querySelector('[data-feed-current]');
  const prev = section.querySelector('[data-feed-prev]');
  const next = section.querySelector('[data-feed-next]');

  posts.forEach((post, index) => {
    const article = document.createElement('article');
    article.className = 'travel-post';
    article.dataset.index = index;
    article.innerHTML = `
      <div class="travel-post-head">
        <div class="travel-post-user"><span class="travel-post-avatar">JJ</span><div><strong>jjmedia.travel</strong><span>${post.place}</span></div></div><span aria-hidden="true">•••</span>
      </div>
      <div class="travel-post-media"><img src="${post.src}" alt="${post.alt}" loading="lazy"><span class="travel-post-number">${index+1}/${posts.length}</span></div>
      <div class="travel-post-meta">
        <div class="travel-post-toolbar" aria-hidden="true"><div><span>♡</span><span>◯</span><span>⌁</span></div><span>▱</span></div>
        <div class="travel-post-likes">Gefällt ${post.likes} Mal</div>
        <div class="travel-post-caption"><strong>jjmedia.travel</strong>${post.caption}</div>
      </div>`;
    feed.appendChild(article);

    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'travel-phone-dot';
    dot.setAttribute('aria-label', `Beitrag ${index + 1} anzeigen`);
    dot.addEventListener('click', () => goTo(index));
    progress.appendChild(dot);
  });

  const items = [...feed.querySelectorAll('.travel-post')];
  const dots = [...progress.querySelectorAll('.travel-phone-dot')];
  let active = 0;
  let scrollTimer;

  function setActive(index) {
    active = Math.max(0, Math.min(posts.length - 1, index));
    items.forEach((item, i) => item.classList.toggle('is-active', i === active));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === active));
    current.textContent = String(active + 1).padStart(2, '0');
    prev.disabled = active === 0;
    next.disabled = active === posts.length - 1;
  }

  function goTo(index) {
    const target = items[Math.max(0, Math.min(items.length - 1, index))];
    target?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }

  function syncFromScroll() {
    const feedTop = feed.getBoundingClientRect().top;
    let best = 0, distance = Infinity;
    items.forEach((item, i) => {
      const d = Math.abs(item.getBoundingClientRect().top - feedTop);
      if (d < distance) { distance = d; best = i; }
    });
    setActive(best);
  }

  feed.addEventListener('scroll', () => { clearTimeout(scrollTimer); scrollTimer = setTimeout(syncFromScroll, 70); }, { passive: true });
  prev.addEventListener('click', () => goTo(active - 1));
  next.addEventListener('click', () => goTo(active + 1));
  feed.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(active + 1); }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); goTo(active - 1); }
    if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    if (e.key === 'End') { e.preventDefault(); goTo(posts.length - 1); }
  });

  let dragging = false, startY = 0, startScroll = 0;
  feed.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') { dragging = true; startY = e.clientY; startScroll = feed.scrollTop; feed.classList.add('is-dragging'); feed.setPointerCapture(e.pointerId); }
  });
  feed.addEventListener('pointermove', e => { if (dragging) feed.scrollTop = startScroll - (e.clientY - startY); });
  const stopDrag = e => { if (!dragging) return; dragging = false; feed.classList.remove('is-dragging'); try { feed.releasePointerCapture(e.pointerId); } catch {} syncFromScroll(); goTo(active); };
  feed.addEventListener('pointerup', stopDrag); feed.addEventListener('pointercancel', stopDrag);

  setActive(0);
})();