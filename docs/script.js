document.addEventListener('DOMContentLoaded', () => {
  // 1. Tab Switching with URL Hash Support
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  function switchTab(targetId) {
    tabButtons.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === targetId);
    });
    tabContents.forEach(c => {
      c.classList.toggle('active', c.id === targetId);
    });
    // Update hash without jump
    history.replaceState(null, null, `#${targetId.replace('tab-', '')}`);
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      if (targetId) switchTab(targetId);
    });
  });

  // Check initial hash on load
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const matchingTab = document.getElementById(`tab-${hash}`);
    if (matchingTab) {
      switchTab(`tab-${hash}`);
    }
  }

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
        btn.style.borderColor = '#10b981';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.color = '';
          btn.style.borderColor = '';
        }, 2000);
      }
    });
  });

  // 4. FAQ Accordion Toggle
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      if (item) {
        item.classList.toggle('open');
      }
    });
  });

  // 5. Documentation Live Search
  const searchInput = document.getElementById('docs-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const activeTabContent = document.querySelector('.tab-content.active');
      if (!activeTabContent) return;

      const cards = activeTabContent.querySelectorAll('.card, .step-item, .faq-item');
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (!query || text.includes(query)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }
});
