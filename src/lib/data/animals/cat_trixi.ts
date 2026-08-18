import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'trixi',
	name: 'TRIXI',
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
	age: {
		en: '1 year',
		uk: '1 рік',
		de: '1 Jahr',
		nl: '1 jaar'
	},
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
	image: '/images/animals/cat_trixi.jpg',
	// Nudged up so the ears stay in frame without stranding the cat at the top.
	imagePosition: '50% 20%'
};

export const description: Translations = {
	en: [
		'My name is Trixi and I am a mixed breed cat.',
		'Before the war, I lived on a large farm, but when the first tanks arrived, everything changed. Our farm found itself in the middle of military action. The people who looked after me evacuated, took everything they could, but left me and a few other animals behind. But I don’t blame them, I remember the fear on their faces and saw how they tried to take everyone with them, but couldn’t.',
		'After that, hard times came for everyone who stayed on the farm. We were left with a supply of food and water, but it all ended quickly. My friends, the horses, lost weight faster than I did. I knew how to hunt and had the opportunity to go wherever I wanted, but they didn’t. In addition, we often experienced shelling, drones and real direct armed battles.',
		'A few months after we were abandoned, one car came for us. Honestly, I haven’t seen such brave people for a long time. First, they caught all the small animals, including me. And then they loaded up my friends, the horses, who were literally saying goodbye to life and were extremely exhausted. And after a very long journey, we all ended up in a shelter together.',
		'My ears were already getting used to it, but it is very quiet in the shelter where I live now. Here we are all taken care of and given a lot of attention. Besides me, there are many other animals here and I find a common language with absolutely everyone. I love to watch from the window how sheep and a goat walk peacefully in the field.',
		'And I... I will be glad to find a loving family. I think I am now ready to be not just a farm cat, but a real pet. And I know that I can be one of the most devoted you have ever known.'
	],
	uk: [
		'Мене звати Тріксі, і я — кішка змішаної породи.',
		"До війни я жила на великій фермі, але коли приїхали перші танки, все змінилося. Наша ферма опинилася в самому центрі військових дій. Люди, які доглядали за мною, евакуювалися, забрали все, що могли, але залишили мене і ще кількох тварин. Але я не звинувачую їх, я пам'ятаю страх на їхніх обличчях і бачила, як вони намагалися забрати всіх із собою, але не змогли.",
		'Після цього настали важкі часи для всіх, хто залишився на фермі. Нам залишили запас їжі та води, але все це швидко закінчилося. Мої друзі, коні, втрачали вагу швидше за мене. Я вміла полювати і мала можливість ходити куди завгодно, а вони — ні. Крім того, ми часто переживали обстріли, дрони та справжні прямі збройні бої. Мені важко сказати, скільки разів ми були на межі життя і смерті.',
		'Через кілька місяців після того, як нас покинули, за нами приїхала одна машина. Чесно кажучи, я давно не бачила таких сміливих людей. Спочатку вони зловили всіх дрібних тварин, включаючи мене. А потім завантажили моїх друзів, коней, які буквально прощалися з життям і були вкрай виснажені. І після дуже довгої подорожі ми всі разом опинилися в притулку.',
		'Мої вуха вже звикали до цього, але в притулку, де я зараз живу, дуже тихо. Тут про нас усіх піклуються і приділяють багато уваги. Крім мене, тут багато інших тварин, і я знаходжу спільну мову абсолютно з усіма. Я люблю спостерігати з вікна, як вівці та коза мирно гуляють у полі. І як щасливі тут мої друзі, коні.',
		"А я... я буду рада знайти люблячу сім'ю. Думаю, я тепер готова бути не просто фермерською кішкою, а справжнім домашнім улюбленцем. І я знаю, що можу бути однією з найвідданіших, яких ви коли-небудь знали."
	],
	de: [
		'Mein Name ist Trixi und ich bin eine Mischlingskatze.',
		'Vor dem Krieg lebte ich auf einem großen Bauernhof, doch als die ersten Panzer eintrafen, änderte sich alles. Unser Hof befand sich mitten im Kriegsgebiet. Die Leute, die sich um mich kümmerten, evakuierten, ließen mich und ein paar andere Tiere jedoch zurück.',
		'Danach kamen harte Zeiten. Uns wurde ein Vorrat an Futter und Wasser hinterlassen, doch dieser war schnell aufgebraucht. Meine Freunde, die Pferde, verloren schneller an Gewicht als ich. Ich konnte jagen, aber sie nicht. Außerdem erlebten wir oft Beschuss und echte Kämpfe.',
		'Ein paar Monate später kam ein Auto für uns. Zuerst fingen sie alle kleinen Tiere ein, mich eingeschlossen. Und dann verluden sie meine Freunde, die Pferde, die extrem erschöpft waren. Und nach einer sehr langen Reise landeten wir alle zusammen in einem Tierheim.',
		'Im Tierheim, in dem ich jetzt lebe, ist es sehr ruhig. Hier wird sich um uns alle gekümmert. Ich liebe es, aus dem Fenster zu beobachten, wie Schafe und eine Ziege friedlich auf der Weide spazieren gehen.'
	],
	nl: [
		'Mijn naam is Trixi en ik ben een gemengde raskat.',
		'Vóór de oorlog woonde ik op een grote boerderij, maar toen de eerste tanks arriveerden, veranderde alles. Onze boerderij bevond zich midden in een oorlogsgebied. De mensen die voor me zorgden zijn geëvacueerd, maar lieten mij en een paar andere dieren achter.',
		'Daarna kwamen er moeilijke tijden. Er was een voorraad eten en water achtergelaten, maar die was snel op. Mijn vrienden, de paarden, vielen sneller af dan ik. Ik kon jagen, maar zij niet. Daarnaast hadden we vaak te maken met beschietingen en echte gevechten.',
		'Een paar maanden later kwam er een auto voor ons. Eerst vingen ze alle kleine dieren, inclusief mij. En toen laadden ze mijn vrienden in, de paarden, die extreem uitgeput waren. En na een hele lange reis kwamen we allemaal samen in een asiel terecht.',
		'In het asiel waar ik nu woon is het heel stil. Hier wordt voor ons allemaal gezorgd. Ik vind het heerlijk om uit het raam te kijken hoe schapen en een geit vredig in het veld lopen.'
	]
};
