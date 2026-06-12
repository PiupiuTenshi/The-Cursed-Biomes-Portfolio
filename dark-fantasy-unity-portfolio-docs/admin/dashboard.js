const messagesBody = document.querySelector('[data-messages-body]');
const eventsFeed = document.querySelector('[data-events-feed]');
const eventsSummary = document.querySelector('[data-events-summary]');
const eventFilters = document.querySelector('[data-event-filters]');
const eventTypeFilter = document.querySelector('[data-event-type-filter]');
const clearEventFilters = document.querySelector('[data-clear-event-filters]');
const reposFeed = document.querySelector('[data-repos-feed]');
const auditFeed = document.querySelector('[data-audit-feed]');
const refreshButton = document.querySelector('[data-refresh]');
const logoutButton = document.querySelector('[data-logout]');
const kpiUnread = document.querySelector('[data-kpi-unread]');
const kpiMessages = document.querySelector('[data-kpi-messages]');
const kpiEvents = document.querySelector('[data-kpi-events]');
const kpiSessions = document.querySelector('[data-kpi-sessions]');
const kpiAudit = document.querySelector('[data-kpi-audit]');
let filterTimer = 0;

refreshButton.addEventListener('click', loadDashboard);
eventFilters.addEventListener('input', queueDashboardLoad);
eventFilters.addEventListener('change', queueDashboardLoad);
clearEventFilters.addEventListener('click', () => {
  eventFilters.reset();
  loadDashboard();
});
logoutButton.addEventListener('click', async () => {
  await fetch('/api/admin/logout', { method: 'POST' });
  window.location.href = '/';
});

loadDashboard();

async function loadDashboard() {
  try {
    const [messages, events, repos, audit] = await Promise.all([
      api('/api/admin/messages'),
      api(`/api/admin/events?${buildEventQuery()}`),
      api('/api/admin/repos'),
      api('/api/admin/audit'),
    ]);

    renderMessages(messages.messages || []);
    renderEventTypeOptions(events.eventTypes || []);
    renderEventSummary(events.summary || {});
    renderEvents(events.events || []);
    renderRepos(repos.repos || []);
    renderFeed(auditFeed, audit.audit || [], (entry) => `${entry.action} - ${entry.ip || 'local'}`);

    kpiUnread.textContent = messages.unread ?? 0;
    kpiMessages.textContent = messages.messages?.length ?? 0;
    kpiEvents.textContent = events.total ?? 0;
    kpiSessions.textContent = events.summary?.uniqueSessions ?? 0;
    kpiAudit.textContent = audit.total ?? 0;
  } catch (error) {
    if (error.message.includes('401')) {
      window.location.href = '/';
      return;
    }
    auditFeed.innerHTML = `<article><strong>Load failed</strong><span>${escapeHtml(error.message)}</span></article>`;
  }
}

function queueDashboardLoad() {
  window.clearTimeout(filterTimer);
  filterTimer = window.setTimeout(loadDashboard, 280);
}

function buildEventQuery() {
  const params = new URLSearchParams();
  const formData = new FormData(eventFilters);

  formData.forEach((value, key) => {
    const normalized = String(value).trim();
    if (normalized) params.set(key, normalized);
  });

  if (!params.has('limit')) params.set('limit', '100');
  return params.toString();
}

function renderMessages(messages) {
  if (messages.length === 0) {
    messagesBody.innerHTML = '<tr><td colspan="5">No whispers from visitors yet.</td></tr>';
    return;
  }

  messagesBody.innerHTML = messages.map((message) => `
    <tr>
      <td>${escapeHtml(formatTime(message.timestamp))}</td>
      <td>${renderContactActions(message.visitorContact)}</td>
      <td>${escapeHtml(message.message)}</td>
      <td>${escapeHtml(message.status)}</td>
      <td>
        <button type="button" data-message-id="${escapeAttribute(message.id)}" data-next-status="${message.status === 'read' ? 'unread' : 'read'}">
          Mark ${message.status === 'read' ? 'Unread' : 'Read'}
        </button>
      </td>
    </tr>
  `).join('');

  messagesBody.querySelectorAll('[data-message-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      await api(`/api/admin/messages/${button.dataset.messageId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: button.dataset.nextStatus }),
      });
      loadDashboard();
    });
  });

  messagesBody.querySelectorAll('[data-copy-contact]').forEach((button) => {
    button.addEventListener('click', async () => {
      const value = button.getAttribute('data-copy-contact') || '';
      await copyText(value);
      const previous = button.textContent;
      button.textContent = 'Copied';
      window.setTimeout(() => {
        button.textContent = previous;
      }, 1200);
    });
  });
}

