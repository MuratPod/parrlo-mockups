// Parrlo Translate (web) — демо перевода, один в один как главный экран iOS: речь → литературная фраза → перевод теми же серверными вызовами.
// Только ядро: пара RU⇄ES, две капсулы, лента из облачков, лимит (регистрация за флагом → «скачайте приложение»). Чистая логика — в соседних модулях под тестами.
import { t, uiLangFrom, NATIVE, LANG_ARIA, BTN_WORD, BTN_DONE, PLAY_NOTE } from "./i18n.js";
import { readTranslateStream } from "./sse.js";
import { createLimitStore, isPhraseQuota, signupGateOn, gateScreen, isIpLimit, isBudgetLimit } from "./limit.js";
import { createApi, errorKey, retryToken } from "./api.js";
import { hasLocalVoice, play, speakLocal, startRecording, stopPlayback, unlockAudio } from "./audio.js";
import { createTurnstile } from "./turnstile.js";
import { createAuth } from "./auth.js";
import { LANGS, loadPair, savePair, setSide, swapPair } from "./pair.js";
import { playMorph } from "./morph.js";
import { legalLink } from "./legal.js";

const CFG = window.PARRLO_CONFIG || {};
const mem = new Map();
const store = {
  getItem: (k) => { try { return localStorage.getItem(k); } catch { return mem.get(k) ?? null; } },
  setItem: (k, v) => { try { localStorage.setItem(k, v); } catch { mem.set(k, v); } },
  removeItem: (k) => { try { localStorage.removeItem(k); } catch { mem.delete(k); } },
};
const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
const UI = uiLangFrom(langs);
let PAIR = loadPair(store, UI);   // пара RU/ES/EN; меняется листом «Пара языков», хранятся только коды
const tr = (k, a) => t(UI, k, a);
const GATE = signupGateOn(CFG);
const PROVIDERS = (Array.isArray(CFG.firebase?.providers) ? CFG.firebase.providers : ["apple", "google"]).filter((p) => p === "apple" || p === "google");
const REDUCED = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const LOW_POWER = REDUCED || (navigator.hardwareConcurrency || 8) <= 2 || (navigator.deviceMemory || 8) <= 2;

// ---------- состояние ----------
const turns = [];            // реплики этой сессии
let rec = null;              // { side, handle }
let busy = false;            // идёт распознавание или перевод
let connecting = false;      // микрофон подключается
let banner = null;           // { text, hint?, retry? }
let micErr = "";             // сторона, у которой нет доступа к микрофону
let live = "";               // распознаваемый текст в живом облачке
let liveSide = "";           // чьё живое облачко (пока идёт запись или распознавание)
let win = null;              // окно фразы: { side, raw, clean }
let dockFocus = "";           // id капсулы, на которой был фокус клавиатуры
let dockPainting = false;     // идёт перерисовка дока: удаление сфокусированной капсулы не должно сбрасывать запомненный фокус
document.addEventListener("focusin", (e) => { if (!dockPainting && e.target !== document.body && !e.target.closest?.("#dock")) dockFocus = ""; });
let dismissed = false;       // экран лимита закрыт кнопкой «Закрыть»: лента видна, док остановлен
let signedNotice = false;    // после успешного входа: «Вход выполнен»
let playingId = null, activeMorph = null, ipLimited = false, signing = false, maxSttSec = 60, configLoaded = false;

const auth = createAuth({ cfg: CFG.firebase });
const AUTH_FLAG = "parrlo.auth.v1";   // «в этом браузере входили»: только тогда при запуске грузим SDK Firebase
// Лимит: число только из ответов сервера (limit.js); клиент ничего не считает и не зашивает.
let resetTimer = 0;
const limit = createLimitStore({ storage: store, onChange: () => scheduleReset() });
const api = createApi({ base: CFG.api || "", turnstileToken: (signal) => turnstileToken(signal), idToken: () => auth.idToken(),
  onLimit: (info, src) => { if (info) limit.update(info); else if (src === "login") limit.clear(); } });
if (auth.available && store.getItem(AUTH_FLAG) === "1") api.markSigned();

