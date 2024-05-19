<script setup>
import { useVModels } from '@vueuse/core'
import ColumnPicker from '~/components/ColumnPicker.vue'

const props = defineProps({
	csv: Array,
	sysField: Array,
	customField: Array,
})
const emit = defineEmits(['update:csv'])
const { csv } = useVModels(props, emit)

const tableRef = shallowRef()
const table = reactive({
	checkboxes: [],
	lastChecked: null,
})

const mainCheckboxRef = shallowRef()
const maxColsInRow = computed(() => csv.value.reduce((max, row) => Math.max(max, row.length), 0))

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
	<div class="ghost-white table-wrapper">
		<div class="table-container">
			<table class="table-custom">
				<thead
					v-if="csv"
					class="table-head"
				>
					<tr>
						<th class="col-check">
							<div class="col-primary-check">
								<input
									ref="mainCheckboxRef"
									type="checkbox"
									@click="handleMainCheckboxCheck"
								/>
								<div class="col-primary-check--tool">
								</div>
							</div>
						</th>
						<th
							v-for="(_col, colIdx) in maxColsInRow"
							:key="colIdx"
						>
							<div class="col-body">
								<ColumnPicker
									:popid="colIdx"
								/>
							</div>
						</th>
					</tr>
				</thead>
				<tbody ref="tableRef">
					<tr
						v-for="(row, rowIdx) in csv"
						:key="rowIdx"
					>
						<td class="col-check">
							<input type="checkbox" />
						</td>
						<td
							v-for="(col, colIdx) in row"
							:key="colIdx"
						>
							<div
								class="col-body"
								:title="col"
							>
								{{ col }}
							</div>
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
}

.table-container {
	position: relative;
	overflow: auto;
	height: 100%;
}

.table-head {
	position: sticky;
	z-index: 9;
	top: 0;
	background-color: white;
	width: 100%;
	border-bottom: 1px solid #e5ebf0;
}

.table-custom {
	all: unset;
	display: table;
}

.table-custom th {
	text-align: left;
}

.col-body {
	min-width: 200px;
	max-width: 200px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.col-primary-check {
	height: 64px;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

.col-primary-check--tool {
	position: absolute;
	z-index: 2;
	/* background-color: red; */
	width: 100px;
	height: 100%;
	left: 100%;
}

.col-check {
	position: sticky;
	left: 0;
	background-color: white;
	padding: 0 8px;
	border-left: 1px solid #e5ebf0;
}
</style>
