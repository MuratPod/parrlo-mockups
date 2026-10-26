import { parseLimit } from "./limit.js";
// Разбор потока SSE ответа /v1/translate (refine_translate): refined_delta → refined → delta → done | error.
// Фрагменты приходят произвольно: событие кончается пустой строкой; «\r\n» допустим; комментарии «:» пропускаются.

/** Разобрать накопленный буфер. Возвращает { events, rest }: готовые события и недочитанный хвост. */
export function parseSse(buffer) {
  const events = [];
  const parts = buffer.replace(/\r\n/g, "\n").split("\n\n");
  const rest = parts.pop();
  for (const block of parts) {
    let event = "message";
    const data = [];
    for (const line of block.split("\n")) {
      if (!line || line.startsWith(":")) continue;
      const i = line.indexOf(":");
      const field = i < 0 ? line : line.slice(0, i);
      const value = i < 0 ? "" : line.slice(i + 1).replace(/^ /, "");
      if (field === "event") event = value;
      else if (field === "data") data.push(value);
    }
    if (!data.length) continue;
    try { events.push({ event, data: JSON.parse(data.join("\n")) }); } catch { events.push({ event: "error", data: { error: "bad_event" } }); }
  }
  return { events, rest };
}

/** Читать тело ответа потоком: на каждое событие вызывается onEvent; возвращает итог {refined, output} из done. Бросает Error(code) на error. */
export async function readTranslateStream(body, onEvent) {
  const reader = body.getReader(), dec = new TextDecoder();
  let buf = "", result = null;
  const handle = (events) => {
    for (const e of events) {
      if (e.event === "error") throw Object.assign(new Error(e.data?.error || "upstream"), { code: e.data?.error || "upstream", retryable: !!e.data?.retryable, ...(parseLimit(e.data) ? { limit: parseLimit(e.data) } : {}) });
      onEvent?.(e);
      if (e.event === "done") result = { refined: e.data.refined ?? "", output: e.data.output ?? "", ...(parseLimit(e.data) ? { limit: parseLimit(e.data) } : {}) };
    }
  };
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const p = parseSse(buf);
    buf = p.rest;
    handle(p.events);
  }
  buf += dec.decode();
  if (buf.trim()) handle(parseSse(buf + "\n\n").events);
  if (!result) throw Object.assign(new Error("upstream"), { code: "upstream" });
  return result;
}
