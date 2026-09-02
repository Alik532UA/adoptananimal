// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

/**
 * Every checked-in text file is LF in the index (AI-AGENT-PITFALLS-v8 § 1.5,
 * `PIT-EOL-GATE`, new in canon 8.12).
 *
 * `.gitattributes` already carries the fix, and has since the class cost this project
 * a working feature: the SHA-256 of the inline theme script was computed over CRLF
 * while the browser hashed LF, so the policy blocked the script, and the first frame
 * arrived with no palette and square corners — on the developer's machine only, since
 * CI checks out LF. What was missing is the part that notices the fix coming undone.
 *
 * The defect this guards is not a red test. Gates in this repository read their own
 * sources as text — `security`, `csp-hash`, `css-variables`, `structure`,
 * `svelte-core`, `style-overrides`, `component-styles`, `test-runners`, `ci` and the
 * rest — and a regex anchored with `$` and no `m` flag simply stops matching once a
 * `\r` sits before the newline. The gate then reports "nothing found" and looks
 * green: exactly the empty check § 1 is written against. Measured in a sibling
 * project, thirty-nine of eighty-eight gates were of that shape.
 *
 * Asking git, not the filesystem. `existsSync('.gitattributes')` proves a file is
 * present, not that it is in force: an entry can be overridden, a path can be
 * excluded, and `core.autocrlf` differs per machine. `git ls-files --eol` answers the
 * only question that matters — what the index holds and what the working tree holds —
 * and the pair has to agree, because the difference between them IS the two verdicts.
 *
 * Reverse experiment (§ 1.1) in the commit that added this file.
 */

/** `i/<index> w/<worktree> attr/<attributes>\t<path>` per tracked file. */
const eolReport = () =>
	execFileSync('git', ['ls-files', '--eol'], { encoding: 'utf8' })
		.split('\n')
		.filter(Boolean)
		.map((line) => {
			const [flags, path] = line.split('\t');
			const [index, worktree] = flags.trim().split(/\s+/);
			return { index, worktree, path: path?.trim() ?? '' };
		});

describe('закінчення рядків', () => {
	const files = eolReport();

	it('перевірка жива: git відповів переліком відстежуваних файлів', () => {
		expect(files.length, 'git ls-files --eol не повернув нічого').toBeGreaterThan(100);
		expect(
			files.some((f) => f.path.endsWith('.ts')),
			'у переліку немає жодного .ts — читається не той репозиторій'
		).toBe(true);
	});

	it('`.gitattributes` наказує LF і перелічує двійкові типи явно', () => {
		const attributes = readFileSync('.gitattributes', 'utf8');
		expect(attributes, 'без цього рядка форму робочого дерева вирішує core.autocrlf').toContain(
			'* text=auto eol=lf'
		);

		// Явно, щоб евристика не мала шансу нормалізувати вміст. Перелік — за тим, що
		// справді лежить у репозиторії, а не скопійований наперед.
		const binaryOnDisk = [
			...new Set(
				files
					.filter((f) => f.index === 'i/-text')
					.map((f) => f.path.slice(f.path.lastIndexOf('.')).toLowerCase())
			)
		];
		const unlisted = binaryOnDisk.filter((ext) => !attributes.includes(`*${ext} binary`));
		expect(unlisted, `двійкові типи без явного рядка в .gitattributes: ${unlisted}`).toEqual([]);
	});

	it('жоден текстовий файл не лежить в індексі з CRLF', () => {
		// `i/-text` — двійковий, закінчень рядків не має. `i/none` — файл без жодного
		// переходу на новий рядок, тобто питання до нього не стоїть.
		const wrong = files
			.filter((f) => f.index !== 'i/lf' && f.index !== 'i/-text' && f.index !== 'i/none')
			.map((f) => `${f.path} (${f.index})`);
		expect(
			wrong,
			`в індексі не LF — гейти в CI читатимуть інший текст:\n${wrong.join('\n')}`
		).toEqual([]);
	});

	it('робоче дерево читає те саме, що й CI', () => {
		const drifted = files
			.filter((f) => f.worktree === 'w/crlf' || f.worktree === 'w/mixed')
			.map((f) => `${f.path} (${f.worktree})`);
		expect(
			drifted,
			'локальний прогін і CI читають різний текст — перевір core.autocrlf і перевичитай ' +
				`дерево (git rm --cached -r . && git reset --hard):\n${drifted.join('\n')}`
		).toEqual([]);
	});
});
