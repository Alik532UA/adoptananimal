/**
 * Артефакти AI-пошуку в зібраному сайті — SEO-v8 § 7.5.
 *
 * Окремий модуль, а не рядки в `check-build`: перевірка робить власний розбір
 * `robots.txt`, і тримати парсер посеред перевірок HTML означало б ховати його
 * від очей. Викликається з `check-build` і додає свої знахідки в той самий
 * перелік проблем.
 *
 * **Чому розбір ПО ГРУПАХ, а не пошук підрядка.** Перша редакція канону
 * перевіряла `robots.includes('Disallow: /')` — а цей підрядок є в будь-якому
 * `Disallow: /test/`. Разом із другою умовою (`!robots.includes('Allow: /')`,
 * хибною, щойно хоч одна група має `Allow: /`) перевірка не спрацьовувала
 * ЖОДНОГО разу, зокрема на `robots.txt`, який справді блокував бота цілком.
 *
 * Головне ж, що вона мала б ловити: краулер, який збігся з ІМЕНОВАНОЮ групою,
 * ігнорує `User-agent: *` цілком. Пропущений там `Disallow` не «наслідується»,
 * а ВІДКРИВАЄ шлях саме названому боту. У чотирьох майже однакових блоках
 * очима цього не видно — тут це рядок звіту.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/** Агенти, від яких залежить видимість у відповідях AI (SEO-v8 § 7.2). */
export const SEARCH_AGENTS = ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot'];

/**
 * Шлях відносно кореня збірки, у прямих слешах.
 *
 * Повідомлення про сторінку має називати сторінку — `adopt/cat.html`, а не
 * `C:/…/build/adopt/cat.html`. Раніше тут заміняли лише роздільники, не
 * відкидаючи кореня, і в CI, де збірка лежить за довгим абсолютним шляхом, рядок
 * звіту складався переважно з нього.
 *
 * @param {string} buildDir
 * @param {string} file
 * @returns {string}
 */
const relPath = (buildDir, file) => relative(buildDir, file).split(/[\\/]/).join('/');

/**
 * Одна група `robots.txt`: агенти, яких вона стосується, і її правила.
 *
 * @typedef {{ agents: string[], allow: string[], disallow: string[] }} RobotsGroup
 */

/**
 * Групи `robots.txt` у порядку появи.
 *
 * Кілька `User-agent` підряд утворюють ОДНУ групу — це не деталь формату, а
 * єдиний спосіб не порахувати другого агента групою без правил.
 *
 * @param {string} text вміст `robots.txt`
 * @returns {RobotsGroup[]}
 */
export function parseRobots(text) {
	/** @type {RobotsGroup[]} */
	const groups = [];
	/** @type {RobotsGroup | null} */
	let current = null;
	let lastWasAgent = false;

	for (const raw of text.split(/\r?\n/)) {
		const line = raw.replace(/#.*$/, '').trim();
		if (!line) continue;
		const idx = line.indexOf(':');
		if (idx === -1) continue;
		const key = line.slice(0, idx).trim().toLowerCase();
		const value = line.slice(idx + 1).trim();

		if (key === 'user-agent') {
			if (!current || !lastWasAgent) {
				current = { agents: [], allow: [], disallow: [] };
				groups.push(current);
			}
			current.agents.push(value.toLowerCase());
			lastWasAgent = true;
			continue;
		}
		lastWasAgent = false;
		if (!current) continue;
		if (key === 'allow') current.allow.push(value);
		if (key === 'disallow') current.disallow.push(value);
	}
	return groups;
}

/**
 * Усі .html у зібраному сайті.
 *
 * @param {string} dir
 * @param {string[]} out
 * @returns {string[]}
 */
function htmlFiles(dir, out = []) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) htmlFiles(full, out);
		else if (entry.endsWith('.html')) out.push(full);
	}
	return out;
}

/**
 * @param {string} buildDir каталог зібраного сайту
 * @param {{ expectsLlmsTxt?: boolean, searchAgents?: string[], robotsMeta?: boolean, metaDescription?: boolean, spaFallback?: boolean }} options
 * @returns {string[]} перелік проблем; порожній — усе гаразд
 */
