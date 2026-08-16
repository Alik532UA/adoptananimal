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
	//
	// The home page is on this list and stays on it. It was taken off once, to let the
	// theme's background photograph show through the carousel; the band is what is wanted
	// there, and the photograph is still the ground for the rest of the page.
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

	/**
	 * The photograph the theme is built around is still visible, band or no band.
	 *
	 * It is the ground for everything below the opening section, and losing it is the way
	 * this rule goes wrong: an earlier attempt at that worry took the band off the home
	 * page altogether, which removed the wrong one of the two.
	 */
	test('the page still stands on the theme’s photograph', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		const photograph = await page.evaluate(
			() => getComputedStyle(document.querySelector('.site-bg')!).backgroundImage
		);
		expect(photograph, 'nothing behind the page at all').toContain('.webp');
	});

	/*
	 * The photograph eases in over two seconds, the same as an animal's does.
	 *
	 * A CSS background has no load event, so this needs a real preload behind it, and
	 * the preload is where it went wrong the first time: in a build the custom property
	 * reads `url(./bg-….hash.webp)`, relative to the STYLESHEET, and resolving it
	 * against the document asked the site root for a file that is not there. The decode
	 * rejected, the reveal ran from the failure path instead of from the picture
	 * arriving, and it still looked correct — which is why this measures the ramp and
	 * the console rather than the final state.
	 */
	test('the theme’s photograph eases in rather than appearing at once', async ({ page }) => {
		const failed: string[] = [];
		page.on('response', (r) => {
			if (r.status() === 404 && /\.webp$/.test(r.url())) failed.push(r.url());
		});

		await page.goto('/');
		const layer = page.locator('.site-bg');

		await expect(layer).toHaveClass(/site-bg--loaded/, { timeout: 10_000 });
		expect(
			await layer.evaluate((el) => getComputedStyle(el).transitionDuration),
			'the fade is not two seconds long'
		).toBe('2s');

		// Caught mid-ramp: fully transparent or fully opaque would both pass a check on
		// the end state alone, and the defect was that it jumped straight to the end.
		const midway = await layer.evaluate(
			(el) =>
				new Promise<number>((resolve) =>
					setTimeout(() => resolve(Number(getComputedStyle(el).opacity)), 700)
				)
		);
		expect(midway, `not part-way through a fade — opacity was ${midway}`).toBeGreaterThan(0.05);
		expect(midway, `not part-way through a fade — opacity was ${midway}`).toBeLessThan(0.95);

		await expect
			.poll(async () => Number(await layer.evaluate((el) => getComputedStyle(el).opacity)), {
				timeout: 5000
			})
			.toBe(1);

		expect(failed, 'the preload asked for a file that is not there: ' + failed.join(', ')).toEqual(
			[]
		);
	});

	test('the photograph is there for a visitor without JavaScript', async ({ browser }) => {
		// The fade hides the layer behind [data-js], so a scripting failure must not be a
		// page with no background at all — the same guard AnimalCard.svelte needs.
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();
		await page.goto('/');

		const opacity = await page.evaluate(
			() => getComputedStyle(document.querySelector('.site-bg')!).opacity
		);
		expect(opacity, 'no script, no background — the layer never comes back').toBe('1');
		await context.close();
	});

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
	test('the native one is themed and reserves its width wherever it is what shows', async ({
		page
	}) => {
		await page.goto('/');
		/*
		 * Asked for by name, because it is no longer what a first visit gets.
		 *
		 * The default is the custom bar (PROJECT-CONTEXT.md § 4.13), which hides the
		 * native one — so reading these three properties off a default page now says
		 * nothing about the native bar at all. It still has to be right: it is what a
		 * visitor who picks it from the menu gets, and it is the only bar there is on a
		 * touch screen or in a window too narrow for anything else.
		 */
		await page.evaluate(() => localStorage.setItem('adoptananimal_scrollbarMode', 'standard'));
		await page.reload();

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

test.describe('the carousel under the pointer', () => {
	const position = (page: import('@playwright/test').Page) =>
		page.locator('.carousel-viewport').evaluate((el) => el.scrollLeft);

	/** Settles the drift so a reading is not taken mid-frame. */
	const rest = (page: import('@playwright/test').Page) => page.waitForTimeout(400);

	/**
	 * Scroll it by hand, let the interaction lapse, then take the pointer away.
	 *
	 * `wheel` is how the scroll is delivered — sideways for a trackpad swipe, shifted for
	 * a mouse. Both used to reach the element without this component hearing about it,
	 * which is the whole defect: it kept its own idea of where the track was, and the
	 * drift resumed from that idea rather than from the track.
	 */
	const scrollAndLeave = async (
		page: import('@playwright/test').Page,
		wheel: { deltaX: number; deltaY: number; shift?: boolean }
	) => {
		const carousel = page.getByTestId('featured-carousel-container');
		await expect(carousel).toBeVisible();

		const box = (await carousel.boundingBox())!;
		await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
		await rest(page);

		const before = await position(page);
		if (wheel.shift) await page.keyboard.down('Shift');
		await page.mouse.wheel(wheel.deltaX, wheel.deltaY);
		if (wheel.shift) await page.keyboard.up('Shift');
		await rest(page);
		const moved = await position(page);

		// Three seconds is the interaction timer. The jump only appeared once it had
		// expired, so waiting it out is part of reproducing it.
		await page.waitForTimeout(3300);
		await page.mouse.move(box.x + box.width / 2, box.y - 40);
		await rest(page);

		return { before, moved, after: await position(page) };
	};

	test('picks up where a sideways scroll left it, not where it was before', async ({ page }) => {
		await page.goto('/');
		const { before, moved, after } = await scrollAndLeave(page, { deltaX: 700, deltaY: 0 });

		expect(Math.abs(moved - before), 'the sideways wheel moved nothing').toBeGreaterThan(100);
		// Drifting on from where it was left is a small change; snapping back to `before`
		// is the bug, and it is hundreds of pixels.
		expect(Math.abs(after - moved), `jumped back toward ${before}`).toBeLessThan(120);
	});

	test('drifts the way the visitor last went', async ({ page }) => {
		await page.goto('/');
		const carousel = page.getByTestId('featured-carousel-container');
		await expect(carousel).toBeVisible();

		const box = (await carousel.boundingBox())!;
		const centre = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

		const driftAfter = async (deltaX: number) => {
			await page.mouse.move(centre.x, centre.y);
			await page.mouse.wheel(deltaX, 0);
			await page.waitForTimeout(3300); // let the interaction lapse
			await page.mouse.move(centre.x, box.y - 40); // and the drift take over
			const from = await position(page);
			await page.waitForTimeout(700);
			return (await position(page)) - from;
		};

		expect(await driftAfter(400), 'scrolled forwards, drifted backwards').toBeGreaterThan(0);
		expect(await driftAfter(-400), 'scrolled backwards, drifted forwards').toBeLessThan(0);
	});

	test('shift and the wheel scroll it sideways, and it stays scrolled', async ({ page }) => {
		await page.goto('/');
		const { before, moved, after } = await scrollAndLeave(page, {
			deltaX: 0,
			deltaY: 700,
			shift: true
		});

		expect(Math.abs(moved - before), 'shift+wheel did nothing').toBeGreaterThan(100);
		expect(Math.abs(after - moved), `jumped back toward ${before}`).toBeLessThan(120);

		// Worth being clear about what this does and does not prove. Real hardware sends
		// shift+wheel as deltaX, and that path — the one that was broken — is covered by
		// the sideways test above, which does fail without the fix. A synthesized wheel
		// arrives on the axis it was given, so here Chromium hands the component a plain
		// deltaY, which even the old code handled. This is a guard on the outcome, not
		// evidence that the deltaX branch works.
	});
});

test.describe('the page background', () => {
	test('travels at a third of the page speed and never runs out', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		const read = () =>
			page.evaluate(() => {
				const bg = document.querySelector('.site-bg') as HTMLElement;
				return {
					height: parseFloat(bg.style.getPropertyValue('--bg-height')),
					shift: parseFloat(bg.style.getPropertyValue('--bg-shift')),
					scrollY: window.scrollY,
					maxScroll: document.documentElement.scrollHeight - window.innerHeight,
					viewport: window.innerHeight
				};
			});

		await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
		await page.waitForFunction(
			() =>
				parseFloat(
					(document.querySelector('.site-bg') as HTMLElement).style.getPropertyValue('--bg-shift')
				) > 0
		);

		const state = await read();
		// A third of the page's own movement: still enough to read as depth, not so much
		// that the background becomes part of the content.
		expect(state.shift).toBeCloseTo(state.scrollY / 3, 0);
		// Tall enough that the last screenful still has image under it.
		expect(state.height).toBeGreaterThanOrEqual(state.viewport + state.maxScroll / 3 - 1);
	});

	test('holds still for anyone who asked for less motion', async ({ browser }) => {
		// Parallax is one of the effects that makes motion sickness worse. The image
		// stays; it just stops travelling.
		const context = await browser.newContext({ reducedMotion: 'reduce' });
		const page = await context.newPage();
		await page.goto('/');
		await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
		await page.waitForTimeout(300);

		const transform = await page.evaluate(
			() => getComputedStyle(document.querySelector('.site-bg')!).transform
		);
		// matrix(a, b, c, d, tx, ty) — the vertical translation is the last number.
		const ty = parseFloat(transform.split(',').pop() ?? '0');
		expect(Math.abs(ty), 'the background moved anyway').toBeLessThan(1);

		await context.close();
	});
});

test.describe('surfaces that should not hide the page', () => {
	// /favorites included after the fact: it has the same section and it kept its panel
	// for two versions, because this loop only knew about the two pages that were fixed
	// together. A list of the places a rule applies is a list that misses one.
	for (const path of ['/adopt/cat', '/adopt/dog', '/favorites']) {
		test(`the list on ${path} lets the page image through`, async ({ page }) => {
			await page.goto(path);
			const bg = await page
				.locator('.animal-list')
				.evaluate((el) => getComputedStyle(el).backgroundColor);
			// A flat panel the height of the list hid the whole background image.
			expect(bg, 'the list paints over the page').toBe('rgba(0, 0, 0, 0)');
		});
	}
});

test.describe('animals and their photographs', () => {
	/**
	 * Every card, paired with the file its <img> actually points at.
	 *
	 * `data-src` first: imageQueue.ts holds photos to three downloads at a time and takes
	 * `src` off the ones still waiting, parking the served value there. It is read in
	 * preference to `src` rather than as a fallback, because it is the URL the document
	 * arrived with — which is the one this test is about. The queue writes `src` from the
	 * component's own props, so a card that hydration had paired with the wrong photo
	 * would have that quietly corrected underneath it and the bug would go unseen.
	 */
	const cards = (page: import('@playwright/test').Page) =>
		page.$$eval('.animal-card', (els) =>
			els.map((el) => {
				const photo = el.querySelector('.animal-card__photo');
				const source = photo?.getAttribute('data-src') ?? photo?.getAttribute('src');
				return {
					slug: el.id.replace('card-', ''),
					file:
						source
							?.split('/')
							.pop()
							?.replace(/^(cat|dog)_/, '')
							.replace(/\.\w+$/, '') ?? null
				};
			})
		);

	/*
	 * A filter in the URL used to hand cards someone else's face.
	 *
	 * The build prerenders every animal; the page read the filter while hydrating, so
	 * the client's first render had fourteen cards where the server had written
	 * twenty-eight. Svelte adopted the first fourteen it found and patched the reactive
	 * text onto them — leaving twelve cards with the right name, link, badges and href
	 * over another animal's photograph. Nothing threw, nothing was logged, and every
	 * existing filter test passed, because they all read names and never looked at the
	 * pictures.
	 */
	for (const path of [
		'/adopt/cat?gender=male',
		'/adopt/cat?status=available',
		'/adopt/cat?search=richard',
		'/adopt/dog?gender=female',
		'/adopt/dog?status=adopted'
	]) {
		test(`every card on ${path} shows its own animal`, async ({ page }) => {
			await page.goto(path);
			await page.waitForLoadState('networkidle');

			const shown = await cards(page);
			expect(shown.length, 'the filter matched nothing to check').toBeGreaterThan(0);

			const wrong = shown.filter((c) => c.slug !== c.file);
			expect(wrong, `cards wearing another animal's photo: ${JSON.stringify(wrong)}`).toEqual([]);
		});
	}

	test('every declared photo shift actually lands', async ({ page }) => {
		await page.goto('/adopt/cat');
		await page.waitForLoadState('networkidle');

		/*
		 * Reads the computed value of every card that declares one, rather than naming the
		 * animals here — the list of who needs a shift belongs in the data and would go
		 * stale in a second copy. An object-position the browser cannot parse is dropped
		 * and falls back to the centre crop the field exists to override, so a typo shows
		 * up as "no effect" on exactly the card someone was trying to fix.
		 */
		const shifted = await page.$$eval('.animal-card__photo[style*="object-position"]', (imgs) =>
			imgs.map((el) => ({
				card: el.closest('.animal-card')?.id ?? '?',
				computed: getComputedStyle(el).objectPosition
			}))
		);

		expect(shifted.length, 'no card declares a shift').toBeGreaterThan(5);
		const ignored = shifted.filter((s) => s.computed === '50% 50%');
		expect(ignored, `declared but not applied: ${JSON.stringify(ignored)}`).toEqual([]);
	});

	test('an animal that needs its photo shifted gets it shifted', async ({ page }) => {
		await page.goto('/adopt/cat?search=richard');
		await page.waitForLoadState('networkidle');

		const photo = page.locator('#card-richard .animal-card__photo');
		await expect(photo).toBeVisible();

		// The computed value, not the attribute: an object-position the browser cannot
		// parse — `centre top`, a missing unit — is dropped and silently falls back to
		// the centre crop this exists to override.
		const position = await photo.evaluate((el) => getComputedStyle(el).objectPosition);
		expect(position, 'the declared object-position did not take').not.toBe('50% 50%');

		// And the same photo on the detail page, which crops it too.
		await page.goto('/adopt/cat/richard');
		const detail = await page
			.locator('.detail__photo')
			.evaluate((el) => getComputedStyle(el).objectPosition);
		expect(detail).toBe(position);
	});
});

test.describe('the page background tint', () => {
	test('lays a half-transparent colour of its own over the photograph', async ({ page }) => {
		const seen: Record<string, string> = {};

		for (const theme of THEMES) {
			await page.goto('/');
			await page.evaluate((t) => localStorage.setItem('adoptananimal_theme', t), theme);
			await page.reload();

			const layers = await page.evaluate(
				() => getComputedStyle(document.querySelector('.site-bg')!).backgroundImage
			);

			// Two layers in one element: the tint first, then the photograph.
			expect(layers, `${theme}: no tint over the image`).toMatch(/^linear-gradient\(/);
			expect(layers, `${theme}: the photograph is gone`).toContain('url(');

			const tint = layers.match(/rgba?\([^)]*\)/)?.[0] ?? '';
			const alpha = Number(tint.split(',').pop()?.replace(')', '').trim() ?? '1');
			expect(alpha, `${theme}: the tint is opaque or absent`).toBeGreaterThan(0.2);
			expect(alpha, `${theme}: the tint hides the image completely`).toBeLessThan(0.8);

			seen[theme] = tint;
		}

		// Each theme's own colour, not one grey for all of them.
		expect(new Set(Object.values(seen)).size, `themes share a tint: ${JSON.stringify(seen)}`).toBe(
			THEMES.length
		);
	});
});

test.describe('the filter bar', () => {
	test('separates its controls from its panel by the same step in every theme', async ({
		page
	}) => {
		const distances: Record<string, number> = {};

		for (const theme of THEMES) {
			await page.goto('/adopt/cat');
			await page.evaluate((t) => localStorage.setItem('adoptananimal_theme', t), theme);
			await page.reload();

			const { panel, control } = await page.evaluate(() => {
				const read = (sel: string) => {
					const cs = getComputedStyle(document.querySelector(sel)!).backgroundColor;
					// Chromium reports color-mix results as color(srgb …) rather than rgb().
					const nums = (cs.match(/[\d.]+/g) ?? []).map(Number);
					return cs.startsWith('color(') ? nums.slice(0, 3).map((n) => n * 255) : nums.slice(0, 3);
				};
				return { panel: read('.filter-bar'), control: read('.filter-input') };
			});

			const distance = panel.reduce((sum, v, i) => sum + Math.abs(v - control[i]), 0);
			distances[theme] = Math.round(distance);

			// Winter had white on white and light-green near-white on white: a search field
			// with no edge of its own reads as part of the panel.
			expect(distance, `${theme}: the control is invisible against its panel`).toBeGreaterThan(20);
			// And dark had a dark green field inside a grey panel, which read as a
			// different component that had wandered in.
			expect(
				distance,
				`${theme}: the control looks like it belongs to another design`
			).toBeLessThan(120);
		}

		// The same step everywhere, which is the point of deriving it from the panel.
		const values = Object.values(distances);
		expect(
			Math.max(...values) / Math.min(...values),
			`the step differs by theme: ${JSON.stringify(distances)}`
		).toBeLessThan(2.5);
	});
});

test.describe('the footer aside links', () => {
	const opacity = (page: import('@playwright/test').Page, testId: string) =>
		page.getByTestId(testId).evaluate((el) => parseFloat(getComputedStyle(el).opacity));

	test('brightens in three steps, from barely there to pointed at', async ({ page }) => {
		await page.goto('/');
		await page.getByTestId('footer-games-link').scrollIntoViewIfNeeded();

		// The pointer is on the page but nowhere near: they are a mark, not an advert.
		await page.mouse.move(10, 10);
		expect(await opacity(page, 'footer-games-link')).toBeCloseTo(0.1, 2);

		// Somewhere in the footer, away from the links themselves.
		const footer = (await page.locator('.footer__content').boundingBox())!;
		await page.mouse.move(footer.x + footer.width / 2, footer.y + footer.height / 2);
		await expect.poll(() => opacity(page, 'footer-games-link')).toBeCloseTo(0.5, 2);

		// On one of them: that one comes fully up, its neighbour part of the way, so the
		// pair reads as a pair.
		await page.getByTestId('footer-games-link').hover();
		await expect.poll(() => opacity(page, 'footer-games-link')).toBeCloseTo(1, 2);
		expect(await opacity(page, 'footer-order-site-link')).toBeCloseTo(0.8, 2);
	});

	test('names itself on hover, and to the right of the glyph', async ({ page }) => {
		await page.goto('/');
		const link = page.getByTestId('footer-games-link');
		await link.scrollIntoViewIfNeeded();

		const label = link.locator('.footer__aside-label');
		expect(await label.evaluate((el) => parseFloat(getComputedStyle(el).opacity))).toBe(0);

		await link.hover();
		await expect
			.poll(() => label.evaluate((el) => parseFloat(getComputedStyle(el).opacity)))
			.toBe(1);

		const { labelLeft, glyphRight, labelRight, windowWidth } = await link.evaluate((el) => {
			const label = el.querySelector('.footer__aside-label')!.getBoundingClientRect();
			return {
				labelLeft: label.left,
				labelRight: label.right,
				glyphRight: el.querySelector('svg')!.getBoundingClientRect().right,
				windowWidth: window.innerWidth
			};
		});

		// To the right of the glyph, where there is room: the buttons sit against the left
		// edge of the window, so a label on their left had nowhere to go.
		expect(labelLeft, 'the label covers the glyph it names').toBeGreaterThanOrEqual(glyphRight - 1);
		expect(labelRight, 'the label runs off the window').toBeLessThanOrEqual(windowWidth);
	});

	test('comes fully up for a keyboard, which never hovers', async ({ page }) => {
		await page.goto('/');
		await page.getByTestId('footer-games-link').focus();
		await expect.poll(() => opacity(page, 'footer-games-link')).toBeCloseTo(1, 2);
	});

	test('points at the right places, in a new tab', async ({ page }) => {
		await page.goto('/');
		for (const [testId, host] of [
			['footer-games-link', 'VetCrewGames'],
			['footer-order-site-link', 'DigitalWorkshop']
		] as const) {
			const link = page.getByTestId(testId);
			await expect(link).toHaveAttribute('href', new RegExp(host));
			await expect(link).toHaveAttribute('target', '_blank');
			// noopener, or the opened page gets a handle on this one through window.opener.
			await expect(link).toHaveAttribute('rel', /noopener/);
		}
	});
});

test.describe('close buttons', () => {
	test('turn a quarter under the pointer', async ({ page, context }) => {
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		await page.goto('/');
		await page.getByTestId('footer-org-notpfote-link').scrollIntoViewIfNeeded();
		await page.getByTestId('footer-org-notpfote-link').click();
		await page.getByTestId('footer-org-notpfote-mail-link').click();

		const close = page.getByTestId('toast-close-btn');
		await expect(close).toBeVisible();

		// A cross has four-fold symmetry, so after 90 degrees it looks exactly as it did.
		// The movement is the whole effect, and a component transition of its own would
		// hide it while the rule applied perfectly (UI-ELEMENTS-v8 section 1.4).
		const transition = await close.evaluate((el) => getComputedStyle(el).transitionProperty);
		expect(transition, 'nothing animates, so the turn is invisible').toContain('transform');

		await close.hover();
		// Polled to the settled value: the turn takes a quarter of a second, and read
		// immediately the matrix is still the identity it started from. rotate(90deg) is
		// matrix(0, 1, -1, 0, ...), so the first term goes to zero as it lands.
		await expect
			.poll(async () => {
				const matrix = await close.evaluate((el) => getComputedStyle(el).transform);
				return Math.abs((matrix.match(/-?[\d.]+/g) ?? []).map(Number)[0] ?? 1);
			})
			.toBeLessThan(0.3);
	});
});

test.describe('the email toast', () => {
	/** Opens one organisation's address and measures the toast it produces. */
	async function copyEmail(page: import('@playwright/test').Page, org: string) {
		await page.getByTestId(`footer-org-${org}-link`).scrollIntoViewIfNeeded();
		await page.getByTestId(`footer-org-${org}-link`).click();
		await page.getByTestId(`footer-org-${org}-mail-link`).click();
		await expect(page.getByTestId('toast-action-btn')).toBeVisible();

		return measureToast(page);
	}

	/** The shape of whatever toast is on screen. */
	function measureToast(page: import('@playwright/test').Page) {
		return page.locator('.toast-anchored').evaluate((el) => {
			const message = el.querySelector('.toast__message') as HTMLElement;
			const action = el.querySelector('[data-testid="toast-action-btn"]') as HTMLElement;
			const card = el.querySelector('.toast')!.getBoundingClientRect();
			const lineOf = (node: HTMLElement) => parseFloat(getComputedStyle(node).lineHeight) || 16;
			return {
				messageLines: Math.round(message.getBoundingClientRect().height / lineOf(message)),
				actionLines: Math.round(action.clientHeight / lineOf(action)),
				actionInside: action.getBoundingClientRect().right <= card.right + 1,
				insideWindow: card.right <= window.innerWidth + 1 && card.left >= -1
			};
		});
	}

	test('looks the same whichever address it carries', async ({ page, context }) => {
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		await page.goto('/');

		const short = await copyEmail(page, 'notpfote'); // info@notpfote.de
		await page.getByTestId('toast-close-btn').click();
		const long = await copyEmail(page, 'vetcrew'); // vet.crew.cooperation@gmail.com

		/*
		 * The complaint was that the same toast came out two lines for one address and
		 * three for the other. At a fixed 360px it was worse than that — five lines and
		 * six — because an address has nowhere to break, so the width the toast needs is
		 * a property of the address it is showing.
		 */
		expect(
			long.messageLines,
			`${short.messageLines} lines for one address and ${long.messageLines} for the other`
		).toBe(short.messageLines);
		expect(short.messageLines, 'the address is wrapping over several lines').toBeLessThanOrEqual(2);

		for (const [name, seen] of [
			['short', short],
			['long', long]
		] as const) {
			// One instruction, one line, whole.
			expect(seen.actionLines, `${name}: the action label wrapped`).toBe(1);
			expect(seen.actionInside, `${name}: the action is cut off by the toast`).toBe(true);
			expect(seen.insideWindow, `${name}: the toast hangs off the edge of the window`).toBe(true);
		}
	});

	test('keeps the whole action readable on a narrow window', async ({ page, context }) => {
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		await page.setViewportSize({ width: 380, height: 800 });

		// An address in the body of a page rather than the footer's fly-out, which needs a
		// hover the mobile layout has no room for. Same handler, same toast.
		await page.goto('/apply/form');
		await page.getByTestId('apply-contact-email-link').click();
		await expect(page.getByTestId('toast-action-btn')).toBeVisible();

		const seen = await measureToast(page);
		expect(seen.actionLines, 'the action label wrapped').toBe(1);
		expect(seen.actionInside, 'the action is cut off by the toast').toBe(true);
		expect(seen.insideWindow, 'the toast hangs off the edge of the window').toBe(true);
	});
});

test.describe('the header navigation', () => {
	test('every destination carries its own glyph', async ({ page }) => {
		await page.setViewportSize({ width: 1400, height: 900 });
		await page.goto('/');

		const items = await page.$$eval('.header__nav .header__link', (links) =>
			links.map((el) => ({
				testId: el.getAttribute('data-testid'),
				text: el.textContent?.trim() ?? '',
				// lucide puts three classes on every icon — `lucide-icon`, `lucide`, and one
				// named after the icon itself. Only the third says which glyph this is; the
				// first matches `lucide-` too, and taking it made all five look identical.
				icon:
					[...(el.querySelector('svg')?.classList ?? [])].find(
						(c) => c.startsWith('lucide-') && c !== 'lucide-icon'
					) ?? null
			}))
		);

		// The logo plus cats, dogs, favourites and the application.
		expect(items.length, 'the nav is not what it was').toBe(5);

		for (const item of items) {
			// One had a paw and the other four had nothing, so the row read as a single
			// button followed by four labels.
			expect(item.icon, `${item.testId} ("${item.text}") has no icon`).not.toBeNull();
			// And the label stays: a glyph alone is a guess about what it means.
			expect(item.text.length, `${item.testId} lost its label`).toBeGreaterThan(1);
		}

		// Distinct, or two destinations look like the same one.
		const icons = items.map((i) => i.icon);
		expect(new Set(icons).size, `repeated icons: ${icons.join(', ')}`).toBe(icons.length);

		// The two that name a species say which species.
		expect(items.find((i) => i.testId === 'nav-adopt-cat-link')?.icon).toBe('lucide-cat');
		expect(items.find((i) => i.testId === 'nav-adopt-dog-link')?.icon).toBe('lucide-dog');
		expect(items.find((i) => i.testId === 'nav-favorites-link')?.icon).toBe('lucide-heart');
	});

	test('the active tab still measures itself around the wider item', async ({ page }) => {
		await page.setViewportSize({ width: 1400, height: 900 });
		await page.goto('/adopt/cat');
		await page.waitForLoadState('networkidle');

		// The wave is drawn to the width of the active item, which the icon just changed.
		// Measured from the DOM rather than assumed, so this follows on its own — but a
		// tab narrower than its own label is the visible symptom if it ever stops.
		const { tab, label } = await page.evaluate(() => ({
			tab: document.querySelector('.header__wave')!.getBoundingClientRect().width,
			label: document.querySelector('.header__link--active')!.getBoundingClientRect().width
		}));

		expect(tab, 'the tab is narrower than the item it sits behind').toBeGreaterThanOrEqual(label);
	});
});

test.describe('buttons standing on a panel', () => {
	/*
	 * Two places, one problem: a half-transparent button takes on whatever surface it is
	 * dropped onto. On the home page's coloured opening section it went 2.54:1; on the
	 * empty-favourites card it simply became the card, and only the label was left.
	 */
	const PLACES = [
		{ path: '/', panel: '.main > *', button: 'featured-see-all-cats-link' },
		{ path: '/favorites', panel: '.no-favorites', button: 'explore-cats-link' }
	] as const;

	for (const theme of THEMES) {
		for (const place of PLACES) {
			test(`stand out on ${place.path} in theme ${theme}`, async ({ page }) => {
				await page.goto(place.path);
				await page.evaluate((t) => localStorage.setItem('adoptananimal_theme', t), theme);
				await page.reload();

				const seen = await page.getByTestId(place.button).evaluate((el, panelSel) => {
					const cs = getComputedStyle(el);
					const panel = el.closest(panelSel) ?? document.querySelector(panelSel)!;
					return { button: cs.backgroundColor, panel: getComputedStyle(panel).backgroundColor };
				}, place.panel);

				// Solid, not glass.
				expect(seen.button, `${theme}: the button is translucent`).toMatch(/^rgb\(/);

				// And a different colour from what it stands on, or it is not a button at all.
				const rgb = (s: string) => (s.match(/\d+/g) ?? []).map(Number);
				const [br, bg, bb] = rgb(seen.button);
				const [pr, pg, pb] = rgb(seen.panel);
				const apart = Math.abs(br - pr) + Math.abs(bg - pg) + Math.abs(bb - pb);
				expect(apart, `${theme}: the button barely differs from its panel`).toBeGreaterThan(90);
			});
		}
	}
});

test.describe('the animal detail page', () => {
	test('gives the story a surface to sit on', async ({ page }) => {
		await page.goto('/adopt/cat/basti');

		const story = await page.locator('.detail__story').evaluate((el) => {
			const cs = getComputedStyle(el);
			return { background: cs.backgroundColor, padding: parseFloat(cs.paddingTop) };
		});

		// The longest stretch of reading on the site, and it sat straight on the page's
		// photograph: contrast that passed and every line with something different behind it.
		expect(story.background, 'the story has no surface of its own').not.toBe('rgba(0, 0, 0, 0)');
		expect(story.padding, 'the text runs to the edge of its surface').toBeGreaterThanOrEqual(16);
	});
});

test.describe('an adopted card under the pointer', () => {
	test('lifts its badge clear of the label that arrives', async ({ page }) => {
		await page.setViewportSize({ width: 1400, height: 900 });
		await page.goto('/adopt/cat');
		await page.waitForLoadState('networkidle');

		const card = page.locator('.animal-card--adopted').first();
		await card.scrollIntoViewIfNeeded();

		const geometry = () =>
			card.evaluate((el) => {
				const box = (sel: string) => {
					const r = el.querySelector(sel)!.getBoundingClientRect();
					return { top: r.top, bottom: r.bottom };
				};
				return { badge: box('.animal-card__adopted-badge'), view: box('.animal-card__view') };
			});

		const rest = await geometry();
		await card.hover();

		// Both move on a spring, so the reading is polled to where they settle rather than
		// taken while they are still travelling.
		await expect
			.poll(async () => Math.round((await geometry()).badge.top))
			.toBeLessThan(Math.round(rest.badge.top) - 10);

		const hovered = await geometry();

		// The label rises from the bottom of the card and used to land on the corner of
		// ADOPTED. The badge steps up out of its way rather than the label stopping short,
		// which would move it on every other card too.
		expect(
			Math.round(hovered.view.top),
			`"View profile" overlaps the badge by ${Math.round(hovered.badge.bottom - hovered.view.top)}px`
		).toBeGreaterThanOrEqual(Math.round(hovered.badge.bottom));

		// And it is a reaction to the pointer, not a second layout: it goes back.
		await page.mouse.move(0, 0);
		await expect
			.poll(async () => Math.round((await geometry()).badge.top))
			.toBe(Math.round(rest.badge.top));
	});
});

test.describe('the shape of a control', () => {
	/*
	 * Every round-ish control is the same superellipse, and it is one declaration.
	 *
	 * The check is that they all carry `.control-shape`, not that each has some radius:
	 * a per-component copy would satisfy a radius assertion and still drift the day one
	 * of the four is edited. The point of the class is that there is nowhere to drift to.
	 */
	test('the pickers, the side links and the bar favourite share one shape', async ({ page }) => {
		await page.setViewportSize({ width: 480, height: 900 });
		await page.goto('/adopt/cat');
		await page.locator('button[data-testid$="-favorite-btn"]').first().click();
		await page.locator('.header__burger').click();

		const shapes = await page.evaluate(() => {
			const token = getComputedStyle(document.documentElement)
				.getPropertyValue('--radius-control')
				.trim();
			const wanted = [
				'.dropdown__trigger',
				'.header__nav-project',
				'.header__bar-fav',
				'.footer__aside-link'
			];
			return wanted.map((selector) => {
				const el = document.querySelector(selector);
				if (!el) return { selector, found: false, shaped: false, radius: '', token };
				return {
					selector,
					found: true,
					shaped: el.classList.contains('control-shape'),
					radius: getComputedStyle(el).borderRadius,
					token
				};
			});
		});

		const missing = shapes.filter((s) => !s.found).map((s) => s.selector);
		expect(missing, `not on the page — the check is looking at nothing`).toEqual([]);

		const unshaped = shapes.filter((s) => !s.shaped).map((s) => s.selector);
		expect(unshaped, `carrying their own radius instead of the shared shape`).toEqual([]);

		// And the shape is not a circle: that is the whole change.
		const circles = shapes
			.filter((s) => s.radius === '50%' || parseFloat(s.radius) > 100)
			.map((s) => `${s.selector}: ${s.radius}`);
		expect(circles, `still round rather than a superellipse`).toEqual([]);
	});

	test('a skin that means square corners still gets them', async ({ page }) => {
		// --radius-control is per skin, and `minimal` declaring 0 is not an oversight —
		// square corners are what that skin is. A hard-coded pixel radius would have
		// quietly overridden it.
		await page.addInitScript(() => {
			try {
				localStorage.setItem('adoptananimal_style', 'minimal');
			} catch {
				/* private mode — the assertion below reports it */
			}
		});
		await page.goto('/adopt/cat');
		await expect(page.locator('html')).toHaveAttribute('data-style', 'minimal');

		const radius = await page
			.locator('.dropdown__trigger')
			.first()
			.evaluate((el) => getComputedStyle(el).borderRadius);
		expect(radius, 'the minimal skin lost its square corners').toBe('0px');
	});

	test('the Vibrant theme is a leaf', async ({ page }) => {
		await page.goto('/adopt/cat');
		await page.getByTestId('theme-toggle-btn').click();

		const icon = page.locator('[data-testid="theme-option-orange-purple-btn"] svg').first();
		await expect(icon).toHaveClass(/lucide-leaf/);
	});
});

test.describe('the mobile menu', () => {
	/**
	 * Three states in the panel, and each has to be its own shape.
	 *
	 * They were two: the current tab was filled with the section colour and "Apply Now"
	 * was filled with --color-primary, which IS the section colour on the cat pages —
	 * so the page you were on and the button inviting you elsewhere were the same green
	 * rectangle. Everything else had no fill at all, which is why only Play and Order a
	 * website looked like buttons.
	 *
	 * Read as computed style rather than by screenshot: a look is a set of declarations,
	 * and a screenshot test would fail on every unrelated palette change instead.
	 */
	test('tells a plain link, the current page and the call to action apart', async ({ page }) => {
		await page.setViewportSize({ width: 480, height: 900 });
		await page.goto('/adopt/cat');
		await page.locator('.header__burger').first().click();

		const of = (testId: string) =>
			page.getByTestId(testId).evaluate((el) => {
				const style = getComputedStyle(el);
				return {
					background: style.backgroundColor,
					borderWidth: parseFloat(style.borderTopWidth),
					marker: getComputedStyle(el, '::after').content
				};
			});

		const plain = await of('nav-adopt-dog-link');
		const current = await of('nav-adopt-cat-link');
		const cta = await of('nav-apply-now-link');

		// A plain link is filled, the same as the two project buttons at the foot.
		const project = await page
			.locator('.header__nav-project')
			.first()
			.evaluate((el) => getComputedStyle(el).backgroundColor);
		expect(plain.background, 'a plain link has no surface of its own').toBe(project);

		// The current one is filled with something else, and carries a marker that is a
		// shape rather than a colour — in two themes the fills are the same lightness.
		expect(current.background, 'the current page looks like any other link').not.toBe(
			plain.background
		);
		expect(current.marker, 'nothing marks the current page except its colour').not.toBe('none');

		// The call to action is outlined and NOT filled: that is the whole distinction.
		expect(cta.borderWidth, 'the call to action has no outline').toBeGreaterThan(0);
		expect(
			cta.background,
			'the call to action is filled, so it reads as another selected tab'
		).toBe('rgba(0, 0, 0, 0)');
		expect(cta.background, 'the call to action is filled like the current page').not.toBe(
			current.background
		);
	});

	test('says which page it is on, not only shows it', async ({ page }) => {
		// There was no aria-current anywhere in the nav: the current item was a colour and
		// nothing else, so a screen reader had no way to convey it at all.
		await page.setViewportSize({ width: 480, height: 900 });
		await page.goto('/adopt/cat');
		await page.locator('.header__burger').first().click();

		const current = page.locator('.header__nav [aria-current="page"]');
		await expect(current).toHaveCount(1);
		await expect(current).toHaveAttribute('data-testid', 'nav-adopt-cat-link');
	});

	const MOBILE = { width: 375, height: 812 };

	test('is a panel with something behind it, not items over the page', async ({ page }) => {
		await page.setViewportSize(MOBILE);
		await page.goto('/');
		await page.locator('.header__burger').click();

		const nav = page.locator('.header__nav');
		await expect(nav).toHaveClass(/header__nav--open/);

		const panel = await nav.evaluate((el) => {
			const cs = getComputedStyle(el);
			const box = el.getBoundingClientRect();
			return {
				background: cs.backgroundColor,
				height: box.height,
				bottom: box.bottom,
				content: el.scrollHeight,
				viewport: window.innerHeight
			};
		});

		/*
		 * The rule painting it was always right; the box was 64px — its own padding and
		 * nothing else — because .header carries a backdrop-filter and so becomes the
		 * containing block for anything fixed inside it. `top: 72px; bottom: 0` was
		 * resolved against a 72px-tall header, and the five items spilled onto the page
		 * with the background left behind them.
		 */
		expect(panel.background, 'the menu is transparent').not.toBe('rgba(0, 0, 0, 0)');
		expect(
			Math.round(panel.height),
			`the panel is ${Math.round(panel.height)}px around ${panel.content}px of menu`
		).toBeGreaterThanOrEqual(panel.content);
		// And it reaches the bottom of the screen rather than stopping under the items.
		expect(Math.round(panel.bottom)).toBeGreaterThanOrEqual(panel.viewport - 1);
	});

	test('keeps the two organisations side by side in the footer', async ({ page }) => {
		await page.setViewportSize(MOBILE);
		await page.goto('/');

		// Scoped to the footer: the same component is in the mobile menu now, so an
		// unscoped selector would find four logos and compare two of them across it.
		const logos = await page.$$eval('.footer__orgs .org-logos__img', (imgs) =>
			imgs.map((el) => {
				const r = el.getBoundingClientRect();
				return { x: Math.round(r.x), y: Math.round(r.y) };
			})
		);

		expect(logos.length, 'both organisations are there').toBe(2);
		// Stacked, the pair reads as a list of one thing after another.
		expect(logos[0].y, `stacked: ${JSON.stringify(logos)}`).toBe(logos[1].y);
		expect(logos[0].x).not.toBe(logos[1].x);
	});
});

test.describe('the browse buttons', () => {
	/** Which side of its button the glyph sits on. */
	const glyphSide = (page: import('@playwright/test').Page, testId: string) =>
		page.getByTestId(testId).evaluate((el) => {
			const box = el.getBoundingClientRect();
			const glyph = el.querySelector('svg')!.getBoundingClientRect();
			return glyph.x < (box.x + box.right) / 2 ? 'left' : 'right';
		});

	test('turn their glyphs inwards while they sit side by side', async ({ page }) => {
		await page.setViewportSize({ width: 1200, height: 800 });
		await page.goto('/');

		// Cats then dogs, so the two glyphs meet in the middle of the pair rather than
		// sitting at its far ends.
		expect(await glyphSide(page, 'featured-see-all-cats-link')).toBe('right');
		expect(await glyphSide(page, 'featured-see-all-dogs-link')).toBe('left');
	});

	test('both lead with the glyph once they are stacked', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 });
		await page.goto('/');

		// One above the other, facing inwards would put the icons on opposite sides of a
		// column, which reads as a mistake rather than a pairing.
		expect(await glyphSide(page, 'featured-see-all-cats-link')).toBe('left');
		expect(await glyphSide(page, 'featured-see-all-dogs-link')).toBe('left');
	});

	for (const size of [
		{ name: 'a wide window', width: 1200, height: 800 },
		{ name: 'a phone', width: 375, height: 812 }
	]) {
		test(`stand apart on the favourites page on ${size.name}`, async ({ page }) => {
			await page.setViewportSize({ width: size.width, height: size.height });
			await page.goto('/favorites');

			const gap = await page.evaluate(() => {
				const a = document
					.querySelector('[data-testid="explore-dogs-link"]')!
					.getBoundingClientRect();
				const b = document
					.querySelector('[data-testid="explore-cats-link"]')!
					.getBoundingClientRect();
				// Side by side or stacked, the gap is whichever axis separates them.
				return Math.round(Math.max(b.left - a.right, b.top - a.bottom));
			});

			// They had none at all and sat against each other.
			expect(gap, 'the two buttons are touching').toBeGreaterThanOrEqual(12);
		});
	}
});

