import { $worldStorageKey, mutableEmpty, WorldOpType } from "@javelin/ecs"
import { protocol } from "@javelin/net"
import produce from "immer"
import React, { useReducer } from "react"
import { useParams } from "react-router-dom"
import styled from "styled-components"
import { useWorld } from "../context/world_provider"
import { getComponentName } from "../helpers/component"

export const EntityList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  list-style-type: none;
  margin: 0;
  padding: 0;
`

export const ArchetypeWrapper = styled.section`
  margin-bottom: 1em;
`

export const ArchetypeDescriptor = styled.h4`
  font-family: "SF Mono", "Consolas", monospace;
  font-weight: normal;
  text-decoration: underline;
`

type EntityListItemProps = {
  selected: boolean
}

export const EntityListItem = styled.li<EntityListItemProps>`
  background-color: ${props => (props.selected ? "#6688ae" : "transparent")};
  border-radius: 3px;
  border: ${props => `1px solid ${props.selected ? "#6688ae" : "#ccc"}`};
  box-sizing: border-box;
  color: ${props => (props.selected ? "#fafafa" : "inherit")};
  cursor: pointer;
  flex: 0 0 30px;
  margin: 2px;
  padding: 4px;
  text-align: center;

  &:hover {
    background-color: ${props => (props.selected ? "#6688ae" : "#ccc")};
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
  const sections = world.world[$worldStorageKey].archetypes.map(archetype => {
    const entities = archetype.entities.slice(0, 50)

    if (entities.length === 0) {
      return null
    }

    return (
      <ArchetypeWrapper key={archetype.layout.join(",")}>
        <ArchetypeDescriptor>
          {archetype.layout
            .map(t => getComponentName(t, world?.model))
            .join(" & ")}
        </ArchetypeDescriptor>
        <span>
          {entities.length} of {archetype.entities.length}
        </span>
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
              </EntityListItem>
            )
          })}
        </EntityList>
      </ArchetypeWrapper>
    )
  })

  return (
    <div>
      <h4>Archetypes</h4>
      <p>Inspect your game world and modify or delete existing entitites.</p>
      {sections}
      <button
        onClick={() => {
          sendMessage(
            world,
            protocol.ops(
              state.selected.map(entity => [WorldOpType.Destroy, entity]),
              true,
            ),
          )
          dispatch({ type: "reset" })
        }}
      >
        Delete
      </button>
    </div>
  )
}
