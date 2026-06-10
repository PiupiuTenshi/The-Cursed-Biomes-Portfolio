const loadingGate = document.querySelector('[data-loading-gate]');
const revealItems = document.querySelectorAll('[data-reveal]');
const tiltItems = document.querySelectorAll('[data-tilt]');
const audioToggle = document.querySelector('[data-audio-toggle]');
const audioLoop = document.querySelector('[data-audio-loop]');
const demoButton = document.querySelector('[data-demo-button]');
const demoReset = document.querySelector('[data-demo-reset]');
const demoProgress = document.querySelector('[data-demo-progress]');
const chatToggle = document.querySelector('[data-chat-toggle]');
const chatPanel = document.querySelector('[data-chat-panel]');
const chatMessages = document.querySelector('[data-chat-messages]');
const quickReplies = document.querySelectorAll('[data-reply]');
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
const REPO_CACHE_TTL_MS = 10 * 60 * 1000;
const WEBGL_LOAD_LINES = [
  'Opening the cursed gate...',
  'Awakening forgotten biomes...',
  'Binding WebGL spirits...',
  'Summoning gameplay loop...',
  'Enter the demo.',
];

const webglDemo = {
  slug: 'biome-gate',
  title: 'Biome Gate Demo',
  repoName: 'Unity2DTopDown',
  webglEnabled: true,
  tryNowUrl: 'public/games/biome-gate/index.html',
  fallbackUrl: 'https://github.com/PiupiuTenshi',
  isPlaceholder: true,
};

let activeProjectFilter = 'all';
let visibleRepos = [];
let webglLineTimer = null;
let wasAudioPlayingBeforeWebgl = false;
const sessionId = getOrCreateSessionId();

const repoSettings = [
  {
    owner: 'PiupiuTenshi',
    repoName: 'TechWeb-2026',
    visible: true,
    featured: true,
    priority: 1,
    category: 'web',
    tryNowUrl: null,
    caseStudyUrl: '/projects/techweb-2026',
  },
  {
    owner: 'PiupiuTenshi',
    repoName: 'Privacy-Preserving-Vertical-Fragmentation-PII-Shield',
    visible: true,
    featured: true,
    priority: 2,
    category: 'security',
    tryNowUrl: null,
    caseStudyUrl: '/projects/pii-shield',
    customTitle: 'PII Shield',
  },
  {
    owner: 'PiupiuTenshi',
    repoName: 'Academic-performance-management',
    visible: true,
    featured: true,
    priority: 3,
    category: 'management',
    tryNowUrl: null,
    caseStudyUrl: '/projects/academic-performance-management',
    customTitle: 'Academic Performance',
  },
];

const fallbackRepos = [
  {
    id: 1,
    name: 'TechWeb-2026',
    full_name: 'PiupiuTenshi/TechWeb-2026',
    description: 'Web platform project prepared for live GitHub sync and case-study routing.',
    html_url: 'https://github.com/PiupiuTenshi/TechWeb-2026',
    homepage: null,
    language: 'JavaScript',
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    pushed_at: '2026-06-10T00:00:00Z',
    updated_at: '2026-06-10T00:00:00Z',
    archived: false,
    fork: false,
    topics: ['web', 'portfolio'],
  },
  {
    id: 2,
    name: 'Privacy-Preserving-Vertical-Fragmentation-PII-Shield',
    full_name: 'PiupiuTenshi/Privacy-Preserving-Vertical-Fragmentation-PII-Shield',
    description: 'Privacy-preserving vertical fragmentation project for PII protection.',
    html_url: 'https://github.com/PiupiuTenshi/Privacy-Preserving-Vertical-Fragmentation-PII-Shield',
    homepage: null,
    language: 'Python',
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    pushed_at: '2026-06-10T00:00:00Z',
    updated_at: '2026-06-10T00:00:00Z',
    archived: false,
    fork: false,
    topics: ['privacy', 'security', 'database'],
  },
  {
    id: 3,
    name: 'Academic-performance-management',
    full_name: 'PiupiuTenshi/Academic-performance-management',
    description: 'Academic performance management system for tracking learning outcomes.',
    html_url: 'https://github.com/PiupiuTenshi/Academic-performance-management',
    homepage: null,
    language: 'C#',
    stargazers_count: 0,
    forks_count: 0,
    open_issues_count: 0,
    pushed_at: '2026-06-10T00:00:00Z',
    updated_at: '2026-06-10T00:00:00Z',
    archived: false,
    fork: false,
    topics: ['management', 'academic'],
  },
];

const botReplies = {
  'Show Unity projects': 'Project relics now sync from GitHub with local cache and fallback data.',
  'Open WebGL demo': 'Use the Try Now gate to open the lazy-loaded WebGL modal. Full Unity export can replace the placeholder folder later.',
  'Download CV': 'The CV route is wired, but the final PDF is still marked pending in the Phase 0 status doc.',
  'Contact via Zalo': 'Use the Zalo portal in Contact for the fastest reply path.',
};

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
attachTilt(tiltItems);
loadGitHubRepos();

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

  updateRepoStatus('Checking local relic cache...');
  const cached = readRepoCache();

  if (cached) {
    visibleRepos = prepareRepos(cached, 'cache');
    renderRepos();
    updateRepoStatus(`Loaded ${visibleRepos.length} repos from cache. Refreshing GitHub...`);
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
    updateRepoStatus(`Live from GitHub. ${visibleRepos.length} visible repos.`);
  } catch (error) {
    if (!cached) {
      visibleRepos = prepareRepos(fallbackRepos, 'fallback');
      renderRepos();
    }

    updateRepoStatus(`Using fallback data. ${error.message}`);
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
    displayDescription:
      setting?.customDescription ?? repo.description ?? 'No README description yet. Open GitHub to inspect the relic.',
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
    projectGrid.innerHTML = '<article class="project-card project-card-loading"><span class="project-type">Empty</span><h3>No relics found</h3><p>Try another filter or wait for GitHub to wake up.</p></article>';
    return;
  }

  projectGrid.innerHTML = repos.map(renderRepoCard).join('');
  attachTilt(projectGrid.querySelectorAll('[data-tilt]'));
}

