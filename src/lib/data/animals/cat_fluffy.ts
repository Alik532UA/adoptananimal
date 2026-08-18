import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'fluffy',
	name: 'FLUFFY',
	type: 'cat',
	isAdopted: false,
	gender: {
		en: 'male (castrated)',
		uk: 'самець (кастрований)',
		de: 'männlich (kastriert)',
		nl: 'mannetje (gecastreerd)'
	},
	breed: {
		en: 'mixed breed',
		uk: 'метис',
		de: 'Mischling',
		nl: 'gemengd ras'
	},
	// 1 year on 2025-07-09, the date on document 10.
	bornOn: '2024-07-09',
	size: {
		en: 'up to 4 kg',
		uk: 'до 4 кг',
		de: 'bis zu 4 kg',
		nl: 'tot 4 kg'
	},
	color: {
		en: 'grey-white',
		uk: 'сіро-білий',
		de: 'grau-weiß',
		nl: 'grijs-wit'
	},
	image: '/images/animals/cat_fluffy.jpg'
};

export const description: Translations = {
	en: [
		'My name is Fluffy and I am a mixed breed cat.',
		"I wasn't always homeless. Once upon a time, there was a farm. It was my world - full of warm hay, the smell of fresh bread from the kitchen and the cheerful company of cows, chickens, sheep and horses.",
		'But then everything changed. The "storm" came. The walls of my house collapsed, people left, the sounds of life disappeared, and in their place came silence, interrupted only by the creaking of broken beams in the wind or strong explosions.',
		'I stayed in the place that used to be my home. Completely alone. I hunted and drank water from puddles after the rain. Days imperceptibly turned into weeks. And each night became colder than the last.',
		'One day I saw them - strangers who were carefully walking among the rubble of my former home. They were looking for animals, calling them. Without thinking, I came out from under the collapsed roof and went straight to them.',
		'Now I am happy to spend time in the shelter. Here I always have the company of other cats and most importantly people. Everyone here says that I am very shy, but still I love companies. And I am sure that one day all my shyness will disappear when I find my family.'
	],
	uk: [
		'Мене звати Флаффі (Пухнаста), я — метис.',
		'Я не завжди була бездомною. Колись давно я жила на фермі. Це був мій світ — повний теплого сіна, запаху свіжого хліба з кухні та веселої компанії корів, курей, овець і коней.',
		'Але потім усе змінилося. Прийшов «шторм». Стіни мого будинку завалилися, люди пішли, звуки життя зникли, а на їхнє місце прийшла тиша, що переривалася лише скрипом зламаних балок на вітрі або потужними вибухами.',
		'Я залишилася там, де колись був мій дім. Зовсім одна. Я полювала і пила воду з калюж після дощу. Дні непомітно перетворювалися на тижні. І кожна ніч ставала холоднішою за попередню.',
		'Одного разу я побачила їх — незнайомців, які обережно йшли серед уламків мого колишнього дому. Вони шукали тварин, кликали їх. Не вагаючись, я вийшла з-під заваленого даху і пішла прямо до них.',
		'Зараз я щаслива бути в притулку. Тут у мене завжди є компанія інших котів і, головне, людей. Всі тут кажуть, що я дуже сором’язлива, але я все одно люблю компанію. І я впевнена, що одного разу вся моя сором’язливість зникне, коли я знайду свою сім’ю.'
	],
	de: [
		'Mein Name ist Fluffy und ich bin eine Mischlingskatze.',
		'Ich war nicht immer obdachlos. Es war einmal ein Bauernhof. Es war meine Welt – voll von warmem Heu, dem Geruch von frisch gebackenem Brot aus der Küche und der fröhlichen Gesellschaft von Kühen, Hühnern, Schafen und Pferden.',
		'Aber dann änderte sich alles. Der „Sturm“ kam. Die Mauern meines Hauses stürzten ein, die Menschen gingen, die Geräusche des Lebens verschwanden, und an ihre Stelle trat Stille.',
		'Ich blieb an dem Ort, der früher mein Zuhause war. Völlig allein. Ich jagte und trank Wasser aus Pfützen nach dem Regen. Die Tage vergingen unbemerkt und wurden zu Wochen. Und jede Nacht wurde kälter als die letzte.',
		'Eines Tages sah ich sie – fremde Menschen, die vorsichtig zwischen den Trümmern meines ehemaligen Zuhauses umhergingen. Sie suchten nach Tieren, riefen sie.',
		'Jetzt bin ich froh, Zeit im Tierheim zu verbringen. Hier habe ich immer die Gesellschaft anderer Katzen und vor allem Menschen.'
	],
	nl: [
		'Mijn naam is Fluffy en ik ben een gemengde raskat.',
		'Ik was niet altijd dakloos. Ooit was er een boerderij. Het was mijn wereld - vol warm hooi, de geur van vers brood uit de keuken en het vrolijke gezelschap van koeien, kippen, schapen en paarden.',
		'Maar toen veranderde alles. De "storm" kwam. De muren van mijn huis stortten in, de mensen vertrokken, de geluiden van het leven verdwenen, en in hun plaats kwam stilte.',
		'Ik bleef op de plek die vroeger mijn thuis was. Helemaal alleen. Ik jaagde en dronk water uit plassen na de regen. Dagen veranderden ongemerkt in weken. En elke nacht werd kouder dan de vorige.',
		'Op een dag zag ik hen - vreemden die voorzichtig tussen het puin van mijn voormalige huis liepen. Ze zochten naar dieren, riepen hen.',
		'Nu ben ik blij om tijd door te brengen in het asiel. Hier heb ik altijd het gezelschap van andere katten en vooral mensen.'
	]
};