/** Экран лимита по ответам сервера: null — обычный. После resets_at limit.get() даёт null и экраны сбрасываются. */
const rawScreen = () => (ipLimited ? "download" : gateScreen({ remaining: limit.get()?.remaining, gateOn: GATE, signed: api.signed }));
const screen = () => (signedNotice ? "signed" : rawScreen() && !dismissed ? rawScreen() : null);
const locked = () => !!rawScreen() && dismissed;   // «Закрыть» нажато, лимит всё ещё исчерпан
function scheduleReset() {
  clearTimeout(resetTimer);
  const at = limit.get()?.resetAt;
  if (at) resetTimer = setTimeout(() => { ipLimited = false; if (!rec && !busy) render(); }, Math.min(Math.max(at - Date.now() + 500, 1000), 2 ** 31 - 1));
}

// Озвучивание состояния для скринридеров: «Слушаю… / Перевожу… / Готово / ошибка» (aria-live polite)
const say = (text) => { const el = document.getElementById("status"); if (el) el.textContent = text || ""; };

// ---------- DOM ----------
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith("on")) el[k] = v;
    else if (k === "class") el.className = v;
    else if (k === "text") el.textContent = v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(c));
  return el;
}
const NS = "http://www.w3.org/2000/svg";
const ICONS = {
  mic: '<rect x="8.6" y="2.6" width="6.8" height="12" rx="3.4"/><path class="ms" d="M5.6 11.2a6.4 6.4 0 0 0 12.8 0M12 17.6v3.2"/>',
  micOff: '<rect x="8.6" y="2.6" width="6.8" height="12" rx="3.4"/><path class="ms" d="M5.6 11.2a6.4 6.4 0 0 0 12.8 0M12 17.6v3.2"/><path d="M4 4l16 16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/>',
  spk: '<path d="M3 9.5v5h4l5 4v-13l-5 4H3Zm13.5 2.5a4 4 0 0 0-2-3.5v7a4 4 0 0 0 2-3.5Zm-2-7.9v2.1a7 7 0 0 1 0 11.6v2.1a9 9 0 0 0 0-15.8Z"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2.5"/>',
  arr: '<path d="M7 7h12M16 4l3 3-3 3M17 17H5M8 14l-3 3 3 3" fill="none"/>',
  apple: '<path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>',
  google: '<path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.500-.2-2.200H12v4.200h5.900a5 5 0 0 1-2.200 3.300v2.700h3.500c2.100-1.900 3.300-4.700 3.300-8Z"/><path fill="#34A853" d="M12 23c3 0 5.400-1 7.200-2.700l-3.500-2.700c-1 .7-2.200 1-3.700 1-2.800 0-5.200-1.900-6-4.500H2.400v2.800A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M6 14.100a6.600 6.600 0 0 1 0-4.200V7.100H2.400a11 11 0 0 0 0 9.800L6 14.100Z"/><path fill="#EA4335" d="M12 5.400c1.600 0 3 .6 4.200 1.600l3.100-3.100A11 11 0 0 0 2.400 7.100L6 9.900c.8-2.600 3.200-4.500 6-4.500Z"/>',
  play: '<path d="M6 3.800v16.400a.8.8 0 0 0 1.200.7l13.600-8.200a.8.8 0 0 0 0-1.400L7.200 3.100A.8.8 0 0 0 6 3.800Z"/>',
};
const icon = (n, cls = "") => { const s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", "0 0 24 24"); if (cls) s.setAttribute("class", cls); s.setAttribute("aria-hidden", "true"); s.innerHTML = ICONS[n]; if (n === "arr") { s.setAttribute("stroke", "currentColor"); } return s; };
const $app = () => document.getElementById("app");
const sideLang = (side) => (side === "me" ? PAIR.me : PAIR.partner);
const bubbleSide = (side) => (side === "me" ? "me" : "them");
const otherSide = (side) => (side === "me" ? "partner" : "me");
const isCyr = (s) => /[А-Яа-яЁё]/.test(s || "");
const uid = () => Array.from(crypto.getRandomValues(new Uint8Array(9)), (b) => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36]).join("");

