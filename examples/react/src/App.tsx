import { Group, resource } from "@javelin/ecs";
import { Javelin, useApp, useResource, useResourceRef, useSystem } from "@javelin/react";
import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { BoxEntity } from "./Box";

export type Time = {
  previous: number
  current: number
  delta: number
}
export const Time = resource<Time>()

const Test = () => {
  const app = useApp();

  useFrame(() => {
    app.step()
  })

  return null;
}

const TimeSystem = () => {
  useResource(Time, {previous: 0, current: 0, delta: 0})

  useSystem((world) => {
    let time = world.getResource(Time)
    let current = performance.now() / 1_000
    let previous = time.current
    time.previous = previous
    time.current = current
    time.delta = current - previous
  }, { 
    groupId: Group.Early
  })

  return null;
}

export const TimeIndicator = resource<HTMLHeadingElement>()

export const ShowTime = () => {
  const h1Ref = useResourceRef(TimeIndicator)
  useSystem((world) => {
    const time = world.getResource(Time)
    const timeIndicator = world.getResource(TimeIndicator)
    if (timeIndicator) {
      timeIndicator.innerText = time.delta.toString()
    }
  }, {
    predicate: (world) => {
      return !!world.hasResource(TimeIndicator)
    }
  })

  return <Html><h1 ref={h1Ref} style={{color: "white"}}>0</h1></Html>
}

function Lights() {
  return (
    <mesh position={new Vector3(-1, 0.75, 1).multiplyScalar(20)}>
      <directionalLight color={0xffffff} castShadow />
    </mesh>
  )
}

export default function App () {
  return (<Javelin>
    <Canvas style={{ height: '100vh', width: '100vw', position: 'absolute', top: 0, left: 0 }}>
      <Lights />
      <Test />
      <TimeSystem />
      <ShowTime />
      <BoxEntity />
      <BoxEntity />
      <BoxEntity />
      <BoxEntity />
      <BoxEntity />
      <BoxEntity />
      <BoxEntity />
      <OrbitControls />
    </Canvas>
  </Javelin>) 
}
