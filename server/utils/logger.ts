const getLogger = (): {
  debug: (msg: string) => void
  error: (msg: string) => void
  info: (msg: string) => void
  warn: (msg: string) => void
} => asyncLocalStorage.getStore()?.logger ?? console

export const logger = {
  debug: (msg: string) => getLogger().debug(msg),
  error: (msg: string) => getLogger().error(msg),
  info: (msg: string) => getLogger().info(msg),
  warn: (msg: string) => getLogger().warn(msg)
}
