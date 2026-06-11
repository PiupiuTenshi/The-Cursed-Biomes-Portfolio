const loadingGate = document.querySelector('[data-loading-gate]');
const revealItems = document.querySelectorAll('[data-reveal]');
const tiltItems = document.querySelectorAll('[data-tilt]');
const audioToggle = document.querySelector('[data-audio-toggle]');
const audioPrev = document.querySelector('[data-audio-prev]');
const audioNext = document.querySelector('[data-audio-next]');
const audioVolume = document.querySelector('[data-audio-volume]');
const audioLabel = document.querySelector('[data-audio-label]');
const audioLoop = document.querySelector('[data-audio-loop]');
const motionToggle = document.querySelector('[data-motion-toggle]');
const localeButtons = document.querySelectorAll('[data-locale-button]');
const ambientCanvas = document.querySelector('[data-ambient-canvas]');
const ghostCanvas = document.querySelector('[data-ghost-canvas]');
const demoButton = document.querySelector('[data-demo-button]');
const demoReset = document.querySelector('[data-demo-reset]');
const demoProgress = document.querySelector('[data-demo-progress]');
const chatToggle = document.querySelector('[data-chat-toggle]');
const chatPanel = document.querySelector('[data-chat-panel]');
const chatMessages = document.querySelector('[data-chat-messages]');
const quickReplies = document.querySelectorAll('[data-reply-key]');
const chatForm = document.querySelector('[data-chat-form]');
const chatInput = document.querySelector('[data-chat-input]');
const contactInput = document.querySelector('[data-contact-input]');
const chatStatus = document.querySelector('[data-chat-status]');
const projectGrid = document.querySelector('[data-project-grid]');
const repoStatus = document.querySelector('[data-repo-status]');
const projectFilters = document.querySelectorAll('[data-project-filter]');
const webglModal = document.querySelector('[data-webgl-modal]');
const webglFrame = document.querySelector('[data-webgl-frame]');
const webglLoader = document.querySelector('[data-webgl-loader]');
const webglLine = document.querySelector('[data-webgl-line]');
const webglClose = document.querySelector('[data-webgl-close]');
const webglFullscreen = document.querySelector('[data-webgl-fullscreen]');
const webglOpen = document.querySelector('[data-webgl-open]');
const webglFallback = document.querySelector('[data-webgl-fallback]');
const webglWarning = document.querySelector('[data-webgl-warning]');

