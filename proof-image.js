(() => {
  const links = document.querySelectorAll('[data-proof-image]');
  if (!links.length || typeof HTMLDialogElement === 'undefined') return;
  const dialog = document.createElement('dialog');
  dialog.className = 'proof-image-dialog';
  dialog.setAttribute('aria-label', 'Vollständiger Feed-Screenshot von Reisen und Erleben');
  dialog.innerHTML = '<header><strong>Reisen &amp; Erleben · Original-Feed</strong><button type="button" aria-label="Ansicht schließen">×</button></header><img alt="Vollständiger Instagram-Feed mit 29,5 Tsd. und 19,2 Tsd. Aufrufen">';
  document.body.appendChild(dialog);
  let opener;
  links.forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = link;
    dialog.querySelector('img').src = link.href;
    dialog.showModal();
    dialog.scrollTop = 0;
  }));
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => opener?.focus());
})();
