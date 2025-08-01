// FocusGuard - UI Controller
// Handles the popup UI updates for Focus Sprint feature

class UiController {
  constructor(sprintManager) {
    this.sprintManager = sprintManager;
    this.timerInterval = null;
  }
  
  // Initialize UI elements
  initializeUi() {
    // Get current sprint state
    const { isActive, sprintData } = this.sprintManager.getSprintState();
    
    if (isActive && sprintData) {
      this.showActiveSprintState(sprintData);
    } else {
      this.showSetupState();
    }
  }
  
  // Show the sprint setup UI (when no sprint is active)
  showSetupState() {
    const sprintSection = document.getElementById('focus-sprint-section');
    if (!sprintSection) return;
    
    // Clear any existing timer interval
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    
    // Update UI to show sprint setup form
    sprintSection.innerHTML = `
      <h2>Focus Sprint</h2>
      <div class="sprint-form">
        <div class="form-group">
          <label for="sprint-duration">Duration (minutes)</label>
          <div class="duration-buttons">
            <button class="duration-btn" data-duration="25">25</button>
            <button class="duration-btn" data-duration="45">45</button>
            <button class="duration-btn" data-duration="60">60</button>
          </div>
          <input type="number" id="sprint-duration" min="1" max="180" value="25">
        </div>
        <div class="form-group">
          <label for="sprint-goal">What are you going to get done?</label>
          <input type="text" id="sprint-goal" placeholder="e.g. Draft Q3 report outline">
        </div>
        <div class="form-group">
          <label for="sprint-success">What will success look like?</label>
          <input type="text" id="sprint-success" placeholder="e.g. Outline completed and sent to manager">
        </div>
        <button id="start-sprint-btn" class="btn-primary btn-large">Start Focus Sprint</button>
      </div>
    `;
    
    // Add event listeners
    this.addSetupEventListeners();
  }
  
  // Add event listeners for the setup state
  addSetupEventListeners() {
    // Duration quick select buttons
    const durationBtns = document.querySelectorAll('.duration-btn');
    durationBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const duration = btn.getAttribute('data-duration');
        document.getElementById('sprint-duration').value = duration;
        
        // Highlight selected button
        durationBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
    
    // Start sprint button
    const startBtn = document.getElementById('start-sprint-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const duration = parseInt(document.getElementById('sprint-duration').value, 10);
        const goal = document.getElementById('sprint-goal').value;
        const successCriteria = document.getElementById('sprint-success').value;
        
        // Validate duration
        if (!duration || duration < 1 || duration > 180) {
          alert('Please enter a valid duration between 1 and 180 minutes');
          return;
        }
        
        // Start the sprint
        this.sprintManager.startSprint(duration, goal, successCriteria)
          .then(sprintData => {
            this.showActiveSprintState(sprintData);
          })
          .catch(error => {
            console.error('Error starting sprint:', error);
            alert('Could not start sprint: ' + error.message);
          });
      });
    }
  }
  
  // Show the active sprint UI
  showActiveSprintState(sprintData) {
    const sprintSection = document.getElementById('focus-sprint-section');
    if (!sprintSection) return;
    
    // Calculate remaining time
    const remainingMs = this.sprintManager.getRemainingTime();
    const { minutes, seconds } = this.formatTime(remainingMs);
    
    // Update UI to show active sprint
    sprintSection.innerHTML = `
      <h2>Focus Sprint Active</h2>
      <div class="active-sprint">
        <div class="timer-display">
          <div class="timer">${minutes}:${seconds}</div>
          <div class="timer-progress">
            <div class="progress-ring">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle class="progress-ring-circle-bg" cx="60" cy="60" r="54" />
                <circle class="progress-ring-circle" cx="60" cy="60" r="54" />
              </svg>
            </div>
          </div>
        </div>
        ${sprintData.goal ? `<div class="sprint-goal"><strong>Goal:</strong> ${sprintData.goal}</div>` : ''}
        ${sprintData.successCriteria ? `<div class="sprint-success"><strong>Success:</strong> ${sprintData.successCriteria}</div>` : ''}
        <button id="cancel-sprint-btn" class="btn-secondary">Cancel Sprint</button>
      </div>
    `;
    
    // Update progress ring
    this.updateProgressRing(sprintData, remainingMs);
    
    // Start timer interval
    this.startTimerInterval(sprintData);
    
    // Add event listener for cancel button
    const cancelBtn = document.getElementById('cancel-sprint-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel this Focus Sprint?')) {
          this.sprintManager.cancelSprint()
            .then(() => {
              this.showSetupState();
            })
            .catch(error => {
              console.error('Error cancelling sprint:', error);
            });
        }
      });
    }
  }
  
  // Show the sprint completion UI
  showCompletionState(sprintData) {
    const sprintSection = document.getElementById('focus-sprint-section');
    if (!sprintSection) return;
    
    // Clear any existing timer interval
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    
    // Update UI to show completion state
    sprintSection.innerHTML = `
      <h2>Sprint Complete!</h2>
      <div class="sprint-complete">
        <div class="completion-message">
          <div class="completion-icon">🎉</div>
          <div class="completion-text">Time's up! How did it go?</div>
        </div>
        ${sprintData.goal ? `<div class="sprint-goal"><strong>Goal:</strong> ${sprintData.goal}</div>` : ''}
        ${sprintData.successCriteria ? `<div class="sprint-success"><strong>Success:</strong> ${sprintData.successCriteria}</div>` : ''}
        <div class="sprint-duration"><strong>Duration:</strong> ${sprintData.duration} minutes</div>
        <button id="new-sprint-btn" class="btn-primary btn-large">Start New Sprint</button>
      </div>
    `;
    
    // Add event listener for new sprint button
    const newSprintBtn = document.getElementById('new-sprint-btn');
    if (newSprintBtn) {
      newSprintBtn.addEventListener('click', () => {
        this.showSetupState();
      });
    }
  }
  
  // Start the timer interval to update the countdown
  startTimerInterval(sprintData) {
    // Clear any existing interval
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    // Update timer every second
    this.timerInterval = setInterval(() => {
      const remainingMs = this.sprintManager.getRemainingTime();
      
      if (remainingMs <= 0) {
        // Sprint has ended
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.showCompletionState(sprintData);
        return;
      }
      
      // Update timer display
      const { minutes, seconds } = this.formatTime(remainingMs);
      const timerElement = document.querySelector('.timer');
      if (timerElement) {
        timerElement.textContent = `${minutes}:${seconds}`;
      }
      
      // Update progress ring
      this.updateProgressRing(sprintData, remainingMs);
    }, 1000);
  }
  
  // Update the circular progress indicator
  updateProgressRing(sprintData, remainingMs) {
    const totalMs = sprintData.duration * 60 * 1000;
    const elapsedMs = totalMs - remainingMs;
    const progressPercent = (elapsedMs / totalMs) * 100;
    
    const circle = document.querySelector('.progress-ring-circle');
    if (circle) {
      const radius = circle.r.baseVal.value;
      const circumference = radius * 2 * Math.PI;
      
      circle.style.strokeDasharray = `${circumference} ${circumference}`;
      const offset = circumference - (progressPercent / 100) * circumference;
      circle.style.strokeDashoffset = offset;
    }
  }
  
  // Format milliseconds to minutes and seconds
  formatTime(milliseconds) {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return { minutes, seconds };
  }
}

// Export for both CommonJS (tests) and ES modules (Chrome)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UiController };
}

export { UiController };
