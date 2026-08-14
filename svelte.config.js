import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter({
			fallback: 'index.html'
		}),
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