const GITHUB_USERNAME = 'PiupiuTenshi';
const GITHUB_REPOS_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&direction=desc&per_page=100`;
const REPO_CACHE_KEY = 'cursed-biomes.github-repos.v1';
const SESSION_KEY = 'cursed-biomes.session-id.v1';
const AUDIO_SETTINGS_KEY = 'cursed-biomes.audio-settings.v1';
const MOTION_SETTINGS_KEY = 'cursed-biomes.reduce-motion.v1';
const LOCALE_SETTINGS_KEY = 'cursed-biomes.locale.v1';
const REPO_CACHE_TTL_MS = 10 * 60 * 1000;
const appContent = window.CursedBiomesContent || {};
const translations = appContent.translations || { en: {} };
const defaultLocale = appContent.defaultLocale || 'en';
const supportedLocales = appContent.supportedLocales || [defaultLocale];
const AUDIO_TRACKS = appContent.audioTracks || [];
const WEBGL_LOAD_LINE_KEYS = appContent.webglLoadLineKeys || [];
const webglDemo = appContent.webglDemo || {};
const repoSettings = appContent.repoSettings || [];
const fallbackRepos = appContent.fallbackRepos || [];

let currentLocale = getInitialLocale();
let lastRepoStatus = { key: 'repo.status.prepare', vars: {} };
let activeProjectFilter = 'all';
let visibleRepos = [];
let webglLineTimer = null;
let wasAudioPlayingBeforeWebgl = false;
let currentTrackIndex = 0;
let audioEnabled = false;
let reducedMotion = readBooleanSetting(MOTION_SETTINGS_KEY);
let effectsRunning = false;
let ambientAnimationId = 0;
let ghostAnimationId = 0;
let ambientParticles = [];
let ghostPoints = [];
const sessionId = getOrCreateSessionId();

window.addEventListener('load', () => {
  window.setTimeout(() => {
    loadingGate?.classList.add('is-hidden');
  }, 1100);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 },
);

revealItems.forEach((item) => revealObserver.observe(item));
initI18n();
attachTilt(tiltItems);
initAudioControls();
initEffects();
initAnalytics();
loadGitHubRepos();

function initI18n() {
  applyTranslations();

  localeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const locale = button.getAttribute('data-locale-button') || defaultLocale;
      setLocale(locale);
    });
  });
}

function setLocale(locale) {
  if (!supportedLocales.includes(locale) || locale === currentLocale) return;
  currentLocale = locale;

  try {
    localStorage.setItem(LOCALE_SETTINGS_KEY, currentLocale);
  } catch {
    // Locale persistence is optional.
  }

  applyTranslations();
  updateAudioUi();
  applyMotionPreference();
  updateRepoStatus(lastRepoStatus.key, lastRepoStatus.vars);
  renderRepos();
  logVisitorEvent('LANGUAGE_SWITCHED', { locale: currentLocale });
}

function applyTranslations() {
  document.documentElement.lang = currentLocale;
  document.title = t('meta.title');

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.getAttribute('data-i18n'));
  });

  applyTranslatedAttribute('data-i18n-content', 'content');
  applyTranslatedAttribute('data-i18n-placeholder', 'placeholder');
  applyTranslatedAttribute('data-i18n-aria-label', 'aria-label');
  applyTranslatedAttribute('data-i18n-alt', 'alt');
  applyTranslatedAttribute('data-i18n-title', 'title');

  localeButtons.forEach((button) => {
    const locale = button.getAttribute('data-locale-button');
    button.classList.toggle('is-active', locale === currentLocale);
    button.setAttribute('aria-pressed', String(locale === currentLocale));
  });
}

function applyTranslatedAttribute(keyAttribute, targetAttribute) {
  document.querySelectorAll(`[${keyAttribute}]`).forEach((element) => {
    element.setAttribute(targetAttribute, t(element.getAttribute(keyAttribute)));
  });
}

function t(key, vars = {}) {
  if (!key) return '';
  const dictionary = translations[currentLocale] || {};
  const fallbackDictionary = translations[defaultLocale] || {};
  const value = dictionary[key] ?? fallbackDictionary[key] ?? key;
  return String(value).replace(/\{([a-zA-Z0-9_]+)\}/g, (_, token) => vars[token] ?? '');
}

function getInitialLocale() {
  try {
    const saved = localStorage.getItem(LOCALE_SETTINGS_KEY);
    if (supportedLocales.includes(saved)) return saved;
  } catch {
    // Fall through to browser language.
  }

  const browserLocale = navigator.language?.toLowerCase().startsWith('vi') ? 'vi' : defaultLocale;
  return supportedLocales.includes(browserLocale) ? browserLocale : defaultLocale;
}

function attachTilt(items) {
  items.forEach((item) => {
    if (item.dataset.tiltReady === 'true') return;
    item.dataset.tiltReady = 'true';

    item.addEventListener('pointermove', (event) => {
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      item.style.transform = `perspective(900px) rotateX(${y * -5}deg) rotateY(${x * 5}deg)`;
    });

    item.addEventListener('pointerleave', () => {
      item.style.transform = '';
    });
  });
}

async function loadGitHubRepos() {
  if (!projectGrid) return;

  updateRepoStatus('repo.status.checking');
  const cached = readRepoCache();

  if (cached) {
    visibleRepos = prepareRepos(cached, 'cache');
    renderRepos();
    updateRepoStatus('repo.status.cache', { count: visibleRepos.length });
  }

  try {
    const response = await fetch(GITHUB_REPOS_URL, {
      headers: { Accept: 'application/vnd.github+json' },
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}`);
    }

    const repos = await response.json();
    writeRepoCache(repos);
    visibleRepos = prepareRepos(repos, 'github');
    renderRepos();
    updateRepoStatus('repo.status.live', { count: visibleRepos.length });
  } catch (error) {
    if (!cached) {
      visibleRepos = prepareRepos(fallbackRepos, 'fallback');
      renderRepos();
    }

    updateRepoStatus('repo.status.fallback', { message: error.message });
  }
}

