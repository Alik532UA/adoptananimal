// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { acceptsShortcut, isPlainKey, isTypingTarget } from './keyboard';

/**
 * GATE-HOTKEYS — the blocking gate canon.json names for any project that has hotkeys
 * (HOTKEYS-v8 § 6). This project grew them on 2026-08-19 and the gate was not built
 * with them, which is the state the canon calls out by name: the rules were followed
 * and nothing was checking that they stayed followed.
 *
 * What it catches, in the order the canon lists it:
 *
 *  1. a window-level handler with no text-entry guard — CRITICAL, because typing
 *     then runs commands. The sibling project on this origin had `t` closing the
 *     very language panel whose search box it was being typed into;
 *  2. modifiers not checked — `Ctrl+T` opening a browser tab AND doing our thing;
 *  3. a letter read from `event.key` instead of `event.code` — the shortcut simply
 *     disappears on a Ukrainian layout, on a site that ships in Ukrainian;
 *  4. a letter meaning something other than the canonical map, or `V`/`R` taken by
 *     an ordinary action, which would collide with the service gestures.
 *
 * The behavioural half at the bottom is not decoration: the source scan can only see
 * that a guard is CALLED. Whether the guard is right — whether that selector list
 * still covers `select`, whether `Escape` is still the one exemption — is a question
 * about behaviour, and only running it answers that.
 *
 * NOT covered here, deliberately, and recorded in PROJECT-CONTEXT.md § 4.23 instead:
 * WCAG SC 2.1.4. The canon says so itself (§ 6, last item) — "there is a switch" and
 * "the switch really turns the shortcut off" are different claims, and a test can only
 * make the first one look like the second.
 */

const ROOT = resolve(__dirname, '../../..');
const SELF = 'src/lib/services/keyboard.test.ts';

const read = (path: string) => readFileSync(resolve(ROOT, path), 'utf8');

/**
 * Every source file that could plausibly touch a key. This file excludes itself: it
 * quotes the very patterns it forbids and matched its own regex on the first run —
 * the same trap `scrollbar-canon.test.ts` documents.
 */
function sources(dir = 'src', out: string[] = []): string[] {
	for (const entry of readdirSync(resolve(ROOT, dir), { withFileTypes: true })) {
		const path = `${dir}/${entry.name}`;
		if (entry.isDirectory()) sources(path, out);
		else if (/\.(ts|svelte)$/.test(entry.name) && path !== SELF) out.push(path);
	}
	return out;
}

const files = sources().map((path) => ({ path, text: read(path) }));

/**
 * Handlers registered on the window or the document — the ones that fire no matter
 * where the focus is, and therefore the only ones that need the guard. A `onkeydown`
 * on a button or a menu is already scoped to that element by the browser.
 */
