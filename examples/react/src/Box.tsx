import { type, value } from "@javelin/ecs"
import { Component, Entities, useCurrentEntity, useSystem } from "@javelin/react"
import { Mesh, Quaternion as ThreeQuaternion, Vector3 } from "three"
import { Time } from "./App"


export const MeshComponent = value<Mesh>()
export const Position = value<Vector3>()
export const Quaternion = value<ThreeQuaternion>()
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
const _tempVector3 = new Vector3()
export const CreateBoxSystem = () => {
  useSystem((world) => {
   world.create(Box, 
      _tempVector3.random().multiplyScalar(10).clone(),
      _tempQuaternion.random().clone(),
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
  const entity = useCurrentEntity()

  useSystem((world) => {
    const position= world.get(entity, Position)
    const quaternion = world.get(entity, Quaternion)
    const mesh = world.get(entity, MeshComponent)

    if (!mesh || !position || !quaternion) return
    mesh.position.set(position.x, position.y, position.z)
    mesh.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w)
  }, {
    predicate: world => world.exists(entity) && world.has(entity, Position) && world.has(entity, Quaternion) && world.has(entity, MeshComponent)
  })

  return (
  <Component type={MeshComponent}>
    <mesh >
      <boxGeometry attach="geometry" args={[props.width, props.height, 1]} />
      <meshStandardMaterial attach="material" color={props.color} />
    </mesh>
  </Component>)
}


export const BoxEntities: React.FC = () => {
  return <Entities query={[Box]}>
    <BoxRender color="#fff666" width={1} height={1} />
  </Entities>
}