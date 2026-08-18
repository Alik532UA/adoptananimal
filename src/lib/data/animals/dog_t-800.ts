import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 't-800',
	name: 'T-800',
	type: 'dog',
	isAdopted: true,
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
	// 1 year on 2025-03-31, the date on document 8.
	bornOn: '2024-03-31',
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
	image: '/images/animals/dog_t-800.jpg'
};

export const description: Translations = {
	en: [
		'My name is T-800 and I am a mixed breed dog.',
		'I was rescued from the front line of Kherson during a drone attack. My rescuers and I almost died that day, but everything worked out. I was found as a very small puppy, hungry, frozen and scared.',
		'Everyone tells me that I am one of the bravest puppies. I am not even afraid of injections! I am calm with other dogs and animals, not aggressive and ready for new friendships.',
		'I am ready to spend all my time with my person. I love when people play with me and pet me, I can lie in your arms all day long. I am looking forward to meeting my family.'
	],
	uk: [
		'Мене звати Т-800, я — метис.',
		'Мене врятували з передової на Херсонщині під час атаки дронів. Мої рятувальники і я мало не загинули того дня, але все обійшлося. Мене знайшли зовсім маленьким цуценям — голодним, замерзлим і наляканим.',
		'Всі кажуть, що я одне з найсміливіших цуценят. Я навіть уколів не боюся! Я спокійний з іншими собаками та тваринами, зовсім не агресивний і готовий до нової дружби.',
		'Я готовий проводити весь свій час зі своєю людиною. Обожнюю, коли зі мною граються і гладять мене, можу пролежати на руках цілий день. Я з нетерпінням чекаю на зустріч зі своєю сім’єю.'
	],
	de: [
		'Mein Name ist T-800 und ich bin ein Mischlingshund.',
		'Ich wurde während eines Drohnenangriffs von der Frontlinie bei Cherson gerettet. Meine Retter und ich wären an diesem Tag fast gestorben, aber alles ging gut aus. Ich wurde als ein sehr kleiner Welpe gefunden, hungrig, erfroren und verängstigt.',
		'Alle sagen mir, dass ich einer der mutigsten Welpen bin. Ich habe nicht einmal Angst vor Spritzen! Ich bin ruhig mit anderen Hunden und Tieren, nicht aggressiv und bereit für neue Freundschaften.',
		'Ich bin bereit, meine ganze Zeit mit meinem Menschen zu verbringen. Ich liebe es, wenn Menschen mit mir spielen und mich streicheln, ich kann den ganzen Tag auf deinem Arm liegen. Ich freue mich darauf, meine Familie kennenzulernen.'
	],
	nl: [
		'Mijn naam is T-800 en ik ben een gemengde rashond.',
		'Ik werd gered van de frontlinie van Cherson tijdens een drone-aanval. Mijn redders en ik stierven die dag bijna, maar alles liep goed af. Ik werd gevonden als een heel klein puppy, hongerig, bevroren en bang.',
		"Iedereen vertelt me dat ik een van de dapperste puppy's ben. Ik ben zelfs niet bang voor injecties! Ik ben rustig met andere honden en dieren, niet agressief en klaar voor nieuwe vriendschappen.",
		'Ik ben bereid om al mijn tijd met mijn persoon door te brengen. Ik hou ervan als mensen met me spelen en me aaien, ik kan de hele dag in je armen liggen. Ik kijk ernaar uit om mijn gezin te ontmoeten.'
	]
};
