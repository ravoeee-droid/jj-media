(() => {
  document.querySelectorAll('[data-design-gallery]').forEach(gallery => {
    const track = gallery.querySelector('.design-gallery-track');
    const slides = Array.from(track.querySelectorAll('.design-slide'));
    const prev = gallery.querySelector('[data-gallery-prev]');
    const next = gallery.querySelector('[data-gallery-next]');
    const status = gallery.querySelector('[data-gallery-status]');
    let current = 0;
    const update = () => {
      current = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / Math.max(1, track.clientWidth))));
      status.textContent = `${current + 1} / ${slides.length}`;
      prev.disabled = current === 0;
      next.disabled = current === slides.length - 1;
    };
    const move = delta => {
      const target = Math.max(0, Math.min(slides.length - 1, current + delta));
      track.scrollTo({left: target * track.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    };
    prev.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('scroll', update, {passive: true});
    track.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
      }
    });
    new ResizeObserver(() => { track.scrollLeft = current * track.clientWidth; update(); }).observe(track);
    update();
  });
})();
