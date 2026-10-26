// Микрофон → 16 кГц моно Int16 (mic-worklet.js) → WebSocket /v1/stt/live; озвучка; буфер обмена.

const coded = (code, msg) => Object.assign(new Error(msg || code), { code });
/** Ждать промис не дольше ms: потом — ошибка с кодом (сам промис не отменяется, но результат уже никому не нужен). */
export function within(p, ms, code = "connect_timeout") {
  let timer;
  return Promise.race([Promise.resolve(p), new Promise((_, rej) => { timer = setTimeout(() => rej(coded(code)), ms); })]).finally(() => clearTimeout(timer));
}
/** Ошибка getUserMedia → код интерфейса. */
export function micErrorCode(e) {
  const n = e?.name || "";
  if (n === "NotFoundError" || n === "OverconstrainedError" || n === "DevicesNotFoundError") return "no_mic";
  if (n === "NotReadableError" || n === "TrackStartError" || n === "AbortError") return "mic_busy";
  return "mic_denied";   // NotAllowedError, SecurityError и прочее
}

/** Записать фразу: старт открывает микрофон и сокет, stop() завершает и возвращает распознанный текст.
 *  prepare — подготовка сессии (возможно, проверка Turnstile) ДО микрофона и до билета сокета: билет живёт 30 с, а запрос разрешения
 *  на микрофон (особенно в Safari, где он спрашивается на каждой загрузке) может занять дольше. Каждый сетевой этап ограничен connectMs. */
export async function startRecording({ prepare, wsUrl, lang, languages, maxSec = 60, connectMs = 8000, onLevel, onPartial, onAutoStop, onSessionFail }) {
  if (!navigator.mediaDevices?.getUserMedia || !window.AudioContext || !window.AudioWorkletNode) throw coded("no_mic");
  // AudioContext создаём сразу, пока жив жест пользователя: Safari/iOS иначе оставляет его в suspended и звук не идёт
  let ctx;
  try { ctx = new AudioContext(); ctx.resume?.().catch(() => {}); } catch { throw coded("no_mic"); }
  const dropCtx = () => ctx?.close().catch(() => {});
  let stream;
  try {
    try { await within(prepare?.(), connectMs); } catch (e) { throw coded(e?.code || "network", e?.message); }
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); }
    catch (e) { throw coded(micErrorCode(e)); }
  } catch (e) { dropCtx(); throw e; }
  let ws, closed = false, node, an, raf, timer;
  const stopTracks = () => { cancelAnimationFrame(raf); clearTimeout(timer); stream.getTracks().forEach((t) => t.stop()); try { node?.disconnect(); } catch {} dropCtx(); };
  let url;
  try {
    url = await within(wsUrl(), connectMs);
    await ctx.resume?.().catch(() => {});
    await within(ctx.audioWorklet.addModule("mic-worklet.js"), connectMs);
    const src = ctx.createMediaStreamSource(stream);
    node = new AudioWorkletNode(ctx, "mic16k");
    an = ctx.createAnalyser(); an.fftSize = 512;
    src.connect(node); src.connect(an);
    ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";
  } catch (e) { stopTracks(); throw coded(e?.code || "network", e?.message); }

  const queue = [];
  let opened = false, finalText = "", doneResolve, doneReject, sent = 0;
  const done = new Promise((res, rej) => { doneResolve = res; doneReject = rej; });
  done.catch(() => {});
  // сокет отвергнут до открытия (токен привязан к IP/просрочен) — сбросить кэш сессии, повтор получит новую
  const fail = (code) => { if (!closed) { if (!opened) onSessionFail?.(); closed = true; stopTracks(); doneReject(Object.assign(new Error(code), { code })); } };
  ws.onopen = () => { opened = true; ws.send(JSON.stringify({ language: lang, ...(languages?.length ? { languages } : {}) })); for (const b of queue.splice(0)) ws.send(b); };
  ws.onmessage = (ev) => {
    let m; try { m = JSON.parse(ev.data); } catch { return; }
    if (m.type === "transcript") { finalText = m.text; onPartial?.(m.text); }
    else if (m.type === "done") { closed = true; doneResolve({ text: m.text ?? finalText, language: m.language }); }
    else if (m.type === "error") fail(m.error || "stt_failed");
  };
  ws.onerror = () => fail(navigator.onLine === false ? "offline" : "network");
  ws.onclose = (ev) => { if (!closed) { if (!opened) onSessionFail?.(); closed = true; stopTracks(); (finalText ? doneResolve({ text: finalText }) : doneReject(Object.assign(new Error("net"), { code: ev.code === 1006 ? "network" : "stt_failed" }))); } };
  node.port.onmessage = (e) => { sent += e.data.byteLength; if (ws.readyState === 1) ws.send(e.data); else if (ws.readyState === 0) queue.push(e.data); };

  const buf = new Uint8Array(an.fftSize);
  const tick = () => {
    an.getByteTimeDomainData(buf);
    let s = 0; for (const v of buf) { const x = (v - 128) / 128; s += x * x; }
    onLevel?.(Math.min(1, Math.sqrt(s / buf.length) * 3.2));
    raf = requestAnimationFrame(tick);
  };
  tick();
  timer = setTimeout(() => onAutoStop?.(), Math.max(3, maxSec - 2) * 1000);

  return {
    /** Закончить запись: дослать хвост, пустое сообщение = конец звука; ждём done от сервера. */
    async stop() {
      cancelAnimationFrame(raf); clearTimeout(timer);
      stream.getTracks().forEach((t) => t.stop());
      node.port.postMessage("flush");
      await new Promise((r) => setTimeout(r, 60));
      if (!sent) { fail("no_speech"); ws.close(); return done; }
      try { ws.readyState === 1 ? ws.send("") : queue.push(""); } catch {}
      const guard = setTimeout(() => fail("stt_failed"), 12000);
      try { const r = await done; if (!r.text?.trim()) throw Object.assign(new Error("no_speech"), { code: "no_speech" }); return r; }
      finally { clearTimeout(guard); stopTracks(); try { ws.close(); } catch {} }
    },
    cancel() { closed = true; stopTracks(); try { ws.close(); } catch {} },
  };
}

