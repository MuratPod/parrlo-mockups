// МОК для GitHub Pages (только эта копия; исходники PR #185 не менялись). Turnstile, /v1/* и wss STT подменены в браузере.
// Микрофон настоящий (звук никуда не уходит); распознавание и перевод — заготовленные фразы; лимит 5 фраз за загрузку страницы.
(() => {
  const BASE = "https://mock.parrlo.invalid", WSB = "wss://mock.parrlo.invalid", DAY = 5; let used = 0;
  console.info("[parrlo demo] мок API: ответы сервера подменены");
  const head = document.head, append = head.append.bind(head);
  head.append = (...nodes) => { for (const n of nodes) { if (n.tagName === "SCRIPT" && /challenges\.cloudflare\.com/.test(n.src)) setTimeout(() => n.onload?.(), 10); else append(n); } };
  window.turnstile = { render: (el, o) => { setTimeout(() => o.callback?.("mock-token"), 20); return "w"; }, reset() {}, remove() {} };
  const P = [["ну это счёт принесите пожалуйста", "Принесите счёт, пожалуйста.", "Tráigame la cuenta, por favor."],
    ["где тут туалет", "Где здесь туалет?", "¿Dónde está el baño?"],
    ["можно воды без газа", "Можно воды без газа?", "¿Me trae agua sin gas?"],
    ["сколько это стоит", "Сколько это стоит?", "¿Cuánto cuesta esto?"],
    ["спасибо всё было очень вкусно", "Спасибо, всё было очень вкусно.", "Gracias, todo estaba muy rico."]];
  let k = 0; const cur = () => P[k % P.length];
  const resets = () => new Date(Date.now() + 6 * 3600e3).toISOString(), lim = () => ({ day: DAY, remaining: Math.max(0, DAY - used), resets_at: resets() });
  const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
  const sse = (evs) => evs.map(([e, d]) => `event: ${e}\ndata: ${JSON.stringify(d)}\n\n`).join("");
  const wav = () => { const n = 800, b = new ArrayBuffer(44 + n * 2), v = new DataView(b), w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 8000, true); v.setUint32(28, 16000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true); return new Blob([b], { type: "audio/wav" }); };
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    if (!url.startsWith(BASE)) return realFetch(input, init);
    await new Promise((r) => setTimeout(r, 250));
    const p = new URL(url).pathname, exp = new Date(Date.now() + 2700e3).toISOString();
    if (p === "/v1/web/session") return J({ token: "mock", expires_at: exp, limit: lim() });
    if (p === "/v1/web/login") return J({ token: "mock-s", expires_at: exp, limit: lim() });
    if (p === "/v1/config") return J({ web_enabled: true, web: { max_stt_sec: 30 } });
    if (p === "/v1/web/ws-ticket") return J({ ticket: "mock", ttl_sec: 30 });
    if (p === "/v1/translate") {
      await new Promise((r) => setTimeout(r, 900));
      if (used >= DAY) return J({ error: "web_day_anon", limit: lim() }, 429);
      used++; const b = JSON.parse(init.body || "{}"), [, ru, es] = cur(); k++; const toEs = b.target_lang !== "ru";
      const src = toEs ? ru : es, out = toEs ? es : ru;
      return new Response(sse([["refined", { text: src }], ["delta", { text: out }], ["done", { refined: src, output: out, limit: lim() }]]), { headers: { "content-type": "text/event-stream" } });
    }
    if (p === "/v1/voice/tts") return new Response(wav(), { headers: { "content-type": "audio/wav" } });
    return J({ error: "not_found" }, 404);
  };
  const RealWS = window.WebSocket;
  class MockWS extends EventTarget {
    constructor(url) { super(); this.url = url; this.readyState = 0; this.binaryType = "blob"; this.n = 0; setTimeout(() => { this.readyState = 1; this.onopen?.({}); }, 60); }
    _emit(o) { setTimeout(() => this.onmessage?.({ data: JSON.stringify(o) }), 30); }
    send(m) {
      if (typeof m === "string" && m.startsWith("{")) return;
      const raw = cur()[0];
      if (m === "" || (typeof m === "string" && m.length === 0)) { this._emit({ type: "done", text: raw, language: "ru" }); return; }
      this.n++; if (this.n % 8 === 1) this._emit({ type: "transcript", text: raw.split(" ").slice(0, Math.min(raw.split(" ").length, 1 + (this.n >> 3))).join(" "), final: false });
    }
    close() { this.readyState = 3; setTimeout(() => this.onclose?.({ code: 1000 }), 10); }
  }
  window.WebSocket = function (url, pr) { return String(url).startsWith(WSB) ? new MockWS(url) : new RealWS(url, pr); };
  Object.assign(window.WebSocket, { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 });
})();
