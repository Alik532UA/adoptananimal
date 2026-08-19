import type { BetaCheck } from '../types';

/** The two section lists: /adopt/cat and /adopt/dog — filters, counts, grid. */
export const listChecks: readonly BetaCheck[] = [
	{
		id: 'lists_1',
		category: { uk: 'Фільтри', en: 'Filters' },
		text: {
			uk: 'Наберіть у полі пошуку ім’я тварини, яку бачите в списку. Мусить лишитися одна картка — саме її.',
			en: 'Type the name of an animal you can see in the list into the search field. One card must remain — that one.'
		},
		testid: 'filter-search-input',
		coverage: 'covered',
		test: 'tests/journey.spec.ts'
	},
	{
		id: 'lists_2',
		category: { uk: 'Фільтри', en: 'Filters' },
		text: {
			uk: 'Натисніть «Самець». Кожна картка, що лишилася, мусить показувати символ ♂ поруч зі словом про стать; ♀ серед них бути НЕ мусить.',
			en: 'Press «Male». Every remaining card must show ♂ beside its gender word; no ♀ may be left among them.'
		},
		testid: 'filter-gender-male-btn',
		negative: true,
		coverage: 'covered',
		test: 'tests/ui.spec.ts'
	},
	{
		id: 'lists_3',
		category: { uk: 'Фільтри', en: 'Filters' },
		text: {
			uk: 'Виберіть фільтр і перезавантажте сторінку. Фільтр мусить лишитися застосованим, а в адресі — залишитися його назва.',
			en: 'Pick a filter and reload the page. The filter must still be applied, and its name must still be in the address.'
		},
		coverage: 'covered',
		test: 'tests/journey.spec.ts'
	},
	{
		id: 'lists_4',
		category: { uk: 'Фільтри', en: 'Filters' },
		text: {
			uk: 'Наберіть у пошуку три випадкові літери, яких точно немає в іменах. Замість карток мусить бути повідомлення, а не порожня сторінка.',
			en: 'Type three random letters no name could contain into the search. A message must take the place of the cards, not an empty page.'
		},
		testid: 'filter-search-input',
		negative: true,
		coverage: 'manual'
	},
	{
		id: 'lists_5',
		category: { uk: 'Лічильники', en: 'Counts' },
		text: {
			uk: 'Порівняйте числа над списком із кількістю карток. «Шукають дім» плюс «прилаштовані» мусить дорівнювати всім карткам без фільтрів.',
			en: 'Compare the numbers above the list with the cards. «Looking for a home» plus «adopted» must equal all the cards with no filters on.'
		},
		testid: 'list-stats-waiting-badge',
		coverage: 'testable'
	},
	{
		id: 'lists_6',
		category: { uk: 'Сітка', en: 'Grid' },
		text: {
			uk: 'Звузьте вікно до ширини телефона. Картки мусять стати в один стовпчик і лишитися цілими — обрізаних імен і фото бути НЕ мусить.',
			en: 'Narrow the window to phone width. Cards must fall into a single column and stay whole — no clipped names or photographs.'
		},
		negative: true,
		coverage: 'covered',
		test: 'tests/fluid-sizing.spec.ts'
	},
	{
		id: 'lists_7',
		category: { uk: 'Фотографії', en: 'Photographs' },
		text: {
			uk: 'Пройдіть список до кінця. На фотографіях НЕ мусить бути жодного запеченого напису — стікер про прилаштування малює сайт, і він однаковою рамкою на всіх картках.',
			en: 'Walk the list to the end. No photograph may carry a caption baked into the image — the adopted sticker is drawn by the site, in the same frame on every card.'
		},
		negative: true,
		coverage: 'manual'
	},
	{
		id: 'lists_8',
		category: { uk: 'Дотик', en: 'Touch' },
		text: {
			uk: 'На телефоні натисніть кожен чіп фільтра пальцем. Кожен мусить натискатися з першого разу; сусідній замість потрібного натиснутися НЕ мусить.',
			en: 'On a phone, press each filter chip with a fingertip. Each must respond first time; a neighbour must NOT take the press instead.'
		},
		testid: 'filter-size-small-btn',
		negative: true,
		coverage: 'manual'
	}
];
