export type Sendable = {
  lastSendTime: number
  sendRate: number
}

export let eligibleForSend = (sendable: Sendable, currentTime: number) =>
  currentTime > sendable.lastSendTime + sendable.sendRate
