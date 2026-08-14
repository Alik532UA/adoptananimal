<script lang="ts">
</script>

<div class="footer__wave" aria-hidden="true">
	<svg viewBox="0 0 1440 120" preserveAspectRatio="none">
		<path
			d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,30 1440,60 L1440,120 L0,120 Z"
			fill="var(--footer-wave)"
		/>
	</svg>
</div>

<style>
	.footer__wave {
		position: relative;
		width: 100%;
		height: 80px;
		margin-bottom: -1px; /* Avoid sub-pixel gaps */
	}

	.footer__wave svg {
		position: absolute;
		bottom: 0;
		width: 100%;
		height: 80px;
	}

	@media (max-width: 768px) {
		.footer__wave {
			height: 50px;
		}
		.footer__wave svg {
			height: 50px;
		}
	}
</style>
