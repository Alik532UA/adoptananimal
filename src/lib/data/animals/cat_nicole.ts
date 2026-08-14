import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'nicole',
	name: 'NICOLE',
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
		en: '1 year',
		uk: '1 рік',
		de: '1 Jahr',
		nl: '1 jaar'
	},
	size: {
		en: 'medium',
		uk: 'середній',
		de: 'mittel',
		nl: 'gemiddeld'
	},
	color: {
		en: 'grey tabby',
		uk: 'сірий смугастий',
		de: 'grau getigert',
		nl: 'grijze cyper'
	},
	image: '/images/animals/cat_nicole.jpg',
	// Nudged up so the ears stay in frame without stranding the cat at the top.
	imagePosition: '50% 20%'
};

export const description: Translations = {
	en: [
		'My name is Nicole and I am a mixed breed cat.',
		'My story is very simple. I was found on the road. I don’t really remember how exactly I ended up there, but what I can say for sure is that I was in the right place at the right time.',
		'The people who picked me up were just driving from the front line with a large evacuation of other cats and dogs as well. When they came up to me, they said: “Well, hello “little gray lump”! How can we leave you here? You, like everyone else, will go with us.”',
		'That’s how I ended up in the shelter. I quickly found friends here. I often look out the window and everyone tells me that I am very thoughtful. I will give all of myself to the one who takes me into his family.'
	],
	uk: [
		'Мене звати Ніколь, я — метис.',
		'Моя історія дуже проста. Мене знайшли на дорозі. Я не дуже пам’ятаю, як саме я там опинилася, але точно можу сказати, що я була в потрібному місці в потрібний час.',
		'Люди, які мене підібрали, якраз поверталися з передової, евакуюючи багато інших котів і собак. Коли вони підійшли до мене, то сказали: «Ну, привіт, «маленька сіра грудочка»! Як ми можемо залишити тебе тут? Ти, як і всі інші, поїдеш з нами».',
		'Так я опинилася в притулку. Я швидко знайшла тут друзів. Часто дивлюся у вікно, і всі кажуть, що я дуже задумлива. Я віддам усю себе тому, хто візьме мене у свою сім’ю.'
	],
	de: [
		'Mein Name ist Nicole und ich bin eine Mischlingskatze.',
		'Meine Geschichte ist sehr einfach. Ich wurde auf der Straße gefunden. Ich erinnere mich nicht mehr genau, wie ich dort gelandet bin, aber was ich mit Sicherheit sagen kann, ist, dass ich zur richtigen Zeit am richtigen Ort war.',
		'Die Leute, die mich aufgelesen haben, kamen gerade von der Frontlinie mit einer großen Evakuierung anderer Katzen und auch Hunde. Als sie auf mich zukamen, sagten sie: „Na, hallo ‚kleiner grauer Klumpen‘! Wie können wir dich hier lassen? Du fährst, wie alle anderen auch, mit uns mit.“',
		'So landete ich im Tierheim. Ich habe hier schnell Freunde gefunden. Ich schaue oft aus dem Fenster und alle sagen mir, dass ich sehr nachdenklich bin. Ich werde alles von mir demjenigen geben, der mich in seine Familie aufnimmt.'
	],
	nl: [
		'Mijn naam is Nicole en ik ben een gemengde raskat.',
		'Mijn verhaal is heel simpel. Ik werd op de weg gevonden. Ik herinner me niet echt hoe ik daar precies terecht ben gekomen, maar wat ik met zekerheid kan zeggen is dat ik op de juiste plaats op het juiste moment was.',
		'De mensen die me ophaalden waren net op weg van de frontlinie met een grote evacuatie van andere katten en honden. Toen ze naar me toe kwamen, zeiden ze: "Nou, hallo \'kleine grijze brok\'! Hoe kunnen we je hier achterlaten? Jij gaat, net als iedereen, met ons mee."',
		'Zo ben ik in het asiel terechtgekomen. Ik heb hier snel vrienden gevonden. Ik kijk vaak uit het raam en iedereen vertelt me dat ik heel bedachtzaam ben. Ik zal alles van mezelf geven aan degene die mij in zijn gezin opneemt.'
	]
};