// Один общий <audio>: iOS Safari разрешает play() только на элементе, «разблокированном» внутри жеста пользователя,
// а mp3 приходит по сети уже после жеста. unlockAudio() вызывается синхронно из обработчика нажатия.
let el = null, unlocked = false, player = null;
const SILENT_WAV = () => {
  const b = new Uint8Array(44 + 2); const v = new DataView(b.buffer);
  const w = (o, t) => [...t].forEach((c, i) => (b[o + i] = c.charCodeAt(0)));
  w(0, "RIFF"); v.setUint32(4, 38, true); w(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true); v.setUint32(28, 16000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, 2, true);
  return new Blob([b], { type: "audio/wav" });
};
export function unlockAudio() {
  try {
    if (typeof Audio === "undefined") return;
    el ??= new Audio();
    if (!unlocked) {
      unlocked = true;
      const u = URL.createObjectURL(SILENT_WAV());
      el.src = u; el.muted = true;
      el.play().then(() => { el.pause(); el.muted = false; URL.revokeObjectURL(u); }).catch(() => { el.muted = false; unlocked = false; URL.revokeObjectURL(u); });
    }
    window.speechSynthesis?.resume?.();
  } catch {}
}
/** Проиграть mp3 (Blob); повторный вызов останавливает предыдущий. Промис выполняется, когда звук пошёл; отказ воспроизведения — исключение (onEnd при этом не зовётся). */
export async function play(blob, onEnd) {
  stopPlayback();
  el ??= new Audio();
  const a = el, url = URL.createObjectURL(blob);
  const me = { a, url, onEnd };
  player = me;
  const end = () => { if (player === me) { player = null; a.onended = a.onerror = null; URL.revokeObjectURL(url); onEnd?.(); } };
  a.onended = end; a.onerror = end;
  a.muted = false; a.src = url;
  try { await a.play(); }
  catch (e) { if (player === me) { player = null; a.onended = a.onerror = null; URL.revokeObjectURL(url); } throw coded(e?.name === "NotAllowedError" ? "audio_blocked" : "audio_failed"); }
}
let playGen = 0;   // растёт при каждой остановке: speakLocal не стартует речь, если остановили, пока искали голос
/** Стоп пользователя/листа/новой записи: cancel() браузерной речи шлём, только если синтез идёт/ждёт или наша фраза ещё не закончилась
 *  (cancel вхолостую даёт следующей фразе ложный interrupted в Chrome/Firefox); отложенные запуски озвучки отменяются. */