function readRepoCache() {
  try {
    const raw = localStorage.getItem(REPO_CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    if (Date.now() - cache.savedAt > REPO_CACHE_TTL_MS) return null;
    return cache.repos;
  } catch {
    return null;
  }
}

function writeRepoCache(repos) {
  try {
    localStorage.setItem(REPO_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), repos }));
  } catch {
    // Cache is optional; rendering should continue if storage is unavailable.
  }
}

function prepareRepos(repos, source) {
  return repos
    .map((repo) => mergeRepoSetting(normalizeRepo(repo), source))
    .filter((repo) => repo.visible)
    .sort(sortRepos);
}

function normalizeRepo(repo) {
  return {
    githubId: repo.id,
    name: repo.name,
    fullName: repo.full_name ?? `${GITHUB_USERNAME}/${repo.name}`,
    description: repo.description,
    htmlUrl: repo.html_url,
    homepage: repo.homepage,
    descriptionKey: repo.descriptionKey,
    language: repo.language,
    topics: Array.isArray(repo.topics) ? repo.topics : [],
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    openIssues: repo.open_issues_count ?? 0,
    pushedAt: repo.pushed_at,
    updatedAt: repo.updated_at,
    archived: Boolean(repo.archived),
    fork: Boolean(repo.fork),
  };
}

function mergeRepoSetting(repo, source) {
  const setting = repoSettings.find((item) => {
    const fullName = `${item.owner}/${item.repoName}`.toLowerCase();
    return fullName === repo.fullName.toLowerCase() || item.repoName.toLowerCase() === repo.name.toLowerCase();
  });

  return {
    ...repo,
    source,
    visible: setting?.visible ?? true,
    featured: setting?.featured ?? false,
    priority: setting?.priority ?? 999,
    category: setting?.category ?? inferCategory(repo),
    tryNowUrl: setting?.tryNowUrl ?? null,
    caseStudyUrl: setting?.caseStudyUrl ?? null,
    displayName: setting?.customTitle ?? repo.name,
    displayDescriptionKey: setting?.customDescriptionKey ?? repo.descriptionKey ?? null,
    displayDescription: setting?.customDescription ?? repo.description ?? null,
  };
}

function inferCategory(repo) {
  const haystack = `${repo.name} ${repo.language ?? ''} ${repo.topics.join(' ')}`.toLowerCase();
  if (haystack.includes('unity') || haystack.includes('game')) return 'unity';
  if (haystack.includes('privacy') || haystack.includes('security') || haystack.includes('pii')) return 'security';
  if (haystack.includes('academic') || haystack.includes('management')) return 'management';
  if (haystack.includes('web') || haystack.includes('javascript') || haystack.includes('typescript')) return 'web';
  if (haystack.includes('ai') || haystack.includes('bot')) return 'ai';
  if (haystack.includes('database') || haystack.includes('sql')) return 'database';
  return 'other';
}

function sortRepos(a, b) {
  return (
    Number(b.featured) - Number(a.featured)
    || a.priority - b.priority
    || Date.parse(b.pushedAt ?? 0) - Date.parse(a.pushedAt ?? 0)
    || b.stars - a.stars
    || a.name.localeCompare(b.name)
  );
}

function renderRepos() {
  if (!projectGrid) return;

  const repos = visibleRepos.filter((repo) => {
    if (activeProjectFilter === 'all') return true;
    if (activeProjectFilter === 'featured') return repo.featured;
    return repo.category === activeProjectFilter;
  });

  if (repos.length === 0) {
    projectGrid.innerHTML = `
      <article class="project-card project-card-loading">
        <span class="project-type">${escapeHtml(t('repo.empty.type'))}</span>
        <h3>${escapeHtml(t('repo.empty.title'))}</h3>
        <p>${escapeHtml(t('repo.empty.body'))}</p>
      </article>
    `;
    return;
  }

  projectGrid.innerHTML = repos.map(renderRepoCard).join('');
  attachTilt(projectGrid.querySelectorAll('[data-tilt]'));
}

