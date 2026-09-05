# adoptananimal

Сайт прилаштування тварин: картки котів і собак, сторінка заявки, обране.
Чотири мови — `en` (типова, без префікса), `uk`, `de`, `nl` (під префіксом).
Чому типова без префікса — [ADR 0001](.private/docs/adr/0001-default-locale-unprefixed.md).

Джерелом істини для даних, порядку тварин і статусів адопції є старий сайт на
Google Sites: імена, стать, вік, порода, розмір, колір, опис і статус звіряються
з ним, а не вигадуються. Адреса `adoptananimal.in.ua` тепер веде на **цей** сайт,
тож старий шукати за його власною адресою Google Sites — див.
[PROJECT-CONTEXT § 5](PROJECT-CONTEXT.md).

## Швидкий старт

```bash
npm ci
```

```bash
npm run dev
```

⚠️ Голий `npm run dev` бере типовий порт Vite **5173**, спільний з рештою
проєктів у сусідніх теках: якщо на ньому вже щось висить, у браузері відкриється
чужий сайт. Конфігурація `.claude/launch.json` тому тримає dev-сервер на
**5195** зі `--strictPort`. Тестів це не стосується: Playwright піднімає власний
`preview` на 4173, теж зі `--strictPort`.

## Команди

| Команда                   | Що робить                                          |
| ------------------------- | -------------------------------------------------- |
| `npm run dev`             | dev-сервер                                         |
| `npm run check`           | `svelte-check` — має бути 0 помилок                |
| `npm run lint`            | `prettier --check` + ESLint (у CI — двома кроками) |
| `npm run format`          | форматування                                       |
| `npm test`                | юніт-інваріанти (Vitest)                           |
| `npm run check:i18n`      | паритет ключів у чотирьох мовах                    |
| `npm run build`           | збірка в `build/`                                  |
| `npm run check:build`     | гейт над зібраним виводом                          |
| `npm run check:bundle`    | бюджет JS: код і каталог тварин окремими числами   |
| `npm run check:discovery` | чи раннери досі беруть усі файли перевірок         |
| `npm run test:e2e`        | Playwright проти **зібраного** сайту               |

## Як усе влаштоване

- **Стек:** SvelteKit 2 + Svelte 5 (виключно руни), TypeScript 6, `adapter-static`.
- **Маршрути:** мовний префікс — опційний параметр `[[lang=lang]]`. Розділи:
  `adopt/cat`, `adopt/dog`, `adopt/{cat,dog}/[slug]`, `apply`, `apply/form`,
  `favorites`. `robots.txt` і `sitemap.xml` — теж маршрути, а не статичні файли.
- **Стан:** класи-сервіси в `.svelte.ts`.
- **Сховище:** фасад `src/lib/services/storage.ts`, префікс `adoptananimal_`.
- **i18n:** власна реалізація в `src/lib/i18n` (не `svelte-i18n`).
- **Стилі:** `app.css`, базові в `src/lib/styles/base.css`, скіни й теми —
  окремими теками.
- **Дані тварин:** TypeScript-файли в `src/lib/data/animals/`.

## Тести

Набори Playwright лежать у `tests/`, перелік — в [AGENTS.md](AGENTS.md), де його
тримає інваріант `src/docs-numbers.test.ts`. Усі йдуть проти зібраного сайту:
`test:e2e` спершу робить `build`, бо частину дефектів видно лише там.

Доступність тримається на рівні WCAG 2.2 AA і перевіряється автоматично
(`tests/a11y.spec.ts`).

## Деплой і адреса

| Адреса                                       | Роль                                                                                                                                                                                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `https://adoptananimal.in.ua/`               | **Основна.** На неї ведуть `canonical`, `og:url`, `hreflang` і кожен `<loc>` у `sitemap.xml`                                                                                                                                          |
| `https://alik532ua.github.io/adoptananimal/` | **Запасна.** Поки домен прив’язаний, GitHub відповідає з неї 301 на основну зі збереженням шляху, тож дубля в індексі не виникає (виміряно — [§ 4.40](PROJECT-CONTEXT.md)). Сайт вона віддає лише тоді, коли `CUSTOM_DOMAIN` порожній |

Адресу вирішує рядок `CUSTOM_DOMAIN` у [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): заповнений — база порожня й origin на домені; порожній — обидва виводяться з назви репозиторію. `base` ніде не вписаний константою: `svelte.config.js` читає `process.env.BASE_PATH ?? ''`.

Саме це зробило переїзд дешевим. У сусідніх проєктах база вписана константою, і через це `as5.odesa.ua` після купівлі домену місяцями показувався системними шрифтами. Що змінюється разом і що при цьому мовчить — [PROJECT-CONTEXT § 4.40](PROJECT-CONTEXT.md) і [CUSTOM-DOMAIN-v8.md](../sveltekit-canon/selection_criteria/v8/ops/CUSTOM-DOMAIN-v8.md).

## Стандарти

Загальні правила — у пакеті [`sveltekit-canon/selection_criteria/v8`](../sveltekit-canon/selection_criteria/v8/README.md).
Специфіка цього проєкту — в [PROJECT-CONTEXT.md](PROJECT-CONTEXT.md).
Інструкції для AI-асистентів — в [AGENTS.md](AGENTS.md).
Внутрішня документація — `.private/docs/` (`adr/`, `specs/`, `analysis/`, `notes/`).
