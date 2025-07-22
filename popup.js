// FocusGuard Popup Script
// Handles the extension popup interface

document.addEventListener('DOMContentLoaded', async () => {
  const mainToggle = document.getElementById('main-toggle');
  const blockedCountEl = document.getElementById('blocked-count');
  const bypassAttemptsEl = document.getElementById('bypass-attempts');
  const statusEl = document.getElementById('status');
  const optionsBtn = document.getElementById('options-btn');
  const breakBtn = document.getElementById('break-btn');
  
  // Load current settings and stats
  await loadData();
  
  // Toggle blocking on/off
  mainToggle.addEventListener('click', async () => {
    const { isEnabled } = await chrome.storage.sync.get(['isEnabled']);
    const newState = !isEnabled;
    
    await chrome.storage.sync.set({ isEnabled: newState });
    updateToggleUI(newState);
    updateStatus(newState);
  });
  
  // Open options page
  optionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Quick break mode (disable for 15 minutes)
  breakBtn.addEventListener('click', async () => {
    const breakEndTime = Date.now() + (15 * 60 * 1000); // 15 minutes
    await chrome.storage.sync.set({ 
      breakMode: true,
      breakEndTime: breakEndTime 
    });
    
    breakBtn.textContent = 'Break Active';
    breakBtn.disabled = true;
    statusEl.textContent = 'Break mode (15 min)';
    
    // Re-enable after break
    setTimeout(async () => {
      await chrome.storage.sync.set({ 
        breakMode: false,
        breakEndTime: null 
      });
      await loadData();
    }, 15 * 60 * 1000);
  });
  
  async function loadData() {
    try {
      const data = await chrome.storage.sync.get([
        'isEnabled', 
        'blockedSites', 
        'bypassAttempts',
        'breakMode',
        'breakEndTime'
      ]);
      
      const isEnabled = data.isEnabled !== false; // Default to true
      const blockedSites = data.blockedSites || [];
      const bypassAttempts = data.bypassAttempts || 0;
      const breakMode = data.breakMode || false;
      const breakEndTime = data.breakEndTime;
      
      // Check if break is still active
      if (breakMode && breakEndTime && Date.now() < breakEndTime) {
        const remainingMinutes = Math.ceil((breakEndTime - Date.now()) / (60 * 1000));
        statusEl.textContent = `Break mode (${remainingMinutes} min left)`;
        breakBtn.textContent = 'Break Active';
        breakBtn.disabled = true;
      } else if (breakMode) {
        // Break expired, clean up
        await chrome.storage.sync.set({ 
          breakMode: false,
          breakEndTime: null 
        });
      }
      
      // Update UI
      updateToggleUI(isEnabled && !breakMode);
      blockedCountEl.textContent = blockedSites.length;
      bypassAttemptsEl.textContent = bypassAttempts;
      
      if (!breakMode) {
        updateStatus(isEnabled);
      }
      
    } catch (error) {
      console.error('Error loading popup data:', error);
      statusEl.textContent = 'Error loading data';
    }
  }
  
  function updateToggleUI(enabled) {
    if (enabled) {
      mainToggle.classList.add('enabled');
    } else {
      mainToggle.classList.remove('enabled');
    }
  }
  
  function updateStatus(enabled) {
    if (enabled) {
      statusEl.textContent = 'Active';
      statusEl.style.color = '#27ae60';
    } else {
      statusEl.textContent = 'Disabled';
      statusEl.style.color = '#e74c3c';
    }
  }
});
