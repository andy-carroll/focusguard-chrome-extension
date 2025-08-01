// Tests for Focus Sprint feature components
const { StorageService } = require('../js/storage-service.js');
const { BadgeController } = require('../js/badge-controller.js');
const { SprintManager } = require('../js/sprint-manager.js');

// Mock Chrome Extension APIs
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn()
    },
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn()
    }
  },
  action: {
    setIcon: jest.fn(),
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn()
  },
  alarms: {
    create: jest.fn(),
    clear: jest.fn(),
    clearAll: jest.fn()
  },
  runtime: {
    sendMessage: jest.fn()
  },
  notifications: {
    create: jest.fn()
  }
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('StorageService', () => {
  let storageService;

  beforeEach(() => {
    storageService = new StorageService();
  });

  test('should save sprint data to local storage', async () => {
    const sprintData = { duration: 25, goal: 'Test goal' };
    await storageService.saveSprintData(sprintData);
    
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      'sprintData': sprintData
    });
  });

  test('should retrieve sprint data from local storage', async () => {
    const mockData = { sprintData: { duration: 25, goal: 'Test goal' } };
    chrome.storage.local.get.mockResolvedValue(mockData);
    
    const result = await storageService.getSprintData();
    
    expect(chrome.storage.local.get).toHaveBeenCalledWith(['sprintData']);
    expect(result).toEqual(mockData.sprintData);
  });

  test('should clear sprint data from local storage', async () => {
    await storageService.clearSprintData();
    
    expect(chrome.storage.local.remove).toHaveBeenCalledWith(['sprintData']);
  });

  test('should save sprint state to sync storage', async () => {
    const sprintState = { isActive: true, startTime: Date.now(), endTime: Date.now() + 1500000 };
    await storageService.saveSprintState(sprintState);
    
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({
      'sprintState': sprintState
    });
  });

  test('should retrieve sprint state from sync storage', async () => {
    const mockState = { sprintState: { isActive: true, startTime: 1000, endTime: 2000 } };
    chrome.storage.sync.get.mockResolvedValue(mockState);
    
    const result = await storageService.getSprintState();
    
    expect(chrome.storage.sync.get).toHaveBeenCalledWith(['sprintState']);
    expect(result).toEqual(mockState.sprintState);
  });

  test('should clear sprint state from sync storage', async () => {
    await storageService.clearSprintState();
    
    expect(chrome.storage.sync.remove).toHaveBeenCalledWith(['sprintState']);
  });
});

describe('BadgeController', () => {
  let badgeController;

  beforeEach(() => {
    badgeController = new BadgeController();
  });

  test('should set active sprint badge with minutes remaining', async () => {
    await badgeController.setSprintActive(25);
    
    expect(chrome.action.setIcon).toHaveBeenCalledWith({
      path: {
        16: "/icons/icon16-active.png",
        48: "/icons/icon48-active.png",
        128: "/icons/icon128-active.png"
      }
    });
    
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '25m' });
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ color: expect.any(String) });
  });

  test('should update badge with remaining time', async () => {
    await badgeController.updateRemainingTime(10);
    
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '10m' });
  });

  test('should clear badge and reset icon', async () => {
    await badgeController.clearBadge();
    
    expect(chrome.action.setIcon).toHaveBeenCalledWith({
      path: {
        16: "/icons/icon16.png",
        48: "/icons/icon48.png",
        128: "/icons/icon128.png"
      }
    });
    
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: "" });
  });
});

