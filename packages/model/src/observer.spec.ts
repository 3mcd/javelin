import { createModel, number } from "./model"
import { createObserver } from "./observer"

describe("observer", () => {
  it("observes", () => {
    const config = new Map([[0, { x: number }]])
    const model = createModel(config)
    const observer = createObserver()
    const instance = {
      x: 0,
    }
    const observed = observer.observe(instance, model[0])
    observed.x = 1
  })
})
