<script setup>
import { availableLocales, loadLanguageAsync } from '~/modules/vue-i18n'
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

const sysField = reactive([
	{
		name: 'phone',
		type: 'phone',
		id: '09195a3e-96d3-4de4-b5df-dd358398fdcd',
	},
	{
		name: 'birthday',
		type: 'date',
		id: '99b2f8ec-adf1-44e6-b242-fd9005d6f73c',
	},
	{
		name: 'name',
		type: 'string',
		id: '0c45dac3-d904-435a-9573-e58f9854cd91',
	},
])

const customField = useStorage('csv-custom-field', [])
const customFieldType = ['string', 'date', 'number']
const customFieldForm = reactive({
	name: null,
	type: null,
})
function onResetCustomFieldForm() {
	Object.keys(customFieldForm).forEach((key) => {
		customFieldForm[key] = null
	})
}
function handleAddCustomField() {
	const { name, type } = customFieldForm
	customField.value.push({
		name,
		type: type ?? customFieldType[0],
		id: crypto.randomUUID(),
	})
	onResetCustomFieldForm()
}
function handleRemoveCustomFieldById(id) {
	const fFieldIdx = customField.value.findIndex((field) => field.id === id)
	customField.value.splice(fFieldIdx, 1)
}

const { files, open, onChange } = useFileDialog({
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
				<table>
					<tbody>
						<tr
							v-for="field in sysField"
							:key="field.id"
						>
							<td>{{ $t(`sys-field-name.${field.name}`) }}</td>
							<td
								class="rounded p-2 text-2 font-mono"
								:class="{
									'bg-blue-300 c-blue-800': field.type === 'phone',
									'bg-pink-800 c-pink-200': field.type === 'date',
									'bg-green-900 c-green-200': field.type === 'string',
									'bg-orange-900 c-orange-200': field.type === 'number',
								}"
							>
								{{ field.type }}
							</td>
							<td class="text-2 font-mono">
								{{ field.id }}
							</td>
						</tr>
					</tbody>
				</table>

				<div>
					<h4>{{ $t('custom-field') }} (via localstorage)</h4>
					<table>
						<tbody>
							<tr
								v-for="field in customField"
								:key="field.id"
							>
								<td>{{ field.name }}</td>
								<td
									class="rounded p-2 text-2 font-mono"
									:class="{
										'bg-blue-300 c-blue-800': field.type === 'phone',
										'bg-pink-800 c-pink-200': field.type === 'date',
										'bg-green-900 c-green-200': field.type === 'string',
										'bg-orange-900 c-orange-200': field.type === 'number',
									}"
								>
									{{ field.type }}
								</td>
								<td class="text-2 font-mono">
									{{ field.id }}
								</td>
								<td>
									<button @click="handleRemoveCustomFieldById(field.id)">
										{{ $t('remove') }}
									</button>
								</td>
							</tr>
						</tbody>
					</table>
					<form
						class="flex gap-2"
						@submit.prevent="handleAddCustomField"
					>
						<input
							v-model="customFieldForm.name"
							type="text"
							:placeholder="$t('new-field-name')"
							required
						/>
						<select
							v-model="customFieldForm.type"
						>
							<option
								:value="null"
								disabled
							>
								{{ $t('type-field') }}
							</option>
							<option
								v-for="t in customFieldType"
								:key="t"
								:value="t"
							>
								{{ t }}
							</option>
						</select>
						<button type="submit">
							{{ $t('add') }}
						</button>
					</form>
				</div>
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
				:sys-field="sysField"
				:custom-field="customField"
				:csv="csvData"
				@update:csv="$ev => (csvData = $ev)"
			/>
		</div>
	</main>
</template>
