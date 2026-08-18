import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'mia',
	name: 'MIA',
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
	image: '/images/animals/cat_mia.jpg',
	// Nudged up so the ears stay in frame without stranding the cat at the top.
	imagePosition: '50% 20%'
};

export const description: Translations = {
	en: [
		'My name is Mia and I am a mixed breed cat.',
		'My past is the streets of a frontline city, where the sounds of explosions and sharp screams have long replaced the usual silence. I don’t remember exactly how I ended up on the street, but I remember well how the people around me disappeared, one by one.',
		'I learned to be alone very quickly. It became common for me to always look for at least some food, to hide from danger in the darkest corners, so as not to become an accidental victim. And every day I woke up and thought of only one thing, that this unfair world would give me another chance.',
		'And finally it happened. When they found me, I was completely exhausted. The hands that lifted me from the ground were careful and kind. They wrapped me in a soft towel and quietly said: “I promise, now everything will be different.” For the first time in a long time, I felt warmth and safety.',
		'At the shelter, everyone started calling me Mia. Here I learned to trust again, stopped flinching at every loud sound and here I finally fell asleep without fear.',
		'I am kind, calm and really appreciate attention. I love soft blankets and quiet evenings. And I am completely ready for a new life in which there will be care, love and people I can trust.'
	],
	uk: [
		'Мене звати Міа, і я — кішка змішаної породи.',
		"Моє минуле — це вулиці прифронтового міста, де звуки вибухів і різкі крики давно замінили звичну тишу. Я не пам'ятаю точно, як опинилася на вулиці, але добре пам'ятаю, як люди навколо мене зникали, один за одним.",
		'Я навчилася бути самотньою дуже швидко. Для мене стало звичним завжди шукати хоч якусь їжу, ховатися від небезпеки в найтемніших кутках, щоб не стати випадковою жертвою. І щодня я прокидалася і думала лише про одне — щоб цей несправедливий світ дав мені ще один шанс.',
		"І нарешті це сталося. Коли мене знайшли, я була зовсім виснажена. Руки, що підняли мене з землі, були обережними та добрими. Мене загорнули в м'який рушник і тихо сказали: «Обіцяю, тепер усе буде інакше». Вперше за довгий час я відчула тепло і безпеку.",
		'У притулку мене всі почали називати Міа. Тут я знову навчилася довіряти, перестала здригатися від кожного гучного звуку і тут я нарешті заснула без страху.',
		"Я добра, спокійна і дуже ціную увагу. Люблю м'які ковдри та тихі вечори. І я повністю готова до нового життя, в якому буде турбота, любов і люди, яким я зможу довіряти."
	],
	de: [
		'Mein Name ist Mia und ich bin eine Mischlingskatze.',
		'Meine Vergangenheit sind die Straßen einer Frontstadt, wo Explosionsgeräusche und schrille Schreie längst die gewohnte Stille ersetzt haben. Ich weiß nicht mehr genau, wie ich auf der Straße gelandet bin, aber ich erinnere mich gut daran, wie die Menschen um mich herum verschwanden, einer nach dem anderen.',
		'Ich habe sehr schnell gelernt, allein zu sein. Es wurde für mich alltüglich, immer nach wenigstens etwas zu essen zu suchen, mich in den dunkelsten Ecken vor Gefahren zu verstecken, um nicht ein zufälliges Opfer zu werden. Und jeden Tag wachte ich auf und dachte nur an eines: dass diese ungerechte Welt mir eine weitere Chance geben würde.',
		'Und schließlich geschah es. Als sie mich fanden, war ich völlig erschöpft. Die Hände, die mich vom Boden aufhoben, waren vorsichtig und gütig. Sie wickelten mich in ein weiches Handtuch und sagten leise: „Ich verspreche dir, jetzt wird alles anders.“ Zum ersten Mal seit langer Zeit spürte ich Wärme und Sicherheit.',
		'Im Tierheim nannten mich alle Mia. Hier habe ich wieder gelernt zu vertrauen, habe aufgehört, bei jedem lauten Geräusch zusammenzuzucken, und hier bin ich endlich ohne Angst eingeschlafen.',
		'Ich bin gütig, ruhig und weiß Aufmerksamkeit sehr zu schätzen. Ich liebe weiche Decken und ruhige Abende. Und ich bin völlig bereit für ein neues Leben, in dem es Fürsorge, Liebe und Menschen geben wird, denen ich vertrauen kann.'
	],
	nl: [
		'Mijn naam is Mia en ik ben een gemengde raskat.',
		'Mijn verleden is de straten van een frontstad, waar het geluid van explosies en scherpe schreeuwen allang de gebruikelijke stilte hebben vervangen. Ik herinner me niet precies hoe ik op straat ben beland, maar ik herinner me goed hoe de mensen om me heen verdwenen, één voor één.',
		'Ik leerde heel snel om alleen te zijn. Het werd gewoon voor mij om altijd naar tenminste wat eten te zoeken, om me te verbergen voor gevaar in de donkerste hoeken, om geen toevallig slachtoffer te worden. En elke dag werd ik wakker en dacht ik maar aan één ding: dat deze onrechtvaardige wereld me nog een kans zou geven.',
		'En eindelijk gebeurde het. Toen ze me vonden, was ik volledig uitgeput. De handen die me van de grond tilden waren voorzichtig en vriendelijk. Ze wikkelden me in een zachte handdoek en zeiden zachtjes: "Ik beloof je, nu zal alles anders zijn." Voor het eerst in lange tijd voelde ik warmte en veiligheid.',
		'In het asiel noemde iedereen me Mia. Hier leerde ik weer te vertrouwen, stopte ik met ineenkrimpen bij elk hard geluid en hier viel ik eindelijk zonder angst in slaap.',
		'Ik ben vriendelijk, rustig en waardeer aandacht enorm. Ik hou van zachte dekens en rustige avonden. En ik ben er helemaal klaar voor een nieuw leven waarin zorg, liefde en mensen zijn die ik kan vertrouwen.'
	]
};
