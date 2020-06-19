import React, { ReactElement, useCallback } from "react"
import { Link, MemoryRouter, useHistory, useLocation } from "react-router-dom"
import styled, { createGlobalStyle, css } from "styled-components"
import { useLog } from "../context/log"
import { useWorld } from "../context/world_provider"
import { useLogScroll } from "../hooks/useLogScroll"
import { Routes } from "../routes"
import { Log } from "./log"
import { Panel, PanelBar } from "./panel"

const GlobalStyle = createGlobalStyle`
  a {
    text-decoration: none;
    color: #6688ae;

    &:hover {
      color: #4e677e;
    }
  }

  dl {
    display: inline-grid;
    grid-template-columns: auto auto;
    margin: 0;

    dt {
      padding: 4px;
      text-align: right;
      word-break: break-word;
      text-decoration: underline;
    }

    dd {
      padding: 4px;
      margin: 0;
    }
  }

  select {
    > option {
      padding: 4px 2px;
    }
  }

  label {
    margin-right: 8px;
  }
  `

const DevtoolContainer = styled.div`
  background: #efefef;
  font-family: Helvetica, sans-serif;
  color: #222;
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;

  *,
  *:before,
  *:after {
    box-sizing: border-box;
  }
`

const DevtoolPanel = styled.div`
  padding: 8px;
  flex: 1;
  overflow: auto;
`

const WorldSelectDropdown = styled.select`
  margin-right: 8px;
`

function WorldSelect() {
  const { worlds } = useWorld()
  const { push } = useHistory()
  const { pathname } = useLocation()
  const onSelectChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      push(`/${worlds[e.target.selectedIndex].name}`),
    [],
  )

  const matches = pathname.match(/^\/(\w+)\/?/)
  const world = matches ? matches[1] : ""

  return (
    <WorldSelectDropdown value={world} onChange={onSelectChange}>
      {worlds.map(world => (
        <option key={world.name} value={world.name}>
          {world.name}
        </option>
      ))}
    </WorldSelectDropdown>
  )
}

const BreadcrumbLink = styled(Link)`
  &:before {
    content: "/";
  }
`

function Breadcrumbs() {
  const { pathname } = useLocation()
  const breadcrumbs = pathname
    // Trim leading slash
    .replace(/^\//, "")
    .split("/")
    .reduce(
      (a, segment) => {
        a.currentPath += `${segment}/`
        a.links.push(
          <BreadcrumbLink key={a.currentPath} to={`/${a.currentPath}`}>
            {segment}
          </BreadcrumbLink>,
        )
        return a
      },
      {
        currentPath: "",
        links: [] as ReactElement[],
      },
    )

  return <>{breadcrumbs.links}</>
}

export function Devtool() {
  const { worlds } = useWorld()
  const log = useLog()
  const ref = useLogScroll(log.messages)
  const home = `/${worlds[0].name}`

  return (
    <MemoryRouter initialEntries={[home]}>
      <GlobalStyle />
      <DevtoolContainer>
        <PanelBar>
          <Link to={home}>javelin</Link>
          <Breadcrumbs />
        </PanelBar>
        <Panel>
          <p>Select a target world instance:</p>
          <WorldSelect />
        </Panel>
        <Panel title="World">
          <Routes />
        </Panel>
        <Panel title="Log" ref={ref}>
          <Log />
        </Panel>
      </DevtoolContainer>
    </MemoryRouter>
  )
}
