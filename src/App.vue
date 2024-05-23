<script setup>
import Editor from '~/components/Editor.vue'

useHead({
	title: 'CSV Umbrella',
})

const { locale } = useI18n()
const { toggleLocales } = useLocaleStore()

/**
 * Field
 */
const {
	sysField,
	customField,
	customFieldType,
	onAddCustomField,
	onRemoveCustomFieldById,
} = useFieldStore()
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
	onAddCustomField({ name, type })
	onResetCustomFieldForm()
}
function handleRemoveCustomFieldById(id) {
	onRemoveCustomFieldById(id)
}

/**
 * CSV file
 */
const { open, reset, onChange } = useFileDialog({
	accept: '.csv',
	multiple: false,
})
const csvFileName = ref()
const csvFileBody = ref()
function onResetFile() {
	reset()
	csvFileName.value = undefined
	csvFileBody.value = undefined
}

onChange(async(files) => {
	if (files) {
		const reader = new FileReader()
		reader.readAsText(files[0], 'UTF-8')

		reader.onload = ev => {
			const content = ev.target.result
			csvFileName.value = files[0].name
			csvFileBody.value = useCsvToArrayWithUniqId(content)
		}
	}
})
</script>

<template>
	<main class="relative w-dvw flex items-center justify-center h-dvh">
		<div
			v-if="!csvFileBody"
			class="ghost-white max-w-md flex flex-col items-center justify-center gap-4 p-4"
		>
			<header class="text-center">
				<h1>CSV Umbrella</h1>
				<p class="px-8">
					{{ $t('about') }}
				</p>
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
			<Editor
				:name="csvFileName"
				:csv="csvFileBody"
				@update:csv="$ev => (csvFileBody = $ev)"
				@reset="onResetFile"
			/>
		</div>
	</main>
</template>
