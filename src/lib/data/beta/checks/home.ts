import type { BetaCheck } from '../types';

/** The home page: hero, the two carousels, the about section. */
export const homeChecks: readonly BetaCheck[] = [
	{
		id: 'home_1',
		category: { uk: 'Каруселі', en: 'Carousels' },
		text: {
			uk: 'Наведіть курсор на карусель тварин. Рух мусить зупинитися, поки курсор на ній, і поїхати далі, коли ви його заберете.',
			en: 'Hover the animal carousel. The movement must stop while the pointer is on it and resume when you take it away.'
		},
		coverage: 'testable'
	},
	{
		id: 'home_2',
		category: { uk: 'Каруселі', en: 'Carousels' },
		text: {
			uk: 'Натисніть стрілку праворуч від каруселі кілька разів. Картки мусять від’їжджати рівно, без стрибків і без порожнього місця в кінці.',
			en: 'Press the arrow to the right of the carousel a few times. Cards must slide evenly, with no jumps and no empty space at the end.'
		},
		testid: 'featured-carousel-next-btn',
		coverage: 'manual'
	},
	{
		id: 'home_3',
		category: { uk: 'Каруселі', en: 'Carousels' },
		text: {
			uk: 'Пройдіть карусель до кінця й порахуйте приглушені картки прилаштованих. Їх мусить бути кілька, а не половина каруселі.',
			en: 'Walk the carousel to the end and count the dimmed cards of adopted animals. There must be a few, not half the carousel.'
		},
		negative: true,
		coverage: 'covered',
		test: 'tests/ui.spec.ts'
	},
	{
		id: 'home_4',
		category: { uk: 'Картки', en: 'Cards' },
		text: {
			uk: 'Наведіть курсор на приглушену картку прилаштованої тварини. Вона мусить проясніти повністю, а стікер про прилаштування — лишитися читомим.',
			en: 'Hover a dimmed card of an adopted animal. It must brighten fully, and the adopted sticker must stay readable.'
		},
		coverage: 'covered',
		test: 'tests/ui.spec.ts'
	},
	{
		id: 'home_5',
		category: { uk: 'Перехід', en: 'Navigation' },
		text: {
			uk: 'Натисніть «Подивитися всіх котів». Мусить відкритися список котів, а не собак.',
			en: 'Press «See all cats». The list of cats must open, not the dogs.'
		},
		testid: 'featured-see-all-cats-link',
		coverage: 'covered',
		test: 'tests/journey.spec.ts'
	},
	{
		id: 'home_6',
		category: { uk: 'Про нас', en: 'About' },
		text: {
			uk: 'Прокрутіть до секції про нас. Чотири прапори мусять бути кольоровими картинками однакового розміру, а не смужками.',
			en: 'Scroll to the about section. The four flags must be colour images of the same size, not thin strips.'
		},
		coverage: 'covered',
		test: 'tests/ui.spec.ts'
	},
	{
		id: 'home_7',
		category: { uk: 'Тло', en: 'Background' },
		text: {
			uk: 'Прокрутіть головну зверху донизу. Фонове зображення мусить рухатися повільніше за вміст і не обриватися внизу порожнім кольором.',
			en: 'Scroll the home page top to bottom. The background image must move slower than the content and must not run out into flat colour at the bottom.'
		},
		coverage: 'manual'
	}
];
