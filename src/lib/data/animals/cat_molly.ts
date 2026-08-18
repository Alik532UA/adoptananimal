import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'molly',
	name: 'MOLLY',
	type: 'cat',
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
	// 1 year on 2025-07-09, the date on document 10.
	bornOn: '2024-07-09',
	size: {
		en: 'up to 4 kg',
		uk: 'до 4 кг',
		de: 'bis zu 4 kg',
		nl: 'tot 4 kg'
	},
	color: {
		en: 'tricolor',
		uk: 'триколірний',
		de: 'dreifarbig',
		nl: 'driekleurig'
	},
	image: '/images/animals/cat_molly.jpg'
};

export const description: Translations = {
	en: [
		'My name is Molly and I am a mixed breed cat.',
		'My past is connected to the earth and dampness of the trench, where my sister and I found ourselves completely alone. Every day my sister and I survived and huddled together, trying not to listen to the thunder of the sky above us.',
		'I think I will remember the day when the soldiers descended into our trench forever. The light of a flashlight, heavy steps... they shared canned food and water with us, and we shared our cat warmth with them.',
		'But then the time came to leave. They carried us out of this darkness and took us to a shelter. Now we live in safety, among other rescued animals.',
		"It's quiet here, I always have a bowl, a soft place to sleep, my sister is nearby, and most importantly, we no longer hear the sounds of war. And one day we will find our forever home."
	],
	uk: [
		'Мене звати Моллі, я — метис.',
		'Моє минуле пов’язане з землею та вогкістю окопу, де ми з сестрою опинилися зовсім самі. Кожен день ми з сестрою виживали і тулилися одна до одної, намагаючись не слухати гуркіт неба над нами.',
		'Я думаю, що назавжди запам’ятаю день, коли солдати спустилися в наш окоп. Світло ліхтарика, важкі кроки... вони ділилися з нами консервами та водою, а ми ділилися з ними своїм котячим теплом.',
		'Але потім настав час іти. Вони винесли нас із цієї темряви і відвезли до притулку. Зараз ми живемо в безпеці, серед інших врятованих тварин.',
		'Тут тихо, у мене завжди є миска, м’яке місце для сну, сестра поруч, і, головне, ми більше не чуємо звуків війни. І одного дня ми знайдемо свій дім назавжди.'
	],
	de: [
		'Mein Name ist Molly und ich bin eine Mischlingskatze.',
		'Meine Vergangenheit ist verbunden mit der Erde und der Feuchtigkeit des Schützengrabens, in dem meine Schwester und ich uns völlig allein wiederfanden. Jeden Tag überlebten meine Schwester und ich und kauerten uns zusammen, wobei wir versuchten, nicht auf den Donner des Himmels über uns zu hören.',
		'Ich glaube, ich werde mich für immer an den Tag erinnern, als die Soldaten in unseren Graben hinunterstiegen. Das Licht einer Taschenlampe, schwere Schritte... sie teilten Dosenfutter und Wasser mit uns, und wir teilten unsere Katzenwärme mit ihnen.',
		'Aber dann war es Zeit zu gehen. Sie trugen uns aus dieser Dunkelheit heraus und brachten uns in ein Tierheim. Jetzt leben wir in Sicherheit, unter anderen geretteten Tieren.',
		'Hier ist es ruhig, ich habe immer einen Napf, einen weichen Platz zum Schlafen, meine Schwester ist in der Nähe und das Wichtigste: Wir hören die Geräusche des Krieges nicht mehr. Und eines Tages werden wir unser endgültiges Zuhause finden.'
	],
	nl: [
		'Mijn naam is Molly en ik ben een gemengde raskat.',
		'Mijn verleden is verbonden met de aarde en de vochtigheid van de loopgraaf, waar mijn zus en ik ons helemaal alleen bevonden. Elke dag overleefden mijn zus en ik en kropen we bij elkaar, terwijl we probeerden niet te luisteren naar de donder van de lucht boven ons.',
		'Ik denk dat ik de dag waarop de soldaten onze loopgraaf afdaalden voor altijd zal herinneren. Het licht van een zaklamp, zware stappen... ze deelden blikvoer en water met ons, en wij deelden onze kattenwarmte met hen.',
		'Maar toen kwam de tijd om te vertrekken. Ze droegen ons uit deze duisternis en brachten ons naar een asiel. Nu leven we in veiligheid, tussen andere geredde dieren.',
		'Het is hier rustig, ik heb altijd een bakje, een zachte plek om te slapen, mijn zus is in de buurt, en het belangrijkste: we horen de geluiden van de oorlog niet meer. En op een dag zullen we ons forever home vinden.'
	]
};
