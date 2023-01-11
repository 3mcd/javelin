export type Vector2 = {x: number; y: number}

let temp_vec = {x: 0, y: 0}

export let distance = (a: Vector2, b: Vector2) =>
  magnitude(subtract(a, b, temp_vec))

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

export let box_intersects = (
  pos_a: Vector2,
  box_a: Vector2,
  pos_b: Vector2,
  box_b: Vector2,
) => {
  let a_min_x = pos_a.x - box_b.x
  let b_max_x = pos_b.x + box_a.x / 2
  if (a_min_x > b_max_x) return false
  let a_max_x = pos_a.x + box_b.x
  let b_min_x = pos_b.x - box_a.x / 2
  if (a_max_x < b_min_x) return false
  let a_min_y = pos_a.y - box_b.y
  let b_max_y = pos_b.y + box_a.y / 2
  if (a_min_y > b_max_y) return false
  let a_max_y = pos_a.y + box_b.y
  let b_min_y = pos_b.y - box_a.y / 2
  return a_max_y >= b_min_y
}

export let circle_box_intersects = (
  circle_pos: Vector2,
  circle_radius: number,
  rect_pos: Vector2,
  rect_box: Vector2,
) => {
  let dx = Math.abs(circle_pos.x - rect_pos.x)
  let dy = Math.abs(circle_pos.y - rect_pos.y)
  if (dx > rect_box.x / 2 + circle_radius) return false
  if (dy > rect_box.y / 2 + circle_radius) return false
  if (dx <= rect_box.x / 2) return true
  if (dy <= rect_box.y / 2) return true
  let h =
    (dx - rect_box.x / 2) * (dx - rect_box.x / 2) +
    (dy - rect_box.y / 2) * (dy - rect_box.y / 2)
  return h <= circle_radius * circle_radius
}
