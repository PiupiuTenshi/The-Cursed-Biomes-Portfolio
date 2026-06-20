const messagesBody = document.querySelector('[data-messages-body]');
const messagePager = document.querySelector('[data-message-pager]');
const messageDetail = document.querySelector('[data-message-detail]');
const messageStatusSelect = document.querySelector('[data-message-status-select]');
const eventsFeed = document.querySelector('[data-events-feed]');
const eventsSummary = document.querySelector('[data-events-summary]');
const overviewChart = document.querySelector('[data-overview-chart]');
const eventFilters = document.querySelector('[data-event-filters]');
const eventTypeFilter = document.querySelector('[data-event-type-filter]');
const clearEventFilters = document.querySelector('[data-clear-event-filters]');
const noticeForm = document.querySelector('[data-notice-form]');
const noticeStatus = document.querySelector('[data-notice-status]');
const reposFeed = document.querySelector('[data-repos-feed]');
const auditFeed = document.querySelector('[data-audit-feed]');
const refreshButton = document.querySelector('[data-refresh]');
const logoutButton = document.querySelector('[data-logout]');
const adminTabs = document.querySelectorAll('[data-admin-tab]');
const adminSections = document.querySelectorAll('[data-admin-section]');
const adminViewButtons = document.querySelectorAll('[data-admin-view]');
const kpiUnread = document.querySelector('[data-kpi-unread]');
const kpiMessages = document.querySelector('[data-kpi-messages]');
const kpiEvents = document.querySelector('[data-kpi-events]');
const kpiSessions = document.querySelector('[data-kpi-sessions]');
const kpiAudit = document.querySelector('[data-kpi-audit]');
const messageStatusFilterButtons = document.querySelectorAll('[data-message-status-filter]');
const DEFAULT_MESSENGER_URL = 'https://m.me/MahiruShiina.tym.1207';
const MESSAGE_PAGE_SIZE = 8;
let filterTimer = 0;
let allMessages = [];
let dailyEvents = [];
let messagePage = 1;
let messageStatusFilter = 'all';
let selectedMessageId = '';
let activeAdminView = getInitialAdminView();

refreshButton.addEventListener('click', loadDashboard);
messageStatusSelect.addEventListener('change', () => {
  setMessageStatusFilter(messageStatusSelect.value);
});
messageStatusFilterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setAdminView('messages');
    setMessageStatusFilter(button.dataset.messageStatusFilter || 'all');
  });
});
adminTabs.forEach((button) => {
  button.addEventListener('click', () => setAdminView(button.dataset.adminTab || 'overview'));
});
adminViewButtons.forEach((button) => {
  button.addEventListener('click', () => setAdminView(button.dataset.adminView || 'overview'));
});
eventFilters.addEventListener('input', queueDashboardLoad);
eventFilters.addEventListener('change', queueDashboardLoad);
clearEventFilters.addEventListener('click', () => {
  eventFilters.reset();
  loadDashboard();
});
noticeForm.addEventListener('submit', saveNotice);
logoutButton.addEventListener('click', async () => {
  await fetch('/api/admin/logout', { method: 'POST' });
  window.location.href = '/';
});

loadDashboard();
setAdminView(activeAdminView, { updateHash: false });

window.addEventListener('hashchange', () => {
  setAdminView(getInitialAdminView(), { updateHash: false });
});

