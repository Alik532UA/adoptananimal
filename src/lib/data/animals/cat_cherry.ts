import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'cherry',
	name: 'CHERRY',
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
	image: '/images/animals/cat_cherry.jpg',
	imagePosition: '0% 50%'
};

export const description: Translations = {
	en: [
		'My name is Cherry and I am a mixed breed cat.',
		'For a long time, my home was a destroyed school. I lived among broken glass, desks and burnt books. And every new explosion reminded me that I was an accidental guest here.',
		'Everything changed on the day when some people came to the school. They were examining the building and suddenly found me. I was sitting in the corner, curled up. One of them sat down and said: "Come here, girl. I promise, everything will be fine with you now."',
		'I took a step. Then another. And let myself be lifted. At that moment, long-forgotten feelings returned to me. I realized that I was safe now.',
		'Then my life in the shelter began. It is quiet here and nothing bothers me here. On my soft pillow, I fall asleep without fear. I believe that one day there will be those people who will decide to adopt me and give me a family.'
	],
	uk: [
		'Мене звати Черрі (Вишенька), я — метис.',
		'Довгий час моїм домом була зруйнована школа. Я жила серед розбитого скла, парт і спалених книжок. І кожен новий вибух нагадував мені, що я тут випадковий гість.',
		'Все змінилося того дня, коли до школи прийшли люди. Вони оглядали будівлю і раптом знайшли мене. Я сиділа в кутку, згорнувшись калачиком. Один із них присів і сказав: «Йди сюди, дівчинко. Обіцяю, тепер з тобою все буде добре».',
		'Я зробила крок. Потім ще один. І дозволила себе підняти. У той момент до мене повернулися давно забуті відчуття. Я зрозуміла, що тепер я в безпеці.',
		'Потім почалося моє життя в притулку. Тут тихо і мене ніщо не турбує. На своїй м’якій подушці я засинаю без страху. Вірю, що одного дня знайдуться люди, які вирішать мене всиновити і подарують мені сім’ю.'
	],
	de: [
		'Mein Name ist Cherry und ich bin eine Mischlingskatze.',
		'Lange Zeit war mein Zuhause eine zerstörte Schule. Ich lebte zwischen Glasscherben, Schreibtischen und verbrannten Büchern. Und jede neue Explosion erinnerte mich daran, dass ich hier nur ein zufälliger Gast war.',
		'Alles änderte sich an dem Tag, als einige Menschen in die Schule kamen. Sie untersuchten das Gebäude und fanden mich plötzlich. Ich saß in der Ecke, zusammengestoßen. Einer von ihnen setzte sich hin und sagte: „Komm her, Mädchen. Ich verspreche dir, jetzt wird alles gut mit dir.“',
		'Ich machte einen Schritt. Dann noch einen. Und ließ mich hochheben. In diesem Moment kehrten längst vergessene Gefühle zu mir zurück. Ich merkte, dass ich jetzt in Sicherheit war.',
		'Dann begann mein Leben im Tierheim. Es ist ruhig hier und nichts stört mich hier. Auf meinem weichen Kissen schlafe ich ohne Angst ein.'
	],
	nl: [
		'Mijn naam is Cherry en ik ben een gemengde raskat.',
		'Lange tijd was mijn thuis een verwoeste school. Ik leefde tussen gebroken glas, bureaus en verbrande boeken. En elke nieuwe explosie herinnerde me eraan dat ik hier een toevallige gast was.',
		'Alles veranderde op de dag dat er mensen naar de school kwamen. Ze onderzochten het gebouw en vonden me plotseling. Ik zat in de hoek, in elkaar gedoken. Een van hen ging zitten en zei: "Kom maar, meisje. Ik beloof je dat alles nu goed komt met je."',
		'Ik zette een stap. Toen nog een. En liet me optillen. Op dat moment kwamen lang vergeten gevoelens bij me terug. Ik besefte dat ik nu veilig was.',
		'Toen begon mijn leven in het asiel. Het is hier rustig en niets stoort me hier. Op mijn zachte kussen val ik zonder angst in slaap.'
	]
};
