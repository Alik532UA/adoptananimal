import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'shaggy',
	name: 'SHAGGY',
	type: 'dog',
	isAdopted: false,
	gender: {
		en: 'male',
		uk: 'самець',
		de: 'männlich',
		nl: 'mannetje'
	},
	breed: {
		en: 'mixed breed',
		uk: 'метис',
		de: 'Mischling',
		nl: 'gemengd ras'
	},
	age: {
		en: '3 years',
		uk: '3 роки',
		de: '3 Jahre',
		nl: '3 jaar'
	},
	size: {
		en: 'medium',
		uk: 'середній',
		de: 'mittel',
		nl: 'gemiddeld'
	},
	color: {
		en: 'grey',
		uk: 'сірий',
		de: 'grau',
		nl: 'grijs'
	},
	image: '/images/animals/dog_shaggy.jpg'
};

export const description: Translations = {
	en: [
		'My name is Shaggy and I am a mixed breed dog.',
		'I am one of the shyest dogs in the shelter. For a long time I did not know what a home and care were, because I spent most of my life on the street, without human care.',
		'I made one friend in the shelter, Chikita. We came to the shelter on the same day and went through a lot together. She is my best friend and next to her I feel a little more confident.',
		'I am already an adult, but despite this, I need an experienced owner who will be ready to accept all my fears and work on them. I will be grateful to you all my life if you help me find my place in this world.'
	],
	uk: [
		'Мене звати Шеггі (Кошлатий), я — метис.',
		'Я одна з найсором’язливіших собак у притулку. Довгий час я не знав, що таке дім і турбота, бо більшу частину життя провів на вулиці, без людського піклування.',
		'У притулку я знайшов одного друга — Чікіту. Ми потрапили сюди в один день і багато чого пройшли разом. Вона моя найкраща подруга, і поруч із нею я почуваюся трохи впевненіше.',
		'Я вже дорослий, але попри це мені потрібен досвідчений власник, який буде готовий прийняти всі мої страхи і працювати над ними. Я буду вдячний вам усе життя, якщо ви допоможете мені знайти своє місце в цьому світі.'
	],
	de: [
		'Mein Name ist Shaggy und ich bin ein Mischlingshund.',
		'Ich bin einer der schüchternsten Hunde im Tierheim. Lange Zeit wusste ich nicht, was ein Zuhause und Fürsorge sind, da ich den größten Teil meines Lebens auf der Straße verbracht habe, ohne menschliche Pflege.',
		'Ich habe im Tierheim eine Freundin gefunden, Chikita. Wir kamen am selben Tag ins Tierheim und haben gemeinsam viel durchgemacht. Sie ist meine beste Freundin und an ihrer Seite fühle ich mich ein wenig sicherer.',
		'Ich bin bereits erwachsen, aber trotzdem brauche ich einen erfahrenen Besitzer, der bereit ist, all meine Ängste zu akzeptieren und an ihnen zu arbeiten. Ich werde dir mein Leben lang dankbar sein, wenn du mir hilfst, meinen Platz in dieser Welt zu finden.'
	],
	nl: [
		'Mijn naam is Shaggy en ik ben een gemengde rashond.',
		'Ik ben een van de schuwste honden in het asiel. Lange tijd wist ik niet wat een thuis en zorg waren, omdat ik het grootste deel van mijn leven op straat heb doorgebracht, zonder menselijke zorg.',
		'Ik heb een vriendin gemaakt in het asiel, Chikita. We kwamen op dezelfde dag naar het asiel en hebben samen veel meegemaakt. Ze is mijn beste vriendin en naast haar voel ik me een beetje zelfverzekerder.',
		'Ik ben al volwassen, maar desondanks heb ik een ervaren eigenaar nodig die bereid is al mijn angsten te accepteren en eraan te werken. Ik zal je mijn hele leven dankbaar zijn als je me helpt mijn plek in deze wereld te vinden.'
	]
};