// ---------- разметка ----------
function render() {
  document.documentElement.lang = UI;
  document.title = tr("app");
  stopMorph();
  if (!rawScreen()) dismissed = false;
  const sc = screen();
  const app = $app();
  if (sc) { app.replaceChildren(pageEl(sc)); paintBanner(); if (sc === "signup") auth.warm(); return; }
  app.replaceChildren(
    h("header", { class: "top" },
      h("div", { class: "brand" }, h("img", { class: "mark", src: "mark.svg", alt: "", width: "28", height: "32" }), h("span", { class: "wt" }, "Pa", h("i", { text: "rr" }), "lo")),
      h("button", { class: "pair glass", id: "pair-pill", "aria-label": tr("pairOpen", { pair: `${PAIR.me.toUpperCase()} ⇄ ${PAIR.partner.toUpperCase()}` }), "aria-haspopup": "dialog", "aria-disabled": pairLocked() ? "true" : null, onclick: openPairSheet },
        h("b"), PAIR.me.toUpperCase(), icon("arr"), PAIR.partner.toUpperCase(), h("b"))),
    h("div", { id: "banner" }), h("main", { class: "feed", id: "feed", "aria-live": "polite" }), h("footer", { class: "dock", id: "dock" }));
  paintBanner(); paintFeed(); paintDock();
}
function paintBanner() {
  const el = document.getElementById("banner"); if (!el) return;
  if (banner) say("");   // ошибку озвучивает role="alert" баннера; в #status её не дублируем и сбрасываем устаревшее «Слушаю…/Перевожу…»
  if (!banner) { el.replaceChildren(); el.className = ""; el.removeAttribute("role"); return; }
  el.className = "banner" + (banner.net ? " glass net" : ""); el.setAttribute("role", "alert");
  el.replaceChildren(...[h("span", { text: banner.text }),
    banner.retry ? h("span", { "aria-hidden": "true", text: "·" }) : null,
    banner.retry ? h("button", { onclick: banner.retry, text: tr("retry") }) : null,
    banner.hint ? h("small", { text: banner.hint }) : null].filter(Boolean));
}
function paintDock() {
  const pill = document.getElementById("pair-pill"); if (pill) pill.setAttribute("aria-disabled", pairLocked() ? "true" : "false");
  const el = document.getElementById("dock"); if (!el) return;
  const wait = busy || connecting || !!rec, lk = locked();
  const mk = (side) => {
    const lang = sideLang(side), on = rec?.side === side, other = !!rec && !on, err = micErr === side;
    return h("button", { class: `mic ${side}` + (on ? " rec" : "") + (other ? " off" : "") + (!on && !other && (wait || lk) ? " busy" : ""), id: "mic-" + side, "data-lang": lang,
      disabled: (!on && wait) || null, "aria-disabled": (!on && (wait || lk)) ? "true" : null, "aria-pressed": on ? "true" : "false",
      "aria-label": on ? tr("tapToFinish") : `${BTN_WORD[lang]}, ${LANG_ARIA[lang]}`, onclick: () => onMic(side) },
      on ? h("span", { class: "stopsq", "aria-hidden": "true" }) : icon(err ? "micOff" : "mic"), h("span", { text: on ? BTN_DONE[lang] : BTN_WORD[lang] }));
  };
  if (el.contains(document.activeElement) && document.activeElement.id) dockFocus = document.activeElement.id;   // клавиатура: фокус остаётся на капсуле после перерисовки
  dockPainting = true;
  try { el.replaceChildren(h("div", { class: "mics" }, mk("me"), mk("partner"))); } finally { dockPainting = false; }
  const b = dockFocus && document.getElementById(dockFocus);
  if (b && !b.disabled) { b.focus({ preventScroll: true }); dockFocus = ""; }   // заблокированная на время подключения — вернём, как только станет активной
}
function paintFeed() {
  const feed = document.getElementById("feed"); if (!feed) return;
  stopMorph();
  const talking = turns.length || liveSide || win;
  feed.className = "feed" + (talking ? " conv" : "");
  if (!talking) {
    feed.replaceChildren(h("div", { class: "idle" }, h("img", { class: "mark", src: "mark.svg", alt: "", width: "92", height: "105" }),
      h("h1", { text: tr("tagline") }), h("p", { text: tr("hint") }),
      h("div", { class: "chips" }, h("span", { class: "chip" }, h("i", { class: "me" }), tr("chipMe", { lang: NATIVE[PAIR.me] })),
        h("span", { class: "chip" }, h("i", { class: "partner" }), tr("chipThem", { lang: NATIVE[PAIR.partner] }))),
      h("p", { class: "health", id: "health", text: tr("healthNote") })));
    return;
  }
  feed.replaceChildren(...turns.map(turnEl), ...(win ? [winEl()] : []), ...(liveSide ? [liveEl()] : []));
  feed.scrollTop = feed.scrollHeight;
}
const dots = () => [h("span", { class: "d" }), h("span", { class: "d" }), h("span", { class: "d" })];
function liveEl() {
  return h("div", { class: `turn ${bubbleSide(liveSide)} live`, id: "live" }, h("div", { class: "src" }, live ? live.slice(-90) + " " : "", ...dots()));
}
function paintLive(text) {
  live = text;
  const el = document.getElementById("live"); if (!el) return paintFeed();
  const src = el.querySelector(".src"); src.replaceChildren(live ? live.slice(-90) + " " : "", ...dots());
  const feed = document.getElementById("feed"); if (feed) feed.scrollTop = feed.scrollHeight;
}
function winEl() {
  return h("section", { class: "win", id: "win" },
    h("div", { class: "h" }, h("i"), h("span", { text: tr("literary") })),
    h("div", { class: "raw" }, h("b", { text: tr("recognized") }), " " + win.raw),
    h("div", { class: "clean", id: "win-clean", text: win.clean || "" }),
    h("div", { class: "f" }, h("span", { class: "spin", "aria-hidden": "true" }), h("span", { text: tr("translating") })));
}
function turnEl(x) {
  const side = bubbleSide(x.side), code = x.src.toUpperCase();
  const phrase = x.morphFrom != null ? x.morphFrom : (x.refined || x.original);
  const out = [h("div", { class: `turn ${side}` + (x.status === "error" ? " fail" : ""), "data-side": x.side, "data-lang": x.src, id: "t-" + x.id },
    h("div", { class: "src", id: "p-" + x.id, text: phrase }),
    h("div", { class: "meta" }, side === "me" ? h("i") : null, side === "me" ? tr("metaMe") : tr("metaThem", { code })))];
  if (x.status === "done") {
    out.push(h("div", { class: `turn ${side} t2`, id: "o-" + x.id },
      h("div", { class: "tr" + (isCyr(x.output) ? " cyr" : "") + (playingId === x.id ? " playing" : ""), lang: x.tgt }, h("span", { class: "tx", text: x.output }),
        h("button", { class: "sp" + (playingId === x.id ? " playing" : ""), "aria-label": playingId === x.id ? tr("stop") : tr("speak"), onclick: () => speak(x) }, icon(playingId === x.id ? "stop" : "spk"))),
      h("div", { class: "meta" }, tr("metaTr", { lang: NATIVE[x.tgt] }))));
  }
  return h("div", { class: "pt", id: "tt-" + x.id }, ...out);
}
function stopMorph() { const m = activeMorph; activeMorph = null; m?.cancel(); }
function startMorph(x) {
  const el = document.getElementById("p-" + x.id);
  if (!el || x.morphFrom == null) return;
  const from = x.morphFrom, to = x.refined || x.original;
  activeMorph = playMorph(el, from, to, { reduced: REDUCED, lowPower: LOW_POWER, onDone: () => { x.morphFrom = null; const f = document.getElementById("feed"); if (f) f.scrollTop = f.scrollHeight; if (activeMorph && activeMorph.x === x) activeMorph = null; } });
  activeMorph.x = x;
}
function setPlaying(id) {
  playingId = id;
  document.querySelectorAll(".sp").forEach((b) => {
    const tid = b.closest(".turn")?.id.replace(/^o-/, "");
    const on = tid === id && id != null;
    b.classList.toggle("playing", on); b.closest(".tr")?.classList.toggle("playing", on); b.setAttribute("aria-label", on ? tr("stop") : tr("speak"));
    b.replaceChildren(icon(on ? "stop" : "spk"));
  });
}