export function checkGeo(buildDir, options = {}) {
	const {
		expectsLlmsTxt = true,
		searchAgents = SEARCH_AGENTS,
		robotsMeta = true,
		metaDescription = true,
		// `true` для профілю, де `adapter-static` віддає фолбек на всі адреси:
		// власного HTML у маршруту там немає за побудовою.
		spaFallback = false
	} = options;
	const problems = [];

	// --- рівно ОДИН <meta name="robots"> на сторінку (§ 7.3) ---
	//
	// `<svelte:head>` ДОПИСУЄ до `<head>`, а не заміщує в ньому. Тег в
	// `app.html` і тег зі сторінки співіснують, і два теги з протилежним
	// змістом («index, follow» і «noindex») — це не помилка збірки й не
	// попередження: що переможе, вирішує краулер. Саме так `noindex` службової
	// сторінки одного разу вже поїхав у прод разом із дозволом на індексацію.
	if (robotsMeta) {
		for (const file of htmlFiles(buildDir)) {
			const tags = readFileSync(file, 'utf8').match(/<meta[^>]+name="robots"/g) ?? [];
			if (tags.length > 1) {
				const rel = relPath(buildDir, file);
				problems.push(`${rel}: <meta name="robots"> знайдено ${tags.length} разів, очікується 1`);
			}
		}
	}

	/*
	 * --- рівно ОДИН <meta name="description"> на індексованій сторінці ---
	 *
	 * Той самий механізм, що й вище, і саме тому цей рядок мав би стояти поряд від
	 * початку: `<svelte:head>` ДОПИСУЄ. Тег у макеті не стає значенням за
	 * замовчуванням, яке сторінка перевизначає, — він стає другим тегом поруч із
	 * її власним. У цьому проєкті так вийшло на 208 із 229 зібраних сторінок, і
	 * першим щоразу йшов загальний, англійський, — на сторінках усіх чотирьох мов.
	 *
	 * `robots` перевірявся, `description` — ні, хоча ламаються вони однаково.
	 * Різниця лише в тому, що суперечливий `robots` видно як помилку, а два описи
	 * виглядають як робоча сторінка: жоден гейт, жодне попередження збірки, жоден
	 * симптом у браузері. Видно це тільки в `build/` і тільки якщо порахувати.
	 *
	 * Приховані сторінки (`noindex`) опису не мають і не потребують: його ніхто
	 * ніколи не прочитає. Тому для них правило — «не більше одного», а не «рівно».
	 */
	for (const file of metaDescription ? htmlFiles(buildDir) : []) {
		const html = readFileSync(file, 'utf8');
		const rel = relPath(buildDir, file);
		const tags = html.match(/<meta[^>]+name="description"/g) ?? [];

		if (tags.length > 1) {
			problems.push(`${rel}: <meta name="description"> знайдено ${tags.length}, очікується 1`);
			continue;
		}

		// Оболонка SPA описувати нічого не може: у неї порожнє тіло за побудовою.
		const isShell = rel.endsWith('/404.html') || rel === '404.html';
		const noindex = /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/.test(html);

		if (tags.length === 0 && !noindex && !isShell) {
			problems.push(`${rel}: сторінка в індексі без <meta name="description">`);
		}
	}

	/*
	 * --- жодна властивість Open Graph не повторюється на сторінці ---
	 *
	 * Третій випадок того самого механізму, і найдорожчий із трьох: макет виводив
	 * `og:image` беззастережно, сторінка тварини додавала до нього своє фото — і
	 * читач Open Graph бере ПЕРШИЙ. Тобто кожне посилання на тварину, поділене у
	 * Facebook, Telegram, WhatsApp чи Slack, показувало логотип притулку замість
	 * тварини — саме на тих 200 сторінках, де фото і є причиною ділитися.
	 *
	 * Формально `og:image` повторювати можна: так описують галерею. Тут галереї
	 * немає й не планується, тож повтор означає не намір, а дописування. Правило
	 * навмисно суворіше за специфікацію, і причина в тому, що коштувало це вже
	 * один раз.
	 *
	 * Перевіряється в `build/`, бо «скільки їх на сторінці» не є властивістю
	 * жодного окремого файлу: тег макета й тег сторінки живуть у різних файлах і
	 * поодинці обидва правильні.
	 */
	if (metaDescription) {
		for (const file of htmlFiles(buildDir)) {
			const html = readFileSync(file, 'utf8');
			const counts = new Map();

			for (const [, key] of html.matchAll(/<meta[^>]+property="(og:[^"]+)"/g)) {
				counts.set(key, (counts.get(key) ?? 0) + 1);
			}

			for (const [key, count] of counts) {
				if (count > 1) {
					problems.push(
						`${relPath(buildDir, file)}: <meta property="${key}"> знайдено ${count}, ` +
							'очікується 1 — читач бере перший'
					);
				}
			}
		}
	}

	// --- llms.txt (§ 7.1) ---
	const llmsPath = join(buildDir, 'llms.txt');
	if (!existsSync(llmsPath)) {
		// Без поблажки «немає файлу — немає перевірки»: відсутність — це або
		// рішення (і тоді прапорець стоїть у false), або дефект. Мовчазний
		// третій варіант робив перевірку опційною й тому марною.
		if (expectsLlmsTxt) problems.push('llms.txt: файл відсутній у зібраному сайті');
	} else {
		const llms = readFileSync(llmsPath, 'utf8');
		if (!llms.startsWith('# ')) problems.push('llms.txt: немає заголовка H1');

		const urls = [...llms.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]);
		if (urls.length === 0) problems.push('llms.txt: немає абсолютних посилань');

		// Та сама адреса під різними назвами: модель прочитає це як кілька
		// сторінок і назве користувачеві ті, яких не існує. Файл, написаний
		// проти галюцинацій, у такому вигляді сам їх і постачає.
		const dupes = [...new Set(urls.filter((u, i) => urls.indexOf(u) !== i))];
		if (dupes.length) {
			problems.push(`llms.txt: одна адреса під різними назвами: ${dupes.join(', ')}`);
		}

		// Кожна ВЛАСНА адреса мусить існувати в `build/`.
		//
		// Дублікат — це коли сторінку назвали двічі; тут гірше: сторінки немає
		// зовсім, і модель віддає користувачеві посилання на 404. Корінь сайту
		// береться з `canonical` головної, а не з константи, щоб перевірка не
		// потребувала налаштування й не розходилася з тим, що справді зібрано.
		//
		// На сайтах із SPA-фолбеком (`adapter-static` із `fallback`) перевірка
		// вимкнена прапорцем: там власного HTML у маршруту немає за побудовою,
		// сервер віддає фолбек, і адреса працює. Вмикати її там означало б
		// позначати справні сторінки як неіснуючі.
		const home = join(buildDir, 'index.html');
		const siteUrl = existsSync(home)
			? (readFileSync(home, 'utf8').match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1] ??
				'')
			: '';
		if (spaFallback) {
			// нічого: адресу обслуговує фолбек, файлу для неї не існує й не має існувати
		} else if (!siteUrl) {
			problems.push('llms.txt: не вдалося знайти canonical головної — адреси нема з чим звіряти');
		} else {
			const root = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
			/** @param {string} p */
			const isFile = (p) => existsSync(p) && statSync(p).isFile();

			/*
			 * ЖОДНОЇ власної адреси — це не «усі посилання зовнішні», а файл, який
			 * нічого не каже про цей сайт. І доти, доки цього рядка не було, саме
			 * так виглядав повний провал перевірки нижче: у `static/llms.txt`
			 * стояв хост `adoptananimal.github.io` замість `alik532ua.github.io`,
			 * тож поблажка «чужі домени не наша відповідальність» пропускала
			 * ВСІ сім адрес, і гейт звітував успіх над файлом, у якому кожне
			 * посилання віддавало 404.
			 *
			 * Поблажка сама по собі правильна — репозиторій і соцмережі справді
			 * не наша справа. Помилковим було припущення, що серед решти хоч
			 * щось лишиться.
			 */
			const ours = [...new Set(urls)].filter((url) => url.startsWith(root));
			if (ours.length === 0) {
				problems.push(
					`llms.txt: жодна з ${urls.length} адрес не веде на цей сайт (корінь ${root}) — ` +
						'імовірно, у файлі стоїть чужий хост, і перевірка існування сторінок не перевіряє нічого'
				);
			}

			for (const url of new Set(urls)) {
				// Чужі домени (репозиторій, соцмережі) не наша відповідальність.
				if (!url.startsWith(root)) continue;
				const rel = url
					.slice(root.length)
					.replace(/[?#].*$/, '')
					.replace(/\/$/, '');
				// `isFile`, а не `existsSync`: каталог `departments/` існує через
				// підсторінки, але сторінки `/departments` при цьому немає, і
				// саме таке посилання вже стояло в одному з файлів.
				const exists =
					rel === ''
						? true
						: isFile(join(buildDir, rel, 'index.html')) ||
							isFile(join(buildDir, `${rel}.html`)) ||
							isFile(join(buildDir, rel));
				if (!exists) problems.push(`llms.txt: адреси немає в build/ — ${url}`);
			}
		}
	}

	// --- robots.txt (§ 7.2) ---
	const robotsPath = join(buildDir, 'robots.txt');
	if (!existsSync(robotsPath)) {
		problems.push('robots.txt: файл відсутній у зібраному сайті');
		return problems;
	}

	const groups = parseRobots(readFileSync(robotsPath, 'utf8'));
	const star = groups.find((g) => g.agents.includes('*'));
	if (!star) problems.push('robots.txt: немає групи User-agent: *');

	for (const agent of searchAgents) {
		const group = groups.find((g) => g.agents.includes(agent.toLowerCase()));
		if (!group) {
			problems.push(`robots.txt: немає групи для ${agent}`);
			continue;
		}
		if (group.disallow.includes('/')) {
			problems.push(`robots.txt: ${agent} заблокований цілком (Disallow: /)`);
		}
		for (const path of star?.disallow ?? []) {
			if (!group.disallow.includes(path)) {
				problems.push(
					`robots.txt: ${agent} не успадкує "Disallow: ${path}" з * — повторіть рядок у його групі`
				);
			}
		}
	}

	return problems;
}
