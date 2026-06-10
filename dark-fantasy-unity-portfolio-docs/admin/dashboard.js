const messagesBody = document.querySelector('[data-messages-body]');
const eventsFeed = document.querySelector('[data-events-feed]');
const reposFeed = document.querySelector('[data-repos-feed]');
const auditFeed = document.querySelector('[data-audit-feed]');
const refreshButton = document.querySelector('[data-refresh]');
const logoutButton = document.querySelector('[data-logout]');
const kpiUnread = document.querySelector('[data-kpi-unread]');
const kpiMessages = document.querySelector('[data-kpi-messages]');
const kpiEvents = document.querySelector('[data-kpi-events]');
const kpiAudit = document.querySelector('[data-kpi-audit]');

refreshButton.addEventListener('click', loadDashboard);
logoutButton.addEventListener('click', async () => {
  await fetch('/api/admin/logout', { method: 'POST' });
  window.location.href = '/';
});

loadDashboard();

async function loadDashboard() {
  try {
    const [messages, events, repos, audit] = await Promise.all([
      api('/api/admin/messages'),
      api('/api/admin/events'),
      api('/api/admin/repos'),
      api('/api/admin/audit'),
    ]);

    renderMessages(messages.messages || []);
    renderFeed(eventsFeed, events.events || [], (event) => `${event.eventType} - ${event.path || '/'}`);
    renderRepos(repos.repos || []);
    renderFeed(auditFeed, audit.audit || [], (entry) => `${entry.action} - ${entry.ip || 'local'}`);

    kpiUnread.textContent = messages.unread ?? 0;
    kpiMessages.textContent = messages.messages?.length ?? 0;
    kpiEvents.textContent = events.total ?? 0;
    kpiAudit.textContent = audit.total ?? 0;
  } catch (error) {
    if (error.message.includes('401')) {
      window.location.href = '/';
      return;
    }
    auditFeed.innerHTML = `<article><strong>Load failed</strong><span>${escapeHtml(error.message)}</span></article>`;
  }
}

function renderMessages(messages) {
  if (messages.length === 0) {
    messagesBody.innerHTML = '<tr><td colspan="5">No whispers from visitors yet.</td></tr>';
    return;
  }

  messagesBody.innerHTML = messages.map((message) => `
    <tr>
      <td>${escapeHtml(formatTime(message.timestamp))}</td>
      <td>${escapeHtml(message.visitorContact?.email || message.visitorContact?.zalo || message.visitorContact?.raw || 'None')}</td>
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
