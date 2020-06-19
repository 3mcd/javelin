import React from "react"
import styled from "styled-components"
import { LogMessage, useLog } from "../context/log"

const LogList = styled.ul`
  font-family: "SF Mono", "Consolas", monospace;
  font-size: 12px;
  list-style-type: none;
  margin: 0;
  padding: 0;
`

export type LogProps = {}

export function Log(props: LogProps) {
  const { messages } = useLog()

  return (
    <LogList>
      {messages.map(message => (
        <li key={message.id}>
          {message.time}
          {(message.count || 0) > 0 && `(${message.count})`}: {message.text}
        </li>
      ))}
    </LogList>
  )
}
