# Project Context

You are working on a **Nuxt 4** application powered by **Vue 3**, **TypeScript**, and **Vite**. The project extensively uses server-side logic (`server/`), Nuxt modules, and integration with external APIs.

## Tech Stack

- **Framework**: Nuxt 4.2+ (Vue 3.5+)
- **Language**: TypeScript 5.x
- **Testing**: Vitest 3.x (with `@nuxt/test-utils`)
- **Linting**: ESLint (Nuxt preset)
- **Package Manager**: pnpm

---

## Coding Standards & Style

### General

- **TypeScript Only**: All code must be written in TypeScript.
- **Functional Programming**: Prefer functional and declarative patterns over object-oriented classes.
- **DRY Principle**: Modularize logic into re-usable functions or composables.
- **File Naming**:
  - Components: `PascalCase.vue` (e.g., `MyComponent.vue`)
  - Composables: `camelCase.ts` (e.g., `useAuth.ts`)
  - Utils/Server: `kebab-case.ts` (e.g., `date-utils.ts`)

### Vue 3 Best Practices

- **Composition API**: ALWAYS use `<script setup lang="ts">`. Do not use the Options API.
- **Reactivity**:
  - Use `ref` for primitives and simple objects.
  - Use `computed` for derived state.
  - Avoid `watch` when `computed` can suffice.
- **Props & Emits**:
  - Use `defineProps<Props>()` and `defineEmits<Emits>()` with generic type arguments for full type inference.
  - Avoid runtime prop validation arrays; use TypeScript interfaces.
- **Composables**: Encapsulate reusable logic in `composables/` directory using the `usePrefix` naming convention.

### Nuxt 4 Best Practices

- **Auto-Imports**: Leverage Nuxt's auto-import system for composables, utils, and Vue APIs. Do not manually import `ref`, `computed`, `useRoute`, etc., inside `.vue` files or Nuxt context.
- **Data Fetching**:
  - Use `useFetch` for data fetching in components (SSR-friendly).
  - Use `$fetch` for client-side interactions (e.g., form submissions).
  - Use `useAsyncData` for complex fetch logic or parallel execution.
- **State Management**: Use `useState` for simple shared state across components/SSR. Use Pinia only if complex global state management is required.
- **Server Routes**:
  - Place API routes in `server/api`.
  - Return JSON directly; Nuxt handles serialization.
  - Use `zod` for request validation.
- **Configuration**: Use `useRuntimeConfig()` to access environment variables. DO NOT access `process.env` directly in application code.

### Vitest & Testing Best Practices

This project uses a split testing configuration in `vitest.config.ts`:

1. **Unit Tests (Server/Shared)**: Run in `node` environment. FAST.
2. **Unit Tests (Browser)**: Run in `happy-dom`. FAST.
3. **Nuxt Integration Tests**: Run in `nuxt` environment. SLOWER but full context.

### Guidelines

- **Unit Testing**: Prefer testing pure functions (utils, logic) in the `node` environment without Nuxt context for speed.
- **Mocking**: Use `vi.mock()` sparingly. Prefer dependency injection or functional composition.
- **Snapshot Testing**: Use snapshots for large output structures or generated content, but verify them carefully.

---

## Auto-Imports Explanation

Nuxt automatically imports helper functions, composables, and Vue APIs to streamline development.

### How it works

1. **Scanning**: Nuxt scans specific directories (`components/`, `composables/`, `utils/`, `server/utils/`, `shared/types/`) at startup.
2. **Generation**: It generates a `.nuxt/types/imports.d.ts` file that declares these functions globally for TypeScript.
3. **Transpilation**: During build/dev, unplugin-auto-import injects the actual imports into your code where they are used.

### Shared Types

Types in `shared/types/` are auto-imported throughout the project. **Do NOT explicitly import them** in server utils, API routes, or components. They are globally available.

### Auto-Imports in Vitest

**1. `environment: 'nuxt'` (Integration Tests)**

- **Behavior**: Auto-imports work exactly as they do in the application.
- **Usage**: You can use `ref`, `useFetch`, or your custom composables directly without importing them.
- **Setup**: Requires `@nuxt/test-utils` and the `defineVitestProject` wrapper (see `vitest.config.ts`).

**2. `environment: 'node'` or `'happy-dom'` (Unit Tests)**

- **Behavior**: **Auto-imports DO NOT work by default.**
- **Reason**: These environments run pure Vitest without the Nuxt build pipeline to inject imports.
- **Solution**: You MUST manually import dependencies in these tests.

  ```ts
  // Correct in unit test
  import { ref, computed } from 'vue'
  import { myUtil } from '../../server/utils/my-util'

  test('my logic', () => { ... })
  ```

- **Note**: If testing a file that *relies* on auto-imports (e.g., a composable calling `useRouter`), you may need to mock those globals or switch to the `nuxt` environment.

### Conflict Resolution

If a local variable shares a name with an auto-import (e.g., `const router = ...`), the local variable takes precedence. Avoid shadowing global names.
