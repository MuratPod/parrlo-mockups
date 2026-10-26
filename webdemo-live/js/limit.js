import { authConfigured } from "./auth.js";
// Суточный лимит бесплатных фраз веба. Число приходит ТОЛЬКО от сервера (в клиенте не зашито): без поля числа нет и счётчика.
// Контракт сервера (docs/api/web-limit.md): limit = { day, remaining, resets_at }; day = уже израсходованное + remaining (эффективный потолок вызывающего).
// Лежит в теле /v1/web/session, /v1/translate (JSON) и в данных события done (SSE), а также в теле 429. У web_budget только resets_at (без day/remaining) → null.
// Допускаем и прежние плоские формы (limit/used/remaining/reset_at на верхнем уровне или в quota). Нет ни remaining, ни day+used → null.

const num = (v) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : null);

/** Тело ответа → { limit, remaining, resetAt } или null. */
export function parseLimit(o) {
  if (!o || typeof o !== "object") return null;
  for (const c of [typeof o.limit === "object" ? o.limit : null, o, o.quota]) {
    if (!c || typeof c !== "object") continue;
    const limit = num(c.day ?? (typeof c.limit === "number" ? c.limit : null)), used = num(c.used);
    let remaining = num(c.remaining);
    if (remaining == null && limit != null && used != null) remaining = Math.max(0, limit - used);
    if (remaining == null) continue;
    const t = Date.parse(c.resets_at ?? c.reset_at ?? c.reset ?? "");
    return { limit: limit ?? null, remaining, resetAt: Number.isFinite(t) ? t : null };
  }
  return null;
}

/** Retry-After (секунды до 00:00Z) → момент сброса в мс; нет или не число → null. */
export function retryAt(header, now = Date.now()) {
  const n = Number(header);
  return header != null && header !== "" && Number.isFinite(n) && n >= 0 ? now + n * 1000 : null;
}

const dayKey = (ms) => new Date(ms).toISOString().slice(0, 10);   // сутки сервера — по UTC (server/src/store.ts day())

/** Последнее известное состояние лимита: в памяти и в localStorage (без cookie); сутки сбрасывают его по reset_at сервера, иначе по дате. */
export function createLimitStore({ storage = null, key = "parrlo.limit.v1", now = Date.now, onChange = () => {} } = {}) {
  let st = null;
  try { const v = JSON.parse(storage?.getItem(key) ?? "null"); if (v && typeof v === "object") st = v; } catch {}
  const save = () => { try { st ? storage?.setItem(key, JSON.stringify(st)) : storage?.removeItem(key); } catch {} };
  const fresh = () => {
    if (!st) return false;
    if (st.resetAt ? now() >= st.resetAt : st.day !== dayKey(now())) { st = null; save(); return false; }
    return true;
  };
  return {
    /** Принять состояние от сервера; null (поля не пришли) прежнее не трогает. */
    update(info) { if (!info) return; st = { limit: info.limit, remaining: info.remaining, resetAt: info.resetAt, day: dayKey(now()) }; save(); onChange(); },
    /** Сервер отказал по лимиту: осталось 0, число limit — прежнее (если было). */
    exhausted(info) { this.update(info ?? { limit: st && fresh() ? st.limit : null, remaining: 0, resetAt: st && fresh() ? st.resetAt : null }); },
    /** Вход/выход/бонус за шеринг/успешный перевод без полей лимита: прежнее число недействительно, остаток неизвестен (не ноль) до ответа сервера. */
    clear() { st = null; save(); onChange(); },
    get() { return fresh() ? { limit: st.limit, remaining: st.remaining, resetAt: st.resetAt } : null; },
  };
}

/** Код 429, который означает «квота фраз исчерпана». web_ip_day (сессии или секунды STT по IP) и web_budget — не квота фраз: остаток не обнуляем. */
export const isPhraseQuota = (code) => code === "web_day_anon" || code === "web_day_signed";

// ---------- экран лимита: регистрация или «скачайте приложение» ----------
/** Регистрация за исчерпанным лимитом включена, только если signupGate === true И заданы ключи Firebase И обе ссылки (условия, политика). Иначе — сразу «скачайте». */
export const signupGateOn = (cfg) => !!cfg && cfg.signupGate === true && authConfigured(cfg.firebase) && !!cfg.termsUrl && !!cfg.privacyUrl;

/** Какой экран показать по состоянию лимита: null — обычный; "signup" — аноним исчерпал, регистрация доступна; "download" — иначе.
 *  Числа не считаем: решает только remaining === 0 из ответа сервера. */
export function gateScreen({ remaining, gateOn, signed }) {
  if (remaining !== 0) return null;
  return gateOn && !signed ? "signup" : "download";
}

/** Коды 429, после которых показывается «скачайте» (потолок по IP) или нейтральное «попробуйте позже» (web_budget). */
export const isIpLimit = (code) => code === "web_ip_day";
export const isBudgetLimit = (code) => code === "web_budget";
