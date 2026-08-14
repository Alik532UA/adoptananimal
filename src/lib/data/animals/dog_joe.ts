import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'joe',
	name: 'JOE',
	type: 'dog',
	isAdopted: false,
	gender: {
		en: 'male',
		uk: 'самець',
		de: 'männlich',
		nl: 'mannetje'
	},
	breed: {
		en: 'mixed breed',
		uk: 'метис',
		de: 'Mischling',
		nl: 'gemengd ras'
	},
	age: {
		en: '2 years',
		uk: '2 роки',
		de: '2 Jahre',
		nl: '2 jaar'
	},
	size: {
		en: 'large',
		uk: 'великий',
		de: 'groß',
		nl: 'groot'
	},
	color: {
		en: 'black and white',
		uk: 'чорно-білий',
		de: 'schwarz-weiß',
		nl: 'zwart-wit'
	},
	image: '/images/animals/dog_joe.jpg'
};

export const description: Translations = {
	en: [
		'My name is Joe and I am a mixed breed dog.',
		'I was rescued from the front line in the Kherson region during a drone attack. I was wandering in a village, in complete emptiness among the rubble of houses. My paws had been bleeding for a long time, but I didn’t stop running.',
		'A drone was following me constantly. I learned that what was happening to me was called "dog war hunting" - when drones specifically target animals for fun. But fortunately, a girl appeared and helped me escape.',
		"Now I'm in a shelter and I'm so grateful. Here I always have delicious food, care, and friends to play with. I learn quickly and love to complete tasks. I believe that one day I will find people I can completely trust."
	],
	uk: [
		'Мене звати Джо, я — метис.',
		'Мене врятували з передової на Херсонщині під час атаки дронів. Я блукав селом, у цілковитій порожнечі серед руїн будинків. Мої лапи давно були в крові, але я не припиняв бігти.',
		'Дрон переслідував мене постійно. Згодом я дізнався, що те, що зі мною відбувалося, люди називають «військовим полюванням на собак» — коли дрони спеціально цілять у тварин заради забави. Але, на щастя, з’явилася дівчина і допомогла мені втекти.',
		'Зараз я в притулку і дуже вдячний за це. Тут у мене завжди є смачна їжа, догляд і друзі для ігор. Я швидко вчуся і люблю виконувати завдання. Вірю, що одного дня знайду людей, яким зможу повністю довіряти.'
	],
	de: [
		'Mein Name ist Joe und ich bin ein Mischlingshund.',
		'Ich wurde während eines Drohnenangriffs von der Frontlinie in der Region Cherson gerettet. Ich wanderte in einem Dorf umher, in völliger Leere zwischen den Trümmern von Häusern. Meine Pfoten bluteten schon lange, aber ich hörte nicht auf zu rennen.',
		'Eine Drohne folgte mir ständig. Ich erfuhr, dass das, was mir passierte, „Hundekriegsjagd“ genannt wurde – wenn Drohnen gezielt Tiere zum Spaß ins Visier nehmen. Aber zum Glück tauchte ein Mädchen auf und half mir zu entkommen.',
		'Jetzt bin ich in einem Tierheim und so dankbar. Hier habe ich immer leckeres Futter, Fürsorge und Freunde zum Spielen.'
	],
	nl: [
		'Mijn naam is Joe en ik ben een gemengde rashond.',
		'Ik werd gered van de frontlinie in de regio Kherson tijdens een drone-aanval. Ik dwaalde door een dorp, in volledige leegte tussen het puin van huizen. Mijn pootjes bloedden al een hele tijd, maar ik stopte niet met rennen.',
		'Een drone volgde me constant. Ik leerde dat wat er met mij gebeurde "dog war hunting" werd genoemd - wanneer drones specifiek op dieren mikken voor de lol. Maar gelukkig verscheen er een meisje en hielp me ontsnappen.',
		'Nu ben ik in een asiel en ik ben zo dankbaar. Hier heb ik altijd heerlijk eten, zorg en vrienden om mee te spelen.'
	]
};
