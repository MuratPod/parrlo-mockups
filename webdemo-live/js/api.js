import { parseLimit, retryAt } from "./limit.js";
// Клиент сервера-посредника: сессия (Turnstile → токен, X-Parrlo-Web) и вызовы /v1/*. Без глобалов — всё внедряется (тесты на node).

/** Код ошибки сервера/сети → ключ строки интерфейса. */
export function errorKey(e) {
  const c = e?.code || "";
  if (c === "offline") return "errOffline";
  if (c === "mic_denied") return "errMicDenied";
  if (c === "no_mic") return "errNoMic";
  if (c === "mic_busy") return "errMicBusy";
  if (c === "connect_timeout") return "errTimeout";
  if (c === "audio_blocked" || c === "audio_failed" || c === "tts_failed") return "errAudio";
  if (c === "no_speech") return "errNoSpeech";
  if (c === "web_unavailable" || c === "not_found" || c === "unavailable" || c === "web_forbidden") return "errUnavailable";
  if (c === "auth_cancelled") return "";
  if (c === "auth_popup_blocked") return "errPopup";
  if (c === "auth_invalid" || c === "auth_failed" || c === "auth_unavailable") return "errLogin";
  if (c === "turnstile_timeout") return "errSessionSlow";
  if (c === "web_session" || c === "turnstile" || c === "origin" || c === "attestation") return "errSession";
  if (c === "too_long" || c === "stt_max_duration" || c === "stt_too_large") return "errTooLong";
  if (c === "minute" || c === "stt_cap_minute") return "errBusy";
  if (/^(day|budget|web_ip_day|web_day_anon|web_day_signed|web_budget|voice_limit|tts_day|tts_install_day|stt_cap_|rate_limited)/.test(c)) return "errLimit";
  return "errGeneric";
}

/** «Повторить» после зависшей сессии: сбросить зависший запрос и получить новый токен не дольше ms; по таймауту — снова сбросить и connect_timeout. */
export async function retryToken(api, ms = 8000) {
  api.reset();
  let timer;
  try {
    return await Promise.race([api.token(), new Promise((_, rej) => { timer = setTimeout(() => rej(Object.assign(new Error("connect_timeout"), { code: "connect_timeout" })), ms); })]);
  } catch (e) { if (e?.code === "connect_timeout") api.reset(); throw e; }
  finally { clearTimeout(timer); }
}

