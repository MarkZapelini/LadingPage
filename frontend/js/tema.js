(function () {
  var STORAGE_KEY = 'zcore-theme';

  function getStoredTheme() {
    var saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'dark' || saved === 'light' ? saved : 'light';
  }

  function applyTheme(theme) {
    var isDark = theme === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
    updateToggleButtons(isDark);
  }

  function updateToggleButtons(isDark) {
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      btn.setAttribute(
        'aria-label',
        isDark ? 'Ativar modo claro' : 'Ativar modo escuro'
      );
      btn.setAttribute('title', isDark ? 'Modo claro' : 'Modo escuro');
    });
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  function bindToggleButtons() {
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      if (btn.dataset.themeBound) return;
      btn.dataset.themeBound = '1';
      btn.addEventListener('click', toggleTheme);
    });
    updateToggleButtons(getStoredTheme() === 'dark');
  }

  window.toggleTheme = toggleTheme;
  window.applyZCoreTheme = applyTheme;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindToggleButtons);
  } else {
    bindToggleButtons();
  }
})();
