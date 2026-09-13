import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { basename, posix, resolve } from 'node:path';

/**
 * Structural invariants from PROJECT-STRUCTURE-v9 §§ 2, 4 and 7.
 *
 * The size rule is the one that needed a test rather than good intentions: nothing about
 * an 878-line component is visible in a diff, and by the time it is obvious it is too
 * late to want to split it. The canon says to switch the limit on with the existing
 * offenders listed explicitly, so that the list is a thing you shorten rather than a
 * gate you turn off — which is what the ceilings below are.
 *
 * Reachability (§ 4.3.1, `PS-REACHABILITY`) is proved by an import graph rather than by
 * grepping for the file's name, and it covers every module under `src/` — `.ts` and
 * `.css` as well as components. Orphans in `static/` (§ 2.1, `PS-STATIC-ORPHANS`) are a
 * different walk over a different tree and live in `static-assets.test.ts`.
 */

const ROOT = resolve(__dirname, '..');

function sources(dir = 'src', out: string[] = []): string[] {
	for (const entry of readdirSync(resolve(ROOT, dir), { withFileTypes: true })) {
		const path = `${dir}/${entry.name}`;
		if (entry.isDirectory()) sources(path, out);
		else if (/\.(svelte|ts)$/.test(entry.name) && !/\.(test|spec)\.ts$/.test(entry.name)) {
			out.push(path);
		}
	}
	return out;
}

const read = (path: string) => readFileSync(resolve(ROOT, path), 'utf8');

/** § 7. A route page may be longer than a component: it is allowed to compose. */
const LIMITS: Array<[RegExp, number]> = [
	[/\/routes\/.*\+page\.svelte$/, 400],
	[/\.svelte$/, 300],
	[/\.svelte\.ts$/, 300],
	[/\.ts$/, 250]
];

/**
 * The files that were already over the line when this test arrived — path and the
 * SLOC ceiling each one is held to (PROJECT-STRUCTURE-v9 § 7.1, `PS-SIZE-RATCHET`).
 *
 * Every entry is a debt with a reason, and the reasons differ — some are worth paying
 * off, one or two are ports of canon reference code that would only get worse if
 * rearranged. The reasons are in PROJECT-CONTEXT.md § 4.15, and the numbers below are
 * the ones that document repeats; `docs-numbers.test.ts` fails when the two disagree.
 *
 * The list is meant to shrink, and an entry is only allowed in when splitting the file
 * would make the code WORSE rather than when it would merely be work — PROJECT-STRUCTURE
 * § 7 sanctions exactly that, provided the reason is written down. "Entries never go in"
 * is what this note used to say, and it did not survive contact: HeaderNavLinks went
 * over while gaining a feature it could not be split out of. Saying so is better than a
 * rule quietly broken.
 *
 * **The number matters as much as the name.** Until 2026-09-10 this was a bare `Set` of
 * paths, which is an exemption rather than a ratchet: a file on it could go from 374
 * lines to 3 740 without a word from any gate, and the only thing keeping it honest was
 * that nobody happened to try. v9 § 7.1 names exactly that shape as the thing seven
 * projects each fixed independently. The ceiling is the file's CURRENT size, never
 * rounded up: headroom is permission to grow, which is what the list exists to deny.
 */
const OVERSIZED: Record<string, number> = {
	'src/lib/components/ui/Minimap.svelte': 375,
	'src/lib/components/apply/ApplyForm.svelte': 351,
	'src/lib/components/animal/AnimalCard.svelte': 337,
	'src/routes/+layout.svelte': 320,
	'src/lib/components/ui/Carousel.svelte': 309
};

/** Everything under `src/` that can be imported, tests and stylesheets included. */
function modulesUnderSrc(dir = 'src', out: string[] = []): string[] {
	for (const entry of readdirSync(resolve(ROOT, dir), { withFileTypes: true })) {
		const path = `${dir}/${entry.name}`;
		if (entry.isDirectory()) modulesUnderSrc(path, out);
		else if (/\.(svelte|ts|js|css)$/.test(entry.name)) out.push(path);
	}
	return out;
}

/**
 * Where the application starts, from the framework's point of view.
 *
 * Route files, hooks and param matchers are loaded by SvelteKit by name — nothing
 * imports them, and nothing should. Check files are entry points for the same reason:
 * a module whose only caller is its own test is still reached, and calling that an
 * orphan would push the project towards deleting the test instead of the module.
 */
const ENTRY = [
	/^src\/routes\/(?:.*\/)?\+[^/]+\.(svelte|ts|js)$/,
	/^src\/hooks\.[^/]+\.ts$/,
	/^src\/service-worker\.[^/]+$/,
	/^src\/params\/[^/]+\.ts$/,
	/^src\/app\.d\.ts$/,
	/\.(test|spec)\.ts$/
];

