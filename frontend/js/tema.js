(function () {
  // Z-Core Premium - Dark Mode Fixed
  document.documentElement.setAttribute('data-theme', 'dark');
  localStorage.setItem('zcore-theme', 'dark');
  
  window.applyZCoreTheme = function() {
    document.documentElement.setAttribute('data-theme', 'dark');
  };
})();
