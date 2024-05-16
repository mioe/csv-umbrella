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

const { locale } = useI18n()

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
	<main class="relative w-dvw flex items-center justify-center h-dvh">
		<div
			v-if="!files"
			class="ghost-white min-w-lg flex flex-col items-center justify-center gap-4 p-4"
		>
			<header class="text-center">
				<h1>CSV Umbrella</h1>
				<p>{{ $t('about') }}</p>
			</header>

			<button
				type="button"
				@click="open"
			>
				{{ $t('choose-file') }}
			</button>

			<div>
				<h4>{{ $t('sys-field') }}</h4>
				<p></p>
			</div>

			<div>
				<h4>{{ $t('custom-field') }} (via localstorage)</h4>
				<p></p>
			</div>

			<footer>
				<button @click="toggleLocales">
					{{ locale }}
				</button>
			</footer>
		</div>

		<div
			v-else
			class="h-[calc(100svh-48px)] w-[calc(100svw-48px)] flex flex-col"
		>
			<Table
				:csv="csvData"
				@update:csv="$ev => (csvData = $ev)"
			/>
		</div>
	</main>
</template>
