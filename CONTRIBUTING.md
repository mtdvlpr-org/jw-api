# Contributing to JW API

Thank you for your interest in contributing to the JW API project! This document provides guidelines and instructions for setting up your development environment and contributing effectively.

## Prerequisites

- **Node.js**: >=22.18.0
- **pnpm**: >=10.26.2 (This project uses pnpm for package management)
- **Git**

## Getting Started

1. **Clone the repository**:

    ```bash
    git clone https://github.com/mtdvlpr-org/jw-api.git
    cd jw-api
    ```

2. **Install dependencies**:

    ```bash
    pnpm install
    ```

3. **Set up Husky (Git hooks)**:

    ```bash
    pnpm prepare:husky
    ```

## Development Workflow

### Start the Development Server

To start the Nuxt development server with hot-reload:

```bash
pnpm dev
```

The server will be available at `http://localhost:3000`.

### Linting and Formatting

We use ESLint and Prettier to maintain code quality.

- **Lint code**: `pnpm lint`
- **Fix lint errors**: `pnpm lint:fix`
- **Type check**: `pnpm lint:types`

### Testing

We use Vitest for testing. The project has a split testing configuration:

- **Run all tests**: `pnpm test`
- **Run unit tests (Node/Browser)**: `pnpm test:unit` (Fast, for logic/utils)
- **Run integration tests (Nuxt)**: `pnpm test:nuxt` (Slower, for full Nuxt context)
- **Run E2E tests**: `pnpm test:e2e`

## Coding Standards

Please review the `.cursorrules` file in the root directory for detailed coding standards. Key points include:

- **TypeScript**: strictly typed code.
- **Functional Programming**: prefer functions/composables over classes.
- **Vue 3**: Use Composition API (`<script setup lang="ts">`).
- **Nuxt 4**: Leverage auto-imports appropriately.

## Commit Messages

We follow the **Conventional Commits** specification. Commit messages are linted using `commitlint`.

Format: `type(scope): subject`

Examples:

- `feat(api): add new endpoint for daily text`
- `fix(wol): parse yeartext correctly`
- `chore(deps): update nuxt`
- `docs: update readme`

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`.

## Project Structure

- `app/`: Vue application source (pages, layouts, components).
- `server/`: Server-side logic.
  - `server/api/`: API route handlers.
  - `server/utils/`: Server-side utilities.
  - `server/repository/`: Data access layer.
  - `server/mcp/`: Model Context Protocol implementation.
- `test/`: Test files (unit, nuxt, e2e).
- `shared/`: Shared types and utilities.

## Pull Requests

1. Create a new branch for your feature or fix.
2. Ensure all tests pass (`pnpm test`).
3. Ensure code is linted (`pnpm lint`).
4. Submit a Pull Request with a clear description of changes.

Happy Coding!
