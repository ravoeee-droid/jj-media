(() => {
  if (!document.body.classList.contains('travel-body') || document.querySelector('.travel-gallery-showcase')) return;

  const items = [
    { src: 'assets/travel-gallery-final/01-schildkroeten.png', alt: 'Travel Creative: 57 Sekunden bis zum Meer', width: 400, height: 500 },
    { src: 'assets/travel-gallery-final/02-orangutan.png', alt: 'Travel Creative: Orang-Utan-Mutter mit Baby', width: 400, height: 500 },
    { src: 'assets/travel-gallery-final/03-elefanten.png', alt: 'Travel Creative: Elefanten bei Sonnenuntergang', width: 400, height: 500 },
    { src: 'assets/travel-gallery-final/04-flamingos.png', alt: 'Travel Creative: Flamingos an einem außergewöhnlichen Ort', width: 357, height: 558 },
    { src: 'assets/travel-gallery-final/05-meer-leuchtete.png', alt: 'Travel Creative: Das Meer leuchtete', width: 400, height: 500 },
    { src: 'assets/travel-gallery-final/06-kein-filter.png', alt: 'Travel Creative: Heißluftballons – das war kein Filter', width: 400, height: 500 },
    { src: 'assets/travel-gallery-final/07-reisefehler.png', alt: 'Travel Creative: Drei teure Reisefehler', width: 357, height: 558 },
    { src: 'assets/travel-gallery-final/08-wal-bootsstour.png', alt: 'Travel Creative: Wal neben einem Ausflugsboot', width: 400, height: 500 },
    { src: 'assets/travel-gallery-final/09-tiger-augen.png', alt: 'Travel Creative: Tigeraugen im hohen Gras', width: 357, height: 558 },
    { src: 'assets/travel-gallery-final/10-manta-dunkel.png', alt: 'Travel Creative: Mantarochen unter der Wasseroberfläche', width: 400, height: 500 },
    { src: 'assets/travel-gallery-final/11-sieben-tage.png', alt: 'Travel Creative: Reisegruppe nach sieben gemeinsamen Tagen', width: 335, height: 595 },
    { src: 'assets/travel-gallery-final/12-zug-rueckkehr.png', alt: 'Travel Creative: Rückreise im Zug bei Sonnenuntergang', width: 357, height: 558 }
  ];

  const style = document.createElement('style');
  style.textContent = `
    .travel-gallery-showcase{position:relative;overflow:hidden;padding:118px 0 112px;background:#0e0b11;color:#fff;isolation:isolate}
    .travel-gallery-showcase:before{content:'';position:absolute;inset:-25% -15%;z-index:-1;background:radial-gradient(circle at 22% 36%,rgba(228,81,103,.18),transparent 28%),radial-gradient(circle at 82% 62%,rgba(255,157,172,.1),transparent 25%);filter:blur(18px);pointer-events:none}
    .travel-gallery-showcase:after{content:'CREATIVE GALLERY';position:absolute;z-index:-1;right:-.04em;bottom:-.17em;color:rgba(255,255,255,.025);font-size:clamp(5rem,12vw,12rem);font-weight:800;line-height:1;letter-spacing:-.075em;white-space:nowrap;pointer-events:none}
    .travel-gallery-header{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,440px);gap:50px;align-items:end;margin-bottom:48px}
    .travel-gallery-header h2{max-width:820px;margin:14px 0 0;font-size:clamp(3.4rem,6.8vw,7rem);line-height:.89;letter-spacing:-.065em}
    .travel-gallery-header h2 span{color:#ff9dac;font-family:'Playfair Display',serif;font-weight:500}
    .travel-gallery-header p{margin:0;color:#b8b0ba;font-size:1.05rem;line-height:1.72}
    .travel-gallery-stage{position:relative}
    .travel-gallery-viewport{overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scroll-padding-inline:calc(50vw - 200px);scrollbar-width:none;overscroll-behavior-x:contain;touch-action:pan-x;padding:18px calc(50vw - 200px) 38px;cursor:grab}
    .travel-gallery-viewport::-webkit-scrollbar{display:none}
    .travel-gallery-viewport.is-dragging{cursor:grabbing;scroll-snap-type:none;user-select:none}
    .travel-gallery-track{display:flex;align-items:center;gap:clamp(18px,2.2vw,32px);width:max-content}
    .travel-gallery-slide{position:relative;flex:0 0 auto;display:grid;place-items:center;scroll-snap-align:center;scroll-snap-stop:always;transform:scale(.86);opacity:.46;transition:transform .65s cubic-bezier(.16,1,.3,1),opacity .5s ease,filter .5s ease;filter:saturate(.82);will-change:transform,opacity}
    .travel-gallery-slide.is-active{transform:scale(1);opacity:1;filter:none}
    .travel-gallery-slide img{display:block;width:auto;height:auto;max-width:min(var(--source-w),86vw);max-height:min(var(--source-h),68vh);border-radius:26px;border:1px solid rgba(255,255,255,.12);background:#141017;box-shadow:0 34px 95px rgba(0,0,0,.42);object-fit:contain;pointer-events:none}
    .travel-gallery-slide.is-active img{box-shadow:0 42px 120px rgba(0,0,0,.58),0 0 0 1px rgba(255,157,172,.12)}
    .travel-gallery-slide-number{position:absolute;right:14px;bottom:14px;display:grid;place-items:center;min-width:42px;height:34px;padding:0 11px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(12,9,14,.74);color:#fff;font-size:.65rem;font-weight:800;letter-spacing:.1em;backdrop-filter:blur(12px)}
    .travel-gallery-controls{display:flex;align-items:center;justify-content:center;gap:15px;margin-top:2px}
    .travel-gallery-button{width:52px;height:52px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.15);border-radius:50%;background:rgba(255,255,255,.055);color:#fff;font-size:1.05rem;cursor:pointer;transition:transform .25s ease,background .25s ease,border-color .25s ease}
    .travel-gallery-button:hover{transform:scale(1.07);background:#fff;color:#111;border-color:#fff}
    .travel-gallery-button:focus-visible{outline:3px solid #ff9dac;outline-offset:4px}
    .travel-gallery-progress{width:min(330px,40vw);height:2px;overflow:hidden;border-radius:999px;background:rgba(255,255,255,.13)}
    .travel-gallery-progress span{display:block;width:100%;height:100%;background:linear-gradient(90deg,#ff9dac,#e45167);transform:scaleX(var(--gallery-progress,.0833));transform-origin:left;transition:transform .55s cubic-bezier(.16,1,.3,1)}
    .travel-gallery-counter{min-width:68px;color:#beb7c1;font-size:.7rem;font-weight:800;letter-spacing:.11em;text-align:center}
    .travel-gallery-mobile-hint{display:none;margin:18px auto 0;color:#aaa3ad;font-size:.66rem;font-weight:800;letter-spacing:.13em;text-align:center;text-transform:uppercase}
    @media(max-width:900px){.travel-gallery-header{grid-template-columns:1fr;gap:20px}.travel-gallery-header p{max-width:670px}.travel-gallery-viewport{scroll-padding-inline:calc(50vw - 180px);padding-inline:calc(50vw - 180px)}}
    @media(max-width:600px){.travel-gallery-showcase{padding:82px 0 84px}.travel-gallery-header{margin-bottom:24px}.travel-gallery-header h2{font-size:clamp(3rem,14vw,4.25rem)}.travel-gallery-header p{font-size:.98rem}.travel-gallery-viewport{scroll-padding-inline:7vw;padding:12px 7vw 28px}.travel-gallery-track{gap:14px}.travel-gallery-slide{scroll-snap-align:start;transform:scale(.94);opacity:.58}.travel-gallery-slide.is-active{transform:none}.travel-gallery-slide img{max-width:86vw;max-height:72vh;border-radius:22px}.travel-gallery-controls{gap:11px}.travel-gallery-button{width:46px;height:46px}.travel-gallery-progress{width:35vw}.travel-gallery-mobile-hint{display:block}}
    @media(prefers-reduced-motion:reduce){.travel-gallery-slide,.travel-gallery-progress span,.travel-gallery-button{transition:none!important}}
  `;
  document.head.appendChild(style);

  const section = document.createElement('section');
  section.className = 'travel-gallery-showcase';
  section.setAttribute('aria-labelledby', 'travel-gallery-title');
  section.innerHTML = `
    <div class="container">
      <div class="travel-gallery-header reveal">
        <div>
          <div class="eyebrow">Travel Creative Gallery</div>
          <h2 id="travel-gallery-title">Ideen, die <span>Fernweh auslösen.</span></h2>
        </div>
        <p>Eine Auswahl unserer Travel-Creatives – ohne Mockups, ohne Ablenkung. Einfach die Motive in voller Wirkung.</p>
      </div>
    </div>
    <div class="travel-gallery-stage reveal">
      <div class="travel-gallery-viewport" tabindex="0" aria-label="Travel Creative Galerie – horizontal wischen oder mit den Pfeiltasten steuern">
        <div class="travel-gallery-track"></div>
      </div>
      <div class="travel-gallery-controls" aria-label="Galerie steuern">
        <button class="travel-gallery-button" type="button" data-gallery-prev aria-label="Vorheriges Bild">←</button>
        <div class="travel-gallery-progress" aria-hidden="true"><span></span></div>
        <div class="travel-gallery-counter" aria-live="polite"><span data-gallery-current>01</span> / ${String(items.length).padStart(2,'0')}</div>
        <button class="travel-gallery-button" type="button" data-gallery-next aria-label="Nächstes Bild">→</button>
      </div>
      <div class="travel-gallery-mobile-hint">Wischen, um weitere Motive zu entdecken</div>
    </div>`;

  const anchor = document.querySelector('#travel-cases');
  anchor?.parentNode.insertBefore(section, anchor);

  const viewport = section.querySelector('.travel-gallery-viewport');
  const track = section.querySelector('.travel-gallery-track');
  const progress = section.querySelector('.travel-gallery-progress');
  const current = section.querySelector('[data-gallery-current]');
  const prev = section.querySelector('[data-gallery-prev]');
  const next = section.querySelector('[data-gallery-next]');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  items.forEach((item,index) => {
    const figure = document.createElement('figure');
    figure.className = 'travel-gallery-slide';
    figure.dataset.index = String(index);
    figure.style.setProperty('--source-w', `${item.width}px`);
    figure.style.setProperty('--source-h', `${item.height}px`);
    figure.innerHTML = `<img src="${item.src}" width="${item.width}" height="${item.height}" alt="${item.alt}" loading="${index < 2 ? 'eager' : 'lazy'}" decoding="async"><span class="travel-gallery-slide-number">${String(index + 1).padStart(2,'0')}</span>`;
    track.appendChild(figure);
  });

  const slides = [...track.children];
  let active = 0;
  let scrollTimer = 0;
  let dragging = false;
  let dragStartX = 0;
  let dragScrollLeft = 0;

  const update = index => {
    active = Math.max(0,Math.min(items.length - 1,index));
    slides.forEach((slide,i) => slide.classList.toggle('is-active',i === active));
    current.textContent = String(active + 1).padStart(2,'0');
    progress.style.setProperty('--gallery-progress', String((active + 1) / items.length));
    prev.disabled = active === 0;
    next.disabled = active === items.length - 1;
  };

  const nearestIndex = () => {
    const center = viewport.scrollLeft + viewport.clientWidth / 2;
    let best = 0;
    let distance = Infinity;
    slides.forEach((slide,i) => {
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const nextDistance = Math.abs(slideCenter - center);
      if (nextDistance < distance) { distance = nextDistance; best = i; }
    });
    return best;
  };

  const goTo = index => {
    const target = slides[Math.max(0,Math.min(slides.length - 1,index))];
    if (!target) return;
    const left = target.offsetLeft - (viewport.clientWidth - target.offsetWidth) / 2;
    viewport.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
    update(Number(target.dataset.index));
  };

  viewport.addEventListener('scroll',() => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => update(nearestIndex()),70);
  },{passive:true});
  prev.addEventListener('click',() => goTo(active - 1));
  next.addEventListener('click',() => goTo(active + 1));
  viewport.addEventListener('keydown',event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(active - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); goTo(active + 1); }
    if (event.key === 'Home') { event.preventDefault(); goTo(0); }
    if (event.key === 'End') { event.preventDefault(); goTo(items.length - 1); }
  });
  viewport.addEventListener('pointerdown',event => {
    if (event.pointerType !== 'mouse') return;
    dragging = true;
    dragStartX = event.clientX;
    dragScrollLeft = viewport.scrollLeft;
    viewport.classList.add('is-dragging');
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener('pointermove',event => {
    if (dragging) viewport.scrollLeft = dragScrollLeft - (event.clientX - dragStartX);
  });
  const endDrag = event => {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove('is-dragging');
    try { viewport.releasePointerCapture(event.pointerId); } catch {}
    goTo(nearestIndex());
  };
  viewport.addEventListener('pointerup',endDrag);
  viewport.addEventListener('pointercancel',endDrag);
  window.addEventListener('resize',() => goTo(active));

  update(0);
  requestAnimationFrame(() => goTo(0));
})();