// FocusGuard Options Script
// Handles the settings page functionality

document.addEventListener('DOMContentLoaded', async () => {
  const siteList = document.getElementById('site-list');
  const newSiteInput = document.getElementById('new-site');
  const addSiteBtn = document.getElementById('add-site-btn');
  const bulkSitesTextarea = document.getElementById('bulk-sites');
  const importBtn = document.getElementById('import-btn');
  const resetBtn = document.getElementById('reset-btn');
  const successMessage = document.getElementById('success-message');

  // Load current settings
  await loadSites();

  // Add single site
  addSiteBtn.addEventListener('click', addSite);
  newSiteInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addSite();
    }
  });

  // Import multiple sites
  importBtn.addEventListener('click', importSites);

  // Reset to defaults
  resetBtn.addEventListener('click', resetToDefaults);

  // All settings are auto-saved when changes are made
  
  // Use event delegation for remove buttons
  siteList.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-btn')) {
      const index = parseInt(e.target.getAttribute('data-index'));
      removeSite(index);
    }
  });

  async function loadSites() {
    try {
      const { blockedSites } = await chrome.storage.sync.get(['blockedSites']);
      const sites = blockedSites || [];
      
      renderSiteList(sites);
    } catch (error) {
      console.error('Error loading sites:', error);
    }
  }

  function renderSiteList(sites) {
    if (sites.length === 0) {
      siteList.innerHTML = '<p style="text-align: center; color: #7f8c8d; font-style: italic;">No blocked sites yet. Add some below!</p>';
      return;
    }

    siteList.innerHTML = sites.map((site, index) => `
      <div class="site-item">
        <span class="site-url">${escapeHtml(site)}</span>
        <button class="remove-btn" data-index="${index}">Remove</button>
      </div>
    `).join('');
  }

  async function addSite() {
    const url = newSiteInput.value.trim();
    
    if (!url) {
      alert('Please enter a URL');
      return;
    }

    try {
      const { blockedSites } = await chrome.storage.sync.get(['blockedSites']);
      const sites = blockedSites || [];
      
      // Convert URL to wildcard format if needed
      const formattedUrl = formatUrl(url);
      
      if (sites.includes(formattedUrl)) {
        alert('This site is already blocked');
        return;
      }

      sites.push(formattedUrl);
      await chrome.storage.sync.set({ blockedSites: sites });
      
      newSiteInput.value = '';
      renderSiteList(sites);
      showSuccessMessage();
    } catch (error) {
      console.error('Error adding site:', error);
      alert('Error adding site. Please try again.');
    }
  }

  async function importSites() {
    const urls = bulkSitesTextarea.value
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (urls.length === 0) {
      alert('Please enter at least one URL');
      return;
    }

    try {
      const { blockedSites } = await chrome.storage.sync.get(['blockedSites']);
      const sites = blockedSites || [];
      
      let addedCount = 0;
      urls.forEach(url => {
        const formattedUrl = formatUrl(url);
        if (!sites.includes(formattedUrl)) {
          sites.push(formattedUrl);
          addedCount++;
        }
      });

      await chrome.storage.sync.set({ blockedSites: sites });
      
      bulkSitesTextarea.value = '';
      renderSiteList(sites);
      showSuccessMessage(`Added ${addedCount} new sites`);
    } catch (error) {
      console.error('Error importing sites:', error);
      alert('Error importing sites. Please try again.');
    }
  }

  async function removeSite(index) {
    try {
      const { blockedSites } = await chrome.storage.sync.get(['blockedSites']);
      const sites = blockedSites || [];
      
      sites.splice(index, 1);
      await chrome.storage.sync.set({ blockedSites: sites });
      
      renderSiteList(sites);
      showSuccessMessage('Site removed successfully!');
    } catch (error) {
      console.error('Error removing site:', error);
      alert('Error removing site. Please try again.');
    }
  }

  async function resetToDefaults() {
    if (!confirm('This will reset all your blocked sites to the default list. Are you sure?')) {
      return;
    }

    const defaultSites = [
      '*://facebook.com/*',
      '*://www.facebook.com/*',
      '*://twitter.com/*',
      '*://www.twitter.com/*',
      '*://x.com/*',
      '*://www.x.com/*',
      '*://reddit.com/*',
      '*://www.reddit.com/*',
      '*://news.ycombinator.com/*',
      '*://cnn.com/*',
      '*://www.cnn.com/*',
      '*://bbc.co.uk/news/*',
      '*://www.bbc.co.uk/news/*'
    ];

    try {
      await chrome.storage.sync.set({ blockedSites: defaultSites });
      renderSiteList(defaultSites);
      showSuccessMessage('Reset to default sites');
    } catch (error) {
      console.error('Error resetting sites:', error);
      alert('Error resetting sites. Please try again.');
    }
  }

  function formatUrl(url) {
    // If it's already in wildcard format, return as-is
    if (url.includes('*')) {
      return url;
    }

    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      const urlObj = new URL(url);
      // Convert to wildcard format for blocking
      return `*://${urlObj.hostname}/*`;
    } catch (error) {
      // If URL parsing fails, return as-is and let Chrome handle the error
      return url;
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showSuccessMessage(message = 'Settings saved successfully!') {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 3000);
  }
});
