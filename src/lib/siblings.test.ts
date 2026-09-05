// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolveSiblingLocale, SIBLINGS, siblingUrl, type SiblingId } from './siblings';
import { DEFAULT_LOCALE, LOCALES } from './i18n/locales';
import { SIDE_PROJECTS, SITE_ORIGIN } from './config';

/**
 * The two halves of the cross-site language handoff, and they fail for different
 * reasons.
 *
 * The first half is DRIFT. `siblings.ts` is a copy of one table carried by eight
 * repositories, and each of them knows the truth about exactly one row: its own.
 * Adding `pl` here, or moving the default language off `en`, silently invalidates
 * what seven other sites believe about this one — and the symptom appears over
 * there, as a link into a language this site does not serve, months later. So this
 * repo checks its own row against its own `LOCALES`, on the commit that changes
 * them.
 *
 * The second half is the ADDRESSES this site emits. Those are checkable outright,
 * and worth checking as whole strings rather than as "contains /de/": the defect
 * being fixed was a link that pointed at a real, working, wrong-language page, which
 * every loose assertion in the world would have passed.
 *
 * Reverse experiment (AI-AGENT-PITFALLS-v8 § 1.1): dropping `nl` from `LOCALES`
 * reddens the drift check; flipping `trailingSlash` on the VetCrewGames row reddens
 * six address assertions; and removing the `?lang=` branch from `siblingUrl` reddens
 * exactly the two default-language cases, which is the pair that used to be broken.
 */

describe('the sibling registry describes this site correctly', () => {
	const own = SIBLINGS.adoptananimal;

	it('lists the same languages this site actually serves', () => {
		expect([...own.locales].sort()).toEqual([...LOCALES].sort());
	});

	it('names the same language this site serves at its bare path', () => {
		expect(own.defaultLocale).toBe(DEFAULT_LOCALE);
	});

	it('carries the origin the build is configured with', () => {
		expect(own.origin).toBe(SITE_ORIGIN);
	});

	/*
	 * Against the deploy workflow rather than `SITE_BASE`, and that is not laziness.
	 * `SITE_BASE` comes from `BASE_PATH`, which is empty everywhere except the deploy
	 * job — so comparing against it would assert `''` locally for the same reason it now
	 * asserts `''` in production, and prove nothing either way about the address other
	 * sites are told to link to.
	 *
	 * The workflow is where that address is decided: `CUSTOM_DOMAIN` set means the site is
	 * served from the root of its own domain — empty base, origin is the domain — and left
	 * empty it falls back to a project site under the repository NAME.
	 *
	 * This used to compare against package.json alone, which was right only while the
	 * fallback branch was the one that ran. It would have stayed green through the entire
	 * move to adoptananimal.in.ua, with every sibling site still sending its readers to
	 * alik532ua.github.io/adoptananimal — a link that works, in the sense that a 404 page
	 * loads.
	 *
	 * Reverse experiment (AI-AGENT-PITFALLS-v8 § 1.1): changing the domain on one side
	 * only — here or in the workflow — reddens this; clearing `CUSTOM_DOMAIN` without
	 * putting the base back reddens it too.
	 */
	it('carries the address the deploy workflow builds for', () => {
		const workflow = readFileSync('.github/workflows/deploy.yml', 'utf-8');
		const domain = /^\s+CUSTOM_DOMAIN:\s*(\S*)/m.exec(workflow)?.[1] ?? '';

		if (domain) {
			expect(own.origin).toBe(`https://${domain}`);
			expect(own.base).toBe('');
		} else {
			expect(own.base).toBe(`/${JSON.parse(readFileSync('package.json', 'utf-8')).name}`);
		}
	});

	it('agrees with the layout about trailing slashes', () => {
		const layout = readFileSync('src/routes/+layout.ts', 'utf-8');
		const declared = /export const trailingSlash = '(\w+)'/.exec(layout)?.[1];
		expect(declared, 'the layout no longer declares trailingSlash').toBeTruthy();
		expect(own.trailingSlash).toBe(declared === 'always');
	});
});

describe('choosing the language a neighbour is asked for', () => {
	it('uses the language itself when the neighbour serves it', () => {
		expect(resolveSiblingLocale('vetcrewgames', 'de')).toBe('de');
		expect(resolveSiblingLocale('digitalworkshop', 'nl')).toBe('nl');
	});

	it('falls to the primary subtag rather than treating en-US as unknown', () => {
		expect(resolveSiblingLocale('vetcrewgames', 'en-US')).toBe('en');
	});

	it('bridges through English when the neighbour has nothing closer', () => {
		// as5 and teatralo4ka serve Ukrainian and English only. A Dutch reader is
		// better served by English than by somebody else's default.
		expect(resolveSiblingLocale('as5', 'nl')).toBe('en');
		expect(resolveSiblingLocale('teatralo4ka', 'de')).toBe('en');
	});

	/*
	 * The last rung of `resolveSiblingLocale` — fall back to the neighbour's own
	 * default — cannot be reached while every site in the table serves English, so
	 * asserting the invariant is the only honest way to cover it. It fails on the day
	 * a site drops English, which is the day that rung starts doing something.
	 */
	it('has an English bridge available on every neighbour, so far', () => {
		const without = Object.entries(SIBLINGS)
			.filter(([, site]) => !(site.locales as readonly string[]).includes('en'))
			.map(([id]) => id);
		expect(without, 'the default-locale fallback is now reachable and untested').toEqual([]);
	});
});

describe('the footer links carry the language being read', () => {
	const href = (id: SiblingId, locale: string) => siblingUrl(id, locale);

	it('names the language in the path where the neighbour puts it there', () => {
		expect(href('vetcrewgames', 'de')).toBe('https://alik532ua.github.io/VetCrewGames/de/');
		expect(href('vetcrewgames', 'nl')).toBe('https://alik532ua.github.io/VetCrewGames/nl/');
		expect(href('vetcrewgames', 'en')).toBe('https://alik532ua.github.io/VetCrewGames/en/');
		expect(href('digitalworkshop', 'de')).toBe('https://alik532ua.github.io/DigitalWorkshop/de/');
		expect(href('digitalworkshop', 'nl')).toBe('https://alik532ua.github.io/DigitalWorkshop/nl/');
		expect(href('digitalworkshop', 'en')).toBe('https://alik532ua.github.io/DigitalWorkshop/en/');
	});

	/*
	 * Ukrainian is what both of those sites serve at the bare path, so the path cannot
	 * say "Ukrainian" — `/VetCrewGames/uk/` is not an address either site publishes.
	 * `?lang=` says it instead, and it has to say it: the bare path means "no choice
	 * made", and a visitor who once set that site to English would otherwise get
	 * English while reading Ukrainian here.
	 */
	it('says the language in the query where the path cannot', () => {
		expect(href('vetcrewgames', 'uk')).toBe('https://alik532ua.github.io/VetCrewGames/?lang=uk');
		expect(href('digitalworkshop', 'uk')).toBe(
			'https://alik532ua.github.io/DigitalWorkshop/?lang=uk'
		);
	});

	it('leaves no address without a language, in any language this site has', () => {
		for (const project of SIDE_PROJECTS) {
			for (const locale of LOCALES) {
				const url = new URL(siblingUrl(project.site, locale));
				const named = url.searchParams.get('lang') ?? url.pathname.split('/')[2];
				expect(named, `${project.id} in ${locale} opens in nobody knows what`).toBe(locale);
			}
		}
	});
});
