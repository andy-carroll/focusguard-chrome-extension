# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Please report security vulnerabilities by email to <security@example.com>.

## Signed Commits

All commits to this repository must be signed with a verified signature. This helps ensure the integrity of the codebase.

### Setting Up Signed Commits

1. Generate a GPG key if you don't have one:

   ```bash
   gpg --full-generate-key
   ```

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

## Security Best Practices

- Never commit sensitive information (API keys, passwords, etc.)
- Keep your GPG key secure
- Use strong, unique passwords
- Enable two-factor authentication on GitHub
