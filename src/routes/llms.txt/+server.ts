import { absoluteLocale, absoluteFromRoot, INDEXED_PATHS, isHiddenRoute } from '$lib/config';
import { DEFAULT_LOCALE, LOCALES, PREFIXED_LOCALES } from '$lib/i18n/locales';
import { animalService } from '$lib/services/animals';

/**
 * `llms.txt` (SEO-v8 § 7.1) — the machine-readable map an LLM agent reads instead
 * of guessing at the site.
 *
 * **A route, not a file in `static/`, and that is the whole point of this commit.**
 * As a static file it held addresses typed by hand, and every one of them was
 * wrong: the host read `adoptananimal.github.io` — a user that is not this one —
 * and three of the six pages (`/process`, `/partners`, `/about`) are routes this
 * site has never had. Seven links, seven 404s, in the one file whose entire job is
 * to stop a model inventing pages.
 *
 * Generated, the addresses come from `absoluteLocale()` — the same builder as the
 * canonical tags and the sitemap — and the page list from `INDEXED_PATHS`, the same
 * list the sitemap walks. A route that does not exist can no longer be named here,
 * because there is nothing left to name it with.
 *
 * Counts are read from the data for the same reason: `28 cats` written by hand is
 * true until an animal is added, and nothing anywhere would say otherwise.
 *
 * English only, deliberately. The file is one document at the site root, and the
 * languages are described rather than duplicated — `/uk`, `/de` and `/nl` are the
 * same paths under a prefix, which is a sentence, not five more files.
 */
export const prerender = true;

/** What each indexed path is, for a reader that has never seen the site. */
const BLURB: Record<string, { title: string; text: string }> = {
	'/': {
		title: 'Home',
		text: 'Rescued cats and dogs currently looking for a home, newest and still-available animals first.'
	},
	'/adopt/cat': {
		title: 'Adopt a Cat',
		text: 'Every cat on the site, with search and filters for sex, size and adoption status.'
	},
	'/adopt/dog': {
		title: 'Adopt a Dog',
		text: 'Every dog on the site, with search and filters for sex, size and adoption status.'
	},
	'/apply': {
		title: 'Adoption Application',
		text: 'How adoption works, which countries are served, and the application form itself.'
	},
	'/favorites': {
		title: 'Favorites',
		text: 'Animals the visitor has marked, kept in their own browser — there is no account and nothing is sent anywhere.'
	}
};

export function GET() {
	const cats = animalService.cats.length;
	const dogs = animalService.dogs.length;

	const pages = INDEXED_PATHS.filter((path) => !isHiddenRoute(path)).map((path) => {
		const blurb = BLURB[path];
		return `- [${blurb.title}](${absoluteLocale(path, DEFAULT_LOCALE)}): ${blurb.text}`;
	});

	const body = `# Adopt an Animal (Ukraine)

> A joint humanitarian project by Notpfote Animal Rescue e.V. and Vet Crew that rehomes cats and dogs rescued in Ukraine with adopters across Europe.

The site is a catalogue of ${cats + dogs} named animals — ${cats} cats and ${dogs} dogs — plus the adoption process. It has no accounts, no login and no payments; the only thing a visitor sends is an application form.

Every page exists in ${LOCALES.length} languages. ${DEFAULT_LOCALE.toUpperCase()} is served at the bare path and the rest under a prefix (${PREFIXED_LOCALES.map((locale) => `/${locale}`).join(', ')}), so the German version of any address below is the same path with /de in front of it.

## Main Pages

${pages.join('\n')}

## Individual Animals

Each animal has a page of its own at /adopt/cat/<name> or /adopt/dog/<name>, carrying breed, age, sex, size, colour, adoption status, photographs and the animal's story. All ${cats + dogs} are listed in the sitemap; they are not repeated here because the sitemap is the copy that cannot fall behind.

An animal already placed keeps its page and is marked as adopted rather than removed.

## Adoption

Applications go to Notpfote Animal Rescue e.V. (Germany) and Vet Crew, who arrange the transport and the home check. The application page carries the form; the address in the footer reaches the same people directly.

## Additional Resources

- [Sitemap](${absoluteFromRoot('/sitemap.xml')}): every public address, in all ${LOCALES.length} languages.
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain' }
	});
}
