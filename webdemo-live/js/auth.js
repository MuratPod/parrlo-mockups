// Вход Google / Apple через Firebase Auth (SDK грузится только при входе или если пользователь уже входил: в обычном анонимном визите чужих скриптов нет).
// Ключи Firebase — публичные (config.js, пустые по умолчанию → кнопок нет). Сервер сам проверяет ID-токен; email и имя клиент никуда не передаёт.
export const SDK_VERSION = "10.14.1";
export const SDK_BASE = `https://www.gstatic.com/firebasejs/${SDK_VERSION}/`;
const err = (code) => Object.assign(new Error(code), { code });

/** Ключи Firebase заданы в config.js целиком (иначе вход скрыт). */
export const authConfigured = (cfg) => !!(cfg && cfg.apiKey && cfg.authDomain && cfg.projectId);

export function createAuth({ cfg, importer = (u) => import(u) }) {
  let sdk = null, auth = null, loading = null;
  /** Идемпотентно: одновременные вызовы делят один promise; initializeApp не дублируется (getApps). Сбой сбрасывает promise — следующая попытка начнёт заново. */
  function load() {
    if (!authConfigured(cfg)) return Promise.reject(err("auth_unavailable"));
    if (auth) return Promise.resolve();
    return (loading ??= (async () => {
      let app, mod;
      try { [app, mod] = await Promise.all([importer(SDK_BASE + "firebase-app.js"), importer(SDK_BASE + "firebase-auth.js")]); }
      catch { throw err("network"); }
      const exist = app.getApps?.().length ? app.getApp() : null;
      sdk = mod; auth = mod.getAuth(exist ?? app.initializeApp({ apiKey: cfg.apiKey, authDomain: cfg.authDomain, projectId: cfg.projectId, ...(cfg.appId ? { appId: cfg.appId } : {}) }));
    })().finally(() => { loading = null; }));
  }
  /** signInWithPopup вызывается синхронно, без await до него: popup открывается из жеста пользователя. */
  async function popup(name) {
    const provider = name === "apple" ? new sdk.OAuthProvider("apple.com") : new sdk.GoogleAuthProvider();
    try { return await (await sdk.signInWithPopup(auth, provider)).user.getIdToken(); }
    catch (e) {
      const c = e?.code || "";
      if (c === "auth/popup-closed-by-user" || c === "auth/cancelled-popup-request" || c === "auth/user-cancelled") throw err("auth_cancelled");
      if (c === "auth/popup-blocked") throw err("auth_popup_blocked");
      if (c === "auth/network-request-failed") throw err("network");
      throw err("auth_failed");
    }
  }
  return {
    available: authConfigured(cfg),
    /** Заранее подгрузить SDK (экран «зарегистрируйтесь»): popup потом открывается сразу из click, без ожидания импорта. */
    warm: () => load().catch(() => {}),
    /** Войти через "google" | "apple" во всплывающем окне → свежий Firebase ID-токен. SDK уже загружен (warm) → popup открывается синхронно в этом же вызове. */
    signIn(name) { return auth ? popup(name) : load().then(() => popup(name)); },
    /** Токен уже вошедшего пользователя (Firebase обновляет сам) или null; нужен при новой сессии Turnstile. */
    async idToken() {
      try { await load(); await auth.authStateReady?.(); return (await auth.currentUser?.getIdToken()) ?? null; } catch { return null; }
    },
    async signOut() { try { await load(); await sdk.signOut(auth); } catch {} },
  };
}
