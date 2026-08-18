export type MultiLangString = {
	en: string;
	uk: string;
	de: string;
	nl: string;
};

export interface AnimalSummary {
	slug: string;
	name: string;
	type: 'cat' | 'dog';
	isAdopted: boolean;
	gender: MultiLangString;
	breed: MultiLangString;
	/**
	 * The day this animal would have been born for the shelter's estimate to be right,
	 * as `YYYY-MM-DD`. Not a birthday — see `age.ts`, which turns it back into words.
	 *
	 * A date rather than the four translated strings the other fields carry, because
	 * the age is the one fact here that changes on its own. Written down, it was wrong
	 * for all fifty animals within two years; derived, it cannot be.
	 */
	bornOn: string;
	size: MultiLangString;
	color: MultiLangString;
	image: string;
	/**
	 * Where the photo sits inside its frame, as a CSS `object-position`.
	 *
	 * Cards are wider than they are tall and most of these photos are portraits, so the
	 * default centre crop takes the same slice off the top and the bottom — which on a
	 * sitting cat means the ears go and the paws go, and what is left is a torso. There
	 * is no rule that gets this right for every photo, because it depends on where the
	 * animal is in the frame. Set it per animal, on the ones that need it.
	 *
	 * `50% 0%` shows the top of the photo, `50% 100%` the bottom. Left out, the frame
	 * centres as before.
	 *
	 * The first number does the same for the sides, and it is worth saying which way
	 * round it goes, because it reads backwards: it says which part of the *photo* to
	 * keep, so a larger number keeps the right-hand side and therefore slides the
	 * picture left. `30% 50%` pushes the picture right, `70% 50%` pulls it left.
	 *
	 * Sideways values are judged on the detail page, where the frame is square and the
	 * crop is at its tightest. The same value reaches the card in the list, which is
	 * 4:3 and cuts a wide photo far less — so it moves there too, but less.
	 */
	imagePosition?: string;
}

export type Translations = {
	en: string[];
	uk: string[];
	de: string[];
	nl: string[];
};

export interface AnimalDetail extends AnimalSummary {
	description: Translations;
}

export interface FilterState {
	gender: string;
	size: string;
	status: string;
	search: string;
	onlyFavorites?: boolean;
}
