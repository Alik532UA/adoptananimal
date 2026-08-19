import type { BetaCheck } from '../types';

/**
 * Everything that is the same on every page: header, pickers, scrollbar, toasts,
 * footer. This tab claims no route of its own — the chrome has none.
 */
export const commonChecks: readonly BetaCheck[] = [
	{
		id: 'common_1',
		category: { uk: 'Тема', en: 'Theme' },
		text: {
			uk: 'Натисніть кнопку теми в шапці. Мусить відкритися список із чотирьох тем із позначеною поточною; вибір теми одразу міняє кольори сторінки.',
			en: 'Press the theme button in the header. A list of four themes must open with the current one marked; picking one changes the page colours at once.'
		},
		testid: 'theme-toggle-btn',
		coverage: 'covered',
		test: 'tests/ui.spec.ts'
	},
	{
		id: 'common_2',
		category: { uk: 'Тема', en: 'Theme' },
		text: {
			uk: 'Оберіть тему, перезавантажте сторінку клавішею F5. Обрана тема мусить лишитися; білого спалаху між завантаженням і кольорами бути НЕ мусить.',
			en: 'Pick a theme, then reload with F5. The theme must survive, and there must be NO white flash between the load and the colours.'
		},
		negative: true,
		coverage: 'manual'
	},
	{
		id: 'common_3',
		category: { uk: 'Тема', en: 'Theme' },
		text: {
			uk: 'Пройдіть усі чотири теми на цій сторінці. У кожній усі написи мусять читатися; напису, що зливається з тлом, бути НЕ мусить.',
			en: 'Walk through all four themes on this page. Every label must stay readable in each; no label may blend into its background.'
		},
		negative: true,
		coverage: 'covered',
		test: 'tests/a11y.spec.ts'
	},
	{
		id: 'common_4',
		category: { uk: 'Вигляд', en: 'Style' },
		text: {
			uk: 'Натисніть кнопку вигляду. Мусить бути рівно два варіанти; перемикання міняє форму кутів у кнопок і карток, а кольори лишає ті самі.',
			en: 'Press the style button. There must be exactly two options; switching changes the corner shapes of buttons and cards and leaves the colours alone.'
		},
		testid: 'style-toggle-btn',
		coverage: 'covered',
		test: 'tests/skin-overrides.spec.ts'
	},
	{
		id: 'common_5',
		category: { uk: 'Мова', en: 'Language' },
		text: {
			uk: 'Натисніть кнопку мови й оберіть українську. Адреса мусить початися з /uk/, а всі підписи стати українськими — включно з шапкою й підвалом.',
			en: 'Press the language button and pick Ukrainian. The address must start with /uk/ and every label must turn Ukrainian — header and footer included.'
		},
		testid: 'lang-toggle-btn',
		coverage: 'covered',
		test: 'tests/i18n.spec.ts'
	},
	{
		id: 'common_6',
		category: { uk: 'Мова', en: 'Language' },
		text: {
			uk: 'Оберіть німецьку, потім нідерландську. Англійських рядків серед підписів лишитися НЕ мусить.',
			en: 'Pick German, then Dutch. No English strings may be left among the labels.'
		},
		testid: 'lang-toggle-btn',
		negative: true,
		coverage: 'manual'
	},
	{
		id: 'common_7',
		category: { uk: 'Смуга прокрутки', en: 'Scrollbar' },
		text: {
			uk: 'Клацніть правою кнопкою по смузі прокрутки справа. Мусить відкритися меню з чотирьох варіантів; візуальна мінімапа показує зменшену копію сторінки з фотографіями.',
			en: 'Right-click the scrollbar on the right. A menu of four options must open; the visual minimap shows a shrunken copy of the page, photographs and all.'
		},
		testid: 'page-scrollbar-container',
		coverage: 'testable'
	},
	{
		id: 'common_8',
		category: { uk: 'Смуга прокрутки', en: 'Scrollbar' },
		text: {
			uk: 'Увімкніть візуальну мінімапу й натисніть Tab кілька разів. Фокус НЕ мусить заходити в мінімапу — рамка ходить лише по справжній сторінці.',
			en: 'Turn the visual minimap on and press Tab a few times. Focus must NOT enter the minimap — the ring stays on the real page.'
		},
		testid: 'minimap-container',
		negative: true,
		coverage: 'covered',
		test: 'tests/scrollbar.spec.ts'
	},
	{
		id: 'common_9',
		category: { uk: 'Пошта', en: 'Email' },
		text: {
			uk: 'У підвалі натисніть логотип Notpfote, щоб розкрити акаунти, і натисніть пошту. Мусить з’явитися повідомлення біля самої адреси з кнопкою «Відкрити пошту», а адреса — потрапити в буфер обміну: вставте її кудись.',
			en: 'In the footer, press the Notpfote logo to reveal its accounts, then press the mail one. A message must appear beside the address itself with an «Open mail client» button, and the address must be in the clipboard — paste it somewhere.'
		},
		testid: 'footer-org-notpfote-mail-link',
		coverage: 'testable'
	},
	{
		id: 'common_10',
		category: { uk: 'Повідомлення', en: 'Toasts' },
		text: {
			uk: 'Викличте повідомлення й тримайте на ньому курсор. Поки курсор на ньому, воно зникнути НЕ мусить.',
			en: 'Trigger a message and keep the pointer on it. While the pointer is there it must NOT disappear.'
		},
		negative: true,
		coverage: 'covered',
		test: 'tests/toast.spec.ts'
	},
	{
		id: 'common_11',
		category: { uk: 'Нагору', en: 'Back to top' },
		text: {
			uk: 'Прокрутіть сторінку вниз. Праворуч знизу мусить з’явитися кругла кнопка зі стрілкою; натиснута — плавно повертає на початок.',
			en: 'Scroll the page down. A round arrow button must appear at the bottom right; pressing it glides back to the start.'
		},
		testid: 'back-to-top-btn',
		coverage: 'testable'
	},
	{
		id: 'common_12',
		category: { uk: 'Телефон', en: 'Phone' },
		text: {
			uk: 'На телефоні натисніть кнопку меню в шапці. Пункти мусять бути рядками на всю ширину; поточна сторінка позначена не лише кольором, а й білою смужкою зліва.',
			en: 'On a phone, press the menu button in the header. Items must be full-width rows, and the current page is marked by a white bar on the left as well as by colour.'
		},
		testid: 'mobile-menu-burger-btn',
		coverage: 'covered',
		test: 'tests/ui.spec.ts'
	},
	{
		id: 'common_13',
		category: { uk: 'Телефон', en: 'Phone' },
		text: {
			uk: 'На телефоні поверніть його горизонтально й пройдіть сторінки. Сторінка НЕ мусить їхати вбік — горизонтальної прокрутки бути не мусить ніде.',
			en: 'On a phone, turn it sideways and walk the pages. The page must NOT slide sideways — no horizontal scrolling anywhere.'
		},
		negative: true,
		coverage: 'covered',
		test: 'tests/fluid-sizing.spec.ts'
	},
	{
		id: 'common_14',
		category: { uk: 'Службове', en: 'Internal' },
		text: {
			uk: 'Пройдіть кілька сторінок. Червоної круглої кнопки з цифрою в лівому нижньому куті бути НЕ мусить — вона лише для розробника.',
			en: 'Walk a few pages. There must be NO red round button with a number in the bottom-left corner — that one is for the developer only.'
		},
		testid: 'debug-log-copy-btn',
		negative: true,
		coverage: 'manual'
	}
];
