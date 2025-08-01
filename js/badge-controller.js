// FocusGuard - Badge Controller
// Manages the extension icon and badge during Focus Sprints

class BadgeController {
  constructor() {
    this.DEFAULT_ICON = {
      path: {
        16: "/icons/icon16.png",
        48: "/icons/icon48.png",
        128: "/icons/icon128.png"
      }
    };
    
    this.ACTIVE_ICON = {
      path: {
        16: "/icons/icon16-active.png",
        48: "/icons/icon48-active.png",
        128: "/icons/icon128-active.png"
      }
    };
    
    // Default badge colors
    this.ACTIVE_COLOR = "#27ae60"; // Green
  }
  
  async setSprintActive(minutesRemaining) {
    try {
      // Set active icon
      await chrome.action.setIcon(this.ACTIVE_ICON);
      
      // Set badge text with minutes remaining
      await chrome.action.setBadgeText({ text: `${minutesRemaining}m` });
      
      // Set badge background color
      await chrome.action.setBadgeBackgroundColor({ color: this.ACTIVE_COLOR });
      
      return true;
    } catch (error) {
      console.error('Error updating badge:', error);
      return false;
    }
  }
  
  async updateRemainingTime(minutesRemaining) {
    try {
      // Update badge text with minutes remaining
      await chrome.action.setBadgeText({ text: `${minutesRemaining}m` });
      return true;
    } catch (error) {
      console.error('Error updating badge time:', error);
      return false;
    }
  }
  
  async clearBadge() {
    try {
      // Reset icon to default
      await chrome.action.setIcon(this.DEFAULT_ICON);
      
      // Clear badge text
      await chrome.action.setBadgeText({ text: "" });
      
      return true;
    } catch (error) {
      console.error('Error clearing badge:', error);
      return false;
    }
  }
}

// Export for both CommonJS (tests) and ES modules (Chrome)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BadgeController };
}

export { BadgeController };
