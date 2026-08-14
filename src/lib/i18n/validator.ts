import { en } from './translations/en';
import { uk } from './translations/uk';
import { de } from './translations/de';
import { nl } from './translations/nl';

const locales = { en, uk, de, nl };
const baseLocale = 'en';
const baseKeys = Object.keys(en);

let hasErrors = false;

const fail = (message: string, detail?: unknown) => {
	hasErrors = true;
	if (detail === undefined) console.error(message);
	else console.error(message, detail);
};

console.log(`Validating i18n keys against base locale: ${baseLocale}`);

Object.entries(locales).forEach(([code, strings]) => {
	const entries = Object.entries(strings) as [string, string][];
	const keys = entries.map(([k]) => k);

	// Empty values are checked in every locale, including the base one: a key that
	// exists with an empty string renders as nothing and looks like a layout bug.
	const empty = entries.filter(([, value]) => value.trim() === '').map(([k]) => k);
	if (empty.length > 0) {
		fail(`[${code}] Empty values:`, empty);
	}

	if (code === baseLocale) return;

	const missing = baseKeys.filter((k) => !keys.includes(k));
	const extra = keys.filter((k) => !baseKeys.includes(k));

	if (missing.length > 0) {
		fail(`[${code}] Missing keys:`, missing);
	}

	// Extra keys fail too. As a warning they accumulated silently: de and nl each
	// carried two keys that no longer existed in the base locale.
	if (extra.length > 0) {
		fail(`[${code}] Extra keys (not in base locale):`, extra);
	}

	if (missing.length === 0 && extra.length === 0 && empty.length === 0) {
		console.log(`[${code}] OK — ${keys.length} keys`);
	}
});

if (hasErrors) {
	console.error('\nI18N validation failed.');
	process.exit(1);
} else {
	console.log(`\nI18N validation passed for ${Object.keys(locales).length} locales.`);
}
