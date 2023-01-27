import {suite, test, expect} from "vitest"
import {PriorityQueueInt} from "./priority_queue_int.js"

let fixture = () => {
  let queue = new PriorityQueueInt()
  queue.push(0, 1)
  queue.push(1, 10)
  queue.push(2, 4)
  queue.push(3, 8)
  queue.push(5, 11)
  return {queue}
}

suite("PriorityQueueInt", () => {
  test("push", () => {
    let {queue} = fixture()
    expect(queue.pop()).toBe(5)
    expect(queue.pop()).toBe(1)
    expect(queue.pop()).toBe(3)
    expect(queue.pop()).toBe(2)
    expect(queue.pop()).toBe(0)
  })
  test("remove", () => {
    let {queue} = fixture()
    queue.remove(5)
    queue.remove(2)
    expect(queue.pop()).toBe(1)
    expect(queue.pop()).toBe(3)
    queue.push(6, 9)
    expect(queue.pop()).toBe(6)
    expect(queue.pop()).toBe(0)
  })
})
