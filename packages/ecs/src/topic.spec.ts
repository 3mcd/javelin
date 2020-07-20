import { Topic, createTopic } from "./topic"

describe("createTopic", () => {
  it("adds events to its list of events", () => {
    const topic: Topic = createTopic()
    topic.push({ inputs: [] })
    expect(Array.from(topic).length).toBe(0)
  })

  it("transitions messages to ready state when flush is called", () => {
    const topic: Topic = createTopic()
    topic.push({ inputs: [] })
    topic.flush()
    expect(Array.from(topic)[0]).toEqual({ inputs: [] })
  })

  it("adds events to be consumed immediately when the immediate flag is true", () => {
    const topic: Topic = createTopic()
    topic.pushImmediate({ inputs: [] })
    expect(Array.from(topic).length).toBe(1)
  })
})
