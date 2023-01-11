let load_sprite_sheet = (
  image_element: HTMLImageElement,
  column_widths: number | number[],
  row_heights: number | number[],
  scale?: number,
  column_padding = 0,
  row_padding = 0,
) => {
  let src_canvas: HTMLCanvasElement
  if (scale !== undefined) {
    src_canvas = resize_image_element(image_element, scale)
  } else {
    src_canvas = document.createElement("canvas")
    src_canvas.width = image_element.width
    src_canvas.height = image_element.height
    src_canvas
      .getContext("2d")!
      .drawImage(
        image_element,
        0,
        0,
        image_element.width,
        image_element.height,
      )
  }

  let normalized_scale = scale ?? 1
  let normalized_scaled_column_widths: number[]
  let normalized_scaled_row_heights: number[]

  let scaled_column_padding = column_padding * normalized_scale
  let scaled_row_padding = row_padding * normalized_scale

  let columns: number
  let rows: number

  if (typeof column_widths === "number") {
    let scaled_column_width = column_widths * normalized_scale
    columns =
      src_canvas.width / (scaled_column_width + scaled_column_padding)
    normalized_scaled_column_widths = Array(columns)
      .fill(0)
      .map(() => scaled_column_width)
  } else {
    normalized_scaled_column_widths = column_widths.map(
      column_width => column_width * normalized_scale,
    )
    columns = normalized_scaled_column_widths.length
  }

  if (typeof row_heights === "number") {
    let scaled_row_heights = row_heights * normalized_scale
    rows =
      src_canvas.height / (scaled_row_heights + scaled_column_padding)
    normalized_scaled_row_heights = Array(rows)
      .fill(0)
      .map(() => scaled_row_heights)
  } else {
    normalized_scaled_row_heights = row_heights.map(
      row_height => row_height * normalized_scale,
    )
    rows = normalized_scaled_row_heights.length
  }

  let sprites: HTMLCanvasElement[][] = []
  for (let i = 0; i < normalized_scaled_row_heights.length; i++) {
    let sprites_row = [] as HTMLCanvasElement[]
    sprites.push(sprites_row)
    for (let j = 0; j < normalized_scaled_column_widths.length; j++) {
      let sprite_canvas = document.createElement("canvas")
      let sprite_canvas_context = sprite_canvas.getContext("2d")!
      let normalized_scaled_row_height =
        normalized_scaled_row_heights[i]
      let normalized_scaled_column_width =
        normalized_scaled_column_widths[j]
      sprite_canvas.height = normalized_scaled_row_height
      sprite_canvas.width = normalized_scaled_column_width
      sprite_canvas_context.drawImage(
        src_canvas,
        j *
          (normalized_scaled_column_width +
            scaled_column_padding * j),
        i * (normalized_scaled_row_height + scaled_row_padding * i),
        normalized_scaled_column_width,
        normalized_scaled_row_height,
        0,
        0,
        normalized_scaled_column_width,
        normalized_scaled_row_height,
      )
      sprites_row.push(sprite_canvas)
    }
  }
  return sprites
}

let resize_image_element = (
  image_element: HTMLImageElement,
  scale: number,
) => {
  let src_canvas = document.createElement("canvas")
  let src_canvas_width = (src_canvas.width = image_element.width)
  let src_canvas_height = (src_canvas.height = image_element.height)
  let src_canvas_context = src_canvas.getContext("2d")!
  src_canvas_context.drawImage(image_element, 0, 0)
  let src_img_data = src_canvas_context.getImageData(
    0,
    0,
    src_canvas_width,
    src_canvas_height,
  )
  let dst_canvas = document.createElement("canvas")
  let dst_canvas_width = (dst_canvas.width = src_canvas_width * scale)
  let dst_canvas_height = (dst_canvas.height =
    src_canvas_height * scale)
  let dst_canvas_context = dst_canvas.getContext("2d")!
  let dst_img_data = dst_canvas_context.getImageData(
    0,
    0,
    dst_canvas_width,
    dst_canvas_height,
  )
  for (let y = 0; y < dst_canvas_height; y++) {
    for (let x = 0; x < dst_canvas_width; x++) {
      let i =
        (Math.floor(y / scale) * src_canvas_width +
          Math.floor(x / scale)) *
        4
      let j = (y * dst_canvas_width + x) * 4
      dst_img_data.data[j] = src_img_data.data[i]
      dst_img_data.data[j + 1] = src_img_data.data[i + 1]
      dst_img_data.data[j + 2] = src_img_data.data[i + 2]
      dst_img_data.data[j + 3] = src_img_data.data[i + 3]
    }
  }
  dst_canvas_context.putImageData(dst_img_data, 0, 0)
  return dst_canvas
}

export let bat_sprites = load_sprite_sheet(
  document.getElementById("bat") as HTMLImageElement,
  16,
  [16, 16],
  2,
  0,
  8,
)
export let rat_sprites = load_sprite_sheet(
  document.getElementById("rat") as HTMLImageElement,
  32,
  32,
  2,
)

export let orb_sprites = load_sprite_sheet(
  document.getElementById("orb") as HTMLImageElement,
  14,
  14,
)

export let loot_sprites = load_sprite_sheet(
  document.getElementById("loot") as HTMLImageElement,
  16,
  14,
)
