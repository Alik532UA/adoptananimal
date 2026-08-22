import adapter from '@sveltejs/adapter-static';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// GitHub Pages project sites live under /<repo>/, user sites and custom domains under /.
// The value comes from the deploy workflow; locally and for root hosting it stays empty.
const base = process.env.BASE_PATH ?? '';

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
 */
const inlineScriptHashes = [
	...readFileSync('src/app.html', 'utf-8').matchAll(/<script>([\s\S]*?)<\/script>/g)
].map(
	(match) =>
		`sha256-${createHash('sha256').update(match[1].replace(/\r\n/g, '\n')).digest('base64')}`
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
			base
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
			entries: ['*', '/robots.txt', '/sitemap.xml'],

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
