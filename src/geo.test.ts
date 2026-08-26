// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { checkGeo } from '../scripts/check-geo.js';

/**
 * The gate over `llms.txt`, and specifically the hole that made it report success
 * over a file where every link was dead.
 *
 * `checkGeo` decides which addresses are ours by prefix, taking the site root from
 * the home page's canonical, and skips the rest — a repository link or a social
 * account is not this site's problem. The assumption underneath is that something
 * survives the filter. Nothing did: `static/llms.txt` named the host
 * `adoptananimal.github.io` where this site lives at `alik532ua.github.io`, so all
 * seven addresses looked foreign, all seven were skipped, and the check that exists
 * to prove the pages are real ran over zero pages and passed.
 *
 * That is the AI-AGENT-PITFALLS-v8 § 1 shape exactly — a green run that measured
 * nothing — and it is invisible from the outside, because a check that examined no
 * candidates looks the same as one where every candidate was fine.
 *
 * Reverse experiment: deleting the `ours.length === 0` branch from `check-geo.js`
 * reddens `a file that names no address of ours is the defect, not a clean run`
 * and leaves the other three green — which is the point, since those three are what
 * was already working while the site shipped seven 404s.
 */

const ROOT = 'https://example.test/site';

let dir = '';

afterEach(() => {
	if (dir) rmSync(dir, { recursive: true, force: true });
	dir = '';
});

/**
 * A minimal build: a home page for the root to be read from, a robots.txt so the
 * second half of the gate has something to parse, the llms.txt under test, and
 * whatever pages the case says exist.
 */
function build(llms: string, pages: string[] = []): string[] {
	dir = mkdtempSync(join(tmpdir(), 'geo-'));
	writeFileSync(
		join(dir, 'index.html'),
		`<html><head><link rel="canonical" href="${ROOT}/"/></head><body></body></html>`
	);
	writeFileSync(join(dir, 'robots.txt'), 'User-agent: *\nDisallow: /private\n');
	writeFileSync(join(dir, 'llms.txt'), llms);

	for (const page of pages) {
		const file = join(dir, page);
		mkdirSync(dirname(file), { recursive: true });
		writeFileSync(file, '<html></html>');
	}

	// Isolated to the llms.txt half: the robots.txt group rules are exercised by
	// check-build over the real file, and a missing agent group here would be noise.
	return checkGeo(dir, { robotsMeta: false, metaDescription: false, searchAgents: [] });
}

const link = (name: string, url: string) => `- [${name}](${url}): what it is.`;
const file = (...links: string[]) => `# Site\n\n> Summary.\n\n## Pages\n\n${links.join('\n')}\n`;

describe('the llms.txt gate', () => {
	it('passes a file whose addresses all exist', () => {
		const problems = build(file(link('Home', `${ROOT}/`), link('Cats', `${ROOT}/adopt/cat`)), [
			'adopt/cat.html'
		]);

		expect(problems).toEqual([]);
	});

	/*
	 * The defect this test exists for. Every address is well-formed, every one of
	 * them 404s, and before the fix the gate said the build looked good.
	 */
	it('a file that names no address of ours is the defect, not a clean run', () => {
		const problems = build(
			file(
				link('Home', 'https://someone-else.github.io/site/'),
				link('Cats', 'https://someone-else.github.io/site/adopt/cat')
			)
		);

		expect(problems).toHaveLength(1);
		expect(problems[0]).toContain('жодна з 2 адрес');
		expect(problems[0]).toContain(`${ROOT}/`);
	});

	/* The skip itself has to survive: a real third-party link beside a real one. */
	it('still ignores a genuinely third-party link', () => {
		const problems = build(
			file(link('Home', `${ROOT}/`), link('Source', 'https://github.com/Alik532UA/adoptananimal'))
		);

		expect(problems).toEqual([]);
	});

	/* And the original rule keeps working: our address, no such page. */
	it('reports one of our addresses that the build does not contain', () => {
		const problems = build(file(link('Home', `${ROOT}/`), link('About', `${ROOT}/about`)));

		expect(problems).toEqual([`llms.txt: адреси немає в build/ — ${ROOT}/about`]);
	});
});