// полноэкранные состояния — как онбординг iOS: знак, wordmark, заголовок
const wordmark = () => h("div", { class: "wm", "aria-hidden": "true" }, "Pa", h("i", { text: "rr" }), "lo");
const closeBtn = () => h("div", { class: "page-top" }, h("button", { class: "closebtn glass", id: "page-close", onclick: closePage, text: tr("close") }));
function closePage() { dismissed = true; signedNotice = false; banner = null; render(); }
/** «Продолжая, вы принимаете Условия и Политику конфиденциальности» со ссылками из config.js (новая вкладка). */
function legalLine() {
  const link = (kind, key) => { const l = legalLink(kind === "terms" ? CFG.termsUrl : CFG.privacyUrl, kind, UI); return h("a", { href: l.href, hreflang: l.lang, lang: l.lang, target: "_blank", rel: "noopener noreferrer", text: tr(key) }); };
  const parts = tr("legal").split(/(\{terms\}|\{privacy\})/).map((p) => (p === "{terms}" ? link("terms", "legalTerms") : p === "{privacy}" ? link("privacy", "legalPrivacy") : p));
  return h("div", { class: "note legal", id: "legal" }, ...parts);
}
function pageEl(kind) {
  const mid = h("div", { class: "mid" }, h("img", { class: "mark", src: "mark.svg", alt: "", width: "92", height: "105" }), wordmark());
  if (kind === "signed") {
    mid.append(h("h1", { text: tr("signedTitle") }));   // число лимита не показываем (решение Murat 25.10)
    return h("div", { class: "page", id: "page-signed" }, mid,
      h("div", { class: "cta" }, h("button", { class: "big mint", id: "signed-continue", onclick: () => { signedNotice = false; render(); }, text: tr("signedContinue") })));
  }
  if (kind === "signup") {
    mid.append(h("h1", { text: tr("signupTitle") }), h("p", { text: tr("signupText") }));
    const btn = (name) => h("button", { class: "big " + (name === "apple" ? "ink" : "light"), id: "login-" + name, disabled: signing || null, onclick: () => signIn(name) },
      icon(name), tr(name === "apple" ? "signInApple" : "signInGoogle"));
    return h("div", { class: "page", id: "page-signup" }, closeBtn(), mid, h("div", { id: "banner" }),
      h("div", { class: "cta" }, ...PROVIDERS.map(btn), h("div", { class: "note", text: tr("signupNote") }), legalLine()));
  }
  mid.append(h("h1", { text: tr("dlTitle") }), h("p", { text: tr("dlText") }));
  const cta = h("div", { class: "cta" }, h("a", { class: "big mint", id: "dl-appstore", href: CFG.appStoreUrl || "#", target: "_blank", rel: "noopener noreferrer" }, icon("apple"), tr("dlAppStore")));
  if (CFG.showPlayButton !== false) {   // выключатель: showPlayButton:false в config.js убирает кнопку совсем
    if (CFG.playUrl) cta.append(h("a", { class: "big light", id: "dl-play", href: CFG.playUrl, target: "_blank", rel: "noopener noreferrer" }, icon("play"), tr("dlPlay")));
    else {   // приложения в Google Play ещё нет: кнопка — не ссылка (без href и навигации), фокус разрешён, aria-disabled
      const note = PLAY_NOTE[UI] || "";
      cta.append(h("button", { type: "button", class: "big light", id: "dl-play", "aria-disabled": "true", "aria-label": tr("dlPlay"), "aria-describedby": note ? "dl-play-note" : null }, icon("play"), tr("dlPlay")));
      if (note) cta.append(h("div", { class: "note", id: "dl-play-note", text: note }));   // native append превращает null в текст «null» — не передаём
    }
  }
  return h("div", { class: "page", id: "page-download" }, closeBtn(), mid, cta);
}