function renderRepoCard(repo) {
  const pushed = repo.pushedAt
    ? new Date(repo.pushedAt).toLocaleDateString(currentLocale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    : t('repo.meta.unknown');
  const topics = repo.topics.slice(0, 4).map((topic) => `<span>${escapeHtml(topic)}</span>`).join('');
  const homepage = repo.homepage ? `<a href="${escapeAttribute(repo.homepage)}" data-project-action="demo" data-repo-name="${escapeAttribute(repo.name)}">${escapeHtml(t('repo.action.demo'))}</a>` : '';
  const tryNow = repo.tryNowUrl
    ? `<a href="${escapeAttribute(repo.tryNowUrl)}" data-project-action="try-now" data-repo-name="${escapeAttribute(repo.name)}">${escapeHtml(t('repo.action.tryNow'))}</a>`
    : `<a href="#try-now" data-open-webgl data-project-action="preview" data-repo-name="${escapeAttribute(repo.name)}">${escapeHtml(t('repo.action.preview'))}</a>`;
  const docs = repo.caseStudyUrl ? `<a href="${escapeAttribute(repo.caseStudyUrl)}" data-project-action="docs" data-repo-name="${escapeAttribute(repo.name)}">${escapeHtml(t('repo.action.docs'))}</a>` : '';
  const description = repo.displayDescriptionKey
    ? t(repo.displayDescriptionKey)
    : repo.displayDescription ?? t('repo.defaultDescription');

  return `
    <article class="project-card" data-tilt data-category="${escapeAttribute(repo.category)}">
      <span class="project-type">${escapeHtml(repo.featured ? t('repo.featuredCategory', { category: repo.category }) : repo.category)}</span>
      <h3>${escapeHtml(repo.displayName)}</h3>
      <p>${escapeHtml(description)}</p>
      <div class="repo-meta">
        <span>${escapeHtml(repo.language ?? t('repo.meta.mixed'))}</span>
        <span>${escapeHtml(t('repo.meta.stars', { count: repo.stars }))}</span>
        <span>${escapeHtml(t('repo.meta.forks', { count: repo.forks }))}</span>
        <span>${escapeHtml(t('repo.meta.pushed', { date: pushed }))}</span>
      </div>
      ${topics ? `<div class="repo-topics">${topics}</div>` : ''}
      <div class="card-actions">
        <a href="${escapeAttribute(repo.htmlUrl)}" data-project-action="view-code" data-repo-name="${escapeAttribute(repo.name)}">${escapeHtml(t('repo.action.viewCode'))}</a>
        ${tryNow}
        ${docs}
        ${homepage}
      </div>
    </article>
  `;
}

function updateRepoStatus(key, vars = {}) {
  lastRepoStatus = { key, vars };
  if (repoStatus) repoStatus.textContent = t(key, vars);
}

projectFilters.forEach((button) => {
  button.addEventListener('click', () => {
    activeProjectFilter = button.getAttribute('data-project-filter') ?? 'all';
    projectFilters.forEach((item) => item.classList.toggle('is-active', item === button));
    renderRepos();
    logVisitorEvent('PROJECT_FILTER_CHANGED', { filter: activeProjectFilter });
  });
});

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

audioToggle?.addEventListener('click', () => {
  if (!audioLoop) return;
  if (audioLoop.paused) {
    playCurrentTrack();
    return;
  }
  pauseAudio();
});

audioPrev?.addEventListener('click', () => changeTrack(-1));
audioNext?.addEventListener('click', () => changeTrack(1));

audioVolume?.addEventListener('input', () => {
  if (!audioLoop || !audioVolume) return;
  audioLoop.volume = Number(audioVolume.value) / 100;
  saveAudioSettings();
});

audioVolume?.addEventListener('change', () => {
  logVisitorEvent('AUDIO_VOLUME_CHANGED', { volume: audioLoop?.volume ?? 0 });
});

audioLoop?.addEventListener('ended', () => changeTrack(1));

motionToggle?.addEventListener('click', () => {
  reducedMotion = !reducedMotion;
  localStorage.setItem(MOTION_SETTINGS_KEY, String(reducedMotion));
  applyMotionPreference();
  logVisitorEvent('MOTION_TOGGLED', { reducedMotion });
});

demoButton?.addEventListener('click', () => {
  startDemoProgress();
  openWebglDemo();
});

demoReset?.addEventListener('click', () => {
  if (!demoProgress) return;
  demoProgress.classList.remove('is-running');
  demoProgress.style.width = '0';
  window.setTimeout(() => {
    demoProgress.style.width = '';
  }, 20);
});

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (!target.closest('[data-open-webgl]')) return;
  event.preventDefault();
  startDemoProgress();
  openWebglDemo();
});

