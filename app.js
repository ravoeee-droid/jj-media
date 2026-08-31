(() => {
  const load = (src, next) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => next?.();
    script.onerror = () => next?.();
    document.head.appendChild(script);
  };

  const isLegal = /\/(datenschutz|impressum)(\.html)?\/?$/i.test(location.pathname);
  const bootGrowth = () => {
    if (isLegal) return;
    load('growth-layer.js?v=20260831-1', () => load('privacy-controls.js?v=20260831-1'));
  };

  if (document.querySelector('.viral-page')) {
    load('instagram-embeds.js?v=20260831-5');
  }

  if (document.querySelector('.hero-premium')) {
    load('home-proof.js?v=20260804-3', () => load('app-core.js?v=20260804-3', bootGrowth));
  } else {
    load('app-core.js?v=20260804-3', bootGrowth);
  }
})();