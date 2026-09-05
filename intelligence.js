(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  let days = 28;

  const fmt = new Intl.NumberFormat('de-DE');
  const pct = value => `${(Number(value || 0)*100).toFixed(1)} %`;
  const pos = value => Number(value || 0).toFixed(1);
  const deltaLabel = (value,invert=false) => {
    const n = Number(value || 0);
    const good = invert ? n >= 0 : n >= 0;
    const sign = n > 0 ? '+' : '';
    return {text:`${sign}${(n*100).toFixed(1)} % vs. vorher`,cls:good ? 'positive' : 'negative'};
  };
  const setStatus = (selector,on,onLabel='Aktiv',offLabel='Fehlt') => {
    const el = $(selector);
    if (!el) return;
    el.textContent = on ? onLabel : offLabel;
  };

  async function loadStatus() {
    try {
      const response = await fetch('/api/intelligence/status',{cache:'no-store'});
      const data = await response.json();
      const i = data.integrations || {};
      setStatus('[data-status-clarity]',i.clarity?.configured,'Aktiv','Fehlt');
      setStatus('[data-status-posthog]',i.posthog?.configured,'Bereit','Key fehlt');
      setStatus('[data-status-gsc]',i.searchConsole?.oauthConfigured,'OAuth bereit','OAuth fehlt');
      setStatus('[data-status-quality]',Boolean(i.quality?.lychee && i.quality?.unlighthouse),'Automatisch','Fehlt');
    } catch (_) {
      $('[data-overall-status]').textContent = 'Status nicht erreichbar';
    }
  }

  function renderDelta(selector,value) {
    const el = $(selector);
    const meta = deltaLabel(value);
    el.textContent = meta.text;
    el.classList.remove('positive','negative');
    el.classList.add(meta.cls);
  }

  function opportunityScore(row) {
    return Number(row.impressions || 0) * Math.max(.05,1-Number(row.ctr || 0)) * Math.max(1,21-Number(row.position || 21));
  }

  function actionFor(row) {
    const p = Number(row.position || 0);
    const ctr = Number(row.ctr || 0);
    if (p <= 6 && ctr < .03) return 'Title/Meta testen';
    if (p <= 10) return 'CTR + Snippet';
    if (p <= 20) return 'Content ausbauen';
    return 'Beobachten';
  }

  function render(data) {
    $('[data-kpi-clicks]').textContent = fmt.format(data.totals.clicks || 0);
    $('[data-kpi-impressions]').textContent = fmt.format(data.totals.impressions || 0);
    $('[data-kpi-ctr]').textContent = pct(data.totals.ctr);
    $('[data-kpi-position]').textContent = pos(data.totals.position);
    renderDelta('[data-delta-clicks]',data.delta.clicks);
    renderDelta('[data-delta-impressions]',data.delta.impressions);
    renderDelta('[data-delta-ctr]',data.delta.ctr);
    renderDelta('[data-delta-position]',data.delta.position);

    const opportunities = (data.queries || [])
      .filter(row => row.impressions >= 20 && row.position >= 4 && row.position <= 20)
      .sort((a,b)=>opportunityScore(b)-opportunityScore(a))
      .slice(0,12);

    const tbody = $('[data-opportunity-rows]');
    tbody.innerHTML = opportunities.length ? opportunities.map(row => `
      <tr>
        <td><strong>${escapeHtml(row.query || '(ohne Query)')}</strong></td>
        <td>${fmt.format(row.impressions)}</td>
        <td>${pct(row.ctr)}</td>
        <td>${pos(row.position)}</td>
        <td><span class="intel-action-tag">${actionFor(row)}</span></td>
      </tr>`).join('') : '<tr><td colspan="5">Noch keine ausreichend starken Chancen im gewählten Zeitraum.</td></tr>';

    const pages = (data.pages || []).slice(0,10);
    $('[data-page-list]').innerHTML = pages.length ? pages.map(row => `
      <div class="intel-page">
        <strong title="${escapeHtml(row.page)}">${escapeHtml(shortPage(row.page))}</strong>
        <small><span>${fmt.format(row.clicks)} Klicks</span><span>${fmt.format(row.impressions)} Impr.</span><span>Pos. ${pos(row.position)}</span></small>
      </div>`).join('') : '<p class="intel-empty">Noch keine Landingpage-Daten.</p>';

    if (opportunities[0]) {
      $('[data-action-title]').textContent = `Priorität: „${opportunities[0].query}“`;
      $('[data-action-copy]').textContent = `Position ${pos(opportunities[0].position)} bei ${fmt.format(opportunities[0].impressions)} Impressionen. ${actionFor(opportunities[0])} ist aktuell der stärkste organische Hebel.`;
    } else {
      $('[data-action-title]').textContent = 'Search Console ist verbunden';
      $('[data-action-copy]').textContent = 'Das System beobachtet Rankings, CTR und Landingpages und priorisiert automatisch neue Chancen.';
    }

    $('[data-overall-status]').textContent = `Google aktiv · ${data.period.startDate} → ${data.period.endDate}`;
    $('[data-status-gsc]').textContent = 'Verbunden';
    $$('[data-google-connect]').forEach(el => el.textContent = 'Google neu verbinden');
  }

  function escapeHtml(value='') {
    return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }

  function shortPage(url='') {
    try {
      const parsed = new URL(url);
      return `${parsed.hostname}${parsed.pathname}`;
    } catch (_) { return url; }
  }

  async function loadData() {
    $('[data-overall-status]').textContent = 'Search Console wird geladen …';
    try {
      const response = await fetch(`/api/google/search-console?days=${days}`,{cache:'no-store'});
      const data = await response.json().catch(()=>({}));
      if (response.status === 401) {
        $('[data-overall-status]').textContent = 'Google noch nicht verbunden';
        $('[data-status-gsc]').textContent = 'Verbinden';
        return;
      }
      if (response.status === 403) {
        $('[data-overall-status]').textContent = 'Search-Console-Zugriff fehlt';
        $('[data-status-gsc]').textContent = 'Berechtigung fehlt';
        return;
      }
      if (!response.ok) throw new Error(data.error || 'load_failed');
      render(data);
    } catch (_) {
      $('[data-overall-status]').textContent = 'Search Console derzeit nicht erreichbar';
    }
  }

  $$('[data-days]').forEach(button => button.addEventListener('click',() => {
    $$('[data-days]').forEach(item=>item.classList.remove('active'));
    button.classList.add('active');
    days = Number(button.dataset.days || 28);
    loadData();
  }));

  $('[data-google-disconnect]')?.addEventListener('click',async () => {
    await fetch('/api/google/oauth/disconnect',{method:'POST'}).catch(()=>{});
    location.href='/intelligence?google=disconnected';
  });

  const params = new URLSearchParams(location.search);
  if (params.get('google') === 'connected') {
    history.replaceState({},'',location.pathname);
  }

  loadStatus();
  loadData();
})();
