<script lang="ts">
	import { t } from '$lib/i18n';
	import ApplyForm from '$lib/components/apply/ApplyForm.svelte';
	import ApplySidebar from '$lib/components/apply/ApplySidebar.svelte';
</script>

<svelte:head>
	<title>{t('apply.title')} | {t('footer.brand')}</title>
	<!-- `noindex` is not written here: this path is in HIDDEN_ROUTES, and the layout
		 declares it there together with the canonical it must NOT have. Two owners of
		 one decision is how one of them ends up out of date. -->
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
		<p class="apply__backup-notice" data-testid="apply-backup-notice-text">
			{t('apply.form.backupNotice')}
		</p>

		<div class="apply__layout">
			<div class="apply__main">
				<ApplyForm />
			</div>

			<ApplySidebar />
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
		background: var(--cat-hero);
		color: white;
		/* The bottom padding exists to be eaten by the card's negative margin below.
		   It was --space-xl against a --space-4xl pull, so the card sat on top of the
		   subtitle and cut the last line of it in half. */
		padding: var(--space-2xl) 0 var(--space-4xl);
		text-align: center;
		position: relative;
	}

	.apply-hero__title {
		font-size: clamp(2.5rem, 8vw, 3.5rem);
		font-weight: 900;
		margin: var(--space-xs) 0 var(--space-sm);
		font-family: var(--font-accent);
	}

	.apply-hero__subtitle {
		font-size: 1.25rem;
		opacity: 0.9;
		/* Wide enough for the longest of the four translations to sit on one line on a
		   desktop, and a measure rather than a pixel count so it follows the font size.
		   600px broke a sentence in two on a screen with room for six of it. */
		max-width: min(100%, 68ch);
		margin: 0 auto;
		/* When it does have to wrap, wrap it into even lines rather than a long one and
		   an orphan. */
		text-wrap: balance;
	}

	.apply__backup-notice {
		margin: 0 0 var(--space-lg);
		padding: var(--space-md) var(--space-lg);
		border-radius: var(--radius-md);
		background: var(--color-bg-card);
		border: 1px solid var(--color-field-border);
		color: var(--color-text-muted);
		font-size: 0.95rem;
		text-align: center;
	}

	.apply__layout {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: var(--space-2xl);
		align-items: start;
		/* Less than the hero's bottom padding, so the card still overlaps the band
		   while the text above it keeps clear air. */
		margin-top: calc(var(--space-3xl) * -1);
	}

	@media (max-width: 900px) {
		.apply__backup-notice {
			margin: 0 0 var(--space-lg);
			padding: var(--space-md) var(--space-lg);
			border-radius: var(--radius-md);
			background: var(--color-bg-card);
			border: 1px solid var(--color-field-border);
			color: var(--color-text-muted);
			font-size: 0.95rem;
			text-align: center;
		}

		.apply__layout {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 600px) {
		.apply {
			padding-top: var(--space-xl);
		}
	}
</style>
