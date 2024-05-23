import { acceptHMRUpdate, defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'

export const useFieldStore = defineStore('field', () => {
	const sysField = reactive([
		{
			name: 'phone',
			type: 'phone',
			id: 'phonepho-nephoneph-onep-honephonepho',
		},
		{
			name: 'birthday',
			type: 'date',
			id: 'birthday-birt-dayb-irth-daybirthdayb',
		},
		{
			name: 'name',
			type: 'string',
			id: 'namename-name-name-name-namenamename',
		},
	])

	const customField = useStorage('csv-custom-field', [])
	const customFieldType = ['string', 'date', 'number']

	const { t: $t } = useI18n()
	const fields = computed(() => [
		...sysField.map(
			f => ({...f, name: $t(`sys-field-name.${f.name}`)}),
		),
		...customField.value,
	])

	function onAddCustomField({ name, type }) {
		const field = {
			name,
			type: type ?? customFieldType[0],
			id: crypto.randomUUID(),
		}
		customField.value.push(field)
		return customField.value.find(f => f.id === field.id)
	}

	function onRemoveCustomFieldById(id) {
		const fFieldIdx = customField.value.findIndex((field) => field.id === id)
		customField.value.splice(fFieldIdx, 1)
	}

	return {
		sysField,
		customField,
		customFieldType,
		fields,

		onAddCustomField,
		onRemoveCustomFieldById,
	}
})

/**
 * HMR (Hot Module Replacement)
 * https://pinia.vuejs.org/cookbook/hot-module-replacement.html
 */
if (import.meta.hot)
	import.meta.hot.accept(acceptHMRUpdate(useFieldStore, import.meta.hot))
