<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/i18n';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { adoptionSchema, type AdoptionForm } from '$lib/data/schemas';
	import { ADOPTION_EMAIL } from '$lib/config';

	let formData = $state<AdoptionForm>({
		name: '',
		email: '',
		phone: '',
		animal: '',
		message: ''
	});

	// $props.id(), not a hand-written string: two instances of this form on one page
	// would otherwise share ids, and every <label for> would point at the first one.
	const uid = $props.id();
	const fieldId = (name: keyof AdoptionForm) => `${uid}-${name}`;
	const errorId = (name: keyof AdoptionForm) => `${uid}-${name}-error`;

	let errors = $state<Partial<Record<keyof AdoptionForm, string>>>({});
	let isSubmitted = $state(false);

	// Read inside the effect, not in a $derived: effects never run during prerender,
	// and url.searchParams is not available there.
	$effect(() => {
		const fromUrl = page.url.searchParams.get('animal');
		if (fromUrl) {
			formData.animal = fromUrl;
		}
	});

	function handleSubmit(e: Event) {
		e.preventDefault();
		const result = adoptionSchema.safeParse(formData);

		if (!result.success) {
			const flattened = result.error.flatten();
			const fieldErrors: Partial<Record<keyof AdoptionForm, string>> = {};

			Object.entries(flattened.fieldErrors).forEach(([key, messages]) => {
				if (messages && messages.length > 0) {
					fieldErrors[key as keyof AdoptionForm] = messages[0];
				}
			});

			errors = fieldErrors;
			return;
		}

		errors = {};
		const emailSubject = `${t('apply.email.subject')} ${formData.animal}`;
		const emailBody = `
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Animal: ${formData.animal}

Message:
${formData.message}
		`.trim();

		const mailtoLink = `mailto:${ADOPTION_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
		window.location.href = mailtoLink;
		isSubmitted = true;
	}
</script>

{#if isSubmitted}
	<div class="apply__success glass-card" role="alert">
		<div class="success-icon">
			<Icon name="heart-filled" size="5rem" class="text-danger" />
		</div>
		<h2>{t('apply.success.title')}</h2>
		<p>{t('apply.success.text')}</p>
		<Button onclick={() => (isSubmitted = false)} variant="secondary" data-testid="apply-reset-btn">
			<Icon name="arrow-left" size="1.2rem" />
			{t('apply.newForm')}
		</Button>
	</div>
{:else}
	<div class="glass-card apply__form-card">
		<form class="apply__form" onsubmit={handleSubmit} novalidate data-testid="adoption-form">
			<div class="form-grid">
				<div class="form-group form-group--full">
					<label for={fieldId('animal')}>
						<Icon name="paw" size="1rem" />
						{t('apply.form.animal')}
					</label>
					<div class="input-wrapper">
						<input
							type="text"
							id={fieldId('animal')}
							autocomplete="off"
							aria-invalid={Boolean(errors.animal)}
							aria-describedby={errors.animal ? errorId('animal') : undefined}
							bind:value={formData.animal}
							class:input--error={errors.animal}
							placeholder={t('apply.form.animal.placeholder')}
							data-testid="form-animal-input"
						/>
						<div class="input-focus-bg"></div>
					</div>
					{#if errors.animal}<span
							class="error-text"
							id="animal-error"
							role="alert"
							data-testid="form-animal-error">{errors.animal}</span
						>{/if}
				</div>

				<div class="form-group">
					<label for={fieldId('name')}>
						<Icon name="home" size="1rem" />
						{t('apply.form.name')}
					</label>
					<div class="input-wrapper">
						<input
							type="text"
							id={fieldId('name')}
							autocomplete="name"
							aria-invalid={Boolean(errors.name)}
							aria-describedby={errors.name ? errorId('name') : undefined}
							bind:value={formData.name}
							class:input--error={errors.name}
							placeholder={t('apply.form.name.placeholder')}
							data-testid="form-name-input"
						/>
						<div class="input-focus-bg"></div>
					</div>
					{#if errors.name}<span
							class="error-text"
							id="name-error"
							role="alert"
							data-testid="form-name-error">{errors.name}</span
						>{/if}
				</div>

				<div class="form-group">
					<label for={fieldId('email')}>
						<Icon name="email" size="1rem" />
						{t('apply.form.email')}
					</label>
					<div class="input-wrapper">
						<input
							type="email"
							id={fieldId('email')}
							autocomplete="email"
							aria-invalid={Boolean(errors.email)}
							aria-describedby={errors.email ? errorId('email') : undefined}
							bind:value={formData.email}
							class:input--error={errors.email}
							placeholder="your@email.com"
							data-testid="form-email-input"
						/>
						<div class="input-focus-bg"></div>
					</div>
					{#if errors.email}<span
							class="error-text"
							id="email-error"
							role="alert"
							data-testid="form-email-error">{errors.email}</span
						>{/if}
				</div>

				<div class="form-group form-group--full">
					<label for={fieldId('phone')}>
						<Icon name="globe" size="1rem" />
						{t('apply.form.phone')}
					</label>
					<div class="input-wrapper">
						<input
							type="tel"
							id={fieldId('phone')}
							autocomplete="tel"
							aria-invalid={Boolean(errors.phone)}
							aria-describedby={errors.phone ? errorId('phone') : undefined}
							bind:value={formData.phone}
							class:input--error={errors.phone}
							placeholder={t('apply.form.phone.placeholder')}
							data-testid="form-phone-input"
						/>
						<div class="input-focus-bg"></div>
					</div>
					{#if errors.phone}<span
							class="error-text"
							id="phone-error"
							role="alert"
							data-testid="form-phone-error">{errors.phone}</span
						>{/if}
				</div>

				<div class="form-group form-group--full">
					<label for={fieldId('message')}>
						<Icon name="list" size="1rem" />
						{t('apply.form.message')}
					</label>
					<div class="input-wrapper">
						<textarea
							id={fieldId('message')}
							rows="4"
							aria-invalid={Boolean(errors.message)}
							aria-describedby={errors.message ? errorId('message') : undefined}
							bind:value={formData.message}
							class:input--error={errors.message}
							placeholder={t('apply.form.message.placeholder')}
							data-testid="form-message-textarea"
						></textarea>
						<div class="input-focus-bg"></div>
					</div>
					{#if errors.message}<span
							class="error-text"
							id="message-error"
							role="alert"
							data-testid="form-message-error">{errors.message}</span
						>{/if}
				</div>
			</div>

			<div class="apply__actions">
				<Button type="submit" size="lg" class="apply__submit-btn" data-testid="apply-submit-btn">
					{t('apply.form.submit')}
					<Icon name="arrow-right" size="1.2rem" />
				</Button>
			</div>
		</form>
	</div>
{/if}

<style>
	.glass-card {
		background: var(--glass-bg);
		backdrop-filter: blur(var(--glass-blur));
		-webkit-backdrop-filter: blur(var(--glass-blur));
		border: none;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-xl);
		padding: var(--space-2xl);
		transition:
			transform var(--transition-normal),
			box-shadow var(--transition-normal);
	}
	.apply__form-card {
		position: relative;
		overflow: hidden;
	}
	.apply__form-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 6px;
		background: linear-gradient(to right, var(--color-primary), var(--color-secondary));
	}
	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-xl) var(--space-lg);
	}
	.form-group--full {
		grid-column: 1 / -1;
	}
	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}
	label {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		font-weight: 700;
		font-size: 0.95rem;
		color: var(--color-text);
		font-family: var(--font-accent);
		margin-left: var(--space-xs);
	}
	.input-wrapper {
		position: relative;
		display: flex;
	}
	textarea {
		width: 100%;
		padding: 16px 20px;
		border-radius: var(--radius-md);
		border: none;
		background: var(--glass-bg);
		backdrop-filter: blur(var(--glass-blur));
		-webkit-backdrop-filter: blur(var(--glass-blur));
		color: var(--color-text);
		font-family: inherit;
		font-size: 1rem;
		transition: all var(--transition-normal);
		z-index: 1;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
	}
	:global([data-theme='dark']) textarea {
		background: var(--glass-bg);
	}
	.input-focus-bg {
		position: absolute;
		inset: 0;
		background: var(--color-primary);
		opacity: 0;
		filter: blur(15px);
		border-radius: var(--radius-md);
		transition: opacity var(--transition-normal);
		z-index: 0;
	}
	textarea:focus {
		/* No outline: none — the global :focus-visible rule in app.css is the
		   only focus indicator these fields have. */
		background: var(--color-bg-card);
		box-shadow: 0 0 0 3px var(--color-primary-light);
	}
	textarea:focus + .input-focus-bg {
		opacity: 0.15;
	}
	.input--error {
		box-shadow: 0 0 0 3px var(--color-error) !important;
	}
	.error-text {
		color: var(--color-error);
		font-size: 0.85rem;
		font-weight: 600;
		margin-top: 4px;
		margin-left: 4px;
	}
	.apply__actions {
		margin-top: var(--space-2xl);
		display: flex;
		justify-content: flex-end;
	}
	:global(.apply__submit-btn) {
		width: 100%;
		justify-content: center;
		gap: var(--space-sm);
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 18px 32px !important;
		box-shadow: 0 10px 20px color-mix(in srgb, var(--color-primary) 30%, transparent) !important;
	}
	:global(.apply__submit-btn:hover) {
		box-shadow: 0 15px 30px color-mix(in srgb, var(--color-primary) 40%, transparent) !important;
	}
	.apply__success {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-lg);
		animation: scaleIn 0.5s var(--transition-spring);
	}
	.success-icon {
		padding: var(--space-xl);
		background: var(--color-bg-warm);
		border-radius: 50%;
		margin-bottom: var(--space-md);
		box-shadow: var(--shadow-inner);
	}
	.glass-card {
		padding: var(--space-lg);
	}

	@media (max-width: 600px) {
		.form-grid {
			grid-template-columns: 1fr;
		}

		.glass-card {
			padding: var(--space-lg);
		}
	}
</style>
