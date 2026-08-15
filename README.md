# adoptananimal

Сайт прилаштування тварин: картки котів і собак, сторінка заявки, обране.
Чотири мови — `uk` (типова), `en`, `de`, `nl`.

Джерелом істини для даних, порядку тварин і статусів адопції є діючий сайт
[adoptananimal.in.ua](https://www.adoptananimal.in.ua/): імена, стать, вік,
порода, розмір, колір, опис і статус звіряються з ним, а не вигадуються.

## Швидкий старт

```bash
npm ci
```

```bash
npm run dev
```

⚠️ Dev-сервер піднімається на **5173** — типовому порту Vite, спільному з
рештою проєктів у сусідніх теках. Якщо на ньому вже щось висить, у браузері
відкриється чужий сайт. Тестів це не стосується: Playwright піднімає власний
`preview` на 4173 зі `--strictPort`.

## Команди

| Команда               | Що робить                            |
| --------------------- | ------------------------------------ |
| `npm run dev`         | dev-сервер                           |
| `npm run check`       | `svelte-check` — має бути 0 помилок  |
| `npm run lint`        | `prettier --check` + ESLint          |
| `npm run format`      | форматування                         |
| `npm test`            | юніт-інваріанти (Vitest)             |
| `npm run check:i18n`  | паритет ключів у чотирьох мовах      |
| `npm run build`       | збірка в `build/`                    |
| `npm run check:build` | гейт над зібраним виводом            |
| `npm run test:e2e`    | Playwright проти **зібраного** сайту |

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

Сім наборів Playwright у `tests/`: `a11y`, `i18n`, `journey`, `scrollbar`,
`testids`, `toast`, `ui`. Усі йдуть проти зібраного сайту — `test:e2e` спершу
робить `build`, бо частину дефектів видно лише там.

Доступність тримається на рівні WCAG 2.2 AA і перевіряється автоматично
(`tests/a11y.spec.ts`).

## Деплой

GitHub Pages **ще не налаштовано** для цього репозиторію. `base` не хардкодиться:
`svelte.config.js` читає `process.env.BASE_PATH ?? ''`.

## Стандарти

Загальні правила — у пакеті [`sveltekit-canon/selection_criteria/v8`](../sveltekit-canon/selection_criteria/v8/README.md).
Специфіка цього проєкту — в [PROJECT-CONTEXT.md](PROJECT-CONTEXT.md).
Інструкції для AI-асистентів — в [AGENTS.md](AGENTS.md).
Внутрішня документація — `.private/docs/` (`adr/`, `specs/`, `analysis/`, `notes/`).
