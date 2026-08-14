import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'gracie',
	name: 'GRACIE',
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
	age: {
		en: '1.4 years',
		uk: '1.4 роки',
		de: '1.4 Jahre',
		nl: '1.4 jaar'
	},
	size: {
		en: 'medium',
		uk: 'середній',
		de: 'mittel',
		nl: 'gemiddeld'
	},
	color: {
		en: 'brown',
		uk: 'коричневий',
		de: 'braun',
		nl: 'bruin'
	},
	image: '/images/animals/dog_gracie.jpg'
};

export const description: Translations = {
	en: [
		'My name is Gracie and I am a mixed breed dog.',
		'I was rescued in Bakhmut during heavy fighting on the front lines.',
		"I am the shyest dog in the shelter, it took me a long time to get used to the environment and I still get nervous around new people or those I haven't spent much time with.",
		'I am afraid of thunderstorms and any loud scary noises, so I need to find a home with a calm and relaxing atmosphere.',
		'I need an experienced owner who understands my behavior and will give me patience, time and space to adapt.',
		'Once I feel comfortable and learn to trust you, you will see a different side of me. I am sweet, loving, loyal and can be very playful.',
		'I like the company of other dogs, they give me confidence.'
	],
	uk: [
		'Мене звати Грейсі, я — метис.',
		'Мене врятували в Бахмуті під час запеклих боїв на передовій.',
		'Я найсором’язливіша собака в притулку. Мені знадобилося багато часу, щоб звикнути до оточення, і я досі нервую поруч із новими людьми або тими, з ким не проводила багато часу.',
		'Я боюся грози та будь-яких гучних лякаючих звуків, тому мені потрібно знайти дім зі спокійною та розслаблюючою атмосферою.',
		'Мені потрібен досвідчений власник, який розуміє мою поведінку і дасть мені терпіння, час і простір для адаптації.',
		'Як тільки я відчую себе комфортно і навчуся вам довіряти, ви побачите мене з іншого боку. Я мила, любляча, віддана і можу бути дуже грайливою.',
		'Мені подобається компанія інших собак, вони додають мені впевненості.'
	],
	de: [
		'Mein Name ist Gracie und ich bin eine Mischlingshündin.',
		'Ich wurde in Bachmut während schwerer Kämpfe an der Front gerettet. Ich bin der schüchternste Hund im Tierheim. Es hat lange gedauert, bis ich mich an die Umgebung gewöhnt habe, und ich bin immer noch nervös in der Nähe von neuen Menschen.',
		'Ich habe Angst vor Gewittern und allen lauten, gruseligen Geräuschen, daher muss ich ein Zuhause mit einer ruhigen Atmosphäre finden.',
		'Ich brauche einen erfahrenen Besitzer, der mein Verhalten versteht und mir Geduld, Zeit und Raum zur Anpassung gibt.',
		'Ich mag die Gesellschaft anderer Hunde, sie geben mir Vertrauen.'
	],
	nl: [
		'Mijn naam is Gracie en ik ben een gemengde rashond.',
		'Ik werd gered in Bakhmut tijdens hevige gevechten aan de frontlinie. Ik ben de schuwste hond in het asiel, het kostte me veel tijd om aan de omgeving te wennen en ik word nog steeds nerveus bij nieuwe mensen.',
		'Ik ben bang voor onweer en alle harde enge geluiden, dus ik moet een huis vinden met een rustige sfeer.',
		'Ik heb een ervaren eigenaar nodig die mijn gedrag begrijpt en me geduld, tijd en ruimte geeft om me aan te passen.',
		'Ik hou van het gezelschap van andere honden, zij geven me zelfvertrouwen.'
	]
};
