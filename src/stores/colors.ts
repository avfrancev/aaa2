const colors: Record<string, string> = reactive({
  p: '',
  pf: '',
  s: '',
  sf: '',
  a: '',
  af: '',
  b1: '',
  b2: '',
  b3: '',
  bc: '',
  n: '',
  nc: ''
})
const mode = useColorMode({
  attribute: 'data-theme',
  modes: {
    dark: 'dark',
    light: 'cupcake'
  }
})
watch(
  mode,
  () => {
    nextTick(() => {
      const rootElement = document.querySelector(':root')
      if (!rootElement) return
      const computedStyles = getComputedStyle(rootElement)
      Object.entries(colors).forEach(([key]) => {
        colors[key] = `oklch(${computedStyles.getPropertyValue(`--${key}`)})`
      })
    })
  },
  { immediate: true }
)

import themes from 'daisyui/src/theming/themes'

function getColor([k1, k2]: [string, string], [a1, a2] = [1, 1]) {
  return computed(() => {
    if (mode.value == 'dark') return darkColors[k1] + Math.floor(255 * a1).toString(16)
    return lightColors[k2] + Math.floor(255 * a2).toString(16)
  })
}

const darkColors = Object.assign({}, themes.dark, themes.dracula)
const lightColors = Object.assign({}, darkColors, themes.light, themes.cupcake)

export { colors, mode, getColor, darkColors, lightColors }

import { interpolateRainbow } from "d3-scale-chromatic"
import { color as d3Color } from "d3-color"

export const rainbowColors = Array.from(Array(20)).map((d, i) => {
  return d3Color(interpolateRainbow(i / 20))?.formatHex() as string
})

let usedColors: string[] = []

export function getRandomNotUsedColor(colors: string[] = rainbowColors): string {
  const filteredColors = colors.filter((color) => !usedColors.includes(color))
  const randomIndex = Math.floor(Math.random() * filteredColors.length)
  let c = filteredColors[randomIndex]
  if (!c) {
    usedColors = []
    c = getRandomNotUsedColor(colors)
  }
  usedColors.push(c)
  return c as string
}
