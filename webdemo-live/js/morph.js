// «Волна и искры» — замена сырой фразы чистой в одном облачке (порт FiMorph.swift). Время кадра — чистая функция от t, состояния между кадрами нет.
// Тайминги FiMorphT: блик 0,7 с, «желе» 0,82 с, перерасчёт высоты с 0,9 с за 0,3 с. Без зависимостей: чистая часть ниже тестируется в node, DOM-часть — playMorph.
export const SWEEP = 0.7, SETTLE = 0.9, HEIGHT = 0.3, FADE_OLD = 0.09, FADE_NEW = 0.3, JELLY = 0.82, LEAD = 8;
export const TOTAL = SETTLE + HEIGHT;   // 1,2 с: после этого облачко просто с новым текстом
export const SPARK_COLORS = ["#2BC48A", "#6FDDB4", "#C9F3E2", "#00875C"];

const clamp = (x, a = 0, b = 1) => Math.min(Math.max(x, a), b);

/** Кривая (0.3, 0.7, 0.3, 1): x∈[0,1] → y; решаем x(u) по Ньютону. */
export function bez(x, p1x = 0.3, p1y = 0.7, p2x = 0.3, p2y = 1) {
  let u = clamp(x);
  for (let i = 0; i < 8; i++) {
    const bx = 3 * (1 - u) * (1 - u) * u * p1x + 3 * (1 - u) * u * u * p2x + u * u * u;
    const d = 3 * (1 - u) * (1 - u) * p1x + 6 * (1 - u) * u * (p2x - p1x) + 3 * u * u * (1 - p2x);
    if (Math.abs(d) < 1e-6) break;
    u = clamp(u - (bx - x) / d);
  }
  return 3 * (1 - u) * (1 - u) * u * p1y + 3 * (1 - u) * u * u * p2y + u * u * u;
}
/** Положение блика, % ширины: от −22 до +122 по синусу (ease-in-out). */
export const pos = (t) => -22 + (144 * (1 - Math.cos(Math.PI * clamp(t / SWEEP)))) / 2;
/** Когда блик (по порядку букв k, %) касается буквы. Обратна pos. */
export const touch = (k) => (SWEEP * Math.acos(1 - 2 * clamp((k + 22) / 144))) / Math.PI;
/** Желе облачка: 1 → 1,01 → 0,998 → 1 за 0,82 с. */
export function jelly(t) {
  const u = t / JELLY;
  if (u <= 0 || u >= 1) return 1;
  const seg = (a, b, u0, u1) => a + (b - a) * bez((u - u0) / (u1 - u0));
  return u < 0.3 ? seg(1, 1.01, 0, 0.3) : u < 0.65 ? seg(1.01, 0.998, 0.3, 0.65) : seg(0.998, 1, 0.65, 1);
}
/** Порядок буквы: (cx + 0,18·cy) / ширина, %. */
export const order = (cx, cy, width) => ((cx + 0.18 * cy) / Math.max(1, width)) * 100;
/** Старая буква: 1 до касания, гаснет за 0,09 с. */
export const oldOpacity = (t, k) => { const tt = touch(k); return t < tt ? 1 : t < tt + FADE_OLD ? 1 - (t - tt) / FADE_OLD : 0; };
/** Новая буква: появляется на 8 % позади блика за 0,3 с: blur 6→0, opacity 0→1, сдвиг 2→0 px. */
export function newLetter(t, k) {
  const p = clamp((t - touch(k + LEAD)) / FADE_NEW);
  return { opacity: p, blur: 6 * (1 - p), dy: 2 * (1 - p) };
}
/** Высота: до 0,9 с прежняя, затем за 0,3 с (кривая .3,.7,.2,1) к новой. Доля 0…1. */
export const heightProgress = (t) => (t < SETTLE ? 0 : bez(clamp((t - SETTLE) / HEIGHT), 0.3, 0.7, 0.2, 1));
/** Три искры старой буквы: детерминированный «шум» от (буква, искра, соль), без Math.random — кадр воспроизводим. */
export function rnd(i, j, k) { const v = Math.sin((i * 131 + j * 17 + k * 7) * 12.9898) * 43758.5453; return v - Math.floor(v); }
export function sparks(t, n, k) {
  const tt = touch(k), out = [];
  for (let j = 0; j < 3; j++) {
    const life = Math.min(0.6, 0.56 + rnd(n, j, 1) * 0.078), age = t - tt;
    if (age < 0 || age > life) continue;
    const f = age / life;
    out.push({ f, alpha: (1 - f) * 0.95, r: 0.8 + rnd(n, j, 2) * 1.2, color: SPARK_COLORS[Math.floor(rnd(n, j, 3) * 4)], dx: f * (10 + rnd(n, j, 4) * 14), dy: -f * (8 + rnd(n, j, 5) * 12) });
  }
  return out;
}
/** Искра внутри облачка w×h (искры не вылетают за облачко). */
export const insideBubble = (x, y, w, h) => x >= 0 && y >= 0 && x <= w && y <= h;
/** Кадр целиком по t (письменные поля — для DOM-слоя): блик, желе, высота и видимость слоёв. */
export function frame(t) {
  return { sheen: t < SWEEP + 0.05 ? pos(t) : null, jelly: jelly(t), height: heightProgress(t), oldHidden: t >= SETTLE, done: t >= TOTAL };
}
/** prefers-reduced-motion: только fade 0,125 + 0,125 с. */
export function reducedFrame(t) {
  return { oldOpacity: clamp(1 - t / 0.125), newOpacity: clamp((t - 0.125) / 0.125), done: t >= 0.25 };
}

