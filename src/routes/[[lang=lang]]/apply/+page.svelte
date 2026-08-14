<script lang="ts">
	import { t } from '$lib/i18n';
	import ApplyForm from '$lib/components/apply/ApplyForm.svelte';
	import ApplySidebar from '$lib/components/apply/ApplySidebar.svelte';
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

	@media (max-width: 900px) {
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
