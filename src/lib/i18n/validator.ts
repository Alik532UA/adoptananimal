import { en } from './translations/en';
import { uk } from './translations/uk';
import { de } from './translations/de';
import { nl } from './translations/nl';

const locales = { en, uk, de, nl };
const baseLocale = 'en';
const baseKeys = Object.keys(en);

let hasErrors = false;

console.log(`🔍 Validating i18n keys against base locale: ${baseLocale}`);

Object.entries(locales).forEach(([code, strings]) => {
	if (code === baseLocale) return;

	const keys = Object.keys(strings);
	const missing = baseKeys.filter((k) => !keys.includes(k));
	const extra = keys.filter((k) => !baseKeys.includes(k));

	if (missing.length > 0) {
		console.error(`❌ [${code}] Missing keys:`, missing);
		hasErrors = true;
	}

	if (extra.length > 0) {
		console.warn(`⚠️ [${code}] Extra keys (not in base locale):`, extra);
	}

	if (missing.length === 0 && extra.length === 0) {
		console.log(`✅ [${code}] Perfect match!`);
	}
});

if (hasErrors) {
	console.error('\n🛑 I18N Validation failed!');
	process.exit(1);
} else {
	console.log('\n✨ I18N Validation successful!');
}
