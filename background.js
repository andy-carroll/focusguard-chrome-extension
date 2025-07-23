// FocusGuard Background Script
// Handles the core blocking logic and rule management

// Default blocked sites - user can modify these
const DEFAULT_BLOCKED_SITES = [
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
  '*://bbc.co.uk/*',
  '*://www.bbc.co.uk/*'
];

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('FocusGuard installed');
  
  // Set default blocked sites if not already set
  const { blockedSites } = await chrome.storage.sync.get(['blockedSites']);
  if (!blockedSites) {
    await chrome.storage.sync.set({
      blockedSites: DEFAULT_BLOCKED_SITES,
      isEnabled: true,
      bypassAttempts: 0,
      focusTime: 0
    });
  }
  
  // Update blocking rules
  updateBlockingRules();
});

// Update blocking rules based on current settings
async function updateBlockingRules() {
  const { blockedSites, isEnabled } = await chrome.storage.sync.get(['blockedSites', 'isEnabled']);
  
  if (!isEnabled || !blockedSites || blockedSites.length === 0) {
    // Remove all rules if disabled or no sites
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1]
    });
    return;
  }

  // Create blocking rules for each site
  const rules = blockedSites.map((site, index) => {
    // Convert wildcard pattern to proper URL filter
    // Build a simple urlFilter for the domain pattern
    let urlFilter;
    if (site.includes('*://')) {
      const domain = site.replace('*://', '').replace('/*', '').replace('www.', '');
      urlFilter = `*://${domain}/*`;
    } else {
      urlFilter = site;
    }

    return {
      id: index + 1,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          url: chrome.runtime.getURL('blocked.html')
        }
      },
      condition: {
        urlFilter: urlFilter,
        resourceTypes: ['main_frame']
      }
    };
  });

  try {
    // Remove old rules (up to 50 rule IDs)
    const oldRuleIds = Array.from({length: 50}, (_, i) => i + 1);
    
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRuleIds,
      addRules: rules
    });
    console.log('Blocking rules updated:', rules.length, 'rules created');
    console.log('Rules:', rules);
  } catch (error) {
    console.error('Error updating rules:', error);
  }
}

// Listen for storage changes to update rules
chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockedSites || changes.isEnabled) {
    updateBlockingRules();
  }
});

// Track bypass attempts
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'recordBypass') {
    const { bypassAttempts } = await chrome.storage.sync.get(['bypassAttempts']);
    await chrome.storage.sync.set({
      bypassAttempts: (bypassAttempts || 0) + 1
    });
  }
});
