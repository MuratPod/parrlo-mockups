// Пара языков демо: ru / es / en, «я» (me) и собеседник (partner). Без выбора пола. Хранится только пара кодов в localStorage.
import { UI_LANGS, pairFor } from "./i18n.js";
/** Языки пары = языки интерфейса: один источник (UI_LANGS), чтобы они не расходились. */
export const LANGS = UI_LANGS;
export const PAIR_KEY = "parrlo.pair.v1";

/** Пара из сохранённого: оба языка поддержаны и различны, иначе — по умолчанию для языка интерфейса. */
export function normalizePair(p, ui) {
  if (p && LANGS.includes(p.me) && LANGS.includes(p.partner) && p.me !== p.partner) return { me: p.me, partner: p.partner };
  return pairFor(ui);
}
/** Сменить язык одной стороны; если он совпал с другой — стороны меняются местами. */
export function setSide(pair, side, lang) {
  if (!LANGS.includes(lang)) return pair;
  const other = side === "me" ? "partner" : "me";
  if (pair[other] === lang) return { ...pair, [side]: lang, [other]: pair[side] };
  return { ...pair, [side]: lang };
}
/** «Поменять местами ⇄». */
export const swapPair = (pair) => ({ me: pair.partner, partner: pair.me });
export function loadPair(storage, ui) {
  let v = null;
  try { v = JSON.parse(storage?.getItem(PAIR_KEY) ?? "null"); } catch {}
  return normalizePair(v, ui);
}
export function savePair(storage, pair) { try { storage?.setItem(PAIR_KEY, JSON.stringify({ me: pair.me, partner: pair.partner })); } catch {} }
