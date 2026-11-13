# parrlo-mockups

Статические макеты Parrlo (только мокапы, не боевой код). Раздаются через GitHub Pages организации [ParrloHQ](https://github.com/ParrloHQ).

## Статус

Публичный репозиторий макетов. Содержимое — HTML/CSS/PNG/SVG и сопутствующие файлы; без серверной логики и секретов. Обновления попадают на GitHub Pages из ветки `main`.

## GitHub Pages

Корень сайта: **https://parrlohq.github.io/parrlo-mockups/**

Точки входа с главной страницы (`index.html`):

| Папка | Описание |
| --- | --- |
| `app/` | Parrlo Translate, бренд v2, экраны «Было / Стало» |
| `button-variants/` | Варианты кнопки «Yo hablo», контрасты |
| `web/` | Веб-приложение, вкладки и пары экранов |
| `kb-mvp/` | Клавиатура: контекстный помощник (KB-Design-1) |
| `kb-voice/` | Клавиатура: голос в первом выпуске (диктовка, голосовое; iOS и Android) |
| `brandbook/` | Брендбук v2 (PDF, assets.zip, токены) |
| `logo/` | Логотип v2 |
| `site-c2/`, `site-c3/` | Варианты лендинга (ES, RU, EN) |

Дополнительные разделы (прямые URL):

| Папка | URL |
| --- | --- |
| `chat/` | https://parrlohq.github.io/parrlo-mockups/chat/ |
| `prototype/` | https://parrlohq.github.io/parrlo-mockups/prototype/ |
| `webdemo-mock/` | https://parrlohq.github.io/parrlo-mockups/webdemo-mock/ |
| `webdemo-live/` | https://parrlohq.github.io/parrlo-mockups/webdemo-live/ |

Связанные макеты чата: [ParrloHQ/parrlo-chat-mockups](https://github.com/ParrloHQ/parrlo-chat-mockups) — https://parrlohq.github.io/parrlo-chat-mockups/

## Локальный просмотр

Любой статический HTTP-сервер из корня репозитория, например:

```bash
python3 -m http.server 8080
```

Откройте `http://localhost:8080/` (для подпапок важны относительные пути, как на Pages).

## Лицензия

См. [LICENSE](LICENSE) — все права защищены.
