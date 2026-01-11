# API Documentation

This document describes the RESTful API endpoints, response formats, error handling, and conventions used in the JW API.

## Base URL

```bash
http://localhost:3000/api/v1
```

## Response Envelope

All API responses follow a consistent envelope pattern defined in [shared/types/api.d.ts](../../shared/types/api.d.ts).

### Success Response

```typescript
{
  "success": true,
  "data": { /* your data here */ },
  "meta": {
    "requestId": "abc123",      // Unique request ID for tracing
    "responseTime": 42,          // Response time in milliseconds
    "timestamp": "2026-01-10T12:00:00.000Z",
    "version": "v1"              // API version
  },
  "links": {                     // Optional HATEOAS links
    "self": "/api/v1/resource"
  }
}
```

### Paginated Response

For endpoints returning collections:

```typescript
{
  "success": true,
  "data": [ /* array of items */ ],
  "meta": {
    "requestId": "abc123",
    "responseTime": 42,
    "timestamp": "2026-01-10T12:00:00.000Z",
    "version": "v1",
    "pagination": {
      "page": 1,                 // Current page (1-indexed)
      "pageSize": 20,            // Items per page
      "totalItems": 100,         // Total items across all pages
      "totalPages": 5            // Total number of pages
    }
  },
  "links": {
    "self": "/api/v1/resource?page=1",
    "first": "/api/v1/resource?page=1",
    "prev": "/api/v1/resource?page=1",
    "next": "/api/v1/resource?page=2",
    "last": "/api/v1/resource?page=5"
  }
}
```

### Error Response

```typescript
{
  "statusCode": 400,
  "statusMessage": "Bad Request",
  "message": "Invalid query parameter(s)",
  "data": {
    "meta": {
      "requestId": "abc123",
      "responseTime": 10,
      "timestamp": "2026-01-10T12:00:00.000Z",
      "version": "v1"
    },
    "details": [                 // Optional validation error details
      {
        "expected": "number",
        "code": "invalid_type",
        "received": "string",
        "path": ["page"],
        "message": "Invalid input: expected number, received string",
      }
    ]
  }
}
```

## Error Codes

| Status Code | Description           | Common Causes                          |
| ----------- | --------------------- | -------------------------------------- |
| `400`       | Bad Request           | Invalid parameters, validation errors  |
| `401`       | Unauthorized          | Missing or invalid authentication      |
| `403`       | Forbidden             | Access denied to resource              |
| `404`       | Not Found             | Resource doesn't exist                 |
| `500`       | Internal Server Error | Server error, upstream service failure |

## Request Tracing

Every request is assigned a unique `requestId` that appears in:

- Response `meta.requestId` field
- Server logs
- Error responses

You can also provide your own tracing ID using the `x-tracing-id` header:

```bash
curl -H "x-tracing-id: my-custom-id" http://localhost:3000/api/v1/...
```

## Language Codes

JW.org uses two language identifier systems:

### Language Codes (JwLangCode)

Used in Mediator API, WOL, and Pub Media endpoints.

Examples: `E` (English), `S` (Spanish), `O` (Dutch)

### Language Symbols (JwLangSymbol)

Used in Bible Data API and JW Languages endpoints.

Examples: `en` (English), `es` (Spanish), `nl` (Dutch)

## API Endpoints

For a complete list of available endpoints with detailed parameters, schemas, and examples, visit the interactive API documentation:

- **Swagger UI**: <http://localhost:3000/_docs/swagger>
- **Scalar**: <http://localhost:3000/_docs/scalar>  
- **OpenAPI Spec**: <http://localhost:3000/_docs/openapi.json>

### Endpoint Categories

The API is organized into the following categories:

- **Bible** (`/api/v1/bible/*`) - Access Bible books, chapters, and verses
- **JW Languages** (`/api/v1/jw/*`) - Language codes and symbols mapping
- **Mediator** (`/api/v1/mediator/*`) - Media categories, items, and translations
- **Meeting** (`/api/v1/meeting/*`) - Meeting schedules and workbook information
- **Publication Media** (`/api/v1/pub-media/*`) - Publication files and metadata
- **WOL** (`/api/v1/wol/*`) - Watchtower Online Library resources (year texts, etc.)

## Rate Limiting & Caching

The API implements intelligent caching at multiple levels:

1. **Repository Layer**: External API calls are cached using `defineCachedFunction`
2. **Storage Layer**: SQLite database + file-based storage (`.data/` directory)
3. **Cache Duration**: Varies by endpoint (typically 24-48 hours for static content)

No explicit rate limiting is enforced, but excessive requests may be throttled by upstream services.

## CORS

CORS is enabled for all `/api/**` routes. You can make requests from any origin in development.

## Best Practices

### 1. Use Appropriate Language Identifiers

```bash
# ✅ Correct - Use language codes for Mediator/WOL
curl http://localhost:3000/api/v1/mediator/languages/E

# ✅ Correct - Use language symbols for Bible
curl http://localhost:3000/api/v1/bible/en/1/1/1
```

### 2. Handle Errors Gracefully

Always check the `success` field and handle errors appropriately:

```javascript
const response = await fetch('/api/v1/bible/en/1/1/1')
const result = await response.json()

if (!response.ok || !result.success) {
  console.error('Error:', result.message)
  if (result.data?.details) {
    console.error('Details:', result.data.details)
  }
}
```

### 3. Use Request IDs for Debugging

Include the `requestId` when reporting issues:

```javascript
console.log('Request ID:', result.meta.requestId)
```

### 4. Respect Cache Headers

The API returns appropriate cache headers. Consider implementing client-side caching for better performance.

## Examples

### Fetch a Bible Verse

```javascript
const response = await fetch('http://localhost:3000/api/v1/bible/en/1/1/1')
const result = await response.json()

console.log(result.data.parsedContent)
// "In the beginning God created the heavens and the earth."
```

### Get Meeting Information

```javascript
const response = await fetch('http://localhost:3000/api/v1/meeting?langwritten=E&date=2026-01-13')
const result = await response.json()

console.log(result.data.workbook)
console.log(result.data.schedule)
```

### Handle Validation Errors

```javascript
const response = await fetch('http://localhost:3000/api/v1/bible/invalid/1/1/1')
const result = await response.json()

if (!result.success) {
  console.error('Error:', result.message)
  // "Invalid route parameter(s)"
  
  if (result.data?.details) {
    result.data.details.forEach(error => {
      console.error(`${error.path.join('.')}: ${error.message}`)
    })
  }
}
```

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/mtdvlpr-org/jw-api).
