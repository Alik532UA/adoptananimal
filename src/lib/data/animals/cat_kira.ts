import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'kira',
	name: 'KIRA',
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
		en: 'ginger',
		uk: 'рудий',
		de: 'rot',
		nl: 'rood'
	},
	image: '/images/animals/cat_kira.jpg',
	// Nudged up so the ears stay in frame without stranding the cat at the top.
	imagePosition: '50% 20%'
};

export const description: Translations = {
	en: [
		'My name is Kira and I am a mixed breed cat.',
		'I remember the moment my world turned upside down all too clearly. The car was speeding down the road, and the people who once loved me simply opened the window and threw me out.',
		"When I woke up, I couldn't move at all. And my eyes… I immediately realized that something was wrong with them.",
		'I was lying on the side of the road, hearing cars rushing past. But then I heard some car slow down. Someone came up to me, leaned over and quietly said: "Hold on, baby. We\'ll help you with everything we can."',
		'Then there was a long treatment. Many injections to restore my vision. But some injuries cannot be cured completely. Now I can distinguish some bright light and sudden movements. And despite the fact that my eyes do not work completely, this does not prevent me from orienting myself in space quite well.',
		'I have experienced human cruelty to the fullest extent, but I know that one day there will be a person who will accept me as I am and will never abandon me. At the shelter everyone tells me that I am calm and gentle.'
	],
	uk: [
		'Мене звати Кіра, я — метис.',
		'Я занадто чітко пам’ятаю момент, коли мій світ перевернувся. Машина мчала по дорозі, і люди, які колись мене любили, просто відкрили вікно і викинули мене назовні.',
		'Коли я прокинулася, я зовсім не могла поворухнутися. А мої очі... я відразу зрозуміла, що з ними щось не так.',
		'Я лежала на узбіччі, чуючи, як повз пролітають машини. Але потім я почула, як одна машина притормозила. Хтось підійшов до мене, нахилився і тихо сказав: «Тримайся, маленька. Ми допоможемо тобі всім, чим зможемо».',
		'Потім було тривале лікування. Багато уколів, щоб відновити мій зір. Але деякі травми неможливо вилікувати повністю. Зараз я можу розрізняти яскраве світло та різкі рухи. І попри те, що мої очі працюють не повністю, це не заважає мені досить добре орієнтуватися в просторі.',
		'Я пізнала людську жорстокість повною мірою, але знаю, що одного дня з’явиться людина, яка прийме мене такою, яка я є, і ніколи не покине. У притулку всі кажуть мені, що я спокійна та ніжна.'
	],
	de: [
		'Mein Name ist Kira und ich bin eine Mischlingskatze.',
		'Ich erinnere mich allzu deutlich an den Moment, als meine Welt auf den Kopf gestellt wurde. Das Auto raste die Straße entlang, und die Menschen, die mich einst liebten, öffneten einfach das Fenster und warfen mich hinaus.',
		'Als ich aufwachte, konnte ich mich überhaupt nicht mehr bewegen. Und meine Augen… ich merkte sofort, dass mit ihnen etwas nicht stimte. Ich lag am Straßenrand und hörte Autos vorbeirauschen. Aber dann hörte ich, wie ein Auto langsamer wurde. Jemand kam auf mich zu, beugte sich über mich und sagte leise: „Halte durch, Kleines. Wir helfen dir mit allem, was wir können.“',
		'Dann folgte eine lange Behandlung. Viele Spritzen, um mein Augenlicht wiederherzustellen. Aber manche Verletzungen können nicht vollständig geheilt werden. Jetzt kann ich etwas helles Licht und plötzliche Bewegungen unterscheiden. Und obwohl meine Augen nicht mehr ganz funktionieren, hindert mich das nicht daran, mich recht gut im Raum zu orientieren.',
		'Ich habe menschliche Grausamkeit in vollem Umfang erlebt, aber ich weiß, dass es eines Tages einen Menschen geben wird, der mich so akzeptiert, wie ich bin, und mich niemals im Stich lässt.'
	],
	nl: [
		'Mijn naam is Kira en ik ben een gemengde raskat.',
		'Ik herinner me het moment dat mijn wereld op zijn kop werd gezet maar al te goed. De auto raasde over de weg, en de mensen die ooit van me hielden openden gewoon het raam en gooiden me naar buiten.',
		'Toen ik wakker werd, kon ik me helemaal niet meer bewegen. En mijn ogen... ik besefte meteen dat er iets mis mee was. Ik lag aan de kant van de weg en hoorde auto\'s voorbij razen. Maar toen hoorde ik een auto vaart minderen. Iemand kwam naar me toe, boog over me heen en zei zachtjes: "Hou vol, kleintje. We zullen je helpen met alles wat we kunnen."',
		'Toen volgde een lange behandeling. Veel injecties om mijn gezichtsvermogen te herstellen. Maar sommige verwondingen kunnen niet volledig worden genezen. Nu kan ik wat fel licht en plotselinge bewegingen onderscheiden. En ondanks het feit dat mijn ogen niet volledig werken, verhindert dit me niet om me heel goed in de ruimte te oriënteren.',
		'Ik heb menselijke wreedheid ten volle ervaren, maar ik weet dat er op een dag een persoon zal zijn die me zal accepteren zoals ik ben en me nooit zal verlaten.'
	]
};
