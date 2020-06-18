import React, { PropsWithChildren } from "react"
import styled from "styled-components"

type ScreenProps = PropsWithChildren<{
  title: string
}>

const ScreenWrapper = styled.div``

export function Screen(props: ScreenProps) {
  return (
    <ScreenWrapper>
      <h2>{props.title}</h2>
      {props.children}
    </ScreenWrapper>
  )
}
