<script setup>
import { availableLocales, loadLanguageAsync } from '~/modules/vue-i18n'
import { useFileDialog } from '@vueuse/core'
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
	<main class="relative h-dvh w-dvw flex items-center justify-center">
		<button
			v-if="!files"
			type="button"
			@click="open"
		>
			{{ $t('choose-file') }}
		</button>

		<div
			v-else
			class="w-[calc(100svw-48px)] h-[calc(100svh-48px)]"
		>
			<Table
				:csv="csvData"
				@update:csv="$ev => (csvData = $ev)"
			/>
		</div>
	</main>
</template>
