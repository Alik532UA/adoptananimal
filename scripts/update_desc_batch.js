import fs from 'fs';
import path from 'path';

const animalsDir = path.join('src', 'lib', 'data', 'animals');
const files = fs.readdirSync(animalsDir).filter((f) => f.endsWith('.ts'));

const data = {
	'cat_grey.ts': {
		de: [
			'Mein Name ist Grey und ich bin eine Russisch Blau Katze.',
			'Früher war ich ein Hauskätzchen. Ich hatte eine warme Ecke, ein weiches Bett und meinen geliebten Bruder Sirius. Aber eines Tages änderte sich alles. Die Leute, die ich kannte, verließen uns. Mein Bruder und ich wurden einfach hinausgetragen und vor dem Tor stehen gelassen.',
			'Wir warteten lange in der Nähe des Hauses und hofften, dass es ein Fehler war, aber das geschah nicht. Wir mussten schreckliche Dinge erleben, es gab viele Explosionen, Panzer, endlosen Schmerz und Angst.',
			'Doch eines Tages wurden wir von einigen Soldaten entdeckt. Sie sahen uns rein zufällig – zwei graue Katzen, die sich im Schatten einer Betonplatte zusammengekauert hatten. Einer von ihnen setzte sich hin und sagte: „Ihr seid doch noch Babys...“.',
			'So landeten wir beide im Tierheim. Trotz allem haben mein Bruder und ich nicht aufgehört, Menschen zu lieben. Für uns bleibt ihre Aufmerksamkeit das Wichtigste und wir lieben es einfach, Zeit mit ihnen zu verbringen.'
		],
		nl: [
			'Mijn naam is Grey en ik ben een Russisch Blauwe kat.',
			'Ooit was ik een huiskatje. Ik had een warm hoekje, een zacht bed en mijn geliefde broer Sirius. Maar op een dag veranderde alles. De mensen die ik kende lieten ons in de steek. Mijn broer en ik werden gewoon naar buiten gedragen en voor de poort achtergelaten.',
			'We hebben lang in de buurt van het huis gewacht, in de hoop dat het een vergissing was, maar dat gebeurde niet. We hebben verschrikkelijke dingen meegemaakt, er waren veel explosies, tanks, eindeloze pijn en angst.',
			'Maar op een dag werden we opgemerkt door een paar soldaten. Ze zagen ons puur toevallig - twee grijze katten die in de schaduw van een betonplaat in elkaar gedoken zaten. Een van hen ging zitten en zei: "Jullie zijn nog maar baby\'s...".',
			'Zo zijn we allebei in het asiel terechtgekomen. Ondanks alles zijn mijn broer en ik niet opgehouden van mensen te houden. Voor ons blijft hun aandacht het belangrijkste en we houden er gewoon van om tijd met hen door te brengen.'
		]
	},
	'cat_kira.ts': {
		de: [
			'Mein Name ist Kira und ich bin eine Mischlingskatze.',
			'Ich erinnere mich allzu deutlich an den Moment, als meine Welt auf den Kopf gestellt wurde. Das Auto raste die Straße entlang, und die Menschen, die mich einst liebten, öffneten einfach das Fenster und warfen mich hinaus.',
			'Als ich aufwachte, konnte ich mich überhaupt nicht mehr bewegen. Und meine Augen… ich merkte sofort, dass mit ihnen etwas nicht stimmte.',
			'Ich lag am Straßenrand und hörte Autos vorbeirauschen. Aber dann hörte ich, wie ein Auto langsamer wurde. Jemand kam auf mich zu, beugte sich über mich und sagte leise: „Halte durch, Kleines. Wir helfen dir mit allem, was wir können.“',
			'Dann folgte eine lange Behandlung. Viele Spritzen, um mein Augenlicht wiederherzustellen. Aber manche Verletzungen können nicht vollständig geheilt werden. Jetzt kann ich etwas helles Licht und plötzliche Bewegungen unterscheiden. Und obwohl meine Augen nicht mehr ganz funktionieren, hindert mich das nicht daran, mich recht gut im Raum zu orientieren.',
			'Ich habe menschliche Grausamkeit in vollem Umfang erlebt, aber ich weiß, dass es eines Tages einen Menschen geben wird, der mich so akzeptiert, wie ich bin, und mich niemals im Stich lässt.'
		],
		nl: [
			'Mijn naam is Kira en ik ben een gemengde raskat.',
			'Ik herinner me het moment dat mijn wereld op zijn kop werd gezet maar al te goed. De auto raasde over de weg, en de mensen die ooit van me hielden openden gewoon het raam en gooiden me naar buiten.',
			'Toen ik wakker werd, kon ik me helemaal niet meer bewegen. En mijn ogen... ik besefte meteen dat er iets mis mee was.',
			'Ik lag aan de kant van de weg en hoorde auto\'s voorbij razen. Maar toen hoorde ik een auto vaart minderen. Iemand kwam naar me toe, boog over me heen en zei zachtjes: "Hou vol, kleintje. We zullen je helpen met alles wat we kunnen."',
			'Toen volgde een lange behandeling. Veel injecties om mijn gezichtsvermogen te herstellen. Maar sommige verwondingen kunnen niet volledig worden genezen. Nu kan ik wat fel licht en plotselinge bewegingen onderscheiden. En ondanks het feit dat mijn ogen niet volledig werken, verhindert dit me niet om me heel goed in de ruimte te oriënteren.',
			'Ik heb menselijke wreedheid ten volle ervaren, maar ik weet dat er op een dag een persoon zal zijn die me zal accepteren zoals ik ben en me nooit zal verlaten.'
		]
	},
	'cat_lynx.ts': {
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
	},
	'cat_martin.ts': {
		de: [
			'Mein Name ist Martin und ich bin eine Mischlingskatze.',
			'Meine Vergangenheit ist die Frontlinie, wo jeder Tag mit dem Geräusch von Explosionen begann und genauso endete. Ich lebte zwischen zerstörten Häusern, versteckte mich in Kellern und aß alles, was ich finden konnte. Das Leben dort war wie ein Warten auf das Ende.',
			'Aber eines Tages änderte sich alles. An diesem Tag hörte ich eine Stimme. Jemand rief Tiere wie mich, und der Geruch von Futter zog mich vorwärts. Ich stand lange abseits und zögerte. Aber der Hunger erwies sich als stärker als die Angst.',
			'Ich kam näher, und sie standen ganz ruhig da. Sie stellten einen Napf vor mich hin, und ich begann vorsichtig zu fressen. Als ich satt war, streckte einer der Menschen langsam seine Hand aus. Etwas blitzte in mir auf: Du kannst ihnen vertrauen. Und ich ließ mich berühren.',
			'Dann wurde ich ins Tierheim gebracht. Und ich bin so dankbar dafür. Es ist ruhig und friedlich, es gibt immer Futter und Menschen, die immer freundlich zu mir sind. Ich hoffe, dass es eines Tages eine Familie geben wird, die mir eine zweite Chance gibt.'
		],
		nl: [
			'Mijn naam is Martin en ik ben een gemengde raskat.',
			'Mijn verleden is de frontlinie, waar elke dag begon met het geluid van explosies en op dezelfde manier eindigde. Ik leefde tussen verwoeste huizen, schuilde in kelders en at alles wat ik kon vinden. Het leven daar was als wachten op het einde.',
			'Maar op een dag veranderde alles. Die dag hoorde ik een stem. Iemand riep dieren zoals ik, en de geur van eten trok me naar voren. Ik stond een lange tijd apart, aarzelend. Maar de honger bleek sterker dan de angst.',
			'Ik kwam dichterbij, en ze stonden daar rustig. Ze zetten een bakje voor me neer, en ik begon voorzichtig te eten. Toen ik vol zat, stak een van de mensen langzaam zijn hand uit. Er flitste iets in mij: je kunt hen vertrouwen. En ik liet me aanraken.',
			'Toen werd ik naar het asiel gebracht. En daar ben ik zo dankbaar voor. Het is er kalm en stil, er is altijd eten en mensen die altijd vriendelijk voor me zijn. Ik hoop dat er op een dag een gezin zal zijn dat me een tweede kans geeft.'
		]
	},
	'cat_mia.ts': {
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
	},
	'cat_mirabel.ts': {
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
	},
	'cat_molly.ts': {
		de: [
			'Mein Name ist Molly und ich bin eine Mischlingskatze.',
			'Meine Vergangenheit ist verbunden mit der Erde und der Feuchtigkeit des Schützengrabens, in dem meine Schwester und ich uns völlig allein wiederfanden. Jeden Tag überlebten meine Schwester und ich und kauerten uns zusammen, wobei wir versuchten, nicht auf den Donner des Himmels über uns zu hören.',
			'Ich glaube, ich werde mich für immer an den Tag erinnern, als die Soldaten in unseren Graben hinunterstiegen. Das Licht einer Taschenlampe, schwere Schritte... sie teilten Dosenfutter und Wasser mit uns, und wir teilten unsere Katzenwärme mit ihnen.',
			'Aber dann war es Zeit zu gehen. Sie trugen uns aus dieser Dunkelheit heraus und brachten uns in ein Tierheim. Jetzt leben wir in Sicherheit, unter anderen geretteten Tieren.',
			'Hier ist es ruhig, ich habe immer einen Napf, einen weichen Platz zum Schlafen, meine Schwester ist in der Nähe und das Wichtigste: Wir hören die Geräusche des Krieges nicht mehr. Und eines Tages werden wir unser endgültiges Zuhause finden.'
		],
		nl: [
			'Mijn naam is Molly en ik ben een gemengde raskat.',
			'Mijn verleden is verbonden met de aarde en de vochtigheid van de loopgraaf, waar mijn zus en ik ons helemaal alleen bevonden. Elke dag overleefden mijn zus en ik en kropen we bij elkaar, terwijl we probeerden niet te luisteren naar de donder van de lucht boven ons.',
			'Ik denk dat ik de dag waarop de soldaten onze loopgraaf afdaalden voor altijd zal herinneren. Het licht van een zaklamp, zware stappen... ze deelden blikvoer en water met ons, en wij deelden onze kattenwarmte met hen.',
			'Maar toen kwam de tijd om te vertrekken. Ze droegen ons uit deze duisternis en brachten ons naar een asiel. Nu leven we in veiligheid, tussen andere geredde dieren.',
			'Het is hier rustig, ik heb altijd een bakje, een zachte plek om te slapen, mijn zus is in de buurt, en het belangrijkste: we horen de geluiden van de oorlog niet meer. En op een dag zullen we ons forever home vinden.'
		]
	},
	'cat_nicole.ts': {
		de: [
			'Mein Name ist Nicole und ich bin eine Mischlingskatze.',
			'Meine Geschichte ist sehr einfach. Ich wurde auf der Straße gefunden. Ich erinnere mich nicht mehr genau, wie ich dort gelandet bin, aber was ich mit Sicherheit sagen kann, ist, dass ich zur richtigen Zeit am richtigen Ort war.',
			'Die Leute, die mich aufgelesen haben, kamen gerade von der Frontlinie mit einer großen Evakuierung anderer Katzen und auch Hunde. Als sie auf mich zukamen, sagten sie: „Na, hallo ‚kleiner grauer Klumpen‘! Wie können wir dich hier lassen? Du fährst, wie alle anderen auch, mit uns mit.“',
			'So landete ich im Tierheim. Ich habe hier schnell Freunde gefunden. Ich schaue oft aus dem Fenster und alle sagen mir, dass ich sehr nachdenklich bin. Ich werde alles von mir demjenigen geben, der mich in seine Familie aufnimmt.'
		],
		nl: [
			'Mijn naam is Nicole en ik ben een gemengde raskat.',
			'Mijn verhaal is heel simpel. Ik werd op de weg gevonden. Ik herinner me niet echt hoe ik daar precies terecht ben gekomen, maar wat ik met zekerheid kan zeggen is dat ik op de juiste plaats op het juiste moment was.',
			'De mensen die me ophaalden waren net op weg van de frontlinie met een grote evacuatie van andere katten en honden. Toen ze naar me toe kwamen, zeiden ze: "Nou, hallo \'kleine grijze brok\'! Hoe kunnen we je hier achterlaten? Jij gaat, net als iedereen, met ons mee."',
			'Zo ben ik in het asiel terechtgekomen. Ik heb hier snel vrienden gevonden. Ik kijk vaak uit het raam en iedereen vertelt me dat ik heel bedachtzaam ben. Ik zal alles van mezelf geven aan degene die mij in zijn gezin opneemt.'
		]
	},
	'cat_patrik.ts': {
		de: [
			'Mein Name ist Patrik und ich bin eine Mischlingskatze.',
			'Solange ich mich erinnern kann, war meine Welt vom Echo der Explosionen und dem Pfeifen der Granaten erfüllt. Ich versteckte mich tief in den Ruinen eines zerstörten Hauses, zusammengekauert in der dunkelsten Ecke, in der Hoffnung, dass der Himmel endlich ruhiger werden würde. Ich wusste nicht, wohin meine Familie verschwunden war, aber danach glichen meine Tage einem einzigen, an dem nur Hunger, Angst und endloses Warten bei mir blieben.',
			'Eines Tages, als die Erde wieder vom Beschuss bebte, bekam ich große Angst und kroch versehentlich aus meinem Versteck. Und dann sah ich sie: Soldaten in staubigen Uniformen. Sie bemerkten mich, wie ich zwischen den Trümmern zitterte. Einer von ihnen hockte sich hin, streckte vorsichtig seine Hand aus und sagte etwas Leises und Freundliches. Und zum ersten Mal seit langer Zeit fühlte ich mich sicher.',
			'Sie holten mich dort raus, aus dieser Hölle, und brachten mich in das Tierheim. Hier bekomme ich die Pflege, die ich brauche. Und ich bin ständig unter guten Menschen und anderen geretteten Tieren.',
			'Ich liebe es, wenn mich jemand streichelt; in solchen Momenten schließe ich meine Augen und stelle mir vor, dass die Welt um mich herum schon immer so war – ruhig, fürsorglich und gütig.',
			'Trotz allem, was ich durchgemacht habe, habe ich nicht aufgehört, an die Menschen zu glauben. Und ich weiß, dass ich eines Tages meine wahre Familie finden werde, die mich nie wieder verlassen wird.'
		],
		nl: [
			'Mijn naam is Patrik en ik ben een gemengde raskat.',
			'Zolang ik me kan herinneren, was mijn wereld gevuld met de echo van explosies en het fluiten van granaten. Ik verstopte me diep in de ruïnes van een verwoest huis, ineengedoken in de donkerste hoek, in de hoop dat de lucht eindelijk rustiger zou worden. Ik wist niet waar mijn familie was gebleven, maar daarna waren mijn dagen als één dag waarop alleen honger, angst en eindeloos wachten me bijbleven.',
			'Op een dag, toen de grond weer schudde door de beschietingen, werd ik erg bang en kroop ik per ongeluk uit mijn schuilplaats. En toen zag ik hen: soldaten in stoffige uniformen. Ze merkten me op, trillend tussen het puin. Een van hen hurkte neer, stak voorzichtig zijn hand uit en zei iets zacht en vriendelijk. En voor het eerst in lange tijd voelde ik me veilig.',
			'Ze haalden me daar weg, uit die hel, en brachten me naar het asiel. Hier krijg ik de zorg die ik nodig heb. En ik ben voortdurend onder goede mensen en andere geredde dieren.',
			'Ik hou ervan als iemand me aait; op zulke momenten sluit ik mijn ogen en stel ik me voor dat de wereld om me heen altijd zo is geweest - rustig, zorgzaam en vriendelijk.',
			'Ondanks alles wat ik heb meegemaakt, ben ik niet opgehouden in mensen te geloven. En ik weet dat ik op een dag mijn echte familie zal vinden, die me nooit meer in de steek zal laten.'
		]
	},
	'cat_richard.ts': {
		de: [
			'Mein Name ist Richard und ich bin eine Mischlingskatze.',
			'Meine Rettung war leise. Keine Sirenen, keine Explosionen, keine lauten Worte. Es war einfach an jenem einen kalten Tag, als ich einen längst vergessenen Geruch wahrnahm – Milch. Ich ging langsam und misstrauisch darauf zu. Ich hatte zu lange in den Ruinen gelebt, zwischen Schüssen und leeren Straßen, um sofort zu glauben, dass ich wieder eine normale Mahlzeit bekommen würde.',
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
			'Toen ich dichterbij kwam, joegen ze me niet weg. Integendeel, een van hen boog zich naar me toe en zei zachtjes: "Nou, hallo vreemdeling!" Toen waren er handen, een zachte handdoek, een warme reismand en... veiligheid.',
			'Nu woon ik in een asiel en iedereen noemt me Richard. Er zit iets belangrijks in deze naam - iets koninklijks, alsof ik de waardigheid had herwonnen die ik verloor toen ik alleen werd gelaten.',
			'Ik ben nog steeds een beetje voorzichtig. Ik ren niet vanaf de deur op mensen af. Meestal kijk ik toe, observeer ik en zit ik zwijgend in de buurt. Maar als je me de tijd geeft, weet ik zeker dat ik weer open zal worden. Ik ben een echte heer - bezadigd, rustig, met grote ogen, waarin meteen duidelijk is dat ik veel heb begrepen in dit leven.',
			'Ik ben blij om hier te zijn, in de warmte. Maar ik weet dat het echte leven begint als je je eigen persoon hebt. Waar je volledig wordt geaccepteerd. En als je dit bericht nu leest en glimlacht - misschien is het geen toeval. Misschien heb ik besloten om niet zomaar een bakje melk te benaderen, maar jou.'
		]
	}
};

files.forEach((file) => {
	if (data[file]) {
		const filePath = path.join(animalsDir, file);
		let content = fs.readFileSync(filePath, 'utf-8');
		content = content.replace(
			/de: \[\s*[\s\S]*?\s*\],/,
			`de: ${JSON.stringify(data[file].de, null, '\t\t')},`
		);
		content = content.replace(
			/nl: \[\s*[\s\S]*?\s*\]/,
			`nl: ${JSON.stringify(data[file].nl, null, '\t\t')}`
		);
		fs.writeFileSync(filePath, content);
	}
});

console.log('Batch 1+2 done.');
