import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'mirabel',
	name: 'MIRABEL',
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
		en: '1 year',
		uk: '1 рік',
		de: '1 Jahr',
		nl: '1 jaar'
	},
	size: {
		en: 'small',
		uk: 'малий',
		de: 'klein',
		nl: 'klein'
	},
	color: {
		en: 'grey',
		uk: 'сірий',
		de: 'grau',
		nl: 'grijs'
	},
	image: '/images/animals/cat_mirabel.jpg'
};

export const description: Translations = {
	en: [
		'My name is Mirabel and I am a mixed breed cat.',
		'When the war came, my life was divided into "before" and "after". I found myself on the front line, among the destruction and silence that was interrupted only by the roar. There was nothing there but fear.',
		'I hid wherever I could: in basements, among the rubble, under cars. Sometimes I found water, sometimes leftovers, but more often I remained hungry. The scariest were the nights: each explosion seemed like the last.',
		'The day they found me, I was already too weak. I was sitting near a destroyed trench and suddenly I heard footsteps. One person stopped and leaned towards me. Then he took out a piece of food and put it next to me. When I took the first bite, I felt cared for again.',
		'This is how I ended up in the shelter. Here I have everything I need and am very grateful for being saved. I am quiet, affectionate and really love when there is a person nearby.'
	],
	uk: [
		'Мене звати Мірабель, я — метис.',
		'Коли прийшла війна, моє життя розділилося на «до» та «після». Я опинилася на передовій, серед руйнувань і тиші, що переривалася лише гуркотом. Там не було нічого, крім страху.',
		'Я ховалася де могла: в підвалах, серед уламків, під машинами. Іноді знаходила воду, іноді недоїдки, але частіше залишалася голодною. Найстрашнішими були ночі: кожен вибух здавався останнім.',
		'Того дня, коли мене знайшли, я вже була занадто слабкою. Я сиділа біля зруйнованого окопу і раптом почула кроки. Одна людина зупинилася і нахилилася до мене. Потім він дістав шматочок їжі й поклав поруч. Коли я зробила перший кусь, я знову відчула турботу.',
		'Так я потрапила до притулку. Тут у мене є все необхідне, і я дуже вдячна за порятунок. Я тиха, ласкава і дуже люблю, коли поруч є людина.'
	],
	de: [
		'Mein Name ist Mirabel und ich bin eine Mischlingskatze.',
		'Als der Krieg kam, wurde mein Leben in ein „Vorher“ und ein „Nachher“ geteilt. Ich fand mich an der Frontlinie wieder, inmitten von Zerstörung und Stille, die nur durch das Grollen unterbrochen wurde. Dort gab es nichts als Angst.',
		'Ich versteckte mich, wo immer ich konnte: in Kellern, in den Trümmern, unter Autos. Manchmal fand ich Wasser, manchmal Essensreste, aber öfter blieb ich hungrig. Am schlimmsten waren die Nächte: Jede Explosion schien die letzte zu sein.',
		'An dem Tag, als sie mich fanden, war ich schon zu schwach. Ich saß in der Nähe eines zerstörten Schützengrabens und plötzlich hörte ich Schritte. Eine Person blieb stehen und beugte sich zu mir. Dann holte er ein Stück Futter heraus und legte es neben mich. Als ich den ersten Bissen nahm, fühlte ich mich wieder umsorgt.',
		'So landete ich im Tierheim. Hier habe ich alles, was ich brauche, und bin sehr dankbar für meine Rettung. Ich bin ruhig, anhänglich und liebe es sehr, wenn ein Mensch in der Nähe ist.'
	],
	nl: [
		'Mijn naam is Mirabel en ik ben een gemengde raskat.',
		'Toen de oorlog kwam, werd mijn leven verdeeld in "voor" en "na". Ik bevond me op de frontlinie, te midden van verwoesting en stilte die alleen werd onderbroken door het gebrul. Er was daar niets anders dan angst.',
		"Ik schuilde waar ik maar kon: in kelders, tussen het puin, onder auto's. Soms vond ik water, soms kliekjes, maar vaker bleef ik hongerig. Het engst waren de nachten: elke explosie leek de laatste.",
		'De dag dat ze me vonden, was ik al te zwak. Ik zat bij een verwoeste loopgraaf en plotseling hoorde ik voetstappen. Eén persoon stopte en boog zich naar me toe. Toen haalde hij een stukje eten tevoorschijn en legte het naast me neer. Toen ik de eerste hap nam, voelde ik me weer verzorgd.',
		'Zo ben ik in het asiel terechtgekomen. Hier heb ik alles wat ik nodig heb en ben ik erg dankbaar dat ik gered ben. Ik ben rustig, aanhankelijk en hou er echt van als er een mens in de buurt is.'
	]
};
