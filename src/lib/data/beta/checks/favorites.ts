import type { BetaCheck } from '../types';

/** The favourites page: /favorites, and what the counter in the header claims. */
export const favoriteChecks: readonly BetaCheck[] = [
	{
		id: 'favorites_1',
		category: { uk: 'Порожній стан', en: 'Empty state' },
		text: {
			uk: 'Відкрийте обране, не додавши нічого. Мусить бути повідомлення й кнопки до розділів котів і собак, а не порожня сторінка.',
			en: 'Open favourites without adding anything. There must be a message and buttons to the cat and dog sections, not an empty page.'
		},
		testid: 'no-favorites-message',
		coverage: 'covered',
		test: 'tests/favorites.spec.ts'
	},
	{
		id: 'favorites_2',
		category: { uk: 'Збереження', en: 'Persistence' },
		text: {
			uk: 'Додайте дві тварини в обране й закрийте браузер повністю. Після повторного відкриття сайту обидві мусять бути на місці.',
			en: 'Add two animals to favourites and close the browser completely. Both must still be there when you open the site again.'
		},
		coverage: 'covered',
		test: 'tests/favorites.spec.ts'
	},
	{
		id: 'favorites_3',
		category: { uk: 'Лічильник', en: 'Counter' },
		text: {
			uk: 'Порівняйте число біля серця в шапці з кількістю карток на сторінці обраного. Вони мусять збігатися.',
			en: 'Compare the number beside the heart in the header with the number of cards on the favourites page. They must agree.'
		},
		testid: 'nav-favorites-link',
		coverage: 'testable'
	},
	{
		id: 'favorites_4',
		category: { uk: 'Видалення', en: 'Removal' },
		text: {
			uk: 'Натисніть залите серце на картці в обраному. Картка мусить зникнути зі сторінки, а число в шапці — зменшитися на одиницю.',
			en: 'Press the filled heart on a card in favourites. The card must leave the page and the number in the header must drop by one.'
		},
		testid: 'animal-card-*-favorite-btn',
		coverage: 'covered',
		test: 'tests/favorites.spec.ts'
	},
	{
		id: 'favorites_5',
		category: { uk: 'Видалення', en: 'Removal' },
		text: {
			uk: 'Приберіть з обраного всі тварини по одній. Порожнього списку без повідомлення бути НЕ мусить — після останньої мусить з’явитися той самий текст, що й на початку.',
			en: 'Remove every animal from favourites one at a time. There must be NO empty list without a message — after the last one the same text as at the start must appear.'
		},
		negative: true,
		coverage: 'manual'
	},
	{
		id: 'favorites_6',
		category: { uk: 'Прилаштовані', en: 'Adopted' },
		text: {
			uk: 'Додайте в обране прилаштовану тварину. У списку обраного вона мусить лишитися приглушеною так само, як у розділі.',
			en: 'Add an adopted animal to favourites. In the favourites list it must stay dimmed exactly as it is in its section.'
		},
		coverage: 'manual'
	}
];
