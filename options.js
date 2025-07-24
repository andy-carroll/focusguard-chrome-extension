// FocusGuard Options Script
// Handles the settings page functionality

// Helper function, moved to top-level for testability
function formatUrl(url) {
  // If url is empty, invalid, or already a wildcard, return as-is
  if (!url || url.includes('*') || !url.includes('.')) {
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
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

document.addEventListener('DOMContentLoaded', async () => {
  const siteList = document.getElementById('site-list');
  const sitesInput = document.getElementById('sites-input');
  const addSitesBtn = document.getElementById('add-sites-btn');
  const resetBtn = document.getElementById('reset-btn');
  const successMessage = document.getElementById('success-message');

  // Load current settings
  await loadSites();

  // Add sites (single or multiple)
  addSitesBtn.addEventListener('click', addSites);
  sitesInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      addSites();
    }
  });

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

  async function addSites() {
    const input = sitesInput.value.trim();
    
    if (!input) {
      alert('Please enter at least one URL');
      return;
    }

    try {
      // Smart parsing: handle both line-separated and comma-separated input
      const urls = input
        .split(/[\n,]+/) // Split by newlines OR commas
        .map(url => url.trim())
        .filter(url => url.length > 0);

      if (urls.length === 0) {
        alert('Please enter at least one valid URL');
        return;
      }

      const { blockedSites } = await chrome.storage.sync.get(['blockedSites']);
      const sites = blockedSites || [];
      
      let addedCount = 0;
      const duplicates = [];
      
      urls.forEach(url => {
        const formattedUrl = formatUrl(url);
        if (!sites.includes(formattedUrl)) {
          sites.push(formattedUrl);
          addedCount++;
        } else {
          duplicates.push(url);
        }
      });

      await chrome.storage.sync.set({ blockedSites: sites });
      
      sitesInput.value = '';
      renderSiteList(sites);
      
      // Show appropriate success message
      if (addedCount === 1) {
        showSuccessMessage('Added 1 new site');
      } else if (addedCount > 1) {
        showSuccessMessage(`Added ${addedCount} new sites`);
      }
      
      if (duplicates.length > 0 && addedCount === 0) {
        showSuccessMessage('All sites were already in your blocked list');
      }
      
    } catch (error) {
      console.error('Error adding sites:', error);
      alert('Error adding sites. Please try again.');
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

  function showSuccessMessage(message = 'Settings saved successfully!') {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 3000);
  }
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formatUrl, escapeHtml };
}