function renderContactActions(contact = {}) {
  const actions = [];
  const email = contact.email || '';
  const zalo = normalizePhone(contact.zalo || contact.raw || '');
  const raw = contact.raw || '';

  if (email) {
    const subject = 'Portfolio contact reply';
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}`;
    actions.push(`<a class="contact-action" href="${escapeAttribute(gmailUrl)}" target="_blank" rel="noreferrer">Gmail</a>`);
    actions.push(`<a class="contact-action" href="mailto:${escapeAttribute(email)}?subject=${encodeURIComponent(subject)}">Mail app</a>`);
    actions.push(`<button class="contact-action" type="button" data-copy-contact="${escapeAttribute(email)}">Copy</button>`);
  }

  if (zalo) {
    actions.push(`<a class="contact-action" href="https://zalo.me/${escapeAttribute(zalo)}" target="_blank" rel="noreferrer">Zalo</a>`);
  }

  if (!actions.length && raw) {
    actions.push(`<span>${escapeHtml(raw)}</span>`);
  }

  return actions.length ? `<div class="contact-actions">${actions.join('')}</div>` : 'None';
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const input = document.createElement('textarea');
  input.value = value;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.append(input);
  input.select();
  document.execCommand('copy');
  input.remove();
}

function normalizePhone(value) {
  const digits = String(value || '').replace(/[^\d+]/g, '');
  if (!digits || digits.length < 8) return '';
  return digits.replace(/^\+84/, '0');
}

function renderFeed(target, items, titleFn) {
  if (items.length === 0) {
    target.innerHTML = '<article><strong>Empty</strong><span>No records yet.</span></article>';
    return;
  }

  target.innerHTML = items.slice(0, 12).map((item) => `
    <article>
      <strong>${escapeHtml(titleFn(item))}</strong>
      <span>${escapeHtml(formatTime(item.timestamp))}</span>
    </article>
  `).join('');
}

function renderEvents(events) {
  if (events.length === 0) {
    eventsFeed.innerHTML = '<article><strong>No matching events</strong><span>Adjust filters or wait for new visitor activity.</span></article>';
    return;
  }

  eventsFeed.innerHTML = events.map((event) => {
    const metadata = Object.entries(event.metadata || {})
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .slice(0, 6)
      .map(([key, value]) => `${key}: ${formatMetaValue(value)}`)
      .join(' / ');

    return `
      <article>
        <strong>${escapeHtml(event.eventType)} - ${escapeHtml(event.path || '/')}</strong>
        <span>${escapeHtml(formatTime(event.timestamp))}</span>
        <span>${escapeHtml(event.sessionId || 'no session')} / ${escapeHtml(event.ip || 'local')}</span>
        ${metadata ? `<small>${escapeHtml(metadata)}</small>` : ''}
      </article>
    `;
  }).join('');
}

function renderEventSummary(summary) {
  const typeItems = renderSummaryItems(summary.byType || []);
  const pathItems = renderSummaryItems(summary.byPath || []);
  eventsSummary.innerHTML = `
    <article>
      <span>Unique sessions</span>
      <strong>${escapeHtml(summary.uniqueSessions ?? 0)}</strong>
    </article>
    <article>
      <span>Top event types</span>
      <div>${typeItems || '<em>No event types yet.</em>'}</div>
    </article>
    <article>
      <span>Top paths</span>
      <div>${pathItems || '<em>No paths yet.</em>'}</div>
    </article>
  `;
}

function renderSummaryItems(items) {
  return items.map((item) => `<b>${escapeHtml(item.name)} <mark>${escapeHtml(item.count)}</mark></b>`).join('');
}

function renderEventTypeOptions(eventTypes) {
  const selected = eventTypeFilter.value;
  eventTypeFilter.innerHTML = '<option value="">All types</option>'
    + eventTypes.map((type) => `<option value="${escapeAttribute(type)}">${escapeHtml(type)}</option>`).join('');
  eventTypeFilter.value = eventTypes.includes(selected) ? selected : '';
}

function renderRepos(repos) {
  if (repos.length === 0) {
    reposFeed.innerHTML = '<article><strong>No repos</strong><span>Repo settings are not configured.</span></article>';
    return;
  }

  reposFeed.innerHTML = repos.map((repo) => `
    <article>
      <strong>${escapeHtml(repo.repoName)}</strong>
      <span>${repo.visible ? 'Visible' : 'Hidden'} / ${repo.featured ? 'Featured' : 'Normal'} / ${escapeHtml(repo.category)}</span>
    </article>
  `).join('');
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${payload.error || 'Request failed'}`);
  return payload;
}

function formatTime(value) {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleString();
}

function formatMetaValue(value) {
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
