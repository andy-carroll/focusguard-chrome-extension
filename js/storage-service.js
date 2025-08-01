// FocusGuard - Storage Service
// Handles persistence of sprint data using Chrome Storage API

class StorageService {
  constructor() {
    // Storage keys
    this.SPRINT_DATA_KEY = 'sprintData';
    this.SPRINT_STATE_KEY = 'sprintState';
  }
  
  async saveSprintData(sprintData) {
    if (!sprintData) {
      throw new Error('Sprint data is required');
    }
    
    try {
      await chrome.storage.local.set({ 
        [this.SPRINT_DATA_KEY]: sprintData 
      });
      return true;
    } catch (error) {
      console.error('Error saving sprint data:', error);
      throw error;
    }
  }
  
  async getSprintData() {
    try {
      const data = await chrome.storage.local.get([this.SPRINT_DATA_KEY]);
      return data[this.SPRINT_DATA_KEY] || null;
    } catch (error) {
      console.error('Error retrieving sprint data:', error);
      return null;
    }
  }
  
  async saveSprintState(sprintState) {
    if (!sprintState) {
      throw new Error('Sprint state is required');
    }
    
    try {
      // Use sync storage for sprint state to make it available across extension components
      await chrome.storage.sync.set({ 
        [this.SPRINT_STATE_KEY]: sprintState 
      });
      return true;
    } catch (error) {
      console.error('Error saving sprint state:', error);
      throw error;
    }
  }
  
  async getSprintState() {
    try {
      const data = await chrome.storage.sync.get([this.SPRINT_STATE_KEY]);
      return data[this.SPRINT_STATE_KEY] || null;
    } catch (error) {
      console.error('Error retrieving sprint state:', error);
      return null;
    }
  }
  
  async clearSprintState() {
    try {
      await chrome.storage.sync.remove([this.SPRINT_STATE_KEY]);
      return true;
    } catch (error) {
      console.error('Error clearing sprint state:', error);
      throw error;
    }
  }
  
  async clearSprintData() {
    try {
      await chrome.storage.local.remove([this.SPRINT_DATA_KEY]);
      return true;
    } catch (error) {
      console.error('Error clearing sprint data:', error);
      throw error;
    }
  }
  
  // Helper method to get all stored data (useful for debugging)
  async getAllStoredData() {
    try {
      const localData = await chrome.storage.local.get(null);
      const syncData = await chrome.storage.sync.get(null);
      
      return {
        local: localData,
        sync: syncData
      };
    } catch (error) {
      console.error('Error retrieving all stored data:', error);
      return null;
    }
  }
}

// Export for both CommonJS (tests) and ES modules (Chrome)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StorageService };
}

export { StorageService };
