// Микрофон → 16 кГц моно Int16 (формат Whisper хозяина), кусками по ~0,25 с (4000 отсчётов).
class Mic16k extends AudioWorkletProcessor {
  constructor() {
    super()
    this.ratio = sampleRate / 16000
    this.pos = 0
    this.buf = new Int16Array(4000)
    this.n = 0
    this.last = 0
    this.port.onmessage = (e) => { if (e.data === 'flush') this.flush() }
  }
  flush() {
    if (this.n > 0) { this.port.postMessage(this.buf.slice(0, this.n).buffer); this.n = 0 }
  }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0]
    if (!ch) return true
    // линейная интерполяция с шагом ratio (48 кГц → 16 кГц, 44,1 → 16)
    while (this.pos < ch.length - 1) {
      const i = Math.floor(this.pos), f = this.pos - i
      const a = i < 0 ? this.last : ch[i]   // между кусками: последний отсчёт прошлого куска
      const v = a * (1 - f) + ch[i + 1] * f
      this.buf[this.n++] = Math.max(-32768, Math.min(32767, Math.round(v * 32767)))
      if (this.n === this.buf.length) { this.port.postMessage(this.buf.slice().buffer); this.n = 0 }
      this.pos += this.ratio
    }
    this.pos -= ch.length
    this.last = ch[ch.length - 1]
    return true
  }
}
registerProcessor('mic16k', Mic16k)
