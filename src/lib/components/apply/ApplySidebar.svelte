<script lang="ts">
	import { t } from '$lib/i18n';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { ADOPTION_EMAIL } from '$lib/config';
	import { handleEmailClick } from '$lib/utils/emailAction';
</script>

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
		<!-- Stays an <a href="mailto:"> so it still works without JS; the handler
						 copies the address and offers to open the mail app instead. -->
		<a
			href="mailto:{ADOPTION_EMAIL}"
			class="contact-email"
			onclick={(e) => handleEmailClick(e, ADOPTION_EMAIL)}
			data-testid="apply-contact-email-link"
		>
			<strong>{ADOPTION_EMAIL}</strong>
		</a>
	</div>
</aside>

<style>
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
	.apply__sidebar {
		order: 1;
	}
</style>
