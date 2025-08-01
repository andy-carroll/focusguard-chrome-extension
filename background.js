// FocusGuard Background Script
// Handles the core blocking logic, rule management, and Focus Sprint functionality

// Import modules for Focus Sprint feature
import { SprintManager } from './js/sprint-manager.js';
import { StorageService } from './js/storage-service.js';
import { BadgeController } from './js/badge-controller.js';

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

// Initialize services
const storageService = new StorageService();
const badgeController = new BadgeController();
const sprintManager = new SprintManager(storageService, badgeController);

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
    
    // Initialize sprint state
    await sprintManager.initialize();
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
  const { sprintState } = await chrome.storage.sync.get(['sprintState']);
  const isSprintActive = sprintState && sprintState.isActive;
  
  if (!isEnabled || !blockedSites || blockedSites.length === 0) {
    // Remove all rules if disabled or no sites
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: Array.from({length: 50}, (_, i) => i + 1)
    });
    return;
  }

  const rules = generateRules(blockedSites);

  // Choose the appropriate blocked page based on sprint state
  const blockedPageUrl = isSprintActive
    ? chrome.runtime.getURL('sprint-blocked.html')
    : chrome.runtime.getURL('blocked.html');
  
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
    console.log('Using blocked page:', blockedPageUrl);
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
    
    // Listen for sprint state changes
    if (changes.sprintState) {
      const newState = changes.sprintState.newValue;
      console.log('Sprint state changed:', newState);
      
      // Handle sprint state changes
      if (newState && newState.isActive) {
        // Force enable site blocking during active sprint
        chrome.storage.sync.set({ isEnabled: true });
      }
    }
  });
}

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateRules, updateBlockingRules };
}

// Handle messages from popup and content scripts
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    // Track bypass attempts
    if (message.action === 'recordBypass') {
      const { bypassAttempts } = await chrome.storage.sync.get(['bypassAttempts']);
      await chrome.storage.sync.set({
        bypassAttempts: (bypassAttempts || 0) + 1
      });
    }
    
    // Focus Sprint related messages
    if (message.action === 'startSprint') {
      console.log('Starting sprint with duration:', message.duration);
      await sprintManager.startSprint(message.duration, message.goal, message.successCriteria);
      sendResponse({ success: true });
    }
    
    if (message.action === 'cancelSprint') {
      console.log('Cancelling sprint');
      await sprintManager.cancelSprint();
      sendResponse({ success: true });
    }
    
    if (message.action === 'getSprintState') {
      const state = await sprintManager.getSprintState();
      sendResponse({ state });
    }
    
    // Return true to indicate we'll send a response asynchronously
    return true;
  });
}

// Handle alarm events for sprint timer
if (typeof chrome !== 'undefined' && chrome.alarms && chrome.alarms.onAlarm) {
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    console.log('Alarm fired:', alarm.name);
    
    if (alarm.name === 'sprintTimer') {
      // Sprint timer completed
      await sprintManager.completeSprint();
      
      // Send notification
      chrome.notifications.create('sprintComplete', {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Focus Sprint Complete!',
        message: 'Well done! You have completed your Focus Sprint.',
        priority: 2
      });
      
      // Notify popup to update UI
      chrome.runtime.sendMessage({
        action: 'sprintComplete'
      }).catch(error => {
        // This error is expected if popup is not open
        console.log('Could not send sprintComplete message to popup');
      });
    }
    
    if (alarm.name === 'sprintTick') {
      // Update badge with remaining time
      await sprintManager.updateSprintTimer();
    }
  });
}
