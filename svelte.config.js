import adapter from '@sveltejs/adapter-static';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// GitHub Pages project sites live under /<repo>/, user sites and custom domains under /.
// The value comes from the deploy workflow; locally and for root hosting it stays empty.
const rawBase = process.env.BASE_PATH ?? '';

/*
 * Checked here rather than left to SvelteKit, and narrowed for the type checker in
 * the same move.
 *
 * SvelteKit does validate this, but its message names the option, not the value it
 * got — which is a long way from the actual mistake. That already cost an afternoon:
 * `BASE_PATH=/adoptananimal` typed into Git Bash on Windows arrives as
 * `C:/Program Files/Git/adoptananimal`, because MSYS rewrites anything that looks
 * like an absolute path. The message said the option must start with `/`, and the
 * value did — after MSYS was done with it, it started with `C`.
 *
 * The type annotation is the second half. `process.env` gives `string`, and a widened
 * `string` here is what kept this file's two type errors invisible until
 * `src/csp-hash.test.ts` imported it and pulled it under `svelte-check` for the
 * first time.
 */
if (rawBase !== '' && !/^\/[^/](?:.*[^/])?$/.test(rawBase)) {
	throw new Error(
		`BASE_PATH must be empty or start-but-not-end with "/", got ${JSON.stringify(rawBase)}. ` +
			'On Git Bash for Windows, MSYS rewrites /foo into a filesystem path — use PowerShell or MSYS_NO_PATHCONV=1.'
	);
}

const base = /** @type {'' | `/${string}`} */ (rawBase);

/**
 * SHA-256 of every inline <script> in app.html, computed from the file rather than
 * pasted in. A hash written by hand is a hash that silently stops matching the first
 * time someone edits the script, and the only symptom is the anti-FOUC theme no
 * longer applying — on the visitor's machine, not the developer's.
 *
 * SvelteKit hashes the scripts it injects itself; this covers ours.
 *
 * Line endings are normalised first, and that is not tidiness. The HTML parser turns
 * every CRLF in the input stream into a single LF before the script's text exists, so
 * the browser hashes LF whatever the file holds. Checked out on Windows with
 * core.autocrlf=true this file has CRLF, the hash came out over CRLF, and the two
 * never met: the script was blocked on every page, the first frame lost data-theme
 * and data-style, and the page rendered with no palette and every corner square until
 * hydration caught up. It works in CI, which checks out LF — which is the worst way
 * for it to be broken.
 *
 * The pattern matches any <script> WITHOUT src, not only the attribute-less form it
 * used to. The narrow form was a trap with no symptom in the source: add `defer` or
 * `type="module"` to the script below and it stops matching, no hash is computed, and
 * the policy blocks it — leaving exactly the blank-palette first frame described
 * above, for a change that looks unrelated to CSP. `src/csp-hash.test.ts` scans with
 * this same wider definition and fails on any inline script whose browser hash is
 * missing from the policy, so the two cannot drift apart silently.
 */
const inlineScriptHashes = [
	...readFileSync('src/app.html', 'utf-8').matchAll(
		/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g
	)
].map(
	(match) =>
		/** @type {`sha256-${string}`} */ (
			`sha256-${createHash('sha256').update(match[1].replace(/\r\n/g, '\n')).digest('base64')}`
		)
);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter({
			// GitHub Pages serves 404.html for unknown paths, never index.html.
			fallback: '404.html'
		}),
		paths: {
			base,

			/*
			 * Absolute paths in the output, not relative ones. The default is `true`.
			 *
			 * A relative URL is only valid for the address the document was served at, and
			 * this is a single-page app: the header and the footer are never re-created,
			 * so whatever they were rendered with stays in the DOM while the address
			 * underneath them changes. Land on /adopt/cat, click through to
			 * /adopt/cat/cucumber, and the footer's `../images/logo/…` — correct one
			 * moment earlier — now resolves against /adopt/cat/ and asks for
			 * /adoptananimal/adopt/images/logo/…, which is a 404. Twenty-seven images in
			 * the header and footer, every time the depth changes.
			 *
			 * The links next to them survived only by accident: `localePath()` reads
			 * `settings.locale`, which is `$state` and is reassigned on every navigation,
			 * so Svelte re-evaluated those attributes with the client's own base.
			 * `withBase()` reads nothing reactive, so its attributes were written once at
			 * hydration and never again. Two helpers, one line apart, and only one of them
			 * happened to be reactive.
			 *
			 * Reloading fixed it, which is what made it look intermittent: the fresh
			 * document arrives with a prefix computed for the address it was requested at.
			 *
			 * The cost of `false` is that the built site can no longer be moved to another
			 * base without rebuilding. It never could: `BASE_PATH` is baked in at build
			 * time and `SITE_ORIGIN` + `SITE_BASE` are compiled into every canonical.
			 */
			relative: false
		},

		// hash, not nonce: a nonce has to be generated per response, and a prerendered
		// page has no response to generate it in.
		csp: {
			mode: 'hash',
			directives: {
				'default-src': ['self'],
				'script-src': ['self', 'https://www.googletagmanager.com', ...inlineScriptHashes],
				'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
				'font-src': ['self', 'https://fonts.gstatic.com'],
				'img-src': ['self', 'data:'],
				'connect-src': ['self', 'https://*.google-analytics.com', 'https://*.analytics.google.com'],
				// The embedded application form. Without this the iframe is blocked and the
				// page shows an empty box with nothing in the console to explain it.
				'frame-src': ['https://docs.google.com'],
				'frame-ancestors': ['none'],
				'base-uri': ['self'],
				'form-action': ['none']
			}
		},

		prerender: {
			entries: ['*', '/robots.txt', '/sitemap.xml', '/llms.txt'],

			/*
			 * `warn`, а не `ignore`.
			 *
			 * «Небачений маршрут» — це маршрут, до якого краулер prerender не
			 * дійшов за посиланнями й якого немає в `entries`. Тобто рівно той
			 * клас дефекту, про який SEO-v8 § 1.5: сторінка існує в коді, але у
			 * `build/` її немає, і виявляється це вже в індексі — порожнім
			 * результатом. `ignore` прибирає єдиний сигнал про це.
			 *
			 * Не `fail` лише тому, що службові й параметризовані маршрути тут
			 * навмисно не пререндеряться, і падіння збірки на них було б хибною
			 * тривогою. Попередження лишається в логу прогону, де його видно.
			 */
			handleUnseenRoutes: 'warn',
			handleHttpError: ({ path, message }) => {
				// Ignore 404s for missing animal images during build
				if (path.startsWith('/images/animals/') && message.includes('404')) {
					return;
				}

				// Otherwise, throw an error
				throw new Error(message);
			}
		}
	}
};

export default config;
