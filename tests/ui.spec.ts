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

	for (const theme of THEMES) {
		test(`the hero buttons are solid and stand out in theme ${theme}`, async ({ page }) => {
			await page.goto('/');
			await page.evaluate((t) => localStorage.setItem('adoptananimal_theme', t), theme);
			await page.reload();

			const seen = await page.getByTestId('featured-see-all-cats-link').evaluate((el) => {
				const cs = getComputedStyle(el);
				const section = document.querySelector('.main > *')!;
				return { button: cs.backgroundColor, section: getComputedStyle(section).backgroundColor };
			});

			// Solid, not glass: over a coloured section a half-transparent button takes on
			// the colour behind it and the label goes with it.
			expect(seen.button, `${theme}: the button is translucent`).toMatch(/^rgb\(/);
			// And a different colour from what it stands on, or it is not a button at all.
			// The dark theme's card grey on its dark green hero was legible and invisible.
			const rgb = (s: string) => (s.match(/\d+/g) ?? []).map(Number);
			const [br, bg2, bb] = rgb(seen.button);
			const [sr, sg, sb] = rgb(seen.section);
			const apart = Math.abs(br - sr) + Math.abs(bg2 - sg) + Math.abs(bb - sb);
			expect(apart, `${theme}: the button barely differs from the section`).toBeGreaterThan(90);
		});
	}
});

test.describe('animals and their photographs', () => {
	/** Every card, paired with the file its <img> actually points at. */
	const cards = (page: import('@playwright/test').Page) =>
		page.$$eval('.animal-card', (els) =>
			els.map((el) => ({
				slug: el.id.replace('card-', ''),
				file:
					el
						.querySelector('.animal-card__photo')
						?.getAttribute('src')
						?.split('/')
						.pop()
						?.replace(/^(cat|dog)_/, '')
						.replace(/\.\w+$/, '') ?? null
			}))
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