export function createApi({ base, turnstileToken, idToken = async () => null, fetchImpl = (...a) => fetch(...a), now = Date.now, online = () => (typeof navigator === "undefined" ? true : navigator.onLine), onLimit = () => {} }) {
  let session = null, pending = null, ctl = null, loginCtl = null, epoch = 0, outEpoch = 0, signed = false;   // signed: пользователь вошёл — новая сессия сразу входит заново по свежему ID-токену
  const abortAll = () => { try { ctl?.abort(); } catch {} try { loginCtl?.abort(); } catch {} ctl = loginCtl = null; };
  const err = (code, status, limit, retryAtMs) => Object.assign(new Error(code), { code, status, ...(limit ? { limit } : {}), ...(retryAtMs ? { retryAt: retryAtMs } : {}) });

  // поколение запроса: reset() увеличивает epoch и отменяет запрос; поздний ответ устаревшего запроса сессию не трогает
  const untilAbort = (p, signal) => {
    if (!signal) return p;
    if (signal.aborted) { p.catch?.(() => {}); return Promise.reject(err("session_reset")); }
    return new Promise((res, rej) => {
      const onAbort = () => rej(err("session_reset"));
      signal.addEventListener("abort", onAbort, { once: true });
      p.then(res, rej).finally(() => signal.removeEventListener("abort", onAbort));
    });
  };
  const stale = (e0) => { if (e0 !== epoch) throw err("session_reset"); };
  async function newSession(e0, signal) {
    const ts = await untilAbort(turnstileToken(signal), signal);   // reset() прерывает и ожидание проверки
    stale(e0);
    let r;
    try { r = await fetchImpl(`${base}/v1/web/session`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ turnstile_token: ts }), signal }); }
    catch { stale(e0); throw err(online() ? "network" : "offline"); }
    const j = await r.json().catch(() => ({}));
    stale(e0);
    if (!r.ok) throw err(j.error || "web_session", r.status, parseLimit(j));
    onLimit(parseLimit(j), "session");
    const anon = { token: j.token, exp: Date.parse(j.expires_at) };
    if (!signed) return (session = anon);
    // вошедший не должен тихо стать анонимом (иначе ещё фразы сверх суточного лимита): нет ID-токена или вход не удался — ошибка, signed остаётся, повтор получит новую сессию.
    // Анонимный токен в session не публикуется до завершения входа: иначе token() отдаст его ожидающим, пока /v1/web/login ещё в полёте.
    const id = await idToken().catch(() => null);
    try { stale(e0); if (!id) throw err("auth_invalid"); await doLogin(id, anon.token); stale(e0); }
    catch (e) { if (e0 === epoch) session = null; throw e; }
    return session;
  }
  /** Вход на сервере: тот же sid сессии, токен с uid; анонимный расход сессии засчитывается. */
  async function doLogin(id, tk = session.token) {
    const e0 = epoch, c = typeof AbortController === "undefined" ? null : new AbortController();
    loginCtl = c;
    let r;
    try { r = await fetchImpl(`${base}/v1/web/login`, { method: "POST", headers: { "content-type": "application/json", "x-parrlo-web": tk }, body: JSON.stringify({ id_token: id }), signal: c?.signal }); }
    catch { stale(e0); throw err(online() ? "network" : "offline"); }
    finally { if (loginCtl === c) loginCtl = null; }
    const j = await r.json().catch(() => ({}));
    stale(e0);   // reset/выход, пока шёл вход: устаревший ответ токен не пишет и вошедшим не делает
    if (!r.ok) throw err(j.error || "auth_invalid", r.status);
    onLimit(parseLimit(j), "login");   // потолок вошедшего другой: берём число из ответа входа
    session = { token: j.token, exp: Date.parse(j.expires_at) };
    signed = true;
  }
  /** Токен сессии; обновляется за минуту до конца; параллельные вызовы делят один запрос. */
  async function token() {
    // каждый reset() (любое их число) будит ожидающих: если уже идёт запрос нового поколения — берут его, иначе (reset по таймауту, никто новый токен не просил) падают session_reset, а не плодят запросов;
    // после logout() — всегда падают (иначе вход воскреснет)
    const o0 = outEpoch;
    for (;;) {
      try { return await tokenOnce(); }
      catch (e) { if (e?.code !== "session_reset" || o0 !== outEpoch || !pending) throw e; }
    }
  }
  async function tokenOnce() {
    if (session && session.exp - now() > 60_000) return session.token;
    if (!pending) {
      const e0 = epoch, c = typeof AbortController === "undefined" ? null : new AbortController();
      ctl = c;
      const p = newSession(e0, c?.signal).finally(() => { if (pending === p) { pending = null; ctl = null; } });
      p.catch(() => {});   // без ожидающих отклонение (reset) не должно стать unhandled
      pending = p;
    }
    return (await pending).token;
  }
  async function call(path, init = {}, retry = true) {
    if (!online()) throw err("offline");
    const tk = await token();
    let r;
    try { r = await fetchImpl(base + path, { ...init, headers: { ...(init.headers || {}), "x-parrlo-web": tk } }); }
    catch { throw err(online() ? "network" : "offline"); }
    if (r.status === 401 && retry) { session = null; return call(path, init, false); }
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      const l = parseLimit(j), at = retryAt(r.headers?.get?.("retry-after"), now());   // Retry-After — запасной срок сброса, если в теле resets_at нет
      throw err(j.error || "upstream", r.status, l && !l.resetAt && at ? { ...l, resetAt: at } : l, at);
    }
    return r;
  }
  const json = (body) => ({ method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  return {
    token,
    /** WebSocket: в URL — одноразовый ticket на 30 с (сессионный токен в URL попадал бы в журналы), выдаётся по токену в заголовке. */
    wsUrl: async () => {
      const { ticket } = await (await call("/v1/web/ws-ticket", { method: "POST" })).json();
      return `${base.replace(/^http/, "ws")}/v1/stt/live?wt=${encodeURIComponent(ticket)}`;
    },
    /** refine_translate с потоком: возвращает Response (тело — SSE). */
    translate: (body) => call("/v1/translate", json({ task: "refine_translate", stream: true, client_version: "web-1", ...body })),
    tts: async (text, lang, gender) => (await call("/v1/voice/tts", json({ text, lang, ...(lang === "ru" ? { translate: true } : {}), ...(gender ? { gender } : {}) }))).blob(),
    report: (complaint) => call("/v1/report", json({ source: "guest_page", complaint })),
    /** Распознать готовую фразу файлом (WAV 16 кГц моно): реплика собеседника по QR приходит целиком, живой поток не нужен. → { text, language? } */
    sttFile: async (wav, lang, sec) => (await call("/v1/stt/file", { method: "POST", headers: { "content-type": "audio/wav", "x-milo-lang": lang, "x-milo-audio-sec": String(Math.max(0.1, Math.round(sec * 10) / 10)), "x-milo-filename": "guest.wav" }, body: wav })).json(),
    config: async () => (await fetchImpl(`${base}/v1/config`)).json(),
    /** Сбросить сессию и зависший запрос: следующий token() сделает НОВЫЙ запрос, ответ старого игнорируется. */
    reset: () => { session = null; epoch++; pending = null; abortAll(); },
    get signed() { return signed; },
    /** Пользователь уже входил в этом браузере: первая же сессия войдёт по его ID-токену. */
    markSigned: () => { signed = true; },
    /** Применить ID-токен Firebase (после входа или при старте у уже вошедшего). */
    async login(id) { await token(); await doLogin(id); },
    /** Выйти: новая анонимная сессия (лимит анонима — по IP, обнулить его выходом нельзя). */
    logout() { signed = false; outEpoch++; session = null; epoch++; pending = null; abortAll(); },
    /** «Поделиться»: +2 фразы за сеть, раз в сутки. */
    share: async (network) => (await call("/v1/web/share", json({ network }))).json(),
    /** Счётчик приглашений (сервер пока не отдаёт; вызывается только за флагом inviteApi): Response, не-2xx — исключение. */
    inviteStatus: () => call("/v1/web/invite/status"),
  };
}
