# Contributing to FocusGuard

Thank you for your interest in contributing to FocusGuard! We appreciate your time and effort. Before you get started, please take a moment to review these guidelines.

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Bugs

1. Check if the issue has already been reported in the [Issues](https://github.com/andy-carroll/focusguard-chrome-extension/issues) section.
2. If not, create a new issue with a clear title and description.
3. Include steps to reproduce the issue and any relevant error messages.

### Suggesting Enhancements

1. Check the [ROADMAP.md](ROADMAP.md) to see if your suggestion is already planned.
2. Open an issue to discuss your idea before writing code.
3. Be prepared to explain why this enhancement would be valuable to FocusGuard users.

### Making Code Changes

1. Fork the repository and create a new branch for your changes.
2. Ensure your code follows the project's style and includes appropriate tests.
3. Update the documentation as needed.
4. Submit a pull request with a clear description of your changes.

## Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/focusguard-chrome-extension.git
   cd focusguard-chrome-extension
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the extension:

   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` directory

## Code Style

- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Write tests for new features and bug fixes

## Pull Request Process

1. Ensure all tests pass (`npm test`)
2. Update the documentation as needed
3. Include relevant tests
4. Ensure your code is properly signed (see below)
5. Request review from the maintainers

## Security

### Signed Commits

All commits to this repository must be signed with a verified signature. This helps ensure the integrity of the codebase and verifies that commits come from trusted sources.

#### Setting Up Signed Commits

1. If you don't already have a GPG key, generate one:

   ```bash
   gpg --full-generate-key
   ```

   (Use RSA & RSA, 4096 bits, and your GitHub-verified email address)

2. Add your GPG key to GitHub:

   - List your GPG keys: `gpg --list-secret-keys --keyid-format=long`
   - Export your public key: `gpg --armor --export YOUR_KEY_ID`
   - Add the key to your GitHub account under Settings > SSH and GPG keys

3. Configure Git to use your GPG key:

   ```bash
   git config --global user.signingkey YOUR_KEY_ID
   git config --global commit.gpgsign true
   ```

4. When making commits, ensure they're signed:

   ```bash
   git commit -S -m "Your commit message"
   ```

### Reporting Security Issues

Please report security vulnerabilities privately to [security@example.com](mailto:security@example.com). Do not open a public issue for security-related concerns.

### Branch Protection

The `main` branch is protected with the following rules:

- All commits must be signed with a verified signature
- Pull requests require at least one approval before merging
- Branches must be up to date with the base branch before merging
- All status checks must pass before merging

### Security Best Practices

- Never commit sensitive information (API keys, passwords, etc.)
- Keep your GPG key secure
- Use strong, unique passwords
- Enable two-factor authentication on GitHub

## License

By contributing, you agree that your contributions will be licensed under the project's [LICENSE](LICENSE) file.

## Getting Help

If you have questions, please open an issue or discussion in the repository.
