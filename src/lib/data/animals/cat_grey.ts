import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'grey',
	name: 'GREY',
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
	image: '/images/animals/cat_grey.jpg',
	imagePosition: '70% 50%'
};

export const description: Translations = {
	en: [
		'My name is Grey and I am a Russian Blue cat.',
		'Once upon a time I was a house kitten. I had a warm corner, a soft bed and my beloved brother Sirius. But one day everything changed. The people I knew abandoned us. My brother and I were simply carried out and left outside the gate.',
		'We waited for a long time near the house, hoping that it was a mistake, but this did not happen. We had to experience terrible things, there were many explosions, tanks, endless pain and fear.',
		'But one day we were spotted by some soldiers. They saw us purely by chance - two gray cats curled up in the shadow of a concrete slab. One of them sat down and said: "You are just babies...".',
		"That's how the two of us ended up in the shelter. Despite everything, my brother and I have not stopped loving people. For us, their attention remains the main thing and we simply adore spending time with them."
	],
	uk: [
		'Мене звати Грей (Сірий), я — руська блакитна.',
		'Колись я був домашнім кошеням. У мене був теплий куточок, м’яке ліжко і мій улюблений брат Сіріус. Але одного разу все змінилося. Люди, яких я знав, покинули нас. Мене з братом просто винесли і залишили за воротами.',
		'Ми довго чекали біля будинку, сподіваючись, що це помилка, але цього не сталося. Нам довелося пережити жахливі речі: було багато вибухів, танків, нескінченний біль і страх.',
		'Але одного дня нас помітили солдати. Вони побачили нас чисто випадково — двоє сірих котів, що згорнулися в тіні бетонної плити. Один із них присів і сказав: «Ви ж зовсім малюки...».',
		'Так ми обоє опинилися в притулку. Попри все, ми з братом не перестали любити людей. Для нас їхня увага залишається головним, і ми просто обожнюємо проводити з ними час.'
	],
	de: [
		'Mein Name ist Grey und ich bin eine Russisch Blau Katze.',
		'Früher war ich ein Hauskätzchen. Ich hatte eine warme Ecke, ein weiches Bett und meinen geliebten Bruder Sirius. Aber eines Tages änderte sich alles. Die Leute, die ich kannte, verließen uns. Mein Bruder und ich wurden einfach hinausgetragen und vor dem Tor stehen gelassen.',
		'Wir warteten lange in der Nähe des Hauses und hofften, dass es ein Fehler war, aber das geschah nicht. Wir mussten schreckliche Dinge erleben, es gab viele Explosionen, Panzer, endlosen Schmerz und Angst.',
		'Doch eines Tages wurden wir von einigen Soldaten entdeckt. Sie sahen uns rein zufällig – zwei graue Katzen, die sich im Schatten einer Betonplatte zusammengekauert hatten. Einer von ihnen setzte sich hin und sagte: „Ihr seid doch noch Babys...“.',
		'So landeten wir beide im Tierheim. Trotz allem haben mein Bruder und ich nicht aufgehört, Menschen zu lieben. Für uns bleibt ihre Aufmerksamkeit das Wichtigste und wir lieben es einfach, Zeit mit ihnen zu verbringen.'
	],
	nl: [
		'Mijn naam is Grey en ik ben een Russisch Blauwe kat.',
		'Ooit was ik een huiskatje. Ik had een warm hoekje, een zacht bed en mijn geliefde broer Sirius. Maar op een dag veranderde alles. De mensen die ik kende lieten ons in de steek. Mijn broer en ik werden gewoon naar buiten gedragen en voor de poort achtergelaten.',
		'We hebben lang in de buurt van het huis gewacht, in de hoop dat het een vergissing was, maar dat gebeurde niet. We hebben verschrikkelijke dingen meegemaakt, er waren veel explosies, tanks, eindeloze pijn en angst.',
		'Maar op een dag werden we opgemerkt door een paar soldaten. Ze zagen ons puur toevallig - twee grijze katten die in de schaduw van een betonplaat in elkaar gedoken zaten. Een van hen ging zitten en zei: "Jullie zijn nog maar baby\'s...".',
		'Zo zijn we allebei in het asiel terechtgekomen. Ondanks alles zijn mijn broer en ik niet opgehouden van mensen te houden. Voor ons blijft hun aandacht het belangrijkste en we houden er gewoon van om tijd met hen door te brengen.'
	]
};
