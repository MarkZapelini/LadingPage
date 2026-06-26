(function () {
  // Z-Core Premium - Dark Mode Logic
  const savedTheme = localStorage.getItem('zcore-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  window.applyZCoreTheme = function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('zcore-theme', newTheme);
  };

  // Z-Core Premium - Reveal Animations
  document.addEventListener('DOMContentLoaded', function() {
    // Handle theme toggle button
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', applyZCoreTheme);
    }

    const observerOptions = {
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal-volt').forEach(el => {
      observer.observe(el);
    });
  });
})();
