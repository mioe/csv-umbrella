<script setup>
import { useVModels } from '@vueuse/core'

const props = defineProps({
	csv: Array,
})
const emit = defineEmits(['update:csv'])
const { csv } = useVModels(props, emit)

const tableRef = ref()

const table = reactive({
	checkboxes: [],
	lastChecked: null,
})

const handleCheck = ev => {
	if (!table.lastChecked) {
		table.lastChecked = ev.target
		return
	}

	if (ev.shiftKey) {
		const start = Array.from(table.checkboxes).indexOf(ev.target)
		const end = Array.from(table.checkboxes).indexOf(table.lastChecked)

		table.checkboxes.forEach((box, idx) => {
			if (idx >= Math.min(start, end) && idx <= Math.max(start, end)) {
				box.checked = table.lastChecked.checked
			}
		})
	}

	table.lastChecked = ev.target
}

onUpdated(() => {
	console.log('🦕 onUpdated')
	table.checkboxes = tableRef.value.querySelectorAll('input[type="checkbox"]')
	table.checkboxes.forEach(checkbox => checkbox.addEventListener('click', handleCheck))
})
</script>

<template>
	<div class="relative overflow-auto p-4">
		<table ref="tableRef">
			<tbody>
				<tr
					v-for="(row, rowIdx) in csv"
					:key="rowIdx"
				>
					<td>
						<input type="checkbox">
					</td>
					<td
						v-for="(col, colIdx) in row"
						:key="colIdx"
					>
						{{ col }}
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
