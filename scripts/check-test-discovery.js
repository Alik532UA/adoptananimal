#!/usr/bin/env node
/**
 * Every check file on disk is actually collected by its runner
 * (AI-AGENT-PITFALLS-v8 § 1.2).
 *
 * The failure this exists for was reproduced in this repository on 2026-08-28,
 * not imagined. Narrowing the vitest `include` glob by one directory — from
 * `src/**` to `src/lib/**` — drops seventeen files from the run: `ci`,
 * `security`, `structure`, `svelte-core`, `csp-hash`, `eslint-baseline` and the
 * rest of the root-level invariants. The run then reports
 *
 *     Test Files  25 passed (25)
 *     Tests       255 passed (255)
 *
 * and exits 0. Not "0 tests", not a warning — a green summary over what was
 * left, with 115 checks and every CRITICAL gate among them simply absent. The
 * output says nothing about them, because from the runner's point of view they
 * do not exist.
 *
 * Why this is a script and not a unit invariant. The obvious place for this
 * check is beside the other runner invariants in `src/test-runners.test.ts`,
 * and that is exactly where it must not live: a check that vanishes together
 * with the files it guards protects nothing. It was written there first and
 * failed its own reverse experiment — narrowing the glob removed the check
 * along with the seventeen. Only a separate process, started by its own npm
 * script, survives the edit it is watching.
 *
 * The runner is asked rather than imitated. Re-implementing glob matching over
 * the config text would miss `exclude`, workspace files, and every other way a
 * file can be dropped; `vitest list` and `playwright test --list` answer with
 * what will really run.
 *
 * Usage: node scripts/check-test-discovery.js
 */

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** A check file, by the two suffixes both runners in this project use. */
const IS_CHECK_FILE = /\.(spec|test)\.(ts|js)$/;

function walk(dir, out = []) {
	if (!existsSync(dir)) return out;
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) walk(full, out);
		else if (IS_CHECK_FILE.test(entry)) out.push(full.replace(/\\/g, '/'));
	}
	return out;
}

function run(command) {
	// stderr stays attached: when a runner fails to start, its own message is far
	// more useful than "collected nothing", and swallowing it would turn a broken
	// config into a report about missing files.
	return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
}

const RUNNERS = [
	{
		name: 'vitest',
		dir: 'src',
		collect() {
			// `--filesOnly` prints one project-relative path per line.
			return run('npx vitest list --filesOnly')
				.split('\n')
				.map((line) => line.trim().replace(/\\/g, '/'))
				.filter((line) => IS_CHECK_FILE.test(line));
		}
	},
	{
		name: 'playwright',
		dir: 'tests',
		collect() {
			const output = run('npx playwright test --list --reporter=json');
			// Playwright may print notices before the report; the document starts at
			// the first brace.
			const report = JSON.parse(output.slice(output.indexOf('{')));
			// `file` is relative to `testDir`, which is the directory walked above.
			return report.suites.map((suite) => `tests/${suite.file}`.replace(/\\/g, '/'));
		}
	}
];

let failed = false;

for (const runner of RUNNERS) {
	const onDisk = walk(runner.dir);

	// Canary. An empty walk would make every comparison below trivially pass, and
	// the script would report success while measuring nothing at all.
	if (onDisk.length === 0) {
		console.error(
			`${runner.name}: no check files under ${runner.dir}/ — this script looks in the wrong place`
		);
		failed = true;
		continue;
	}

	// One runner failing to answer must not take the other runner's report away —
	// the same rule the workflow follows with `if: !cancelled()` between its gates
	// (CI-CD-AND-TOOLS-v8 § 1.8). Without this, a broken vitest config would end
	// the script before Playwright is asked anything, and the output would look
	// like a single problem instead of one problem and one unknown.
	let collected;
	try {
		collected = new Set(runner.collect());
	} catch (error) {
		console.error(`${runner.name}: could not be asked what it collects — ${error.message}`);
		failed = true;
		continue;
	}

	if (collected.size === 0) {
		console.error(
			`${runner.name}: collected nothing while ${onDisk.length} files sit under ${runner.dir}/`
		);
		failed = true;
		continue;
	}

	const dropped = onDisk.filter((file) => !collected.has(file));
	if (dropped.length > 0) {
		console.error(
			`${runner.name} does not collect ${dropped.length} of ${onDisk.length} check files under ${runner.dir}/.\n` +
				'A failure inside them would be reported nowhere:\n' +
				dropped.map((file) => `  ${file}`).join('\n')
		);
		failed = true;
		continue;
	}

	console.log(
		`${runner.name}: all ${onDisk.length} check files under ${runner.dir}/ are collected`
	);
}

if (failed) process.exit(1);
