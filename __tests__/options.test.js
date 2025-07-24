const { formatUrl } = require('../options.js');

describe('formatUrl', () => {
  test('should add protocol and wildcards to a simple domain', () => {
    expect(formatUrl('google.com')).toBe('*://google.com/*');
  });

  test('should handle domains with www', () => {
    expect(formatUrl('www.facebook.com')).toBe('*://www.facebook.com/*');
  });

  test('should extract hostname from a full https URL', () => {
    expect(formatUrl('https://twitter.com/home')).toBe('*://twitter.com/*');
  });

  test('should extract hostname from a full http URL', () => {
    expect(formatUrl('http://example.org/some/path')).toBe('*://example.org/*');
  });

  test('should return an existing wildcard URL as-is', () => {
    expect(formatUrl('*://youtube.com/*')).toBe('*://youtube.com/*');
  });

  test('should handle subdomains correctly', () => {
    expect(formatUrl('news.ycombinator.com')).toBe('*://news.ycombinator.com/*');
  });

  test('should return invalid URL strings as-is', () => {
    expect(formatUrl('not a valid url')).toBe('not a valid url');
  });

  test('should handle an empty string by returning it', () => {
    expect(formatUrl('')).toBe('');
  });
});