webglClose?.addEventListener('click', closeWebglDemo);

webglModal?.addEventListener('click', (event) => {
  if (event.target === webglModal) closeWebglDemo();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && webglModal?.classList.contains('is-open')) {
    closeWebglDemo();
  }
});

webglFullscreen?.addEventListener('click', async () => {
  const target = webglFrame || webglModal;
  if (!target?.requestFullscreen) return;

  try {
    await target.requestFullscreen();
    trackWebglEvent('WEBGL_FULLSCREEN');
  } catch (error) {
    trackWebglEvent('WEBGL_FULLSCREEN_ERROR', { message: error.message });
  }
});

webglFrame?.addEventListener('load', () => {
  webglLoader?.classList.add('is-hidden');
  trackWebglEvent('WEBGL_LOAD_COMPLETE');
});

webglFrame?.addEventListener('error', () => {
  webglLoader?.classList.add('is-hidden');
  trackWebglEvent('WEBGL_LOAD_FAILED');
});

function startDemoProgress() {
  if (!demoProgress) return;
  demoProgress.classList.remove('is-running');
  void demoProgress.offsetWidth;
  demoProgress.classList.add('is-running');
}

function openWebglDemo() {
  if (!webglModal || !webglFrame) return;

  trackWebglEvent('TRY_NOW_CLICK');
  webglModal.classList.add('is-open');
  webglModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-webgl-open');
  webglLoader?.classList.remove('is-hidden');
  webglWarning?.classList.toggle('is-visible', isLikelyMobile());

  if (webglOpen) webglOpen.href = webglDemo.tryNowUrl;
  if (webglFallback) webglFallback.href = webglDemo.fallbackUrl;

  wasAudioPlayingBeforeWebgl = Boolean(audioLoop && !audioLoop.paused);
  if (audioLoop && wasAudioPlayingBeforeWebgl) {
    pauseAudio();
  }

  rotateWebglLoadingLines();
  if (!webglFrame.src) {
    trackWebglEvent('WEBGL_LOAD_START');
    webglFrame.src = webglDemo.tryNowUrl;
  }
}

function closeWebglDemo() {
  if (!webglModal || !webglFrame) return;

  trackWebglEvent('WEBGL_CLOSE');
  webglModal.classList.remove('is-open');
  webglModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-webgl-open');
  webglFrame.src = '';
  webglLoader?.classList.remove('is-hidden');
  stopWebglLoadingLines();

  if (wasAudioPlayingBeforeWebgl && audioLoop) {
    playCurrentTrack().catch(() => {
      wasAudioPlayingBeforeWebgl = false;
    });
  }
}

function rotateWebglLoadingLines() {
  stopWebglLoadingLines();
  let index = 0;
  const lines = getWebglLoadLines();
  if (webglLine) webglLine.textContent = lines[index] ?? '';

  webglLineTimer = window.setInterval(() => {
    index = Math.min(index + 1, lines.length - 1);
    if (webglLine) webglLine.textContent = lines[index] ?? '';
    if (index === lines.length - 1) stopWebglLoadingLines();
  }, 650);
}

