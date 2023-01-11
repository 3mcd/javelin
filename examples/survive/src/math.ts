export type Vector2 = {x: number; y: number}

let tempVec = {x: 0, y: 0}

export let distance = (a: Vector2, b: Vector2) =>
  magnitude(subtract(a, b, tempVec))

export let magnitude = ({x, y}: Vector2) => {
  return Math.sqrt(x * x + y * y)
}

export let subtract = (a: Vector2, b: Vector2, out: Vector2) => {
  out.x = a.x - b.x
  out.y = a.y - b.y
  return out
}

export let normalize = (vec: Vector2, out = {x: 0, y: 0}) => {
  let length = magnitude(vec)
  out.x = vec.x / length
  out.y = vec.y / length
  return out
}

export let boxIntersects = (
  posA: Vector2,
  boxA: Vector2,
  posB: Vector2,
  boxB: Vector2,
) => {
  let aMinX = posA.x - boxB.x
  let bMaxX = posB.x + boxA.x / 2
  if (aMinX > bMaxX) return false
  let aMaxX = posA.x + boxB.x
  let bMinX = posB.x - boxA.x / 2
  if (aMaxX < bMinX) return false
  let aMinY = posA.y - boxB.y
  let bMaxY = posB.y + boxA.y / 2
  if (aMinY > bMaxY) return false
  let aMaxY = posA.y + boxB.y
  let bMinY = posB.y - boxA.y / 2
  return aMaxY >= bMinY
}

export let circleBoxIntersects = (
  circlePos: Vector2,
  circleRadius: number,
  rectPos: Vector2,
  rectBox: Vector2,
) => {
  let dx = Math.abs(circlePos.x - rectPos.x)
  let dy = Math.abs(circlePos.y - rectPos.y)
  if (dx > rectBox.x / 2 + circleRadius) return false
  if (dy > rectBox.y / 2 + circleRadius) return false
  if (dx <= rectBox.x / 2) return true
  if (dy <= rectBox.y / 2) return true
  let h =
    (dx - rectBox.x / 2) * (dx - rectBox.x / 2) +
    (dy - rectBox.y / 2) * (dy - rectBox.y / 2)
  return h <= circleRadius * circleRadius
}