// ---------- вход (экран «зарегистрируйтесь», за флагом signupGate) ----------
/** Только из click-обработчика (popup): вход → POST /v1/web/login → новый лимит приходит от сервера (onLimit) → «Вход выполнен» → лента возвращается. */
async function signIn(name) {
  if (signing || !auth.available) return;
  const popup = auth.signIn(name);   // синхронно из click, ДО любого render/await: иначе браузер блокирует popup
  signing = true; banner = null; paintBanner();
  document.querySelectorAll("#page-signup .big").forEach((b) => { b.disabled = true; });
  try {
    const id = await popup;
    await api.login(id);
    store.setItem(AUTH_FLAG, "1");
    signedNotice = true; dismissed = false;   // «Закрыть» во время входа не должно прятать экран лимита после «Продолжить»
  } catch (e) {
    banner = { text: tr("errLogin"), hint: errorKey(e) === "errPopup" ? tr("errPopup") : null, retry: () => signIn(name) };   // отмена, блокировка popup и сбой — один баннер «Не удалось войти · Повторить»; лента не теряется
  } finally { signing = false; render(); }
}

// ---------- лист «Пара языков» (как AEPairSheet в iOS: две группы, галочка, «Поменять местами», без выбора пола) ----------
const pairLocked = () => busy || connecting || !!rec;
let sheetEl = null, sheetOpener = null;
function openPairSheet() {
  if (pairLocked() || sheetEl) return;
  sheetOpener = document.activeElement;
  sheetEl = h("div", { class: "sheet-wrap", id: "pair-sheet" });
  document.body.append(sheetEl);
  for (const el of [$app(), document.querySelector(".bg")]) el?.setAttribute("inert", "");
  paintSheet("pair-done");
  document.addEventListener("keydown", sheetKeys, true);
}
function closePairSheet() {
  if (!sheetEl) return;
  sheetEl.remove(); sheetEl = null;
  document.removeEventListener("keydown", sheetKeys, true);
  for (const el of [$app(), document.querySelector(".bg")]) el?.removeAttribute("inert");
  (document.getElementById("pair-pill") || sheetOpener)?.focus?.();
}
function sheetKeys(e) {
  if (e.key === "Escape") { e.preventDefault(); closePairSheet(); return; }
  if (e.key !== "Tab") return;
  const f = [...sheetEl.querySelectorAll("button")];
  const i = f.indexOf(document.activeElement);
  if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
  else if (!e.shiftKey && (i === f.length - 1 || i < 0)) { e.preventDefault(); f[0].focus(); }
}
function choose(side, lang) { PAIR = setSide(PAIR, side, lang); savePair(store, PAIR); render(); paintSheet(`pair-${side}-${lang}`); }
function paintSheet(focusId) {
  if (!sheetEl) return;
  const group = (side, title) => h("div", { class: "grp", role: "group", "aria-labelledby": "grp-" + side },
    h("div", { class: "gh", id: "grp-" + side, text: title }),
    ...LANGS.map((l) => h("button", { class: "opt" + (PAIR[side] === l ? " on" : ""), id: `pair-${side}-${l}`, role: "radio", "aria-checked": PAIR[side] === l ? "true" : "false", onclick: () => choose(side, l) },
      h("span", { text: NATIVE[l] }), PAIR[side] === l ? h("span", { class: "tick", "aria-hidden": "true", text: "✓" }) : null)));
  sheetEl.replaceChildren(
    h("div", { class: "scrim", onclick: closePairSheet }),
    h("div", { class: "sheet", role: "dialog", "aria-modal": "true", "aria-labelledby": "pair-title" },
      h("div", { class: "grab", "aria-hidden": "true" }),
      h("h2", { id: "pair-title", text: tr("pairLabel") }),
      group("me", tr("groupMe")), group("partner", tr("groupThem")),
      h("button", { class: "swapbtn", id: "pair-swap", onclick: () => { PAIR = swapPair(PAIR); savePair(store, PAIR); render(); paintSheet("pair-swap"); } }, icon("arr"), tr("swapSides")),
      h("button", { class: "big mint", id: "pair-done", onclick: closePairSheet, text: tr("sheetDone") })));
  document.getElementById(focusId)?.focus();
}

