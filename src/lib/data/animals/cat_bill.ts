import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'bill',
	name: 'BILL',
	type: 'cat',
	isAdopted: false,
	gender: {
		en: 'male',
		uk: 'самець',
		de: 'männlich',
		nl: 'mannetje'
	},
	breed: {
		en: 'mixed breed',
		uk: 'метис',
		de: 'Mischling',
		nl: 'gemengd ras'
	},
	age: {
		en: '2 years',
		uk: '2 роки',
		de: '2 Jahre',
		nl: '2 jaar'
	},
	size: {
		en: 'medium',
		uk: 'середній',
		de: 'mittel',
		nl: 'gemiddeld'
	},
	color: {
		en: 'white and grey',
		uk: 'біло-сірий',
		de: 'weiß-grau',
		nl: 'wit-grijs'
	},
	image: '/images/animals/cat_bill.jpg'
};

export const description: Translations = {
	en: [
		'My name is Bill and I am a mixed breed cat.',
		'I remember what my house looked like. There, I had my own corner on the windowsill, a bowl of my favorite food, and people who were everything to me.',
		'I lived quietly until the war came to my city. One day the shelling became so frequent that the house was no longer a safe place. My people had to leave, but they left me behind.',
		'I sat by the destroyed gate, spent the night on the cold steps, hoping, because hope dies last. I had to run between missiles and look for food on the streets, but more often, endure terrible hunger.',
		'This went on until I met some strange people. These people with very kind faces decided to take me away from where I was completely unhappy. Now I live in a shelter. Here I remembered what silence and care are.'
	],
	uk: [
		'Мене звати Білл, я — метис.',
		'Я пам’ятаю, як виглядав мій дім. Там у мене був свій куточок на підвіконні, миска з улюбленою їжею та люди, які були для мене всім.',
		'Я жив спокійно, поки в моє місто не прийшла війна. Одного разу обстріли стали такими частими, що будинок перестав бути безпечним місцем. Моїм людям довелося поїхати, але вони залишили мене.',
		'Я сидів біля зруйнованих воріт, ночував на холодних сходах, сподіваючись, бо надія вмирає останньою. Мені доводилося бігати між ракетами і шукати їжу на вулицях, але частіше — терпіти жахливий голод.',
		'Це тривало доти, поки я не зустрів якихось незнайомців. Ці люди з дуже добрими обличчями вирішили забрати мене звідти, де я був абсолютно нещасним. Зараз я живу в притулку. Тут я згадав, що таке тиша і турбота.'
	],
	de: [
		'Mein Name ist Bill und ich bin eine Mischlingskatze.',
		'Ich erinnere mich, wie mein Haus aussah. Dort hatte ich meine eigene Ecke auf dem Fensterbrett, einen Napf mit meinem Lieblingsfutter und Menschen, die mir alles bedeuteten.',
		'Ich lived ruhig, bis der Krieg in meine Stadt kam. Eines Tages wurde der Beschuss so häufig, dass das Haus kein sicherer Ort mehr war. Meine Menschen mussten gehen, aber sie ließen mich zurück.',
		'Ich saß am zerstörten Tor, verbrachte die Nacht auf den kalten Stufen und hoffte, denn die Hoffnung stirbt zuletzt. Ich musste zwischen Raketen rennen und Futter auf der Straße suchen, aber öfter musste ich schrecklichen Hunger ertragen.',
		'Dies ging so lange, bis ich einige fremde Menschen traf. Diese Menschen mit sehr gütigen Gesichtern beschlossen, mich von dort wegzubringen, wo ich völlig unglücklich war. Jetzt lebe ich in einem Tierheim.'
	],
	nl: [
		'Mijn naam is Bill en ik ben een gemengde raskat.',
		'Ik herinner me hoe mijn huis eruitzag. Daar had ik mijn eigen hoekje op de vensterbank, een bakje met mijn lievelingseten en mensen die alles voor me betekenden.',
		'Ik leefde rustig totdat de oorlog in mijn stad kwam. Op een dag werden de beschietingen zo frequent dat het huis niet langer een veilige plek was. Mijn mensen moesten vertrekken, maar ze lieten mij achter.',
		'Ik zat bij de verwoeste poort, bracht de nacht door op de koude treden, hopend, want hoop sterft als laatste. Ik moest tussen raketten door rennen en voedsel zoeken op straat, maar vaker nog moest ik vreselijke honger verdragen.',
		'Dit ging zo door totdat ik een paar vreemde mensen ontmoette. Deze mensen met zeer vriendelijke gezichten besloten me weg te halen van waar ik volkomen ongelukkig was. Nu woon ik in een asiel.'
	]
};
