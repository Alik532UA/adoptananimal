import { expect, test } from '@playwright/test';

/**
 * Layout and affordance checks for things that fail silently.
 *
 * None of these were caught by svelte-check, eslint or axe: a lost CSS selector left
 * the fields with the browser's default styling, and the browser default happens to
 * have adequate contrast. The page looked broken and every gate stayed green.
 */

const THEMES = ['dark', 'light-green', 'orange-purple', 'winter'] as const;

test.describe('the application form', () => {
	for (const theme of THEMES) {
		test(`fields read as fields in theme ${theme}`, async ({ page }) => {
			await page.goto('/apply/form');
			await page.evaluate((t) => localStorage.setItem('adoptananimal_theme', t), theme);
			await page.reload();

			const fields = await page.evaluate(() => {
				const els = [
					...document.querySelectorAll<HTMLElement>('.apply__form input, .apply__form textarea')
				];
				return els.map((el) => {
					const cs = getComputedStyle(el);
					return {
						testId: el.getAttribute('data-testid'),
						height: Math.round(el.getBoundingClientRect().height),
						transparent: cs.backgroundColor === 'rgba(0, 0, 0, 0)',
						paddingTop: parseFloat(cs.paddingTop),
						borderWidth: parseFloat(cs.borderTopWidth),
						radius: parseFloat(cs.borderTopLeftRadius),
						fontSize: parseFloat(cs.fontSize)
					};
				});
			});

			expect(fields.length).toBeGreaterThan(3);

			for (const field of fields) {
				// A field with no surface of its own reads as text floating on the page.
				expect(field.transparent, `${field.testId} has no background`).toBe(false);
				// The browser default is a 16px bar with no padding; ours is a real control.
				expect(field.height, `${field.testId} is too short`).toBeGreaterThanOrEqual(40);
				expect(field.paddingTop, `${field.testId} has no padding`).toBeGreaterThanOrEqual(8);
				expect(field.borderWidth, `${field.testId} has no edge`).toBeGreaterThan(0);
				expect(field.radius, `${field.testId} is not rounded like the rest`).toBeGreaterThan(0);
				// 13.33px is the UA default, and it is smaller than the labels above it.
				expect(
					field.fontSize,
					`${field.testId} uses the browser default size`
				).toBeGreaterThanOrEqual(15);
			}

			// Every field is styled the same way; one odd control out is the visible symptom.
			const shapes = new Set(fields.map((f) => `${f.paddingTop}/${f.borderWidth}/${f.radius}`));
			expect(shapes.size, 'fields are styled inconsistently').toBe(1);
		});
	}

	test('the card does not cover the text above it', async ({ page }) => {
		await page.goto('/apply/form');

		const gap = await page.evaluate(() => {
			const subtitle = document.querySelector('.apply-hero__subtitle')!.getBoundingClientRect();
			const card = document.querySelector('.apply__form-card')!.getBoundingClientRect();
			return Math.round(card.top - subtitle.bottom);
		});

		// The card is pulled up over the hero on purpose; it must eat padding, not words.
		expect(gap).toBeGreaterThan(0);
	});
});

test('the sticky header hides what scrolls under it', async ({ page }) => {
	await page.goto('/apply');
	await page.evaluate(() => window.scrollTo(0, 400));

	const header = await page.evaluate(() => {
		const cs = getComputedStyle(document.querySelector('.header')!);
		const alpha = cs.backgroundColor
			.match(/[\d.]+\s*\)$/)?.[0]
			.replace(')', '')
			.trim();
		return {
			alpha: alpha ? parseFloat(alpha) : 1,
			blur: cs.backdropFilter
		};
	});

	// Either it blurs what is behind it or it is opaque enough to stand on its own.
	// At 50% with no blur, form fields read straight through the bar into the logo.
	expect(header.blur !== 'none' || header.alpha >= 0.95).toBe(true);
	expect(header.alpha).toBeGreaterThanOrEqual(0.85);
});

