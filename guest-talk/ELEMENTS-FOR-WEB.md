# Parrlo Translate · гостевая страница по QR — элементы для Web App (макет v1)

Макет, не прод-код. Открыть: `index.html` (слева панель: состояния, язык, рамка 360/390/430; на телефоне — кнопка «Макет» сверху; `?clean=1` скрывает панель). Все пути относительные, внешних зависимостей нет, шрифты лежат в `fonts/`. PNG: `png/web/{ru,es,en}/NN-состояние.png` (390×844 @2x), ширины 360/430/1440 — `png/web/widths/`.
Бренд v2.3, только тёмная тема. Фон `#12161C` + 3 небольших переливающихся пятна (медленный дрейф), при `prefers-reduced-motion` анимации выключены. Кнопка `#2BC48A` (текст `#0E1116`), перевод-облачко `#00875C` + белый текст, поверхность `#1C2026`/`#242B34`, знак-попугай `#00A86B` с клювом `#FFC247` (`mark.svg`), wordmark «Parrlo» — Nunito Black, «rr» зелёные (не капсом), интерфейс — Inter.

## 1. Принципы страницы
- Без регистрации, без настроек, без истории, без QR на странице. Одна кнопка записи + клавиатура как запасной путь.
- Язык интерфейса: `navigator.languages` → ru / es / en (иначе en). Переключателя на странице нет (панель макета — только для просмотра). `<html lang>` ставится по языку.
- Пара «гость → хозяин» приходит из ссылки QR (в макете зашита: RU→ES, ES→RU, EN→ES) и показана только как чип (не кнопка).
- Ничего не говорим о том, где и кем исполняется перевод/распознавание. Нигде нет чисел-лимитов.
- Запрещено в текстах: «вашим голосом», «всегда точно/без ошибок/мгновенно», «магия ИИ», «Для жизни в Испании», сравнения, «словарь», wordmark капсом, «скоро в App Store».

## 2. Состояния (панель макета, PNG)
| # | id | Что видно | Как попасть / куда идти |
|---|---|---|---|
| 1 | `welcome` | знак, слоган, подсказка, чипы пары; карточка «Нужен микрофон» со ссылкой «Лучше написать текстом»; кнопка «Я говорю» | старт; тап по кнопке → запрос браузера → `rec`; отказ → `err-mic` |
| 2 | `rec` | облачко с живой диктовкой (как есть, с запинками) + три точки; подпись «Слушаю…»; кнопка «Готово» с пульсирующим ореолом 5→14 px, 1,2 с | тап «Готово» → `proc` |
| 3 | `proc` | окно фразы: метка «Литературно», «Распознано: …», крупная чистая фраза, «Готовлю перевод…»; кнопка неактивна (50 %) | автоматически → `morph` |
| 4 | `morph` | «Волна и искры»: блик по облачку слева направо (0,7 с), буквы сырой фразы гаснут с искрами, чистая фраза проявляется с размытием, облачко «желе» (0,9 с), высота подстраивается (0,3 с); затем перевод выезжает снизу (14 px, масштаб 0,97→1, 0,38 с). В PNG — кадр t=0,7 с | → `done` |
| 5 | `done` | облачко фразы (мятое, справа) + подпись «Вы · литературно»; большое облачко перевода `#00875C` 22/29 bold + кнопка озвучки (зона 44 px) + подпись языка; ссылка «Скачать Parrlo»; кнопка «Я говорю» | тап по кнопке → новая реплика; ссылка → `download` |
| 6 | `text` | пара «Русский → Español» над полем, поле 3–4 строки, ✕ (52) и ↑ отправить (52, мята) | клавиатура в шапке / ссылка в `welcome` / кнопка в `err-mic`; ✕ → `welcome`; ↑ → `proc` → `done` |
| 7 | `err-mic` | красная иконка «микрофон перечёркнут», «Нет доступа к микрофону», пояснение, **основная кнопка «Написать текстом»**, раскрывашка «Как разрешить микрофон» (iPhone Safari / Android Chrome); кнопка записи 30 % с перечёркнутой иконкой | `getUserMedia` → NotAllowed/NotFound/NotReadable; нет HTTPS/MediaDevices |
| 8 | `offline` | плашка вверху (амбер): «Нет интернета» + «Повторить»; фраза остаётся в ленте с меткой «Не отправлено»; запись 30 %; точка пары янтарная | `offline`-событие / сетевая ошибка; «Повторить» → `welcome` |
| 9 | `limit` | нейтральная иконка «облако перечёркнуто», «Перевод сейчас недоступен», «Обратитесь к тому, кто показал QR.», кнопка «Проверить ещё раз»; запись 30 % | ответ сервера «квота хозяина исчерпана». **Без чисел и без кнопок скачивания** (установка проблему не решает) |
| 10 | `download` | лента затемнена, снизу лист: «Скачайте Parrlo», две полноценные кнопки (56 px) App Store и Google Play, «Не сейчас» | ссылка в `done`; ссылки-заглушки `#` |

