import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'tyler',
	name: 'TYLER',
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
	// 1 year on 2025-07-09, the date on document 10.
	bornOn: '2024-07-09',
	size: {
		en: 'up to 4 kg',
		uk: 'до 4 кг',
		de: 'bis zu 4 kg',
		nl: 'tot 4 kg'
	},
	color: {
		en: 'red and white',
		uk: 'рудо-білий',
		de: 'rot-weiß',
		nl: 'rood-wit'
	},
	image: '/images/animals/cat_tyler.jpg',
	// Nudged up so the ears stay in frame without stranding the cat at the top.
	imagePosition: '50% 20%'
};

export const description: Translations = {
	en: [
		'My name is Tyler and I am a mixed breed cat.',
		'I was rescued in the Kherson region, where I found myself locked in a house that my family had left after heavy shelling. I swear I waited for them for a very long time. First for hours, then for days. But unfortunately they never returned.',
		'After they left, the house suddenly became dark and cold. Sometimes it was too quiet, and sometimes everything was shaking from nearby explosions. After one of these explosions, almost all the windows in the house broke and I was able to get out.',
		"I survived in every way I could. Wandered, hid, ate everything I found. I don't remember how long this loneliness lasted - time loses its meaning when everything that surrounds you resembles real horror.",
		"When people finally found me, I didn't even move. I thought it was another blow somewhere nearby. But instead of a crash, I heard footsteps. A flashlight. And warm hands. Someone whispered: \"Poor thing, you've been waiting all this time, haven't you?\"",
		'I am currently in a shelter. I love the company of other cats and generally tolerate the company of people. I like the feeling of being cared for again, but I know that true love can only come from family.'
	],
	uk: [
		'Мене звати Тайлер, я — метис.',
		'Мене врятували на Херсонщині, де я опинився замкненим у будинку, який моя родина покинула після сильного обстрілу. Присягаюся, я чекав на них дуже довго. Спочатку годинами, потім днями. Але, на жаль, вони так і не повернулися.',
		'Після того, як вони пішли, у будинку раптово стало темно і холодно. Іноді було занадто тихо, а іноді все здригалося від вибухів неподалік. Після одного з таких вибухів майже всі вікна в будинку вилетіли, і я зміг вибратися назовні.',
		'Я виживав як міг. Блукав, ховався, їв усе, що знаходив. Не пам’ятаю, як довго тривала ця самотність — час втрачає сенс, коли все навколо нагадує справжній жах.',
		'Коли люди нарешті знайшли мене, я навіть не поворухнувся. Думав, це черговий удар десь поруч. Але замість гуркоту я почув кроки. Ліхтарик. І теплі руки. Хтось прошепотів: "Бідненький, ти весь цей час чекав, чи не так?"',
		'Зараз я в притулку. Мені подобається компанія інших котів, і я загалом добре ставлюся до людей. Мені подобається відчуття того, що про мене знову піклуються, але я знаю, що справжня любов може прийти тільки від сім’ї.'
	],
	de: [
		'Mein Name ist Tyler und ich bin eine Mischlingskatze.',
		'Ich wurde in der Region Cherson gerettet, wo ich in einem Haus eingesperrt war, das meine Familie nach schwerem Beschuss verlassen hatte. Ich schwöre, ich habe sehr lange auf sie gewartet. Erst Stunden, dann Tage. Aber leider sind sie nie zurückgekehrt.',
		'Nachdem sie weg waren, wurde das Haus plötzlich dunkel und kalt. Manchmal war es zu still, und manchmal bebte alles von Explosionen in der Nähe. Nach einer dieser Explosionen gingen fast alle Fenster im Haus zu Bruch und ich konnte entkommen.',
		'Ich überlebte auf jede erdenkliche Weise. Ich wanderte umher, versteckte mich, aß alles, was ich fand. Ich weiß nicht mehr, wie lange diese Einsamkeit dauerte – die Zeit verliert ihre Bedeutung.',
		'Als mich die Menschen schließlich fanden, bewegte ich mich nicht einmal. Ich dachte, es wäre ein weiterer Schlag in der Nähe. Aber statt eines Krachs hörte ich Schritte. Eine Taschenlampe. Und warme Hände.',
		'Ich bin zurzeit in einem Tierheim. Ich liebe die Gesellschaft anderer Katzen und vertrage mich im Allgemeinen gut mit Menschen. Ich mag das Gefühl, wieder umsorgt zu werden.'
	],
	nl: [
		'Mijn naam is Tyler en ik ben een gemengde raskat.',
		'Ik werd gered in de regio Kherson, waar ik opgesloten zat in een huis dat mijn familie had verlaten na zware beschietingen. Ik zweer dat ik heel lang op hen heb gewacht. Eerst uren, toen dagen. Maar helaas zijn ze nooit teruggekomen.',
		'Nadat ze weg waren, werd het huis plotseling donker en koud. Soms was het te stil, en soms schudde alles door explosies in de buurt. Na een van deze explosies braken bijna alle ramen in het huis en kon ik naar buiten.',
		'Ik overleefde op alle mogelijke manieren. Dwaalde rond, verstopte me, at alles wat ik vond. Ik weet niet meer hoe lang deze eenzaamheid duurde - tijd verliest zijn betekenis.',
		'Toen mensen me eindelijk vonden, bewoog ik me niet eens. Ik dacht dat het weer een klap ergens in de buurt was. Maar in plaats van een knal hoorde ik voetstappen. Een zaklamp. En warme handen.',
		'Ik zit momenteel in een asiel. Ik hou van het gezelschap van andere katten en kan over het algemeen goed overweg met mensen. Ik vind het fijn om weer verzorgd te worden.'
	]
};
