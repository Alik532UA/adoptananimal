// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Перегляд теми при наведенні (THEME-SWITCHER § 2.1) — і чому він тут.
 *
 * `previewTheme` малює документ НАПРЯМУ, повз `$effect`, який слухає `theme` і
 * на кожну його зміну пише у сховище. Тобто вся правильність цієї функції — у
 * тому, чого вона НЕ робить: не чіпає `theme`, не пише в сховище, і по `null`
 * повертає рівно обрану тему. Жодного з цих трьох тверджень не видно оком:
 * людина бачить лише те, що кольори змінилися.
 *
 * Мета-тег перевіряється разом з атрибутом навмисно. Без нього показана темна
 * тема лишалася б оголошеною як світла, і Android Chrome перемальовував би її
 * своєю Auto Dark Theme рівно на час показу (`UIUX-ONLY-LIGHT`).
 *
 * Середовище — `node` із власними заглушками, як у сусідніх тестах: jsdom у
 * проєкті немає, а браузерних API тут потрібно рівно три.
 */

vi.mock('$app/environment', () => ({ browser: true, dev: false }));
vi.mock('$app/paths', () => ({ base: '' }));

/** Мінімальний `document`: атрибут кореня, список класів і один мета-тег. */
function makeDocument() {
	const attrs = new Map<string, string>();
	const classes = new Set<string>();
	const meta = {
		content: '',
		setAttribute(name: string, value: string) {
			if (name === 'content') meta.content = value;
		}
	};
	return {
		documentElement: {
			setAttribute: (name: string, value: string) => void attrs.set(name, value),
			getAttribute: (name: string) => attrs.get(name) ?? null,
			classList: {
				add: (c: string) => void classes.add(c),
				remove: (c: string) => void classes.delete(c),
				contains: (c: string) => classes.has(c)
			}
		},
		querySelector: (selector: string) => (selector === 'meta[name="color-scheme"]' ? meta : null),
		__meta: meta,
		__classes: classes
	};
}

function makeStorage(): Storage {
	const data = new Map<string, string>();
	return {
		get length() {
			return data.size;
		},
		key: (i: number) => [...data.keys()][i] ?? null,
		getItem: (k: string) => data.get(k) ?? null,
		setItem: (k: string, v: string) => void data.set(k, String(v)),
		removeItem: (k: string) => void data.delete(k),
		clear: () => data.clear()
	} as Storage;
}

type Doc = ReturnType<typeof makeDocument>;
let doc: Doc;

beforeEach(() => {
	doc = makeDocument();
	vi.stubGlobal('document', doc);
	vi.stubGlobal('localStorage', makeStorage());
	vi.stubGlobal('window', { localStorage: globalThis.localStorage });
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
	vi.resetModules();
});

const load = async () => (await import('./settings.svelte')).settings;

describe('перегляд теми при наведенні', () => {
	it('показує наведену тему, не записуючи вибір', async () => {
		const settings = await load();
		const chosen = settings.theme;

		settings.previewTheme('winter');

		expect(doc.documentElement.getAttribute('data-theme')).toBe('winter');
		expect(settings.previewedTheme).toBe('winter');
		expect(
			settings.theme,
			'обрана тема не мусить мінятися від наведення — інакше курсор, що просто ' +
				'перетнув меню, зберіг би чужу тему назавжди'
		).toBe(chosen);
	});

	it('по null повертає саме обрану тему', async () => {
		const settings = await load();
		settings.setTheme('light-green');

		settings.previewTheme('dark');
		settings.previewTheme(null);

		expect(doc.documentElement.getAttribute('data-theme')).toBe('light-green');
		expect(settings.previewedTheme).toBeNull();
	});

	it('мета-тег іде разом з атрибутом', async () => {
		const settings = await load();

		settings.previewTheme('dark');
		expect(doc.__meta.content).toBe('dark');

		settings.previewTheme('orange-purple');
		expect(doc.__meta.content, 'ця тема темна за тлом, тож оголошується як dark').toBe('dark');

		settings.previewTheme('winter');
		expect(doc.__meta.content).toBe('only light');
	});

	it('вибір теми знімає перегляд', async () => {
		const settings = await load();
		settings.previewTheme('winter');

		settings.setTheme('dark');

		expect(settings.previewedTheme).toBeNull();
		expect(settings.theme).toBe('dark');
	});
});

describe('плавний перехід кольорів', () => {
	it('клас переходу знімає ТАЙМЕР, а не наступна дія', async () => {
		const settings = await load();

		settings.previewTheme('winter');
		expect(doc.__classes.has('theme-shifting')).toBe(true);

		/*
		 * Пів секунди — усередині переходу: клас мусить ще стояти. Зняття в
		 * обробнику обривало б перехід на половині, бо вибір теми закриває меню,
		 * а закриття кличе `previewTheme(null)`.
		 */
		vi.advanceTimersByTime(500);
		expect(doc.__classes.has('theme-shifting')).toBe(true);

		vi.advanceTimersByTime(500);
		expect(doc.__classes.has('theme-shifting')).toBe(false);
	});
});