export function stopPlayback() { stopAll(); }
let cancelledAt = 0;   // когда мы в последний раз слали cancel: следующую фразу запускаем не раньше чем через тик
function stopAll() {
  playGen++;
  try { const y = window.speechSynthesis; if (y && (y.speaking || y.pending || local)) { y.cancel(); cancelledAt = Date.now(); } } catch {}
  if (local) { const { onEnd } = local; local = null; onEnd?.(); }
  if (!player) return;
  const { a, url, onEnd } = player; player = null;
  a.onended = a.onerror = null;
  a.pause(); URL.revokeObjectURL(url); onEnd?.();
}

// Запасной голос — Web Speech API браузера (без сети и расходов). Для русского он основной, пока серверный пресет flash не выкачен.
let local = null;
const synth = () => (typeof window !== "undefined" && window.speechSynthesis && window.SpeechSynthesisUtterance ? window.speechSynthesis : null);
async function voices(s) {
  let v = s.getVoices();
  if (v.length) return v;
  await new Promise((r) => { const t = setTimeout(r, 1200); s.addEventListener?.("voiceschanged", () => { clearTimeout(t); r(); }, { once: true }); });
  return s.getVoices();
}
/** Есть ли в браузере голос для языка (ru/es/en). */
export async function hasLocalVoice(lang) {
  const s = synth(); if (!s) return false;
  try { return (await voices(s)).some((v) => v.lang?.toLowerCase().startsWith(lang)); } catch { return false; }
}
/** Озвучить текст голосом браузера. Выполняется, когда речь началась; false — голоса/движка нет; ошибка синтеза — исключение tts_failed
 *  (interrupted/canceled при нашей отмене — тишина; без неё — сбой). Остановка в ожидании голоса → true без речи. onEnd — конец или остановка. */
export async function speakLocal(text, lang, onEnd) {
  const s = synth(); if (!s) return false;
  const g0 = playGen;
  const vs = await voices(s).catch(() => []);
  const voice = vs.find((v) => v.lang?.toLowerCase().startsWith(lang) && v.localService) || vs.find((v) => v.lang?.toLowerCase().startsWith(lang));
  if (!voice) return false;
  if (playGen !== g0) return true;
  stopAll();   // растит playGen: g1 — «наш» номер после собственной отмены; любое дальнейшее изменение — отмена Стоп/листом/новой записью
  const g1 = playGen;
  if (Date.now() - cancelledAt < 50) {   // после cancel (наш или только что от Стоп) ждём тик, иначе Chrome/Firefox шлют новой фразе interrupted/canceled
    await new Promise((r) => setTimeout(r, 40));
    if (playGen !== g1) return true;
  }
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice; u.lang = voice.lang; u.rate = 1;
  const me = { onEnd };
  local = me;
  return new Promise((resolve, reject) => {
    let started = false;
    const timer = setTimeout(() => { started = true; resolve(true); }, 3000);   // движок не прислал onstart — считаем, что речь идёт
    const end = () => { clearTimeout(timer); if (local === me) { local = null; onEnd?.(); } if (!started) { started = true; resolve(true); } };
    u.onstart = () => { clearTimeout(timer); if (!started) { started = true; resolve(true); } };
    u.onend = end;
    u.onerror = (e) => {
      if (started) return end();
      // interrupted/canceled: наша отмена (playGen изменился) — тишина; иначе это ложный сигнал от cancel перед speak — сбой
      if ((e?.error === "interrupted" || e?.error === "canceled") && playGen !== g1) return end();
      clearTimeout(timer); started = true;
      if (local === me) local = null;
      reject(coded("tts_failed"));
    };
    try { s.resume?.(); } catch {}   // Chrome: очередь «залипает» в паузе после cancel
    s.speak(u);
  });
}

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch {}
  const ta = document.createElement("textarea");
  ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
  document.body.append(ta); ta.select();
  let ok = false; try { ok = document.execCommand("copy"); } catch {}
  ta.remove(); return ok;
}
