export default fromNodeMiddleware((req, _res, next) => {
  const tracingId = req.headers['x-tracing-id'] || Math.random().toString(36).slice(2, 12)
  req.headers['x-tracing-id'] = tracingId
  next()
})
