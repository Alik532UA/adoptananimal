import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'multik',
	name: "MUL'TIK",
	type: 'dog',
	isAdopted: true,
	gender: {
		en: 'male (castrated)',
		uk: 'самець (кастрований)',
		de: 'männlich (kastriert)',
		nl: 'mannetje (gecastreerd)'
	},
	breed: {
		en: 'Chihuahua',
		uk: 'чихуахуа',
		de: 'Chihuahua',
		nl: 'Chihuahua'
	},
	age: {
		en: '9 years',
		uk: '9 років',
		de: '9 Jahre',
		nl: '9 jaar'
	},
	size: {
		en: 'very small',
		uk: 'дуже малий',
		de: 'sehr klein',
		nl: 'zeer klein'
	},
	color: {
		en: 'white',
		uk: 'білий',
		de: 'weiß',
		nl: 'wit'
	},
	image: '/images/animals/dog_multik.jpg'
};

export const description: Translations = {
	en: [
		'My name is Mul’tik and I am a Chihuahua.',
		'I was rescued from a big illegal breeding farm in the Kharkiv direction. I lived in a very small cage all my life, with no care, no love, and no idea what a human touch was. In the end, we were abandoned in the middle of the war.',
		'After my rescue, I learned that there are kind people. They tell me that I am like an "anti-stress". I feel when someone has had a bad day, so I climb into their arms and can sit there for hours.',
		'I have a very unusual face and eyes. Despite my age, I am always ready for adventures and active time. I am ready to give my heart to a new family.'
	],
	uk: [
		'Мене звати Мультик, я — чихуахуа.',
		'Мене врятували з великої нелегальної ферми розведення на Харківському напрямку. Я все життя прожив у дуже маленькій клітці, без догляду, без любові й без жодного уявлення про те, що таке людський дотик. Зрештою, нас покинули посеред війни.',
		'Після порятунку я дізнався, що існують добрі люди. Мені кажуть, що я справжній «антистрес». Я відчуваю, коли у когось був важкий день, тому застрибую на руки і можу сидіти так годинами.',
		'У мене дуже незвичайна мордочка та очі. Попри мій вік, я завжди готовий до пригод та активного часу. Я готовий віддати своє серце новій сім’ї.'
	],
	de: [
		'Mein Name ist Mul’tik und ich bin ein Chihuahua.',
		'Ich wurde aus einer großen illegalen Zuchtfarm in der Region Charkiw gerettet. Ich habe mein ganzes Leben in einem sehr kleinen Käfig gelebt, ohne Pflege, ohne Liebe und ohne eine Vorstellung davon, was eine menschliche Berührung ist. Am Ende wurden wir mitten im Krieg ausgesetzt.',
		'Nach meiner Rettung habe ich gelernt, dass es gütige Menschen gibt. Man sagt mir, dass ich wie ein „Anti-Stress“-Mittel bin. Ich spüre, wenn jemand einen schlechten Tag hatte, also klettere ich auf seinen Arm und kann dort stundenlang sitzen.',
		'Ich habe ein sehr ungewöhnliches Gesicht und Augen. Trotz meines Alters bin ich immer bereit für Abenteuer und aktive Zeit.'
	],
	nl: [
		'Mijn naam is Mul’tik en ik ben een Chihuahua.',
		'Ik ben gered van een grote illegale fokkerij in de regio Charkov. Ik heb mijn hele leven in een heel kleine kooi geleefd, zonder zorg, zonder liefde, en zonder enig idee wat een menselijke aanraking was. Uiteindelijk werden we midden in de oorlog achtergelaten.',
		'Na mijn redding leerde ik dat er vriendelijke mensen zijn. Ze vertellen me dat ik als een "anti-stress" ben. Ik voel het als iemand een slechte dag heeft gehad, dus ik klim in hun armen en kan daar uren zitten.',
		'Ik heb een heel ongewoon gezicht en ogen. Ondanks mijn leeftijd ben ik altijd klaar voor avonturen en actieve tijd.'
	]
};
