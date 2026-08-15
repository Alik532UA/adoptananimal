import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'carly',
	name: 'CARLY',
	type: 'dog',
	isAdopted: true,
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
		en: 'brown',
		uk: 'коричневий',
		de: 'braun',
		nl: 'bruin'
	},
	image: '/images/animals/dog_carly.jpg',
	imagePosition: '30% 50%'
};

export const description: Translations = {
	en: [
		'My name is Carly and I am a mixed breed dog.',
		'I was not alone when I came to the shelter, my brother Benny was with me. We were born in a very unusual place, in a destroyed tank, which became our home. It was very noisy and scary around, so this tank became the safest place for us.',
		'Despite all the difficulties that my brother and I have gone through, I really like to explore the world around me and I always want to run, play and learn something new.',
		"I'm still afraid of loud noises or strangers, so I need time to get used to it, but as soon as I understand that you are a friend, I will run to you first!",
		"I will be happy if the family that adopts me has a house with a garden where I can play and spend most of my time. I love open space and I don't like loneliness."
	],
	uk: [
		'Мене звати Карлі, я — метис.',
		'Я була не сама, коли потрапила до притулку, зі мною був мій брат Бенні. Ми народилися в дуже незвичайному місці — у зруйнованому танку, який став нашим домом. Навколо було дуже шумно і страшно, тому цей танк був для нас найбезпечнішим місцем.',
		'Попри всі труднощі, через які ми з братом пройшли, мені дуже подобається досліджувати світ навколо, я завжди хочу бігати, гратися і вчитися чомусь новому.',
		'Я все ще боюся гучних звуків або незнайомців, тому мені потрібен час, щоб звикнути, але як тільки я зрозумію, що ви друг — я прибіжу до вас першою!',
		'Я буду щаслива, якщо у сім’ї, яка мене всиновить, буде будинок із садком, де я зможу гратися і проводити більшу частину часу. Я люблю відкритий простір і не люблю самотності.'
	],
	de: [
		'Mein Name ist Carly und ich bin eine Mischlingshündin.',
		'Ich war nicht allein, als ich ins Tierheim kam, mein Bruder Benny war bei mir. Wir wurden an einem sehr ungewöhnlichen Ort geboren, in einem zerstörten Panzer, der unser Zuhause wurde. Es war sehr laut und gruselig um uns herum, so dass dieser Panzer der sicherste Ort für uns wurde.',
		'Trotz aller Schwierigkeiten, die mein Bruder und ich durchgemacht haben, erkunde ich sehr gerne die Welt um mich herum und möchte immer rennen, spielen und etwas Neues lernen.',
		'Ich habe immer noch Angst vor lauten Geräuschen oder Fremden, also brauche ich Zeit, um mich daran zu gewöhnen.'
	],
	nl: [
		'Mijn naam is Carly en ik ben een gemengde rashond.',
		'Ik was niet alleen toen ik naar het asiel kwam, mijn broer Benny was bij me. We zijn geboren op een heel ongebruikelijke plek, in een verwoeste tank, die ons thuis werd. Het was erg luidruchtig en eng om ons heen, dus deze tank werd de veiligste plek voor ons.',
		'Ondanks alle moeilijkheden die mijn broer en ik hebben doorgemaakt, hou ik er erg van om de wereld om me heen te verkennen en wil ik altijd rennen, spelen en iets nieuws leren.',
		'Ik ben nog steeds bang voor harde geluiden of vreemden, dus ik heb tijd nodig om eraan te wennen.'
	]
};
