import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'sirius',
	name: 'SIRIUS',
	type: 'cat',
	isAdopted: true,
	gender: {
		en: 'male (castrated)',
		uk: 'самець (кастрований)',
		de: 'männlich (kastriert)',
		nl: 'mannetje (gecastreerd)'
	},
	breed: {
		en: 'Russian Blue',
		uk: 'руська блакитна',
		de: 'Russisch Blau',
		nl: 'Russisch Blauw'
	},
	// 1 year on 2025-07-09, the date on document 10.
	bornOn: '2024-07-09',
	size: {
		en: 'up to 4 kg',
		uk: 'до 4 кг',
		de: 'bis zu 4 kg',
		nl: 'tot 4 kg'
	},
	color: {
		en: 'grey',
		uk: 'сірий',
		de: 'grau',
		nl: 'grijs'
	},
	image: '/images/animals/cat_sirius.jpg'
};

export const description: Translations = {
	en: [
		'My name is Sirius and I am a Russian Blue cat.',
		'I was a house kitten. I had a warm bed, a soft blanket, and most importantly, my brother Grey. But without any explanation, the people we loved simply carried us out into the street.',
		'We were left alone and had to learn to survive. We looked for food in trash cans, hid in basements and among ruins. Sometimes explosions sounded over the city, military equipment rumbled, and all this made our small world very scary.',
		'One day, the military found us. They accidentally saw us — two skinny gray cats huddled close to each other. They put down some food, held out their hand — and we didn’t run away.',
		"This is how we ended up in the shelter. It's warm and calm here. People say that I'm very affectionate, but a little more serious than my brother. I like to sit by the window and watch the world."
	],
	uk: [
		'Мене звати Сіріус, я — руська блакитна.',
		'Я був домашнім кошеням. У мене було тепле ліжко, м’яка ковдра і, головне, мій брат Грей. Але без жодних пояснень люди, яких ми любили, просто винесли нас на вулицю.',
		'Ми залишилися самі й мусили вчитися виживати. Шукали їжу в смітниках, ховалися в підвалах і серед руїн. Іноді над містом лунали вибухи, гуркотіла військова техніка, і все це робило наш маленький світ дуже страшним.',
		'Одного дня нас знайшли військові. Вони випадково побачили нас — двох худих сірих котів, що притиснулися один до одного. Вони поклали їжу, протягнули руку — і ми не втекли.',
		'Так ми потрапили до притулку. Тут тепло і спокійно. Люди кажуть, що я дуже ласкавий, але трохи серйозніший за свого брата. Я люблю сидіти біля вікна і спостерігати за світом.'
	],
	de: [
		'Mein Name ist Sirius und ich bin eine Russisch Blau Katze.',
		'Ich war ein Hauskätzchen. Ich hatte ein warmes Bett, eine weiche Decke und vor allem meinen Bruder Grey. Aber ohne jede Erklärung trugen uns die Leute, die wir liebten, einfach auf die Straße.',
		'Wir blieben allein zurück und mussten lernen zu überleben. Wir suchten nach Futter in Mülltonnen, versteckten uns in Kellern und Ruinen. Manchmal ertönten Explosionen über der Stadt, was unsere kleine Welt sehr beängstigend machte.',
		'Eines Tages fand uns das Militär. Sie sahen uns zufällig – zwei dünne graue Katzen, die eng aneinandergekauert waren. Sie stellten etwas Futter hin – und wir liefen nicht weg.',
		'So landeten wir im Tierheim. Es ist warm und ruhig hier. Die Leute sagen, dass ich sehr anhänglich bin.'
	],
	nl: [
		'Mijn naam is Sirius en ik ben een Russisch Blauwe kat.',
		'Ik was een huiskatje. Ik had een warm bed, een zachte deken, en vooral mijn broer Grey. Maar zonder enige uitleg droegen de mensen van wie we hielden ons gewoon naar buiten op straat.',
		'We bleven alleen achter en moesten leren overleven. We zochten naar eten in vuilnisbakken, schuilden in kelders en tussen ruïnes. Soms klonken er explosies boven de stad, wat onze kleine wereld erg eng maakte.',
		'Op een dag vond het leger ons. Ze zagen ons toevallig — twee magere grijze katten dicht tegen elkaar aan gekropen. Ze zetten wat eten neer — en we renden niet weg.',
		'Zo zijn we in het asiel terechtgekomen. Het is hier warm en rustig. Mensen zeggen dat ik erg aanhankelijk ben.'
	]
};
