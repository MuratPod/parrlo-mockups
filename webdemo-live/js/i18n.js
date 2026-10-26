// Интерфейс веб-демо: ru / es / en (по navigator.languages, ручного выбора нет). Ключ → строка; {name} подставляется из аргументов.
// Нет перевода — английский, затем сам ключ. Русский — на «вы», испанский — на «tú».
export const UI_LANGS = ["ru", "es", "en"];

/** Язык интерфейса из navigator.languages (первый поддержанный); нет — en. */
export function uiLangFrom(languages) {
  for (const l of languages || []) {
    const c = String(l).toLowerCase().slice(0, 2);
    if (UI_LANGS.includes(c)) return c;
  }
  return "en";
}

/** Фиксированная пара демо RU ⇄ ES. «Я» — язык интерфейса, если он испанский (там я — es), иначе русский. */
export const pairFor = (ui) => (ui === "es" ? { me: "es", partner: "ru" } : { me: "ru", partner: "es" });

/** Названия языков на них самих (чипы, подписи под переводом). */
export const NATIVE = { ru: "Русский", es: "Español", en: "English" };
/** Подпись на кнопке — на ЯЗЫКЕ КНОПКИ, а не интерфейса. */
export const BTN_WORD = { ru: "Я говорю", es: "Yo hablo", en: "I speak" };
/** Язык в подписи кнопки для скринридера («Я говорю, русский»). */
export const LANG_ARIA = { ru: "русский", es: "español", en: "English" };
export const BTN_DONE = { ru: "Готово", es: "Terminar", en: "Done" };

/** Пометка под неактивной кнопкой Google Play. Пустая строка — пометки нет (по умолчанию). Включается заполнением значений, больше ничего менять не нужно. */
export const PLAY_NOTE = { ru: "", es: "", en: "" };