test.describe('the featured carousel', () => {
	const order = (page: import('@playwright/test').Page) =>
		page.evaluate(() =>
			[...document.querySelectorAll('.carousel-content:not([aria-hidden]) .animal-card')].map(
				(card) => ({
					slug: card.id.replace('card-', ''),
					type: card.querySelector('.animal-card__image--cat') ? 'cat' : 'dog',
					adopted: card.classList.contains('animal-card--adopted')
				})
			)
		);

	test('shows every animal, mixed, with no three of a kind in a row', async ({ page }) => {
		await page.goto('/');
		const cards = await order(page);

		// Everyone still looking for a home, plus a few who found one.
		expect(cards.length).toBeGreaterThan(30);
		expect(new Set(cards.map((c) => c.slug)).size).toBe(cards.length);

		// A shelter that shows nothing but successes reads as an archive.
		const adopted = cards.filter((c) => c.adopted).length;
		expect(adopted / cards.length).toBeLessThanOrEqual(0.1);

		let run = 1;
		let longest = 1;
		for (let i = 1; i < cards.length; i++) {
			run = cards[i].type === cards[i - 1].type ? run + 1 : 1;
			longest = Math.max(longest, run);
		}

		expect(longest, 'three of the same kind in a row').toBeLessThanOrEqual(2);
	});

	test('picks a different order on each visit', async ({ page }) => {
		// The order used to come from the build, so every visitor saw the same one and
		// the visible window of the carousel was always the same few cats.
		await page.goto('/');
		const first = await order(page);

		await page.reload();
		const second = await order(page);

		expect(second.map((c) => c.slug).join()).not.toBe(first.map((c) => c.slug).join());

		// Everyone still looking for a home is there both times. Which few adopted
		// animals come along is drawn fresh, so that part of the set is expected to move.
		const stillLooking = (cards: typeof first) =>
			cards
				.filter((c) => !c.adopted)
				.map((c) => c.slug)
				.sort();

		expect(stillLooking(second)).toEqual(stillLooking(first));
	});
});

test.describe('the about heading', () => {
	// It has been "fixed" more than once in both directions: made to wrap so it would
	// centre, then made nowrap again so it would be one line. It has to be both, and
	// the only way that holds is if the type shrinks to the card it sits in. This test
	// fails on either symptom, in every language and at every width that matters.
	const LANGUAGES = ['/', '/uk', '/de', '/nl'] as const;
	const WIDTHS = [1440, 1024, 768, 500, 400, 320];

	for (const path of LANGUAGES) {
		test(`stays on one line and centred at every width (${path})`, async ({ page }) => {
			for (const width of WIDTHS) {
				await page.setViewportSize({ width, height: 900 });
				await page.goto(path);

				const measured = await page.evaluate(() => {
					const card = document.querySelector('.about__card') as HTMLElement;
					const title = document.querySelector('.about .section__title') as HTMLElement;
					const range = document.createRange();
					range.selectNodeContents(title);
					const rects = [...range.getClientRects()];
					const c = card.getBoundingClientRect();

					return {
						text: title.textContent?.trim() ?? '',
						lines: rects.length,
						leftGap: rects[0].left - c.left,
						rightGap: c.right - rects[0].right,
						fontSize: parseFloat(getComputedStyle(title).fontSize),
						whiteSpace: getComputedStyle(title).whiteSpace
					};
				});

				const where = `${path} at ${width}px ("${measured.text}")`;

				expect(measured.lines, `${where} wrapped onto ${measured.lines} lines`).toBe(1);
				// Asserted directly, not only through the outcome: the type currently shrinks
				// enough that the text would fit anyway, so dropping the declaration would
				// pass unnoticed until a longer translation arrived.
				expect(measured.whiteSpace, `${where} lost white-space: nowrap`).toBe('nowrap');
				expect(measured.leftGap, `${where} overflows the card on the left`).toBeGreaterThanOrEqual(
					0
				);
				expect(
					measured.rightGap,
					`${where} overflows the card on the right`
				).toBeGreaterThanOrEqual(0);
				expect(
					Math.abs(measured.leftGap - measured.rightGap),
					`${where} is off centre by ${Math.round(Math.abs(measured.leftGap - measured.rightGap))}px`
				).toBeLessThanOrEqual(2);
				// Small is acceptable on a 320px screen; invisible is not.
				expect(
					measured.fontSize,
					`${where} shrank to ${measured.fontSize}px`
				).toBeGreaterThanOrEqual(12);
			}
		});
	}
});