/**
 * Turns one import specifier into the files it can mean.
 *
 * Bare specifiers (`svelte`, `zod`) and virtual ones (`$app/*`, `$env/*`) resolve
 * outside `src/` and are dropped. A specifier carrying `*` is an `import.meta.glob`
 * pattern and resolves to EVERY file it matches — that is the edge that keeps the
 * fifty animal records reachable, and the canon asks for it by name.
 */
function targetsOf(spec: string, from: string, all: string[]): string[] {
	let path: string;
	if (spec.startsWith('$lib')) path = `src/lib${spec.slice(4)}`;
	else if (spec.startsWith('.')) path = posix.normalize(posix.join(posix.dirname(from), spec));
	else return [];

	if (path.includes('*')) {
		// Split on the wildcards so each piece is translated once and literally.
		// Escaping first and substituting after needs a placeholder to hold `**` apart
		// from `*`, and any placeholder is a character that can occur in a real path.
		const pattern = new RegExp(
			`^${path
				.split(/(\*\*|\*)/)
				.map((part) =>
					part === '**' ? '.*' : part === '*' ? '[^/]*' : part.replace(/[.+^${}()|[\]\\?]/g, '\\$&')
				)
				.join('')}$`
		);
		return all.filter((candidate) => pattern.test(candidate));
	}

	// Extensionless specifiers are the norm in TypeScript; `.svelte` and `.css` are
	// always written out. `/index.ts` covers a directory import.
	return [path, `${path}.ts`, `${path}.js`, `${path}.svelte`, `${path}/index.ts`].filter(
		(candidate) => all.includes(candidate)
	);
}

