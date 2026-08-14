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
	age: MultiLangString;
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