describe('SprintManager', () => {
  let sprintManager;
  let storageService;
  let badgeController;

  beforeEach(() => {
    storageService = new StorageService();
    badgeController = new BadgeController();
    sprintManager = new SprintManager(storageService, badgeController);
    
    // Mock the storage service methods
    jest.spyOn(storageService, 'saveSprintData').mockResolvedValue(true);
    jest.spyOn(storageService, 'getSprintData').mockResolvedValue(null);
    jest.spyOn(storageService, 'clearSprintData').mockResolvedValue(true);
    jest.spyOn(storageService, 'saveSprintState').mockResolvedValue(true);
    jest.spyOn(storageService, 'getSprintState').mockResolvedValue(null);
    jest.spyOn(storageService, 'clearSprintState').mockResolvedValue(true);
    
    // Mock the badge controller methods
    jest.spyOn(badgeController, 'setSprintActive').mockResolvedValue(true);
    jest.spyOn(badgeController, 'updateRemainingTime').mockResolvedValue(true);
    jest.spyOn(badgeController, 'clearBadge').mockResolvedValue(true);
  });

  test('should initialize with no active sprint', async () => {
    await sprintManager.initialize();
    
    expect(storageService.getSprintState).toHaveBeenCalled();
    expect(badgeController.clearBadge).toHaveBeenCalled();
  });

  test('should start a new sprint', async () => {
    const duration = 25;
    const goal = 'Test goal';
    const successCriteria = 'Test success';
    
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);
    
    await sprintManager.startSprint(duration, goal, successCriteria);
    
    // Check that sprint data was saved
    expect(storageService.saveSprintData).toHaveBeenCalledWith({
      duration,
      goal,
      successCriteria,
      startTime: now
    });
    
    // Check that sprint state was saved
    expect(storageService.saveSprintState).toHaveBeenCalledWith({
      isActive: true,
      startTime: now,
      endTime: now + (duration * 60 * 1000),
      goal,
      successCriteria
    });
    
    // Check that badge was updated
    expect(badgeController.setSprintActive).toHaveBeenCalledWith(duration);
    
    // Check that alarms were created
    expect(chrome.alarms.create).toHaveBeenCalledTimes(2);
    expect(chrome.alarms.create).toHaveBeenCalledWith('sprintTimer', {
      delayInMinutes: duration
    });
    expect(chrome.alarms.create).toHaveBeenCalledWith('sprintTick', {
      periodInMinutes: 1
    });
  });

  test('should cancel an active sprint', async () => {
    await sprintManager.cancelSprint();
    
    // Check that sprint state was cleared
    expect(storageService.clearSprintState).toHaveBeenCalled();
    
    // Check that badge was cleared
    expect(badgeController.clearBadge).toHaveBeenCalled();
    
    // Check that alarms were cleared
    expect(chrome.alarms.clear).toHaveBeenCalledWith('sprintTimer');
    expect(chrome.alarms.clear).toHaveBeenCalledWith('sprintTick');
  });

  test('should complete a sprint', async () => {
    // Mock an active sprint
    const sprintState = {
      isActive: true,
      startTime: Date.now() - 1500000, // 25 minutes ago
      endTime: Date.now(),
      goal: 'Test goal'
    };
    storageService.getSprintState.mockResolvedValue(sprintState);
    
    await sprintManager.completeSprint();
    
    // Check that sprint state was cleared
    expect(storageService.clearSprintState).toHaveBeenCalled();
    
    // Check that badge was cleared
    expect(badgeController.clearBadge).toHaveBeenCalled();
    
    // Check that alarms were cleared
    expect(chrome.alarms.clear).toHaveBeenCalledWith('sprintTimer');
    expect(chrome.alarms.clear).toHaveBeenCalledWith('sprintTick');
  });

  test('should update sprint timer', async () => {
    // Mock an active sprint with 10 minutes remaining
    const now = Date.now();
    const sprintState = {
      isActive: true,
      startTime: now - 900000, // 15 minutes ago
      endTime: now + 600000, // 10 minutes from now
      goal: 'Test goal'
    };
    storageService.getSprintState.mockResolvedValue(sprintState);
    
    jest.spyOn(Date, 'now').mockReturnValue(now);
    
    await sprintManager.updateSprintTimer();
    
    // Check that badge was updated with remaining minutes
    expect(badgeController.updateRemainingTime).toHaveBeenCalledWith(10);
  });

  test('should get current sprint state', async () => {
    const sprintState = {
      isActive: true,
      startTime: 1000,
      endTime: 2000,
      goal: 'Test goal'
    };
    storageService.getSprintState.mockResolvedValue(sprintState);
    
    const result = await sprintManager.getSprintState();
    
    expect(result).toEqual(sprintState);
  });
});
