import { Topic, createTopic } from "./topic"

describe("createTopic", () => {
  it("creates a new topic with the given name", () => {
    type TestType = {
      mass: Number
    }
    const topic = createTopic<TestType>("testTopic");
    expect(topic.name).toBe("testTopic");
  })

  it("adds events to it's list of events", () => {
    type TestType = {
      mass: Number
    }
    const topic: Topic<string, TestType> = createTopic<TestType>("testTopic");
    topic.pushEvent({ mass: 17 });

    for (const event of topic) {
      console.log(event);
      expect(event).toEqual({ mass: 17 });
    }
  })
})
