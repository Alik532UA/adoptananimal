import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'martin',
	name: 'MARTIN',
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
	age: {
		en: '1 year',
		uk: '1 рік',
		de: '1 Jahr',
		nl: '1 jaar'
	},
	size: {
		en: 'up to 4 kg',
		uk: 'до 4 кг',
		de: 'bis zu 4 kg',
		nl: 'tot 4 kg'
	},
	color: {
		en: 'black',
		uk: 'чорний',
		de: 'schwarz',
		nl: 'zwart'
	},
	image: '/images/animals/cat_martin.jpg',
	imagePosition: '0% 50%'
};

export const description: Translations = {
	en: [
		'My name is Martin and I am a mixed breed cat.',
		'My past is the front line, where every day began with the sound of explosions and ended the same way. I lived among destroyed houses, hid in basements and ate everything I could find. Life there was like waiting for the end.',
		'But one day everything changed. That day I heard a voice. Someone was calling animals like me, and the smell of food pulled me forward. I stood aside for a long time, hesitating. But hunger turned out to be stronger than fear.',
		'I came closer, and they stood quietly. They placed a bowl in front of me, and I carefully began to eat. When I was full, one of the people slowly extended his hand. Something flashed inside me: you can trust them. And I let myself be touched.',
		'Then I was brought to the shelter. And I am so grateful for that. It is calm and quiet, there is always food and people who are always kind to me. I hope that one day there will be a family who will give me a second chance.'
	],
	uk: [
		'Мене звати Мартін, я — метис.',
		'Моє минуле — це лінія фронту, де кожен день починався зі звуків вибухів і закінчувався так само. Я жив серед зруйнованих будинків, ховався в підвалах і їв усе, що міг знайти. Життя там було схоже на очікування кінця.',
		'Але одного разу все змінилося. Того дня я почув голос. Хтось кликав таких тварин, як я, і запах їжі потягнув мене вперед. Я довго стояв осторонь, вагаючись. Але голод виявився сильнішим за страх.',
		'Я підійшов ближче, а вони стояли тихо. Вони поставили переді мною миску, і я обережно почав їсти. Коли я наївся, один із людей повільно простягнув руку. Щось спалахнуло всередині мене: їм можна довіряти. І я дозволив до себе доторкнутися.',
		'Потім мене привезли до притулку. І я дуже вдячний за це. Тут спокійно і тихо, завжди є їжа і люди, які завжди добрі до мене. Сподіваюся, що одного дня знайдеться сім’я, яка дасть мені другий шанс.'
	],
	de: [
		'Mein Name ist Martin und ich bin eine Mischlingskatze.',
		'Meine Vergangenheit ist die Frontlinie, wo jeder Tag mit dem Geräusch von Explosionen begann und genauso endete. Ich lebte zwischen zerstörten Häusern, versteckte mich in Kellern und aß alles, was ich finden konnte. Das Leben dort war wie ein Warten auf das Ende.',
		'Aber eines Tages änderte sich alles. An diesem Tag hörte ich eine Stimme. Jemand rief Tiere wie mich, und der Geruch von Futter zog mich vorwärts. Ich stand lange abseits und zögerte. Aber der Hunger erwies sich als stärker als die Angst.',
		'Ich kam näher, und sie standen ganz ruhig da. Sie stellten einen Napf vor mich hin, und ich begann vorsichtig zu fressen. Als ich satt war, streckte einer der Menschen langsam seine Hand aus. Etwas blitzte in mir auf: Du kannst ihnen vertrauen. Und ich ließ mich berühren.',
		'Dann wurde ich ins Tierheim gebracht. Und ich bin so dankbar dafür. Es ist ruhig und friedlich, es gibt immer Futter und Menschen, die immer freundlich zu mir sind. Ich hoffe, dass es eines Tages eine Familie geben wird, die mir eine zweite Chance gibt.'
	],
	nl: [
		'Mijn naam is Martin en ik ben een gemengde raskat.',
		'Mijn verleden is de frontlinie, waar elke dag begon met het geluid van explosies en op dezelfde manier eindigde. Ik leefde tussen verwoeste huizen, schuilde in kelders en at alles wat ik kon vinden. Het leven daar was als wachten op het einde.',
		'Maar op een dag veranderde alles. Die dag hoorde ik een stem. Iemand riep dieren zoals ik, en de geur van eten trok me naar voren. Ik stond een lange tijd apart, aarzelend. Maar de honger bleek sterker dan de angst.',
		'Ik kwam dichterbij, en ze stonden daar rustig. Ze zetten een bakje voor me neer, en ik begon voorzichtig te eten. Toen ik vol zat, stak een van de mensen langzaam zijn hand uit. Er flitste iets in mij: je kunt hen vertrouwen. En ik liet me aanraken.',
		'Toen werd ik naar het asiel gebracht. En daar ben ik zo dankbaar voor. Het is er kalm en stil, er is altijd eten en mensen die altijd vriendelijk voor me zijn. Ik hoop dat er op een dag een gezin zal zijn dat me een tweede kans geeft.'
	]
};
