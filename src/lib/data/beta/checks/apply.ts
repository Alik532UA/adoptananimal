import type { BetaCheck } from '../types';

/** The application: /apply with the embedded Google form, and /apply/form beside it. */
export const applyChecks: readonly BetaCheck[] = [
	{
		id: 'apply_1',
		category: { uk: 'Вбудована форма', en: 'Embedded form' },
		text: {
			uk: 'Відкрийте сторінку заявки. Форма мусить бути видна цілком; другої смуги прокрутки всередині форми бути НЕ мусить.',
			en: 'Open the application page. The form must be fully visible; there must be NO second scrollbar inside it.'
		},
		testid: 'apply-google-form-container',
		negative: true,
		coverage: 'testable'
	},
	{
		id: 'apply_2',
		category: { uk: 'Вбудована форма', en: 'Embedded form' },
		text: {
			uk: 'Натисніть посилання «Відкрити форму в новій вкладці». Мусить відкритися та сама форма Google окремою сторінкою.',
			en: 'Press the «Open the form in a new tab» link. The same Google form must open as a page of its own.'
		},
		testid: 'apply-google-form-link',
		coverage: 'covered',
		test: 'tests/ui.spec.ts'
	},
	{
		id: 'apply_3',
		category: { uk: 'Запасний шлях', en: 'Fallback' },
		text: {
			uk: 'Прочитайте текст під формою. Там мусить бути сказано, що робити, якщо форма не завантажилася, і мусить бути адреса пошти.',
			en: 'Read the text under the form. It must say what to do if the form did not load, and it must give an email address.'
		},
		testid: 'apply-backup-notice-text',
		coverage: 'testable'
	},
	{
		id: 'apply_4',
		category: { uk: 'Резервна форма', en: 'Backup form' },
		text: {
			uk: 'Відкрийте адресу /apply/form вручну. Мусить відкритися власна форма сайту з полями «Ім’я», «Пошта», «Телефон» і повідомленням.',
			en: 'Type the address /apply/form by hand. The site’s own form must open, with «Name», «Email», «Phone» and a message field.'
		},
		testid: 'adoption-form',
		coverage: 'covered',
		test: 'src/structure.test.ts'
	},
	{
		id: 'apply_5',
		category: { uk: 'Резервна форма', en: 'Backup form' },
		text: {
			uk: 'На /apply/form натисніть «Надіслати» з порожніми полями. Форма надіслатися НЕ мусить; під кожним обов’язковим полем мусить з’явитися підпис про помилку.',
			en: 'On /apply/form press «Send» with the fields empty. The form must NOT submit; each required field must show an error line beneath it.'
		},
		testid: 'apply-submit-btn',
		negative: true,
		coverage: 'testable'
	},
	{
		id: 'apply_6',
		category: { uk: 'Резервна форма', en: 'Backup form' },
		text: {
			uk: 'Заповніть поле пошти як «abc» і надішліть. Мусить з’явитися підпис саме під цим полем, а не загальне повідомлення нагорі.',
			en: 'Fill the email field with «abc» and send. An error line must appear under that field, not a general message at the top.'
		},
		testid: 'form-email-input',
		negative: true,
		coverage: 'manual'
	},
	{
		id: 'apply_7',
		category: { uk: 'Резервна форма', en: 'Backup form' },
		text: {
			uk: 'Заповніть форму й натисніть «Очистити». Усі поля мусять спорожніти, а підписи про помилки — зникнути.',
			en: 'Fill the form in and press «Clear». Every field must empty and every error line must go.'
		},
		testid: 'apply-reset-btn',
		coverage: 'manual'
	},
	{
		id: 'apply_8',
		category: { uk: 'Пошта', en: 'Email' },
		text: {
			uk: 'На /apply/form натисніть адресу пошти в бічній панелі. Мусить з’явитися повідомлення біля неї, і панель мусить мати таке саме скляне тло, як форма поруч.',
			en: 'On /apply/form press the email address in the sidebar. A message must appear beside it, and the sidebar must have the same frosted background as the form next to it.'
		},
		testid: 'apply-contact-email-link',
		coverage: 'covered',
		test: 'src/component-styles.test.ts'
	}
];
