import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'leila',
	name: 'LEILA',
	type: 'dog',
	isAdopted: true,
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
	// 5 years on 2024-09-21, the date on document 4.
	bornOn: '2019-09-21',
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
	image: '/images/animals/dog_leila.jpg'
};

export const description: Translations = {
	en: [
		'My name is Leila and I am a mixed breed dog.',
		"I am a small and very affectionate girl. I love people very much. Everyone says that I am the most sociable dog in the shelter, and I guess that's true.",
		'Once upon a time I had a family. But one day something happened. There was shooting all around, people were screaming, and I was left alone, right in the war zone. I waited for a long time, thinking that they would come back, but this never happened.',
		'Kind people found me and brought me to the shelter. Since then I have been here, and every time someone enters our yard, I run to meet them, thinking that this person has come specifically for me.',
		"I can't stop believing that one day someone will come for me and take me home. I need to feel their warmth, see their smiles, and hear kind words. Only then can I be truly happy."
	],
	uk: [
		'Мене звати Лейла, я — метис.',
		'Я невелика і дуже лагідна дівчинка. Я дуже люблю людей. Всі кажуть, що я найбільш товариська собака в притулку, і, мабуть, це правда.',
		'Колись у мене була сім’я. Але одного дня щось сталося. Навколо стріляли, люди кричали, і я залишилася одна, прямо в зоні бойових дій. Я довго чекала, думаючи, що вони повернуться, але цього не сталося.',
		'Добрі люди знайшли мене і привезли до притулку. З того часу я тут, і щоразу, коли хтось заходить до нашого двору, я біжу назустріч, думаючи, що ця людина прийшла саме за мною.',
		'Я не можу перестати вірити, що одного дня хтось прийде за мною і забере мене додому. Мені потрібно відчувати їхнє тепло, бачити їхні посмішки та чути добрі слова. Тільки тоді я зможу бути по-справжньому щасливою.'
	],
	de: [
		'Mein Name ist Leila und ich bin eine Mischlingshündin.',
		'Ich bin ein kleines und sehr anhängliches Mädchen. Ich liebe Menschen sehr. Alle sagen, dass ich der geselligste Hund im Tierheim bin, und ich schätze, das stimmt.',
		'Früher hatte ich eine Familie. Aber eines Tages passierte etwas. Überall wurde geschossen, Menschen schrien, und ich blieb allein zurück, mitten im Kriegsgebiet. Ich habe lange gewartet, in der Hoffnung, dass sie zurückkommen würden.',
		'Gütige Menschen fanden mich und brachten mich ins Tierheim. Seitdem bin ich hier, und jedes Mal, wenn jemand unseren Hof betritt, renne ich ihm entgegen und denke, dass diese Person eigens für mich gekommen ist.',
		'Ich kann nicht aufhören zu glauben, dass eines Tages jemand für mich kommt und mich mit nach Hause nimmt. Ich muss ihre Wärme spüren, ihr Lächeln sehen und freundliche Worte hören.'
	],
	nl: [
		'Mijn naam is Leila en ik ben een gemengde rashond.',
		'Ik ben een klein en zeer aanhankelijk meisje. Ik hou heel veel van mensen. Iedereen zegt dat ik de meest sociale hond in het asiel ben, en ik vermoed dat dat waar is.',
		'Ooit had ik een gezin. Maar op een dag gebeurde er iets. Overal werd geschoten, mensen schreeuwden, en ik bleef alleen achter, midden in het oorlogsgebied. Ik heb lang gewacht, denkend dat ze terug zouden komen.',
		'Aardige mensen vonden me en brachten me naar het asiel. Sinds die tijd ben ik hier, en elke keer als er iemand ons erf opkomt, ren ik naar hen toe, denkend dat deze persoon speciaal voor mij is gekomen.',
		'Ik kan niet ophouden te geloven dat er op een dag iemand voor me zal komen en me mee naar huis zal nemen. Ik moet hun warmte voelen, hun glimlach zien en vriendelijke woorden horen.'
	]
};
