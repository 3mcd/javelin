import { World } from "../world"
import { createStorage } from "./storage"

export const createWorld = jest.fn((): World => {
  let e = 0
  return {
    id: 1,
    latestTick: 0,
    latestTickData: null,
    latestSystemId: 0,
    storage: createStorage(),
    addSystem: jest.fn(),
    addTopic: jest.fn(),
    attach: jest.fn(),
    attachImmediate: jest.fn(),
    destroy: jest.fn(),
    destroyImmediate: jest.fn(),
    detach: jest.fn(),
    detachImmediate: jest.fn(),
    get: jest.fn(),
    has: jest.fn(),
    removeSystem: jest.fn(),
    removeTopic: jest.fn(),
    reset: jest.fn(),
    createSnapshot: jest.fn(),
    create: jest.fn(() => e++),
    step: jest.fn(),
    tryGet: jest.fn(),
  }
})

export let currentWorldId = null
