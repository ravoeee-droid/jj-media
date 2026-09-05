(() => {
  if (window.JJClarity) return;

  const PROJECT_ID = 'ydfcroc44j';
  const COOKIE_NAMES = ['_clck', '_clsk'];

  const clearCookies = () => {
    COOKIE_NAMES.forEach(name => {
      try { document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`; } catch (_) {}
    });
  };

  const deny = () => {
    try {
      if (typeof window.clarity === 'function') {
        window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
        window.clarity('consent', false);
      }
    } catch (_) {}
    clearCookies();
  };

  const init = () => {
    if (!PROJECT_ID || document.documentElement.dataset.jjClarityLoaded) return false;
    document.documentElement.dataset.jjClarityLoaded = 'true';

    window.clarity = window.clarity || function () {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${PROJECT_ID}`;
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);

    window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
    window.clarity('set', 'site', 'jj-media');
    return true;
  };

  const event = name => {
    try {
      if (typeof window.clarity === 'function') window.clarity('event', String(name).slice(0, 80));
    } catch (_) {}
  };

  window.JJClarity = { init, deny, event };
})();
