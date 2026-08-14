<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/i18n';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { adoptionSchema, type AdoptionForm } from '$lib/data/schemas';

	let formData = $state<AdoptionForm>({
		name: '',
		email: '',
		phone: '',
		animal: '',
		message: ''
	});

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

		const mailtoLink = `mailto:info@notpfote.de?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
		window.location.href = mailtoLink;
		isSubmitted = true;
	}
</script>

<svelte:head>
	<title>{t('apply.title')} | {t('footer.brand')}</title>
</svelte:head>

<section class="apply-hero">
	<div class="container">
		<h1 class="apply-hero__title">
			{t('apply.title')}
		</h1>
		<p class="apply-hero__subtitle">{t('apply.subtitle')}</p>
	</div>
</section>

<section class="apply section">
	<div class="container container--narrow">
		<div class="apply__layout">
			<div class="apply__main">
				{#if isSubmitted}
					<div class="apply__success glass-card" role="alert">
						<div class="success-icon">
							<Icon name="heart-filled" size="5rem" class="text-danger" />
						</div>
						<h2>{t('apply.success.title')}</h2>
						<p>{t('apply.success.text')}</p>
						<Button
							onclick={() => (isSubmitted = false)}
							variant="secondary"
							data-testid="apply-reset-btn"
						>
							<Icon name="arrow-left" size="1.2rem" />
							{t('apply.newForm')}
						</Button>
					</div>
				{:else}
					<div class="glass-card apply__form-card">
						<form
							class="apply__form"
							onsubmit={handleSubmit}
							novalidate
							data-testid="adoption-form"
						>
							<div class="form-grid">
								<div class="form-group form-group--full">
									<label for="animal">
										<Icon name="paw" size="1rem" />
										{t('apply.form.animal')}
									</label>
									<div class="input-wrapper">
										<input
											type="text"
											id="animal"
											autocomplete="off"
											aria-invalid={Boolean(errors.animal)}
											aria-describedby={errors.animal ? 'animal-error' : undefined}
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
									<label for="name">
										<Icon name="home" size="1rem" />
										{t('apply.form.name')}
									</label>
									<div class="input-wrapper">
										<input
											type="text"
											id="name"
											autocomplete="name"
											aria-invalid={Boolean(errors.name)}
											aria-describedby={errors.name ? 'name-error' : undefined}
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
									<label for="email">
										<Icon name="email" size="1rem" />
										{t('apply.form.email')}
									</label>
									<div class="input-wrapper">
										<input
											type="email"
											id="email"
											autocomplete="email"
											aria-invalid={Boolean(errors.email)}
											aria-describedby={errors.email ? 'email-error' : undefined}
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
									<label for="phone">
										<Icon name="globe" size="1rem" />
										{t('apply.form.phone')}
									</label>
									<div class="input-wrapper">
										<input
											type="tel"
											id="phone"
											autocomplete="tel"
											aria-invalid={Boolean(errors.phone)}
											aria-describedby={errors.phone ? 'phone-error' : undefined}
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
									<label for="message">
										<Icon name="list" size="1rem" />
										{t('apply.form.message')}
									</label>
									<div class="input-wrapper">
										<textarea
											id="message"
											rows="4"
											aria-invalid={Boolean(errors.message)}
											aria-describedby={errors.message ? 'message-error' : undefined}
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
								<Button
									type="submit"
									size="lg"
									class="apply__submit-btn"
									data-testid="apply-submit-btn"
								>
									{t('apply.form.submit')}
									<Icon name="arrow-right" size="1.2rem" />
								</Button>
							</div>
						</form>
					</div>
				{/if}
			</div>

			<aside class="apply__sidebar">
				<div class="glass-card apply__info-card">
					<h3 class="info-card__title">
						<Icon name="idea" size="1.5rem" />
						{t('apply.process.title')}
					</h3>
					<ol class="apply__steps">
						<li>
							<span class="step-number">1</span>
							<span class="step-text">{t('apply.process.step1')}</span>
						</li>
						<li>
							<span class="step-number">2</span>
							<span class="step-text">{t('apply.process.step2')}</span>
						</li>
						<li>
							<span class="step-number">3</span>
							<span class="step-text">{t('apply.process.step3')}</span>
						</li>
						<li>
							<span class="step-number">4</span>
							<span class="step-text">{t('apply.process.step4')}</span>
						</li>
						<li>
							<span class="step-number">5</span>
							<span class="step-text">{t('apply.process.step5')}</span>
						</li>
					</ol>
				</div>

				<div class="glass-card apply__info-card apply__info-card--contact">
					<h3 class="info-card__title">
						<Icon name="email" size="1.5rem" />
						{t('apply.contact.title')}
					</h3>
					<p class="contact-text">{t('apply.contact.text')}</p>
					<a href="mailto:info@notpfote.de" class="contact-email">
						<strong>info@notpfote.de</strong>
					</a>
				</div>
			</aside>
		</div>
	</div>
</section>

<style>
	.apply {
		position: relative;
		z-index: 1;
		padding-bottom: var(--space-4xl);
	}

	.apply-hero {
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
		color: white;
		padding: var(--space-4xl) 0;
		text-align: center;
		position: relative;
		overflow: hidden;
	}

	.apply-hero::before {
		content: '';
		position: absolute;
		inset: 0;
		background: url('https://www.transparenttextures.com/patterns/cubes.png');
		opacity: 0.1;
	}

	.apply-hero__title {
		font-size: clamp(3rem, 10vw, 4.5rem);
		font-weight: 900;
		margin-bottom: var(--space-md);
		font-family: var(--font-accent);
		text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
	}

	.apply-hero__subtitle {
		font-size: 1.25rem;
		opacity: 0.9;
		max-width: 600px;
		margin: 0 auto;
	}

	.apply__layout {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: var(--space-2xl);
		align-items: start;
		margin-top: calc(var(--space-4xl) * -1);
	}

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

	input,
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

	:global([data-theme='dark']) input,
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

	input:focus,
	textarea:focus {
		outline: none;
		background: var(--color-bg-card);
		transform: translateY(-2px);
		box-shadow: 0 0 0 3px var(--color-primary-light);
	}

	input:focus + .input-focus-bg,
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
		transform: translateY(-3px);
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

	@keyframes scaleIn {
		from {
			opacity: 0;
			transform: scale(0.9);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.success-icon {
		padding: var(--space-xl);
		background: var(--color-bg-warm);
		border-radius: 50%;
		margin-bottom: var(--space-md);
		box-shadow: var(--shadow-inner);
	}

	.apply__sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
	}

	.apply__info-card {
		padding: var(--space-xl);
	}

	.info-card__title {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-bottom: var(--space-lg);
		font-family: var(--font-accent);
		color: var(--color-primary);
		font-size: 1.25rem;
	}

	.apply__steps {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.apply__steps li {
		display: flex;
		gap: var(--space-md);
		align-items: flex-start;
	}

	.step-number {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: var(--color-primary);
		color: white;
		border-radius: 50%;
		font-size: 0.8rem;
		font-weight: 900;
		flex-shrink: 0;
		box-shadow: var(--shadow-sm);
	}

	.step-text {
		font-size: 0.95rem;
		color: var(--color-text);
		font-weight: 500;
		line-height: 1.4;
	}

	.apply__info-card--contact {
		background: linear-gradient(
			135deg,
			var(--glass-bg),
			color-mix(in srgb, var(--color-primary) 5%, var(--glass-bg))
		);
	}

	.contact-text {
		color: var(--color-text-muted);
		font-size: 0.9rem;
		margin-bottom: var(--space-md);
	}

	.contact-email {
		display: block;
		font-size: 1.1rem;
		color: var(--color-primary);
		transition: transform var(--transition-fast);
	}

	.contact-email:hover {
		transform: translateX(5px);
	}

	@media (max-width: 900px) {
		.apply__layout {
			grid-template-columns: 1fr;
		}

		.apply__sidebar {
			order: 1;
		}
	}

	@media (max-width: 600px) {
		.form-grid {
			grid-template-columns: 1fr;
		}

		.apply {
			padding-top: var(--space-xl);
		}

		.glass-card {
			padding: var(--space-lg);
		}
	}
</style>
