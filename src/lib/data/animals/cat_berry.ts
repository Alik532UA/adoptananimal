import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'berry',
	name: 'BERRY',
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
	image: '/images/animals/cat_berry.jpg'
};

export const description: Translations = {
	en: [
		'My name is Berry and I am a mixed breed cat.',
		'My past is the dirt and dampness of the trench where I lived with my sister. I don’t really remember how we ended up there completely alone, without my mother, literally in the middle of a war.',
		'One day, soldiers came down into our trench. I saw the light of their flashlights and froze. But they turned out to be good. For some time we lived with them in this terrible trench. They shared canned food, bread and water with us.',
		'Then we were taken out of there. And the soldiers handed us over to the shelter with the hope that a new life would begin for us here. My sister and I spend time here with other rescued cats, play, eat delicious food and most importantly, we no longer hear those terrible sounds of war.',
		'My sister and I have been through too much, but now I know for sure: life can be different and one day I will find a forever home and a family.'
	],
	uk: [
		'Мене звати Беррі (Ягідка), я — метис.',
		'Моє минуле — це бруд і вогкість окопу, де я жила зі своєю сестрою. Я не дуже пам’ятаю, як ми опинилися там зовсім самі, без мами, буквально посеред війни.',
		'Одного разу в наш окоп спустилися солдати. Я побачила світло їхніх ліхтариків і завмерла. Але вони виявилися добрими. Якийсь час ми жили з ними в цьому жахливому окопі. Вони ділилися з нами консервами, хлібом і водою.',
		'Потім нас звідти вивезли. Солдати передали нас у притулок з надією, що тут для нас розпочнеться нове життя. Ми з сестрою проводимо час тут з іншими врятованими котами, граємося, їмо смачну їжу і, головне, більше не чуємо тих жахливих звуків війни.',
		'Ми з сестрою пройшли через занадто багато випробувань, але тепер я точно знаю: життя може бути іншим, і одного дня я знайду свій дім назавжди і сім’ю.'
	],
	de: [
		'Mein Name ist Berry und ich bin eine Mischlingskatze.',
		'Meine Vergangenheit sind der Dreck und die Feuchtigkeit des Schützengrabens, in dem ich mit meiner Schwester lebte. Ich erinnere mich nicht wirklich daran, wie wir dort völlig allein landeten, ohne meine Mutter, buchstäblich mitten im Krieg.',
		'Eines Tages kamen Soldaten in unseren Schützengraben herunter. Ich sah das Licht ihrer Taschenlampen und erstarrte. Aber sie stellten sich als gut heraus. Eine Zeit lang lebten wir mit ihnen in diesem schrecklichen Graben. Sie teilten Dosenfutter, Brot und Wasser mit uns.',
		'Dann wurden wir dort herausgeholt. Und die Soldaten übergaben uns dem Tierheim mit der Hoffnung, dass hier ein neues Leben für uns beginnen würde.',
		'Meine Schwester und ich haben zu viel durchgemacht, aber jetzt weiß ich sicher: Das Leben kann anders sein, und eines Tages werde ich ein endgültiges Zuhause und eine Familie finden.'
	],
	nl: [
		'Mijn naam is Berry en ik ben een gemengde raskat.',
		'Mijn verleden is de modder en vochtigheid van de loopgraaf waar ik met mijn zus woonde. Ik herinner me niet echt hoe we daar helemaal alleen terecht zijn gekomen, zonder mijn moeder, letterlijk midden in een oorlog.',
		'Op een dag kwamen er soldaten naar beneden in onze loopgraaf. Ik zag het licht van hun zaklampen en verstijfde. Maar ze bleken goed te zijn. Een tijdje woonden we bij hen in deze vreselijke loopgraaf. Ze deelden blikvoer, brood en water met ons.',
		'Toen werden we daar weggehaald. En de soldaten droegen ons over aan het asiel met de hoop dat hier een nieuw leven voor ons zou beginnen.',
		'Mijn zus en ik hebben te veel meegemaakt, maar nu weet ik het zeker: het leven kan anders zijn en op een dag zal ik een forever home en een gezin vinden.'
	]
};
