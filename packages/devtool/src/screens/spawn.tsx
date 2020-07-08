import {
  ComponentWithoutEntity,
  mutableEmpty,
  number,
  string,
} from "@javelin/ecs"
import { protocol, SerializedComponentType } from "@javelin/net"
import produce from "immer"
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react"
import { useParams } from "react-router-dom"
import styled from "styled-components"
import { useWorld } from "../context/world_provider"
import { WorldConfig } from "../types"
import { useLog } from "../context/log"
import { getComponentName } from "../helpers/component"

const SelectContainer = styled.div`
  display: flex;
`

const SelectButtonContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const SelectButton = styled.button`
  display: flex;
`

const ComponentMultiSelect = styled.select`
  flex: 2;
`

const FieldsetList = styled.ul`
  list-style-type: none;
  margin: 0 0 8px 0;
  padding: 0;
`

const FieldList = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
`

const FieldListItem = styled.li`
  margin: 8px 0;
`

type FormState = {
  components: ComponentWithoutEntity[]
}

type FormAction =
  | { type: "add_components"; payload: ComponentWithoutEntity[] }
  | { type: "remove_components"; payload: number[] }
  | { type: "set"; payload: { type: number; key: string; value: unknown } }
  | { type: "reset"; payload: WorldConfig }

function reducer(state: FormState, action: FormAction): FormState {
  return produce(state, draft => {
    switch (action.type) {
      case "add_components":
        draft.components.push(...action.payload)
        break
      case "remove_components":
        draft.components = draft.components.filter(
          c => !action.payload.includes(c._t),
        )
        break
      case "set": {
        const componentIndex = draft.components.findIndex(
          c => c._t === action.payload.type,
        )!

        draft.components[componentIndex][action.payload.key] =
          action.payload.value
        break
      }
      case "reset":
        mutableEmpty(draft.components)
        break
    }
  })
}

function getDefaultValueForDataType(dataTypeName: string) {
  if (dataTypeName === "number") {
    return number.create()
  } else {
    return string.create()
  }
}

function getInputTypeForDataType(dataTypeName: string) {
  if (dataTypeName === "number") {
    return "number"
  } else {
    return "text"
  }
}

function castValueToDataType(dataTypeName: string, value: string) {
  if (dataTypeName === "number") {
    return Number(value)
  } else {
    return value
  }
}

export function Spawn() {
  const { world: worldName } = useParams()
  const { worlds, sendMessage } = useWorld()
  const world = worlds.find(w => w.name === worldName)!
  const [state, dispatch] = useReducer(reducer, { components: [] })
  const log = useLog()
  const spawn = useCallback(() => {
    sendMessage(
      world,
      protocol.spawn(
        // copy each component since we're using immer to avoid "object is not
        // extensible" error
        state.components.map(c => ({ ...c })),
      ),
    )
    setToAdd([])
    setToRemove([])
    log.info(`Spawned ${JSON.stringify(state.components)}`)
    dispatch({ type: "reset", payload: world })
  }, [state, world])

  function getInitialComponent(type: number) {
    const { schema } = world.model.find(t => t.type === type)!
    const component = Object.entries(schema).reduce(
      (c, [fieldName, field]) => {
        c[fieldName] = getDefaultValueForDataType(field)
        return c
      },
      { _t: type } as ComponentWithoutEntity,
    )

    return component
  }

  useEffect(() => {
    dispatch({ type: "reset", payload: world })
  }, [world])

  function onAdd() {
    dispatch({
      type: "add_components",
      payload: toAdd.map(getInitialComponent),
    })
    setToAdd([])
    setToRemove([...toRemove, ...toAdd])
  }
  function onRemove() {
    dispatch({ type: "remove_components", payload: toRemove })
    setToRemove([])
  }

  const [toAdd, setToAdd] = useState([] as number[])
  const [toRemove, setToRemove] = useState([] as number[])

  function onToAddChange(e: ChangeEvent<HTMLSelectElement>) {
    const values = Array.from(e.target.selectedOptions).map(option =>
      Number(option.value),
    )
    setToAdd(values)
  }
  function onToRemoveChange(e: ChangeEvent<HTMLSelectElement>) {
    const values = Array.from(e.target.selectedOptions).map(option =>
      Number(option.value),
    )
    setToRemove(values)
  }

  function getDataTypeForComponentField(
    component: ComponentWithoutEntity,
    fieldName: string,
  ) {
    const componentType = world.model.find(
      componentType => componentType.type === component._t,
    )!

    for (const key in componentType.schema) {
      if (fieldName === key) {
        return componentType.schema[key]
      }
    }

    throw new Error(
      `Field ${fieldName} does not exist on component with type ${getComponentName(
        component._t,
        world.model,
      )}`,
    )
  }

  return (
    <div>
      <h4>Spawn</h4>
      <p>
        Create new entities by moving component types into the box on the right
        side.
      </p>
      <SelectContainer>
        <ComponentMultiSelect
          multiple
          value={toAdd.map(String)}
          onChange={onToAddChange}
        >
          {world.model
            .filter(
              type =>
                state.components.find(c => c._t === type.type) === undefined,
            )
            .map(type => (
              <option key={type.type} value={type.type}>
                {type.name}
              </option>
            ))}
        </ComponentMultiSelect>
        <SelectButtonContainer>
          <SelectButton onClick={onAdd}>{">"}</SelectButton>
          <SelectButton onClick={onRemove}>{"<"}</SelectButton>
        </SelectButtonContainer>
        <ComponentMultiSelect
          multiple
          value={toRemove.map(String)}
          onChange={onToRemoveChange}
        >
          {state.components.map(c => (
            <option key={c._t} value={c._t}>
              {getComponentName(c._t, world.model)}
            </option>
          ))}
        </ComponentMultiSelect>
      </SelectContainer>
      <FieldsetList>
        {toRemove
          .map(t => state.components.find(c => c._t === t)!)
          .map(c => (
            <li key={c._t}>
              <h4>{getComponentName(c._t, world.model)}</h4>
              <fieldset>
                <FieldList>
                  {Object.entries(c)
                    .filter(([key]) => key !== "_t")
                    .map(([key, value]) => (
                      <FieldListItem key={key}>
                        <label htmlFor={key}>{key}</label>
                        <input
                          id={key}
                          name={key}
                          type={getInputTypeForDataType(
                            getDataTypeForComponentField(c, key),
                          )}
                          value={String(value)}
                          onChange={e =>
                            dispatch({
                              type: "set",
                              payload: {
                                type: c._t,
                                key,
                                value: castValueToDataType(
                                  getDataTypeForComponentField(c, key),
                                  e.target.value,
                                ),
                              },
                            })
                          }
                        />
                      </FieldListItem>
                    ))}
                </FieldList>
              </fieldset>
            </li>
          ))}
      </FieldsetList>
      <button onClick={spawn}>Spawn</button>
    </div>
  )
}