function stopWebglLoadingLines() {
  if (!webglLineTimer) return;
  window.clearInterval(webglLineTimer);
  webglLineTimer = null;
}

function isLikelyMobile() {
  return window.matchMedia('(max-width: 760px)').matches || navigator.maxTouchPoints > 1;
}

function trackWebglEvent(eventName, extra = {}) {
  const payload = {
    eventName,
    gameSlug: webglDemo.slug,
    repoName: webglDemo.repoName,
    device: isLikelyMobile() ? 'mobile' : 'desktop',
    isPlaceholder: webglDemo.isPlaceholder,
    ...extra,
  };

  console.info('[webgl-event]', payload);
  logVisitorEvent(eventName, payload);
}

function getWebglLoadLines() {
  return WEBGL_LOAD_LINE_KEYS.map((key) => t(key)).filter(Boolean);
}

chatToggle?.addEventListener('click', () => {
  const isOpen = chatPanel?.classList.toggle('is-open') ?? false;
  chatToggle.setAttribute('aria-expanded', String(isOpen));
});

quickReplies.forEach((button) => {
  button.addEventListener('click', () => {
    const replyKey = button.getAttribute('data-reply-key') ?? '';
    const prompt = t(`chat.quickMessage.${replyKey}`);
    appendChat('user', prompt);
    appendChat('bot', t(`chat.reply.${replyKey}`) || t('chat.reply.fallback'));
  });
});

chatForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = chatInput?.value.trim() ?? '';
  const contact = contactInput?.value.trim() ?? '';

  if (!message) return;

  appendChat('user', message);
  setChatStatus(t('chat.status.saving'));
  chatForm.querySelector('button')?.setAttribute('disabled', 'true');

  try {
    const response = await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        message,
        contact,
        page: window.location.pathname || '/',
        language: document.documentElement.lang || 'en',
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || `Chat API responded with ${response.status}`);
    }

    appendChat('bot', payload.reply || t('chat.reply.saved'));
    const actions = payload.adminUrl
      ? [{ type: 'open_link', label: t('chat.action.openAdmin'), href: payload.adminUrl }, ...(payload.actions || [])]
      : payload.actions || [];
    appendBotActions(actions);
    setChatStatus(t('chat.status.saved', { messageId: payload.messageId }));
    chatInput.value = '';
    contactInput.value = '';
    logVisitorEvent('CHAT_MESSAGE_SENT', { messageId: payload.messageId });
  } catch (error) {
    appendChat('bot', t('chat.reply.inboxError', { message: error.message }));
    setChatStatus(t('chat.status.unavailable'));
  } finally {
    chatForm.querySelector('button')?.removeAttribute('disabled');
  }
});

function appendChat(kind, text) {
  if (!chatMessages) return;
  const message = document.createElement('p');
  message.className = kind;
  message.textContent = text;
  chatMessages.append(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendBotActions(actions) {
  if (!chatMessages || actions.length === 0) return;
  const actionRow = document.createElement('p');
  actionRow.className = 'bot';
  actions.forEach((action, index) => {
    if (index > 0) actionRow.append(document.createTextNode(' / '));
    const link = document.createElement('a');
    link.href = action.href;
    link.textContent = action.label;
    if (action.type === 'open_link') {
      link.rel = 'noreferrer';
    }
    actionRow.append(link);
  });
  chatMessages.append(actionRow);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setChatStatus(message) {
  if (chatStatus) chatStatus.textContent = message;
}

function getOrCreateSessionId() {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const next = `sess_${crypto.randomUUID()}`;
    localStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  }
}

async function logVisitorEvent(eventType, metadata = {}) {
  try {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        sessionId,
        path: window.location.pathname || '/',
        referrer: document.referrer,
        metadata,
      }),
    });
  } catch {
    // Analytics is best-effort in the local phase.
  }
}

