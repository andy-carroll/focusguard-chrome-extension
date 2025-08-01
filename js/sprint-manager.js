// FocusGuard - Sprint Manager
// Handles the core logic for Focus Sprint feature

import { StorageService } from './storage-service.js';
import { BadgeController } from './badge-controller.js';

class SprintManager {
  constructor(storageService, badgeController) {
    this.storageService = storageService || new StorageService();
    this.badgeController = badgeController || new BadgeController();
    this.isSprintActive = false;
    this.sprintData = null;
  }
  
  async initialize() {
    // Initialize and check for active sprints
    await this.init();
  }
  
  async init() {
    // Check if there's an active sprint (e.g., after browser restart)
    const sprintData = await this.storageService.getSprintData();
    if (sprintData && sprintData.isActive) {
      // Verify if the sprint is still valid
      const currentTime = Date.now();
      const endTime = sprintData.startTime + (sprintData.duration * 60 * 1000);
      
      if (currentTime < endTime) {
        // Sprint is still active
        this.sprintData = sprintData;
        this.isSprintActive = true;
        
        // Calculate remaining time and set up alarm
        const remainingMs = endTime - currentTime;
        this.setupAlarm(Math.ceil(remainingMs / 1000 / 60));
        
        // Update badge
        this.updateBadge();
      } else {
        // Sprint has ended while browser was closed
        await this.completeSprint();
      }
    }
  }
  
  async startSprint(duration, goal, successCriteria) {
    if (this.isSprintActive) {
      throw new Error('A sprint is already active');
    }
    
    // Create sprint data
    this.sprintData = {
      isActive: true,
      startTime: Date.now(),
      duration: duration, // in minutes
      goal: goal || '',
      successCriteria: successCriteria || '',
      completed: false
    };
    
    // Save to storage
    await this.storageService.saveSprintData(this.sprintData);
    
    // Set up alarm for sprint end
    this.setupAlarm(duration);
    
    // Enable site blocking
    await this.enableSiteBlocking();
    
    // Update badge
    this.isSprintActive = true;
    this.updateBadge();
    
    return this.sprintData;
  }
  
  async cancelSprint() {
    if (!this.isSprintActive) {
      return false;
    }
    
    // Clear alarm
    await chrome.alarms.clear('focusSprint');
    
    // Update sprint data
    this.sprintData.isActive = false;
    this.sprintData.cancelled = true;
    await this.storageService.saveSprintData(this.sprintData);
    
    // Reset state
    this.isSprintActive = false;
    this.badgeController.clearBadge();
    
    return true;
  }
  
  async completeSprint() {
    if (!this.isSprintActive && !this.sprintData) {
      return false;
    }
    
    // Clear alarm
    await chrome.alarms.clear('focusSprint');
    
    // Update sprint data
    this.sprintData.isActive = false;
    this.sprintData.completed = true;
    this.sprintData.completedTime = Date.now();
    await this.storageService.saveSprintData(this.sprintData);
    
    // Reset state
    this.isSprintActive = false;
    this.badgeController.clearBadge();
    
    // Update focus time stats
    await this.updateFocusTimeStats();
    
    return true;
  }
  
  async updateFocusTimeStats() {
    if (!this.sprintData || !this.sprintData.completed) {
      return;
    }
    
    // Calculate actual focus time (in minutes)
    const actualDuration = this.sprintData.duration;
    if (!actualDuration) return;
    
    // Get current stats
    const { focusTime } = await chrome.storage.sync.get(['focusTime']);
    const newFocusTime = (focusTime || 0) + actualDuration;
    
    // Save updated stats
    await chrome.storage.sync.set({ focusTime: newFocusTime });
  }
  
  setupAlarm(minutes) {
    // Create an alarm that will fire when the sprint ends
    chrome.alarms.create('focusSprint', {
      delayInMinutes: minutes
    });
    
    // Listen for alarm
    chrome.alarms.onAlarm.addListener(this.handleAlarm.bind(this));
  }
  
  async handleAlarm(alarm) {
    if (alarm.name === 'focusSprint') {
      await this.completeSprint();
      
      // Notify user
      // This will be handled by the UI controller
      chrome.runtime.sendMessage({
        action: 'sprintCompleted',
        sprintData: this.sprintData
      });
    }
  }
  
  async enableSiteBlocking() {
    // Enable site blocking if not already enabled
    const { isEnabled } = await chrome.storage.sync.get(['isEnabled']);
    if (!isEnabled) {
      await chrome.storage.sync.set({ isEnabled: true });
    }
  }
  
  updateBadge() {
    if (!this.isSprintActive || !this.sprintData) {
      this.badgeController.clearBadge();
      return;
    }
    
    // Calculate remaining time
    const currentTime = Date.now();
    const endTime = this.sprintData.startTime + (this.sprintData.duration * 60 * 1000);
    const remainingMinutes = Math.ceil((endTime - currentTime) / (60 * 1000));
    
    // Update badge
    this.badgeController.setSprintActive(remainingMinutes);
  }
  
  getSprintState() {
    return {
      isActive: this.isSprintActive,
      sprintData: this.sprintData
    };
  }
  
  getRemainingTime() {
    if (!this.isSprintActive || !this.sprintData) {
      return 0;
    }
    
    const currentTime = Date.now();
    const endTime = this.sprintData.startTime + (this.sprintData.duration * 60 * 1000);
    return Math.max(0, endTime - currentTime);
  }
}

// Export for both CommonJS (tests) and ES modules (Chrome)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SprintManager };
}

export { SprintManager };
