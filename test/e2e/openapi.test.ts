import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

await setup({ rootDir: fileURLToPath(new URL('../../', import.meta.url)) })

type OpenApiSpec = {
  components: {
    responses?: Record<
      string,
      { content?: Record<string, { schema?: z.core.JSONSchema.JSONSchema }> }
    >
    schemas?: Record<string, z.core.JSONSchema.JSONSchema>
  }
  paths: Record<
    string,
    Record<
      'delete' | 'get' | 'patch' | 'post' | 'put',
      {
        description?: string
        operationId?: string
        requestBody?:
          | { $ref: string }
          | {
              content?: Record<
                string,
                {
                  schema?: z.core.JSONSchema.JSONSchema
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
                  schema?: z.core.JSONSchema.JSONSchema
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

  it('should validate actual API responses against OpenAPI schemas', async () => {
    const openApiSpec = await $fetch<OpenApiSpec>('/_docs/openapi.json')

    const randomNumber = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min

    const randomValue = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

    const testSymbols = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl']
    const testCodes = ['E', 'S', 'F', 'D', 'I', 'P', 'O']

    // Define test cases for different endpoints with sample parameters
    const testCases: Array<{
      description: string
      openApiPath: string
      params?: Record<string, number | string>
    }> = [
      {
        description: 'Bible verse endpoint',
        openApiPath: '/api/v1/bible/{symbol}/{book}/{chapter}/{verse}',
        params: {
          book: randomNumber(1, 66).toString(),
          chapter: '1',
          symbol: randomValue(testSymbols),
          verse: '1'
        }
      },
      {
        description: 'Bible books endpoint',
        openApiPath: '/api/v1/bible/{symbol}/books',
        params: { symbol: randomValue(testSymbols) }
      },
      {
        description: 'Yeartext endpoint',
        openApiPath: '/api/v1/wol/yeartext',
        params: { wtlocale: randomValue(testCodes), year: new Date().getFullYear() }
      },
      {
        description: 'Meeting schedule endpoint',
        openApiPath: '/api/v1/meeting/schedule',
        params: { langwritten: randomValue(testCodes) }
      }
    ]

    const errors: string[] = []

    for (const testCase of testCases) {
      try {
        // Get the OpenAPI schema for this endpoint
        const endpointSpec = openApiSpec.paths[testCase.openApiPath]?.get
        if (!endpointSpec) {
          errors.push(`${testCase.description}: No OpenAPI spec found for ${testCase.openApiPath}`)
          continue
        }

        const response200 = endpointSpec.responses?.['200']
        if (!response200 || !('content' in response200)) {
          errors.push(`${testCase.description}: No 200 response schema defined`)
          continue
        }

        const schema = response200.content?.['application/json']?.schema
        if (!schema) {
          errors.push(`${testCase.description}: No JSON schema defined for 200 response`)
          continue
        }

        // Build the actual URL by replacing path parameters
        let actualPath = testCase.openApiPath
        const queryParams: Record<string, string> = {}

        if (testCase.params) {
          for (const [key, value] of Object.entries(testCase.params)) {
            const placeholder = `{${key}}`
            if (actualPath.includes(placeholder)) {
              actualPath = actualPath.replace(placeholder, String(value))
            } else {
              queryParams[key] = String(value)
            }
          }
        }

        // Add query string if needed
        const queryString =
          Object.keys(queryParams).length > 0
            ? '?' + new URLSearchParams(queryParams).toString()
            : ''

        // Make the actual API call
        const response = await $fetch<unknown>(`${actualPath}${queryString}`)

        if (!response) {
          errors.push(`${testCase.description}: No response received from API`)
          continue
        }

        // Verify response has expected top-level fields from OpenAPI
        if (typeof response === 'object' && response !== null) {
          const responseObj = response as Record<string, unknown>

          // Check required fields
          if (!('success' in responseObj)) {
            errors.push(`${testCase.description}: Missing 'success' field in response`)
          }

          if (!('data' in responseObj)) {
            errors.push(`${testCase.description}: Missing 'data' field in response`)
          }

          if (!('meta' in responseObj)) {
            errors.push(`${testCase.description}: Missing 'meta' field in response`)
          }

          // Validate meta structure
          if ('meta' in responseObj && typeof responseObj.meta === 'object') {
            const meta = responseObj.meta as Record<string, unknown>
            const requiredMetaFields = ['requestId', 'responseTime', 'timestamp', 'version']
            for (const field of requiredMetaFields) {
              if (!(field in meta)) {
                errors.push(`${testCase.description}: Missing 'meta.${field}' field in response`)
              }
            }
          }
        }

        // Validate the response structure using Zod
        const apiResponseSchema = z.fromJSONSchema({
          ...JSON.parse(JSON.stringify(schema).replaceAll('#/components/schemas/', '#/$defs/')),
          $defs: JSON.parse(
            JSON.stringify(openApiSpec.components.schemas).replaceAll(
              '#/components/schemas/',
              '#/$defs/'
            )
          )
        })

        const validationResult = apiResponseSchema.safeParse(response)
        if (!validationResult.success) {
          errors.push(
            `${testCase.description}: Response doesn't match API envelope structure: ${validationResult.error.message}`
          )
        }
      } catch (error) {
        errors.push(
          `${testCase.description}: Failed to fetch or validate - ${error instanceof Error ? error.message : String(error)}`
        )
      }
    }

    if (errors.length > 0) {
      const errorMessage = [
        'API response validation failed:',
        '',
        ...errors.map((e) => `  - ${e}`),
        '',
        `Total test cases: ${testCases.length}`,
        `Total errors: ${errors.length}`
      ].join('\n')

      // eslint-disable-next-line vitest/no-conditional-expect
      expect.fail(errorMessage)
    }
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
