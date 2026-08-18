import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'black-dog',
	name: 'BLACK',
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
		en: 'black',
		uk: 'чорний',
		de: 'schwarz',
		nl: 'zwart'
	},
	image: '/images/animals/dog_black-dog.jpg'
};

export const description: Translations = {
	en: [
		'My name is Black and I am a mixed breed dog.',
		'I was rescued from the front line. Everything around was thundering, and the world became scary and incomprehensible to me. People were running, hiding, and I was left alone, not knowing where to go and who to trust.',
		'Since then, I am afraid of everything: loud sounds, strangers, even sudden movements. I learned to hide, because this world is not always safe. I do not trust people because I do not know what to expect from them.',
		'I am calm with other dogs, they do not scare me, but I do not seek their friendship.',
		'Maybe one day I will understand that not all people cause pain. So I need an experienced owner who will show patience, care and can teach me not to be so afraid. I believe that somewhere there is a person who can help me see another, calmer world.'
	],
	uk: [
		'Мене звати Блек (Чорний), я — метис.',
		'Мене врятували з передової. Навколо все гриміло, і світ став для мене страшним і незрозумілим. Люди бігали, ховалися, а я залишився зовсім один, не знаючи, куди йти і кому довіряти.',
		'З того часу я боюся всього: гучних звуків, незнайомців, навіть різких рухів. Я навчився ховатися, бо цей світ не завжди безпечний. Я не довіряю людям, бо не знаю, чого від них чекати.',
		'Я спокійний з іншими собаками, вони мене не лякають, але я не шукаю їхньої дружби.',
		'Можливо, одного дня я зрозумію, що не всі люди завдають болю. Тому мені потрібен досвідчений власник, який проявить терпіння, турботу і зможе навчити мене не так сильно боятися. Вірю, що десь є людина, яка допоможе мені побачити інший, спокійніший світ.'
	],
	de: [
		'Mein Name ist Black und ich bin ein Mischlingshund.',
		'Ich wurde von der Frontlinie gerettet. Alles um mich herum donnerte, und die Welt wurde für mich gruselig und unverständlich. Die Menschen rannten und versteckten sich, und ich blieb allein zurück, ohne zu wissen, wohin ich gehen und wem ich vertrauen sollte.',
		'Seitdem habe ich vor allem Angst: laute Geräusche, Fremde, sogar plötzliche Bewegungen. Ich habe gelernt, mich zu verstecken, denn diese Welt ist nicht immer sicher. Ich vertraue Menschen nicht, weil ich nicht weiß, was ich von ihnen erwarten soll.',
		'Mit anderen Hunden bin ich ruhig, sie machen mir keine Angst, aber ich suche nicht ihre Freundschaft.'
	],
	nl: [
		'Mijn naam is Black en ik ben een gemengde rashond.',
		'Ik werd gered van de frontlinie. Alles om me heen denderde, en de wereld werd eng en onbegrijpelijk voor mij. Mensen renden, verstopten zich, en ik bleef alleen achter, niet wetend waar ik heen moest en wie ik kon vertrouwen.',
		'Sinds die tijd ben ik bang voor alles: harde geluiden, vreemden, zelfs plotselinge bewegingen. Ik heb geleerd me te verstoppen, want deze wereld is niet altijd veilig. Ik vertrouw mensen niet omdat ik niet weet wat ik van hen kan verwachten.',
		'Ik ben rustig met andere honden, ze maken me niet bang, maar ik zoek hun vriendschap niet.'
	]
};
