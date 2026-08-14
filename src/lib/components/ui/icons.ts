/**
 * Every icon the project draws.
 *
 * Here rather than inside Icon.svelte so other modules can hold one: the header's
 * nav items and the footer's side links each carry an icon name in data, and both
 * had copied a fragment of this union by hand. A copy of a list is a list that goes
 * stale on the day a name is added.
 */
export type IconName =
	| 'paw'
	| 'cat'
	| 'dog'
	| 'heart'
	| 'heart-filled'
	| 'list'
	| 'email'
	| 'globe'
	| 'idea'
	| 'sun'
	| 'moon'
	| 'sparkles'
	| 'minimal'
	| 'playful'
	| 'home'
	| 'winter'
	| 'view'
	| 'male'
	| 'female'
	| 'gender'
	| 'size'
	| 'age'
	| 'breed'
	| 'color'
	| 'arrow-right'
	| 'arrow-left'
	| 'arrow-up'
	| 'close'
	| 'external-link'
	| 'gamepad'
	| 'plus'
	| 'application';
