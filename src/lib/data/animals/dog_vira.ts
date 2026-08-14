import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'vira',
	name: 'VIRA',
	type: 'dog',
	isAdopted: false,
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
		en: 'black and brown',
		uk: 'чорно-коричневий',
		de: 'schwarz-braun',
		nl: 'zwart-bruin'
	},
	image: '/images/animals/dog_vira.jpg'
};

export const description: Translations = {
	en: [
		'My name is Vira and I am a mixed breed dog.',
		'My sister Flora and I were rescued from the front line in the Kherson area. We knew only terrible fear and hunger. On the day of our rescue, a drone attacked our car, but we survived.',
		'I remember we were very exhausted and could hardly move from the cold. We are very grateful to be in a safe place now. At the shelter, I can find a common language with any dog or stand up for myself if needed.',
		'I have character and perseverance. I will follow my person anywhere - to the high mountains or even into space. I will be there to support and help my loving person with everything I can.'
	],
	uk: [
		'Мене звати Віра, я — метис.',
		'Ми з моєю сестрою Флорою були врятовані з передової на Херсонщині. Там ми знали лише жахливий страх і голод. У день нашого порятунку дрон атакував наш автомобіль, але ми вижили.',
		'Я пам’ятаю, що ми були дуже виснажені й ледь могли рухатися від холоду. Ми дуже вдячні за те, що зараз перебуваємо в безпеці. У притулку я можу знайти спільну мову з будь-яким собакою або постояти за себе, якщо потрібно.',
		'У мене є характер і наполегливість. Я піду за своєю людиною куди завгодно — хоч у високі гори, хоч у космос. Я буду поруч, щоб підтримати й допомогти своїй коханій людині всім, чим зможу.'
	],
	de: [
		'Mein Name ist Vira und ich bin eine Mischlingshündin.',
		'Meine Schwester Flora und ich wurden an der Frontlinie im Gebiet Cherson gerettet. Wir kannten nur schreckliche Angst und Hunger. Am Tag unserer Rettung griff eine Drohne unser Auto an, aber wir überlebten.',
		'Ich erinnere mich, dass wir sehr erschöpft waren und uns vor Kälte kaum bewegen konnten. Wir sind sehr dankbar, jetzt an einem sicheren Ort zu sein. Im Tierheim kann ich mit jedem Hund eine gemeinsame Sprache finden oder mich bei Bedarf wehren.',
		'Ich habe Charakter und Ausdauer. Ich werde meinem Menschen überallhin folgen – bis in die hohen Berge oder sogar in den Weltraum. Ich werde da sein, um meinen geliebten Menschen mit allem, was ich kann, zu unterstützen und ihm zu helfen.'
	],
	nl: [
		'Mijn naam is Vira en ik ben een gemengde rashond.',
		'Mijn zus Flora en ik werden gered van de frontlinie in het Cherson-gebied. We kenden alleen verschrikkelijke angst en honger. Op de dag van onze redding viel een drone onze auto aan, maar we overleefden het.',
		'Ik herinner me dat we erg uitgeput waren en ons nauwelijks konden bewegen van de kou. We zijn erg dankbaar dat we nu op een veilige plek zijn. In het asiel kan ik met elke hond een gemeenschappelijke taal vinden of voor mezelf opkomen als dat nodig is.',
		'Ik heb karakter en doorzettingsvermogen. Ik zal mijn persoon overal volgen - naar de hoge bergen of zelfs naar de ruimte. Ik zal er zijn om mijn liefhebbende persoon te steunen en te helpen met alles wat ik kan.'
	]
};
