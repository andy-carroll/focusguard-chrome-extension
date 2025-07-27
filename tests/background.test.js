const { generateRules, updateBlockingRules } = require('../background.js');

// Mock the Chrome Extension APIs
global.chrome = {
  runtime: {
    getURL: (path) => `chrome-extension://mock-id/${path}`,
  },
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
  declarativeNetRequest: {
    updateDynamicRules: jest.fn(),
  },
};

describe('generateRules', () => {

  test('should return an empty array for empty input', () => {
    expect(generateRules([])).toEqual([]);
  });

  test('should create rules for a simple domain', () => {
    const sites = ['*://example.com/*'];
    const rules = generateRules(sites);
    expect(rules).toHaveLength(2); // Original and www version
    expect(rules[0].condition.urlFilter).toBe('*://example.com/*');
    expect(rules[1].condition.urlFilter).toBe('*://www.example.com/*');
  });

  test('should handle www domains correctly', () => {
    const sites = ['*://www.example.com/*'];
    const rules = generateRules(sites);
    expect(rules).toHaveLength(2); // Original and non-www
    expect(rules[0].condition.urlFilter).toBe('*://www.example.com/*');
    expect(rules[1].condition.urlFilter).toBe('*://example.com/*');
  });

  test('should handle non-wildcard patterns', () => {
    const sites = ['google.com'];
    const rules = generateRules(sites);
    expect(rules).toHaveLength(1);
    expect(rules[0].condition.urlFilter).toBe('google.com');
  });

  test('should generate correct redirect URLs', () => {
    const sites = ['*://test.com/*'];
    const rules = generateRules(sites);
    // The redirect URL is now set by the real API call, so our pure function just has the placeholder
    expect(rules[0].action.redirect.url).toBe('blocked.html');
    expect(rules[1].action.redirect.url).toBe('blocked.html');
  });
});

describe('updateBlockingRules', () => {
  beforeEach(() => {
    // Clear all mocks before each test to ensure test isolation
    chrome.storage.sync.get.mockClear();
    chrome.declarativeNetRequest.updateDynamicRules.mockClear();
  });

  test('should remove all rules when extension is disabled', async () => {
    // Arrange: Mock storage to return isEnabled: false
    chrome.storage.sync.get.mockResolvedValue({ isEnabled: false, blockedSites: ['*://example.com/*'] });

    // Act
    await updateBlockingRules();

    // Assert: Check that we remove the rules
    expect(chrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith({
      removeRuleIds: [1]
    });
  });

  test('should remove all rules when there are no blocked sites', async () => {
    // Arrange: Mock storage to return an empty sites list
    chrome.storage.sync.get.mockResolvedValue({ isEnabled: true, blockedSites: [] });

    // Act
    await updateBlockingRules();

    // Assert
    expect(chrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith({
      removeRuleIds: [1]
    });
  });

  test('should add new rules when enabled with sites', async () => {
    // Arrange
    const sites = ['*://youtube.com/*'];
    chrome.storage.sync.get.mockResolvedValue({ isEnabled: true, blockedSites: sites });
    
    // We need to know what generateRules will return to check the call
    const expectedRules = generateRules(sites);
    // Manually update the URL in our expected rules to match what the function does internally
    const blockedPageUrl = chrome.runtime.getURL('blocked.html');
    expectedRules.forEach(rule => {
      rule.action.redirect.url = blockedPageUrl;
    });

    // Act
    await updateBlockingRules();

    // Assert
    expect(chrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith({
      removeRuleIds: expect.any(Array), // We just care that it tries to remove old rules
      addRules: expectedRules
    });
  });
});
