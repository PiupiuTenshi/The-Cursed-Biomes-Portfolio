const loadingGate = document.querySelector('[data-loading-gate]');
const revealItems = document.querySelectorAll('[data-reveal]');
const tiltItems = document.querySelectorAll('[data-tilt]');
const audioToggle = document.querySelector('[data-audio-toggle]');
const audioVolume = document.querySelector('[data-audio-volume]');
const audioLabel = document.querySelector('[data-audio-label]');
const audioLoop = document.querySelector('[data-audio-loop]');
const localeButtons = document.querySelectorAll('[data-locale-button]');
const settingsToggle = document.querySelector('[data-settings-toggle]');
const settingsPanel = document.querySelector('[data-settings-panel]');
const settingsClose = document.querySelector('[data-settings-close]');
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
const booksGrid = document.querySelector('[data-books-grid]');
const booksStatus = document.querySelector('[data-books-status]');
const booksToggle = document.querySelector('[data-books-toggle]');
const randomQuoteText = document.querySelector('[data-random-quote]');
const randomQuoteAuthor = document.querySelector('[data-random-quote-author]');
const bookReaderModal = document.querySelector('[data-book-reader-modal]');
const bookReaderFrame = document.querySelector('[data-book-reader-frame]');
const bookReaderTitle = document.querySelector('[data-book-reader-title]');
const bookReaderMeta = document.querySelector('[data-book-reader-meta]');
const bookReaderClose = document.querySelector('[data-book-reader-close]');
const bookReaderOpen = document.querySelector('[data-book-reader-open]');
const projectPreviewModal = document.querySelector('[data-project-preview-modal]');
const projectPreviewTitle = document.querySelector('[data-project-preview-title]');
const projectPreviewMeta = document.querySelector('[data-project-preview-meta]');
const projectPreviewSummary = document.querySelector('[data-project-preview-summary]');
const projectPreviewReadme = document.querySelector('[data-project-preview-readme]');
const projectPreviewClose = document.querySelector('[data-project-preview-close]');
const projectPreviewCode = document.querySelector('[data-project-preview-code]');
const projectPreviewDemo = document.querySelector('[data-project-preview-demo]');
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
const booksRepo = appContent.booksRepo || {};
const fallbackBooks = appContent.fallbackBooks || [];
const libraryQuotes = appContent.libraryQuotes || {};
const BOOKS_CACHE_KEY = 'cursed-biomes.game-program-books.v2';
const PROJECT_README_CACHE_KEY = 'cursed-biomes.project-readmes.v1';
const BOOKS_CACHE_TTL_MS = 60 * 60 * 1000;
const BOOKS_COLLAPSED_COUNT = 5;
const BOOKS_FETCH_TIMEOUT_MS = 7000;
const README_FETCH_TIMEOUT_MS = 8000;
const MESSENGER_URL = 'https://m.me/MahiruShiina.tym.1207';
const LOCAL_BOOK_COVERS = [
  { match: 'game programming patterns', src: 'public/images/books/game-programming-patterns-page1.png' },
  { match: 'clean code', src: 'public/images/books/clean-code-page1.png' },
  { match: 'unity in action', src: 'public/images/books/unity-in-action-page1.png' },
  { match: 'game engine architecture', src: 'public/images/books/game-engine-architecture-page1.png' },
];
const LOCAL_BOOK_FILES = [
  { match: 'game programming patterns', src: 'public/books/game-programming-patterns.pdf' },
  { match: 'clean code', src: 'public/books/clean-code.pdf' },
  { match: 'unity in action', src: 'public/books/unity-in-action.pdf' },
  { match: 'game engine architecture', src: 'public/books/game-engine-architecture.pdf' },
];
const fallbackBookItems = fallbackBooks.map(normalizeFallbackBook);

let currentLocale = getInitialLocale();
let activeQuoteIndex = pickRandomQuoteIndex();
let lastRepoStatus = { key: 'repo.status.prepare', vars: {} };
let lastBooksStatus = { key: 'books.status.loading', vars: {} };
let activeProjectFilter = 'all';
let visibleRepos = [];
let currentBooks = [];
let allBooksExpanded = false;
let webglLineTimer = null;
let wasAudioPlayingBeforeWebgl = false;
let currentTrackIndex = 0;
let audioEnabled = false;
let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let effectsRunning = false;
let ambientAnimationId = 0;
let ghostAnimationId = 0;
let ambientParticles = [];
let ghostPoints = [];
let lastPointer = null;
const sessionId = getOrCreateSessionId();

