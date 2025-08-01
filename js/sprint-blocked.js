// sprint-blocked.js - Handles the blocked page UI during active Focus Sprints

import { StorageService } from './storage-service.js';

class SprintBlockedPage {
  constructor() {
    this.storageService = new StorageService();
    this.timerElement = document.getElementById('timer');
    this.progressBar = document.getElementById('progress-bar');
    this.goalElement = document.getElementById('goal');
    this.backButton = document.getElementById('back-button');
    this.cancelButton = document.getElementById('cancel-sprint');
    
    this.sprintState = null;
    this.timerInterval = null;
    
    this.initialize();
  }
  
  async initialize() {
    try {
      // Load sprint state
      this.sprintState = await this.storageService.getSprintState();
      
      if (!this.sprintState || !this.sprintState.isActive) {
        // No active sprint, redirect to normal blocked page
        window.location.href = 'blocked.html';
        return;
      }
      
      // Set up the UI with sprint data
      this.updateUI();
      
      // Start the countdown timer
      this.startCountdown();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Record this as a bypass attempt
      this.recordBypassAttempt();
    } catch (error) {
      console.error('Error initializing sprint blocked page:', error);
      // Fallback to normal blocked page
      window.location.href = 'blocked.html';
    }
  }
  
  updateUI() {
    if (!this.sprintState) return;
    
    // Update goal if available
    if (this.sprintState.goal) {
      this.goalElement.textContent = `Goal: ${this.sprintState.goal}`;
    } else {
      this.goalElement.style.display = 'none';
    }
    
    // Calculate remaining time and progress
    const now = Date.now();
    const endTime = this.sprintState.endTime;
    const startTime = this.sprintState.startTime;
    const totalDuration = endTime - startTime;
    const elapsed = now - startTime;
    const remaining = Math.max(0, endTime - now);
    
    // Update progress bar
    const progressPercent = Math.min(100, (elapsed / totalDuration) * 100);
    this.progressBar.style.width = `${progressPercent}%`;
    
    // Update timer
    this.updateTimerDisplay(remaining);
  }
  
  startCountdown() {
    // Clear any existing interval
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    // Update every second
    this.timerInterval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, this.sprintState.endTime - now);
      
      if (remaining <= 0) {
        // Sprint is complete
        clearInterval(this.timerInterval);
        this.handleSprintComplete();
        return;
      }
      
      // Update timer display
      this.updateTimerDisplay(remaining);
      
      // Update progress bar
      const totalDuration = this.sprintState.endTime - this.sprintState.startTime;
      const elapsed = now - this.sprintState.startTime;
      const progressPercent = Math.min(100, (elapsed / totalDuration) * 100);
      this.progressBar.style.width = `${progressPercent}%`;
    }, 1000);
  }
  
  updateTimerDisplay(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    
    this.timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  setupEventListeners() {
    // Back button - return to previous page
    this.backButton.addEventListener('click', () => {
      window.history.back();
    });
    
    // Cancel sprint button
    this.cancelButton.addEventListener('click', async () => {
      if (confirm('Are you sure you want to end your Focus Sprint early?')) {
        await this.cancelSprint();
        window.location.href = 'popup.html';
      }
    });
  }
  
  async cancelSprint() {
    try {
      // Send message to background script to cancel sprint
      await chrome.runtime.sendMessage({ action: 'cancelSprint' });
    } catch (error) {
      console.error('Error cancelling sprint:', error);
    }
  }
  
  async handleSprintComplete() {
    // Update UI to show sprint is complete
    this.timerElement.textContent = '00:00';
    this.progressBar.style.width = '100%';
    
    // Change button text
    this.backButton.textContent = 'Return to Previous Page';
    this.cancelButton.textContent = 'Open FocusGuard';
    
    // Update cancel button to just open popup
    this.cancelButton.removeEventListener('click', this.cancelSprint);
    this.cancelButton.addEventListener('click', () => {
      window.location.href = 'popup.html';
    });
  }
  
  async recordBypassAttempt() {
    try {
      // Record this as a bypass attempt
      await chrome.runtime.sendMessage({ action: 'recordBypass' });
    } catch (error) {
      console.error('Error recording bypass attempt:', error);
    }
  }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SprintBlockedPage();
});
