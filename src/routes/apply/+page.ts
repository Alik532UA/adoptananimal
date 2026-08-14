// Prerendered like every other page: with a static host an unprerendered route
// exists only as the 404.html shell, so a direct link or a reload lands on GitHub's
// 404 instead of the form. The ?animal= parameter is read after hydration.
export const prerender = true;
