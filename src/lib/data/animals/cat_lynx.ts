import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'lynx',
	name: 'LYNX',
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
	image: '/images/animals/cat_lynx.jpg',
	// A wide photograph in a square frame on the detail page: centred, the crop cut
	// through his face on the right. Pulled left so the head is what survives.
	imagePosition: '100% 50%'
};

export const description: Translations = {
	en: [
		'My name is Lynx and I am a mixed breed cat.',
		'I was found in the Kherson region, under the rubble of a destroyed house. Before that, there was a terrible sound - a drone.',
		'I don’t remember the explosion itself. Only a flash, a roar and how everything around disappeared. One eye no longer saw at all, and the other could only distinguish light and shadow.',
		'When the pain had already completely penetrated my body, I heard a sound and then a bright light: “Look, there’s a cat!” - someone screamed.',
		"Now I live in a shelter. And everyone calls me Lynx. Not because I'm wild, but because I'm strong. I really only see half now. Even after a long treatment, one eye remained almost blind. Но my heart feels 100%.",
		'I am sure that one day someone will definitely fall in love with my uniqueness and give me a new forever home.'
	],
	uk: [
		'Мене звати Лінкс (Рись), я — метис.',
		'Мене знайшли на Херсонщині під завалами зруйнованого будинку. Перед цим був жахливий звук — дрон.',
		'Самого вибуху я не пам’ятаю. Тільки спалах, гуркіт і те, як усе навколо зникло. Одне око перестало бачити зовсім, а інше могло лише розрізняти світло й тінь.',
		'Коли біль уже повністю пронизав моє тіло, я почув звук, а потім яскраве світло: «Дивіться, там кіт!» — хтось закричав.',
		'Зараз я живу в притулку. Всі називають мене Лінкс. Не тому, що я дикий, а тому, що сильний. Зараз я бачу лише наполовину. Навіть після тривалого лікування одне око залишилося майже сліпим. Але моє серце відчуває на 100%.',
		'Я впевнений, що одного дня хтось обов’язково покохає мою унікальність і подарує мені новий дім назавжди.'
	],
	de: [
		'Mein Name ist Lynx und ich bin eine Mischlingskatze.',
		'Ich wurde in der Region Cherson unter den Trümmern eines zerstörten Hauses gefunden. Davor gab es ein schreckliches Geräusch – eine Drohne. Eines von denen, die plötzlich am Himmel auftauchen und nur Staub, Angst und Tod hinterlassen.',
		'An die Explosion selbst erinnere ich mich nicht. Nur ein Blitz, ein Dröhnen und wie alles um mich herum verschwand. Als ich zu mir kam, lag ich kraftlos da und sah die Welt um mich herum fast nicht mehr. Ein Auge sah gar nichts mehr, das andere konnte nur noch Licht und Schatten unterscheiden. Ich versuchte herauszukommen, aber es gab keinen Ausweg. Und ich begann zu warten, in der Hoffnung, dass mir durch einen glücklichen Zufall jemand helfen würde.',
		'Als der Schmerz meinen Körper bereits vollständig durchdrungen hatte, hörte ich ein Geräusch und dann ein helles Licht: „Schau mal, da ist eine Katze!“, schrie jemand.',
		'Ich werde diesen Tag nie vergessen, an dem ich mich buchstäblich von meinem Leben verabschiedete. Aber gleichzeitig werde ich nie meine Dankbarkeit dafür verlieren, gerettet worden zu sein.',
		'Jetzt lebe ich in einem Tierheim. Und alle nennen mich Lynx. Nicht weil ich wild bin, sondern weil ich stark bin. Ich sehe jetzt wirklich nur noch die Hälfte. Sogar nach einer langen Behandlung blieb ein Auge fast blind, das andere nimmt alles um mich herum ein wenig wahr. Aber das reicht aus, um das Wichtigste zu sehen: Wärme und Fürsorge. Und im Allgemeinen ist all das wichtig zu fühlen, nicht zu sehen.',
		'Wissen Sie, wie viele sagen, Katzen sehen immer mehr, als es auf den ersten Blick scheint. Und es ist wahr. Denn auch wenn meine Augen 50% sehen, fühlt mein Herz 100%. Und ich bin mir sicher, dass sich eines Tages, trotz meines ganzen vergangenen Lebens, jemand definitiv in meine Einzigartigkeit verlieben und mir ein neues dauerhaftes Zuhause schenken wird.'
	],
	nl: [
		'Mijn naam is Lynx en ik ben een gemengde raskat.',
		'Ik werd gevonden in de regio Kherson, onder het puin van een verwoest huis. Daarvoor was er een verschrikkelijk geluid - een drone. Een van die dingen die plotseling in de lucht verschijnen en alleen stof, angst en dood achterlaten.',
		'De explosie zelf herinner ik me niet. Alleen een flits, een gebrul en hoe alles om me heen verdween. Toen ik bijkwam, lag ik daar zonder kracht, terwijl ik de wereld om me heen bijna niet meer zag. Eén oog zag helemaal niets meer, en het andere kon alleen nog licht en schaduw onderscheiden. Ik probeerde eruit te komen, maar er was geen uitweg. En ik begon te wachten, in de hoop dat er bij een gelukkig toeval iemand zou zijn die me zou helpen.',
		'Toen de pijn al volledig in mijn lichaam was doorgedrongen, hoorde ik een geluid en toen een fel licht: "Kijk, daar is een kat!" - riep iemand.',
		'Ik zal deze dag nooit vergeten, waarop ik letterlijk afscheid nam van mijn leven. Maar tegelijkertijd zal ik nooit mijn dankbaarheid verliezen voor het feit dat ik gered ben.',
		'Nu woon ik in een asiel. En iedereen noemt me Lynx. Niet omdat ik wild ben, maar omdat ik sterk ben. Ik zie nu echt nog maar de helft. Zelfs na een lange behandeling bleef één oog bijna blind, het andere ziet alles om me heen een beetje. Maar dit is genoeg om het belangrijkste te zien: warmte en zorg. En over het algemeen is dit alles belangrijk om te voelen, niet om te zien.',
		'Weet je, zoals velen zeggen, katten zien altijd meer dan op het eerste gezicht lijkt. En het is waar. Want ook al zien mijn ogen 50%, mijn hart voelt 100%. En ik weet zeker dat er op een dag iemand verliefd zal worden op mijn uniekheid en me een nieuw thuis zal geven.'
	]
};