Размеры: кнопка записи 62 px (капсула), зоны касания ≥44 px (проверено скриптом на всех состояниях), облачка: радиус 18, хвост 6, отступы 10/15/11/15 и 13/18/14/18; шапка: знак 32, чип пары 40, клавиатура 44.
Контраст текста ≥4,5:1 (перевод в облачке — крупный, ≥3:1, фактически 4,55). Для вторичного текста на фоне с пятнами взят `#B4BDC9` вместо `#9AA4B2` (иначе 4,3–4,4 над пятном).

## 3. Тексты (RU / ES / EN)
ES — на «tú», RU — на «вы» (обоснование — в отчёте). В ES-строках местоимение избегаем там, где можно.

| Элемент | RU | ES | EN |
|---|---|---|---|
| Заголовок (приветствие) | Скажите, как можете — прозвучите безупречно | Habla como puedas, suena impecable. | Say it however you can — sound flawless. |
| Подзаголовок | Нажмите кнопку и говорите на своём языке. Перевод появится на экране. | Pulsa el botón y habla en tu idioma. La traducción aparecerá en la pantalla. | Tap the button and speak your language. The translation will appear on the screen. |
| Кнопка записи (подпись на языке гостя) | Я говорю | Yo hablo | I speak |
| Кнопка при записи | Готово | Listo | Done |
| Карточка микрофона: заголовок | Нужен микрофон | Hace falta el micrófono | The microphone is needed |
| Карточка микрофона: текст | Когда браузер спросит, выберите «Разрешить». Микрофон включён, только пока вы говорите. | Cuando el navegador pregunte, elige «Permitir». El micrófono solo está activo mientras hablas. | When your browser asks, choose “Allow”. The microphone is only on while you speak. |
| Ссылка «писать текстом» | Лучше написать текстом | Prefiero escribir | Prefer to type? |
| Подпись при записи | Слушаю… | Escuchando… | Listening… |
| Метка окна обработки | Литературно | Literario | Polished |
| Префикс «распознано» | Распознано: | Entendido: | Heard: |
| Подпись обработки | Готовлю перевод… | Preparando la traducción… | Preparing the translation… |
| Подпись под фразой гостя | Вы · литературно | Tú · literario | You · polished |
| Подсказка кнопки озвучки (aria) | Произнести | Escuchar | Play |
| Кнопка клавиатуры (aria) | Написать текстом | Escribir | Type instead |
| Поле ввода (placeholder) | Напишите фразу | Escribe tu frase | Type your phrase |
| Отправить (aria) | Отправить | Enviar | Send |
| Закрыть (aria) | Закрыть | Cerrar | Close |
| Нет микрофона: заголовок | Нет доступа к микрофону | Sin acceso al micrófono | No microphone access |
| Нет микрофона: текст | Разрешите микрофон в настройках браузера — или просто напишите фразу. | Permite el micrófono en los ajustes del navegador o escribe tu frase. | Allow the microphone in your browser settings, or just type your phrase. |
| Нет микрофона: основная кнопка | Написать текстом | Escribir | Type instead |
| Раскрывашка «как разрешить» | Как разрешить микрофон | Cómo permitir el micrófono | How to allow the microphone |
| …iPhone | iPhone (Safari): кнопка «аА» в адресной строке › Настройки веб-сайта › Микрофон › Разрешить. | iPhone (Safari): botón «aA» junto a la dirección › Ajustes del sitio web › Micrófono › Permitir. | iPhone (Safari): “aA” button next to the address › Website Settings › Microphone › Allow. |
| …Android | Android (Chrome): значок слева от адреса › Разрешения › Микрофон. | Android (Chrome): icono a la izquierda de la dirección › Permisos › Micrófono. | Android (Chrome): icon left of the address › Permissions › Microphone. |
| Нет сети: заголовок | Нет интернета | Sin conexión | No internet |
| Нет сети: текст | Проверьте соединение и попробуйте ещё раз. | Comprueba tu conexión e inténtalo de nuevo. | Check your connection and try again. |
| Кнопка «Повторить» | Повторить | Reintentar | Retry |
| Подпись неотправленной фразы | Не отправлено | Sin enviar | Not sent |
| Лимит: заголовок | Перевод сейчас недоступен | La traducción no está disponible ahora | Translation is unavailable right now |
| Лимит: текст | Обратитесь к тому, кто показал QR. | Habla con la persona que te mostró el QR. | Please ask the person who showed you the QR. |
| Лимит: кнопка | Проверить ещё раз | Comprobar de nuevo | Check again |
| Ссылка в конце | Скачать Parrlo | Descargar Parrlo | Get Parrlo |
| Лист «Скачать»: заголовок | Скачайте Parrlo | Descarga Parrlo | Get Parrlo |
| Лист «Скачать»: текст | Переводчик всегда под рукой — без QR-кода. | El traductor siempre a mano, sin código QR. | Your translator, always at hand — no QR code needed. |
| Кнопка App Store | Загрузите в App Store | Descárgalo en el App Store | Download on the App Store |
| Кнопка Google Play | Доступно в Google Play | Disponible en Google Play | Get it on Google Play |
| Закрыть лист | Не сейчас | Ahora no | Not now |

