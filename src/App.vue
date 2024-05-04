<script setup>
import { availableLocales, loadLanguageAsync } from '~/modules/vue-i18n'
import { useFileDialog } from '@vueuse/core'
import Header from '~/components/Header.vue'
import Table from '~/components/Table.vue'

useHead({
	title: 'CSV Umbrella',
})

const CSVToArray = (data, delimiter = ',', omitFirstRow = false) =>
	data
		.slice(omitFirstRow ? data.indexOf('\n') + 1 : 0)
		.split('\n')
		.map(v => v.split(delimiter))

const { t, locale } = useI18n()

async function toggleLocales() {
	const locales = availableLocales
	const newLocale = locales[(locales.indexOf(locale.value) + 1) % locales.length]
	await loadLanguageAsync(newLocale)
	locale.value = newLocale
}

const { files, open, reset, onChange } = useFileDialog({
	accept: '.csv',
	multiple: false,
})

const csvData = ref()

onChange((files) => {
	if (files) {
		const reader = new FileReader()
		reader.readAsText(files[0], 'UTF-8')

		reader.onload = ev => {
			const content = ev.target.result
			csvData.value = CSVToArray(content)
		}
	}
})
</script>

<template>
	<main class="relative min-h-dvh">
		<Header />

		<button
			v-if="!files"
			type="button"
			@click="open"
		>
			{{ $t('choose-file') }}
		</button>

		<Table
			v-else
			:csv="csvData"
			@update:csv="$ev => (csvData = $ev)"
		/>
	</main>
</template>
