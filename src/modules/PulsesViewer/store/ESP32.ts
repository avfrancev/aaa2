import {useConfig} from './config'

/**
 * parse a buffer received from ESP32 into an array of pulse durations
 * each pulse duration is stored as a 16-bit number, with the high bit
 * indicating the level (high or low) of the pulse
 */
function parse_rmt_buffer(data: Uint8Array) {
  let dur, i, j, _level, ref1, x1, x16_t, x2
  const arr = <number[]>[]
  for (i = j = 0, ref1 = data.length; j < ref1; i = j += 2) {
    x1 = data[i]
    x2 = data[i + 1]
    x16_t = (x2 << 8) | x1
    _level = (x16_t >> 15) & 1
    dur = x16_t & ~(1 << 15)
    arr.push(dur)
  }
  return arr
}

/**
 * parse a buffer received from ESP32 into an object with the following properties:
 */
function parse_rmt_message_struct(data: ArrayBuffer) {
  // typedef struct rmt_message_t
  // {
  //   uint16_t length;
  //   unsigned long time;
  //   int64_t delta;
  //   int rssi;
  //   rmt_data_t buf[512];
  // } rmt_message_t;

  const dv = new DataView(data)
  const length = dv.getUint16(0, true)
  const delta = dv.getUint32(8, true)
  const rssi = dv.getInt16(16, true)
  const buf = new Uint8Array(dv.buffer, 20, length * 4)
  const parsed_buf = parse_rmt_buffer(buf)
  return {
    length,
    delta,
    rssi,
    buf,
    parsed_buf,
  }
}

// export default defineStore('ESP32', () => {
export const useESP32 = createGlobalState(() => {
  const config = useConfig()

  const wsData: Array<any> = reactive([])

  const wsOptions = {
    heartbeat: { interval: 5000, pongTimeout: 2000 },
    immediate: config.useESP32,
    autoReconnect: {
      retries: 5,
      delay: 1000,
      onFailed() {
        setTimeout(() => {
          ws.open()
        }, 20000)
      },
    },
    onConnected: (ws: WebSocket) => {
      console.warn('WebSocket connected!')
      ws.binaryType = 'arraybuffer'
    },
    onDisconnected: () => console.warn('WebSocket disconnected'),
    onMessage: (ws: WebSocket, event: MessageEvent) => {
      if (event.data instanceof ArrayBuffer) {
        const parsedRMT = parse_rmt_message_struct(event.data)
        store.addWSData(parsedRMT)
      }
    },
  }

  const esp32WSEndpoint = computed(() => config.esp32WSEndpoint)
  let ws = useWebSocket(esp32WSEndpoint, wsOptions)

  watch(
    () => config.useESP32,
    () => {
      config.useESP32 ? ws.open() : ws.close()
    },
  )

  function addWSData(data: any) {
    wsData.push(data)
  }

  const store = { ws: WebSocket, wsData, addWSData }

  return store
})
