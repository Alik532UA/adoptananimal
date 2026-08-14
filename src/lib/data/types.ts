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
