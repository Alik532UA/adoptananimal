import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'tigress',
	name: 'TIGRESS',
	type: 'cat',
	isAdopted: true,
	gender: {
		en: 'female',
		uk: 'самка',
		de: 'weiblich',
		nl: 'vrouwtje'
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
		en: 'medium',
		uk: 'середній',
		de: 'mittel',
		nl: 'gemiddeld'
	},
	color: {
		en: 'tabby',
		uk: 'смугастий',
		de: 'getigert',
		nl: 'cyper'
	},
	image: '/images/animals/cat_tigress.jpg',
	// Nudged up so the ears stay in frame without stranding the cat at the top.
	imagePosition: '50% 20%'
};

export const description: Translations = {
	en: [
		'My name is Tigress and I am a mixed breed cat.',
		'I was born on the territory of a zoo. My mother knew people well and they gave her food. We grew up in a secluded place, but when we became older, she taught us not to be afraid of people.',
		'But one day everything changed. With the terrible sounds came chaos. I remember how all the life I knew disappeared step by step: people left, the zoo was partially evacuated, and my family disappeared.',
		'I was left completely alone. No people, no food. Only shelling. The zoo was almost empty, only a few animals remained in it, who, like me, did not lose hope.',
		'When I saw people\'s faces again, I was very happy. They said: "Wow! What a beauty you are! Just like a "little white tiger"!".',
		'After this evacuation I ended up in a shelter. I love being here. I know that one day I will be a wonderful pet and will give myself completely to the family that decides to adopt me.'
	],
	uk: [
		'Мене звати Тайгрес (Тигриця), я — метис.',
		'Я народилася на території зоопарку. Моя мама добре знала людей, і вони давали їй їжу. Ми росли в затишному місці, але коли подорослішали, вона навчила нас не боятися людей.',
		'Але одного дня все змінилося. З жахливими звуками прийшов хаос. Я пам’ятаю, як усе життя, яке я знала, зникало крок за кроком: люди йшли, зоопарк частково евакуювали, а моя родина зникла.',
		'Я залишилася зовсім одна. Жодних людей, жодної їжі. Лише обстріли. Зоопарк майже спорожнів, у ньому залишилося лише кілька тварин, які, як і я, не втрачали надії.',
		'Коли я знову побачила обличчя людей, я була дуже щаслива. Вони сказали: «Ого! Яка ти красуня! Прямо як «маленький білий тигр»!».',
		'Після цієї евакуації я опинилася в притулку. Мені тут дуже подобається. Я знаю, що одного дня стану чудовим домашнім улюбленцем і повністю віддамся сім’ї, яка вирішить мене всиновити.'
	],
	de: [
		'Mein Name ist Tigress und ich bin eine Mischlingskatze.',
		'Ich wurde auf dem Gelände eines Zoos geboren. Meine Mutter kannte die Menschen gut und sie gaben ihr Futter. Wir wuchsen an einem abgelegenen Ort auf, aber als wir älter wurden, brachte sie uns bei, keine Angst vor Menschen zu haben.',
		'Doch eines Tages änderte sich alles. Mit den schrecklichen Geräuschen kam das Chaos. Ich erinnere mich, wie das Leben, das ich kannte, Schritt für Schritt verschwand: Menschen gingen, der Zoo wurde teilweise evakuiert und meine Familie verschwand.',
		'Ich blieb völlig allein zurück. Keine Menschen, kein Essen. Nur Beschuss. Der Zoo war fast leer, nur wenige Tiere blieben zurück, die wie ich die Hoffnung nicht aufgaben.',
		'Als ich wieder Menschengesichter sah, war ich sehr glücklich. Sie sagten: „Wow! Was für eine Schönheit du bist! Genau wie ein „kleiner weißer Tiger“!“.',
		'Nach dieser Evakuierung landete ich in einem Tierheim. Ich liebe es, hier zu sein. Ich weiß, dass ich eines Tages ein wunderbares Haustier sein werde.'
	],
	nl: [
		'Mijn naam is Tigress en ik ben een gemengde raskat.',
		'Ik ben geboren op het terrein van een dierentuin. Mijn moeder kende de mensen goed en zij gaven haar eten. We groeiden op op een afgelegen plek, maar toen we ouder werden, leerde ze ons om niet bang te zijn voor mensen.',
		'Maar op een dag veranderde alles. Met de vreselijke geluiden kwam de chaos. Ik herinner me hoe het leven dat ik kende stap voor stap verdween: mensen vertrokken, de dierentuin werd gedeeltelijk geëvacueerd en mijn familie verdween.',
		'Ik bleef helemaal alleen achter. Geen mensen, geen eten. Alleen beschietingen. De dierentuin was bijna leeg, er bleven maar een paar dieren achter die, net als ik, de hoop niet verloren.',
		'Toen ik weer mensengezichten zag, was ik erg blij. Ze zeiden: "Wauw! Wat een schoonheid ben je! Net een "kleine witte tijger"!".',
		'Na deze evacuatie kwam ik in een asiel terecht. Ik hou ervan om hier te zijn. Ik weet dat ik op een dag een geweldig huisdier zal zijn.'
	]
};
