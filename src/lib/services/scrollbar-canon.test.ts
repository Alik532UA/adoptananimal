import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Static invariants for SCROLLBAR-v8 § 11.
 *
 * The modes themselves — geometry, pointer handling, how a drag feels — need a browser
 * and live in tests/scrollbar.spec.ts. What is checkable from the source is the handful
 * of facts that exist in two places at once and go stale in silence. Every one of these
 * has a matching checkbox in the canon.
 */

const ROOT = resolve(__dirname, '../../..');
const read = (p: string) => readFileSync(resolve(ROOT, p), 'utf8');

const APP_HTML = read('src/app.html');
const CONTROLLER = read('src/lib/services/scrollbar.svelte.ts');
const MINIMAP = read('src/lib/components/ui/Minimap.svelte');
const BAR = read('src/lib/components/ui/PageScrollbar.svelte');

/** Every source file that could plausibly touch the class or call scrollTo. */
function sourceFiles(dir = 'src', out: string[] = []): string[] {
	for (const entry of readdirSync(resolve(ROOT, dir), { withFileTypes: true })) {
		const path = `${dir}/${entry.name}`;
		if (entry.isDirectory()) sourceFiles(path, out);
		// This file excludes itself: it quotes the very patterns it forbids, and matched
		// its own regex on the first run.
		else if (
			/\.(ts|svelte|css|html)$/.test(entry.name) &&
			!path.endsWith('scrollbar-canon.test.ts')
		)
			out.push(path);
	}
	return out;
}

