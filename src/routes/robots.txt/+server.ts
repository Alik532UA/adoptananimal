import { CRAWL_BLOCKED, SITE_BASE, SITE_ORIGIN } from '$lib/config';
import { LOCALES, localeSegment } from '$lib/i18n/locales';

// Prerendered so the sitemap line can carry the real origin and base path,
// which a file in static/ cannot know.
export const prerender = true;

/**
 * `Disallow` НЕ будується з `HIDDEN_ROUTES` — і це виправлення, а не спрощення
 * (BETA-CHECKLIST § 4.0, `BETA-NOINDEX-OVER-DISALLOW`).
 *
 * Доти сюди йшли саме приховані сторінки, і разом із `noindex` у їхньому HTML
 * це складалося в гірший результат, ніж кожне окремо. `Disallow` забороняє
 * ЗАВАНТАЖЕННЯ: краулер, який його виконав, сторінку не читає — отже `noindex`
 * у ній не читає теж, ніколи. А адреса, на яку хтось послався ззовні,
 * потрапляє в індекс БЕЗ вмісту: голий URL, якого не прибрати, бо прибирає
 * його рівно той тег, до якого краулер не дійшов.
 *
 * Тобто заборона обходу не допомагала `noindex`, а відбирала в нього єдиний
 * запит, у відповіді на який він живе.
 *
 * Тому списки РІЗНІ: `HIDDEN_ROUTES` — сторінки поза індексом (їх закриває
 * `noindex` у layout), `CRAWL_BLOCKED` — адреси, які не віддають краулеру
 * взагалі. Другий зараз порожній, і рядків `Disallow` у файлі немає жодного.
 *
 * Кожна мова окремим рядком, а не шаблоном: `/draft` і `/uk/draft` — різні
 * адреси, і правило, яке називає одну, лишає інші відкритими.
 */
const disallowLines = CRAWL_BLOCKED.flatMap((path) =>
	LOCALES.map((locale) => `Disallow: ${SITE_BASE}${localeSegment(locale)}${path}`)
).join('\n');

/**
 * Пошукові AI-агенти — від них залежить видимість у відповідях (SEO-v8 § 7.2).
 *
 * `OAI-SearchBot` відповідає за ChatGPT Search і НЕ збігається з `GPTBot`:
 * останній навчає моделі OpenAI, і його заборона сайт із відповідей ChatGPT не
 * прибирає. Плутанина між ними — типова, і ціна їй протилежна очікуваній.
 */
const SEARCH_AGENTS = [
	['OAI-SearchBot', 'ChatGPT Search — поява сайту у відповідях ChatGPT'],
	['ChatGPT-User', 'перехід за посиланням на запит користувача'],
	['PerplexityBot', 'індексатор Perplexity'],
	['ClaudeBot', 'краулер Anthropic']
] as const;

/**
 * Групи в `robots.txt` НЕ успадковуються.
 *
 * Краулер обирає ОДНУ групу — найточніший збіг за `User-agent` — і виконує
 * тільки її, ігноруючи `*` цілком. Тому кожен блок повторює весь перелік
 * `Disallow`: рядок, пропущений в іменованій групі, не «наслідується», а
 * ВІДКРИВАЄ цей шлях саме названому боту. Тут повтор безкоштовний, бо
 * `disallowLines` один на всіх; у проєктах, де блоки писали руками, така
 * дірка вже траплялася. Розбіжність ловить `npm run check:build`.
 */
const group = (agent: string, why: string) =>
	`# ${why}\nUser-agent: ${agent}\nAllow: /\n${disallowLines}`;

export function GET() {
	const body = `# allow crawling everything except the routes kept out of the index
User-agent: *
${disallowLines}

# --- Пошукові AI-агенти ---

${SEARCH_AGENTS.map(([agent, why]) => group(agent, why)).join('\n\n')}

# --- Тренувальні краулери: на видимість у пошуку не впливають ---
# Дозволені свідомо; рішення записане в PROJECT-CONTEXT.md.

${group('GPTBot', 'навчання моделей OpenAI — не плутати з OAI-SearchBot вище')}

Sitemap: ${SITE_ORIGIN}${SITE_BASE}/sitemap.xml
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain' }
	});
}
