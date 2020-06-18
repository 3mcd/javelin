import { ComponentWithoutEntity, number, string } from "@javelin/ecs"
import { protocol, SerializedComponentType } from "@javelin/net"
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react"
import { useParams } from "react-router-dom"
import { Screen } from "../components/screen"
import { useWorld } from "../context/world_provider"
import { WorldConfig } from "../types"
import styled from "styled-components"

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

type FormState = {
  components: ComponentWithoutEntity[]
}

type FormAction =
  | { type: "add_components"; payload: ComponentWithoutEntity[] }
  | { type: "remove_components"; payload: number[] }
  | { type: "set"; payload: { type: number; key: string; value: unknown } }
  | { type: "reset"; payload: WorldConfig }

function reducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "add_components":
      return {
        ...state,
        components: [...state.components, ...action.payload],
      }
    case "remove_components":
      return {
        ...state,
        components: state.components.filter(
          c => !action.payload.includes(c._t),
        ),
      }
    case "set": {
      const componentIndex = state.components.findIndex(
        c => c._t === action.payload.type,
      )!
      const component = state.components[componentIndex]
      const nextComponent = {
        ...component,
        [action.payload.key]: action.payload.value,
      }

      return {
        ...state,
        components: [
          ...state.components.slice(0, componentIndex),
          nextComponent,
          ...state.components.slice(componentIndex + 1),
        ],
      }
    }
    case "reset":
      return { components: [] }
  }
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

function getComponentName(
  component: ComponentWithoutEntity,
  model: SerializedComponentType[],
) {
  return model.find(type => component._t === type.type)?.name
}

export function Spawn() {
  const { world: worldName } = useParams()
  const { worlds, sendMessage } = useWorld()
  const world = worlds.find(w => w.name === worldName)!
  const [state, dispatch] = useReducer(reducer, { components: [] })
  const spawn = useCallback(() => {
    sendMessage(world, protocol.spawn(state.components))
    setToAdd([])
    setToRemove([])
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
        component,
        world.model,
      )}`,
    )
  }

  return (
    <Screen title="Spawn">
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
              {getComponentName(c, world.model)}
            </option>
          ))}
        </ComponentMultiSelect>
      </SelectContainer>
      <ul>
        {toRemove
          .map(t => state.components.find(c => c._t === t)!)
          .map(c => (
            <li key={c._t}>
              <h3>{getComponentName(c, world.model)}</h3>
              <fieldset>
                <ul>
                  {Object.entries(c)
                    .filter(([key]) => key !== "_t")
                    .map(([key, value]) => (
                      <li key={key}>
                        <label>
                          {key}
                          <input
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
                        </label>
                      </li>
                    ))}
                </ul>
              </fieldset>
            </li>
          ))}
      </ul>
      <button onClick={spawn}>Spawn</button>
    </Screen>
  )
}