async function loadDashboard() {
  const [messagesResult, eventsResult, reposResult, auditResult] = await Promise.allSettled([
    api('/api/admin/messages'),
    api(`/api/admin/events?${buildEventQuery()}`),
    api('/api/admin/repos'),
    api('/api/admin/audit'),
  ]);

  const authError = [messagesResult, eventsResult, reposResult, auditResult]
    .find((result) => result.status === 'rejected' && result.reason.message.includes('401'));
  if (authError) {
    window.location.href = '/';
    return;
  }

  if (messagesResult.status === 'fulfilled') {
    const messages = messagesResult.value;
    allMessages = messages.messages || [];
    renderMessages();
    kpiUnread.textContent = messages.unread ?? 0;
    kpiMessages.textContent = allMessages.length;
  } else {
    messagesBody.innerHTML = `<tr><td colspan="5">Messages failed: ${escapeHtml(messagesResult.reason.message)}</td></tr>`;
    renderMessagePager(0);
    renderSelectedMessage(null);
  }

  if (eventsResult.status === 'fulfilled') {
    const events = eventsResult.value;
    dailyEvents = events.summary?.daily || [];
    renderEventTypeOptions(events.eventTypes || []);
    renderEventSummary(events.summary || {});
    renderEvents(events.events || []);
    kpiEvents.textContent = events.total ?? 0;
    kpiSessions.textContent = events.summary?.uniqueSessions ?? 0;
  } else {
    dailyEvents = [];
    renderEventSummary({});
    eventsFeed.innerHTML = `<article><strong>Events failed</strong><span>${escapeHtml(eventsResult.reason.message)}</span></article>`;
  }

  if (reposResult.status === 'fulfilled') {
    renderRepos(reposResult.value.repos || []);
  } else {
    reposFeed.innerHTML = `<article><strong>Repos failed</strong><span>${escapeHtml(reposResult.reason.message)}</span></article>`;
  }

  if (auditResult.status === 'fulfilled') {
    const audit = auditResult.value;
    renderFeed(auditFeed, audit.audit || [], (entry) => `${entry.action} - ${entry.ip || 'local'}`);
    kpiAudit.textContent = audit.total ?? 0;
  } else {
    auditFeed.innerHTML = `<article><strong>Audit failed</strong><span>${escapeHtml(auditResult.reason.message)}</span></article>`;
  }

  loadNotice();
  renderOverviewChart();
}

async function loadNotice() {
  try {
    const notice = await api('/api/admin/notice');
    renderNotice(notice.notice || {});
  } catch (error) {
    if (noticeStatus) noticeStatus.textContent = `Notice unavailable: ${error.message}`;
  }
}

function getInitialAdminView() {
  const hash = window.location.hash.replace(/^#/, '');
  return normalizeAdminView(hash || 'overview');
}

function normalizeAdminView(view) {
  return ['overview', 'notice', 'messages', 'events', 'repos', 'audit'].includes(view) ? view : 'overview';
}

function setAdminView(view, options = {}) {
  activeAdminView = normalizeAdminView(view);
  adminTabs.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.adminTab === activeAdminView);
  });
  adminSections.forEach((section) => {
    section.classList.toggle('is-active', section.dataset.adminSection === activeAdminView);
  });

  if (options.updateHash !== false && window.location.hash !== `#${activeAdminView}`) {
    history.replaceState(null, '', `#${activeAdminView}`);
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

function setMessageStatusFilter(status) {
  messageStatusFilter = ['all', 'read', 'unread'].includes(status) ? status : 'all';
  messagePage = 1;
  messageStatusSelect.value = messageStatusFilter;
  messageStatusFilterButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.messageStatusFilter === messageStatusFilter);
  });
  renderMessages();
}

function getFilteredMessages() {
  if (messageStatusFilter === 'all') return allMessages;
  return allMessages.filter((message) => message.status === messageStatusFilter);
}