test.describe('the header dropdowns', () => {
	const MENUS = ['theme', 'style', 'lang'];
	/** The gap the component keeps between a menu and the edge of the window. */
	const EDGE = 8;

	/**
	 * Opened at 375px, which is an iPhone SE — the narrowest screen this project still
	 * supports and the one that found this. The theme menu is 180px under a 44px button
	 * near the left margin; anchored to the trigger's right edge it started at −6px, and
	 * the panel it opens in clips, so the first item was simply gone. FLUID-SIZING-v8 § 5.
	 */
	for (const [where, width] of [
		['a phone', 375],
		['a desktop', 1280]
	] as const) {
		test(`stay inside the window on ${where}`, async ({ page }) => {
			await page.setViewportSize({ width, height: 800 });
			await page.goto('/');
			if (width < 769) await page.getByTestId('mobile-menu-burger-btn').click();

			for (const menu of MENUS) {
				await page.getByTestId(`${menu}-toggle-btn`).click();
				const box = await page.locator('.dropdown__menu').boundingBox();

				expect(box, `${menu} menu did not open`).not.toBeNull();
				expect(box!.x, `${menu} menu starts off the left edge`).toBeGreaterThanOrEqual(0);
				expect(box!.x + box!.width, `${menu} menu runs past the right edge`).toBeLessThanOrEqual(
					width
				);

				await page.keyboard.press('Escape');
			}
		});

		test(`sit under the middle of their button on ${where}, or as near as the edge allows`, async ({
			page
		}) => {
			await page.setViewportSize({ width, height: 800 });
			await page.goto('/');
			if (width < 769) await page.getByTestId('mobile-menu-burger-btn').click();

			for (const menu of MENUS) {
				const trigger = page.getByTestId(`${menu}-toggle-btn`);
				await trigger.click();

				const t = (await trigger.boundingBox())!;
				const m = (await page.locator('.dropdown__menu').boundingBox())!;

				// Centred is the rule; being pushed against a margin is the only exception,
				// and then it has to be against that margin rather than somewhere near it.
				const offCentre = Math.abs(t.x + t.width / 2 - (m.x + m.width / 2));
				const atLeft = Math.abs(m.x - EDGE) <= 1;
				const atRight = Math.abs(m.x + m.width - (width - EDGE)) <= 1;

				expect(
					offCentre <= 1 || atLeft || atRight,
					`${menu} menu is ${Math.round(offCentre)}px off centre and against neither margin`
				).toBe(true);

				await page.keyboard.press('Escape');
			}
		});
	}
});
