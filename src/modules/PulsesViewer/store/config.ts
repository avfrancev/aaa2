export const useConfig = createGlobalState(() => {
  const config = useStorage("config", reactive({
    useESP32: false,
    esp32WSEndpoint: window.location.origin + "/ws",
    pinMeasurements: true,
  }), localStorage, { mergeDefaults: false })

  return config.value
})