// ---------- запись ----------
async function onMic(side) {
  unlockAudio();   // внутри жеста: iOS Safari иначе не даст проиграть озвучку позже
  if (locked()) { dismissed = false; render(); return; }   // тап по остановленной капсуле заново открывает экран лимита
  if (rec) return stopRec();
  if (busy || connecting) return;
  banner = null; micErr = ""; paintBanner();
  if (!navigator.onLine) return fail({ code: "offline" });
  cancelSpeech();
  connecting = true; liveSide = side; live = ""; paintFeed(); paintDock();
  if (!configLoaded) api.config().then((c) => { configLoaded = true; if (c?.web?.max_stt_sec) maxSttSec = c.web.max_stt_sec; }).catch(() => {});
  try {
    const handle = await startRecording({ prepare: () => api.token(), wsUrl: api.wsUrl, onSessionFail: api.reset, lang: sideLang(side), languages: [PAIR.me, PAIR.partner], maxSec: maxSttSec,
      onPartial: (txt) => paintLive(txt), onAutoStop: () => stopRec() });
    rec = { side, handle }; connecting = false; paintDock(); say(tr("listening"));
  } catch (e) { connecting = false; fail(e, false, side); }
}
async function stopRec() {
  if (!rec) return;
  const { side, handle } = rec; rec = null; busy = true; paintDock(); say(tr("translating"));
  try {
    const r = await handle.stop();
    await runTurn(side, r.text);   // направление — по нажатой кнопке (язык исходника = язык кнопки)
  } catch (e) { if (e?.code !== "handled") fail(e, true, side); return; }
  busy = false; liveSide = ""; live = ""; win = null; paintDock();
}
/** Ошибка лимита → экран (signup/download) или нейтральное «попробуйте позже». true — обработано. */
function limitFail(e) {
  if (isPhraseQuota(e?.code)) { limit.exhausted({ limit: e.limit?.limit ?? null, remaining: 0, resetAt: e.limit?.resetAt ?? null }); return true; }
  if (isIpLimit(e?.code)) { ipLimited = true; return true; }
  return false;
}
const dropTurn = (x) => { const i = turns.indexOf(x); if (i >= 0) turns.splice(i, 1); };   // x может быть ещё не вставлен: indexOf = −1 удалил бы последнюю завершённую фразу
function resetDock() { rec?.handle?.cancel?.(); rec = null; busy = false; connecting = false; live = ""; liveSide = ""; win = null; }
let retrying = false;
function fail(e, own = false, side = "") {
  if (retrying && !own) return;
  if (limitFail(e)) { resetDock(); render(); return; }
  if (["network", "stt_failed", "web_session"].includes(e?.code)) api.reset();
  resetDock();
  micErr = ["mic_denied", "no_mic"].includes(e?.code) ? side : "";
  const k = isBudgetLimit(e?.code) ? "errLimit" : errorKey(e) || "errGeneric";
  banner = { text: k === "errLimit" ? tr("errLimit") : tr(k === "errMicDenied" ? "errMicDenied" : k), hint: k === "errMicDenied" ? tr("errMicHint") : null, net: k === "errOffline",
    retry: ["turnstile_timeout", "connect_timeout", "session_reset"].includes(e?.code) ? retrySession : null };
  render();
}
function retrySession() {
  retrying = true; banner = null; busy = true; paintBanner(); paintDock();
  retryToken(api, 8000).then(() => { retrying = false; busy = false; paintDock(); }).catch((e) => { retrying = false; fail(e, true); });
}

