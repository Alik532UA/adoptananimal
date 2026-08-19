/**
 * Puts text in the clipboard and says whether it got there.
 *
 * One owner for the question, because the answer is never "it always works":
 * `navigator.clipboard` is absent outside a secure context and in older browsers, and
 * `writeText` rejects for reasons that have nothing to do with the code — the tab is
 * not focused, the permission was refused, the document lost focus mid-gesture.
 *
 * A boolean rather than a thrown error on purpose. Every caller here has something
 * better to do than report a failure: open the mail client, or show the text so the
 * person can select it. Losing the clipboard is acceptable; losing what the person
 * was trying to keep is not (NOTIFICATIONS-v8 § 4, BETA-CHECKLIST-v8 § 6.2).
 */
export async function copyText(text: string): Promise<boolean> {
	if (!navigator.clipboard?.writeText) return false;

	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		// Refused or interrupted. Which of the two changes nothing for the caller.
		return false;
	}
}
