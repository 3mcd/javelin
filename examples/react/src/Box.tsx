import { type, value } from "@javelin/ecs"
import { Entity } from "@javelin/react"

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

export const BoxRender: React.FC<BoxProps> = (props) => {
  return <mesh>
    <boxBufferGeometry attach="geometry" args={[props.width, props.height, 1]} />
    <meshStandardMaterial attach="material" color={props.color} />
  </mesh>
}


export const BoxEntity: React.FC = () => {
  return <Entity>
    <BoxRender color="#fff666" width={1} height={1} />
  </Entity>
}