// ---------- перевод ----------
async function translateText(body, onEvent) { return readTranslateStream((await api.translate(body)).body, onEvent); }
/** Один ход: STT-текст → окно фразы (refined_delta) → перевод. Фраза в ленте стартует сырой текст STT и «волной» становится чистой (refined с сервера). */
async function runTurn(side, text, existing) {
  const src = existing?.src ?? sideLang(side), tgt = existing?.tgt ?? sideLang(otherSide(side));   // повтор — на языках исходного хода, даже если пару сменили
  const x = existing ?? { id: uid(), side, src, tgt, original: text, refined: "", output: "", status: "translating" };
  liveSide = ""; live = ""; win = { side, raw: x.original, clean: "" }; paintFeed();
  let raf = 0;
  const soon = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; const c = document.getElementById("win-clean"); if (c) c.textContent = win?.clean || ""; }); };
  let r;
  try {
    r = await translateText({ text: x.original, source_lang: src, target_lang: tgt, style: "literary" }, (e) => {
      if (e.event === "refined_delta" || e.event === "refined") { win.clean = e.data.text; soon(); }
    });
  } catch (e) {
    cancelAnimationFrame(raf); win = null;
    if (limitFail(e)) { dropTurn(x); resetDock(); render(); throw Object.assign(new Error("handled"), { code: "handled" }); }
    if (isBudgetLimit(e?.code)) { dropTurn(x); throw e; }
    if (!turns.includes(x)) turns.push(x);
    Object.assign(x, { status: "error" });
    banner = { text: tr("errFail"), retry: () => { banner = null; paintBanner(); dropTurn(x); busy = true; paintDock();
      runTurn(x.side, x.original, x).then(() => { busy = false; paintDock(); }, (e) => { if (e?.code !== "handled") fail(e, true, x.side); }); } };
    paintBanner(); paintFeed(); return;
  }
  cancelAnimationFrame(raf); win = null;
  const refined = (r.refined || "").trim();
  Object.assign(x, { refined, output: r.output, status: "done", morphFrom: refined && refined !== x.original ? x.original : null });
  if (!turns.includes(x)) turns.push(x);
  if (r.limit) limit.update(r.limit); else limit.clear();   // остаток из done-события; без поля — неизвестен, а не 0
  paintFeed(); startMorph(x); say(tr("sheetDone"));
  if (limit.get()?.remaining === 0) setTimeout(() => { if (!rec && !busy) render(); }, 1600);   // последняя фраза: дать доиграть анимации, затем экран лимита
}

