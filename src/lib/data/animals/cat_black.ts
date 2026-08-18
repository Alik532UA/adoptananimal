import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'black',
	name: 'BLACK',
	type: 'cat',
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
		en: 'black',
		uk: 'чорний',
		de: 'schwarz',
		nl: 'zwart'
	},
	image: '/images/animals/cat_black.jpg',
	// Nudged up so the ears stay in frame without stranding the cat at the top.
	imagePosition: '50% 20%'
};

export const description: Translations = {
	en: [
		'My name is Black and I am a mixed breed cat.',
		"I don't know how I ended up where I was. A military trench. Everything around was made of mud and wood, it smelled of dampness, metal and burning. I just hid in it from another shelling.",
		'In the middle of this horror, in this cold trench, I found people. Military men. They were kind to me and I trusted them. One of them once told me: "Don\'t worry, the time will come and we will transport you to a safe place."',
		'Each new explosion made me freeze, and the silence between them seemed even heavier. The soldiers shared canned food with me and even allowed me to sleep with them.',
		"One day, the military kept their word and took me out of that trench. That's how I ended up in the shelter. At the shelter, everyone tells me that I'm very calm, but the memory of what I went through still lives in my eyes."
	],
	uk: [
		'Мене звати Блек (Чорний), я — метис.',
		'Я не знаю, як я опинився там, де був. Військовий окоп. Все навколо було з багна та дерева, пахло вогкістю, металом і гаром. Я просто сховався в ньому від чергового обстрілу.',
		'Посеред цього жаху, в цьому холодному окопі, я знайшов людей. Військових. Вони були добрі до мене, і я їм довірився. Один із них якось сказав мені: «Не хвилюйся, настане час, і ми перевеземо тебе в безпечне місце».',
		'Кожен новий вибух змушував мене заціпеніти, а тиша між ними здавалася ще важчою. Солдати ділилися зі мною консервами і навіть дозволяли спати з ними.',
		'Одного разу військові стримали слово і вивезли мене з того окопу. Так я потрапив до притулку. Тут усі кажуть, що я дуже спокійний, але пам’ять про те, що я пережив, усе ще живе в моїх очах.'
	],
	de: [
		'Mein Name ist Black und ich bin eine Mischlingskatze.',
		'Ich weiß nicht, wie ich dort gelandet bin, wo ich war. Ein militärischer Schützengraben. Alles um mich herum war aus Schlamm und Holz, es roch nach Feuchtigkeit, Metall und Brand. Ich versteckte mich dort einfach vor weiterem Beschuss.',
		'Inmitten dieses Horrors, in diesem kalten Graben, fand ich Menschen. Militärs. Sie waren gütig zu mir und ich vertraute ihnen.',
		'Jeder neue Einschlag ließ mich erstarren, und die Stille dazwischen schien noch schwerer zu wiegen. Die Soldaten teilten ihr Dosenfutter mit mir und erlaubten mir sogar, bei ihnen zu schlafen.',
		'Eines Tages hielten die Militärs ihr Wort und holten mich aus diesem Graben heraus. So landete ich im Tierheim.'
	],
	nl: [
		'Mijn naam is Black en ik ben een gemengde raskat.',
		'Ik weet niet hoe ik terecht ben gekomen waar ik was. Een militaire loopgraaf. Alles om me heen was van modder en hout, het rook naar vocht, metaal en brandlucht. Ik schuilde daar gewoon voor de zoveelste beschieting.',
		'Midden in deze gruwel, in deze koude loopgraaf, vond ik mensen. Militairen. Ze waren vriendelijk voor me en ik vertrouwde hen.',
		'Elke nieuwe explosie deed me verstijven, und de stilte daartussen leek nog zwaarder. De soldaten deelden hun blikvoer met me en lieten me zelfs bij hen slapen.',
		'Op een dag hielden de militairen hun woord en haalden me uit die loopgraaf. Zo ben ik in het asiel terechtgekomen.'
	]
};
