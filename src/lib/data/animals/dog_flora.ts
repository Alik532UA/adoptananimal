import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'flora',
	name: 'FLORA',
	type: 'dog',
	isAdopted: false,
	gender: {
		en: 'female (spayed)',
		uk: 'самка (стерилізована)',
		de: 'weiblich (sterilisiert)',
		nl: 'vrouwtje (gesteriliseerd)'
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
		en: 'white',
		uk: 'білий',
		de: 'weiß',
		nl: 'wit'
	},
	image: '/images/animals/dog_flora.jpg'
};

export const description: Translations = {
	en: [
		'My name is Flora and I am a mixed breed dog.',
		'My sister Vira and I were rescued from the front line in the Kherson area. On the day of our rescue, our car was attacked by a drone during the evacuation, but fortunately everyone survived.',
		'All I remember before my rescue is only the terrible noise from the explosions and unbearable hunger. My sister replaced my mother and gave me all her warmth to help me survive.',
		'I am shy, but I am very kind. Some things or new steps can still scare me, but I am just learning. I am still a puppy, but I know that if someone is ready to adopt me, I will give them all my love.'
	],
	uk: [
		'Мене звати Флора, я — метис.',
		'Ми з моєю сестрою Вірою були врятовані з передової на Херсонщині. У день нашого порятунку наш автомобіль був атакований дроном під час евакуації, але, на щастя, всі вижили.',
		'Усе, що я пам’ятаю до порятунку — це лише жахливий гуркіт вибухів і нестерпний голод. Моя сестра замінила мені маму і віддавала мені все своє тепло, щоб я могла вижити.',
		'Я сором’язлива, але дуже добра. Деякі речі або нові кроки все ще можуть мене лякати, але я тільки вчуся. Я ще цуценя, але знаю: якщо хтось вирішить мене всиновити, я віддам йому всю свою любов.'
	],
	de: [
		'Mein Name ist Flora und ich bin eine Mischlingshündin.',
		'Meine Schwester Vira und ich wurden an der Frontlinie im Gebiet Cherson gerettet. Am Tag unserer Rettung wurde unser Auto während der Evakuierung von einer Drohne angegriffen, aber zum Glück haben alle überlebt.',
		'Alles, woran ich mich vor meiner Rettung erinnere, ist nur der schreckliche Lärm von den Explosionen und unerträglicher Hunger. Meine Schwester ersetzte meine Mutter und gab mir all ihre Wärme, um mir beim Überleben zu helfen.',
		'Ich bin schüchtern, aber ich bin sehr gütig. Einige Dinge oder neue Schritte können mich immer noch erschrecken, aber ich lerne gerade erst.'
	],
	nl: [
		'Mijn naam is Flora en ik ben een gemengde rashond.',
		'Mijn zus Vira en ik werden gered van de frontlinie in het Cherson-gebied. Op de dag van onze redding werd onze auto aangevallen door een drone tijdens de evacuatie, maar gelukkig overleefde iedereen.',
		'Alles wat ik me herinner voor mijn redding is alleen het vreselijke lawaai van de explosies en ondraaglijke honger. Mijn zus verving mijn moeder en gaf me al haar warmte om me te helpen overleven.',
		'Ik ben verlegen, maar ik ben heel lief. Sommige dingen of nieuwe stappen kunnen me nog steeds afschrikken, maar ik ben nog aan het leren.'
	]
};
