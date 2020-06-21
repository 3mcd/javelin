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

/* describe("createStorage", () => {
  it("creates a new archetype for each unique combination of components", () => {
    const storage = createStorage()

    storage.create(1, [{ _t: 0, _v: 0 }])
    storage.create(2, [{ _t: 1, _v: 0 }])
    storage.create(3, [
      { _t: 0, _v: 0 },
      { _t: 1, _v: 0 },
    ])

    expect(createArchetype).toHaveBeenNthCalledWith(1, [0])
    expect(createArchetype).toHaveBeenNthCalledWith(2, [1])
    expect(createArchetype).toHaveBeenNthCalledWith(3, [0, 1])
  })
 
})*/
