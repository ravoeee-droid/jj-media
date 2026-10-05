document.querySelectorAll('[data-instagram-reel]').forEach(container => {
  container.querySelector('button').addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = 'https://www.instagram.com/reel/DdBvg2CoXFt/embed/';
    frame.title = 'Reisen & Erleben – emotionales Motorradreise-Reel';
    frame.allow = 'autoplay; fullscreen; encrypted-media';
    frame.allowFullscreen = true;
    container.replaceChildren(frame);
  }, {once: true});
});