window.addEventListener('load', () => {
  window.setTimeout(() => {
    loadingGate?.classList.add('is-hidden');
  }, 1100);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.18) {
        entry.target.classList.add('is-visible');
        return;
      }

      if (!entry.isIntersecting || entry.intersectionRatio <= 0.03) {
        entry.target.classList.remove('is-visible');
      }
    });
  },
  { threshold: [0, 0.03, 0.18], rootMargin: '-6% 0px -6% 0px' },
);

revealItems.forEach((item) => revealObserver.observe(item));
initI18n();
attachTilt(tiltItems);
initAudioControls();
initSettingsMenu();
initButtonFeedback();
initHeroActions();
initEffects();
initAnalytics();
loadGitHubRepos();
loadGameProgramBooks();

booksToggle?.addEventListener('click', () => {
  allBooksExpanded = !allBooksExpanded;
  renderBooks(currentBooks);
  logVisitorEvent('BOOKS_TOGGLE_ALL', { expanded: allBooksExpanded, count: currentBooks.length });
});

bookReaderClose?.addEventListener('click', closeBookReader);

bookReaderModal?.addEventListener('click', (event) => {
  if (event.target === bookReaderModal) closeBookReader();
});

projectPreviewClose?.addEventListener('click', closeProjectPreview);

projectPreviewModal?.addEventListener('click', (event) => {
  if (event.target === projectPreviewModal) closeProjectPreview();
});

function initI18n() {
  applyTranslations();

  localeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const locale = button.getAttribute('data-locale-button') || defaultLocale;
      setLocale(locale);
    });
  });
}

function initSettingsMenu() {
  settingsToggle?.addEventListener('click', () => {
    const isOpen = settingsPanel?.classList.toggle('is-open') ?? false;
    settingsToggle.setAttribute('aria-expanded', String(isOpen));
  });

  settingsClose?.addEventListener('click', closeSettingsMenu);

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('[data-settings-panel]') || target.closest('[data-settings-toggle]')) return;
    closeSettingsMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeSettingsMenu();
  });
}

function closeSettingsMenu() {
  settingsPanel?.classList.remove('is-open');
  settingsToggle?.setAttribute('aria-expanded', 'false');
}

function initButtonFeedback() {
  document.addEventListener('pointerdown', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const action = target.closest('button, .button, .contact-link, .card-actions a, .card-actions button, .book-actions a, .book-rail-head a, .webgl-actions a');
    if (!(action instanceof HTMLElement)) return;

    action.classList.add('is-pressed');
    window.setTimeout(() => action.classList.remove('is-pressed'), 180);
  });
}