function initAnalytics() {
  logVisitorEvent('PAGE_VIEW', {
    title: document.title,
    language: currentLocale,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const projectLink = target.closest('[data-project-action]');
    if (projectLink) {
      logVisitorEvent('PROJECT_CLICK', {
        action: projectLink.getAttribute('data-project-action'),
        repoName: projectLink.getAttribute('data-repo-name'),
        href: projectLink.getAttribute('href'),
      });
    }

    const cvLink = target.closest('a[href*="/cv/"], a[href*="public/cv/"]');
    if (cvLink) {
      logVisitorEvent('CV_DOWNLOAD', { href: cvLink.getAttribute('href') });
    }

    const contactLink = target.closest('.contact-link');
    if (contactLink) {
      logVisitorEvent('CONTACT_LINK_CLICK', {
        label: contactLink.textContent.trim(),
        href: contactLink.getAttribute('href'),
      });
    }
  });

  window.addEventListener('error', (event) => {
    logVisitorEvent('CLIENT_ERROR', {
      message: event.message,
      source: event.filename,
      line: event.lineno,
    });
  });
}

function initAudioControls() {
  const settings = readAudioSettings();
  currentTrackIndex = clampIndex(settings.trackIndex ?? 0);
  audioEnabled = false;

  if (audioVolume && typeof settings.volume === 'number') {
    audioVolume.value = String(Math.round(settings.volume * 100));
  }

  if (audioLoop && audioVolume) {
    audioLoop.volume = Number(audioVolume.value) / 100;
  }

  setTrack(currentTrackIndex, false);
  updateAudioUi();
}

async function playCurrentTrack() {
  if (!audioLoop) return;
  audioEnabled = true;
  audioLoop.volume = audioVolume ? Number(audioVolume.value) / 100 : 0.34;
  await audioLoop.play();
  updateAudioUi();
  saveAudioSettings();
  logVisitorEvent('AUDIO_TOGGLED', { enabled: true, track: getTrackTitle(currentTrackIndex) });
  logVisitorEvent('AUDIO_PLAY', { track: getTrackTitle(currentTrackIndex) });
}

function pauseAudio() {
  if (!audioLoop) return;
  audioEnabled = false;
  audioLoop.pause();
  updateAudioUi();
  saveAudioSettings();
  logVisitorEvent('AUDIO_TOGGLED', { enabled: false, track: getTrackTitle(currentTrackIndex) });
  logVisitorEvent('AUDIO_PAUSE', { track: getTrackTitle(currentTrackIndex) });
}

function changeTrack(direction) {
  const wasPlaying = Boolean(audioLoop && !audioLoop.paused);
  setTrack(currentTrackIndex + direction, wasPlaying);
  logVisitorEvent('AUDIO_TRACK_CHANGE', { track: getTrackTitle(currentTrackIndex) });
}

function setTrack(index, shouldPlay) {
  if (!audioLoop) return;
  currentTrackIndex = clampIndex(index);
  const track = AUDIO_TRACKS[currentTrackIndex];
  if (!track) return;
  audioLoop.src = track.src;
  audioLoop.loop = true;
  updateAudioUi();
  saveAudioSettings();

  if (shouldPlay) {
    playCurrentTrack();
  }
}

function updateAudioUi() {
  const track = AUDIO_TRACKS[currentTrackIndex];
  if (audioLabel && track) audioLabel.textContent = `${t(track.titleKey)} / ${t(track.sectionKey)}`;
  if (audioToggle) {
    audioToggle.textContent = audioEnabled && audioLoop && !audioLoop.paused ? t('audio.mute') : t('audio.enable');
    audioToggle.setAttribute('aria-pressed', String(audioEnabled && audioLoop && !audioLoop.paused));
  }
}

function readAudioSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem(AUDIO_SETTINGS_KEY) || '{}');
    return typeof settings === 'object' && settings ? settings : {};
  } catch {
    return {};
  }
}

function saveAudioSettings() {
  try {
    localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify({
      trackIndex: currentTrackIndex,
      volume: audioLoop?.volume ?? 0.34,
    }));
  } catch {
    // Local storage is optional.
  }
}

function clampIndex(index) {
  if (AUDIO_TRACKS.length === 0) return 0;
  return (index + AUDIO_TRACKS.length) % AUDIO_TRACKS.length;
}

