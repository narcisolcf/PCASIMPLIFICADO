# GitHub Workflow & Procedures

This document outlines the standard procedures for managing the `PCASIMPLIFICADO` repository on GitHub.

## 1. Branching Strategy

We follow a simplified **Git Flow**:

- `main`: Production-ready code. Protected branch.
- `develop`: Integration branch for features. Default branch for PRs.
- `feature/name-of-feature`: Temporary branches for new features.
- `fix/name-of-fix`: Temporary branches for bug fixes.
- `chore/name-of-chore`: Maintenance tasks.

### Naming Convention

- Use lowercase and hyphens: `feature/user-auth`, `fix/login-error`.

## 2. Commit Messages

We follow **Conventional Commits** specification:

```text
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

### Example

```text
feat(auth): implement supabase login with google

Added Google definition to Supabase auth provider list.
Updated login component to show "Login with Google" button.

Closes #123
```

## 3. Pull Request (PR) Process

1. **Create a PR**: Open a PR from your feature branch to `develop`.
2. **Title**: Use the Conventional Commit format for the title.
3. **Description**:
    - Summary of changes.
    - Screenshot/Video (if UI change).
    - Related Issue linked.
4. **Review**: At least one approval required.
5. **Merge**: Squash and merge is preferred to keep history clean.

## 4. CI/CD Pipeline (Planned)

- **Build**: Runs `npm run build` on every PR.
- **Lint**: Runs `npm run lint` on every PR.
- **Test**: Runs `npm test` on every PR.
