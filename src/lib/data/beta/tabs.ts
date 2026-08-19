import type { BetaTab } from './types';
import { animalChecks } from './checks/animal';
import { applyChecks } from './checks/apply';
import { commonChecks } from './checks/common';
import { favoriteChecks } from './checks/favorites';
import { homeChecks } from './checks/home';
import { listChecks } from './checks/lists';

/**
 * The tabs of the checklist, each answering for the routes it names
 * (BETA-CHECKLIST-v8 § 5.1).
 *
 * Routes rather than a description of the feature, because the routes already exist on
 * disk: `src/fluid-sizing-canon.test.ts`-style scanning of `src/routes/` gives the full
 * list without anyone maintaining a second one, and an invariant then proves nothing was
 * left unclaimed. A page can be added to this site without touching this file — and the
 * unit tests will say so on the next run.
 *
 * `common` claims nothing on purpose: header, pickers, scrollbar and toasts are on every
 * page and belong to no single address.
 *
 * Order is the order a tester walks the site in: the chrome first, because it is what
 * they see before they see anything else.
 */
export const BETA_TABS: readonly BetaTab[] = [
	{
		id: 'common',
		title: { uk: 'Спільне для сайту', en: 'Shared across the site' },
		routes: [],
		checks: commonChecks
	},
	{
		id: 'home',
		title: { uk: 'Головна', en: 'Home' },
		routes: ['/'],
		checks: homeChecks
	},
	{
		id: 'lists',
		title: { uk: 'Розділи котів і собак', en: 'Cat and dog sections' },
		routes: ['/adopt/cat', '/adopt/dog'],
		checks: listChecks
	},
	{
		id: 'animal',
		title: { uk: 'Сторінка тварини', en: 'Animal page' },
		routes: ['/adopt/cat/[slug]', '/adopt/dog/[slug]'],
		checks: animalChecks
	},
	{
		id: 'apply',
		title: { uk: 'Заявка', en: 'Application' },
		routes: ['/apply', '/apply/form'],
		checks: applyChecks
	},
	{
		id: 'favorites',
		title: { uk: 'Обране', en: 'Favourites' },
		routes: ['/favorites'],
		checks: favoriteChecks
	}
];

/**
 * Routes that deliberately have no tab.
 *
 * An explicit list rather than a missing line (§ 5.1): «this address needs no
 * checklist» is a decision, and a decision that looks like an omission gets made again
 * by accident. The checklist does not check itself — an item about the page the tester
 * is standing on would be answered by the act of reading it.
 */
export const BETA_UNCOVERED_ROUTES: readonly string[] = ['/beta-test-checklists'];

/** Every check of every tab, flat — for the report and for the invariants. */
export const ALL_BETA_CHECKS = BETA_TABS.flatMap((tab) => tab.checks);
