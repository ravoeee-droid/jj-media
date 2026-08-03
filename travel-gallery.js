(() => {
  if (!document.body.classList.contains('travel-body') || document.querySelector('.travel-gallery-showcase')) return;

  const items = [
    {
      src: 'assets/travel-gallery/06-whale-boat.svg',
      alt: 'Wal springt neben einem Expeditionsboot aus dem Meer',
      kicker: 'Expedition',
      title: 'Momente, die größer sind als jeder Bildschirm.'
    },
    {
      src: 'assets/travel-gallery/02-orangutan-baby.svg',
      alt: 'Orang-Utan-Mutter mit Baby im Regenwald',
      kicker: 'Wildlife',
      title: 'Nähe, die keine Inszenierung braucht.'
    },
    {
      src: 'assets/travel-gallery/07-tiger-eyes.svg',
      alt: 'Tiger blickt aus hohem Gras über das Wasser',
      kicker: 'Abenteuer',
      title: 'Ein Blick, der eine ganze Geschichte erzählt.'
    },
    {
      src: 'assets/travel-gallery/12-bioluminescent-sea.svg',
      alt: 'Paar steht nachts in blau leuchtendem Meer',
      kicker: 'Naturwunder',
      title: 'Content, der sich wie Magie anfühlt.'
    },
    {
      src: 'assets/cases/reisen-erleben-feed.jpg',
      alt: 'Instagram-Feed von Reisen und Erleben',
      kicker: 'Content-System',
      title: 'Aus Reiserouten wird echte Vorfreude.'
    },
    {
      src: 'assets/jessica/jessica-travel-premium.webp',
      alt: 'Jessica Just auf einer mediterranen Hotelterrasse',
      kicker: 'Hospitality',
      title: 'Strategie, Ästhetik und Persönlichkeit.'
    },
    {
      src: 'assets/cases/village-after.jpg',
      alt: 'Village Adventures Instagram-Profil nach vier Monaten Wachstum',
      kicker: 'Social Growth',
      title: 'Sichtbarkeit, die messbar wächst.'
    },
    {
      src: 'assets/cases/village-before.jpg',
      alt: 'Village Adventures Instagram-Profil vor der Zusammenarbeit',
      kicker: 'Transformation',
      title: 'Jede starke Entwicklung beginnt mit einem klaren Startpunkt.'
    }
  ];

  const style = document.createElement('style');
  style.textContent = `
    .travel-gallery-showcase{position:relative;overflow:hidden;padding:120px 0 130px;background:#100d13;color:#fff}
    .travel-gallery-showcase:before{content:'';position:absolute;width:680px;height:680px;border-radius:50%;right:-260px;top:4%;background:rgba(228,81,103,.14);filter:blur(150px);pointer-events:none}
    .travel-gallery-showcase:after{content:'TRAVEL STORIES';position:absolute;left:-1vw;bottom:-.12em;font-size:clamp(5rem,13vw,13rem);font-weight:800;line-height:1;letter-spacing:-.075em;color:rgba(255,255,255,.025);white-space:nowrap;pointer-events:none}
    .travel-gallery-head{position:relative;z-index:2;display:grid;grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr);gap:60px;align-items:end;margin-bottom:54px}
    .travel-gallery-head h2{font-size:clamp(3.5rem,7vw,7.2rem);line-height:.88;letter-spacing:-.065em;margin:14px 0 0;max-width:850px}
    .travel-gallery-head h2 span{font-family:'Playfair Display',serif;color:#ff9dac}
    .travel-gallery-head p{margin:0 0 9px;color:#aaa4ad;font-size:1.08rem;line-height:1.75;max-width:500px}
    .travel-gallery-note{display:inline-flex;align-items:center;gap:10px;margin-top:18px;color:#d8d1da;font-size:.7rem;font-weight:800;letter-spacing:.13em;text-transform:uppercase}
    .travel-gallery-note i{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(255,255,255,.16);font-style:normal}

    .travel-gallery-grid{position:relative;z-index:2;columns:3 300px;column-gap:18px}
    .travel-gallery-item{position:relative;display:block;width:100%;margin:0 0 18px;padding:0;overflow:hidden;border:1px solid rgba(255,255,255,.1);border-radius:24px;background:#19151d;box-shadow:0 26px 70px rgba(0,0,0,.28);cursor:zoom-in;break-inside:avoid;text-align:left;color:#fff;transition:transform .38s cubic-bezier(.2,.8,.2,1),border-color .35s,box-shadow .35s}
    .travel-gallery-item:hover{transform:translateY(-5px);border-color:rgba(255,157,172,.34);box-shadow:0 34px 90px rgba(0,0,0,.38)}
    .travel-gallery-item:focus-visible{outline:3px solid #ff9dac;outline-offset:4px}
    .travel-gallery-item img{display:block;width:100%;height:auto;transition:transform .75s cubic-bezier(.2,.8,.2,1),filter .45s;will-change:transform}
    .travel-gallery-item:hover img{transform:scale(1.025);filter:saturate(1.04) contrast(1.02)}
    .travel-gallery-overlay{position:absolute;inset:auto 0 0;padding:72px 20px 20px;background:linear-gradient(transparent,rgba(10,8,12,.88));display:grid;gap:5px;transform:translateY(6px);transition:transform .35s}
    .travel-gallery-item:hover .travel-gallery-overlay{transform:none}
    .travel-gallery-overlay span{font-size:.62rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#ff9dac}
    .travel-gallery-overlay strong{font-size:1rem;line-height:1.35;max-width:320px}
    .travel-gallery-index{position:absolute;top:14px;right:14px;min-width:38px;height:38px;padding:0 10px;border-radius:999px;display:grid;place-items:center;background:rgba(12,10,14,.7);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(12px);font-size:.68rem;font-weight:800;letter-spacing:.08em}

    .travel-lightbox{position:fixed;z-index:10000;inset:0;display:grid;place-items:center;padding:28px;background:rgba(7,6,9,.94);backdrop-filter:blur(18px);opacity:0;visibility:hidden;transition:opacity .28s,visibility .28s}
    .travel-lightbox.open{opacity:1;visibility:visible}
    .travel-lightbox-inner{position:relative;width:min(1120px,100%);height:min(88vh,920px);display:grid;grid-template-rows:minmax(0,1fr) auto;gap:16px;transform:scale(.97);transition:transform .32s cubic-bezier(.2,.8,.2,1)}
    .travel-lightbox.open .travel-lightbox-inner{transform:none}
    .travel-lightbox-media{min-height:0;display:grid;place-items:center;overflow:hidden;border-radius:24px;background:#0c0a0e;border:1px solid rgba(255,255,255,.1);box-shadow:0 40px 120px rgba(0,0,0,.55)}
    .travel-lightbox-media img{display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain}
    .travel-lightbox-meta{display:flex;align-items:center;justify-content:space-between;gap:20px;color:#fff}
    .travel-lightbox-copy{display:grid;gap:4px}
    .travel-lightbox-copy span{font-size:.65rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#ff9dac}
    .travel-lightbox-copy strong{font-size:1rem;line-height:1.4}
    .travel-lightbox-count{color:#aaa4ad;font-size:.72rem;font-weight:800;letter-spacing:.1em}
    .travel-lightbox-btn{position:absolute;z-index:2;width:50px;height:50px;border-radius:50%;border:1px solid rgba(255,255,255,.18);background:rgba(20,17,23,.78);color:#fff;backdrop-filter:blur(14px);cursor:pointer;font-size:1.2rem;transition:.25s}
    .travel-lightbox-btn:hover{background:#fff;color:#111;transform:scale(1.06)}
    .travel-lightbox-close{top:14px;right:14px}
    .travel-lightbox-prev{left:14px;top:50%;translate:0 -50%}
    .travel-lightbox-next{right:14px;top:50%;translate:0 -50%}
    body.travel-gallery-open{overflow:hidden}

    @media(max-width:980px){.travel-gallery-head{grid-template-columns:1fr;gap:24px}.travel-gallery-head p{max-width:680px}.travel-gallery-grid{columns:2 260px}}
    @media(max-width:640px){.travel-gallery-showcase{padding:84px 0 96px}.travel-gallery-head{margin-bottom:32px}.travel-gallery-head h2{font-size:clamp(3rem,14vw,4.25rem)}.travel-gallery-head p{font-size:1rem}.travel-gallery-grid{columns:1}.travel-gallery-item{border-radius:20px;margin-bottom:14px}.travel-gallery-overlay{padding:64px 17px 17px}.travel-lightbox{padding:14px}.travel-lightbox-inner{height:92vh;gap:12px}.travel-lightbox-media{border-radius:18px}.travel-lightbox-btn{width:44px;height:44px}.travel-lightbox-prev{left:7px}.travel-lightbox-next{right:7px}.travel-lightbox-close{top:8px;right:8px}.travel-lightbox-meta{align-items:flex-start}.travel-lightbox-copy strong{font-size:.9rem}}
    @media(prefers-reduced-motion:reduce){.travel-gallery-item,.travel-gallery-item img,.travel-gallery-overlay,.travel-lightbox,.travel-lightbox-inner,.travel-lightbox-btn{transition:none!important}}
  `;
  document.head.appendChild(style);

  const section = document.createElement('section');
  section.className = 'travel-gallery-showcase';
  section.setAttribute('aria-labelledby', 'travel-gallery-title');
  section.innerHTML = `
    <div class="container">
      <div class="travel-gallery-head reveal">
        <div>
          <div class="eyebrow">Travel Content Gallery</div>
          <h2 id="travel-gallery-title">Content, der <span>Fernweh auslöst.</span></h2>
        </div>
        <div>
          <p>Von mutigen Hooks bis zu emotionalem Storytelling: eine Auswahl an Travel-Creatives, die im Feed stoppen und im Kopf bleiben.</p>
          <div class="travel-gallery-note"><i aria-hidden="true">↗</i><span>Bild öffnen und Details entdecken</span></div>
        </div>
      </div>
      <div class="travel-gallery-grid" role="list"></div>
    </div>`;

  const anchor = document.querySelector('#travel-cases');
  anchor?.parentNode.insertBefore(section, anchor);

  const grid = section.querySelector('.travel-gallery-grid');
  items.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'travel-gallery-item reveal';
    button.dataset.galleryIndex = String(index);
    button.setAttribute('role', 'listitem');
    button.setAttribute('aria-label', `${item.title} – vergrößern`);
    button.innerHTML = `
      <img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async">
      <span class="travel-gallery-index">${String(index + 1).padStart(2, '0')}</span>
      <span class="travel-gallery-overlay"><span>${item.kicker}</span><strong>${item.title}</strong></span>`;
    grid.appendChild(button);
  });

  const lightbox = document.createElement('div');
  lightbox.className = 'travel-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Travel Content Galerie');
  lightbox.innerHTML = `
    <div class="travel-lightbox-inner">
      <div class="travel-lightbox-media"><img alt=""></div>
      <div class="travel-lightbox-meta">
        <div class="travel-lightbox-copy"><span></span><strong></strong></div>
        <div class="travel-lightbox-count" aria-live="polite"></div>
      </div>
      <button type="button" class="travel-lightbox-btn travel-lightbox-close" aria-label="Galerie schließen">×</button>
      <button type="button" class="travel-lightbox-btn travel-lightbox-prev" aria-label="Vorheriges Bild">←</button>
      <button type="button" class="travel-lightbox-btn travel-lightbox-next" aria-label="Nächstes Bild">→</button>
    </div>`;
  document.body.appendChild(lightbox);

  const image = lightbox.querySelector('.travel-lightbox-media img');
  const kicker = lightbox.querySelector('.travel-lightbox-copy span');
  const title = lightbox.querySelector('.travel-lightbox-copy strong');
  const count = lightbox.querySelector('.travel-lightbox-count');
  const closeButton = lightbox.querySelector('.travel-lightbox-close');
  let activeIndex = 0;
  let previousFocus = null;
  let touchStartX = 0;

  const render = () => {
    const item = items[activeIndex];
    image.src = item.src;
    image.alt = item.alt;
    kicker.textContent = item.kicker;
    title.textContent = item.title;
    count.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
  };

  const open = index => {
    activeIndex = index;
    previousFocus = document.activeElement;
    render();
    lightbox.classList.add('open');
    document.body.classList.add('travel-gallery-open');
    closeButton.focus();
  };

  const close = () => {
    lightbox.classList.remove('open');
    document.body.classList.remove('travel-gallery-open');
    previousFocus?.focus?.();
  };

  const move = direction => {
    activeIndex = (activeIndex + direction + items.length) % items.length;
    render();
  };

  grid.addEventListener('click', event => {
    const item = event.target.closest('[data-gallery-index]');
    if (item) open(Number(item.dataset.galleryIndex));
  });
  closeButton.addEventListener('click', close);
  lightbox.querySelector('.travel-lightbox-prev').addEventListener('click', () => move(-1));
  lightbox.querySelector('.travel-lightbox-next').addEventListener('click', () => move(1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) close(); });
  lightbox.addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', event => {
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 55) move(delta > 0 ? -1 : 1);
  }, { passive: true });
  document.addEventListener('keydown', event => {
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key === 'ArrowRight') move(1);
  });
})();