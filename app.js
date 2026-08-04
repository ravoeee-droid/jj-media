(() => {
  const load = (src, next) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => next?.();
    script.onerror = () => next?.();
    document.head.appendChild(script);
  };

  if (document.querySelector('.hero-premium')) {
    load('home-proof.js?v=20260804-2', () => load('app-core.js?v=20260804-2'));
  } else {
    load('app-core.js?v=20260804-2');
  }
})();
