(() => {
  const KEY = 'jj-analytics-consent-v1';
  const footerLinks = document.querySelector('footer .footer-links');
  if (!footerLinks || footerLinks.querySelector('[data-privacy-settings]')) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.privacySettings = 'true';
  button.textContent = 'Datenschutz-Einstellungen';
  button.style.cssText = 'appearance:none;border:0;background:none;color:inherit;font:inherit;padding:0;cursor:pointer;text-align:left;opacity:.86';
  button.addEventListener('click',() => {
    try { localStorage.removeItem(KEY); } catch (_) {}
    location.reload();
  });
  footerLinks.appendChild(button);
})();