### Демо-фразы макета (только для показа)
| | RU-гость (→ ES) | ES-гость (→ RU) | EN-гость (→ ES) |
|---|---|---|---|
| Живая диктовка (запинки) | э-э скажите а можно можно счёт и ещё бутылку воды без газа ну | eh oye perdona dónde está eh la farmacia más cercana | um so can I like get the check and uh a bottle of still water to go |
| Распознано | Э-э… скажите, а можно… можно счёт, и ещё бутылку воды без газа, ну, с собой | Eh… oye, perdona, ¿dónde está… eh… la farmacia más cercana? | Um, so… can I, like, get the check and, uh, a bottle of still water to go? |
| Литературная фраза | Можно счёт и бутылку воды без газа с собой? | Disculpa, ¿dónde está la farmacia más cercana? | Could I have the check and a bottle of still water to go? |
| Перевод | ¿Me trae la cuenta y una botella de agua sin gas para llevar? | Извините, где ближайшая аптека? | ¿Me trae la cuenta y una botella de agua sin gas para llevar? |
| Текст, набранный вручную | Здравствуйте! Подскажите, пожалуйста, где ближайшая аптека? | Hola, ¿me puedes decir dónde está la farmacia más cercana? | Hi, could you tell me where the nearest pharmacy is? |
| Перевод набранного | Hola, ¿podría decirme dónde está la farmacia más cercana? | Здравствуйте, подскажите, где ближайшая аптека? | Hola, ¿podría decirme dónde está la farmacia más cercana? |

Перевод в облачке: кириллица — Inter 700, латиница — Nunito 700 (как в iOS).

## 4. Поведение для Web App
- **Запись:** тап → `getUserMedia` (по жесту, HTTPS) → кнопка «Готово» + живой текст; второй тап → конец. Облачко живой речи растёт, лента прокручивается вниз.
- **Обработка → перевод:** окно фразы (литературная форма появляется первой), затем анимация «Волна и искры» в облачке гостя и выезд перевода. При `prefers-reduced-motion`: без искр и блика, простая смена за 0,2 с, точки и ореол неподвижны.
- **Озвучка:** кнопка-динамик в облачке перевода (в макете только пульсирует).
- **Текстовый ввод:** отправка по ↑; при пустом поле кнопка неактивна; maxlength — по лимиту сервера (в макете не показан).
- **Ошибки:** микрофон → `err-mic` (текстовый вариант всегда основной кнопкой); сеть → `offline` (фраза сохраняется, «Повторить» отправляет снова); квота хозяина → `limit` (одна нейтральная формулировка для любой причины недоступности на стороне хозяина).
- **Скачать Parrlo:** показывается только после первого готового перевода, ненавязчиво (ссылка, не баннер). Android и прочие браузеры всегда видят эту веб-страницу; iPhone позже получит App Clip (карточка iOS появляется по тому же QR), веб остаётся запасным путём.
- **Не входит в макет:** реальные STT/перевод/озвучка, правка фразы касанием, «Неточно», ответ хозяина на странице гостя, выбор языка.

## 5. Файлы
`index.html` — страница (CSS/JS внутри); `fonts/Inter-sub.woff2` (71 КБ), `fonts/Nunito-sub.woff2` (45 КБ), `fonts/OFL-*.txt`; `mark.svg`; `png/`; `appclip/` — см. ELEMENTS-FOR-APPCLIP.md. Исходники сборки — `_src/` (не нужны на проде).
