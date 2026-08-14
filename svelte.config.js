import adapter from '@sveltejs/adapter-static';

// GitHub Pages project sites live under /<repo>/, user sites and custom domains under /.
// The value comes from the deploy workflow; locally and for root hosting it stays empty.
const base = process.env.BASE_PATH ?? '';

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
