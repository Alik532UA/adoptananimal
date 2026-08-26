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
	return checkGeo(dir, { robotsMeta: false, searchAgents: [] });
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
