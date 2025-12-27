import type { EventHandler, EventHandlerRequest } from 'h3'
import type { output } from 'zod'

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
    const logger = event.node.req.log
    const startTime = Date.now()
    logger.info(`Request received: ${event.node.req.url}`)

    return asyncLocalStorage.run({ logger }, async () => {
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