/** A build of pages carrying the given head tags, checked without the llms.txt half. */
function pageBuild(pages: Record<string, string>): string[] {
	dir = mkdtempSync(join(tmpdir(), 'geo-'));
	writeFileSync(join(dir, 'robots.txt'), 'User-agent: *\nDisallow: /private\n');

	for (const [name, head] of Object.entries(pages)) {
		const target = join(dir, name);
		mkdirSync(dirname(target), { recursive: true });
		writeFileSync(target, `<html><head>${head}</head><body></body></html>`);
	}

	return checkGeo(dir, { expectsLlmsTxt: false, searchAgents: [] });
}

const description = (text: string) => `<meta name="description" content="${text}"/>`;
const NOINDEX = '<meta name="robots" content="noindex, nofollow"/>';

/**
 * The `<meta name="description">` count, which is the `robots` rule beside it applied
 * to the tag that was actually broken.
 *
 * `<svelte:head>` appends rather than replaces, so a description in the layout does
 * not become a default that a page overrides — it becomes a second tag next to the
 * page's own. 208 of the 229 built pages carried two, generic English first, on all
 * four languages. Nothing anywhere said so: the build was green, the browser showed
 * a working page, and only counting the tags in `build/` revealed it.
 *
 * Reverse experiment: dropping the `tags.length > 1` branch reddens `two description
 * tags on one page is the layout-plus-page defect`; dropping the `tags.length === 0`
 * branch reddens `an indexed page with no description at all`; and removing the
 * `noindex` condition reddens `a hidden page needs none — nothing ever reads it`.
 */
describe('the meta description count', () => {
	it('passes one description per indexed page', () => {
		expect(pageBuild({ 'index.html': description('The site.') })).toEqual([]);
	});

	it('two description tags on one page is the layout-plus-page defect', () => {
		const problems = pageBuild({
			'index.html': description('The whole site.') + description('This page.')
		});

		expect(problems).toEqual(['index.html: <meta name="description"> знайдено 2, очікується 1']);
	});

	it('an indexed page with no description at all', () => {
		expect(pageBuild({ 'index.html': '<title>Nothing else</title>' })).toEqual([
			'index.html: сторінка в індексі без <meta name="description">'
		]);
	});

	it('a hidden page needs none — nothing ever reads it', () => {
		expect(pageBuild({ 'apply/form.html': NOINDEX })).toEqual([]);
	});

	/* The SPA shell has an empty body by design and nothing to describe. */
	it('404.html is exempt', () => {
		expect(pageBuild({ '404.html': '<title>Not found</title>' })).toEqual([]);
	});
});

/**
 * Open Graph properties, which is the same append trap on the tag that costs the most.
 *
 * The layout wrote `og:image` unconditionally; the animal page added its own
 * photograph. Both shipped, the logo first, and an Open Graph reader takes the FIRST —
 * so every animal link shared to Facebook, Telegram, WhatsApp or Slack previewed the
 * shelter logo instead of the animal, on the 200 pages where the photograph is the
 * whole reason to share the link. The only place it was ever visible is a link
 * preview, which no build generates.
 *
 * The rule is deliberately stricter than the specification: Open Graph does allow a
 * repeated `og:image` to describe a gallery. There is no gallery here, so a repeat
 * means a tag was appended rather than replaced — and that mechanism has now cost this
 * project three different tags.
 *
 * Reverse experiment: removing the `count > 1` branch reddens `two og:image tags is
 * the layout-plus-page defect again` and nothing else.
 */
describe('the Open Graph property count', () => {
	const og = (key: string, value: string) => `<meta property="og:${key}" content="${value}"/>`;

	it('passes one of each property', () => {
		expect(
			pageBuild({
				'index.html': description('A page.') + og('image', '/logo.webp') + og('title', 'A page')
			})
		).toEqual([]);
	});

	it('two og:image tags is the layout-plus-page defect again', () => {
		const problems = pageBuild({
			'adopt/cat/basti.html':
				description('BASTI.') + og('image', '/logo.webp') + og('image', '/basti.jpg')
		});

		expect(problems).toEqual([
			'adopt/cat/basti.html: <meta property="og:image"> знайдено 2, очікується 1 — читач бере перший'
		]);
	});

	/* Different properties are not duplicates of one another. */
	it('does not confuse og:image with og:image:alt', () => {
		expect(
			pageBuild({
				'index.html': description('A page.') + og('image', '/a.jpg') + og('image:alt', 'A')
			})
		).toEqual([]);
	});
});
