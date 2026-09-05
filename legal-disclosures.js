(() => {
  if (!/\/datenschutz(\.html)?\/?$/i.test(location.pathname)) return;
  const headings=[...document.querySelectorAll('.legal h2')];
  const analyticsHeading=headings.find(h=>/Optionale Nutzungsstatistiken/i.test(h.textContent||''));
  if(analyticsHeading&&!document.querySelector('[data-posthog-disclosure]')){
    let anchor=analyticsHeading;
    while(anchor.nextElementSibling&&anchor.nextElementSibling.tagName!=='H2')anchor=anchor.nextElementSibling;
    const p=document.createElement('p');
    p.dataset.posthogDisclosure='true';
    p.textContent='Bei aktivierter Statistik kann JJ-Media zusätzlich PostHog als technische Analyseplattform einsetzen. Übermittelt werden ausschließlich pseudonyme Ereignisdaten wie Seitenpfad, Referrer-Domain, Sitzungskennung, Kampagnenparameter und ausgewählte Interaktionen. Namen, E-Mail-Adressen, Telefonnummern und Formularinhalte werden über diese Ereignisschnittstelle nicht an PostHog übertragen.';
    anchor.insertAdjacentElement('afterend',p);
  }
  const recipientHeading=headings.find(h=>/Empfänger und Drittlandbezug/i.test(h.textContent||''));
  const recipient=recipientHeading?.nextElementSibling;
  if(recipient&&recipient.tagName==='P'&&!/PostHog/.test(recipient.textContent||'')){
    recipient.innerHTML=recipient.innerHTML.replace('Vercel, Microsoft Clarity, Telegram und Calendly','Vercel, Microsoft Clarity, PostHog, Telegram und Calendly');
  }
})();
