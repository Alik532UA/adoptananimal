import type { BetaCheck } from '../types';

/** A single animal's page: /adopt/cat/[slug] and /adopt/dog/[slug]. */
export const animalChecks: readonly BetaCheck[] = [
	{
		id: 'animal_1',
		category: { uk: 'Дані', en: 'Facts' },
		text: {
			uk: 'Відкрийте сторінку тварини. Мусить бути п’ять рядків даних: стать, порода, вік, розмір, колір — і жоден із них не порожній.',
			en: 'Open an animal page. There must be five rows of facts — gender, breed, age, size, colour — and none of them empty.'
		},
		coverage: 'covered',
		test: 'src/lib/data/animals.test.ts'
	},
	{
		id: 'animal_2',
		category: { uk: 'Дані', en: 'Facts' },
		text: {
			uk: 'Знайдіть тварину, у якої в рядку статі написано «кастрований» або «стерилізована». Символ поруч мусить відповідати слову: ♂ для самця, ♀ для самиці.',
			en: 'Find an animal whose gender row says «castrated» or «spayed». The symbol beside it must agree with the word: ♂ for a male, ♀ for a female.'
		},
		coverage: 'covered',
		test: 'tests/ui.spec.ts'
	},
	{
		id: 'animal_3',
		category: { uk: 'Дані', en: 'Facts' },
		text: {
			uk: 'Порівняйте вік із тим самим на старому сайті на Google Sites (НЕ на adoptananimal.in.ua — це тепер адреса цього сайту). Числа мусять збігатися; вік «0 років» бути НЕ мусить ніде.',
			en: 'Compare the age with the same animal on the old Google Sites site (NOT adoptananimal.in.ua — that address is this site now). The numbers must agree, and no age may read «0 years».'
		},
		negative: true,
		coverage: 'manual'
	},
	{
		id: 'animal_4',
		category: { uk: 'Обране', en: 'Favourites' },
		text: {
			uk: 'Натисніть серце на сторінці тварини. Воно мусить залитися, а від нього до лічильника в шапці мусить полетіти маленьке серце.',
			en: 'Press the heart on the animal page. It must fill in, and a small heart must fly from it to the counter in the header.'
		},
		testid: 'detail-favorite-btn',
		coverage: 'covered',
		test: 'tests/favorites.spec.ts'
	},
	{
		id: 'animal_5',
		category: { uk: 'Перехід', en: 'Navigation' },
		text: {
			uk: 'Натисніть стрілку до наступної тварини кілька разів підряд. Кожного разу мусить відкриватися інша тварина того ж розділу — коти лишаються котами.',
			en: 'Press the arrow to the next animal several times. A different animal of the same section must open each time — cats stay cats.'
		},
		testid: 'next-animal-link',
		coverage: 'testable'
	},
	{
		id: 'animal_6',
		category: { uk: 'Перехід', en: 'Navigation' },
		text: {
			uk: 'Натисніть «Назад до котів» (або собак). Мусить відкритися список того самого розділу, а не головна.',
			en: 'Press «Back to cats» (or dogs). The list of that same section must open, not the home page.'
		},
		testid: 'back-to-cats-link',
		coverage: 'covered',
		test: 'tests/journey.spec.ts'
	},
	{
		id: 'animal_7',
		category: { uk: 'Історія', en: 'Story' },
		text: {
			uk: 'Прочитайте розповідь тварини українською, потім німецькою. Обидві мусять бути про цю саму тварину — переплутаних історій бути НЕ мусить.',
			en: 'Read the animal’s story in Ukrainian, then in German. Both must be about this same animal — no swapped stories.'
		},
		negative: true,
		coverage: 'manual'
	},
	{
		id: 'animal_8',
		category: { uk: 'Заявка', en: 'Application' },
		text: {
			uk: 'Натисніть кнопку заявки зі сторінки тварини. Ім’я цієї тварини мусить бути видно над формою.',
			en: 'Press the application button from an animal page. That animal’s name must be visible above the form.'
		},
		testid: 'apply-top-link',
		coverage: 'testable'
	}
];
