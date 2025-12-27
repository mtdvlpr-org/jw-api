import logger from 'pino-http'

export default fromNodeMiddleware(
  logger({
    autoLogging: false,
    genReqId: (req) => req.headers['x-tracing-id'] || req.id,
    level: 'info',
    transport: {
      options: {
        colorize: process.env.NODE_ENV !== 'production',
        ignore: 'req,res,responseTime,pid,hostname',
        messageFormat: '[reqId:{req.id}] - {msg}',
        translateTime: 'SYS:standard'
      },
      target: 'pino-pretty'
    }
  })
)