function initHeroActions() {
  document.querySelectorAll('[data-hero-action]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const action = link.getAttribute('data-hero-action');
      logVisitorEvent('HERO_ACTION', { action });

      if (action === 'demo') {
        event.preventDefault();
        startDemoProgress();
        openWebglDemo();
        return;
      }

      if (action === 'projects') {
        event.preventDefault();
        const projects = document.querySelector('#projects');
        projects?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        projects?.classList.add('is-highlighted');
        window.setTimeout(() => projects?.classList.remove('is-highlighted'), 900);
      }
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
  if (currentBooks.length > 0) renderBooks(currentBooks);
  updateBooksStatus(lastBooksStatus.key, lastBooksStatus.vars);
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
  applyRandomQuote();

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

function applyRandomQuote() {
  if (!randomQuoteText || !randomQuoteAuthor) return;

  const quotes = getQuoteList(currentLocale);
  if (quotes.length === 0) return;

  const quote = quotes[activeQuoteIndex % quotes.length];
  randomQuoteText.textContent = quote.text || t('library.quote');
  randomQuoteAuthor.textContent = quote.author || t('library.quoteAuthor');
}

function pickRandomQuoteIndex() {
  const quotes = getQuoteList(currentLocale);
  if (quotes.length <= 1) return 0;

  if (window.crypto?.getRandomValues) {
    const value = new Uint32Array(1);
    window.crypto.getRandomValues(value);
    return value[0] % quotes.length;
  }

  return Math.floor(Math.random() * quotes.length);
}

function getQuoteList(locale) {
  const localizedQuotes = libraryQuotes[locale];
  const fallbackQuotes = libraryQuotes[defaultLocale];
  return Array.isArray(localizedQuotes) && localizedQuotes.length > 0
    ? localizedQuotes
    : Array.isArray(fallbackQuotes) ? fallbackQuotes : [];
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
    : `<button type="button" data-project-preview="${escapeAttribute(repo.fullName)}" data-project-action="preview" data-repo-name="${escapeAttribute(repo.name)}">${escapeHtml(t('repo.action.preview'))}</button>`;
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

async function loadGameProgramBooks() {
  if (!booksGrid) return;

  updateBooksStatus('books.status.loading');

  if (fallbackBookItems.length > 0) {
    renderBooks(fallbackBookItems);
  }

  const cached = readTimedCache(BOOKS_CACHE_KEY, BOOKS_CACHE_TTL_MS);
  if (Array.isArray(cached) && cached.length > 0) {
    renderBooks(cached);
    updateBooksStatus('books.status.live', { count: cached.length });
    return;
  }

  try {
    const books = await fetchBooksFromGitHubTree();
    const normalizedBooks = books
      .filter((book) => /\.(pdf|epub|mobi|md)$/i.test(book.path))
      .map(normalizeBook);

    if (normalizedBooks.length === 0) {
      throw new Error('No readable book files found.');
    }

    writeTimedCache(BOOKS_CACHE_KEY, normalizedBooks);
    renderBooks(normalizedBooks);
    updateBooksStatus('books.status.live', { count: normalizedBooks.length });
  } catch (error) {
    renderBooks(fallbackBookItems);
    updateBooksStatus('books.status.fallback', { message: error.message });
  }
}

async function fetchBooksFromGitHubTree(branch = booksRepo.branch || 'master') {
  const owner = booksRepo.owner || GITHUB_USERNAME;
  const repo = booksRepo.repo || 'GameProgramBooks';
  const response = await fetchWithTimeout(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    {
      headers: { Accept: 'application/vnd.github+json' },
    },
    BOOKS_FETCH_TIMEOUT_MS,
  );

  if (!response.ok && response.status === 404 && branch === 'main') {
    return fetchBooksFromGitHubTree('master');
  }

  if (!response.ok) {
    throw new Error(`GitHub books API responded with ${response.status}`);
  }

  const payload = await response.json();
  if (payload.truncated) {
    throw new Error('GitHub tree response was truncated.');
  }

  return (payload.tree || []).filter((entry) => entry.type === 'blob');
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 7000) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out.');
    }

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

function normalizeBook(book) {
  const fileName = book.path.split('/').pop() || book.path;
  const type = (fileName.split('.').pop() || 'book').toUpperCase();
  const name = cleanBookTitle(fileName);
  const localUrl = getLocalBookFile(name);
  return {
    id: `book_${hashString(book.path)}`,
    name,
    path: book.path,
    downloadUrl: makeRawBookUrl(book.path),
    htmlUrl: makeGitHubBookUrl(book.path),
    localUrl,
    type,
    category: getBookCategory(book.path),
    coverQuery: name,
    coverUrl: getLocalBookCover(name),
    description: `${getBookCategory(book.path)} / ${formatBytes(book.size)}`,
  };
}

function normalizeFallbackBook(book) {
  const path = book.path || book.name;
  const type = book.type || (path.split('.').pop() || 'book').toUpperCase();
  const name = book.name || cleanBookTitle(path);

  return {
    id: book.id || `book_${hashString(path)}`,
    name,
    path,
    downloadUrl: book.downloadUrl || makeRawBookUrl(path),
    htmlUrl: book.htmlUrl || makeGitHubBookUrl(path),
    localUrl: book.localUrl || getLocalBookFile(name),
    type,
    category: book.category || getBookCategory(path),
    coverQuery: book.coverQuery || name,
    coverUrl: book.coverUrl || getLocalBookCover(name),
    description: book.description || `${getBookCategory(path)} / ${type}`,
  };
}

function getLocalBookCover(title) {
  const normalized = String(title || '').toLowerCase();
  return LOCAL_BOOK_COVERS.find((cover) => normalized.includes(cover.match))?.src || null;
}

function getLocalBookFile(title) {
  const normalized = String(title || '').toLowerCase();
  return LOCAL_BOOK_FILES.find((book) => normalized.includes(book.match))?.src || null;
}

function makeRawBookUrl(bookPath) {
  const owner = booksRepo.owner || GITHUB_USERNAME;
  const repo = booksRepo.repo || 'GameProgramBooks';
  const branch = booksRepo.branch || 'master';
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${bookPath.split('/').map(encodeURIComponent).join('/')}`;
}

function makeGitHubBookUrl(bookPath) {
  const owner = booksRepo.owner || GITHUB_USERNAME;
  const repo = booksRepo.repo || 'GameProgramBooks';
  const branch = booksRepo.branch || 'master';
  return `https://github.com/${owner}/${repo}/blob/${branch}/${bookPath.split('/').map(encodeURIComponent).join('/')}`;
}

function getBookCategory(bookPath) {
  return bookPath.split('/')[0]?.replace(/^\d+\.?\s*/, '') || t('books.source');
}

function formatBytes(size) {
  if (!Number.isFinite(size)) return t('books.source');
  if (size >= 1024 * 1024) return `${Math.round(size / 1024 / 1024)} MB`;
  if (size >= 1024) return `${Math.round(size / 1024)} KB`;
  return `${size} B`;
}

function cleanBookTitle(fileName) {
  return fileName
    .replace(/\.(pdf|epub|mobi|md)$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function renderBooks(books) {
  if (!booksGrid) return;
  currentBooks = books;
  const visibleBooks = allBooksExpanded ? books : books.slice(0, BOOKS_COLLAPSED_COUNT);

  booksGrid.innerHTML = visibleBooks.map((book) => {
    const coverUrl = getLocalBookCover(book.name) || '';
    const hue = Math.abs(hashString(book.name)) % 360;
    const canReadInline = book.type === 'PDF';
    const downloadUrl = book.localUrl || book.downloadUrl;
    return `
    <article class="book-card book-card-dynamic" data-book-id="${escapeAttribute(book.id)}">
      <div class="book-cover" style="--book-hue: ${hue}; ${coverUrl ? `--book-cover: url('${escapeAttribute(coverUrl)}');` : ''}">
        <span>${escapeHtml(book.type || 'BOOK')}</span>
        <strong>${escapeHtml(book.name)}</strong>
      </div>
      <span>${escapeHtml(book.type || 'BOOK')}</span>
      <h3>${escapeHtml(book.name)}</h3>
      <p>${escapeHtml(book.description || book.path || t('books.source'))}</p>
      <div class="book-actions">
        ${canReadInline ? `<button type="button" data-book-read="${escapeAttribute(book.id)}">${escapeHtml(t('books.read'))}</button>` : ''}
        <a href="${escapeAttribute(downloadUrl)}" target="_blank" rel="noreferrer" data-book-action data-book-name="${escapeAttribute(book.name)}" download>${escapeHtml(t(canReadInline ? 'books.download' : 'books.open'))}</a>
      </div>
    </article>
  `;
  }).join('');

  if (booksToggle) {
    booksToggle.hidden = books.length <= BOOKS_COLLAPSED_COUNT;
    booksToggle.textContent = t(allBooksExpanded ? 'books.showLess' : 'books.showAll');
  }

}

function updateBooksStatus(key, vars = {}) {
  lastBooksStatus = { key, vars };
  if (booksStatus) booksStatus.textContent = t(key, vars);
}

function openBookReader(book) {
  if (!bookReaderModal || !bookReaderFrame || !bookReaderTitle) return;

  if (book.type !== 'PDF') {
    window.open(book.downloadUrl, '_blank', 'noreferrer');
    return;
  }

  bookReaderTitle.textContent = book.name;
  if (bookReaderMeta) bookReaderMeta.textContent = `${book.category} / ${book.type}`;
  if (bookReaderOpen) bookReaderOpen.href = book.localUrl || book.downloadUrl;
  bookReaderFrame.src = makeBookViewerUrl(book);
  bookReaderModal.classList.add('is-open');
  bookReaderModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-webgl-open');
  logVisitorEvent('BOOK_READER_OPEN', { bookName: book.name, path: book.path });
}

function makeBookViewerUrl(book) {
  const source = book.localUrl || `/api/books/inline?url=${encodeURIComponent(book.downloadUrl)}`;
  return `public/books/reader.html?file=${encodeURIComponent(source)}&title=${encodeURIComponent(book.name)}`;
}

function closeBookReader() {
  if (!bookReaderModal || !bookReaderFrame) return;
  bookReaderModal.classList.remove('is-open');
  bookReaderModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-webgl-open');
  bookReaderFrame.src = '';
}

async function openProjectPreview(repo) {
  if (!projectPreviewModal || !projectPreviewTitle || !projectPreviewReadme) return;

  projectPreviewTitle.textContent = repo.displayName || repo.name;
  if (projectPreviewMeta) {
    projectPreviewMeta.textContent = [
      repo.language || t('repo.meta.mixed'),
      t('repo.meta.stars', { count: repo.stars }),
      t('repo.meta.forks', { count: repo.forks }),
      repo.pushedAt ? t('repo.meta.pushed', { date: new Date(repo.pushedAt).toLocaleDateString(currentLocale) }) : t('repo.meta.unknown'),
    ].join(' / ');
  }
  if (projectPreviewCode) projectPreviewCode.href = repo.htmlUrl;
  if (projectPreviewDemo) {
    const demoUrl = repo.tryNowUrl || repo.homepage || repo.caseStudyUrl || repo.htmlUrl;
    projectPreviewDemo.href = demoUrl;
    projectPreviewDemo.hidden = !demoUrl;
  }
  if (projectPreviewSummary) projectPreviewSummary.innerHTML = renderProjectSummary(repo);
  projectPreviewReadme.innerHTML = `<p>${escapeHtml(t('projectPreview.loading'))}</p>`;
  projectPreviewModal.classList.add('is-open');
  projectPreviewModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-webgl-open');
  logVisitorEvent('PROJECT_PREVIEW_OPEN', { repoName: repo.name, fullName: repo.fullName });

  try {
    const readme = await fetchRepoReadme(repo);
    projectPreviewReadme.innerHTML = renderMarkdownPreview(readme);
  } catch (error) {
    projectPreviewReadme.innerHTML = `
      <h3>${escapeHtml(t('projectPreview.readmeMissing'))}</h3>
      <p>${escapeHtml(error.message)}</p>
    `;
  }
}

function closeProjectPreview() {
  if (!projectPreviewModal) return;
  projectPreviewModal.classList.remove('is-open');
  projectPreviewModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-webgl-open');
}

function renderProjectSummary(repo) {
  const description = repo.displayDescriptionKey
    ? t(repo.displayDescriptionKey)
    : repo.displayDescription ?? t('repo.defaultDescription');
  const topics = repo.topics.length > 0
    ? repo.topics.map((topic) => `<span>${escapeHtml(topic)}</span>`).join('')
    : `<span>${escapeHtml(repo.category)}</span>`;

  return `
    <h3>${escapeHtml(t('projectPreview.summary'))}</h3>
    <p>${escapeHtml(description)}</p>
    <dl>
      <div><dt>${escapeHtml(t('projectPreview.language'))}</dt><dd>${escapeHtml(repo.language || t('repo.meta.mixed'))}</dd></div>
      <div><dt>${escapeHtml(t('projectPreview.category'))}</dt><dd>${escapeHtml(repo.category)}</dd></div>
      <div><dt>${escapeHtml(t('projectPreview.issues'))}</dt><dd>${escapeHtml(repo.openIssues ?? 0)}</dd></div>
      <div><dt>${escapeHtml(t('projectPreview.updated'))}</dt><dd>${escapeHtml(repo.updatedAt ? new Date(repo.updatedAt).toLocaleDateString(currentLocale) : t('repo.meta.unknown'))}</dd></div>
    </dl>
    <div class="project-preview-topics">${topics}</div>
  `;
}

async function fetchRepoReadme(repo) {
  const cache = readProjectReadmeCache();
  const cached = cache[repo.fullName];
  if (cached && Date.now() - cached.savedAt < REPO_CACHE_TTL_MS) {
    return cached.readme;
  }

  const response = await fetchWithTimeout(
    `https://api.github.com/repos/${repo.fullName}/readme`,
    { headers: { Accept: 'application/vnd.github.raw' } },
    README_FETCH_TIMEOUT_MS,
  );

  if (!response.ok) {
    throw new Error(`GitHub README responded with ${response.status}`);
  }

  const readme = (await response.text()).slice(0, 12000);
  cache[repo.fullName] = { savedAt: Date.now(), readme };
  writeProjectReadmeCache(cache);
  return readme;
}

function renderMarkdownPreview(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n').slice(0, 180);
  const blocks = [];
  let paragraph = [];
  let list = [];
  let code = [];
  let inCode = false;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push(`<p>${escapeHtml(paragraph.join(' '))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list.length === 0) return;
    blocks.push(`<ul>${list.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`);
    list = [];
  };
  const flushCode = () => {
    if (code.length === 0) return;
    blocks.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
    code = [];
  };

  lines.forEach((line) => {
    if (line.trim().startsWith('```')) {
      if (inCode) flushCode();
      inCode = !inCode;
      return;
    }

    if (inCode) {
      code.push(line);
      return;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length + 2;
      blocks.push(`<h${level}>${escapeHtml(heading[2])}</h${level}>`);
      return;
    }

    const listItem = trimmed.match(/^[-*]\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      list.push(listItem[1]);
      return;
    }

    flushList();
    paragraph.push(trimmed.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[`*_>#]/g, ''));
  });

  flushParagraph();
  flushList();
  flushCode();

  return blocks.length > 0 ? blocks.join('') : `<p>${escapeHtml(t('projectPreview.readmeMissing'))}</p>`;
}

function readProjectReadmeCache() {
  try {
    return JSON.parse(localStorage.getItem(PROJECT_README_CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeProjectReadmeCache(cache) {
  try {
    localStorage.setItem(PROJECT_README_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Cache is optional.
  }
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}

function readTimedCache(key, ttl) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    if (Date.now() - cache.savedAt > ttl) return null;
    return cache.items;
  } catch {
    return null;
  }
}

function writeTimedCache(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), items }));
  } catch {
    // Cache is optional.
  }
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

audioToggle?.addEventListener('click', async () => {
  if (!audioLoop) return;

  if (audioEnabled) {
    pauseAudio();
    return;
  }

  try {
    await playCurrentTrack();
  } catch {
    audioEnabled = false;
    updateAudioUi();
    saveAudioSettings();
  }
});

audioVolume?.addEventListener('input', () => {
  if (!audioLoop || !audioVolume) return;
  audioLoop.volume = Number(audioVolume.value) / 100;
  saveAudioSettings();
});

audioVolume?.addEventListener('change', () => {
  logVisitorEvent('AUDIO_VOLUME_CHANGED', { volume: audioLoop?.volume ?? 0 });
});

audioLoop?.addEventListener('ended', () => changeTrack(1));

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
  if (event.key === 'Escape' && bookReaderModal?.classList.contains('is-open')) {
    closeBookReader();
  }
  if (event.key === 'Escape' && projectPreviewModal?.classList.contains('is-open')) {
    closeProjectPreview();
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
    runQuickReplyAction(replyKey);
  });
});

function runQuickReplyAction(replyKey) {
  const actionMap = {
    projects: () => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    demo: () => {
      startDemoProgress();
      openWebglDemo();
    },
    cv: () => window.open('public/cv/Pham-Minh-Sang-Unity-Developer-CV.pdf', '_blank', 'noopener,noreferrer'),
    zalo: () => window.open('https://zalo.me/0898087507', '_blank', 'noopener,noreferrer'),
    messenger: () => window.open(MESSENGER_URL, '_blank', 'noopener,noreferrer'),
  };

  actionMap[replyKey]?.();
  logVisitorEvent('CHAT_QUICK_ACTION', { action: replyKey });
}

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

    const projectPreview = target.closest('[data-project-preview]');
    if (projectPreview) {
      event.preventDefault();
      const fullName = projectPreview.getAttribute('data-project-preview');
      const repo = visibleRepos.find((item) => item.fullName === fullName);
      if (repo) openProjectPreview(repo);
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

    const bookLink = target.closest('[data-book-action]');
    if (bookLink) {
      logVisitorEvent('BOOK_CLICK', {
        bookName: bookLink.getAttribute('data-book-name'),
        href: bookLink.getAttribute('href'),
      });
    }

    const bookRead = target.closest('[data-book-read]');
    if (bookRead) {
      const book = currentBooks.find((item) => item.id === bookRead.getAttribute('data-book-read'));
      if (book) openBookReader(book);
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
  audioEnabled = settings.enabled !== false;

  if (audioVolume && typeof settings.volume === 'number') {
    audioVolume.value = String(Math.round(settings.volume * 100));
  }

  if (audioLoop && audioVolume) {
    audioLoop.volume = Number(audioVolume.value) / 100;
  }

  setTrack(currentTrackIndex, false);
  updateAudioUi();

  if (audioEnabled) {
    window.setTimeout(autoStartAudio, 900);
  }
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

async function autoStartAudio() {
  if (!audioLoop || !audioEnabled || !audioLoop.paused) return;

  try {
    await playCurrentTrack();
    logVisitorEvent('AUDIO_AUTOSTART', { mode: 'load' });
  } catch {
    updateAudioUi();
    const resume = async () => {
      document.removeEventListener('pointerdown', resume);
      document.removeEventListener('keydown', resume);
      if (!audioEnabled) return;
      try {
        await playCurrentTrack();
        logVisitorEvent('AUDIO_AUTOSTART', { mode: 'first-interaction' });
      } catch {
        updateAudioUi();
      }
    };
    document.addEventListener('pointerdown', resume, { once: true });
    document.addEventListener('keydown', resume, { once: true });
  }
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
    audioToggle.textContent = audioEnabled ? t('audio.mute') : t('audio.enable');
    audioToggle.setAttribute('aria-pressed', String(audioEnabled));
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
      enabled: audioEnabled,
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
    const angle = lastPointer
      ? Math.atan2(event.clientY - lastPointer.y, event.clientX - lastPointer.x)
      : -0.72;
    ghostPoints.push({
      x: event.clientX,
      y: event.clientY,
      angle,
      createdAt: performance.now(),
    });
    lastPointer = { x: event.clientX, y: event.clientY };
    if (ghostPoints.length > 34) ghostPoints.shift();
  });
}

function applyMotionPreference() {
  document.body.classList.toggle('is-motion-reduced', reducedMotion);

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
  lastPointer = null;
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

  ghostPoints.forEach((point, index) => {
    const age = now - point.createdAt;
    const life = Math.max(0, 1 - age / 900);
    const opacity = life * 0.46;
    const scale = 0.72 + (1 - life) * 0.5;
    const rewindOffset = (1 - life) * 18;
    const x = point.x - Math.cos(point.angle) * rewindOffset;
    const y = point.y - Math.sin(point.angle) * rewindOffset;

    drawCursorAfterimage(ctx, {
      x,
      y,
      angle: point.angle,
      scale,
      opacity,
      hueShift: index % 3,
    });
  });

  ghostAnimationId = requestAnimationFrame(drawGhostTrail);
}

function drawCursorAfterimage(ctx, point) {
  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.rotate(point.angle + 0.72);
  ctx.scale(point.scale, point.scale);
  ctx.globalAlpha = point.opacity;
  ctx.shadowBlur = 18;
  ctx.shadowColor = point.hueShift === 0
    ? 'rgba(70, 226, 255, 0.58)'
    : 'rgba(184, 140, 255, 0.58)';

  const cursorPath = new Path2D();
  cursorPath.moveTo(0, 0);
  cursorPath.lineTo(0, 30);
  cursorPath.lineTo(8, 22);
  cursorPath.lineTo(13, 35);
  cursorPath.lineTo(20, 32);
  cursorPath.lineTo(15, 20);
  cursorPath.lineTo(27, 20);
  cursorPath.closePath();

  ctx.lineJoin = 'miter';
  ctx.fillStyle = point.hueShift === 1
    ? 'rgba(184, 140, 255, 0.38)'
    : 'rgba(70, 226, 255, 0.34)';
  ctx.strokeStyle = 'rgba(241, 239, 231, 0.42)';
  ctx.lineWidth = 1.3;
  ctx.fill(cursorPath);
  ctx.stroke(cursorPath);

  ctx.globalAlpha = point.opacity * 0.38;
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(217, 164, 65, 0.5)';
  ctx.beginPath();
  ctx.moveTo(-5, 9);
  ctx.lineTo(-18, 4);
  ctx.moveTo(-4, 17);
  ctx.lineTo(-23, 19);
  ctx.stroke();

  ctx.restore();
}

function clearCanvas(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
}
