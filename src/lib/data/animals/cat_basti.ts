import type { AnimalSummary, Translations } from '../types';

export const summary: AnimalSummary = {
	slug: 'basti',
	name: 'BASTI',
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
	// 3 years on 2025-07-09, the date on document 10.
	bornOn: '2022-07-09',
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
	image: '/images/animals/cat_basti.jpg',
	// Nudged up so the ears stay in frame without stranding the cat at the top.
	imagePosition: '50% 20%'
};

export const description: Translations = {
	en: [
		'My name is Basti and I am a mixed breed cat.',
		'I am one of those who were rescued in the Kherson region. But, to be honest, it was rather me who found my saviors than they found me.',
		'A lot of things around had already been destroyed. People were leaving. The streets were empty. The rumble was heard more and more often, then explosions. I hid for a long time. I moved between basements, destroyed garages and broken barns. No one called me. No one was waiting.',
		'But one day, I felt that there was someone special somewhere nearby. I don’t know how to explain it, I just knew. I decided to leave my hiding place and approach them slowly, quietly, and carefully. They were sitting on boxes near a broken house. They were talking in whispers and did not notice me right away. I came almost right up to them. They froze. And I sat down next to them. Just sat down. As if I always knew that I should be next to them.',
		"Now, I'm in a shelter and everyone here says that I'm very special. They say that not every cat takes the first step towards people. But I think it was just my time. I knew that I didn't want to live alone anymore. And I found those I can trust.",
		"I'm glad that I'm here. Safe. But I'm still waiting for the most important thing - my person, my family, a forever home that will be filled with care and love."
	],
	uk: [
		'Мене звати Басті, і я — кіт змішаної породи.',
		'Я один із тих, кого врятували на Херсонщині. Але, чесно кажучи, це швидше я знайшов своїх рятівників, ніж вони мене.',
		'Багато чого навколо вже було зруйновано. Люди виїжджали. Вулиці були порожніми. Гуркіт чувся все частіше, потім вибухи. Я довго ховався. Пересувався між підвалами, зруйнованими гаражами та розбитими сараями. Ніхто мене не кликав. Ніхто не чекав.',
		'Але одного разу я відчув, що десь поруч є хтось особливий. Не знаю, як це пояснити, я просто знав. Я вирішив покинути свою схованку і підійти до них повільно, тихо та обережно. Вони сиділи на ящиках біля розбитого будинку. Вони розмовляли пошепки і не відразу мене помітили. Я підійшов майже впритул до них. Вони завмерли. А я сів поруч. Просто сів. Наче завжди знав, що маю бути поруч із ними.',
		'Тепер я в притулку, і всі тут кажуть, що я дуже особливий. Кажуть, що не кожен кіт робить перший крок назустріч людям. Але я думаю, що це був просто мій час. Я знав, що більше не хочу жити сам. І я знайшов тих, кому можу довіряти.',
		"Я радий, що я тут. У безпеці. Але я все ще чекаю на найголовніше — на свою людину, свою сім'ю, назавжди дім, який буде наповнений турботою та любов'ю."
	],
	de: [
		'Mein Name ist Basti und ich bin eine Mischlingskatze.',
		'Ich bin einer von denen, die in der Region Cherson gerettet wurden. Aber um ehrlich zu sein, war ich es eher, der meine Retter fand, als sie mich.',
		'Vieles um uns herum war bereits zerstört. Menschen gingen. Die Straßen waren leer. Das Grollen war immer öfter zu hören, dann Explosionen. Ich habe mich lange versteckt. Ich bewegte mich zwischen Kellern, zerstörten Garagen und kaputten Scheunen.',
		'Aber eines Tages spürte ich, dass jemand Besonderes irgendwo in der Nähe war. Ich beschloss, mein Versteck zu verlassen und mich ihnen langsam, leise und vorsichtig zu nähern. Sie saßen auf Kisten in der Nähe eines kaputten Hauses. Ich kam fast direkt an sie heran. Sie erstarrten. Und ich setzte mich neben sie.',
		'Jetzt bin ich in einem Tierheim und alle hier sagen, dass ich etwas ganz Besonderes bin. Man sagt, dass nicht jede Katze den ersten Schritt auf Menschen zu macht. Aber ich denke, es war einfach meine Zeit.',
		'Ich bin froh, dass ich hier bin. In Sicherheit. Aber ich warte immer noch auf das Wichtigste – auf meinen Menschen, meine Familie, ein endgültiges Zuhause, das mit Fürsorge und Liebe erfüllt sein wird.'
	],
	nl: [
		'Mijn naam is Basti en ik ben een gemengde raskat.',
		'Ik ben een van degenen die gered zijn in de regio Kherson. Maar om eerlijk te zijn, was ik het eerder die mijn redders vond dan zij mij.',
		'Veel dingen om me heen waren al verwoest. Mensen vertrokken. De straten waren leeg. Het gerommel was steeds vaker te horen, daarna explosies. Ik heb me lang verstopt. Ik bewoog me tussen kelders, verwoeste garages en kapotte schuren.',
		'Maar op een dag voelde ik dat er ergens in de buurt iemand speciaal was. Ik besloot mijn schuilplaats te verlaten en hen langzaam, zachtjes en voorzichtig te benaderen. Ze zaten op dozen bij een kapot huis. Ik kwam bijna vlak bij hen staan. Ze verstijfden. En ik ging naast hen zitten.',
		'Nu zit ik in een asiel en iedereen hier zegt dat ik heel speciaal ben. Ze zeggen dat niet elke kat de eerste stap naar mensen toe zet. Maar ik denk dat het gewoon mijn tijd was. Ik wist dat ik niet meer alleen wilde leven.',
		'Ik ben blij dat ik hier ben. Veilig. Maar ik wacht nog steeds op het belangrijkste - mijn persoon, mijn gezin, een forever home dat gevuld zal zijn met zorg en liefde.'
	]
};
