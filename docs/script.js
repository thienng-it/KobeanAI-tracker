document.addEventListener('DOMContentLoaded', () => {
  // 1. Tab Switching
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  // 2. Theme Toggle with LocalStorage
  const themeBtn = document.getElementById('theme-toggle');
  const themeText = document.getElementById('theme-text');
  
  const savedTheme = localStorage.getItem('kobeanai-docs-theme') || 'dark';
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeText) themeText.textContent = 'Dark Mode';
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (themeText) themeText.textContent = 'Light Mode';
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      if (currentTheme === 'light') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('kobeanai-docs-theme', 'dark');
        if (themeText) themeText.textContent = 'Light Mode';
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('kobeanai-docs-theme', 'light');
        if (themeText) themeText.textContent = 'Dark Mode';
      }
    });
  }

  // 3. Code Block Copy Buttons
  const copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetCodeId = btn.getAttribute('data-target');
      const codeElement = document.getElementById(targetCodeId);
      if (codeElement) {
        navigator.clipboard.writeText(codeElement.textContent.trim());
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.style.color = '#10b981';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.color = '';
        }, 2000);
      }
    });
  });
});
