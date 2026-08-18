import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'comet',
	name: 'COMET',
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
		en: 'black',
		uk: 'чорний',
		de: 'schwarz',
		nl: 'zwart'
	},
	image: '/images/animals/dog_comet.jpg',
	imagePosition: '30% 50%'
};

export const description: Translations = {
	en: [
		'My name is Comet and I am a mixed breed dog.',
		'I was rescued from the front line. It was very loud around and one day a rocket fell very close to me. I remember how everything was shaking, and then there was silence, which made it even scarier.',
		'Since then, I have learned to live in the shadows, trying not to attract attention to myself. I am very timid and cautious. Sometimes I want to approach people, but something inside stops me.',
		"I am indifferent to other dogs. The main thing is to just feel safe. People... I don't know how to treat them. Sometimes they seem kind, sometimes too scary.",
		"I really need someone who will show me patience and teach me to be braver. I need a little time to believe that this world may not be so scary. I'm waiting for someone who will show me what real care and love are."
	],
	uk: [
		'Мене звати Комет (Комета), я — метис.',
		'Мене врятували з передової. Навколо було дуже шумно, і одного разу зовсім поруч зі мною впала ракета. Я пам’ятаю, як усе здригалося, а потім настала тиша, від якої стало ще страшніше.',
		'З того часу я навчився жити в тіні, намагаючись не привертати до себе уваги. Я дуже боязкий і обережний. Іноді мені хочеться підійти до людей, але щось всередині мене зупиняє.',
		'Я байдужий до інших собак. Головне для мене — просто почуватися в безпеці. Люди... я не знаю, як до них ставитися. Іноді вони здаються добрими, іноді — занадто страшними.',
		'Мені дуже потрібен хтось, хто проявить терпіння і навчить мене бути сміливішим. Мені потрібно трохи часу, щоб повірити, що цей світ може бути не таким страшним. Я чекаю на того, хто покаже мені, що таке справжня турбота та любов.'
	],
	de: [
		'Mein Name ist Comet und ich bin ein Mischlingshund.',
		'Ich wurde von der Frontlinie gerettet. Es war sehr laut um mich herum und eines Tages fiel eine Rakete ganz in meine Nähe. Ich erinnere mich, wie alles bebte, und dann herrschte Stille, die es noch gruseliger machte.',
		'Seitdem habe ich gelernt, im Schatten zu leben und zu versuchen, keine Aufmerksamkeit auf mich zu ziehen. Ich bin sehr schüchtern und vorsichtig. Manchmal möchte ich auf Menschen zugehen, aber etwas in mir hält mich zurück.',
		'Ich brauche jemanden, der mir Geduld zeigt und mir beibringt, mutiger zu sein.'
	],
	nl: [
		'Mijn naam is Comet en ik ben een gemengde rashond.',
		'Ik werd gered van de frontlinie. Het was erg luidruchtig om me heen en op een dag viel er een raket vlakbij me. Ik herinner me hoe alles schudde, en toen was er stilte, wat het nog enger maakte.',
		'Sinds die tijd heb ik geleerd om in de schaduw te leven, waarbij ik probeerde geen aandacht op mezelf te vestigen. Ik ben erg timide en voorzichtig. Soms wil ik mensen benaderen, maar iets van binnen houdt me tegen.',
		'Ik heb echt iemand nodig die me geduld toont en me leert dapperder te zijn.'
	]
};
