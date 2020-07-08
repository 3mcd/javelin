import styled from "styled-components"

import React, { PropsWithChildren } from "react"
import { forwardRef } from "react"

export const PanelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow: scroll;
`

export const PanelBar = styled.div`
  background-color: #fefefe;
  padding: 8px;
  display: flex;
  flex-direction: row;
`
export const PanelContent = styled.div`
  padding: 8px;
`

export const PanelTitle = styled.h3`
  margin: 0;
`

export type PanelProps = PropsWithChildren<{ title?: string }>

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  (props: PanelProps, ref) => {
    return (
      <PanelWrapper ref={ref}>
        {props.title && (
          <PanelBar>
            <PanelTitle>{props.title}</PanelTitle>
          </PanelBar>
        )}
        <PanelContent>{props.children}</PanelContent>
      </PanelWrapper>
    )
  },
)
