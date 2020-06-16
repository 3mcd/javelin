import m from "mithril"
import { World } from "@javelin/ecs"
import { JavelinMessage } from "@javelin/net"

export function Devtool(
  world: World,
  onMessage?: (message: JavelinMessage) => any,
) {
  const {
    storage: { archetypes },
  } = world

  let value = ""

  return {
    view() {
      const components = new Set()

      archetypes.forEach(a => {
        a.layout.forEach(t => components.add(t))
      })

      return m("div", { class: "Devtool" }, [
        m("ul", [
          m("li", `archetypes: ${archetypes.length}`),
          m("li", `componentTypes: ${components.size}`),
        ]),
        m("input", {
          oninput: (e: InputEvent) => {
            value = (<HTMLInputElement>e.target).value
          },
        }),
        m(
          "button",
          {
            onclick: () =>
              typeof onMessage === "function" && onMessage(JSON.parse(value)),
          },
          "Submit",
        ),
      ])
    },
  }
}
