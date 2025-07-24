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

// Only run this setup logic in the extension environment, not in tests
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onInstalled) {
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
}

// Generates declarativeNetRequest rules from a list of site patterns
function generateRules(sites) {
  const rules = [];
  
  sites.forEach((site) => {
    // Convert wildcard pattern to proper URL filter
    let urlFilter;
    
    if (site.includes('*://')) {
      // Extract the domain part (everything after *:// and before /*)
      const domain = site.replace('*://', '').replace('/*', '');
      
      // Create a rule that matches the exact pattern provided
      urlFilter = `*://${domain}/*`;
      
      rules.push({
        id: rules.length + 1,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            url: 'blocked.html'
          }
        },
        condition: {
          urlFilter: urlFilter,
          resourceTypes: ['main_frame']
        }
      });
      
      // If the domain doesn't start with www., also block the www. version
      if (!domain.startsWith('www.')) {
        rules.push({
          id: rules.length + 1,
          priority: 1,
          action: {
            type: 'redirect',
            redirect: {
              url: 'blocked.html'
            }
          },
          condition: {
            urlFilter: `*://www.${domain}/*`,
            resourceTypes: ['main_frame']
          }
        });
      }
      
      // If the domain starts with www., also block the non-www version
      if (domain.startsWith('www.')) {
        const nonWwwDomain = domain.substring(4); // Remove 'www.'
        rules.push({
          id: rules.length + 1,
          priority: 1,
          action: {
            type: 'redirect',
            redirect: {
              url: 'blocked.html'
            }
          },
          condition: {
            urlFilter: `*://${nonWwwDomain}/*`,
            resourceTypes: ['main_frame']
          }
        });
      }
    } else {
      // Handle non-wildcard patterns as-is
      rules.push({
        id: rules.length + 1,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            url: 'blocked.html'
          }
        },
        condition: {
          urlFilter: site,
          resourceTypes: ['main_frame']
        }
      });
    }
  });

  // Replace placeholder URL with the actual extension URL
  

  return rules;
}

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

  const rules = generateRules(blockedSites);

  // Replace placeholder URL with the actual extension URL
  const blockedPageUrl = chrome.runtime.getURL('blocked.html');
  rules.forEach(rule => {
    rule.action.redirect.url = blockedPageUrl;
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
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.blockedSites || changes.isEnabled) {
      updateBlockingRules();
    }
  });
}

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateRules, updateBlockingRules };
}

// Track bypass attempts
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'recordBypass') {
      const { bypassAttempts } = await chrome.storage.sync.get(['bypassAttempts']);
      await chrome.storage.sync.set({
        bypassAttempts: (bypassAttempts || 0) + 1
      });
    }
  });
}
