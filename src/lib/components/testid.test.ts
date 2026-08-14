import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Static checks over the data-testid convention (TESTID-AND-NAMING § 1).
 * Runtime duplicates — the same id rendered once per list item — need a browser and
 * are out of scope here; this catches the naming rules that are visible in the source.
 */

const CANONICAL_TYPES = [
	'btn',
	'link',
	'input',
	'textarea',
	'checkbox',
	'radio',
	'select',
	'toggle',
	'slider',
	'option',
	'form',
	'fieldset',
	'label',
	'modal',
	'drawer',
	'backdrop',
	'overlay',
	'tooltip',
	'toast',
	'card',
	'list',
	'item',
	'row',
	'cell',
	'tabs',
	'tab',
	'panel',
	'section',
	'header',
	'footer',
	'nav',
	'banner',
	'menu',
	'toolbar',
	'icon',
	'img',
	'container',
	'title',
	'text',
	'message',
	'error',
	'hint',
	'warning',
	'value',
	'count',
	'status',
	'badge',
	'progress',
	'spinner',
	'skeleton'
];

const FORBIDDEN_TYPES = [
	'wrapper',
	'box',
	'block',
	'group',
	'content',
	'grid',
	'widget',
	'area',
	'root',
	'trigger',
	'display',
	'switcher',
	'dialog',
	'popup',
	'help',
	'button'
];

const collect = (dir: string, out: string[] = []): string[] => {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = resolve(dir, entry.name);
		if (entry.isDirectory()) collect(full, out);
		else if (entry.name.endsWith('.svelte')) out.push(full);
	}
	return out;
};

const files = collect(resolve('src'));

/** Every literal testid in the source, with template holes reduced to a placeholder. */
const testIds = files.flatMap((file) => {
	const source = readFileSync(file, 'utf-8');
	return [...source.matchAll(/data-testid="([^"]+)"/g)].map((m) => ({
		file: file.replace(resolve('src'), 'src'),
		// {animal.slug} and the like are discriminators, not name segments
		id: m[1].replace(/\{[^}]*\}/g, 'X')
	}));
});

describe('data-testid convention', () => {
	it('finds testids to check', () => {
		expect(testIds.length).toBeGreaterThan(20);
	});

	it('ends every id with a canonical type segment', () => {
		const bad = testIds.filter(({ id }) => {
			const last = id.split('-').filter(Boolean).pop();
			return !last || !CANONICAL_TYPES.includes(last);
		});
		expect(bad.map((b) => `${b.file}: ${b.id}`)).toEqual([]);
	});

	it('never uses a forbidden word in the type position', () => {
		const bad = testIds.filter(({ id }) => {
			const last = id.split('-').filter(Boolean).pop();
			return last ? FORBIDDEN_TYPES.includes(last) : false;
		});
		expect(bad.map((b) => `${b.file}: ${b.id}`)).toEqual([]);
	});

	it('has no duplicate literal id within one component', () => {
		const perFile = new Map<string, string[]>();
		for (const { file, id } of testIds) {
			perFile.set(file, [...(perFile.get(file) ?? []), id]);
		}

		const duplicates: string[] = [];
		for (const [file, ids] of perFile) {
			const seen = new Set<string>();
			for (const id of ids) {
				// A templated id renders differently per item, so repeats are expected
				if (id.includes('X')) continue;
				if (seen.has(id)) duplicates.push(`${file}: ${id}`);
				seen.add(id);
			}
		}
		expect(duplicates).toEqual([]);
	});
});
