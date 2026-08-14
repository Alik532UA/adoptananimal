<script lang="ts">
	import { localePath, withBase } from '$lib/utils/withBase';
	import AnimalCard from '$lib/components/animal/AnimalCard.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Carousel from '$lib/components/ui/Carousel.svelte';
	import { t } from '$lib/i18n';

	let { data } = $props();
</script>

<svelte:head>
	<title>{t('app.title.full')}</title>
</svelte:head>

<!-- Featured Carousel (Moved to the very beginning) -->
<section class="featured section">
	<Carousel speed={30} testId="featured-carousel">
		{#each data.animals as animal, i (animal.slug)}
			<div class="carousel-item">
				<AnimalCard {animal} priority={i === 0} />
			</div>
		{/each}
	</Carousel>

	<div class="container">
		<div class="featured__footer">
			<Button
				href={localePath('/adopt/cat')}
				variant="secondary"
				size="lg"
				data-testid="featured-see-all-cats-link"
				>{t('featured.browseCats')} <Icon name="cat" size="1.2rem" /></Button
			>
			<Button
				href={localePath('/adopt/dog')}
				variant="secondary"
				size="lg"
				data-testid="featured-see-all-dogs-link"
				>{t('featured.browseDogs')} <Icon name="dog" size="1.2rem" /></Button
			>
		</div>
	</div>
</section>

<!-- About Section -->
<section class="about section" id="about">
	<div class="container container--narrow">
		<div class="about__card glass-card">
			<h2 class="section__title">{t('about.title')}</h2>
			<p class="section__subtitle">{t('about.subtitle')}</p>

			<div class="about__content">
				<div class="about__text-item">
					<div class="about__text-icon"><Icon name="heart" size="1.2rem" /></div>
					<p>{t('about.p1')}</p>
				</div>
				<div class="about__text-item">
					<div class="about__text-icon"><Icon name="globe" size="1.2rem" /></div>
					<p>{t('about.p2')}</p>
				</div>
				<div class="about__text-item">
					<div class="about__text-icon"><Icon name="paw" size="1.2rem" /></div>
					<p>{t('about.p3')}</p>
				</div>
				<div class="about__text-item">
					<div class="about__text-icon"><Icon name="idea" size="1.2rem" /></div>
					<p>{t('about.p4')}</p>
				</div>
			</div>
		</div>

		<div class="about__note glass-card">
			<div class="about__note-visual">
				<div class="about__flags">
					<div class="about__flag-wrapper">
						<img src={withBase('/images/flags/uk.svg')} alt={t('country.ua')} class="about__flag" />
					</div>
					<div class="about__flag-wrapper">
						<img src={withBase('/images/flags/de.svg')} alt={t('country.de')} class="about__flag" />
					</div>
					<div class="about__flag-wrapper">
						<img src={withBase('/images/flags/at.svg')} alt={t('country.at')} class="about__flag" />
					</div>
					<div class="about__flag-wrapper">
						<img src={withBase('/images/flags/nl.svg')} alt={t('country.nl')} class="about__flag" />
					</div>
				</div>
			</div>
			<div class="about__note-content">
				<h4 class="about__note-title">
					<Icon name="globe" size="1.2rem" />
					{t('about.note.title')}
				</h4>
				<p class="about__countries-main">{t('about.countries.text')}</p>
				<p class="about__note-text">{t('about.countries.expanding')}</p>
				<div class="about__thanks-wrapper">
					<span class="about__thanks-heart"
						><Icon name="heart-filled" size="1rem" class="text-danger" /></span
					>
					<p class="about__thanks"><strong>{t('about.thanks')}</strong></p>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	/* About Section - Premium Redesign */
	.about {
		position: relative;
		padding: var(--space-4xl) 0;
		overflow: hidden;
	}

	.about__card {
		position: relative;
		z-index: 1;
		padding: var(--space-3xl);
		animation: fade-in-up 0.8s ease-out;
		margin-bottom: var(--space-xl);
	}

	@keyframes fade-in-up {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.glass-card {
		background: var(--glass-bg);
		-webkit-backdrop-filter: blur(var(--glass-blur));
		backdrop-filter: blur(var(--glass-blur));
		border: none;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-xl);
	}

	:global([data-style='modern']) .about__card {
		border-radius: 32px;
	}

	:global([data-style='playful']) .about__card {
		border-radius: 48px;
		border-width: 0;
	}

	.about .section__title {
		margin-top: 0;
		white-space: nowrap;
		display: block;
		width: fit-content;
		margin-left: auto;
		margin-right: auto;
		transition: all var(--transition-normal);
		cursor: default;
		position: relative;
		font-size: clamp(1.5rem, 5vw, 2.5rem);
	}

	.about .section__title:hover {
		color: var(--color-primary);
	}

	.about .section__title::after {
		content: '';
		position: absolute;
		bottom: -4px;
		left: 50%;
		width: 0;
		height: 3px;
		background: var(--gradient-accent);
		border-radius: var(--radius-full);
		transition: all var(--transition-normal);
		transform: translateX(-50%);
	}

	.about .section__title:hover::after {
		width: 60%;
	}

	.about__content {
		display: grid;
		gap: var(--space-lg);
	}

	.about__text-item {
		display: flex;
		gap: var(--space-md);
		align-items: flex-start;
	}

	.about__text-icon {
		margin-top: 4px;
		color: var(--color-primary);
		flex-shrink: 0;
	}

	.about__text-item p {
		font-size: 1.1rem;
		line-height: 1.6;
		color: var(--color-text);
		margin: 0;
	}

	.about__note {
		display: flex;
		gap: var(--space-xl);
		padding: var(--space-xl);
		align-items: center;
		background: var(--glass-bg);
		-webkit-backdrop-filter: blur(var(--glass-blur));
		backdrop-filter: blur(var(--glass-blur));
		animation: fade-in-up 0.8s ease-out 0.2s backwards;
	}

	.about__note-visual {
		flex-shrink: 0;
	}

	.about__flags {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
		width: 110px;
	}

	.about__flag-wrapper {
		overflow: hidden;
		border-radius: 4px;
		box-shadow: var(--shadow-sm);
		transition: transform var(--transition-fast);
	}

	.about__flag-wrapper:hover {
		transform: scale(1.1) rotate(5deg);
	}

	.about__flag {
		width: 100%;
		display: block;
	}

	.about__note-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.about__note-title {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		color: var(--color-primary-dark);
		font-size: 1.1rem;
		margin: 0;
	}

	.about__countries-main {
		font-weight: 800;
		font-size: 1.2rem;
		color: var(--color-text);
		margin: 0;
	}

	.about__note-text {
		color: var(--color-text-muted);
		font-size: 0.95rem;
		margin: 0;
	}

	.about__thanks-wrapper {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		margin-top: var(--space-xs);
	}

	.about__thanks {
		color: var(--color-primary);
		margin: 0;
	}

	.carousel-item {
		width: 300px;
		flex-shrink: 0;
	}

	.featured__footer {
		text-align: center;
		margin-top: var(--space-2xl);
		display: flex;
		justify-content: center;
		gap: var(--space-lg);
		flex-wrap: wrap;
	}

	@media (max-width: 768px) {
		.featured__footer {
			flex-direction: column;
			align-items: stretch;
		}
		.about__note {
			flex-direction: column;
			text-align: center;
		}
		.about__card {
			padding: var(--space-xl);
		}
		.carousel-item {
			width: 260px;
		}
	}
</style>
