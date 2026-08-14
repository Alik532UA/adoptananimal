import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
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

describe('animal images', () => {
	it('exist for every animal, matching case exactly', async () => {
		const missing: string[] = [];

		for (const file of dataFiles) {
			const mod = await import(`./animals/${file}`);
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
	it('have a unique slug', async () => {
		const slugs: string[] = [];
		for (const file of dataFiles) {
			const mod = await import(`./animals/${file}`);
			slugs.push(mod.summary.slug);
		}

		const duplicates = slugs.filter((s, i) => slugs.indexOf(s) !== i);
		expect(duplicates).toEqual([]);
	});

	it('have a slug that matches the filename', async () => {
		const mismatched: string[] = [];
		for (const file of dataFiles) {
			const mod = await import(`./animals/${file}`);
			const expected = `${mod.summary.type}_${mod.summary.slug}.ts`;
			if (expected !== file) mismatched.push(`${file} declares ${expected}`);
		}

		expect(mismatched).toEqual([]);
	});

	it('carry every language in every multilingual field', async () => {
		const incomplete: string[] = [];
		const fields = ['gender', 'breed', 'age', 'size', 'color'] as const;
		const locales = ['en', 'uk', 'de', 'nl'] as const;

		for (const file of dataFiles) {
			const mod = await import(`./animals/${file}`);
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
});
