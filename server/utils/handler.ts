import type { EventHandler, EventHandlerRequest } from 'h3'
import type pino from 'pino'
import type { output } from 'zod'

import { randomUUID } from 'node:crypto'

/**
 * A helper function to define an event handler that logs requests and errors.
 * @param handler The event handler to wrap.
 * @returns The wrapped event handler.
 */
export const defineLoggedEventHandler = <
  D extends {
    _zod: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      output: any
    }
  },
  T extends EventHandlerRequest = EventHandlerRequest
>(
  handler: EventHandler<T, Promise<output<D>>>
): EventHandler<T, Promise<output<D>>> =>
  defineEventHandler<T>(async (event) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: nuxt typecheck doesn't know about the custom properties
    const logger = event.node.req.log as pino.Logger
    const startTime = Date.now()
    const tracingHeader = event.node.req.headers['x-tracing-id']
    const requestId =
      (Array.isArray(tracingHeader) ? tracingHeader[0] : tracingHeader) || randomUUID()
    logger.info(`Request received: ${event.node.req.url}`)

    const context: RequestContext = { logger, requestId, startTime }

    return asyncLocalStorage.run(context, async () => {
      try {
        return await handler(event)
      } catch (err) {
        logger.error(err)
        throw err
      } finally {
        logger.info(`Request completed in ${Date.now() - startTime}ms`)
      }
    })
  })