/** `from '…'`, `import '…'`, `import('…')`, `import.meta.glob('…')`, CSS `@import '…'`. */
const SPECIFIERS = [
	/\bfrom\s*['"]([^'"]+)['"]/g,
	/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
	/\bimport\s+['"]([^'"]+)['"]/g,
	/\bimport\.meta\.glob\s*(?:<[\s\S]*?>)?\s*\(\s*['"]([^'"]+)['"]/g,
	/@import\s+(?:url\()?['"]([^'"]+)['"]/g
];

describe('§ 4.3 — a file that exists reads as work that was done', () => {
	// The most expensive rule in the canon, and the one this file was missing. A
	// component nobody imports still gets read, edited and cited: a fully written
	// SEO.svelte, imported from nowhere, once earned a project an SEO score it did
	// not have. Nothing about it looks wrong — that is the whole problem.
	const all = sources();
	const modules = modulesUnderSrc();

	const graph = new Map<string, string[]>(
		modules.map((path) => {
			const text = read(path);
			const to = new Set<string>();
			for (const pattern of SPECIFIERS) {
				for (const [, spec] of text.matchAll(pattern)) {
					for (const target of targetsOf(spec, path, modules)) to.add(target);
				}
			}
			return [path, [...to]];
		})
	);

	/*
	 * A module named by an npm script or a workflow is an entry point too: that is how
	 * `src/lib/i18n/validator.ts` arrives, run as `tsx src/lib/i18n/validator.ts` by
	 * `npm run check:i18n`. Nothing imports it, and a gate that called it dead would
	 * be asking for the parity check to be deleted.
	 */
	const invoked = (() => {
		const workflowDir = resolve(ROOT, '.github/workflows');
		const text = [
			read('package.json'),
			...readdirSync(workflowDir)
				.filter((name) => /\.ya?ml$/.test(name))
				.map((name) => read(`.github/workflows/${name}`))
		].join('\n');
		return modules.filter((path) => text.includes(path));
	})();

	const entries = [
		...new Set([...modules.filter((path) => ENTRY.some((re) => re.test(path))), ...invoked])
	];

	const reachable = new Set(entries);
	for (let added = true; added; ) {
		added = false;
		for (const path of [...reachable]) {
			for (const target of graph.get(path) ?? []) {
				if (!reachable.has(target)) {
					reachable.add(target);
					added = true;
				}
			}
		}
	}

	it('the scan finds components at all — the check is alive', () => {
		const components = all.filter((path) => path.includes('/lib/') && path.endsWith('.svelte'));
		expect(
			components.length,
			'no components found — the walker is looking in the wrong place'
		).toBeGreaterThan(10);
	});

	it('the import graph has edges at all — the resolver is alive', () => {
		// Without this the whole check below is one typo away from being a green
		// nothing: a resolver that returns [] for every specifier reports zero
		// orphans, which reads exactly like a clean project.
		const edges = [...graph.values()].reduce((n, to) => n + to.length, 0);
		expect(edges, 'no import resolved anywhere — the specifier patterns broke').toBeGreaterThan(
			100
		);
		expect(entries.length, 'no entry point matched — the patterns broke').toBeGreaterThan(10);
	});

	it('every module under src/ is reachable from an entry point', () => {
		/*
		 * Reachability is proved by the graph, not by finding the file's NAME somewhere
		 * (PROJECT-STRUCTURE-v9 § 4.3.1, `PS-REACHABILITY`).
		 *
		 * The check this replaces looked for the basename in the text of every other
		 * source, and it had two holes the canon names outright. It could not see a
		 * chain of orphans — `A.svelte` imports `B.svelte`, nobody imports `A`, and `B`
		 * counts as used. And it looked only at `.svelte` under `lib/`, so every `.ts`
		 * module in the project was outside it entirely.
		 *
		 * That second hole was holding something: `src/lib/index.ts`, the scaffold stub
		 * from `npm create svelte` ("place files you want to import through the `$lib`
		 * alias in this folder"), imported by nothing since the first commit. Small and
		 * harmless in itself — the point is that nothing in the repository could have
		 * told you it was dead.
		 */
		const orphans = modules.filter((path) => !reachable.has(path));

		expect(
			orphans,
			`no path to it from any entry point — wire it up or delete it:\n${orphans.join('\n')}`
		).toEqual([]);
	});

	it('every script in scripts/ is reached by something that runs', () => {
		/*
		 * The same rule as the components above, on the directory where it costs more.
		 * § 4.3 says it in as many words: "the same goes for localisation keys, CSS
		 * classes and package.json scripts — existing is not being used".
		 *
		 * It costs more here because of the names. `scripts/` held eleven files called
		 * `check-adopted-images`, `check-folders`, `check-image-dimensions`,
		 * `check-order`, `check-traits`, `verify-mapping` — one-offs from the content
		 * import that read `.temp/`, a directory long gone, so they could not run at
		 * all. Anyone counting this project's gates, a person or an agent, reads six
		 * more `check-*` than exist. That is the § 4.3 failure at its most direct: the
		 * quality report comes out wrong, and nothing looks broken.
		 *
		 * The worst of them was not a `check-*`. `generate-sitemap.mjs` was a second,
		 * DIVERGENT sitemap generator — no `changefreq`, its own priority rule, no
		 * hidden-route filter, and `/adoptananimal/` hard-coded — sitting beside the
		 * live one in `src/routes/sitemap.xml/+server.ts`. Run once by anyone who
		 * believed the name, it would have overwritten the real file with a worse one.
		 *
		 * Reachable means: named by a `package.json` script, named in a workflow, or
		 * imported by a file that is itself reachable (`check-geo.js` arrives that way,
		 * through `check-build.js`).
		 */
		const dir = 'scripts';
		const scripts = readdirSync(resolve(ROOT, dir))
			.filter((name) => /\.(js|mjs|cjs|ts|ps1)$/.test(name))
			.map((name) => `${dir}/${name}`);

		expect(scripts.length, 'scripts/ is empty — the walker is looking elsewhere').toBeGreaterThan(
			0
		);

		const pkg = read('package.json');
		const workflowDir = resolve(ROOT, '.github/workflows');
		const workflows = readdirSync(workflowDir)
			.filter((name) => /\.ya?ml$/.test(name))
			.map((name) => read(`.github/workflows/${name}`))
			.join('\n');

		// Entry points first, then anything they import, transitively. A fixed point
		// rather than one pass: a chain three deep is not visible to a single sweep.
		const reachable = new Set(
			scripts.filter((path) => {
				const name = basename(path);
				return pkg.includes(name) || workflows.includes(name);
			})
		);

		for (let added = true; added; ) {
			added = false;
			for (const path of scripts) {
				if (reachable.has(path)) continue;
				const name = basename(path);
				if ([...reachable].some((from) => read(from).includes(name))) {
					reachable.add(path);
					added = true;
				}
			}
		}

		const orphans = scripts.filter((path) => !reachable.has(path));
		expect(
			orphans,
			`run by nobody — a name that promises a gate is worse than no file:\n${orphans.join('\n')}`
		).toEqual([]);
	});

	it('runes live only in .svelte and .svelte.ts', () => {
		// The compiler does not process runes outside those two extensions. It does
		// not complain either: `$state(0)` in a plain .ts is an undefined function
		// call that fails at runtime, in the browser, on whichever path reaches it
		// first. Renaming the file is the whole fix, which is why this is worth a
		// gate rather than a habit.
		const wrong = all
			.filter((path) => path.endsWith('.ts') && !path.endsWith('.svelte.ts'))
			.filter((path) => /\$state[({<]|\$derived[({<]|\$effect[({.]/.test(read(path)));

		expect(wrong, `runes in a plain .ts — rename to .svelte.ts:\n${wrong.join('\n')}`).toEqual([]);
	});
});

const countSloc = (code: string): number =>
	code
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/^\s*\/\/.*$/gm, '')
		.split(/\r?\n/)
		.filter((l) => l.trim().length > 0).length;

describe('§ 7 — file size (SLOC)', () => {
	const measured = sources().map((path) => {
		const limit = LIMITS.find(([re]) => re.test(path))?.[1] ?? Infinity;
		return { path, lines: countSloc(read(path)), limit };
	});

	it('no new file goes over its limit', () => {
		const over = measured
			.filter((f) => f.lines > f.limit && OVERSIZED[f.path] === undefined)
			.map((f) => `${f.path}: ${f.lines} lines (limit ${f.limit})`);

		expect(over, `over the limit and not on the list:\n${over.join('\n')}`).toEqual([]);
	});

	it('no file on the list goes over its own ceiling', () => {
		// The invariant that turns the list from an exemption into a ratchet. Without it
		// the two tests around this one both stay green while a listed file doubles: the
		// first skips it because it is listed, the second because it is still over the
		// § 7 limit. The ceiling is the only thing that notices.
		const grown = Object.entries(OVERSIZED)
			.map(([path, ceiling]) => ({ path, ceiling, file: measured.find((f) => f.path === path) }))
			.filter((e) => e.file && e.file.lines > e.ceiling)
			.map((e) => `${e.path}: ${e.file!.lines} lines (ceiling ${e.ceiling})`);

		expect(
			grown,
			`grew past the ceiling — split it, or lower the ceiling only after shrinking it:\n${grown.join('\n')}`
		).toEqual([]);
	});

	it('no ceiling on the list carries headroom', () => {
		// Headroom is the ratchet failing quietly: a ceiling written 40 lines above the
		// file is 40 lines of growth nobody will ever be asked about, and it is indis-
		// tinguishable from a correct entry by reading. The number is therefore the
		// measurement, and the message says what to write so that keeping it current
		// costs one edit rather than one investigation.
		const slack = Object.entries(OVERSIZED)
			.map(([path, ceiling]) => ({ path, ceiling, file: measured.find((f) => f.path === path) }))
			.filter((e) => e.file && e.file.lines < e.ceiling)
			.map((e) => `${e.path}: ${e.ceiling} → ${e.file!.lines}`);

		expect(
			slack,
			`shrank below its ceiling — lower the number, the list only ratchets down:\n${slack.join('\n')}`
		).toEqual([]);
	});

	it('the list of known offenders holds nothing that has since been split', () => {
		// A stale entry is how an allowlist quietly becomes permission. If a file has come
		// back under its limit, this fails until its name is removed — so the list can only
		// ever get shorter.
		const settled = Object.keys(OVERSIZED).filter((path) => {
			const file = measured.find((f) => f.path === path);
			return !file || file.lines <= file.limit;
		});

		expect(
			settled,
			`no longer over the limit — remove from the list:\n${settled.join('\n')}`
		).toEqual([]);
	});

	it('no file sits exactly on its limit', () => {
		/*
		 * § 7.1: a file level with the guideline is a signal, not a norm. The next line
		 * added to it turns the gate red with no architectural reason to point at, and
		 * whoever hits that reads it as the gate being wrong rather than the file being
		 * full. `VetCrewGames` had three pages parked at 400 of 400.
		 *
		 * Zero today, so this is a tripwire rather than a finding: it fires the first
		 * time a file is grown right up to the edge, which is the moment to decide
		 * whether it splits or joins the list above with a reason.
		 */
		const level = measured
			.filter((f) => f.lines === f.limit)
			.map((f) => `${f.path}: ${f.lines} of ${f.limit}`);

		expect(
			level,
			`level with the § 7 guideline — split it now or list it with a reason:\n${level.join('\n')}`
		).toEqual([]);
	});
});

describe('§ 4 — naming', () => {
	it('a component is imported under the name of its own file', () => {
		// `import Card from './AnimalCard.svelte'` compiles and reads as a different
		// component than the one it is. Cheap to check, impossible to see in review.
		const wrong: string[] = [];
		const pattern =
			/import\s+([A-Z][A-Za-z0-9]*)\s+from\s+["'][^"']*\/([A-Z][A-Za-z0-9]*)\.svelte["']/g;

		for (const path of sources()) {
			for (const match of read(path).matchAll(pattern)) {
				if (match[1] !== match[2]) wrong.push(`${path}: ${match[1]} -> ${match[2]}.svelte`);
			}
		}

		expect(wrong, `alias does not match the file:\n${wrong.join('\n')}`).toEqual([]);
	});
});
