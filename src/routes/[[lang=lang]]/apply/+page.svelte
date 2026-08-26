<script lang="ts">
	import { page } from '$app/state';
	import { t, tFormat } from '$lib/i18n';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { GOOGLE_FORM_EMBED_URL, GOOGLE_FORM_URL } from '$lib/config';

	// A $derived here would read url.searchParams during prerender, where accessing it
	// throws. The effect exists precisely so this is not computed until a browser has it.
	// eslint-disable-next-line svelte/prefer-writable-derived
	let chosenAnimal = $state('');

	$effect(() => {
		chosenAnimal = page.url.searchParams.get('animal') ?? '';
	});
</script>

<svelte:head>
	<title>{t('apply.title')} | {t('footer.brand')}</title>
	<meta name="description" content={t('meta.apply.description')} />
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
		{#if chosenAnimal}
			<!-- The animal travels here from the detail page. The embedded form cannot be
				 prefilled without the field ids from its editor, so the name is shown
				 instead of being dropped on the floor. -->
			<p class="apply__chosen" role="status" data-testid="apply-chosen-animal-text">
				{tFormat('apply.form.chosenAnimal', { name: chosenAnimal })}
			</p>
		{/if}

		<div class="apply__embed">
			<!-- Google's embed cannot report its height across origins, so the frame is
				 given room rather than being resized to fit. -->
			<iframe
				src={GOOGLE_FORM_EMBED_URL}
				title={t('apply.form.embedTitle')}
				class="apply__frame"
				data-testid="apply-google-form-container">{t('apply.form.loading')}</iframe
			>
		</div>

		<!-- A frame can be blocked by an extension or a strict corporate proxy, and a
			 form nobody can reach is the same as no form at all. For the visitor whose
			 frame is empty this is the only way through, so it is a button rather than a
			 line of text: it has to be findable by someone who is already lost. -->
		<div class="apply__fallback">
			<Button
				href={GOOGLE_FORM_URL}
				variant="secondary"
				size="lg"
				target="_blank"
				rel="noopener noreferrer"
				data-testid="apply-google-form-link"
			>
				{t('apply.form.openInNewTab')}
				<Icon name="external-link" size="1.1rem" />
			</Button>
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
		padding: var(--space-2xl) 0 var(--space-4xl);
		text-align: center;
		position: relative;
	}

	.apply-hero__title {
		font-size: clamp(2.5rem, 8vw, 3.5rem);
		font-weight: 900;
		margin-bottom: var(--space-md);
		font-family: var(--font-accent);
		text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
	}

	.apply-hero__subtitle {
		font-size: 1.25rem;
		/* Wide enough for the longest of the four translations to sit on one line on a
		   desktop, and a measure rather than a pixel count so it follows the font size.
		   600px broke a sentence in two on a screen with room for six of it. */
		max-width: min(100%, 68ch);
		margin: 0 auto;
		/* When it does have to wrap, wrap it into even lines rather than a long one and
		   an orphan. */
		text-wrap: balance;
	}

	.apply__chosen {
		margin: 0 0 var(--space-lg);
		padding: var(--space-md) var(--space-lg);
		border-radius: var(--radius-md);
		background: var(--color-bg-card);
		border: 1px solid var(--color-field-border);
		color: var(--color-text);
		text-align: center;
		font-weight: 600;
	}

	.apply__embed {
		margin-top: calc(var(--space-3xl) * -1);
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: var(--shadow-xl);
		/* White, not the card colour: the form's own page is white, and a dark strip
		   under it would read as a rendering fault rather than as spare room. */
		background: #fff;
		container-type: inline-size;
	}

	/*
	 * The frame is taller than the form on purpose.
	 *
	 * A cross-origin frame cannot report its content height, so the only way to avoid
	 * a scrollbar inside a scrollbar is to give it more room than it needs. Measured
	 * against the live form: 1703px at 750px wide, 1929px at 420px, 2138px at 320px.
	 * The values below add roughly 200px on top, which is what the form grows by when
	 * every required field shows its validation message at once.
	 *
	 * Sized by container query rather than media query: what decides the height is how
	 * wide the frame is, and the frame is narrower than the viewport.
	 */
	.apply__frame {
		display: block;
		width: 100%;
		height: 1900px;
		border: none;
	}

	@container (max-width: 600px) {
		.apply__frame {
			height: 2150px;
		}
	}

	@container (max-width: 380px) {
		.apply__frame {
			height: 2350px;
		}
	}

	.apply__fallback {
		margin-top: var(--space-lg);
		display: flex;
		justify-content: center;
	}

	@media (max-width: 600px) {
		.apply__embed {
			margin-top: calc(var(--space-xl) * -1);
		}
	}
</style>
