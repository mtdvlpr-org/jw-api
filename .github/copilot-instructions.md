# JW API - AI Coding Instructions

## Project Overview

This is a **Nuxt 4** API service that aggregates JW.org data from multiple sources (Mediator API, WOL, Pub Media, Bible Data). It provides both RESTful endpoints (`/api/v1/*`) and an **MCP (Model Context Protocol) server** (`/mcp`) for AI agent integration.

**Tech Stack**: Nuxt 4.2+, Vue 3, TypeScript 5.x, Vitest 3.x, pnpm
**Node**: >=22.18.0 | **pnpm**: >=10.28.0

## Architecture Patterns

### Repository-Service Pattern

Data access follows a layered architecture:

- **Repositories** ([server/repository/](../server/repository/)): External API calls, caching with `defineCachedFunction`
- **Services** ([server/utils/](../server/utils/)): Business logic, data transformation
- **API Handlers** ([server/api/v1/](../server/api/v1/)): Request validation (Zod), response formatting

Example: [server/repository/bible.ts](../server/repository/bible.ts) → [server/utils/bible.ts](../server/utils/bible.ts) → [server/api/v1/bible/\[symbol\]/\[book\]/\[chapter\]/\[verse\].get.ts](../server/api/v1/bible/%5Bsymbol%5D/%5Bbook%5D/%5Bchapter%5D/%5Bverse%5D.get.ts)

### Response Envelope Pattern

All API responses use a consistent envelope defined in [shared/types/api.d.ts](../shared/types/api.d.ts):

```typescript
// Success: { success: true, data: T, meta: ApiMeta, links?: ApiLinks }
// Error: { success: false, message: string, data: { meta: ApiMeta, details?: ApiErrorDetail[] } }
```

Use `apiSuccess()` and `apiError()` helpers from [server/utils/response.ts](../server/utils/response.ts).

### Request Context with AsyncLocalStorage

Request metadata (requestId, logger, startTime) flows through handlers via [AsyncLocalStorage](../server/utils/async-storage.ts). Wrap API handlers with `defineLoggedEventHandler()` ([server/utils/handler.ts](../server/utils/handler.ts)) to automatically:

- Generate/propagate `x-tracing-id` headers
- Inject structured logger (pino)
- Track response times

## Auto-Imports & Type System

### Nuxt Auto-Imports

Types from [shared/types/](../shared/types/) and utils from [server/utils/](../server/utils/) are **globally auto-imported**—DO NOT manually import them in:

- API routes (`server/api/**`)
- Server utils/middleware
- Vue components

### Testing Environments & Auto-Imports

Vitest uses 4 project configurations ([vitest.config.ts](../vitest.config.ts)):

1. **`server` (node)**: Fast unit tests for server utils—**auto-imports DO NOT work**. Manually import Vue APIs and utilities.
2. **`browser` (happy-dom)**: Fast tests for Vue components—**auto-imports DO NOT work**.
3. **`nuxt`**: Integration tests with full Nuxt context—auto-imports work. Slower.
4. **`e2e` (node)**: End-to-end tests.

**Unit Test Pattern**: Mock `defineCachedFunction` before imports:

```typescript
vi.hoisted(() => {
  vi.stubGlobal('defineCachedFunction', (fn: unknown) => fn)
})
```

See [test/unit/server/bible.test.ts](../test/unit/server/bible.test.ts) for examples.

## Language Codes & Schemas

JW.org uses two language identifier systems:

- **Lang Codes** (e.g., `E`, `S`, `O`): Used in Mediator API, WOL
- **Lang Symbols** (e.g., `en`, `es`, `nl`): Used in Bible Data API

Validation schemas are defined in [server/utils/schemas.ts](../server/utils/schemas.ts):

- `jwLangCodeSchema` for codes
- `jwLangSymbolSchema` for symbols
- `bibleBookNrSchema`, `bibleChapterNrSchema`, `bibleVerseNrSchema` for Bible references

Always use these schemas in API routes with Zod validation.

## MCP Server Integration

MCP tools are defined in [server/mcp/tools/](../server/mcp/tools/) using `defineMcpTool()` from `@nuxtjs/mcp-toolkit`. Each tool:

- Specifies caching TTL (`cache: '4w'`)
- Defines Zod input schemas
- Returns results via `mcpService.toolResult()` or `mcpService.toolError()`

Example: [server/mcp/tools/get-bible-verse.ts](../server/mcp/tools/get-bible-verse.ts)

## Development Workflows

### Commands

- **Dev Server**: `pnpm dev` (http://localhost:3000)
- **Tests**: `pnpm test:unit` (fast), `pnpm test:nuxt` (integration), `pnpm test:e2e`
- **Linting**: `pnpm lint:fix`, `pnpm lint:types`
- **Build**: `pnpm build`, `pnpm preview`

### OpenAPI Documentation

Auto-generated at `/_docs/swagger` and `/_docs/scalar`. Define route metadata using `defineRouteMeta()` with `openAPI` property (see [server/api/v1/wol/yeartext.get.ts](../server/api/v1/wol/yeartext.get.ts)).

### Caching Strategy

Use `defineCachedFunction` for repository methods to leverage Nitro's storage layer ([nuxt.config.ts](../nuxt.config.ts) defines SQLite DB + file-based storage). Cache keys are auto-generated from function arguments.

## Code Style

- **Composition API Only**: `<script setup lang="ts">` in Vue files
- **Functional Programming**: Prefer pure functions over classes
- **ESLint**: Uses Nuxt preset + Perfectionist (auto-sorts imports/objects)
- **File Naming**: `kebab-case.ts` for server files, `PascalCase.vue` for components
- **No Manual Imports**: Rely on auto-imports for Vue APIs, shared types, and server utils in Nuxt context

## Common Pitfalls

1. **Unit Tests**: Remember to mock `defineCachedFunction` and manually import auto-imported APIs
2. **Type Imports**: Don't import types from `shared/types/` in server code—they're global
3. **Response Formatting**: Always use `apiSuccess()`/`apiError()` for API responses
4. **Language Codes**: Use correct schema (symbol vs. code) based on target API
5. **Request Context**: Access logger/requestId via `asyncLocalStorage.getStore()`, not from event directly
