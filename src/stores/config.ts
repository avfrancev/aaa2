interface Config {
  useESP32: boolean
  esp32WSEndpoint: string
  pinMeasurements: boolean
}

export default defineStore("config", () => {
  
  const config = useStorage<Config>("config", reactive({
    useESP32: false,
    esp32WSEndpoint: window.location.origin+"/ws",
    pinMeasurements: true,
  }), localStorage, { mergeDefaults: false })

  return {
    config,
  }
})
