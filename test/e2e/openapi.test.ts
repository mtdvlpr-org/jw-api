import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

await setup({ rootDir: fileURLToPath(new URL('../../', import.meta.url)) })

type OpenApiSpec = {
  components?: {
    responses?: Record<string, unknown>
    schemas?: Record<string, unknown>
  }
  paths: Record<
    string,
    Record<
      string,
      {
        description?: string
        operationId?: string
        requestBody?:
          | { $ref: string }
          | {
              content?: Record<
                string,
                {
                  schema?: unknown
                }
              >
              description?: string
            }
        responses?: Record<
          string,
          | { $ref: string }
          | {
              content?: Record<
                string,
                {
                  schema?: unknown
                }
              >
              description?: string
            }
        >
        summary?: string
        tags?: string[]
      }
    >
  >
}

describe('openapi metadata validation', () => {
  it('should have complete openAPI metadata for all API endpoints', async () => {
    // Fetch the OpenAPI spec
    const openApiSpec = await $fetch<OpenApiSpec>('/_docs/openapi.json')
    expect(openApiSpec).toBeDefined()
    expect(openApiSpec.paths).toBeDefined()

    // Filter only /api/v1/* endpoints
    const v1Endpoints = Object.entries(openApiSpec.paths).filter(([path]) =>
      path.startsWith('/api/v1/')
    )

    expect(v1Endpoints.length).toBeGreaterThan(0)

    const errors: string[] = []

    // Validate each endpoint
    for (const [path, methods] of v1Endpoints) {
      for (const [method, spec] of Object.entries(methods)) {
        // Skip non-HTTP methods (like $ref)
        if (!['delete', 'get', 'patch', 'post', 'put'].includes(method)) {
          continue
        }

        const endpointId = `${method.toUpperCase()} ${path}`

        // Check for required fields
        if (!spec.summary) {
          errors.push(`${endpointId}: missing 'summary'`)
        }

        if (!spec.description) {
          errors.push(`${endpointId}: missing 'description'`)
        }

        if (!spec.operationId) {
          errors.push(`${endpointId}: missing 'operationId'`)
        }

        if (!spec.tags || !Array.isArray(spec.tags) || spec.tags.length === 0) {
          errors.push(`${endpointId}: missing or empty 'tags'`)
        }

        // Check for required responses
        if (!spec.responses) {
          errors.push(`${endpointId}: missing 'responses'`)
          continue
        }

        if (!spec.responses['200']) {
          errors.push(`${endpointId}: missing '200' response`)
        }

        if (!spec.responses['400']) {
          errors.push(`${endpointId}: missing '400' response`)
        }

        if (!spec.responses['404']) {
          errors.push(`${endpointId}: missing '404' response`)
        }
      }
    }

    // Report all errors if any
    if (errors.length > 0) {
      const errorMessage = [
        'OpenAPI metadata validation failed:',
        '',
        ...errors.map((e) => `  - ${e}`),
        '',
        `Total endpoints checked: ${v1Endpoints.length}`,
        `Total errors: ${errors.length}`
      ].join('\n')

      // eslint-disable-next-line vitest/no-conditional-expect
      expect.fail(errorMessage)
    }
  })

  it('should have proper response schema structure for 200 responses', async () => {
    const openApiSpec = await $fetch<OpenApiSpec>('/_docs/openapi.json')

    const v1Endpoints = Object.entries(openApiSpec.paths).filter(([path]) =>
      path.startsWith('/api/v1/')
    )

    const errors: string[] = []

    for (const [path, methods] of v1Endpoints) {
      for (const [method, spec] of Object.entries(methods)) {
        if (!['delete', 'get', 'patch', 'post', 'put'].includes(method)) {
          continue
        }

        const endpointId = `${method.toUpperCase()} ${path}`

        const response200 = spec.responses?.['200']
        if (response200) {
          const jsonContent =
            'content' in response200 ? response200.content?.['application/json'] : null
          if (!jsonContent) {
            errors.push(`${endpointId}: 200 response missing 'application/json' content`)
          } else if (!jsonContent.schema) {
            errors.push(`${endpointId}: 200 response missing schema`)
          }

          if (!('description' in response200) || !response200.description) {
            errors.push(`${endpointId}: 200 response missing description`)
          }
        }
      }
    }

    if (errors.length > 0) {
      const errorMessage = [
        'Response schema validation failed:',
        '',
        ...errors.map((e) => `  - ${e}`)
      ].join('\n')

      // eslint-disable-next-line vitest/no-conditional-expect
      expect.fail(errorMessage)
    }
  })

  it('should have proper error response references', async () => {
    const openApiSpec = await $fetch<OpenApiSpec>('/_docs/openapi.json')

    // Check that common error responses are defined in components
    const errorResponses = ['400', '404']
    const components = openApiSpec.components?.responses

    const missingComponents: string[] = []
    for (const code of errorResponses) {
      if (!components?.[code]) {
        missingComponents.push(code)
      }
    }

    if (missingComponents.length > 0) {
      // eslint-disable-next-line vitest/no-conditional-expect
      expect.fail(
        `Missing error response components: ${missingComponents.join(', ')}\n` +
          'These should be defined in components/responses'
      )
    }
  })

  it('should have consistent tag usage across endpoints', async () => {
    const openApiSpec = await $fetch<OpenApiSpec>('/_docs/openapi.json')

    const v1Endpoints = Object.entries(openApiSpec.paths).filter(([path]) =>
      path.startsWith('/api/v1/')
    )

    const tagsByPath: Record<string, Set<string>> = {}

    for (const [path, methods] of v1Endpoints) {
      for (const [method, spec] of Object.entries(methods)) {
        if (!['delete', 'get', 'patch', 'post', 'put'].includes(method)) {
          continue
        }

        if (spec.tags && Array.isArray(spec.tags)) {
          // Group by path prefix (e.g., /api/v1/bible, /api/v1/wol)
          const prefix = path.split('/').slice(0, 4).join('/')

          if (!tagsByPath[prefix]) {
            tagsByPath[prefix] = new Set()
          }

          spec.tags.forEach((tag: string) => tagsByPath[prefix].add(tag))
        }
      }
    }

    // Check that each path prefix has consistent tagging (not too many different tags)
    const inconsistencies: string[] = []
    for (const [prefix, tags] of Object.entries(tagsByPath)) {
      if (tags.size > 2) {
        inconsistencies.push(
          `${prefix} has too many different tags: ${Array.from(tags).join(', ')}`
        )
      }
    }

    if (inconsistencies.length > 0) {
      const warningMessage = [
        'Warning: Inconsistent tag usage detected:',
        '',
        ...inconsistencies.map((e) => `  - ${e}`),
        '',
        'Consider using a single primary tag per API section'
      ].join('\n')

      // eslint-disable-next-line no-console
      console.warn(warningMessage)
      // This is just a warning, not a failure
    }

    // Just verify we collected tags
    expect(Object.keys(tagsByPath).length).toBeGreaterThan(0)
  })

  it('should not have type objects without properties defined', async () => {
    const openApiSpec = await $fetch<OpenApiSpec>('/_docs/openapi.json')

    const errors: string[] = []

    // Recursive function to traverse schemas and find objects without properties
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const checkSchema = (schema: any, path: string) => {
      if (!schema || typeof schema !== 'object') return

      // Check if this is an object type without properties
      if (
        schema.type === 'object' &&
        !schema.properties &&
        !schema.additionalProperties &&
        !schema.allOf &&
        !schema.oneOf &&
        !schema.anyOf &&
        !schema.$ref
      ) {
        errors.push(
          `${path}: object type has no properties, additionalProperties, or composition keywords defined`
        )
      }

      // Recursively check nested schemas
      if (schema.properties) {
        for (const [propName, propSchema] of Object.entries(schema.properties)) {
          checkSchema(propSchema, `${path}.properties.${propName}`)
        }
      }

      if (schema.items) {
        checkSchema(schema.items, `${path}.items`)
      }

      if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        checkSchema(schema.additionalProperties, `${path}.additionalProperties`)
      }

      if (schema.allOf) {
        schema.allOf.forEach((subSchema: unknown, index: number) => {
          checkSchema(subSchema, `${path}.allOf[${index}]`)
        })
      }

      if (schema.oneOf) {
        schema.oneOf.forEach((subSchema: unknown, index: number) => {
          checkSchema(subSchema, `${path}.oneOf[${index}]`)
        })
      }

      if (schema.anyOf) {
        schema.anyOf.forEach((subSchema: unknown, index: number) => {
          checkSchema(subSchema, `${path}.anyOf[${index}]`)
        })
      }
    }

    // Check schemas in component definitions
    if (openApiSpec.components) {
      const components = openApiSpec.components
      if (components.schemas) {
        for (const [schemaName, schema] of Object.entries(components.schemas)) {
          checkSchema(schema, `components.schemas.${schemaName}`)
        }
      }
    }

    // Check schemas in endpoint responses
    const v1Endpoints = Object.entries(openApiSpec.paths).filter(([path]) =>
      path.startsWith('/api/v1/')
    )

    for (const [path, methods] of v1Endpoints) {
      for (const [method, spec] of Object.entries(methods)) {
        if (!['delete', 'get', 'patch', 'post', 'put'].includes(method)) {
          continue
        }

        const endpointId = `${method.toUpperCase()} ${path}`

        // Check response schemas
        if (spec.responses) {
          for (const [status, response] of Object.entries(spec.responses)) {
            if (response && typeof response === 'object' && 'content' in response) {
              const content = response.content
              if (content?.['application/json']?.schema) {
                checkSchema(
                  content['application/json'].schema,
                  `${endpointId}.responses.${status}.content['application/json'].schema`
                )
              }
            }
          }
        }

        // Check request body schemas
        if (spec.requestBody) {
          const requestBody = spec.requestBody
          if ('content' in requestBody && requestBody.content?.['application/json']?.schema) {
            checkSchema(
              requestBody.content['application/json'].schema,
              `${endpointId}.requestBody.content['application/json'].schema`
            )
          }
        }
      }
    }

    if (errors.length > 0) {
      const errorMessage = [
        'OpenAPI schema validation failed - objects without properties:',
        '',
        ...errors.map((e) => `  - ${e}`),
        '',
        `Total errors: ${errors.length}`
      ].join('\n')

      // eslint-disable-next-line vitest/no-conditional-expect
      expect.fail(errorMessage)
    }
  })
})