const NS = "http://www.w3.org/2000/svg";
const letters = (host, text) => {
  host.replaceChildren();
  const words = text.split(" ");
  words.forEach((w, wi) => {
    const s = document.createElement("span"); s.className = "w";
    for (const c of w) { const i = document.createElement("i"); i.textContent = c; s.append(i); }
    host.append(s); if (wi < words.length - 1) host.append(" ");
  });
};
/** Запустить анимацию в облачке `bubble` (его текст — прежний). Возвращает { cancel }. onDone вызывается один раз; после него в облачке обычный текст `to`. */
export function playMorph(bubble, from, to, { reduced = false, lowPower = false, onDone = () => {} } = {}) {
  let ended = false, raf = 0;
  const finish = () => { if (ended) return; ended = true; cancelAnimationFrame(raf); bubble.classList.remove("morphing"); bubble.style.transform = ""; bubble.replaceChildren(document.createTextNode(to)); onDone(); };
  if (from === to) { finish(); return { cancel: finish }; }
  const box = document.createElement("div"), oEl = document.createElement("div"), nEl = document.createElement("div");
  box.className = "mbox"; oEl.className = "mold"; nEl.className = "mnew"; box.append(oEl, nEl);
  letters(oEl, from); letters(nEl, to);
  bubble.replaceChildren(box); bubble.classList.add("morphing");
  const t0 = performance.now(), start = () => (performance.now() - t0) / 1000;
  if (reduced) {
    oEl.style.willChange = nEl.style.willChange = "opacity"; nEl.style.opacity = "0";
    const step = () => { const f = reducedFrame(start()); oEl.style.opacity = f.oldOpacity; nEl.style.opacity = f.newOpacity; f.done ? finish() : (raf = requestAnimationFrame(step)); };
    step(); return { cancel: finish };
  }
  const bw = box.getBoundingClientRect(), br = bubble.getBoundingClientRect();
  const offX = bw.left - br.left, offY = bw.top - br.top;   // где в облачке лежит текст (внутренние отступы)
  const lets = (el) => [...el.querySelectorAll("i")].map((e, n) => { const r = e.getBoundingClientRect(), cx = r.left - bw.left + r.width / 2, cy = r.top - bw.top + r.height / 2; return { e, n, cx, cy, k: order(cx, cy, bw.width) }; });
  const LO = lets(oEl), LN = lets(nEl), hOld = oEl.getBoundingClientRect().height, hNew = nEl.getBoundingClientRect().height;
  box.style.height = hOld + "px";
  const sheen = document.createElement("div"); sheen.className = "msheen";
  const cv = document.createElement("canvas"); cv.className = "mcv";
  // canvas ровно по облачку, с учётом devicePixelRatio (чёткие края); высота растёт вместе с облачком
  const W = br.width, H0 = br.height, Hmax = Math.max(H0, H0 + hNew - hOld), dpr = Math.max(1, window.devicePixelRatio || 1);
  cv.width = Math.round(W * dpr); cv.height = Math.round(Hmax * dpr); cv.style.width = W + "px"; cv.style.height = Hmax + "px";
  const ctx = cv.getContext("2d");
  bubble.append(sheen, cv);
  nEl.querySelectorAll("i").forEach((e) => { e.style.opacity = "0"; });
  const step = () => {
    const t = start(), f = frame(t);
    LO.forEach((l) => { l.e.style.opacity = oldOpacity(t, l.k); });
    LN.forEach((l) => { const s = newLetter(t, l.k); l.e.style.opacity = s.opacity; l.e.style.filter = !lowPower && s.blur > 0 ? `blur(${s.blur}px)` : "none"; l.e.style.transform = `translateY(${s.dy}px)`; });
    oEl.style.visibility = f.oldHidden ? "hidden" : "visible";
    box.style.height = hOld + (hNew - hOld) * f.height + "px";
    bubble.style.transform = `scale(${f.jelly})`;
    sheen.style.opacity = f.sheen == null ? 0 : 1;
    if (f.sheen != null) sheen.style.background = `linear-gradient(100deg,transparent ${f.sheen - 14}%,rgba(201,243,226,.30) ${f.sheen}%,transparent ${f.sheen + 14}%)`;
    if (ctx) {
      const Ht = H0 + (hNew - hOld) * f.height;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, Hmax);
      ctx.save(); ctx.beginPath(); ctx.roundRect ? ctx.roundRect(0, 0, W, Ht, 18) : ctx.rect(0, 0, W, Ht); ctx.clip();   // искры не вылетают за облачко
      LO.forEach((l) => { for (const s of sparks(t, l.n, l.k)) { const x = offX + l.cx + s.dx, y = offY + l.cy + s.dy; if (!insideBubble(x, y, W, Ht)) continue; ctx.globalAlpha = s.alpha; ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(x, y, s.r, 0, 7); ctx.fill(); } });
      ctx.restore();
    }
    f.done ? finish() : (raf = requestAnimationFrame(step));
  };
  step();
  return { cancel: finish };
}
