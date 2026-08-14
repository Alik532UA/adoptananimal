# AdoptAnAnimal - Project Guidelines

## Tech Stack

- **Framework:** SvelteKit 2 + Svelte 5 (Runes)
- **Styling:** Vanilla CSS with a multi-skin/theme architecture
- **State Management:** Svelte 5 `$state`, `$derived`, and class-based controllers (`.svelte.ts`)
- **i18n:** Custom implementation in `src/lib/i18n`

## Critical Rules

### 🏷️ Naming & data-testid Standards (v6)

**MANDATORY:** All interactive elements must have a unique `data-testid` attribute following the canonical convention:
`[scope-]<feature>-<role>-<type>`

- Suffixes: `-btn`, `-link`, `-input`, `-modal`, `-card`, etc. (see documentation).
- CSS: Use BEM-lite (`.block__element--modifier`).
- Components: `PascalCase.svelte` with type suffix (e.g., `UserCard.svelte`).

### 🗄️ Storage Isolation (GitHub Pages)

All projects are deployed on the same domain `alik532ua.github.io`.
**MANDATORY:** Every key in `localStorage`, `sessionStorage`, `Cache API`, and `IndexedDB` MUST have the unique prefix:
`adoptananimal_`

### ♿ Accessibility (WCAG 2.2 AA)

- Use semantic HTML (e.g., `<main>`, `<button>`, `<a>`).
- All interactive elements must be accessible via keyboard.
- Always include `aria-label` for icon-only buttons.
- Support `prefers-reduced-motion`.
- Use the Skip-link provided in `+layout.svelte`.

### 🧪 Quality Control

Before committing or pushing, always run:

1. `npm run check` - Svelte-check for type safety.
2. `npm run lint` - ESLint and Prettier for code style.

## Architecture Patterns

- **Services:** Class-based services using Svelte 5 runes (e.g., `Settings` in `settings.svelte.ts`).
- **Styles:** Global styles in `app.css`, base styles in `src/lib/styles/base.css`, skins and themes in `src/lib/styles/skins/` and `src/lib/styles/themes/`.
- **Data:** Animal data is stored in `src/lib/data/animals/` as TypeScript files.

## 🗺️ Карта проектної документації

Канонічна документація — у `.private/docs/`. Точка входу — `.private/docs/README.md`.

- `architecture/` — ADR з архітектурних рішень. Канон.
- `specs/` — специфікації фіч. Канон.
- `plans/` — плани рефакторингу (in-progress).
- `analysis/` — одноразові звіти та аудити.
- `notes/` — робочі замітки (не канон).
- `archive/` — застарілі документи (не редагувати).

При суперечності: `architecture/` > `specs/` > `plans/` > `notes/`.

## Do NOT

- Do NOT use Svelte 4 APIs (e.g., `writable`, `on:click`, `{#slot}`).
- Do NOT use `localStorage.clear()` as it affects all projects on the domain.
- Do NOT commit without running quality checks.
