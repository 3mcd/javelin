import React, { useCallback } from "react"
import { MemoryRouter, useHistory, useLocation, Link } from "react-router-dom"
import styled from "styled-components"
import { useWorld } from "../context/world_provider"
import { Routes } from "../routes"
import { ReactElement } from "react"

const DevtoolContainer = styled.div`
  background: #efefef;
  font-family: Helvetica, sans-serif;
  color: #222;
`

const DevtoolContent = styled.div`
  padding: 8px;
`

const DevtoolBar = styled(DevtoolContent)`
  background: #fefefe;
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

  return (
    <DevtoolContainer>
      <MemoryRouter initialEntries={[`/${worlds[0].name}`]}>
        <DevtoolBar>
          <WorldSelect />
          <Breadcrumbs />
        </DevtoolBar>
        <DevtoolContent>
          <Routes />
        </DevtoolContent>
      </MemoryRouter>
    </DevtoolContainer>
  )
}
