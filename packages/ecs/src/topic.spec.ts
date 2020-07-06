import { Topic, createTopic } from "./topic"

describe("createTopic", () => {
  it("adds events to it's list of events", () => {
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
})
