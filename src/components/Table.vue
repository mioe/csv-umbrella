<script setup>
import { useVModels } from '@vueuse/core'

const props = defineProps({
	csv: Array,
})
const emit = defineEmits(['update:csv'])
const { csv } = useVModels(props, emit)

const tableRef = shallowRef()
const table = reactive({
	checkboxes: [],
	lastChecked: null,
})

const mainCheckboxRef = shallowRef()

const handleMainCheckboxCheck = ev => {
	table.checkboxes.forEach(box => box.checked = ev.target.checked)
}

const onChangeMainCheckbox = () => {
	const countChecked = tableRef.value.querySelectorAll('input:checked').length
	const countAllBox = table.checkboxes.length
	if (countChecked === 0) {
		mainCheckboxRef.value.checked = false
		mainCheckboxRef.value.indeterminate = false
	} else if (countChecked === countAllBox.length) {
		mainCheckboxRef.value.checked = true
		mainCheckboxRef.value.indeterminate = false
	} else {
		mainCheckboxRef.value.checked = false
		mainCheckboxRef.value.indeterminate = true
	}
}

const handleCheck = ev => {
	if (!table.lastChecked) {
		table.lastChecked = ev.target
		onChangeMainCheckbox()
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
	onChangeMainCheckbox()
}

onUpdated(() => {
	console.log('🦕 onUpdated')
	table.checkboxes = tableRef.value.querySelectorAll('input[type="checkbox"]')
	table.checkboxes.forEach(checkbox => checkbox.addEventListener('click', handleCheck))
})
</script>

<template>
	<div class="table-wrapper">
		<div class="table-container">
			<table>
				<thead v-if="csv">
					<tr>
						<th>
							<input
								ref="mainCheckboxRef"
								type="checkbox"
								@click="handleMainCheckboxCheck"
							/>
						</th>
						<th
							v-for="(_col, colIdx) in csv[0]"
							:key="colIdx"
						>
							{{ colIdx }}
						</th>
					</tr>
				</thead>
				<tbody ref="tableRef">
					<tr
						v-for="(row, rowIdx) in csv"
						:key="rowIdx"
					>
						<td>
							<input type="checkbox" />
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
	</div>
</template>

<style>
.table-wrapper {
	position: relative;
	overflow: hidden;
	border-radius: 16px;
	border: 1px solid #e5ebf0;
}
</style>