const S = {
  ru: {
    app: "Переводчик Parrlo", tagline: "Скажите, как можете —\nпрозвучите безупречно", pairLabel: "Пара языков",
    hint: "Нажмите «Я говорю» и говорите. Собеседник отвечает своей кнопкой.", healthNote: "Parrlo помогает объясниться в аптеке или у врача. Это не медицинская консультация.",
    chipMe: "Вы · {lang}", chipThem: "Собеседник · {lang}",
    recognized: "Распознано:", literary: "Литературно", translating: "Перевожу…", connecting: "Подключаюсь…",
    metaMe: "Вы · литературно", metaThem: "Собеседник · {code}", metaTr: "{lang} · в облаке", speak: "Произнести", stop: "Стоп", tapToFinish: "Нажмите, чтобы закончить",
    retry: "Повторить", close: "Закрыть",
    errMicDenied: "Нет доступа к микрофону", errMicHint: "Разрешите микрофон в настройках сайта", errNoMic: "Микрофон не найден. Подключите его и попробуйте ещё раз.",
    errMicBusy: "Микрофон занят другим приложением. Закройте его и попробуйте ещё раз.", errOffline: "Нет интернета", errFail: "Не удалось перевести",
    errTimeout: "Не удалось подключиться. Проверьте сеть и нажмите ещё раз.", errAudio: "Не удалось воспроизвести звук. Нажмите ещё раз.", errNoVoice: "Озвучка недоступна на этом устройстве.",
    errNoSpeech: "Не расслышали. Нажмите и скажите ещё раз.", errTooLong: "Слишком длинная фраза.", errBusy: "Слишком часто. Подождите минуту.",
    errSessionSlow: "Проверка затянулась. Нажмите «Повторить».", errSession: "Не удалось начать сеанс. Обновите страницу.", errUnavailable: "Веб-версия пока недоступна.",
    errLimit: "Сервис сейчас перегружен, попробуйте позже", errGeneric: "Не получилось. Попробуйте ещё раз.",
    errLogin: "Не удалось войти", errPopup: "Браузер заблокировал окно входа. Разрешите всплывающие окна для этого сайта.",
    listening: "Слушаю…", 
    groupMe: "Вы", groupThem: "Собеседник", swapSides: "Поменять местами", sheetDone: "Готово", pairOpen: "Пара языков: {pair}, изменить",
    signupTitle: "Бесплатные фразы на сегодня закончились", signupText: "Зарегистрируйтесь, чтобы продолжить перевод.", signInApple: "Войти с Apple", signInGoogle: "Войти с Google", signupNote: "Завтра фразы обновятся",
    dlTitle: "Скачайте приложение", dlText: "Продолжайте переводить в приложении Parrlo Translate", dlAppStore: "Скачать в App Store", dlPlay: "Скачать в Google Play",
    legal: "Продолжая, вы принимаете {terms} и {privacy}", legalTerms: "Условия", legalPrivacy: "Политику конфиденциальности",
    signedTitle: "Вход выполнен", signedContinue: "Продолжить",
  },
  es: {
    app: "Traductor Parrlo", tagline: "Habla como puedas,\nsuena impecable.", pairLabel: "Par de idiomas",
    hint: "Pulsa «Yo hablo» y habla. Tu interlocutor responde con su botón.", healthNote: "Parrlo te ayuda a explicarte en la farmacia o con el médico. No es una consulta médica.",
    chipMe: "Tú · {lang}", chipThem: "Interlocutor · {lang}",
    recognized: "Reconocido:", literary: "Literario", translating: "Traduciendo…", connecting: "Conectando…",
    metaMe: "Tú · literario", metaThem: "Interlocutor · {code}", metaTr: "{lang} · en la nube", speak: "Reproducir", stop: "Parar", tapToFinish: "Toca para terminar",
    retry: "Repetir", close: "Cerrar",
    errMicDenied: "Sin acceso al micrófono", errMicHint: "Permite el micrófono en los ajustes del sitio", errNoMic: "No encuentro el micrófono. Conéctalo e inténtalo de nuevo.",
    errMicBusy: "Otra aplicación usa el micrófono. Ciérrala e inténtalo de nuevo.", errOffline: "Sin internet", errFail: "No se pudo traducir",
    errTimeout: "No se pudo conectar. Comprueba la red y vuelve a pulsar.", errAudio: "No se pudo reproducir el sonido. Toca de nuevo.", errNoVoice: "La voz no está disponible en este dispositivo.",
    errNoSpeech: "No te he oído. Pulsa y repítelo.", errTooLong: "Frase demasiado larga.", errBusy: "Demasiado rápido. Espera un minuto.",
    errSessionSlow: "La comprobación tarda demasiado. Toca «Repetir».", errSession: "No se pudo iniciar la sesión. Recarga la página.", errUnavailable: "La versión web aún no está disponible.",
    errLimit: "El servicio está saturado, inténtalo más tarde", errGeneric: "No ha funcionado. Inténtalo de nuevo.",
    errLogin: "No se pudo iniciar sesión", errPopup: "El navegador bloqueó la ventana de acceso. Permite las ventanas emergentes de este sitio.",
    listening: "Escuchando…", 
    groupMe: "Tú", groupThem: "Interlocutor", swapSides: "Intercambiar", sheetDone: "Listo", pairOpen: "Par de idiomas: {pair}, cambiar",
    signupTitle: "Hoy ya no quedan frases gratis", signupText: "Regístrate para seguir traduciendo.", signInApple: "Iniciar sesión con Apple", signInGoogle: "Iniciar sesión con Google", signupNote: "Mañana se renuevan las frases",
    dlTitle: "Descarga la app", dlText: "Sigue traduciendo en la app Parrlo Translate", dlAppStore: "Descargar en App Store", dlPlay: "Descargar en Google Play",
    legal: "Al continuar, aceptas los {terms} y la {privacy}", legalTerms: "Términos", legalPrivacy: "Política de privacidad",
    signedTitle: "Sesión iniciada", signedContinue: "Continuar",
  },
  en: {
    app: "Parrlo Translate", tagline: "Say it however you can —\nsound flawless.", pairLabel: "Language pair",
    hint: "Tap “I speak” and speak. Your partner answers with their own button.", healthNote: "Parrlo helps you explain yourself at a pharmacy or doctor’s. It is not medical advice.",
    chipMe: "You · {lang}", chipThem: "Partner · {lang}",
    recognized: "Recognized:", literary: "Literary", translating: "Translating…", connecting: "Connecting…",
    metaMe: "You · literary", metaThem: "Other person · {code}", metaTr: "{lang} · in the cloud", speak: "Play", stop: "Stop", tapToFinish: "Tap to finish",
    retry: "Retry", close: "Close",
    errMicDenied: "No microphone access", errMicHint: "Allow the microphone in site settings", errNoMic: "No microphone found. Plug one in and try again.",
    errMicBusy: "The microphone is in use by another app. Close it and try again.", errOffline: "No internet", errFail: "Couldn’t translate",
    errTimeout: "Couldn’t connect. Check your network and tap again.", errAudio: "Couldn’t play the sound. Tap again.", errNoVoice: "Voice playback isn’t available on this device.",
    errNoSpeech: "Didn’t catch that. Tap and say it again.", errTooLong: "That phrase is too long.", errBusy: "Too fast. Wait a minute.",
    errSessionSlow: "The check is taking too long. Tap Retry.", errSession: "Couldn’t start a session. Reload the page.", errUnavailable: "The web version isn’t available yet.",
    errLimit: "The service is busy right now, try again later", errGeneric: "That didn’t work. Try again.",
    errLogin: "Couldn’t sign in", errPopup: "The browser blocked the sign-in window. Allow pop-ups for this site.",
    listening: "Listening…", 
    groupMe: "You", groupThem: "Partner", swapSides: "Swap", sheetDone: "Done", pairOpen: "Language pair: {pair}, change",
    signupTitle: "Today’s free phrases are used up", signupText: "Sign up to keep translating.", signInApple: "Sign in with Apple", signInGoogle: "Sign in with Google", signupNote: "Phrases renew tomorrow",
    dlTitle: "Download the app", dlText: "Keep translating in the Parrlo Translate app", dlAppStore: "Download on the App Store", dlPlay: "Get it on Google Play",
    legal: "By continuing, you agree to the {terms} and {privacy}", legalTerms: "Terms", legalPrivacy: "Privacy Policy",
    signedTitle: "Signed in", signedContinue: "Continue",
  },
};

export function t(lang, key, args = {}) {
  const raw = (S[lang] && S[lang][key]) ?? S.en[key] ?? key;
  return raw.replace(/\{(\w+)\}/g, (m, k) => (k in args ? String(args[k]) : m));
}
export const STRINGS = S;
