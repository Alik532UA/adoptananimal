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
			'@typescript-eslint/ban-ts-comment': 'error',

			// DEBUGGING-v8 § 4. A console call is not a smaller version of logging —
			// it is a different destination. Anything written this way is absent from
			// the ring buffer, and therefore absent from the report a visitor copies
			// out, which is the only way a log ever reaches us from someone else's
			// device. The rule is what makes logService the single door rather than
			// the preferred one. Exceptions are listed below, each with a reason.
			'no-console': 'error'
		}
	},

	/**
	 * The three places console output is the point rather than a slip.
	 *
	 * logService owns the console: it is the module the rule above exists to funnel
	 * everything into, and it has to be able to print. The other two never run in a
	 * browser at all — they are command-line gates whose entire output is meant for
	 * a terminal and for the CI log.
	 */
	{
		files: ['src/lib/services/logService.svelte.ts', 'src/lib/i18n/validator.ts', 'scripts/**'],
		rules: { 'no-console': 'off' }
	},

	/**
	 * STORAGE-NAMESPACE-v8, Крок 3: прямий доступ до Web Storage заборонений.
	 *
	 * Origin спільний із сусідніми проєктами, тож ключ без префікса — це не
	 * дрібниця, а чужі дані. Доти заборона трималася лише на рядку в AGENTS.md,
	 * і три проєкти з восьми вже її порушували, чого не помітив ніхто.
	 *
	 * Правил два, і друге не зайве: `no-restricted-globals` НЕ ловить
	 * `window.localStorage`. Канон у Кроці 3 наводить лише його — а саме ця
	 * форма й трапилася в DigitalWorkshop, тричі поспіль.
	 */
	{
		rules: {
			'no-restricted-globals': [
				'error',
				{ name: 'localStorage', message: 'STORAGE-NAMESPACE-v8: лише через фасад storage.' },
				{ name: 'sessionStorage', message: 'STORAGE-NAMESPACE-v8: лише через фасад storage.' }
			],
			'no-restricted-properties': [
				'error',
				{
					object: 'window',
					property: 'localStorage',
					message: 'STORAGE-NAMESPACE-v8: лише через фасад storage.'
				},
				{
					object: 'window',
					property: 'sessionStorage',
					message: 'STORAGE-NAMESPACE-v8: лише через фасад storage.'
				}
			]
		}
	},
	{
		// Три категорії, і кожна законна за самим каноном:
		//   1. Фасад — тут прямий доступ Є реалізацією (Крок 3).
		//   2. Модуль міграції — читає ключі БЕЗ префікса, і це єдине легальне
		//      місце, де так можна (Крок 4). Лежить у services/ або utils/
		//      залежно від проєкту, тому шаблон без шляху.
		//   3. Тести фасаду й e2e — вони мусять читати й засівати сирі ключі,
		//      інакше нічим довести, що префікс справді додається.
		files: [
			'src/lib/services/storage.ts',
			'src/lib/services/storage/**',
			'src/lib/config/storage.ts',
			'**/storageMigration.ts',
			'**/storage.test.ts',
			'**/storage.spec.ts',
			'tests/**',
			'e2e/**'
		],
		rules: {
			'no-restricted-globals': 'off',
			'no-restricted-properties': 'off'
		}
	}
);
