
const canvas = document.createElement("canvas")
const context = canvas.getContext("2d") as CanvasRenderingContext2D

export function measureText(s = "", font = "0.875rem monospace") {
  context.font = font
  return context.measureText(s).width;
}