function renderMessages() {
  messageStatusSelect.value = messageStatusFilter;
  messageStatusFilterButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.messageStatusFilter === messageStatusFilter);
  });

  const messages = getFilteredMessages();
  if (messages.length === 0) {
    messagesBody.innerHTML = '<tr><td colspan="5">No whispers from visitors yet.</td></tr>';
    renderMessagePager(0);
    renderSelectedMessage(null);
    return;
  }

  const totalPages = Math.max(1, Math.ceil(messages.length / MESSAGE_PAGE_SIZE));
  messagePage = Math.min(Math.max(1, messagePage), totalPages);
  const start = (messagePage - 1) * MESSAGE_PAGE_SIZE;
  const pageItems = messages.slice(start, start + MESSAGE_PAGE_SIZE);

  if (!selectedMessageId || !messages.some((message) => message.id === selectedMessageId)) {
    selectedMessageId = pageItems[0]?.id || '';
  }

  messagesBody.innerHTML = pageItems.map((message) => `
    <tr class="${message.id === selectedMessageId ? 'is-selected' : ''}" data-message-row="${escapeAttribute(message.id)}">
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

  messagesBody.querySelectorAll('[data-message-row]').forEach((row) => {
    row.addEventListener('click', () => {
      selectedMessageId = row.getAttribute('data-message-row') || '';
      renderMessages();
    });
  });

  messagesBody.querySelectorAll('[data-message-id]').forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.stopPropagation();
      await api(`/api/admin/messages/${button.dataset.messageId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: button.dataset.nextStatus }),
      });
      loadDashboard();
    });
  });

  messagesBody.querySelectorAll('[data-copy-contact]').forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.stopPropagation();
      const value = button.getAttribute('data-copy-contact') || '';
      await copyText(value);
      const previous = button.textContent;
      button.textContent = 'Copied';
      window.setTimeout(() => {
        button.textContent = previous;
      }, 1200);
    });
  });

  renderMessagePager(messages.length);
  renderSelectedMessage(allMessages.find((message) => message.id === selectedMessageId) || pageItems[0]);
}

function renderMessagePager(total) {
  if (!messagePager) return;
  const totalPages = Math.max(1, Math.ceil(total / MESSAGE_PAGE_SIZE));
  messagePager.innerHTML = `
    <span>${escapeHtml(total)} messages / page ${escapeHtml(messagePage)} of ${escapeHtml(totalPages)}</span>
    <div>
      <button type="button" data-message-page="prev" ${messagePage <= 1 ? 'disabled' : ''}>Prev</button>
      <button type="button" data-message-page="next" ${messagePage >= totalPages ? 'disabled' : ''}>Next</button>
    </div>
  `;

  messagePager.querySelectorAll('[data-message-page]').forEach((button) => {
    button.addEventListener('click', () => {
      messagePage += button.dataset.messagePage === 'next' ? 1 : -1;
      renderMessages();
    });
  });
}

function renderSelectedMessage(message) {
  if (!messageDetail) return;
  if (!message) {
    messageDetail.innerHTML = '<strong>Select a message</strong><span>Click a row to inspect contact, page, session, and visitor metadata.</span>';
    return;
  }

  messageDetail.innerHTML = `
    <strong>${escapeHtml(message.message)}</strong>
    <dl>
      <div><dt>Time</dt><dd>${escapeHtml(formatTime(message.timestamp))}</dd></div>
      <div><dt>Status</dt><dd>${escapeHtml(message.status || 'unknown')}</dd></div>
      <div><dt>Page</dt><dd>${escapeHtml(message.page || '/')}</dd></div>
      <div><dt>Language</dt><dd>${escapeHtml(message.language || '-')}</dd></div>
      <div><dt>Session</dt><dd>${escapeHtml(message.sessionId || '-')}</dd></div>
      <div><dt>IP</dt><dd>${escapeHtml(message.ip || 'local')}</dd></div>
      <div><dt>Contact</dt><dd>${renderContactActions(message.visitorContact)}</dd></div>
    </dl>
    <small>${escapeHtml(message.userAgent || '')}</small>
  `;
}

