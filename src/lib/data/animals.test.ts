import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Invariants over the animal dataset. These are the failures that only show up on the
 * deployed site: a slug that points at no image, or a filename whose case differs from
 * the slug — invisible on Windows, a blank page on the Linux runner and on GitHub Pages.
 */

const DATA_DIR = resolve('src/lib/data/animals');
const IMAGE_DIR = resolve('static/images/animals');

const dataFiles = readdirSync(DATA_DIR).filter((f) => f.endsWith('.ts'));
const imageFiles = readdirSync(IMAGE_DIR);

describe('animal data files', () => {
	it('exist at all', () => {
		expect(dataFiles.length).toBeGreaterThan(0);
	});

	it('are named <type>_<slug>.ts with a known type', () => {
		const bad = dataFiles.filter((f) => !/^(cat|dog)_[a-z0-9-]+\.ts$/.test(f));
		expect(bad).toEqual([]);
	});
});

const animalModules = import.meta.glob<{
	summary: {
		slug: string;
		type: string;
		image: string;
		gender: Record<string, string>;
		breed: Record<string, string>;
		bornOn: string;
		size: Record<string, string>;
		color: Record<string, string>;
	};
	description: Record<string, string[]>;
}>('./animals/*.ts', { eager: true });

describe('animal images', () => {
	it('exist for every animal, matching case exactly', () => {
		const missing: string[] = [];

		for (const [path, mod] of Object.entries(animalModules)) {
			const file = path.split('/').pop() as string;
			const image: string = mod.summary.image;
			const name = image.split('/').pop() as string;

			// Case-sensitive on purpose: readdirSync gives the real name on disk, and a
			// mismatch is a 404 on Linux while it silently works on Windows.
			if (!imageFiles.includes(name)) {
				missing.push(`${file} -> ${image}`);
			}
		}

		expect(missing).toEqual([]);
	});
});

describe('animal summaries', () => {
	it('have a unique slug', () => {
		const slugs = Object.values(animalModules).map((mod) => mod.summary.slug);
		const duplicates = slugs.filter((s, i) => slugs.indexOf(s) !== i);
		expect(duplicates).toEqual([]);
	});

	it('have a slug that matches the filename', () => {
		const mismatched: string[] = [];
		for (const [path, mod] of Object.entries(animalModules)) {
			const file = path.split('/').pop() as string;
			const expected = `${mod.summary.type}_${mod.summary.slug}.ts`;
			if (expected !== file) mismatched.push(`${file} declares ${expected}`);
		}

		expect(mismatched).toEqual([]);
	});

	it('carry every language in every multilingual field', () => {
		const incomplete: string[] = [];
		// No 'age': it is not written in four languages any more. `bornOn` is a single
		// date and src/lib/data/age.test.ts is what checks it.
		const fields = ['gender', 'breed', 'size', 'color'] as const;
		const locales = ['en', 'uk', 'de', 'nl'] as const;

		for (const [path, mod] of Object.entries(animalModules)) {
			const file = path.split('/').pop() as string;
			for (const field of fields) {
				for (const locale of locales) {
					const value = mod.summary[field]?.[locale];
					if (typeof value !== 'string' || value.trim() === '') {
						incomplete.push(`${file}: ${field}.${locale}`);
					}
				}
			}
			for (const locale of locales) {
				const paragraphs = mod.description?.[locale];
				if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
					incomplete.push(`${file}: description.${locale}`);
				}
			}
		}

		expect(incomplete).toEqual([]);
	});

	it('are exported in exact canonical order matching the legacy site', async () => {
		const { dogs, cats, CANONICAL_DOG_ORDER, CANONICAL_CAT_ORDER } = await import('./animals');
		expect(dogs.map((d) => d.slug)).toEqual([...CANONICAL_DOG_ORDER]);
		expect(cats.map((c) => c.slug)).toEqual([...CANONICAL_CAT_ORDER]);
	});
});

describe('imagePosition', () => {
	/*
	 * A value the browser cannot parse is dropped and falls back to the centre crop the
	 * field exists to override — silently, on the one card someone was trying to fix.
	 * `centre top`, `50%0%`, `50 0` all look right in a diff and all do nothing.
	 */
	const VALUE =
		/^(\d{1,3}% \d{1,3}%|left|right|center|top|bottom|(left|right|center) (top|bottom|center))$/;

	const declared = dataFiles
		.map((file) => ({
			file,
			value: readFileSync(resolve(DATA_DIR, file), 'utf8').match(/imagePosition:\s*'([^']*)'/)?.[1]
		}))
		.filter((entry): entry is { file: string; value: string } => entry.value !== undefined);

	it('is declared on the animals whose photographs needed it', () => {
		// Not an exact count: the point is that the field is in use, so a refactor that
		// quietly stopped reading it would not leave this suite green.
		expect(declared.length).toBeGreaterThan(5);
	});

	it('is a value a browser will accept', () => {
		const bad = declared.filter((entry) => !VALUE.test(entry.value));
		expect(bad, `unparseable object-position: ${JSON.stringify(bad)}`).toEqual([]);
	});
});
