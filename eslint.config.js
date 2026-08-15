import prettier from 'eslint-config-prettier';
import path from 'node:path';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	},
	{
		// Override or add rule settings here, such as:
		// 'svelte/button-has-type': 'error'
		rules: {
			// This project routes through withBase() instead of SvelteKit's typed
			// resolve(), which cannot express animal slugs from data files, query-only
			// navigation or image paths. Base handling is equivalent; the compile-time
			// route validation it replaces is covered by scripts/check-build.js, which
			// checks the links in the built output. See PROJECT-CONTEXT.md § 4.8.
			'svelte/no-navigation-without-resolve': 'off',

			// Errors, not warnings: a warning that nobody has to fix is not a gate.
			'@typescript-eslint/no-explicit-any': 'error',
			'svelte/require-each-key': 'error',

			// A leading underscore marks a parameter that exists only to reach the next
			// one — e.g. `failed(_error, reset)` in a boundary snippet.
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
			],

			// --- Baseline set, CODE-QUALITY-v8 § 6.4.1 ---
			// The seven rules below were absent from the resolved config entirely, so
			// `npm run lint` never checked them and its zero said nothing about this
			// class of defect. An absent rule looks exactly like a passing one.
			// Current violations: none. They stand as a gate for what comes next.

			// SVELTE-CORE-v8 anti-patterns: Svelte 4 and SvelteKit < 2.12 idioms.
			'no-restricted-imports': [
				'error',
				{
					paths: [
						{
							name: 'svelte/store',
							importNames: ['writable', 'readable', 'derived'],
							message:
								'Svelte 5: state belongs in $state/$derived inside a controller class (.svelte.ts). SVELTE-CORE-v8, anti-patterns.'
						},
						{
							name: '$app/stores',
							message:
								'Deprecated since SvelteKit 2.12: import { page } from "$app/state". SVELTE-CORE-v8 § 1.8.'
						}
					]
				}
			],

			// SECURITY-v8 § 13. The CSP forbids these constructs, so a slip would
			// surface only at runtime, in a visitor's browser.
			'no-eval': 'error',
			'no-implied-eval': 'error',
			'no-new-func': 'error',
			'no-script-url': 'error',

			// I18N-v8 § 4.3. Without an argument the method takes the SYSTEM locale
			// rather than the site language: on a Ukrainian machine the Ukrainian
			// pages look right and de/nl/en quietly do not.
			'no-restricted-syntax': [
				'error',
				{
					selector:
						'CallExpression[arguments.length=0][callee.property.name=/^toLocale(String|DateString|TimeString)$/]',
					message:
						'I18N-v8 § 4.3: pass the locale explicitly — without it the system locale wins over the site language.'
				}
			],

			// ACCESSIBILITY-v8 § 10.5: a11y warnings from the Svelte compiler.
			'svelte/valid-compile': 'error',

			// The three below already arrive from presets. Raised explicitly so a
			// preset change cannot drop them silently — that is how gates disappear.
			'svelte/no-at-html-tags': 'error',
			'svelte/prefer-svelte-reactivity': 'error',
			'@typescript-eslint/ban-ts-comment': 'error'
		}
	}
);
