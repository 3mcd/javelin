import produce from "immer"
import React, {
  createContext,
  forwardRef,
  PropsWithChildren,
  useReducer,
  useRef,
  useImperativeHandle,
  useContext,
} from "react"

export type LogMessage = {
  id: number
  time: number
  text: string
  count?: number
  start?: number
  context?: LogMessageContext
}

type LogState = {
  messages: LogMessage[]
  limit: number
}

enum LogActionType {
  Info = "log/info",
}

type LogInfo = { type: LogActionType.Info; payload: LogMessage }

type LogAction = LogInfo

type LogMessageContext = {
  id: string
  duration: number
}

function logReducer(state: LogState, action: LogAction) {
  return produce(state, draft => {
    switch (action.type) {
      case LogActionType.Info: {
        const message = { ...action.payload }
        const current = draft.messages[draft.messages.length - 1]

        if (
          current &&
          current.context &&
          (!message.context || message.context.id !== current.context.id)
        ) {
          current.start = -Infinity
        }

        if (message.context) {
          const i = draft.messages.findIndex(
            m =>
              m.context &&
              m.context.id === message.context!.id &&
              message.time - (m.start || 0) <= message.context!.duration,
          )

          if (i > -1) {
            const previous = draft.messages[i]
            message.count = (previous.count || 0) + 1
            message.start = previous.start
            draft.messages[i] = message
            return
          }

          message.count = 0
          message.start = message.time
        }

        draft.messages.push(message)
        draft.messages = draft.messages.slice(
          draft.messages.length + 1 - draft.limit,
        )
      }
    }
  })
}

const initialState: LogState = { limit: 0, messages: [] }

function useLogState(limit: number = 100) {
  const sequence = useRef(0)
  const [state, dispatch] = useReducer(logReducer, { ...initialState, limit })

  return {
    info(text: string, context?: LogMessageContext) {
      dispatch({
        type: LogActionType.Info,
        payload: {
          id: ++sequence.current,
          time: +performance.now().toFixed(2),
          text,
          context,
        },
      })
    },
    ...state,
  }
}

export type LogContext = ReturnType<typeof useLogState>

export type LogProviderProps = PropsWithChildren<{
  limit?: number
}>

export const logContext = createContext<LogContext>({
  messages: [],
  limit: 0,
  info() {},
})

export const LogProvider = forwardRef<LogContext, LogProviderProps>(
  function LogProvider(props, ref) {
    const log = useLogState(props.limit)

    useImperativeHandle(ref, () => log)

    return (
      <logContext.Provider value={log}>{props.children}</logContext.Provider>
    )
  },
)

export function useLog() {
  return useContext(logContext)
}
