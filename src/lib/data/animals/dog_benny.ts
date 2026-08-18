import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'benny',
	name: 'BENNY',
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
	// 1.4 years on 2024-09-21, the date on document 4.
	bornOn: '2023-05-21',
	size: {
		en: 'large',
		uk: 'великий',
		de: 'groß',
		nl: 'groot'
	},
	color: {
		en: 'brown',
		uk: 'коричневий',
		de: 'braun',
		nl: 'bruin'
	},
	image: '/images/animals/dog_benny.jpg'
};

export const description: Translations = {
	en: [
		'My name is Benny and I am a mixed breed dog.',
		'I was found in a destroyed tank in a war zone. My sister Carly and I took refuge inside this huge thing when it was very loud around us. Since then, fear has been a part of my life. I grew up listening to the rumble and noise, so I learned to hide.',
		'So I am very timid and afraid of many things, but if you are patient with me, I can change. I just need time to get used to a new person, to understand that I will be okay.',
		'I really want to be around people, but sometimes fear is stronger than me. I try to watch my sister and learn to be a little braver.',
		'I am sure that if you show me care and patience, we can become friends, and I will become your faithful friend. Just give me a chance.'
	],
	uk: [
		'Мене звати Бенні, я — метис.',
		'Мене знайшли у зруйнованому танку в зоні бойових дій. Ми з моєю сестрою Карлі ховалися всередині цієї величезної штуки, коли навколо було дуже шумно. З того часу страх став частиною мого життя. Я ріс під гуркіт і шум, тому навчився ховатися.',
		'Я дуже боязкий і багато чого боюся, але якщо ви будете терплячі зі мною, я зможу змінитися. Мені просто потрібен час, щоб звикнути до нової людини, щоб зрозуміти, що я в безпеці.',
		'Я дуже хочу бути поруч із людьми, але іноді страх сильніший за мене. Я намагаюся спостерігати за сестрою і вчуся бути трохи сміливішим.',
		'Я впевнений, що якщо ви проявите турботу та терпіння, ми зможемо стати друзями, і я стану вашим вірним супутником. Просто дайте мені шанс.'
	],
	de: [
		'Mein Name ist Benny und ich bin ein Mischlingshund.',
		'Ich wurde in einem zerstörten Panzer in einem Kriegsgebiet gefunden. Meine Schwester Carly und ich suchten darin Zuflucht, als es um uns herum sehr laut war. Seitdem ist die Angst ein Teil meines Lebens. Ich bin mit dem Grollen und Lärm aufgewachsen, also habe ich gelernt, mich zu verstecken.',
		'Ich bin sehr schüchtern und habe vor vielen Dingen Angst, aber wenn man geduldig mit mir ist, kann ich mich ändern. Ich brauche nur Zeit, um mich an eine neue Person zu gewöhnen.',
		'Ich möchte wirklich gerne bei Menschen sein, aber manchmal ist die Angst stärker als ich. Ich versuche, meine Schwester zu beobachten und zu lernen, ein wenig mutiger zu sein.'
	],
	nl: [
		'Mijn naam is Benny en ik ben een gemengde rashond.',
		'Ik werd gevonden in een verwoeste tank in een oorlogsgebied. Mijn zus Carly en ik zochten onderdak daarin toen het erg luidruchtig om ons heen was. Sindsdien is angst een deel van mijn leven. Ik ben opgegroeid met het luisteren naar het gerommel en lawaai, dus ik heb geleerd me te verstoppen.',
		'Ik ben erg schuw en bang voor veel dingen, maar als je geduldig met me bent, kan ik veranderen. Ik heb gewoon tijd nodig om aan een nieuw persoon te wennen.',
		'Ik wil heel graag bij mensen zijn, maar soms is angst sterker dan ik. Ik probeer naar mijn zus te kijken en te leren een beetje dapperder te zijn.'
	]
};
