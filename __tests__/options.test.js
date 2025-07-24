const { formatUrl, escapeHtml } = require('../options.js');

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

describe('escapeHtml', () => {
  test('should return a simple string as-is', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });

  test('should escape < and > characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  test('should escape &, \", and \' characters', () => {
    expect(escapeHtml('"Fish & Chips"')).toBe('&quot;Fish &amp; Chips&quot;');
  });

  test('should handle an empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  test('should handle strings that are just numbers', () => {
    expect(escapeHtml('12345')).toBe('12345');
  });
});