test.describe('the list filters', () => {
	const shown = (page: import('@playwright/test').Page, list: string) =>
		page.evaluate(
			(id) =>
				[...document.querySelectorAll(`[data-testid="${id}"] .animal-card`)].map((card) =>
					card.id.replace('card-', '')
				),
			list
		);

	/** Clicks a filter and waits for the list to settle, rather than sampling once. */
	const apply = async (page: import('@playwright/test').Page, testId: string, list: string) => {
		await page.getByTestId(testId).click();
		await expect(page.getByTestId(testId)).toHaveAttribute('aria-pressed', 'true');
		return shown(page, list);
	};

	test('gender splits the dogs in two with nobody counted twice', async ({ page }) => {
		// `'female'.includes('male')` meant the male filter matched every animal on the
		// site — the list simply did not change when you pressed it.
		await page.goto('/adopt/dog');
		const all = await apply(page, 'filter-gender-all-btn', 'dogs-list');

		const males = await apply(page, 'filter-gender-male-btn', 'dogs-list');
		const females = await apply(page, 'filter-gender-female-btn', 'dogs-list');

		expect(males.length).toBeGreaterThan(0);
		expect(females.length).toBeGreaterThan(0);
		expect(males.length).toBeLessThan(all.length);
		expect([...males, ...females].sort()).toEqual([...all].sort());
	});

	test('the three size filters between them account for every dog', async ({ page }) => {
		// Three dogs are listed as "tiny", which matched none of small/medium/large, so
		// they were reachable only with the filter off.
		await page.goto('/adopt/dog');
		const all = await apply(page, 'filter-size-all-btn', 'dogs-list');

		const small = await apply(page, 'filter-size-small-btn', 'dogs-list');
		const medium = await apply(page, 'filter-size-medium-btn', 'dogs-list');
		const large = await apply(page, 'filter-size-large-btn', 'dogs-list');

		expect([...small, ...medium, ...large].sort()).toEqual([...all].sort());
	});

	test('status splits between available and adopted', async ({ page }) => {
		await page.goto('/adopt/cat');
		const all = await apply(page, 'filter-status-all-btn', 'cats-list');

		const available = await apply(page, 'filter-status-available-btn', 'cats-list');
		const adopted = await apply(page, 'filter-status-adopted-btn', 'cats-list');

		expect([...available, ...adopted].sort()).toEqual([...all].sort());
	});

	test('a filter arrives applied when the page is opened by its URL', async ({ page }) => {
		await page.goto('/adopt/dog?gender=male');

		await expect(page.getByTestId('filter-gender-male-btn')).toHaveAttribute(
			'aria-pressed',
			'true'
		);

		const males = await shown(page, 'dogs-list');
		await page.goto('/adopt/dog');
		const all = await shown(page, 'dogs-list');

		expect(males.length).toBeGreaterThan(0);
		expect(males.length).toBeLessThan(all.length);
	});
});

test.describe('the application page', () => {
	test('embeds the Google form and offers a way out of the frame', async ({ page }) => {
		await page.goto('/apply');

		const frame = page.getByTestId('apply-google-form-container');
		await expect(frame).toBeVisible();
		await expect(frame).toHaveAttribute('src', /docs\.google\.com\/forms\/.*embedded=true/);
		// A frame with no accessible name is an unlabelled document to a screen reader.
		await expect(frame).toHaveAttribute('title', /.+/);

		// Extensions and corporate proxies block third-party frames; a form nobody can
		// reach is the same as no form.
		const fallback = page.getByTestId('apply-google-form-link');
		await expect(fallback).toHaveAttribute('href', /docs\.google\.com/);

		// It has to look like a button. The visitor who needs it is the one staring at an
		// empty box, and a line of underlined text does not read as the way out.
		await expect(fallback).toHaveClass(/\bbtn\b/);
		const box = await fallback.boundingBox();
		expect(box, 'fallback link has no box').not.toBeNull();
		expect(box!.height, 'below the 44px minimum target size').toBeGreaterThanOrEqual(44);
	});

	for (const [width, minHeight] of [
		[1200, 1750],
		[900, 1750],
		[400, 2150]
	] as const) {
		test(`gives the form room rather than a scrollbar at ${width}px`, async ({ page }) => {
			// Measured against the live form: it needs 1703px at 750px wide and 2138px at
			// 320px. A frame shorter than that scrolls inside a page that already scrolls,
			// which is what this guards against.
			await page.setViewportSize({ width, height: 900 });
			await page.goto('/apply');

			const height = await page
				.getByTestId('apply-google-form-container')
				.evaluate((el) => el.getBoundingClientRect().height);

			expect(Math.round(height)).toBeGreaterThanOrEqual(minHeight);
		});
	}

	test('names the animal carried over from its page', async ({ page }) => {
		await page.goto('/apply?animal=Basti');
		await expect(page.getByTestId('apply-chosen-animal-text')).toContainText('Basti');

		await page.goto('/apply');
		await expect(page.getByTestId('apply-chosen-animal-text')).toHaveCount(0);
	});

	test('keeps the previous on-site form reachable and out of the index', async ({ page }) => {
		await page.goto('/apply/form');

		await expect(page.getByTestId('adoption-form')).toBeVisible();
		await expect(page.getByTestId('apply-backup-notice-text')).toBeVisible();

		// Unlinked and duplicating /apply in purpose, so it must not be indexed.
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
	});
});

