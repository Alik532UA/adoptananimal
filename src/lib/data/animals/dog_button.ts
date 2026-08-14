import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'button',
	name: 'BUTTON',
	type: 'dog',
	isAdopted: true,
	gender: {
		en: 'female',
		uk: 'самка',
		de: 'weiblich',
		nl: 'vrouwtje'
	},
	breed: {
		en: 'Pomeranian Spitz',
		uk: 'померанський шпіц',
		de: 'Zwergspitz',
		nl: 'Dwergkees'
	},
	age: {
		en: '6 years',
		uk: '6 років',
		de: '6 Jahre',
		nl: '6 jaar'
	},
	size: {
		en: 'tiny',
		uk: 'мініатюрний',
		de: 'winzig',
		nl: 'zeer klein'
	},
	color: {
		en: 'orange',
		uk: 'orange',
		de: 'orange',
		nl: 'orange'
	},
	image: '/images/animals/dog_button.jpg'
};

export const description: Translations = {
	en: [
		'My name is Button and I am a Pomeranian Spitz.',
		'I was one of those who were saved from the front line. There I was part of illegal and uncontrolled breeding all my life, I lived in a very small cage with a lot of other dogs. All they wanted from me was my puppies, which were constantly taken away from me.',
		"In the end, I was abandoned in the middle of the war. Constant shelling, hunger and real fear engulfed us. After my rescue I learned that in this world, there are good people who don't need anything from me.",
		'I realized that life can be different. I also realized that I love to play with everyone around me, walk, ride in cars and that I am always ready for new adventures.',
		'I hope my family will find me very soon and despite my age and other problems that I went through, our hearts will stay together forever.'
	],
	uk: [
		'Мене звати Баттон (Ґудзик), я — померанський шпіц.',
		'Я була однією з тих, кого врятували з передової. Там я все життя була частиною нелегального розведення, жила в дуже маленькій клітці з купою інших собак. Все, чого від мене хотіли — це моїх цуценят, яких постійно забирали.',
		'Зрештою, мене покинули посеред війни. Постійні обстріли, голод і справжній жах охопили нас. Після порятунку я дізналася, що в цьому світі є добрі люди, яким від мене нічого не потрібно.',
		'Я зрозуміла, що життя може бути іншим. Також я зрозуміла, що обожнюю гратися з усіма навколо, гуляти, їздити в машинах і що я завжди готова до нових пригод.',
		'Сподіваюся, моя сім’я знайде мене дуже скоро, і попри мій вік та інші проблеми, через які я пройшла, наші серця залишаться разом назавжди.'
	],
	de: [
		'Mein Name ist Button und ich bin ein Zwergspitz.',
		'Ich war eine von denen, die von der Frontlinie gerettet wurden. Dort war ich mein ganzes Leben lang Teil einer illegalen und unkontrollierten Zucht und lebte in einem sehr kleinen Käfig mit vielen anderen Hunden. Alles, was sie von mir wollten, waren meine Welpen, die mir ständig weggenommen wurden.',
		'Am Ende wurde ich mitten im Krieg ausgesetzt. Ständiger Beschuss, Hunger und echte Angst verschlangen uns. Nach meiner Rettung erfuhr ich, dass es auf dieser Welt gute Menschen gibt, die nichts von mir brauchen.',
		'Ich habe gemerkt, dass das Leben anders sein kann. Ich habe auch gemerkt, dass ich es liebe, mit allen um mich herum zu spielen.'
	],
	nl: [
		'Mijn naam is Button en ik ben een Dwergkees.',
		"Ik was een van degenen die gered werden van de frontlinie. Daar maakte ik mijn hele leven deel uit van een illegale en ongecontroleerde fokkerij, ik leefde in een heel kleine kooi met veel andere honden. Alles wat ze van me wilden waren mijn puppy's, die constant bij me werden weggehaald.",
		'Uiteindelijk werd ik midden in de oorlog achtergelaten. Constante beschietingen, honger en echte angst overspoelden ons. Na mijn redding leerde ik dat er in deze wereld goede mensen zijn die niets van me nodig hebben.',
		'Ik realiseerde me dat het leven anders kan zijn. Ik realiseerde me ook dat ik ervan hou om met iedereen om me heen te spelen.'
	]
};
