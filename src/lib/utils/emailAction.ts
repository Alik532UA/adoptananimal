import { toast } from '$lib/controllers/toast.svelte';
import { t } from '$lib/i18n';

/**
 * The one email handler on the site.
 *
 * Clicking an address copies it and offers "open mail app" in an anchored toast
 * rather than firing `mailto:` straight away — an address a visitor cannot read
 * or paste is not much use, and a mail client opening unprompted is jarring.
 *
 * Deliberately a single exported function, not a per-component copy: two copies
 * diverge at the first fix, and then one address on the site behaves differently
 * from another for no reason a visitor can see.
 *
 * Progressive enhancement: the element stays an `<a href="mailto:">`, so without
 * JavaScript the link still works. The handler only takes over when it can do better.
 */
export function handleEmailClick(event: MouseEvent, email: string) {
	// Ctrl/Cmd/Shift/Alt and the middle button mean "open this differently".
	// Taking that away from the browser breaks a habit for no gain.
	if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
		return;
	}

	event.preventDefault();

	const anchor = event.currentTarget as HTMLElement;
	const openMail = () => {
		window.location.href = `mailto:${email}`;
	};

	// Outside a secure context, and in older browsers, clipboard is simply absent.
	// A click must never be dead, so fall through to mailto.
	if (!navigator.clipboard?.writeText) {
		openMail();
		return;
	}

	navigator.clipboard.writeText(email).then(
		() =>
			toast.success(
				/*
				 * A deliberate line break, not a colon and a space.
				 *
				 * On one line the toast came out two lines for info@notpfote.de and three for
				 * vet.crew.cooperation@gmail.com — the same notification with a different shape
				 * depending on whose address it was. An address cannot be broken, so where it
				 * lands is decided by how long it happens to be. Given its own line it is
				 * always exactly two, and looks like a decision rather than an accident.
				 */
				`${t('contact.emailCopied')}:
${email}`,
				6000,
				{ label: t('contact.openMailClient'), onAction: openMail },
				anchor
			),
		() => {
			// Permission denied or the document lost focus — the user still wanted
			// to write an email, so do that instead of showing an error.
			toast.warn(t('contact.copyFailed'), 4000, undefined, anchor);
			openMail();
		}
	);
}
