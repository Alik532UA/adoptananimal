import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Every var(--x) must be declared, and declared in *every* theme.
 *
 * This is the check that would have caught --color-primary-rgb: it was used in four
 * places with a fallback of the dark theme's green, declared in no theme at all, and
 * therefore tinted the other three themes green without anyone noticing.
 */

const THEMES_DIR = resolve('src/lib/styles/themes');
const themeFiles = readdirSync(THEMES_DIR).filter((f) => f.endsWith('.css'));

const declarationsIn = (css: string) =>
	new Set([...css.matchAll(/(?:^|[;{"\s])(--[a-z0-9-]+)\s*:/gim)].map((m) => m[1]));

const collectSources = (dir: string, out: string[] = []): string[] => {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = resolve(dir, entry.name);
		if (entry.isDirectory()) collectSources(full, out);
		else if (/\.(svelte|css)$/.test(entry.name)) out.push(full);
	}
	return out;
};

const sources = collectSources(resolve('src'));
const allCss = sources.map((f) => readFileSync(f, 'utf-8')).join('\n');

const declared = declarationsIn(allCss);
const used = new Set([...allCss.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)].map((m) => m[1]));

describe('CSS custom properties', () => {
	it('has themes to compare', () => {
		expect(themeFiles.length).toBeGreaterThan(1);
	});

	it('declares every variable that is used', () => {
		const undeclared = [...used].filter((name) => !declared.has(name));
		expect(undeclared).toEqual([]);
	});

	it('declares the same variables in every theme', () => {
		const perTheme = themeFiles.map((file) => ({
			file,
			names: declarationsIn(readFileSync(resolve(THEMES_DIR, file), 'utf-8'))
		}));

		const union = new Set(perTheme.flatMap(({ names }) => [...names]));
		const gaps = perTheme.flatMap(({ file, names }) =>
			[...union].filter((name) => !names.has(name)).map((name) => `${file} is missing ${name}`)
		);

		expect(gaps).toEqual([]);
	});

	it('never uses var(--x, fallback) — a fallback hides a missing declaration', () => {
		const withFallback = [...allCss.matchAll(/var\(\s*--[a-z0-9-]+\s*,/gi)].map((m) => m[0]);
		expect(withFallback).toEqual([]);
	});
});
