# FocusGuard: Website Blocker for Chrome

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/andy-carroll/focusguard-chrome-extension/actions/workflows/test.yml/badge.svg)](https://github.com/andy-carroll/focusguard-chrome-extension/actions)
[![CI](https://github.com/andy-carroll/focusguard-chrome-extension/actions/workflows/test.yml/badge.svg)](https://github.com/andy-carroll/focusguard-chrome-extension/actions/workflows/test.yml)

**A simple, powerful, and private way to block distracting websites and reclaim your focus.**

FocusGuard helps you create a distraction-free online environment so you can get more done. It's built to be lightweight, easy to use, and completely private.

<!-- You can replace this with a real screenshot or GIF later -->
<!-- ![FocusGuard Screenshot](link-to-your-screenshot.png) -->

## ✨ Key Features

* **Effortless Site Blocking**: Quickly add or remove any website from your blocklist.
* **Block Multiple Sites at Once**: Paste a list of sites separated by commas, spaces, or new lines.
* **Clean & Minimalist UI**: An intuitive interface that gets out of your way.
* **Dark Mode Ready**: Easy on the eyes for those late-night work sessions.
* **100% Private**: We never track your activity or collect your data.

## 🚀 Installation

The easiest way to install FocusGuard is from the Chrome Web Store:

**[➡️ Get FocusGuard from the Chrome Web Store](https://chrome.google.com/webstore/category/extensions)**
*(Note: Link will be updated once the extension is live)*

### Manual Installation (for Developers)

1. Clone this repository: `git clone https://github.com/andy-carroll/focusguard-chrome-extension.git`
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable "Developer mode" in the top-right corner.
4. Click "Load unpacked" and select the cloned repository folder.

### Development & Testing

If you want to contribute to the development, you'll need to install the development dependencies and run the tests.

1. **Install Dependencies**: After cloning the repository, navigate to the project folder in your terminal and run:

   ```bash
   npm install
   ```

2. **Running Tests**: To run the automated test suite, use the following command:

   ```bash
   npm test
   ```

## 🔒 Privacy First

Your privacy is a core feature.

* The extension **does not** collect any personal information or browsing data.
* Your blocklist is stored locally on your computer and is never sent to any server.
* There are no analytics, trackers, or third-party scripts.

You can read our full [Privacy Policy](PRIVACY_POLICY.md) for more details.

## 🧪 Automated Testing & Code Quality

FocusGuard maintains a comprehensive automated/unit testing setup to ensure reliability and safe evolution of the codebase.

* **Framework:** Jest (with jsdom for browser-like environments)
* **Test Coverage:**
  * Core logic (blocking rule generation, URL formatting, HTML escaping)
  * Chrome Extension API integration (mocked)
  * Edge cases and regression prevention
* **How to Run:**

  ```bash
  npm test
  ```

* **Best Practices:**
  * All pure logic is unit tested
  * Side-effect logic is covered via mocks
  * Mocks are reset between tests for isolation
  * New features must be accompanied by relevant tests

> **Maintaining a strong automated testing discipline is a crucial aspect of FocusGuard.** As the project grows, all contributors are expected to uphold and extend this standard.

## 🤝 How to Contribute

We welcome contributions of all kinds! Whether you're a developer, a designer, or just an enthusiastic user, you can help make FocusGuard better.

* **Report a Bug**: Found something that's not working right? [Open an issue](https://github.com/andy-carroll/focusguard-chrome-extension/issues).
* **Suggest a Feature**: Have a great idea? [Let us know](https://github.com/andy-carroll/focusguard-chrome-extension/issues).
* **Write Code**: Want to fix a bug or add a feature? Fork the repository and submit a pull request.

## 👥 Contributing

We welcome contributions from the community! Before you start, please read our [Contribution Guidelines](CONTRIBUTING.md) and [Security Policy](SECURITY.md).

### Quick Start for Contributors

1. Fork the repository
2. Set up [signed commits](SECURITY.md#signed-commits)
3. Create a feature branch (`git checkout -b feature/amazing-feature`)
4. Commit your changes (`git commit -S -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

All commits must be signed with a verified signature. See our [Security Policy](SECURITY.md) for setup instructions.

## 🔒 Security

Security is a top priority. Please report any security vulnerabilities to [security@example.com](mailto:security@example.com). For more information, see our [Security Policy](SECURITY.md).

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