describe('§ 8.2 — the first-frame script duplicates the controller', () => {
	// The script in app.html cannot import the controller, so the media queries and the
	// mode names exist twice. They drift silently: one behaviour on the first frame,
	// another after hydration, and the visitor sees the jump.
	it.each([['(hover: hover) and (pointer: fine)'], ['(min-width: 1100px)'], ['minimap-full']])(
		'both places agree on %s',
		(needle) => {
			expect(APP_HTML, `missing from app.html: ${needle}`).toContain(needle);
			expect(CONTROLLER, `missing from the controller: ${needle}`).toContain(needle);
		}
	);

	it('the default mode matches in both places', () => {
		const html = APP_HTML.match(/scrollbarMode'\)\s*\|\|\s*'([a-z-]+)'/);
		const ts = CONTROLLER.match(/mode\s*=\s*\$state<ScrollbarMode>\('([a-z-]+)'\)/);
		expect(html?.[1], 'no default found in app.html').toBeTruthy();
		expect(ts?.[1], 'no default found in the controller').toBeTruthy();
		expect(html?.[1]).toBe(ts?.[1]);
	});

	it('the storage key carries the project prefix in both places', () => {
		// The controller goes through the storage facade, which prefixes for it; the
		// inline script reaches localStorage directly and has to spell it out. A
		// mismatch means the first frame reads a key nothing ever writes.
		expect(APP_HTML).toContain("localStorage.getItem('adoptananimal_scrollbarMode')");
		expect(CONTROLLER).toContain("storage.get('scrollbarMode')");
	});
});

describe('§ 2.3 — the hiding class has exactly one owner', () => {
	it('has-custom-scrollbar is added or removed in exactly two places', () => {
		// One: the effect in +layout.svelte. Two: the first-frame script. Any third is a
		// drawing component doing it for itself, which races on every mode switch.
		const owners: string[] = [];
		for (const file of sourceFiles()) {
			for (const m of read(file).matchAll(
				/classList\.(?:add|remove|toggle)\(\s*['"`]has-custom-scrollbar/g
			)) {
				owners.push(`${file}: ${m[0]}`);
			}
		}
		expect(owners.sort(), `owners:\n${owners.join('\n')}`).toHaveLength(2);
	});
});

describe("§ 9.2 — behavior: 'auto' is forbidden", () => {
	it('no scrollTo passes behavior: auto', () => {
		// 'auto' means "read CSS scroll-behavior", which is smooth here. Every pointer
		// move during a drag would start an animation and they would chase each other —
		// correct-looking code that judders.
		const offenders = sourceFiles().filter((f) => /behavior:\s*['"]auto['"]/.test(read(f)));
		expect(offenders, `behavior: 'auto' in:\n${offenders.join('\n')}`).toEqual([]);
	});
});

describe('§ 9.10 / § 9.11 — the minimap must not fight its own drag', () => {
	it('has exactly one Spring, the slide-out', () => {
		// A second one is either the marker height or a presence spring. The first makes
		// grabOffset disagree with the clamp it was taken under; the second needs a class
		// that stops the element rendering, which releases the pointer capture and kills
		// the gesture mid-move. Both read as "it sometimes sticks".
		const springs = [...MINIMAP.matchAll(/new Spring\(/g)];
		expect(springs, `found ${springs.length} Spring instances`).toHaveLength(1);
	});

	it('never turns itself non-rendered', () => {
		// Scoped to the strip: pointer-events: none on .minimap__clone is required, so
		// only rules for .minimap itself are of interest. The print block is cut out as
		// well — display: none there is what the canon asks for, and it can never fire
		// mid-gesture.
		const styles = MINIMAP.slice(MINIMAP.indexOf('<style>')).replace(
			/@media print\s*\{[\s\S]*?\n\s*\}/g,
			''
		);
		const stripRules = [...styles.matchAll(/\.minimap(?:--[\w-]+|\.[\w-]+)?\s*\{([^}]*)\}/g)]
			.map((m) => m[1])
			.join('\n');
		expect(stripRules).not.toMatch(/visibility:\s*hidden/);
		expect(stripRules).not.toMatch(/pointer-events:\s*none/);
		expect(stripRules).not.toMatch(/display:\s*none/);
	});

	it('suppresses the browser own gesture on the drag surface', () => {
		// The strip sits against the right edge of the window, which is where the
		// browser's selection autoscroll lives. Let a selection start on a press and that
		// autoscroll fights every scrollTo the drag makes. Three things stop it, and all
		// three have to hold.
		expect(MINIMAP, 'no user-select: none on .minimap').toMatch(
			/\.minimap\s*\{[^}]*user-select:\s*none/
		);
		expect(MINIMAP, 'no preventDefault in the pointerdown handler').toMatch(
			/function onPointerDown[\s\S]{0,600}?^\s*e\.preventDefault\(\)/m
		);
		// Blocks are a drawing. Without this the press lands on a child element in the
		// schematic mode and on the strip itself in the visual one — different targets
		// for what is meant to be the same gesture.
		const blockRule = MINIMAP.match(/\.minimap__block,\s*\.minimap__viewport\s*\{([^}]*)\}/);
		expect(blockRule?.[1], 'no shared .minimap__block rule found').toBeTruthy();
		expect(blockRule![1]).toMatch(/pointer-events:\s*none/);
	});

	it('carries the drag on the window, not only on the strip', () => {
		// 28px wide: the slightest sideways drift takes the cursor off it, and if pointer
		// capture ever fails to take, the strip's own handler hears nothing.
		expect(MINIMAP).toMatch(/<svelte:window[\s\S]*?if \(dragging\) \{\s*requestScroll/);
	});

	it('applies the same three to the custom bar, whose track is narrower still', () => {
		// Same shape — a track with a child indicator, pressed against the right edge —
		// so the same defect. Harder to notice there only because the thumb is usually
		// under the cursor already, being the thing people grab; a press beside it on a
		// 10px track misses every time.
		expect(BAR, 'no user-select: none on .page-scrollbar').toMatch(
			/\.page-scrollbar\s*\{[^}]*user-select:\s*none/
		);
		expect(BAR, 'no pointer-events: none on the thumb').toMatch(
			/\.page-scrollbar__thumb\s*\{[^}]*pointer-events:\s*none/
		);
		expect(BAR, 'no preventDefault in the pointerdown handler').toMatch(
			/function onTrackPointerDown[\s\S]{0,600}?^\s*e\.preventDefault\(\)/m
		);
		expect(BAR, 'the window does not carry the drag').toMatch(
			/<svelte:window[\s\S]*?if \(dragging\) \{\s*requestScroll/
		);
	});

	it('marks the clone inert, not merely tabindex-stripped', () => {
		// removeAttribute('tabindex') only unmakes what tabindex made focusable. <button>
		// and <a href> are focusable natively, and a clone of this site holds dozens —
		// Tab would walk into an invisible copy of the whole page.
		// Anchored to the start of a line, so a commented-out call does not satisfy it.
		// The first version of this check matched `// clone.setAttribute('inert', '')`
		// and stayed green while the clone was fully reachable by Tab.
		expect(MINIMAP).toMatch(/^\s*clone\.setAttribute\('inert'/m);
	});

	it('changes only the background on hover', () => {
		// The strip is nearly the full height of the viewport, so any edge treatment on
		// it is a bright line down the whole screen rather than the highlight it looks
		// like in a mock-up.
		const hover = MINIMAP.match(/\.minimap:hover[^{]*\{([^}]*)\}/);
		expect(hover?.[1], 'no .minimap:hover rule found').toBeTruthy();
		expect(hover![1]).not.toMatch(/border|outline|box-shadow/);
	});
});

describe('§ 1 — the native bar is only hidden once something replaces it', () => {
	it('scrollbar-width: none is scoped to the has-custom-scrollbar class', () => {
		// Hiding it unconditionally leaves a page with no way to see where it is, and no
		// way to get anywhere on a machine where the custom modes are unavailable.
		for (const m of APP_HTML.matchAll(/([^\n{]*)\{[^}]*scrollbar-width:\s*none/g)) {
			expect(m[1], `unscoped scrollbar-width: none in "${m[1].trim()}"`).toContain(
				'has-custom-scrollbar'
			);
		}
	});

	it('the reserved gutter is given back when a custom bar takes over', () => {
		// scrollbar-gutter: stable holds the native bar's width whether or not it is
		// drawn. Left in place under a custom overlay it reserves space for a bar that
		// does not exist — the exact gap the overlay was chosen to avoid.
		expect(APP_HTML).toMatch(/has-custom-scrollbar\s*\{[^}]*scrollbar-gutter:\s*auto/);
	});
});
