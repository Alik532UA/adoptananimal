export const prerender = true;

// Explicit per SVELTEKIT-DATA § 2.4: on a static host the value decides whether
// /adopt/cat resolves to a file or to a directory index.
export const trailingSlash = 'never';
