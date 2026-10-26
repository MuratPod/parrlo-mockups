// Проверка Turnstile → токен. Каждый запуск имеет поколение: устаревший callback ничего не трогает в DOM и не резолвит чужого ожидателя.
// Зависимости внедряются (тесты на node).
const coded = (code) => Object.assign(new Error(code), { code });

export function createTurnstile({ siteKey, ms = 7500, doc = typeof document === "undefined" ? null : document, win = typeof window === "undefined" ? null : window, online = () => (typeof navigator === "undefined" ? true : navigator.onLine), loadScript } = {}) {
  let tsLoad, tsRun = 0;
  const load = loadScript || (() => new Promise((res, rej) => {
    const s = doc.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; s.async = true; s.onload = res; s.onerror = () => rej(coded(online() ? "network" : "offline"));
    doc.head.append(s);
  }));
  return function turnstileToken() {
    if (!siteKey) return Promise.reject(coded("web_unavailable"));
    tsLoad ??= load();
    const run = ++tsRun;
    let widget = null, over = false;
    const live = () => !over && run === tsRun;
    const solve = () => new Promise((resolve, reject) => {
      if (!live()) return reject(coded("turnstile"));
      const box = doc.getElementById("ts"); box.replaceChildren();
      const fail = () => { if (live()) reject(coded("turnstile")); };
      widget = win.turnstile.render(box, { sitekey: siteKey, appearance: "interaction-only",
        callback: (tok) => { if (!live()) return; box.replaceChildren(); resolve(tok); },
        "error-callback": fail, "timeout-callback": fail });
    });
    // один повтор: разовый сбой виджета (в т. ч. 401 при запуске) не должен ронять запись; если и он не прошёл — понятная ошибка сеанса
    const work = tsLoad.then(() => solve().catch(() => (live() ? solve() : Promise.reject(coded("turnstile")))));
    work.catch(() => {});
    // не ждём дольше ms: иначе при зависшей проверке человек 30–40 с видит «Подключаюсь…»; по таймауту снимаем свой виджет
    let timer;
    const timeout = new Promise((_, rej) => { timer = setTimeout(() => {
      over = true;
      if (run === tsRun) { try { win.turnstile?.remove?.(widget); } catch {} doc.getElementById("ts")?.replaceChildren(); }
      rej(coded("turnstile_timeout"));
    }, ms); });
    return Promise.race([work, timeout]).finally(() => clearTimeout(timer));
  };
}