function getTrackTitle(index) {
  const track = AUDIO_TRACKS[index];
  return track ? t(track.titleKey) : '';
}

function initEffects() {
  applyMotionPreference();
  window.addEventListener('resize', resizeEffectCanvases);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopEffects();
      return;
    }
    applyMotionPreference();
  });

  window.addEventListener('pointermove', (event) => {
    if (reducedMotion || isLikelyMobile()) return;
    ghostPoints.push({
      x: event.clientX,
      y: event.clientY,
      createdAt: performance.now(),
    });
    if (ghostPoints.length > 24) ghostPoints.shift();
  });
}

function applyMotionPreference() {
  document.body.classList.toggle('is-motion-reduced', reducedMotion);
  if (motionToggle) {
    motionToggle.textContent = reducedMotion ? t('motion.enable') : t('motion.reduce');
    motionToggle.setAttribute('aria-pressed', String(reducedMotion));
  }

  if (reducedMotion || document.hidden) {
    stopEffects();
    return;
  }

  startEffects();
}

function startEffects() {
  if (effectsRunning) return;
  effectsRunning = true;
  resizeEffectCanvases();
  ambientAnimationId = requestAnimationFrame(drawAmbient);
  ghostAnimationId = requestAnimationFrame(drawGhostTrail);
}

function stopEffects() {
  effectsRunning = false;
  cancelAnimationFrame(ambientAnimationId);
  cancelAnimationFrame(ghostAnimationId);
  clearCanvas(ambientCanvas);
  clearCanvas(ghostCanvas);
}

function resizeEffectCanvases() {
  [ambientCanvas, ghostCanvas].forEach((canvas) => {
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    const context = canvas.getContext('2d');
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  });

  ambientParticles = Array.from({ length: isLikelyMobile() ? 28 : 72 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: 0.7 + Math.random() * 2.2,
    speed: 0.12 + Math.random() * 0.36,
    drift: -0.15 + Math.random() * 0.3,
    alpha: 0.16 + Math.random() * 0.34,
  }));
}

function drawAmbient() {
  if (!effectsRunning || !ambientCanvas) return;
  const ctx = ambientCanvas.getContext('2d');
  const width = window.innerWidth;
  const height = window.innerHeight;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(8, 9, 13, 0.08)';
  ctx.fillRect(0, 0, width, height);

  ambientParticles.forEach((particle) => {
    particle.y -= particle.speed;
    particle.x += particle.drift;
    if (particle.y < -10) {
      particle.y = height + 10;
      particle.x = Math.random() * width;
    }
    if (particle.x < -10) particle.x = width + 10;
    if (particle.x > width + 10) particle.x = -10;

    const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius * 8);
    gradient.addColorStop(0, `rgba(184, 140, 255, ${particle.alpha})`);
    gradient.addColorStop(1, 'rgba(184, 140, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius * 8, 0, Math.PI * 2);
    ctx.fill();
  });

  ambientAnimationId = requestAnimationFrame(drawAmbient);
}

function drawGhostTrail(now) {
  if (!effectsRunning || !ghostCanvas) return;
  const ctx = ghostCanvas.getContext('2d');
  const width = window.innerWidth;
  const height = window.innerHeight;

  ctx.clearRect(0, 0, width, height);
  ghostPoints = ghostPoints.filter((point) => now - point.createdAt < 900);

  ghostPoints.forEach((point) => {
    const age = now - point.createdAt;
    const opacity = Math.max(0, 1 - age / 900) * 0.35;
    const scale = 1 + age / 600;
    ctx.fillStyle = `rgba(184, 140, 255, ${opacity})`;
    ctx.beginPath();
    ctx.ellipse(point.x, point.y, 8 * scale, 4 * scale, -0.45, 0, Math.PI * 2);
    ctx.fill();
  });

  ghostAnimationId = requestAnimationFrame(drawGhostTrail);
}

function clearCanvas(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
}

function readBooleanSetting(key) {
  try {
    return localStorage.getItem(key) === 'true' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}
