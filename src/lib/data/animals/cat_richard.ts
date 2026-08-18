import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'richard',
	name: 'RICHARD',
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
		en: 'red and white',
		uk: 'рудо-білий',
		de: 'rot-weiß',
		nl: 'rood-wit'
	},
	image: '/images/animals/cat_richard.jpg',
	// A tall photo of a sitting cat: centred, the card cropped him at the forehead.
	imagePosition: '50% 0%'
};

export const description: Translations = {
	en: [
		'My name is Richard and I am a mixed breed cat.',
		'My rescue was quiet. No sirens, no explosions, no loud words. It was just that one cold day I smelled a long-forgotten smell - milk. I walked towards it slowly and with distrust. I had lived too long among the ruins, among the gunshots and empty streets to immediately believe that I would be able to have a normal meal again.',
		"I didn't know these people. I didn't know who left the bowl by the fence, among the stones and garbage. But my whole wounded body was drawn to this food, and my heart - to be needed by someone again.",
		"When I came closer, they didn't drive me away. On the contrary, one of them leaned towards me and quietly said: “Well, hello stranger!” Then there were hands, a soft towel, a warm carrier and… safety.",
		'Now I live in a shelter, and everyone calls me Richard. There is something important in this name - something royal, as if I had regained the dignity that I lost when I was left alone.',
		'I am still a little cautious. I don’t rush to people from the doorway. I usually watch, observe, and sit silently nearby. But if you give me time, I am sure that I will become open again. After all, I know how to be faithful and very affectionate. Everyone also often tells me that I am a real gentleman - sedate, calm, with big eyes, in which it is immediately clear that I have understood a lot in this life.',
		'I am happy to be here, in the warmth. But I know that real life begins when you have your own person. Where you are accepted completely. And if you are reading this message from me now and smiling - perhaps, it is not by chance. Perhaps, I decided to approach not just a bowl of milk, but to you.'
	],
	uk: [
		'Мене звати Річард, і я — кіт змішаної породи.',
		'Мій порятунок був тихим. Жодних сирен, вибухів чи гучних слів. Просто одного холодного дня я відчув давно забутий запах — молоко. Я йшов до нього повільно і з недовірою. Я занадто довго жив серед руїн, серед пострілів і порожніх вулиць, щоб одразу повірити, що зможу знову нормально поїсти.',
		'Я не знав цих людей. Я не знав, хто залишив миску біля паркану, серед каміння та сміття. Але все моє поранене тіло тягнулося до цієї їжі, а серце — до того, щоб знову бути комусь потрібним.',
		"Коли я підійшов ближче, мене не прогнали. Навпаки, один із них нахилився до мене і тихо сказав: «Ну, привіт, незнайомцю!». Потім були руки, м'який рушник, тепла переноска і... безпека.",
		'Тепер я живу в притулку, і всі називають мене Річардом. У цьому імені є щось важливе — щось королівське, ніби я повернув собі гідність, яку втратив, коли залишився сам.',
		'Я все ще трохи обережний. Я не кидаюся до людей з порога. Зазвичай я спостерігаю, дивлюся і мовчки сиджу поруч. Але якщо ви дасте мені час, я впевнений, що знову стану відкритим. Адже я вмію бути вірним і дуже ласкавим. Також мені часто кажуть, що я справжній джентльмен — статечний, спокійний, з великими очима, в яких одразу видно, що я багато чого зрозумів у цьому житті.',
		"Я щасливий бути тут, у теплі. Але я знаю, що справжнє життя починається тоді, коли у тебе з'являється своя людина. Там, де тебе приймають повністю. І якщо ви зараз читаєте це повідомлення від мене і посміхаєтеся — можливо, це не випадково. Можливо, я вирішив підійти не просто до миски з молоком, а саме до вас."
	],
	de: [
		'Mein Name ist Richard und ich bin eine Mischlingskatze.',
		'Meine Rettung war leise. Keine Sirenen, keine Explosionen, keine lauten Worte. Es war einfach an jenem einen kalten Tag, als ich einen längst vergessenen Geruch wahrnahm – Milch. Ich ging langsam und misstrauisch darauf zu. Ich hatte zu lange in den Ruinen lebt, zwischen Schüssen und leeren Straßen, um sofort zu glauben, dass ich wieder eine normale Mahlzeit bekommen würde.',
		'Ich kannte diese Menschen nicht. Ich wusste nicht, wer den Napf am Zaun zwischen Steinen und Müll stehen gelassen hatte. Aber mein ganzer verwundeter Körper sehnte sich nach dieser Nahrung und mein Herz danach, wieder von jemandem gebraucht zu werden.',
		'Als ich näher kam, verjagten sie mich nicht. Im Gegenteil, einer von ihnen beugte sich zu mir und sagte leise: „Na, hallo Fremder!“ Dann waren da Hände, ein weiches Handtuch, eine warme Transportbox und... Sicherheit.',
		'Jetzt lebe ich in einem Tierheim und alle nennen mich Richard. Dieser Name hat etwas Wichtiges – etwas Königliches, als hätte ich die Würde zurückgewonnen, die ich verloren hatte, als ich allein gelassen wurde.',
		'Ich bin immer noch ein wenig vorsichtig. Ich stürme nicht gleich auf Menschen zu. Normalerweise beobachte ich und sitze schweigend daneben. Aber wenn man mir Zeit gibt, werde ich sicher wieder offen sein. Schließlich weiß ich, wie man treu und sehr anhänglich ist. Mir wird auch oft gesagt, ich sei ein echter Gentleman – gesetzt, ruhig, mit großen Augen, denen man sofort ansieht, dass ich viel verstanden habe.',
		'Ich bin froh, hier in der Wärme zu sein. Aber ich weiß, dass das wahre Leben beginnt, wenn man seinen eigenen Menschen hat. Wo man voll und ganz akzeptiert wird. Und wenn Sie diese Nachricht jetzt lesen und lächeln – vielleicht ist das kein Zufall. Vielleicht habe ich mich entschieden, nicht nur auf einen Napf Milch zuzugehen, sondern auf Sie.'
	],
	nl: [
		'Mijn naam is Richard en ik ben een gemengde raskat.',
		'Mijn redding was stil. Geen sirenes, geen explosies, geen harde woorden. Het was gewoon op die ene koude dag dat ik een lang vergeten geur rook - melk. Ik liep er langzaam en met wantrouwen naartoe. Ik had te lang tussen de ruïnes geleefd, tussen de schoten en lege straten, om meteen te geloven dat ik weer een normale maaltijd zou kunnen krijgen.',
		'Ik kende deze mensen niet. Ik wist niet wie de bak bij het hek had achtergelaten, tussen de stenen en het vuilnis. Maar mijn hele gewonde lichaam werd aangetrokken door dit voedsel, en mijn hart - om weer door iemand nodig te zijn.',
		'Toen ik dichterbij kwam, joegen ze me niet weg. Integendeel, een van hen boog zich naar me toe en zei zachtjes: "Nou, hallo vreemdeling!" Toen waren er handen, een zachte handdoek, een warme reismand en... veiligheid.',
		'Nu woon ik in een asiel en iedereen noemt me Richard. Er zit iets belangrijks in deze naam - iets koninklijks, alsof ik de waardigheid had herwonnen die ik verloor toen ik alleen werd gelaten.',
		'Ik ben nog steeds een beetje voorzichtig. Ik ren niet vanaf de deur op mensen af. Meestal kijk ik toe, observeer ik en zit ik zwijgend in de buurt. Maar als je me de tijd geeft, weet ik zeker dat ik weer open zal worden. Ik ben een echte heer - bezadigd, rustig, met grote ogen, waarin meteen duidelijk is dat ik veel heb begrepen in dit leven.',
		'Ik ben blij om hier te zijn, in de warmte. Maar ik weet dat het echte leven begint als je je eigen persoon hebt. Waar je volledig wordt geaccepteerd. En als je dit bericht nu leest en glimlacht - misschien is het geen toeval. Misschien heb ik besloten om niet zomaar een bakje melk te benaderen, maar jou.'
	]
};
