import {perf} from "@javelin/perf"
import {PriorityQueueInt} from "./priority_queue_int.js"

const COUNT = 100

let fixture = (insert = true) => {
  let queue = new PriorityQueueInt()
  if (insert) {
    for (let i = 0; i < COUNT; i++) {
      queue.push(i, i % 3)
    }
  }
  return {queue}
}

perf("push", () => {
  let {queue} = fixture(false)
  return () => {
    for (let i = 0; i < COUNT; i++) {
      queue.push(i, COUNT - i)
    }
  }
})

perf("pop", () => {
  let {queue} = fixture()
  return () => {
    for (let i = 0; i < COUNT; i++) {
      queue.pop()
    }
  }
})

perf("peek", () => {
  let {queue} = fixture()
  return () => {
    queue.peek()
  }
})

perf("remove", () => {
  let {queue} = fixture()
  return () => {
    for (let i = 0; i < COUNT; i++) {
      queue.remove(i)
    }
  }
})
