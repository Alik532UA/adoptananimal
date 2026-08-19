import type { Localized } from './types';

/**
 * The page's own words, in the same two languages as its items.
 *
 * A deliberate deviation from the project rule that UI text lives in the i18n
 * dictionary, and it is recorded in PROJECT-CONTEXT § 4.21. The dictionary carries
 * four languages under a parity gate; the checklist carries two by canon (§ 2.4).
 * Putting the chrome in the dictionary would give a German tester a German frame
 * around fifty English items — half-translated reads worse than consistently English,
 * and the page is a tool for testers rather than part of the product.
 *
 * Ukrainian for a Ukrainian visitor, English for everyone else — the same rule the
 * items follow, so the page never mixes the two.
 */
export const BETA_UI = {
	title: { uk: 'Чеклист бета-тестування', en: 'Beta testing checklist' },
	intro: {
		uk: 'Пройдіть пункти по черзі й позначте кожен. Позначки лишаються у вашому браузері й нікуди не надсилаються; наприкінці натисніть «Скопіювати звіт» і надішліть текст.',
		en: 'Walk the items in order and mark each one. Marks stay in your browser and are sent nowhere; at the end press «Copy report» and send the text.'
	},
	hidden: {
		uk: 'Ця сторінка не в меню й не в пошуку. Вона не таємна — просто службова.',
		en: 'This page is not in the menu and not in search. It is not secret, just internal.'
	},
	levels: {
		manual: {
			uk: 'Тільки людина — машина цього не вміє',
			en: 'A person only — no test can do this'
		},
		testable: {
			uk: 'Можна покрити тестом, поки не покрито',
			en: 'Could be covered by a test, is not yet'
		},
		covered: {
			uk: 'Покрито автотестом — контрольна група',
			en: 'Covered by a test — the control group'
		}
	},
	votes: {
		fail: { uk: 'Не працює', en: 'Does not work' },
		weird: { uk: 'Працює, але дивно', en: 'Works, but oddly' },
		ok: { uk: 'Працює', en: 'Works' }
	},
	stale: {
		uk: 'позначено на іншій версії',
		en: 'marked on another version'
	},
	progress: { uk: 'Позначено на цій версії', en: 'Marked on this version' },
	copy: { uk: 'Скопіювати звіт', en: 'Copy report' },
	copied: { uk: 'Звіт у буфері обміну', en: 'The report is in the clipboard' },
	copyFailed: {
		uk: 'Браузер не дав скопіювати. Виділіть текст нижче й скопіюйте вручну.',
		en: 'The browser refused to copy. Select the text below and copy it by hand.'
	},
	clear: { uk: 'Стерти всі позначки', en: 'Erase all marks' },
	nothingMarked: {
		uk: 'Жодного пункта ще не позначено.',
		en: 'Nothing has been marked yet.'
	},
	coveredWarning: {
		uk: 'ЦЕЙ ПУНКТ ПОКРИТО АВТОТЕСТОМ',
		en: 'THIS ITEM IS COVERED BY A TEST'
	}
} as const satisfies Record<string, Localized | Record<string, Localized>>;

/** Ukrainian for a Ukrainian reader, English for every other language. */
export const pick = (text: Localized, locale: string): string =>
	locale === 'uk' ? text.uk : text.en;
