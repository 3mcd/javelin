export const TICK_RATE = Number(process.env.TICK_RATE) || 60
export const SEND_RATE = Number(process.env.SEND_RATE) || 10
export const PORT = Number(process.env.PORT) || 8000
export const ENTITY_COUNT = Number(process.env.ENTITY_COUNT) || 100
export const MESSAGE_MAX_BYTE_LENGTH =
  Number(process.env.MESSAGE_MAX_BYTE_LENGTH) || Infinity
export const BIG_PRIORITY = Number(process.env.BIG_PRIORITY) || 1
export const SMALL_PRIORITY = Number(process.env.SMALL_PRIORITY) || 2
export const SWAP_INTERVAL = Number(process.env.SWAP_INTERVAL) || 1000