test.describe('the header meets the page', () => {
	/** The colour of the section a page opens with — what the tab has to land in. */
	const bandColour = (page: import('@playwright/test').Page) =>
		page.evaluate(() => getComputedStyle(document.querySelector('.main > *')!).backgroundColor);

	const waveColour = (page: import('@playwright/test').Page) =>
		page.evaluate(() => getComputedStyle(document.querySelector('.header__wave path')!).fill);

	// Every page, not only the ones that happen to open with a hero. This is the whole
	// point of painting the band in the layout: the header draws its tab everywhere.
	for (const path of ['/', '/favorites', '/adopt/cat', '/adopt/dog', '/apply']) {
		test(`the active tab lands in a band of its own colour on ${path}`, async ({ page }) => {
			await page.goto(path);
			await page.waitForLoadState('networkidle');

			const [band, wave] = await Promise.all([bandColour(page), waveColour(page)]);
			expect(band, 'the opening section has no colour of its own').toMatch(/^rgba?\(/);
			expect(band, 'the opening section is transparent').not.toBe('rgba(0, 0, 0, 0)');
			expect(wave, `the tab is drawn in ${wave} over a band of ${band}`).toBe(band);
		});
	}

	test('the colour runs to the end of the section, not to a fixed depth', async ({ page }) => {
		await page.goto('/');

		// It was a 120px band, which ended in the middle of the carousel and read as a
		// rendering fault. Whatever height the opening section is, the colour goes with it.
		const { section, painted } = await page.evaluate(() => {
			const first = document.querySelector('.main > *')!;
			const style = getComputedStyle(first);
			return {
				section: Math.round(first.getBoundingClientRect().height),
				painted: style.backgroundImage === 'none' ? 'full' : style.backgroundImage
			};
		});

		expect(section).toBeGreaterThan(300);
		expect(painted, 'the colour stops short of the section').toBe('full');
	});

	test('the shadow stays away until there is something to cast it on', async ({ page }) => {
		await page.goto('/');
		const opacity = () =>
			page.evaluate(() =>
				parseFloat(getComputedStyle(document.querySelector('.header')!, '::after').opacity)
			);

		// At the top the tab and the band are one shape in one colour, and a shadow
		// across that join is a line drawn through the middle of it.
		expect(await opacity()).toBe(0);

		await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'instant' }));
		await page.waitForFunction(
			() => parseFloat(getComputedStyle(document.querySelector('.header')!, '::after').opacity) > 0
		);
		expect(await opacity()).toBe(1);
	});
});

test.describe('the carousel', () => {
	test('is not shown until it holds the shuffled order', async ({ page }) => {
		await page.goto('/');

		const carousel = page.locator('.featured__carousel');
		await expect(carousel).toHaveClass(/featured__carousel--shuffled/);
		await expect(carousel).toBeVisible();
	});

	test('shows the build order rather than nothing when scripting is off', async ({ browser }) => {
		// The hiding rule is gated on data-js, which the inline script sets. Without a
		// script there is nothing to shuffle with, and hiding the cards for a shuffle
		// that is never coming would leave an empty page.
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();
		await page.goto('/');

		expect(await page.locator('html').getAttribute('data-js')).toBeNull();
		await expect(page.locator('.featured__carousel')).toBeVisible();
		await expect(page.getByTestId('featured-carousel-container')).toBeVisible();

		await context.close();
	});
});

test.describe('the page scrollbar', () => {
	test('is the native one, themed, with its width always reserved', async ({ page }) => {
		await page.goto('/');

		const style = await page.evaluate(() => {
			const cs = getComputedStyle(document.documentElement);
			return { colour: cs.scrollbarColor, gutter: cs.scrollbarGutter, width: cs.scrollbarWidth };
		});

		// SCROLLBAR-v8 § 1: repainted, not replaced. PROJECT-CONTEXT.md § 4.13.
		expect(style.colour, 'the scrollbar is not themed').not.toBe('auto');
		// Without a reserved gutter a short page and a long one sit at different widths,
		// and moving between tabs shifts the whole page sideways.
		expect(style.gutter).toBe('stable');
		expect(style.width, 'a hidden bar means a custom one has to exist').not.toBe('none');
	});
});

test.describe('the application hero', () => {
	for (const [path, lang] of [
		['/apply', 'en'],
		['/uk/apply', 'uk'],
		['/de/apply', 'de'],
		['/nl/apply', 'nl']
	] as const) {
		test(`keeps its subtitle on one line in ${lang}`, async ({ page }) => {
			await page.setViewportSize({ width: 1280, height: 800 });
			await page.goto(path);

			const lines = await page
				.locator('.apply-hero__subtitle')
				.evaluate(
					(el) => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)
				);

			expect(Math.round(lines), 'the sentence broke on a screen with room for it').toBe(1);
		});
	}
});

test('the favourites page offers cats and dogs as equal choices', async ({ page }) => {
	await page.goto('/favorites');

	// Same offer, so the same weight. A solid button beside a hollow one reads as a
	// recommendation, and nobody decided to recommend dogs over cats.
	const look = (testId: string) =>
		page.getByTestId(testId).evaluate((el) => {
			const cs = getComputedStyle(el);
			return [cs.backgroundColor, cs.color, cs.borderStyle, cs.fontSize].join(' | ');
		});

	expect(await look('explore-dogs-link')).toBe(await look('explore-cats-link'));
});
