import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'partos',
	name: 'PARTOS',
	type: 'dog',
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
	age: {
		en: '4 years',
		uk: '4 роки',
		de: '4 Jahre',
		nl: '4 jaar'
	},
	size: {
		en: 'medium',
		uk: 'середній',
		de: 'mittel',
		nl: 'gemiddeld'
	},
	color: {
		en: 'black',
		uk: 'чорний',
		de: 'schwarz',
		nl: 'zwart'
	},
	image: '/images/animals/dog_partos.jpg'
};

export const description: Translations = {
	en: [
		'My name is Partos and I am a mixed breed dog.',
		"I lived for a long time in a position with the military, but it was time to move and they couldn't take me with them, so they brought me to the shelter.",
		'I am a great guard dog - always alert and ready to protect my beloved people. I am kind and friendly with them, I love to cuddle and play, especially if you are an active person like me.',
		'We could run together, walk in parks or just have fun. I am still working on it, but for now it is hard for me to be around other dogs. But I am a loyal and devoted friend to people.',
		"I am also very trainable and learn new commands quickly. I can't wait to find my new home!"
	],
	uk: [
		'Мене звати Партос, я — метис.',
		'Я довгий час жив на позиціях разом із військовими, але прийшов час передислокації, і вони не змогли взяти мене з собою, тому привезли до притулку.',
		'Я чудовий охоронець — завжди пильний і готовий захищати своїх улюблених людей. З ними я добрий і привітний, обожнюю обійми та ігри, особливо якщо ви така ж активна людина, як і я.',
		'Ми могли б разом бігати, гуляти в парках або просто веселитися. Я все ще працюю над цим, але поки що мені важко перебувати поруч з іншими собаками. Зате для людей я — вірний і відданий друг.',
		'Я також дуже добре піддаюся дресируванню і швидко вчу нові команди. Не можу дочекатися, коли знайду свій новий дім!'
	],
	de: [
		'Mein Name ist Partos und ich bin ein Mischlingshund.',
		'Ich habe lange Zeit mit dem Militär auf einem Stützpunkt gelebt, aber es war Zeit für eine Verlegung und sie konnten mich nicht mitnehmen, also brachten sie mich ins Tierheim.',
		'Ich bin ein großartiger Wachhund – immer wachsam und bereit, meine geliebten Menschen zu schützen. Ich bin gütig und freundlich zu ihnen, ich liebe es zu schmusen und zu spielen, besonders wenn du ein aktiver Mensch bist wie ich.',
		'Wir könnten zusammen rennen, in Parks spazieren gehen oder einfach nur Spaß haben. Ich bin auch sehr gelehrig und lerne neue Kommandos schnell. Ich kann es kaum erwarten, mein neues Zuhause zu finden!'
	],
	nl: [
		'Mijn naam is Partos en ik ben een gemengde rashond.',
		'Ik heb lange tijd op een post bij de militairen gewoond, maar het was tijd om te verhuizen en ze konden me niet meenemen, dus brachten ze me naar het asiel.',
		'Ik ben een geweldige waakhond - altijd alert en klaar om mijn geliefde mensen te beschermen. Ik ben lief en vriendelijk tegen hen, ik hou van knuffelen en spelen, vooral als je een actief persoon bent zoals ik.',
		"We zouden samen kunnen rennen, in parken wandelen of gewoon plezier maken. Ik ben ook erg trainbaar en leer snel nieuwe commando's. Ik kan niet wachten om mijn nieuwe thuis te vinden!"
	]
};