function renderRepoCard(repo) {
  const pushed = repo.pushedAt
    ? new Date(repo.pushedAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    : 'Unknown';
  const topics = repo.topics.slice(0, 4).map((topic) => `<span>${escapeHtml(topic)}</span>`).join('');
  const homepage = repo.homepage ? `<a href="${escapeAttribute(repo.homepage)}">Demo</a>` : '';
  const tryNow = repo.tryNowUrl
    ? `<a href="${escapeAttribute(repo.tryNowUrl)}">Try Now</a>`
    : '<a href="#try-now" data-open-webgl>Preview</a>';
  const docs = repo.caseStudyUrl ? `<a href="${escapeAttribute(repo.caseStudyUrl)}">Docs</a>` : '';

  return `
    <article class="project-card" data-tilt data-category="${escapeAttribute(repo.category)}">
      <span class="project-type">${escapeHtml(repo.featured ? `Featured / ${repo.category}` : repo.category)}</span>
      <h3>${escapeHtml(repo.displayName)}</h3>
      <p>${escapeHtml(repo.displayDescription)}</p>
      <div class="repo-meta">
        <span>${escapeHtml(repo.language ?? 'Mixed')}</span>
        <span>${repo.stars} stars</span>
        <span>${repo.forks} forks</span>
        <span>Pushed ${escapeHtml(pushed)}</span>
      </div>
      ${topics ? `<div class="repo-topics">${topics}</div>` : ''}
      <div class="card-actions">
        <a href="${escapeAttribute(repo.htmlUrl)}">View Code</a>
        ${tryNow}
        ${docs}
        ${homepage}
      </div>
    </article>
  `;
}

function updateRepoStatus(message) {
  if (repoStatus) repoStatus.textContent = message;
}

projectFilters.forEach((button) => {
  button.addEventListener('click', () => {
    activeProjectFilter = button.getAttribute('data-project-filter') ?? 'all';
    projectFilters.forEach((item) => item.classList.toggle('is-active', item === button));
    renderRepos();
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

audioToggle?.addEventListener('click', async () => {
  if (!audioLoop) return;

  if (audioLoop.paused) {
    audioLoop.volume = 0.34;
    await audioLoop.play();
    audioToggle.textContent = 'Mute Sound';
    audioToggle.setAttribute('aria-pressed', 'true');
    return;
  }

  audioLoop.pause();
  audioToggle.textContent = 'Enable Sound';
  audioToggle.setAttribute('aria-pressed', 'false');
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
  trackWebglEvent('WEBGL_LOAD_READY');
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
    audioLoop.pause();
    audioToggle.textContent = 'Enable Sound';
    audioToggle.setAttribute('aria-pressed', 'false');
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
    audioLoop.play().then(() => {
      audioToggle.textContent = 'Mute Sound';
      audioToggle.setAttribute('aria-pressed', 'true');
    }).catch(() => {
      wasAudioPlayingBeforeWebgl = false;
    });
  }
}

function rotateWebglLoadingLines() {
  stopWebglLoadingLines();
  let index = 0;
  if (webglLine) webglLine.textContent = WEBGL_LOAD_LINES[index];

  webglLineTimer = window.setInterval(() => {
    index = Math.min(index + 1, WEBGL_LOAD_LINES.length - 1);
    if (webglLine) webglLine.textContent = WEBGL_LOAD_LINES[index];
    if (index === WEBGL_LOAD_LINES.length - 1) stopWebglLoadingLines();
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
  console.info('[webgl-event]', {
    eventName,
    gameSlug: webglDemo.slug,
    repoName: webglDemo.repoName,
    device: isLikelyMobile() ? 'mobile' : 'desktop',
    isPlaceholder: webglDemo.isPlaceholder,
    ...extra,
  });
}

chatToggle?.addEventListener('click', () => {
  const isOpen = chatPanel?.classList.toggle('is-open') ?? false;
  chatToggle.setAttribute('aria-expanded', String(isOpen));
});

quickReplies.forEach((button) => {
  button.addEventListener('click', () => {
    const prompt = button.getAttribute('data-reply') ?? '';
    appendChat('user', prompt);
    appendChat('bot', botReplies[prompt] ?? 'That route is reserved for a later phase.');
  });
});

chatForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = chatInput?.value.trim() ?? '';
  const contact = contactInput?.value.trim() ?? '';

  if (!message) return;

  appendChat('user', message);
  setChatStatus('Saving message...');
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

    appendChat('bot', payload.reply || 'Saved. Sang can review this from the admin inbox.');
    appendBotActions(payload.actions || []);
    setChatStatus(`Saved to inbox as ${payload.messageId}`);
    chatInput.value = '';
    contactInput.value = '';
    logVisitorEvent('CHAT_MESSAGE_SENT', { messageId: payload.messageId });
  } catch (error) {
    appendChat('bot', `I could not reach the local inbox yet: ${error.message}`);
    setChatStatus('Run the local server to enable saving.');
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
  actionRow.textContent = actions.map((action) => action.label).join(' / ');
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
