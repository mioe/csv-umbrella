<script setup>
import { availableLocales, loadLanguageAsync } from '~/modules/vue-i18n'
import Header from '~/components/Header.vue'

const { t, locale } = useI18n()

async function toggleLocales() {
	const locales = availableLocales
	const newLocale = locales[(locales.indexOf(locale.value) + 1) % locales.length]
	await loadLanguageAsync(newLocale)
	locale.value = newLocale
}

useHead({
	title: 'CSV Umbrella',
})
</script>

<template>
	<main class="relative min-w-full flex flex-col min-h-dvh">
		<Header />
		<RouterView />
	</main>
</template>
