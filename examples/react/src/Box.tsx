import { type, value } from "@javelin/ecs"
import { Entities, useCurrentEntity, useSystem } from "@javelin/react"
import { useRef } from "react"
import { MathUtils, Mesh, Quaternion as ThreeQuaternion } from "three"
import { Time } from "./App"

type Position = {
  x: number
  y: number,
  z: number
}

export const Position = value<Position>({ x: "f32", y: "f32", z: "f32" })

type Quaternion = {
  x: number,
  y: number,
  z: number,
  w: number,
} 

export const Quaternion = value<Quaternion>({ x: "f32", y: "f32", z: "f32", w: "f32" })


export const Color = value<string>()

export type BoxDimensions = {
  width: number,
  height: number,
}

export const BoxDimensions = value<BoxDimensions>({ width: "f32", height: "f32" })

export const Box = type(
  Position,
  Quaternion,
  Color,
  BoxDimensions,
)


export interface BoxProps {
  color: string,
  width: number,
  height: number,
}

let last = 0;
const _tempQuaternion = new ThreeQuaternion()
export const CreateBoxSystem = () => {
  useSystem((world) => {
    _tempQuaternion.random()
   world.create(Box, 
      { x: MathUtils.randInt(-10, 10), y: MathUtils.randInt(-10, 10), z: MathUtils.randInt(-10, 10) },
      { x: _tempQuaternion.x, y: _tempQuaternion.y, z: _tempQuaternion.z, w: _tempQuaternion.w },
      (Math.random() * 0xffffff).toString(16),
      {  width: 1, height: 1 },
    )
  }, { 
    predicate: (world) => {
      const time = world.getResource(Time)
      if (time.current - last > 1) {
        last = time.current;
        return true;
      }
      return false;
    },
  })
  
  return null;
}

export const BoxRender: React.FC<BoxProps> = (props) => {
  const ref = useRef<Mesh>(null)
  const entity = useCurrentEntity()

  useSystem((world) => {
    const position= world.get(entity, Position)
    const quaternion = world.get(entity, Quaternion)
    const mesh = ref.current
    if (!mesh) return
    mesh.position.set(position.x, position.y, position.z)
    mesh.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w)
  })

  return <mesh ref={ref} >
    <boxGeometry attach="geometry" args={[props.width, props.height, 1]} />
    <meshStandardMaterial attach="material" color={props.color} />
  </mesh>
}


export const BoxEntities: React.FC = () => {
  return <Entities query={[Box]}>
    <BoxRender color="#fff666" width={1} height={1} />
  </Entities>
}