function renderContactActions(contact = {}) {
  const actions = [];
  const email = contact.email || '';
  const zalo = normalizePhone(contact.zalo || contact.raw || '');
  const facebook = parseFacebookUrl(contact.facebook || contact.raw || '');
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

  if (facebook) {
    actions.push(`<a class="contact-action" href="${escapeAttribute(facebook)}" target="_blank" rel="noreferrer">Facebook</a>`);
  }

  actions.push(`<a class="contact-action contact-action-strong" href="${escapeAttribute(DEFAULT_MESSENGER_URL)}" target="_blank" rel="noreferrer">Messenger</a>`);

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

function parseFacebookUrl(value) {
  return String(value || '').match(/https?:\/\/(?:www\.)?facebook\.com\/[^\s]+/i)?.[0] || '';
}

function renderNotice(notice) {
  if (!noticeForm) return;
  noticeForm.elements.enabled.checked = Boolean(notice.enabled);
  noticeForm.elements.message.value = notice.message || '';
  noticeStatus.textContent = notice.updatedAt ? `Saved ${formatTime(notice.updatedAt)}` : 'No notice saved';
}

async function saveNotice(event) {
  event.preventDefault();
  const formData = new FormData(noticeForm);
  const submitButton = noticeForm.querySelector('button[type="submit"]');
  const payload = {
    enabled: formData.get('enabled') === 'on',
    message: String(formData.get('message') || '').trim(),
  };

  noticeStatus.textContent = 'Saving...';
  if (submitButton) submitButton.disabled = true;

  try {
    const result = await api('/api/admin/notice', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }, 4000);
    renderNotice(result.notice || {});
    noticeStatus.textContent = 'Saved';
    window.setTimeout(() => {
      noticeStatus.textContent = result.notice?.updatedAt ? `Saved ${formatTime(result.notice.updatedAt)}` : 'Saved';
    }, 900);
  } catch (error) {
    noticeStatus.textContent = `Save failed: ${error.message}`;
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
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

function renderOverviewChart() {
  if (!overviewChart) return;

  const dayKeys = getChartDayKeys(dailyEvents);
  const chatCounts = countMessagesByDay(allMessages, dayKeys);
  const eventCounts = new Map(dailyEvents.map((item) => [item.key, Number(item.count) || 0]));
  const maxValue = Math.max(
    1,
    ...dayKeys.map((key) => eventCounts.get(key) || 0),
    ...dayKeys.map((key) => chatCounts.get(key) || 0),
  );

  overviewChart.innerHTML = `
    <div class="chart-legend">
      <span><b class="visit-dot"></b>Visits</span>
      <span><b class="chat-dot"></b>Chat</span>
    </div>
    <div class="chart-bars">
      ${dayKeys.map((key) => {
    const visits = eventCounts.get(key) || 0;
    const chats = chatCounts.get(key) || 0;
    return `
        <div class="chart-day">
          <div class="chart-columns" title="${escapeAttribute(key)}: ${escapeAttribute(visits)} visits / ${escapeAttribute(chats)} chat">
            <span class="bar bar-visits" style="height: ${Math.max(4, Math.round((visits / maxValue) * 100))}%"></span>
            <span class="bar bar-chat" style="height: ${Math.max(4, Math.round((chats / maxValue) * 100))}%"></span>
          </div>
          <strong>${escapeHtml(formatChartDay(key))}</strong>
          <small>${escapeHtml(visits)} / ${escapeHtml(chats)}</small>
        </div>
      `;
  }).join('')}
    </div>
  `;
}

function getChartDayKeys(serverDays) {
  if (serverDays.length > 0) return serverDays.map((item) => item.key);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return date.toISOString().slice(0, 10);
  });
}

function countMessagesByDay(messages, dayKeys) {
  const counts = new Map(dayKeys.map((key) => [key, 0]));
  messages.forEach((message) => {
    const key = toDateKey(message.timestamp);
    if (counts.has(key)) {
      counts.set(key, counts.get(key) + 1);
    }
  });
  return counts;
}

function toDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function formatChartDay(key) {
  const date = new Date(`${key}T00:00:00`);
  if (Number.isNaN(date.getTime())) return key;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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

async function api(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    signal: controller.signal,
    ...options,
  }).catch((error) => {
    if (error.name === 'AbortError') throw new Error('Request timed out');
    throw error;
  }).finally(() => {
    window.clearTimeout(timeout);
  });
  const payload = await response.json().catch(() => ({}));
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
