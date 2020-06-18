import React, { useCallback } from "react"
import { MemoryRouter, useHistory, useLocation, Link } from "react-router-dom"
import styled from "styled-components"
import { useWorld } from "../context/world_provider"
import { Routes } from "../routes"
import { ReactElement } from "react"

const DevtoolContainer = styled.div`
  padding: 16px;
  background: #efefef;
  font-family: Helvetica, sans-serif;
  color: #222;
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
    <select value={world} onChange={onSelectChange}>
      {worlds.map(world => (
        <option key={world.name} value={world.name}>
          {world.name}
        </option>
      ))}
    </select>
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
    // Ignore world name segment
    .slice(1)
    .reduce(
      (a, segment) => {
        a.currentPath += `${segment}/`
        a.links.push(
          <BreadcrumbLink key={a.currentPath} to={a.currentPath}>
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
        <WorldSelect />
        <Breadcrumbs />
        <Routes />
      </MemoryRouter>
    </DevtoolContainer>
  )
}
