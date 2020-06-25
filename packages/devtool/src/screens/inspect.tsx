import React from "react"
import { useParams } from "react-router-dom"
import { useWorld } from "../context/world_provider"
import { getComponentName } from "../helpers/component"
import styled from "styled-components"
import produce from "immer"
import { mutableEmpty } from "@javelin/ecs"
import { useReducer } from "react"
import { protocol } from "@javelin/net"

export const EntityList = styled.ul`
  margin: 0;
  padding: 0;
  list-style-type: none;
  display: flex;
  flex-wrap: wrap;
`

type EntityListItemProps = {
  selected: boolean
}

export const EntityListItem = styled.li<EntityListItemProps>`
  padding: 4px;
  flex: 1 1 20px;
  border: ${props => (props.selected ? "none" : "1px solid #ddd")};
  border-radius: 2px;
  margin: 1px;
  background: ${props => (props.selected ? "#666" : "transparent")};
  color: ${props => (props.selected ? "#fff" : "inherit")};
  cursor: pointer;

  &:hover {
    background: #fff;
  }
`

type InspectState = {
  selected: number[]
}

type InspectAction =
  | { type: "select_entity"; payload: number }
  | { type: "deselect_entity"; payload: number }
  | { type: "reset" }

function reducer(state: InspectState, action: InspectAction): InspectState {
  return produce(state, draft => {
    switch (action.type) {
      case "select_entity":
        draft.selected.push(action.payload)
        break
      case "deselect_entity":
        draft.selected.splice(draft.selected.indexOf(action.payload), 1)
        break
      case "reset":
        mutableEmpty(draft.selected)
        break
    }
  })
}

export function Inspect() {
  const { world: worldName } = useParams()
  const { worlds, sendMessage } = useWorld()
  const world = worlds.find(world => world.name === worldName)!
  const [state, dispatch] = useReducer(reducer, { selected: [] })
  const sections = world.world.storage.archetypes.map(archetype => {
    const types = world.model.filter(ct => archetype.layout.includes(ct.type))
    const entities = archetype.entities.slice(0, 50)

    return (
      <section key={archetype.layout.join(",")}>
        <h4>
          {archetype.layout
            .map(t => getComponentName(t, world?.model))
            .join(" & ")}
        </h4>
        <EntityList>
          {entities.map(e => {
            const selected = state.selected.includes(e)

            return (
              <EntityListItem
                key={e}
                selected={selected}
                onClick={() =>
                  dispatch({
                    type: selected ? "deselect_entity" : "select_entity",
                    payload: e,
                  })
                }
              >
                <span>{e}</span>
                {/* {types.map(t => {
                  const component = archetype.table[
                    archetype.layout.indexOf(t.type)
                  ][archetype.indices[e]]!
                  const fields = Object.keys(t.schema)
                  return (

                    <dl key={t.type}>
                      {fields.map(fieldName => {
                        return (
                          <React.Fragment key={fieldName}>
                            <dt>{fieldName}</dt>
                            <dd>{String(component[fieldName])}</dd>
                          </React.Fragment>
                        )
                      })}
                    </dl>
                  )
                })} */}
              </EntityListItem>
            )
          })}
        </EntityList>
      </section>
    )
  })

  return (
    <div>
      <button
        onClick={() =>
          sendMessage(world, protocol.destroy(state.selected, true))
        }
      >
        Delete
      </button>
      {sections}
    </div>
  )
}
