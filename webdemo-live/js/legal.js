// Ссылки «Условия» и «Политика конфиденциальности» по языку интерфейса. Базовые URL (config.js: termsUrl / privacyUrl) — испанская версия parrlo.com;
// ru и en лежат под /ru/… и /en/… (проверено 25.10: 200). /es/… на сайте нет (404) — для es берётся базовый URL. Прочие языки → en.
const PATH = { terms: "terms", privacy: "privacy" };

/** → { href, lang } для kind = "terms" | "privacy". Базовый URL не абсолютный (тесты, заглушки) — возвращается как есть. */
export function legalLink(base, kind, ui) {
  const lang = ui === "ru" || ui === "es" ? ui : "en";
  let origin;
  try { const u = new URL(base); if (u.protocol !== "https:" && u.protocol !== "http:") throw 0; origin = u.origin; } catch { return { href: base, lang }; }
  return { href: lang === "es" ? base : `${origin}/${lang}/${PATH[kind]}`, lang };
}
