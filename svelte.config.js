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
 */
const inlineScriptHashes = [
	...readFileSync('src/app.html', 'utf-8').matchAll(/<script>([\s\S]*?)<\/script>/g)
].map((match) => `sha256-${createHash('sha256').update(match[1]).digest('base64')}`);

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
				'script-src': ['self', ...inlineScriptHashes],
				'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
				'font-src': ['self', 'https://fonts.gstatic.com'],
				'img-src': ['self', 'data:', 'https://www.transparenttextures.com'],
				'connect-src': ['self'],
				'frame-ancestors': ['none'],
				'base-uri': ['self'],
				'form-action': ['none']
			}
		},

		prerender: {
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
