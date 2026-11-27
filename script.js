document.addEventListener('DOMContentLoaded', () => {
  // ========================================================================
  // 1. Theme Management (Design Tokens, LocalStorage, Query Param, Switcher)
  // ========================================================================
  const VALID_THEMES = ['warm-modern', 'broadsheet', 'dark-editorial'];
  const DEFAULT_THEME = 'warm-modern';

  const themeSwitcherContainer = document.getElementById('themeSwitcherContainer');
  const themeBtns = document.querySelectorAll('.theme-btn');
  const hideSwitcherBtn = document.getElementById('hideSwitcherBtn');
  const showSwitcherBtn = document.getElementById('showSwitcherBtn');

  // Check URL query param e.g. ?theme=broadsheet
  function getQueryTheme() {
    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get('theme');
    if (themeParam && VALID_THEMES.includes(themeParam.toLowerCase())) {
      return themeParam.toLowerCase();
    }
    // Also support aliases: 'warm' -> 'warm-modern', 'dark' -> 'dark-editorial'
    if (themeParam === 'warm') return 'warm-modern';
    if (themeParam === 'dark') return 'dark-editorial';
    return null;
  }

  // Determine initial theme: query param > localStorage > default
  function getInitialTheme() {
    const fromQuery = getQueryTheme();
    if (fromQuery) return fromQuery;

    const fromStorage = localStorage.getItem('nileroot_theme');
    if (fromStorage && VALID_THEMES.includes(fromStorage)) {
      return fromStorage;
    }

    return DEFAULT_THEME;
  }

  // Apply theme to document element and update UI buttons
  function applyTheme(themeId, updateQueryParam = false) {
    if (!VALID_THEMES.includes(themeId)) {
      themeId = DEFAULT_THEME;
    }

    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('nileroot_theme', themeId);

    // Update active state in switcher UI
    themeBtns.forEach(btn => {
      const isActive = btn.dataset.themeId === themeId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });

    // Optionally update URL query param without full page reload
    if (updateQueryParam) {
      const url = new URL(window.location.href);
      url.searchParams.set('theme', themeId);
      window.history.replaceState({}, '', url.toString());
    }
  }

  // Wire up theme buttons
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = btn.dataset.themeId;
      applyTheme(selected, true);
    });
  });

  // Hide / Show Theme Switcher Bar
  const SWITCHER_HIDDEN_KEY = 'nileroot_switcher_hidden';

  function setSwitcherVisibility(hidden) {
    if (themeSwitcherContainer) {
      themeSwitcherContainer.classList.toggle('is-hidden', hidden);
    }
    try {
      localStorage.setItem(SWITCHER_HIDDEN_KEY, hidden ? 'true' : 'false');
    } catch (e) {
      // localStorage may fail in restricted sandboxes
    }
  }

  if (hideSwitcherBtn) {
    hideSwitcherBtn.addEventListener('click', () => setSwitcherVisibility(true));
  }

  if (showSwitcherBtn) {
    showSwitcherBtn.addEventListener('click', () => setSwitcherVisibility(false));
  }

  // Check saved switcher visibility preference
  const isSwitcherHidden = localStorage.getItem(SWITCHER_HIDDEN_KEY) === 'true';
  if (isSwitcherHidden) {
    setSwitcherVisibility(true);
  }

  // Initialize theme
  applyTheme(getInitialTheme(), false);

  // ========================================================================
  // 2. Category Filtering
  // ========================================================================
  const navPills = document.querySelectorAll('.nav-pill');
  const articleCards = document.querySelectorAll('.article-card');

  navPills.forEach(pill => {
    pill.addEventListener('click', () => {
      navPills.forEach(btn => btn.classList.remove('active'));
      pill.classList.add('active');

      const selected = pill.dataset.category;
      articleCards.forEach(card => {
        const matches = selected === 'all' || card.dataset.category === selected;
        card.style.display = matches ? 'flex' : 'none';
      });
    });
  });

  // ========================================================================
  // 3. Search Drawer Toggle & Live Filter
  // ========================================================================
  const searchToggle = document.getElementById('searchToggle');
  const searchDrawer = document.getElementById('searchDrawer');
  const searchInput = document.getElementById('searchInput');
  const clearSearch = document.getElementById('clearSearch');

  if (searchToggle && searchDrawer && searchInput) {
    searchToggle.addEventListener('click', () => {
      searchDrawer.classList.toggle('open');
      if (searchDrawer.classList.contains('open')) {
        searchInput.focus();
      }
    });

    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      articleCards.forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(term) ? 'flex' : 'none';
      });
    });

    if (clearSearch) {
      clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        // Reset according to currently active nav pill
        const activeNav = document.querySelector('.nav-pill.active');
        const activeCat = activeNav ? activeNav.dataset.category : 'all';
        articleCards.forEach(card => {
          const matches = activeCat === 'all' || card.dataset.category === activeCat;
          card.style.display = matches ? 'flex' : 'none';
        });
      });
    }
  }

  // ========================================================================
  // 4. Mobile Nav Toggle
  // ========================================================================
  const menuToggle = document.getElementById('menuToggle');
  const categoryNav = document.getElementById('categoryNav');

  if (menuToggle && categoryNav) {
    menuToggle.addEventListener('click', () => {
      const isHidden = categoryNav.style.display === 'none' || getComputedStyle(categoryNav).display === 'none';
      categoryNav.style.display = isHidden ? 'block' : 'none';
    });
  }

  // ========================================================================
  // 5. Subscribe Modal Controls
  // ========================================================================
  const openSubscribe = document.getElementById('openSubscribe');
  const closeSubscribe = document.getElementById('closeSubscribe');
  const subscribeModal = document.getElementById('subscribeModal');
  const subscribeForm = document.getElementById('subscribeForm');

  if (openSubscribe && subscribeModal) {
    openSubscribe.addEventListener('click', () => subscribeModal.classList.add('open'));
  }

  if (closeSubscribe && subscribeModal) {
    closeSubscribe.addEventListener('click', () => subscribeModal.classList.remove('open'));
  }

  if (subscribeModal) {
    subscribeModal.addEventListener('click', (e) => {
      if (e.target === subscribeModal) subscribeModal.classList.remove('open');
    });
  }

  if (subscribeForm && subscribeModal) {
    subscribeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      subscribeModal.classList.remove('open');
      subscribeForm.reset();
      alert('Thank you for subscribing to Nile Root!');
    });
  }
});
