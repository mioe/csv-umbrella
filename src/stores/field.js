import { acceptHMRUpdate, defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { reactive } from 'vue'

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

	function onAddCustomField({ name, type }) {
		customField.value.push({
			name,
			type: type ?? customFieldType[0],
			id: crypto.randomUUID(),
		})
	}

	function onRemoveCustomFieldById(id) {
		const fFieldIdx = customField.value.findIndex((field) => field.id === id)
		customField.value.splice(fFieldIdx, 1)
	}

	return {
		sysField,
		customField,
		customFieldType,

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
