let loadSpriteSheet = (
  imageElement: HTMLImageElement,
  columnWidths: number | number[],
  rowHeights: number | number[],
  scale?: number,
  columnPadding = 0,
  rowPadding = 0,
) => {
  let srcCanvas: HTMLCanvasElement
  if (scale !== undefined) {
    srcCanvas = resizeImageElement(imageElement, scale)
  } else {
    srcCanvas = document.createElement("canvas")
    srcCanvas.width = imageElement.width
    srcCanvas.height = imageElement.height
    srcCanvas
      .getContext("2d")!
      .drawImage(
        imageElement,
        0,
        0,
        imageElement.width,
        imageElement.height,
      )
  }

  let normalizedScale = scale ?? 1
  let normalizedScaledColumnWidths: number[]
  let normalizedScaledRowHeights: number[]

  let scaledColumnPadding = columnPadding * normalizedScale
  let scaledRowPadding = rowPadding * normalizedScale

  let columns: number
  let rows: number

  if (typeof columnWidths === "number") {
    let scaledColumnWidth = columnWidths * normalizedScale
    columns =
      srcCanvas.width / (scaledColumnWidth + scaledColumnPadding)
    normalizedScaledColumnWidths = Array(columns)
      .fill(0)
      .map(() => scaledColumnWidth)
  } else {
    normalizedScaledColumnWidths = columnWidths.map(
      columnWidth => columnWidth * normalizedScale,
    )
    columns = normalizedScaledColumnWidths.length
  }

  if (typeof rowHeights === "number") {
    let scaledRowHeights = rowHeights * normalizedScale
    rows =
      srcCanvas.height / (scaledRowHeights + scaledColumnPadding)
    normalizedScaledRowHeights = Array(rows)
      .fill(0)
      .map(() => scaledRowHeights)
  } else {
    normalizedScaledRowHeights = rowHeights.map(
      rowHeight => rowHeight * normalizedScale,
    )
    rows = normalizedScaledRowHeights.length
  }

  let sprites: HTMLCanvasElement[][] = []
  for (let i = 0; i < normalizedScaledRowHeights.length; i++) {
    let spritesRow = [] as HTMLCanvasElement[]
    sprites.push(spritesRow)
    for (let j = 0; j < normalizedScaledColumnWidths.length; j++) {
      let spriteCanvas = document.createElement("canvas")
      let spriteCanvasContext = spriteCanvas.getContext("2d")!
      let normalizedScaledRowHeight =
        normalizedScaledRowHeights[i]
      let normalizedScaledColumnWidth =
        normalizedScaledColumnWidths[j]
      spriteCanvas.height = normalizedScaledRowHeight
      spriteCanvas.width = normalizedScaledColumnWidth
      spriteCanvasContext.drawImage(
        srcCanvas,
        j *
          (normalizedScaledColumnWidth +
            scaledColumnPadding * j),
        i * (normalizedScaledRowHeight + scaledRowPadding * i),
        normalizedScaledColumnWidth,
        normalizedScaledRowHeight,
        0,
        0,
        normalizedScaledColumnWidth,
        normalizedScaledRowHeight,
      )
      spritesRow.push(spriteCanvas)
    }
  }
  return sprites
}

let resizeImageElement = (
  imageElement: HTMLImageElement,
  scale: number,
) => {
  let srcCanvas = document.createElement("canvas")
  let srcCanvasWidth = (srcCanvas.width = imageElement.width)
  let srcCanvasHeight = (srcCanvas.height = imageElement.height)
  let srcCanvasContext = srcCanvas.getContext("2d")!
  srcCanvasContext.drawImage(imageElement, 0, 0)
  let srcImgData = srcCanvasContext.getImageData(
    0,
    0,
    srcCanvasWidth,
    srcCanvasHeight,
  )
  let dstCanvas = document.createElement("canvas")
  let dstCanvasWidth = (dstCanvas.width = srcCanvasWidth * scale)
  let dstCanvasHeight = (dstCanvas.height =
    srcCanvasHeight * scale)
  let dstCanvasContext = dstCanvas.getContext("2d")!
  let dstImgData = dstCanvasContext.getImageData(
    0,
    0,
    dstCanvasWidth,
    dstCanvasHeight,
  )
  for (let y = 0; y < dstCanvasHeight; y++) {
    for (let x = 0; x < dstCanvasWidth; x++) {
      let i =
        (Math.floor(y / scale) * srcCanvasWidth +
          Math.floor(x / scale)) *
        4
      let j = (y * dstCanvasWidth + x) * 4
      dstImgData.data[j] = srcImgData.data[i]
      dstImgData.data[j + 1] = srcImgData.data[i + 1]
      dstImgData.data[j + 2] = srcImgData.data[i + 2]
      dstImgData.data[j + 3] = srcImgData.data[i + 3]
    }
  }
  dstCanvasContext.putImageData(dstImgData, 0, 0)
  return dstCanvas
}

export let batSprites = loadSpriteSheet(
  document.getElementById("bat") as HTMLImageElement,
  16,
  [16, 16],
  2,
  0,
  8,
)
export let ratSprites = loadSpriteSheet(
  document.getElementById("rat") as HTMLImageElement,
  32,
  32,
  2,
)

export let orbSprites = loadSpriteSheet(
  document.getElementById("orb") as HTMLImageElement,
  14,
  14,
)

export let lootSprites = loadSpriteSheet(
  document.getElementById("loot") as HTMLImageElement,
  16,
  14,
)
