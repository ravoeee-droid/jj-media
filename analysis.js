(() => {
  const form = document.getElementById('analysis-form');
  if (!form) return;
  const steps = [...form.querySelectorAll('.funnel-step')];
  const progress = document.querySelector('[data-progress]');
  const stepLabel = document.querySelector('[data-current-step]');
  const success = document.getElementById('funnel-success');
  const status = form.querySelector('.funnel-status');
  const bookingLink = document.getElementById('booking-link');
  const callbackTrigger = document.getElementById('callback-trigger');
  const callbackPanel = document.getElementById('callback-panel');
  const callbackPhone = document.getElementById('callback-phone');
  const callbackSubmit = document.getElementById('callback-submit');
  const callbackStatus = document.getElementById('callback-status');
  const params = new URLSearchParams(location.search);
  const ANALYTICS_KEY = 'jj-analytics-consent-v1';
  const SESSION_KEY = 'jj-growth-session-v2';
  let current = 0;
  let submittedLead = null;
  let sessionId = '';

  const profileLabel = document.querySelector('label[for="profile"]');
  if (profileLabel) profileLabel.innerHTML = 'Instagram, Facebook, YouTube oder LinkedIn *';

  const analyticsAllowed = () => {
    try { return localStorage.getItem(ANALYTICS_KEY) === 'yes'; } catch (_) { return false; }
  };

  const loadClarity = callback => {
    if (!analyticsAllowed()) return;
    if (window.JJClarity) { callback?.(); return; }
    const existing = document.querySelector('script[data-jj-clarity]');
    if (existing) { existing.addEventListener('load',() => callback?.(),{once:true}); return; }
    const script = document.createElement('script');
    script.src = 'clarity.js?v=20260905-2';
    script.dataset.jjClarity = 'true';
    script.onload = () => callback?.();
    document.head.appendChild(script);
  };
  const startClarity = () => loadClarity(() => window.JJClarity?.init());

  const getSession = () => {
    if (!analyticsAllowed()) return '';
    if (sessionId) return sessionId;
    try {
      sessionId = sessionStorage.getItem(SESSION_KEY) || '';
      if (!sessionId) {
        sessionId = crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;
        sessionStorage.setItem(SESSION_KEY,sessionId);
      }
      return sessionId;
    } catch (_) {
      sessionId = `ephemeral-${Math.random().toString(36).slice(2,10)}`;
      return sessionId;
    }
  };

  const track = (event,properties = {}) => {
    if (!analyticsAllowed()) return;
    const safeEvent = String(event).slice(0,80);
    const session = getSession();
    const payload = {
      event:safeEvent,
      session:session.slice(0,80),
      path:location.pathname.slice(0,300),
      referrer_host:(() => { try { return document.referrer ? new URL(document.referrer).hostname.slice(0,120) : ''; } catch (_) { return ''; } })(),
      properties:Object.fromEntries(Object.entries(properties).slice(0,20).map(([key,value]) => [String(key).slice(0,60),String(value ?? '').slice(0,200)]))
    };
    fetch('/api/conversion-event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),keepalive:true}).catch(()=>{});
    try {
      if (window.JJClarity) window.JJClarity.event(safeEvent);
      else loadClarity(() => window.JJClarity?.event(safeEvent));
    } catch (_) {}
  };

  const labels = {goal:'Ziel',challenge:'Herausforderung',profile:'Profil',industry:'Branche',name:'Name',company:'Unternehmen',email:'E-Mail'};

  const update = () => {
    steps.forEach((step,index) => step.classList.toggle('active',index === current));
    stepLabel.textContent = String(current + 1);
    progress.style.width = `${((current + 1) / steps.length) * 100}%`;
    steps[current]?.querySelector('input:not([type="radio"]):not([type="checkbox"]),select,textarea')?.focus({preventScroll:true});
    track('analysis_step_view',{step:current + 1});
  };

  const value = name => new FormData(form).get(name)?.toString().trim() || '';

  const validateStep = index => {
    const step = steps[index];
    const required = [...step.querySelectorAll('[required]')];
    const radios = [...new Set([...step.querySelectorAll('input[type="radio"]')].map(input => input.name))];
    for (const name of radios) {
      if (!step.querySelector(`input[name="${CSS.escape(name)}"]:checked`)) {
        status.textContent = 'Bitte wähle eine Antwort aus.';
        return false;
      }
    }
    for (const field of required) {
      if (!field.checkValidity()) {
        field.reportValidity();
        status.textContent = `Bitte prüfe das Feld „${labels[field.name] || field.name}“.`;
        return false;
      }
    }
    if (index === 2 && value('profile').length < 3) {
      status.textContent = 'Bitte gib ein Profil oder einen Nutzernamen an.';
      return false;
    }
    status.textContent = '';
    return true;
  };

  form.querySelectorAll('.funnel-next').forEach(button => button.addEventListener('click',() => {
    if (!validateStep(current)) return;
    track('analysis_step_complete',{step:current + 1});
    current = Math.min(steps.length - 1,current + 1);
    update();
  }));

  form.querySelectorAll('.funnel-back').forEach(button => button.addEventListener('click',() => {
    status.textContent = '';
    current = Math.max(0,current - 1);
    update();
  }));

  form.querySelectorAll('input[type="radio"]').forEach(input => input.addEventListener('change',() => {
    status.textContent = '';
    track('analysis_choice',{field:input.name,step:current + 1});
  }));

  const buildPayload = () => {
    const data = Object.fromEntries(new FormData(form).entries());
    delete data.consent;
    data.action = 'lead';
    data.source = 'JJ-Media Social-Media-Analyse';
    data.page = location.href;
    data.referrer = document.referrer || '';
    data.utm_source = params.get('utm_source') || '';
    data.utm_campaign = params.get('utm_campaign') || '';
    data.utm_medium = params.get('utm_medium') || '';
    return data;
  };

  form.addEventListener('submit',async event => {
    event.preventDefault();
    if (!validateStep(current)) return;
    const submit = form.querySelector('.funnel-submit');
    submit.disabled = true;
    submit.textContent = 'Wird sicher übermittelt …';
    status.textContent = '';
    const payload = buildPayload();
    track('analysis_submit_attempt',{entry:params.get('entry') || ''});
    try {
      const response = await fetch('/api/social-analysis-lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Übermittlung fehlgeschlagen');
      submittedLead = {...payload,leadId:result.leadId || ''};
      form.style.display = 'none';
      document.querySelector('.funnel-progress-row').style.display = 'none';
      success.classList.add('active');
      callbackPhone.value = payload.phone || '';
      const booking = new URL('https://calendly.com/jj-media-call/15min');
      booking.searchParams.set('name',payload.name);
      booking.searchParams.set('email',payload.email);
      booking.searchParams.set('utm_source','website');
      booking.searchParams.set('utm_campaign','social-media-analyse');
      bookingLink.href = booking.toString();
      try { sessionStorage.removeItem('jj-analysis-draft'); } catch (_) {}
      track('analysis_lead_success',{entry:params.get('entry') || '',utm_source:params.get('utm_source') || ''});
    } catch (error) {
      track('analysis_lead_error',{reason:error?.message || 'delivery_failed'});
      status.textContent = 'Die Anfrage konnte gerade nicht gesendet werden. Bitte versuche es erneut oder schreibe an service@jj-media.info.';
      submit.disabled = false;
      submit.textContent = 'Kostenlose Analyse anfragen ↗';
    }
  });

  callbackTrigger.addEventListener('click',() => {
    callbackPanel.classList.toggle('active');
    callbackPhone.focus();
    track('callback_panel_open');
  });

  bookingLink.addEventListener('click',() => track('booking_click',{source:'analysis_success'}));

  callbackSubmit.addEventListener('click',async () => {
    const phone = callbackPhone.value.trim();
    if (phone.length < 6) {
      callbackStatus.textContent = 'Bitte gib eine gültige Telefonnummer an.';
      return;
    }
    callbackSubmit.disabled = true;
    callbackStatus.textContent = 'Rückruf wird angefordert …';
    try {
      const response = await fetch('/api/social-analysis-lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'callback',leadId:submittedLead?.leadId || '',name:submittedLead?.name || '',company:submittedLead?.company || '',email:submittedLead?.email || '',phone})});
      if (!response.ok) throw new Error();
      callbackStatus.textContent = '✓ Rückrufwunsch wurde an Jessica gesendet.';
      callbackSubmit.textContent = 'Gesendet ✓';
      track('callback_success');
    } catch (_) {
      track('callback_error');
      callbackStatus.textContent = 'Der Rückruf konnte gerade nicht angefordert werden. Bitte nutze die Terminbuchung oder schreibe an service@jj-media.info.';
      callbackSubmit.disabled = false;
    }
  });

  form.addEventListener('input',() => {
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      delete data.consent;
      delete data.website_confirm;
      sessionStorage.setItem('jj-analysis-draft',JSON.stringify(data));
    } catch (_) {}
  });

  const setPrefill = (name,saved) => {
    if (!saved) return;
    const controls = [...form.elements].filter(control => control.name === name);
    controls.forEach(control => {
      if (control.type === 'radio') {
        if (control.value === saved) control.checked = true;
      } else if (!control.value) control.value = saved;
    });
  };

  try {
    const draft = JSON.parse(sessionStorage.getItem('jj-analysis-draft') || '{}');
    Object.entries(draft).forEach(([name,saved]) => setPrefill(name,saved));
  } catch (_) {}

  ['goal','challenge','industry','profile'].forEach(name => setPrefill(name,params.get(name) || ''));

  if (analyticsAllowed()) startClarity();
  track('analysis_funnel_open',{entry:params.get('entry') || '',prefilled:Boolean(params.get('goal') || params.get('challenge') || params.get('industry') || params.get('profile'))});
  update();
})();
