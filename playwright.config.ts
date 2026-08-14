import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
	// Outside src/ on purpose: the vitest include glob would otherwise pick these up
	// and run Playwright specs as unit tests (PROJECT-STRUCTURE § anti-patterns).
	testDir: 'tests',
	fullyParallel: true,
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