const GLOBAL_HANDLER =
	/<svelte:(?:window|document)[^>]*onkeydown|(?:window|document)\.addEventListener\(\s*['"]keydown/;

const globalHandlers = files.filter((f) => GLOBAL_HANDLER.test(f.text));

/**
 * What counts as the guard being present.
 *
 * `createKeySequence` is in the list because the gestures delegate the whole decision
 * to it — and the test right below pins that delegation down, so this is not a hole
 * to walk through: if `keySequence.ts` ever stops guarding, that test fails rather
 * than this list quietly becoming a lie.
 */
const GUARDS = /acceptsShortcut|isTypingTarget|isContentEditable|createKeySequence/;

describe('§ 2.2 — a key handler on the window must not fire while someone types', () => {
	it('the scan finds global handlers at all — the check is alive', () => {
		expect(
			globalHandlers.length,
			'no window-level keydown handler found — the pattern is looking for the wrong thing'
		).toBeGreaterThan(0);
	});

	it('every global handler consults a text-entry guard', () => {
		const unguarded = globalHandlers.filter((f) => !GUARDS.test(f.text)).map((f) => f.path);

		expect(unguarded, `keys are swallowed inside input fields:\n${unguarded.join('\n')}`).toEqual(
			[]
		);
	});

	it('the gestures really do delegate the guard rather than skip it', () => {
		// `createKeySequence` is accepted above as proof of a guard. This is what makes
		// that true: the module has to take both guards from the one implementation.
		const sequence = read('src/lib/services/keySequence.ts');
		expect(sequence, 'keySequence no longer imports the shared guards').toMatch(
			/import\s*\{[^}]*isTypingTarget[^}]*\}\s*from\s*['"]\$lib\/services\/keyboard['"]/
		);
		expect(sequence, 'the guard is imported but never called').toContain('isTypingTarget(');
	});
});

/*
 * § 2.1 — combinations belong to the browser.
 *
 * The canon's reference check for this greps the handler for `ctrlKey || …`. There is
 * deliberately no such test here, because it was written, run backwards, and thrown
 * away: with the guard's body replaced by `return true` it stayed GREEN twice over —
 * first on the docblock that explains the three flags, then, after stripping comments,
 * on the parameter type that names them. Both times it reported a working guard over a
 * gutted one.
 *
 * `isPlainKey` is a function with its own arguments, so the question can be asked
 * properly instead: the three cases at the bottom of this file pass it a stroke with
 * each modifier held and require a refusal. That is strictly stronger than any grep,
 * and it is the check that went red on the same experiment.
 */

describe('§ 1.3 — a letter is a physical key, not a character', () => {
	it('no shortcut compares event.key to a letter', () => {
		// On a Ukrainian layout `KeyT` arrives as `key === 'е'`. A site that ships in
		// Ukrainian loses the shortcut for exactly the readers it was translated for.
		const bad: string[] = [];
		for (const { path, text } of files) {
			for (const match of text.matchAll(/\.key\s*===\s*['"]([a-zA-Z])['"]/g)) {
				bad.push(`${path}: .key === '${match[1]}'`);
			}
		}

		expect(bad, `layout-dependent shortcuts:\n${bad.join('\n')}`).toEqual([]);
	});

	it('no switch over event.key branches on a letter', () => {
		// The same defect wearing the other syntax. `switch (event.key)` is fine for
		// `Escape` and the arrows — those names do not move with the layout — so the
		// rule is about the case labels, not about the switch.
		const bad: string[] = [];
		for (const { path, text } of files) {
			for (const match of text.matchAll(/switch\s*\(\s*[\w.]*\bkey\s*\)\s*\{/g)) {
				const body = text.slice(match.index, match.index + 800);
				for (const label of body.matchAll(/case\s+['"]([a-zA-Z])['"]/g)) {
					bad.push(`${path}: case '${label[1]}' on event.key`);
				}
			}
		}

		expect(bad, `layout-dependent shortcuts:\n${bad.join('\n')}`).toEqual([]);
	});
});

describe('§ 1.1 — a letter means the same thing in every project on this origin', () => {
	/**
	 * Only the letters this project actually binds are checked; an absent key is not a
	 * violation, it is a feature the site does not have. The map itself is in
	 * `keyboard.ts`, with a line per skipped letter saying which feature is missing.
	 */
	const CANON: Record<string, RegExp> = {
		KeyT: /theme/i,
		KeyL: /lang|locale/i,
		KeyM: /sound|audio|mute/i,
		KeyB: /background/i,
		KeyF: /fullscreen/i,
		KeyH: /home/i,
		KeyC: /clock/i,
		// Reserved for the service gestures (§ 4). An ordinary action on either would
		// either swallow the gesture or fire alongside it.
		KeyV: /debug|version|badge|sequence/i,
		KeyR: /reset|sequence/i
	};

	const bindings: { path: string; code: string; context: string }[] = [];
	for (const { path, text } of files) {
		for (const match of text.matchAll(/'(Key[A-Z])'/g)) {
			bindings.push({
				path,
				code: match[1],
				// The path joins the window on purpose: `keySequence.ts` names `'KeyR'` in
				// a docblock about what `code` is, and the file it lives in is the answer
				// to "what is this letter for".
				context: `${path} ${text.slice(match.index, match.index + 200)}`
			});
		}
	}

	it('the scan finds key bindings at all — the check is alive', () => {
		expect(bindings.length, "no 'KeyX' literal found anywhere").toBeGreaterThan(0);
	});

	it('every bound letter does what the canonical map says', () => {
		const wrong = bindings
			.filter(({ code, context }) => CANON[code] && !CANON[code].test(context))
			.map(({ path, code }) => `${path}: ${code} does not match ${CANON[code]}`);

		expect(wrong, `off the canonical map:\n${wrong.join('\n')}`).toEqual([]);
	});

	it('V and R are held by the service gestures and nothing else', () => {
		const reserved = bindings.filter(({ code }) => code === 'KeyV' || code === 'KeyR');
		expect(reserved.length, 'neither gesture found — the check is alive').toBeGreaterThan(0);

		const stolen = reserved
			.filter(({ code, context }) => !CANON[code].test(context))
			.map(({ path, code }) => `${path}: ${code} is used for an ordinary action`);

		expect(stolen, `reserved letters taken:\n${stolen.join('\n')}`).toEqual([]);
	});
});

describe('§ 5 — a shortcut nobody is told about exists only for its author', () => {
	/**
	 * Letters that drive a control on screen, and the ARIA notation each is announced
	 * in. `V` and `R` are absent on purpose: § 5 says the service gestures stay out of
	 * the help, because they are not for the visitor.
	 */
	const ANNOUNCED: Record<string, string> = { KeyT: 'T', KeyL: 'L' };

	const markup = files.filter((f) => f.path.endsWith('.svelte'));

	it('every visitor-facing letter is announced on the control it drives', () => {
		const silent = Object.entries(ANNOUNCED)
			.filter(([code]) => files.some((f) => f.text.includes(`'${code}'`)))
			.filter(([, aria]) => !markup.some((f) => f.text.includes(`keyshortcuts="${aria}"`)))
			.map(([code, aria]) => `${code}: nothing carries aria-keyshortcuts="${aria}"`);

		expect(silent, `undiscoverable shortcuts:\n${silent.join('\n')}`).toEqual([]);
	});

	it('the announcement reaches the DOM rather than stopping at a prop', () => {
		// `keyshortcuts="T"` on a component is a prop name until something renders it as
		// the attribute. The two are one letter apart and the difference is invisible
		// everywhere except a screen reader.
		const dropdown = read('src/lib/components/ui/DropdownMenu.svelte');
		expect(dropdown, 'the prop is taken but never rendered').toContain(
			'aria-keyshortcuts={keyshortcuts}'
		);
	});
});

/**
 * A stand-in for a focused element. `closest` here answers the same question a browser
 * would: is any of the selector's alternatives this element's tag?
 *
 * Which makes the assertions below real rather than circular — a selector list that
 * lost `select` fails the `select` case, instead of matching because the test handed
 * it its own answer.
 */
const focused = (tag: string): EventTarget =>
	({
		closest: (selector: string) =>
			selector
				.split(',')
				.map((part) => part.trim())
				.includes(tag)
				? { tag }
				: null
	}) as unknown as EventTarget;

const stroke = (over: Partial<KeyboardEvent>): KeyboardEvent =>
	({ code: 'KeyT', target: focused('body'), ...over }) as unknown as KeyboardEvent;

describe('the guards themselves', () => {
	it.each(['input', 'textarea', 'select', '[contenteditable]:not([contenteditable="false"])'])(
		'%s counts as typing',
		(tag) => {
			expect(isTypingTarget(focused(tag))).toBe(true);
		}
	);

	it('a button or a link does not', () => {
		expect(isTypingTarget(focused('button'))).toBe(false);
		expect(isTypingTarget(focused('a'))).toBe(false);
	});

	it('survives a target that is not an element', () => {
		// `event.target` is the window itself when nothing has focus, and `null` in a
		// synthesised event. Neither has `closest`, and neither is someone typing.
		expect(isTypingTarget(null)).toBe(false);
		expect(isTypingTarget(undefined)).toBe(false);
		expect(isTypingTarget({} as EventTarget)).toBe(false);
	});

	it.each(['ctrlKey', 'metaKey', 'altKey'] as const)('%s makes it not ours', (modifier) => {
		expect(isPlainKey({ [modifier]: true })).toBe(false);
	});

	it('shift does not, and that is deliberate', () => {
		// Shift does not change `code`, and the browser rarely claims chords with it.
		expect(isPlainKey({ shiftKey: true } as Partial<KeyboardEvent>)).toBe(true);
	});

	it('a bare letter outside a field is accepted', () => {
		expect(acceptsShortcut(stroke({}))).toBe(true);
	});

	it('the same letter inside a field is not', () => {
		expect(acceptsShortcut(stroke({ target: focused('input') }))).toBe(false);
	});

	it('the same letter with ctrl is not', () => {
		expect(acceptsShortcut(stroke({ ctrlKey: true }))).toBe(false);
	});

	it('Escape is the one exemption from the field guard', () => {
		// A panel opened by a key takes focus into itself, and then the letter that
		// opened it belongs to whatever has focus. Escape is the only way back out.
		expect(acceptsShortcut(stroke({ code: 'Escape', target: focused('input') }))).toBe(true);
	});

	it('Escape with ctrl is still not ours', () => {
		expect(acceptsShortcut(stroke({ code: 'Escape', ctrlKey: true }))).toBe(false);
	});
});
