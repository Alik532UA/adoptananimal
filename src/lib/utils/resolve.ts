import { base } from '$app/paths';

/**
 * Resolves a given path to include the base path of the application.
 * This ensures that links work correctly when the app is deployed in a subfolder (like on GitHub Pages).
 */
export const resolve = (path: string): string => {
	if (path.startsWith('http') || path.startsWith('mailto:')) return path;
	const cleanPath = path.startsWith('/') ? path : `/${path}`;
	return base + cleanPath;
};