// ---------- озвучка ----------
let speechGen = 0, speechReset = null;
function cancelSpeech() { speechGen++; const r = speechReset; speechReset = null; stopPlayback(); r?.(); }
async function speak(x) {
  unlockAudio();
  if (playingId === x.id) { cancelSpeech(); return; }
  cancelSpeech();
  setPlaying(x.id);
  const done = () => { if (playingId === x.id) setPlaying(null); };
  speechReset = done;
  try {
    if (await speakOutput(x.output, x.tgt, done)) return;
    done(); banner = { text: tr("errNoVoice") }; paintBanner();
  } catch (e) { done(); banner = { text: tr(errorKey(e) || "errGeneric") }; paintBanner(); }
}
/** Русский — голосом браузера (CFG.ttsRuServer=true включит сервер), остальные — серверный голос; сбой сервера → голос браузера. */
async function speakOutput(text, lang, onEnd) {
  const gen = speechGen, stale = () => gen !== speechGen;
  if (lang === "ru" && !CFG.ttsRuServer && await hasLocalVoice("ru")) {
    if (stale()) return true;
    try { return await speakLocal(text, lang, onEnd); } catch {}
  }
  if (stale()) return true;
  try { const blob = await api.tts(text, lang); if (stale()) return true; await play(blob, onEnd); return true; }
  catch (e) {
    if (stale()) return true;
    if (!(lang === "ru" && !CFG.ttsRuServer) && await hasLocalVoice(lang)) { if (stale()) return true; return await speakLocal(text, lang, onEnd); }
    throw e;
  }
}

// ---------- Turnstile ----------
const turnstileToken = createTurnstile({ siteKey: CFG.turnstileSiteKey, ms: 7500 });   // меньше connectMs записи (8 с)

// ---------- запуск ----------
const goOffline = () => { banner = { text: tr("errOffline"), net: true }; paintBanner(); };
window.addEventListener("offline", goOffline);
window.addEventListener("online", () => { if (banner?.net) { banner = null; paintBanner(); } });
render();
if (!navigator.onLine) goOffline();
scheduleReset();
// Сессия (Turnstile + POST /v1/web/session) заранее, в фоне: к первому нажатию она готова. Ошибку не показываем — при нажатии она будет понятной.
if (CFG.turnstileSiteKey && navigator.onLine) setTimeout(() => api.token().catch(() => {}), 0);
