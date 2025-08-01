// FocusGuard Popup Script
// Handles the extension popup interface

import { SprintManager } from './js/sprint-manager.js';
import { UiController } from './js/ui-controller.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize UI elements
  const mainToggle = document.getElementById('main-toggle');
  const blockedCountEl = document.getElementById('blocked-count');
  const bypassAttemptsEl = document.getElementById('bypass-attempts');
  const focusTimeEl = document.getElementById('focus-time');
  const statusEl = document.getElementById('status');
  const optionsBtn = document.getElementById('options-btn');
  const toggleAdditional = document.getElementById('toggle-additional');
  const blockingSection = document.getElementById('blocking-section');
  const statsSection = document.getElementById('stats-section');
  
  // Initialize Focus Sprint components
  const sprintManager = new SprintManager();
  await sprintManager.initialize();
  const uiController = new UiController(sprintManager);
  
  // Initialize the Focus Sprint UI (now that sprint state is loaded)
  uiController.initializeUi();
  
  // Load current settings and stats
  await loadData();
  
  // Toggle additional options visibility
  toggleAdditional.addEventListener('click', () => {
    const isCollapsed = blockingSection.classList.contains('collapsed');
    
    if (isCollapsed) {
      blockingSection.classList.remove('collapsed');
      statsSection.classList.remove('collapsed');
      toggleAdditional.textContent = 'Hide blocking options';
    } else {
      blockingSection.classList.add('collapsed');
      statsSection.classList.add('collapsed');
      toggleAdditional.textContent = 'Show blocking options';
    }
  });
  
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
  
  // Listen for sprint completion from background script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'sprintCompleted') {
      uiController.showCompletionState(message.sprintData);
    }
  });
  
  async function loadData() {
    try {
      const data = await chrome.storage.sync.get([
        'isEnabled', 
        'blockedSites', 
        'bypassAttempts',
        'focusTime'
      ]);
      
      const isEnabled = data.isEnabled !== false; // Default to true
      const blockedSites = data.blockedSites || [];
      const bypassAttempts = data.bypassAttempts || 0;
      const focusTime = data.focusTime || 0;
      
      // Update UI
      updateToggleUI(isEnabled);
      blockedCountEl.textContent = blockedSites.length;
      bypassAttemptsEl.textContent = bypassAttempts;
      focusTimeEl.textContent = `${focusTime} min`;
      updateStatus(isEnabled);
      
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
