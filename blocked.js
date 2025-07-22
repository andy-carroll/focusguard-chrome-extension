// FocusGuard Blocked Page Script
// Handles the friction timer and bypass functionality

document.addEventListener('DOMContentLoaded', () => {
  // Get the URL that was blocked
  const urlParams = new URLSearchParams(window.location.search);
  const blockedUrl = urlParams.get('url') || document.referrer || 'Unknown site';
  document.getElementById('blocked-url').textContent = blockedUrl;

  let countdown = 10;
  const countdownEl = document.getElementById('countdown');
  const bypassBtn = document.getElementById('bypass-btn');

  // Countdown timer
  const timer = setInterval(() => {
    countdown--;
    
    if (countdown > 0) {
      countdownEl.textContent = `Wait ${countdown} seconds to continue...`;
    } else {
      countdownEl.textContent = 'You can now bypass this block';
      bypassBtn.disabled = false;
      clearInterval(timer);
    }
  }, 1000);

  // Load and display stats
  loadStats();

  // Set up bypass button
  bypassBtn.addEventListener('click', bypassBlock);

  // Set up go back button
  const goBackBtn = document.getElementById('go-back-btn');
  if (goBackBtn) {
    goBackBtn.addEventListener('click', () => {
      window.history.back();
    });
  }

  async function loadStats() {
    try {
      const data = await chrome.storage.sync.get(['bypassAttempts']);
      const attempts = data.bypassAttempts || 0;
      document.getElementById('stats').textContent = 
        `Total bypass attempts today: ${attempts}`;
    } catch (error) {
      console.log('Could not load stats:', error);
    }
  }

  function bypassBlock() {
    // Record the bypass attempt
    chrome.runtime.sendMessage({ action: 'recordBypass' });
    
    // Extract the original URL and redirect
    const originalUrl = new URL(window.location).searchParams.get('url') || 
                        document.referrer ||
                        blockedUrl;
    
    if (originalUrl && originalUrl !== 'Unknown site') {
      window.location.href = originalUrl;
    } else {
      // Fallback - go back in history
      window.history.back();
    }
  }
});
