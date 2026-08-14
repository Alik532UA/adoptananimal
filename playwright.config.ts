import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
	// Outside src/ on purpose: the vitest include glob would otherwise pick these up
	// and run Playwright specs as unit tests (PROJECT-STRUCTURE § anti-patterns).
	testDir: 'tests',
	fullyParallel: true,

	/*
	 * A memory budget, not a core count — which is why it is a number and not a share.
	 *
	 * The suite passed a hundred cases and the visual minimap holds a second copy of the
	 * whole page, images included. At one browser per core the run started killing its
	 * own workers ("Zone Allocation failed", then STATUS_STACK_BUFFER_OVERRUN), and
	 * before that it did something worse than crashing: axe sampled colours on a machine
	 * too busy to finish a fade and reported contrast failures for pairings that pass.
	 * Both are the machine, not the site, and a suite that fails for reasons the code
	 * cannot fix teaches everyone to rerun it until it is green.
	 */
	workers: process.env.CI ? 2 : 4,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',

	use: {
		baseURL: `http://localhost:${PORT}`,
		trace: 'on-first-retry'
	},

	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

	// The built site, not the dev server. Dev has different chunking, no prerendered
	// HTML and no base path, so a green dev run says nothing about what ships
	// (CODE-QUALITY § 5.7).
	webServer: {
		command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
		port: PORT,
		// Never reuse: `vite preview` maps the output directory once at startup, so a
		// server left over from an earlier build keeps serving that build and 404s the
		// new hashed assets. The page then renders unstyled and axe reports a clean
		// run against black-on-white — a green suite proving nothing.
		reuseExistingServer: false,
		timeout: 180_000
	}
});
