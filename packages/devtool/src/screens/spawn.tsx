import { SerializedComponentType, protocol } from "@javelin/net"
import React, { useEffect, useReducer, useCallback } from "react"
import { Screen } from "../components/screen"
import { useWorld } from "../context/world_provider"
import { WorldConfig } from "../types"
import { useLocation, useParams } from "react-router-dom"

type FormState = {
  world: string
  fields: {
    [componentType: string]: {
      [key: string]: string
    }
  }
}

type FormAction =
  | {
      type: "set"
      payload: { componentType: string; key: string; value: string }
    }
  | {
      type: "reset"
      payload: WorldConfig
    }

function reducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "set":
      return {
        ...state,
        fields: {
          ...state.fields,
          [action.payload.componentType]: {
            ...state.fields[action.payload.componentType],
            [action.payload.key]: action.payload.value,
          },
        },
      }
    case "reset":
      return initialize(action.payload)
  }
}

const initialize = (world: WorldConfig) => {
  const fields = world.model.reduce(
    (a, x) => ({
      ...a,
      [x.name!]: Object.entries(x.schema).reduce(
        (a, [key]) => ({ ...a, [key]: "" }),
        {},
      ),
    }),
    {},
  )

  return { world: world.name, fields }
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
  const [state, dispatch] = useReducer(reducer, {}, () => initialize(world))
  const spawn = useCallback(() => {
    const components = []

    for (const key in state.fields) {
      const type = world.model.find(type => type.name === key)!
      const component = {
        _t: type.type,
        _v: 0,
        _e: 0,
        ...Object.entries(state.fields[key]).reduce((a, [key, value]) => {
          a[key] = castValueToDataType(type.schema[key], value)
          return a
        }, {} as { [key: string]: unknown }),
      }

      components.push(component)
    }

    sendMessage(world, protocol.create(components))
    dispatch({ type: "reset", payload: world })
  }, [state])

  const fields =
    state.world === world.name
      ? world.model.map(type => {
          const entries = Object.entries(type.schema)
          const fields = entries.map(([key, dataTypeName]) => (
            <label key={key}>
              <span>{key}</span>
              <input
                type={getInputTypeForDataType(dataTypeName)}
                value={state.fields[type.name!][key]}
                onChange={e =>
                  dispatch({
                    type: "set",
                    payload: {
                      componentType: type.name!,
                      key: key,
                      value: e.target.value,
                    },
                  })
                }
              />
            </label>
          ))
          return (
            <fieldset key={type.name}>
              <legend>{type.name}</legend>
              {fields}
            </fieldset>
          )
        })
      : null

  useEffect(() => {
    dispatch({ type: "reset", payload: world })
  }, [world])

  return (
    <Screen title="Spawn">
      {fields}
      <button onClick={spawn}>Spawn</button>
    </Screen>
  )
}
