import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'starlet',
	name: 'STARLET',
	type: 'cat',
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
		en: '0.5 years',
		uk: '0.5 року',
		de: '0.5 Jahre',
		nl: '0.5 jaar'
	},
	size: {
		en: 'small',
		uk: 'малий',
		de: 'klein',
		nl: 'klein'
	},
	color: {
		en: 'grey and white',
		uk: 'сіро-білий',
		de: 'grau-weiß',
		nl: 'grijs-wit'
	},
	image: '/images/animals/cat_starlet.jpg',
	// Nudged up so the ears stay in frame without stranding the cat at the top.
	imagePosition: '50% 20%'
};

export const description: Translations = {
	en: [
		'My name is Starlet and I am a mixed breed cat.',
		'I heard a familiar call: "kitty, kitty!". And I remembered how my brothers, mom and I used to run to it. But one night, along with the first explosion, our family abandoned us, and after that, my mom and brothers disappeared somewhere.',
		"I was left completely alone, but it's good that this loneliness did not last long. When I ran to the familiar call, I ran into people with kind faces. They not only fed me, but also took me very far away from the explosions.",
		'At the shelter, everyone immediately loved me and said that I am one of the kindest kittens. I really love to play and spend time with people. I hope that one day I will be adopted by a person for whom I will become family.'
	],
	uk: [
		'Мене звати Старлет (Зірочка), я — метис.',
		'Я почула знайомий клич: «киць-киць!». І я згадала, як ми з братами та мамою бігли на нього. Але однієї ночі, разом із першим вибухом, наша сім’я покинула нас, а після цього кудись зникли мої мама та брати.',
		'Я залишилася зовсім одна, але добре, що ця самотність тривала недовго. Коли я побігла на знайомий клич, я натрапила на людей з добрими обличчями. Вони не тільки нагодували мене, а й відвезли дуже далеко від вибухів.',
		'У притулку мене всі відразу полюбили і сказали, що я одне з найдобріших кошенят. Я дуже люблю гратися і проводити час з людьми. Сподіваюся, що одного дня мене всиновить людина, для якої я стану сім’єю.'
	],
	de: [
		'Mein Name ist Starlet und ich bin eine Mischlingskatze.',
		'Ich hörte den vertrauten Ruf: „Miezi, Miezi!“. Und ich erinnerte mich, wie meine Brüder, meine Mama und ich früher darauf zugelaufen sind. Aber eines Nachts, zusammen mit der ersten Explosion, verließ uns unsere Familie, und danach verschwanden meine Mama und meine Brüder irgendwo.',
		'Ich blieb völlig allein zurück, aber es ist gut, dass diese Einsamkeit nicht lange dauerte. Als ich auf den vertrauten Ruf zulief, stieß ich auf Menschen mit gütigen Gesichtern. Sie fütterten mich nicht nur, sondern brachten mich auch weit weg von den Explosionen.',
		'Im Tierheim haben mich alle sofort liebgewonnen. Ich spiele sehr gerne und verbringe gerne Zeit mit Menschen. Ich hoffe, dass ich eines Tages von einer Person adoptiert werde, für die ich zur Familie werde.'
	],
	nl: [
		'Mijn naam is Starlet en ik ben een gemengde raskat.',
		'Ik hoorde de vertrouwde roep: "poesje, poesje!". En ik herinnerde me hoe mijn broertjes, mama en ik er altijd naartoe renden. Maar op een nacht, samen met de eerste explosie, liet ons gezin ons in de steek, en daarna verdwenen mijn mama en broertjes ergens.',
		'Ik bleef helemaal alleen achter, maar het is goed dat deze eenzaamheid niet lang duurde. Toen ik naar de vertrouwde roep rende, kwam ik mensen met vriendelijke gezichten tegen. Ze gaven me niet alleen te eten, maar namen me ook heel ver mee weg van de explosies.',
		'In het asiel hield iedereen meteen van me. Ik hou erg van spelen en tijd doorbrengen met mensen. Ik hoop dat ik op een dag zal worden geadopteerd door een persoon voor wie ik familie zal worden.'
	]
};
