import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'jessie',
	name: 'JESSIE',
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
		en: 'small',
		uk: 'малий',
		de: 'klein',
		nl: 'klein'
	},
	color: {
		en: 'brown',
		uk: 'коричневий',
		de: 'braun',
		nl: 'bruin'
	},
	image: '/images/animals/dog_jessie.jpg'
};

export const description: Translations = {
	en: [
		'My name is Jessie and I am a mixed breed dog.',
		'I was rescued by the military from one of their points where it was very noisy and scary.',
		'I am still learning to trust people, so I am still often afraid of strangers and bark to protect myself, but this is just my little armor.',
		'But I am very comfortable in the company of other dogs, with them I feel more confident. So I am always happy with such companies.',
		'I need experienced owners. However, I am sure that if you are ready to work with me and show that the world is not so scary, I can become your faithful friend.'
	],
	uk: [
		'Мене звати Джессі, я — метис.',
		'Мене врятували військові з однієї зі своїх позицій, де було дуже шумно і страшно.',
		'Я все ще вчуся довіряти людям, тому часто боюсь незнайомців і гавкаю, щоб захистити себе, але це лише мій маленький захисний панцир.',
		'Проте мені дуже комфортно в компанії інших собак, з ними я почуваюся впевненіше. Тому я завжди рада такій компанії.',
		'Мені потрібні досвідчені господарі. Однак я впевнена, що якщо ви готові працювати зі мною і показати, що світ не такий страшний, я зможу стати вашим вірним другом.'
	],
	de: [
		'Mein Name ist Jessie und ich bin eine Mischlingshündin.',
		'Ich wurde vom Militär an einem ihrer Stützpunkte gerettet, wo es sehr laut und beängstigend war.',
		'Ich lerne immer noch, Menschen zu vertrauen, deshalb habe ich oft noch Angst vor Fremden und belle, um mich zu schützen, aber das ist nur mein kleiner Panzer. Aber in der Gesellschaft anderer Hunde fühle ich mich sehr wohl, mit ihnen fühle ich mich sicherer.',
		'Ich brauche erfahrene Besitzer. Wenn du bereit bist, mit mir zu arbeiten, kann ich dein treuer Freund werden.'
	],
	nl: [
		'Mijn naam is Jessie en ik ben een gemengde rashond.',
		'Ik ben door het leger gered van een van hun posten waar het erg luidruchtig en eng was.',
		'Ik leer nog steeds om mensen te vertrouwen, dus ik ben nog vaak bang voor vreemden en blaf om mezelf te beschermen, maar dit is gewoon mijn kleine harnas. In het gezelschap van andere honden voel ik me echter zeer op mijn gemak, bij hen voel ik me zelfverzekerder.',
		'Ik heb ervaren eigenaren nodig. Als je bereid bent om met me te werken, kan ik je trouwe vriend worden.'
	]
};
